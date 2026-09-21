"use client";

import React, { useState, useMemo } from "react";
import {
  DollarSign,
  FileText,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Building2,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Percent,
  Search,
  Filter,
  X,
  CreditCard,
  Receipt,
  FileCheck,
  ShieldCheck,
  ChevronRight,
  Calculator,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import {
  FactoryAccountMovement,
  FactoryQuotationDerivation,
  FactoryQuotationItem,
} from "@/types/admin";

export const FactoryAccountTab: React.FC = () => {
  const {
    session,
    factoryMovements,
    addFactoryMovement,
    exportFactoryMovementsExcel,
    factoryQuotations,
    updateFactoryQuotationMarkup,
    factorySales,
  } = useAdmin();

  const currentEmpresa = session.empresa || "ADAMA";

  // Movimientos de la empresa actual
  const myMovements = useMemo(() => {
    return factoryMovements.filter(
      (m) => m.empresa.toUpperCase() === currentEmpresa.toUpperCase()
    );
  }, [factoryMovements, currentEmpresa]);

  // Cotizaciones de la empresa para análisis de Markup
  const myQuotations = useMemo(() => {
    return factoryQuotations.filter(
      (q) => q.empresa.toUpperCase() === currentEmpresa.toUpperCase()
    );
  }, [factoryQuotations, currentEmpresa]);

  // Ventas de la empresa para relacionar comprobantes
  const mySales = useMemo(() => {
    return factorySales.filter(
      (s) => s.empresa.toUpperCase() === currentEmpresa.toUpperCase()
    );
  }, [factorySales, currentEmpresa]);

  // Navegación interna de la sección Cuenta Corriente
  const [activeSubTab, setActiveSubTab] = useState<"MOVIMIENTOS" | "MARKUP" | "PAGOS">("MOVIMIENTOS");

  // Filtros de Movimientos
  const [filterType, setFilterType] = useState<string>("TODOS");
  const [searchMov, setSearchMov] = useState("");

  // Modal para nueva Nota de Crédito / Débito
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTipo, setNoteTipo] = useState<"NOTA_CREDITO" | "NOTA_DEBITO">("NOTA_CREDITO");
  const [noteNumero, setNoteNumero] = useState("");
  const [noteOperacion, setNoteOperacion] = useState("");
  const [noteConcepto, setNoteConcepto] = useState("");
  const [noteMonto, setNoteMonto] = useState<number | "">("");
  const [noteObservaciones, setNoteObservaciones] = useState("");
  const [noteSuccess, setNoteSuccess] = useState(false);

  // Estados para configuración de Markup en cotización
  const [selectedQuoteForMarkup, setSelectedQuoteForMarkup] = useState<FactoryQuotationDerivation | null>(null);
  const [markupMode, setMarkupMode] = useState<"GLOBAL" | "POR_PRODUCTO">("GLOBAL");
  const [globalPercent, setGlobalPercent] = useState<number>(8.0);
  const [itemMarkups, setItemMarkups] = useState<
    Record<string, { tipo: "PORCENTAJE" | "MONTO_FIJO"; valor: number }>
  >({});
  const [markupSavedNotice, setMarkupSavedNotice] = useState(false);

  // KPI Calculations
  const totals = useMemo(() => {
    const debitoTotal = myMovements.reduce((acc, m) => acc + (m.debitoUsd || 0), 0);
    const creditoTotal = myMovements.reduce((acc, m) => acc + (m.creditoUsd || 0), 0);
    const saldoPendiente = debitoTotal - creditoTotal;
    const markupTotal = myMovements.reduce((acc, m) => acc + (m.markupIntermediarioUsd || 0), 0);
    return { debitoTotal, creditoTotal, saldoPendiente, markupTotal };
  }, [myMovements]);

  // Filtrado de movimientos
  const filteredMovements = useMemo(() => {
    return myMovements.filter((m) => {
      if (filterType !== "TODOS" && m.tipo !== filterType) {
        return false;
      }
      if (searchMov) {
        const q = searchMov.toLowerCase();
        const str = `${m.numeroComprobante} ${m.concepto} ${m.operacionRelacionada || ""}`.toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });
  }, [myMovements, filterType, searchMov]);

  // Pagos realizados por Campo Directo exclusivamente
  const paymentsOnly = useMemo(() => {
    return myMovements.filter((m) => m.tipo === "PAGO_CAMPO_DIRECTO");
  }, [myMovements]);

  // Manejar apertura de configuración de Markup para una cotización
  const handleOpenMarkupConfig = (quote: FactoryQuotationDerivation) => {
    setSelectedQuoteForMarkup(quote);
    const isGlobal = quote.markupGlobal?.tipo !== "POR_PRODUCTO";
    setMarkupMode(isGlobal ? "GLOBAL" : "POR_PRODUCTO");
    setGlobalPercent(quote.markupGlobal?.porcentajeGlobal ?? 8.0);

    // Mapear los markups por producto
    const map: Record<string, { tipo: "PORCENTAJE" | "MONTO_FIJO"; valor: number }> = {};
    quote.items.forEach((it) => {
      map[it.id] = {
        tipo: it.markupTipo || "PORCENTAJE",
        valor: it.markupValor !== undefined ? it.markupValor : (quote.markupGlobal?.porcentajeGlobal ?? 8.0),
      };
    });
    setItemMarkups(map);
    setMarkupSavedNotice(false);
  };

  // Calcular items con markup dinámicamente
  const calculatedItems = useMemo(() => {
    if (!selectedQuoteForMarkup) return [];

    return selectedQuoteForMarkup.items.map((it) => {
      const priceFab = it.precioUnitarioFabricaUsd || 0;
      let priceClient = priceFab;
      let markupItemUsd = 0;

      if (markupMode === "GLOBAL") {
        const pct = (globalPercent || 0) / 100;
        markupItemUsd = priceFab * pct;
        priceClient = priceFab + markupItemUsd;
      } else {
        const cfg = itemMarkups[it.id] || { tipo: "PORCENTAJE", valor: 8.0 };
        if (cfg.tipo === "PORCENTAJE") {
          const pct = (cfg.valor || 0) / 100;
          markupItemUsd = priceFab * pct;
          priceClient = priceFab + markupItemUsd;
        } else {
          // MONTO FIJO
          markupItemUsd = cfg.valor || 0;
          priceClient = priceFab + markupItemUsd;
        }
      }

      const subtotalFab = priceFab * it.cantidad;
      const subtotalClient = priceClient * it.cantidad;
      const totalMarkupLine = subtotalClient - subtotalFab;

      return {
        ...it,
        precioUnitarioClienteUsd: Number(priceClient.toFixed(2)),
        subtotalClienteUsd: Number(subtotalClient.toFixed(2)),
        markupLineUsd: Number(totalMarkupLine.toFixed(2)),
      };
    });
  }, [selectedQuoteForMarkup, markupMode, globalPercent, itemMarkups]);

  // Totales de la cotización calculada
  const quoteSummary = useMemo(() => {
    const totalFab = calculatedItems.reduce((acc, it) => acc + (it.subtotalFabricaUsd || 0), 0);
    const totalClient = calculatedItems.reduce((acc, it) => acc + (it.subtotalClienteUsd || 0), 0);
    const totalMarkup = totalClient - totalFab;
    const avgMarginPct = totalFab > 0 ? (totalMarkup / totalFab) * 100 : 0;

    return {
      totalFab,
      totalClient,
      totalMarkup,
      avgMarginPct,
    };
  }, [calculatedItems]);

  // Guardar configuración de markup
  const handleSaveMarkup = () => {
    if (!selectedQuoteForMarkup) return;

    const itemsToSave: FactoryQuotationItem[] = calculatedItems.map((it) => {
      const cfg = itemMarkups[it.id];
      return {
        id: it.id,
        producto: it.producto,
        categoria: it.categoria,
        cantidad: it.cantidad,
        unidad: it.unidad,
        detalle: it.detalle,
        precioUnitarioFabricaUsd: it.precioUnitarioFabricaUsd,
        subtotalFabricaUsd: it.subtotalFabricaUsd,
        plazoEntrega: it.plazoEntrega,
        disponibilidad: it.disponibilidad,
        markupTipo: markupMode === "GLOBAL" ? "PORCENTAJE" : cfg?.tipo || "PORCENTAJE",
        markupValor: markupMode === "GLOBAL" ? globalPercent : cfg?.valor || 0,
        precioUnitarioClienteUsd: it.precioUnitarioClienteUsd,
        subtotalClienteUsd: it.subtotalClienteUsd,
      };
    });

    const markupGlobalData = {
      tipo: markupMode,
      porcentajeGlobal: markupMode === "GLOBAL" ? globalPercent : undefined,
      totalClienteUsd: quoteSummary.totalClient,
      totalMarkupUsd: quoteSummary.totalMarkup,
    };

    updateFactoryQuotationMarkup(selectedQuoteForMarkup.id, markupGlobalData, itemsToSave);
    setMarkupSavedNotice(true);
    setTimeout(() => {
      setMarkupSavedNotice(false);
      setSelectedQuoteForMarkup(null);
    }, 1500);
  };

  // Enviar nueva Nota de Crédito / Débito
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteNumero || !noteMonto || Number(noteMonto) <= 0 || !noteConcepto) return;

    const montoVal = Number(noteMonto);
    const isCredit = noteTipo === "NOTA_CREDITO";

    // En cuenta corriente:
    // NOTA_CREDITO: disminuye el saldo a cobrar por la fábrica (Crédito USD a favor de CD)
    // NOTA_DEBITO: incrementa el saldo a cobrar por la fábrica (Débito USD a favor de Fábrica)
    const nuevoSaldo = isCredit
      ? totals.saldoPendiente - montoVal
      : totals.saldoPendiente + montoVal;

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now.getFullYear()}`;

    addFactoryMovement({
      empresa: currentEmpresa,
      fecha: formattedDate,
      tipo: noteTipo,
      numeroComprobante: noteNumero.toUpperCase().trim(),
      concepto: noteConcepto.trim(),
      operacionRelacionada: noteOperacion ? noteOperacion.toUpperCase().trim() : undefined,
      debitoUsd: isCredit ? 0 : montoVal,
      creditoUsd: isCredit ? montoVal : 0,
      saldoAcumuladoUsd: Number(nuevoSaldo.toFixed(2)),
      observaciones: noteObservaciones ? noteObservaciones.trim() : undefined,
    });

    setNoteSuccess(true);
    setTimeout(() => {
      setNoteSuccess(false);
      setShowNoteModal(false);
      setNoteNumero("");
      setNoteOperacion("");
      setNoteConcepto("");
      setNoteMonto("");
      setNoteObservaciones("");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                Finanzas Fábrica
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {currentEmpresa}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Cuenta Corriente & Gestión de Markup
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Control de saldos comerciales, detalle de facturación a Campo Directo, conciliación de pagos efectuados,
              emisión de Notas de Crédito/Débito y administración de comisiones intermediarias (Markup) por producto y cotización.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowNoteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-medium text-sm transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nota C/D</span>
            </button>
            <button
              onClick={() => exportFactoryMovementsExcel(currentEmpresa)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-medium text-sm transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Estado de Cuenta</span>
            </button>
          </div>
        </div>

        {/* 4 Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Facturado a CD (Débito)
              </span>
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">
                USD {totals.debitoTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Total comprobantes emitidos por {currentEmpresa}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Pagado por CD (Crédito)
              </span>
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">
                USD {totals.creditoTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Transferencias y pagos recibidos en cuenta
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-amber-800">
                Saldo Pendiente
              </span>
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-amber-900">
                USD {totals.saldoPendiente.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              {totals.saldoPendiente > 0 ? "A cobrar a Campo Directo" : "Cuenta al día sin saldos"}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-purple-800">
                Markup Intermediación
              </span>
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-purple-900">
                USD {totals.markupTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-purple-700 mt-1">
              Margen de comisión generado en ventas
            </p>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 mt-6 -mb-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("MOVIMIENTOS")}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === "MOVIMIENTOS"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Libro Mayor & Movimientos</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
              {myMovements.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("MARKUP")}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === "MARKUP"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Definición de Markup (Por Producto / Cotización)</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800">
              {myQuotations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("PAGOS")}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === "PAGOS"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Resumen de Pagos Campo Directo</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
              {paymentsOnly.length}
            </span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: MOVIMIENTOS & LIBRO MAYOR */}
      {activeSubTab === "MOVIMIENTOS" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchMov}
                onChange={(e) => setSearchMov(e.target.value)}
                placeholder="Buscar por N° comprobante o concepto..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Filtrar tipo:
              </span>
              {(
                [
                  { id: "TODOS", label: "Todos" },
                  { id: "FACTURA_COMPRA", label: "Facturas" },
                  { id: "PAGO_CAMPO_DIRECTO", label: "Pagos CD" },
                  { id: "NOTA_CREDITO", label: "Notas de Crédito" },
                  { id: "NOTA_DEBITO", label: "Notas de Débito" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                    filterType === f.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Tipo & N° Comprobante</th>
                  <th className="py-3 px-4">Concepto / Operación</th>
                  <th className="py-3 px-4 text-right">Débito USD (Facturado)</th>
                  <th className="py-3 px-4 text-right">Crédito USD (Pagos CD)</th>
                  <th className="py-3 px-4 text-right">Saldo Acum. USD</th>
                  <th className="py-3 px-4 text-right">Markup CD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      No se encontraron movimientos registrados con los filtros actuales.
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((mov) => {
                    const isFactura = mov.tipo === "FACTURA_COMPRA";
                    const isPago = mov.tipo === "PAGO_CAMPO_DIRECTO";
                    const isNC = mov.tipo === "NOTA_CREDITO";
                    const isND = mov.tipo === "NOTA_DEBITO";

                    return (
                      <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-slate-600 font-mono text-xs whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {mov.fecha}
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                                isFactura
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isPago
                                  ? "bg-blue-100 text-blue-800"
                                  : isNC
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {isFactura ? "Factura" : isPago ? "Pago CD" : isNC ? "Nota Crédito" : "Nota Débito"}
                            </span>
                            <span className="font-semibold text-slate-900 font-mono text-xs">
                              {mov.numeroComprobante}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800 line-clamp-1">{mov.concepto}</div>
                          {mov.operacionRelacionada && (
                            <span className="text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 font-mono">
                              Op: {mov.operacionRelacionada}
                            </span>
                          )}
                          {mov.observaciones && (
                            <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                              {mov.observaciones}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 whitespace-nowrap">
                          {mov.debitoUsd > 0 ? (
                            <span className="text-emerald-700">
                              + USD {mov.debitoUsd.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 whitespace-nowrap">
                          {mov.creditoUsd > 0 ? (
                            <span className="text-blue-700">
                              - USD {mov.creditoUsd.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          USD {mov.saldoAcumuladoUsd.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 px-4 text-right font-mono text-xs whitespace-nowrap">
                          {mov.markupIntermediarioUsd && mov.markupIntermediarioUsd > 0 ? (
                            <span className="text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              USD {mov.markupIntermediarioUsd.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CONFIGURACIÓN DE MARKUP POR PRODUCTO Y POR COTIZACIÓN */}
      {activeSubTab === "MARKUP" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Calculator className="w-3.5 h-3.5 text-purple-300" />
                  Módulo Estratégico de Precios
                </div>
                <h2 className="text-xl font-bold">Gestión de Margen Intermediario (Markup)</h2>
                <p className="text-purple-200 text-sm mt-1 max-w-2xl">
                  Definición bajo la posibilidad de elegir, <strong>por producto y por cotización</strong>, de manera
                  que en algunos insumos se mantenga un margen más competitivo o agresivo y en otros con mayor margen comercial.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-xs border border-white/10 space-y-1">
                <div className="text-purple-200">Diferencia Operativa:</div>
                <div className="font-semibold text-white">Cotización Cliente - Cotización Fábrica = Markup Campo Directo</div>
              </div>
            </div>
          </div>

          {/* List of Quotes eligible for Markup Setting */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Cotizaciones respondidas */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Cotizaciones Fábrica</span>
                <span className="text-xs font-normal text-slate-500">Seleccione para editar</span>
              </h3>

              {myQuotations.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  No hay cotizaciones para configurar.
                </div>
              ) : (
                <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                  {myQuotations.map((q) => {
                    const isSelected = selectedQuoteForMarkup?.id === q.id;
                    const hasResponse = !!q.respuestaFabrica;
                    const totalFab = q.respuestaFabrica?.totalFabricaUsd || 0;
                    const totalCli = q.markupGlobal?.totalClienteUsd || (totalFab * 1.08);
                    const markupAmt = totalCli - totalFab;

                    return (
                      <div
                        key={q.id}
                        onClick={() => handleOpenMarkupConfig(q)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-purple-50/70 border-purple-500 shadow-sm"
                            : "bg-slate-50 hover:bg-slate-100/80 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {q.numeroCotizacion}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              q.estado === "COTIZADA_POR_FABRICA"
                                ? "bg-amber-100 text-amber-800"
                                : q.estado === "ENVIADA_A_CLIENTE"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {q.estado}
                          </span>
                        </div>

                        <div className="font-semibold text-slate-800 text-sm mt-1.5 truncate">
                          {q.clienteNombre}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 truncate">
                          {q.lugarEntrega.localidad}, {q.lugarEntrega.provincia}
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px]">FÁBRICA</span>
                            <span className="font-mono font-semibold text-slate-800">
                              USD {totalFab.toLocaleString("es-AR")}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-purple-600 block text-[10px] font-bold">MARKUP</span>
                            <span className="font-mono font-bold text-purple-700">
                              + USD {markupAmt.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Col: Editor de Markup */}
            <div className="lg:col-span-2">
              {!selectedQuoteForMarkup ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                  <Sliders className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-800">
                    Seleccione una cotización para ajustar el Markup
                  </h4>
                  <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                    Podrá elegir entre aplicar un porcentaje global uniforme o fijar márgenes específicos y diferenciados
                    por cada producto cotizado.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-purple-200 shadow-sm p-6 space-y-6">
                  {/* Selected Quote Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-900">
                          Cotización {selectedQuoteForMarkup.numeroCotizacion}
                        </span>
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                          {selectedQuoteForMarkup.clienteNombre}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Destino: {selectedQuoteForMarkup.lugarEntrega.establecimiento} ({selectedQuoteForMarkup.lugarEntrega.localidad})
                      </p>
                    </div>

                    {/* Mode Switcher */}
                    <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setMarkupMode("GLOBAL")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          markupMode === "GLOBAL"
                            ? "bg-white text-purple-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Margen Global (%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setMarkupMode("POR_PRODUCTO")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          markupMode === "POR_PRODUCTO"
                            ? "bg-white text-purple-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Granular por Producto
                      </button>
                    </div>
                  </div>

                  {/* Mode: Global */}
                  {markupMode === "GLOBAL" && (
                    <div className="bg-purple-50/60 rounded-xl p-4 border border-purple-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                            <Percent className="w-3.5 h-3.5" />
                            Porcentaje de Markup Global para toda la cotización:
                          </label>
                          <p className="text-xs text-purple-700 mt-0.5">
                            Se aplicará de manera uniforme a cada uno de los productos de la oferta.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={globalPercent}
                            onChange={(e) => setGlobalPercent(parseFloat(e.target.value) || 0)}
                            className="w-24 px-3 py-2 text-right font-mono font-bold text-slate-900 bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          />
                          <span className="font-bold text-purple-900 text-sm">%</span>
                        </div>
                      </div>

                      {/* Quick percentage pills */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="text-[11px] text-purple-600 font-medium">Margen sugerido:</span>
                        {[4.0, 6.0, 8.0, 10.0, 12.5, 15.0].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setGlobalPercent(pct)}
                            className={`px-2 py-0.5 text-xs rounded font-mono font-semibold transition-all ${
                              globalPercent === pct
                                ? "bg-purple-700 text-white"
                                : "bg-white text-purple-700 border border-purple-200 hover:bg-purple-100"
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products Table with granular pricing */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Desglose de Ítems Cotizados
                      </span>
                      <span className="text-xs text-slate-500">
                        {calculatedItems.length} ítems en cotización
                      </span>
                    </div>

                    <div className="divide-y divide-slate-200">
                      {calculatedItems.map((it) => {
                        const currentCfg = itemMarkups[it.id] || { tipo: "PORCENTAJE", valor: 8.0 };

                        return (
                          <div key={it.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                              {/* Product Info */}
                              <div className="flex-1 min-w-[200px]">
                                <div className="font-bold text-slate-900 text-sm">{it.producto}</div>
                                <div className="text-xs text-slate-500">
                                  {it.categoria} • Cantidad:{" "}
                                  <strong className="text-slate-800">
                                    {it.cantidad} {it.unidad}
                                  </strong>
                                </div>
                                <div className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded inline-block mt-1">
                                  Precio Fábrica: USD {it.precioUnitarioFabricaUsd?.toFixed(2)} / {it.unidad} (Subt: USD {it.subtotalFabricaUsd?.toLocaleString("es-AR")})
                                </div>
                              </div>

                              {/* Markup Config (Granular Mode) */}
                              {markupMode === "POR_PRODUCTO" && (
                                <div className="flex items-center gap-2 bg-purple-50/60 p-2 rounded-xl border border-purple-200">
                                  <select
                                    value={currentCfg.tipo}
                                    onChange={(e) => {
                                      const tipo = e.target.value as "PORCENTAJE" | "MONTO_FIJO";
                                      setItemMarkups((prev) => ({
                                        ...prev,
                                        [it.id]: {
                                          tipo,
                                          valor: tipo === "PORCENTAJE" ? 8.0 : 2.5,
                                        },
                                      }));
                                    }}
                                    className="text-xs font-semibold bg-white border border-purple-300 rounded-lg px-2 py-1.5 text-purple-900 focus:outline-none"
                                  >
                                    <option value="PORCENTAJE">% Porcentaje</option>
                                    <option value="MONTO_FIJO">USD Monto Fijo</option>
                                  </select>

                                  <input
                                    type="number"
                                    min="0"
                                    step={currentCfg.tipo === "PORCENTAJE" ? "0.5" : "0.25"}
                                    value={currentCfg.valor}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value) || 0;
                                      setItemMarkups((prev) => ({
                                        ...prev,
                                        [it.id]: {
                                          ...prev[it.id],
                                          valor: val,
                                        },
                                      }));
                                    }}
                                    className="w-20 px-2 py-1.5 text-right font-mono font-bold text-slate-900 bg-white border border-purple-300 rounded-lg text-xs focus:outline-none"
                                  />
                                </div>
                              )}

                              {/* Result for Client */}
                              <div className="text-right min-w-[160px] pl-4 border-l border-slate-200">
                                <div className="text-xs text-slate-500">Precio Final Cliente:</div>
                                <div className="font-mono font-bold text-slate-900 text-sm">
                                  USD {it.precioUnitarioClienteUsd?.toFixed(2)} / {it.unidad}
                                </div>
                                <div className="text-xs font-mono text-purple-700 font-semibold mt-0.5">
                                  Markup CD: + USD {it.markupLineUsd.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary Footer of Calculations */}
                  <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="grid grid-cols-3 gap-4 w-full sm:w-auto text-center sm:text-left">
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                          Total Fábrica
                        </span>
                        <span className="font-mono text-base font-bold text-white">
                          USD {quoteSummary.totalFab.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-purple-400 uppercase tracking-wider block">
                          Markup CD ({quoteSummary.avgMarginPct.toFixed(1)}%)
                        </span>
                        <span className="font-mono text-base font-bold text-purple-300">
                          + USD {quoteSummary.totalMarkup.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] text-emerald-400 uppercase tracking-wider block">
                          Cotización Cliente
                        </span>
                        <span className="font-mono text-base font-bold text-emerald-300">
                          USD {quoteSummary.totalClient.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      {markupSavedNotice && (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Markup guardado con éxito
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleSaveMarkup}
                        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Aplicar & Enviar a Cliente</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: RESUMEN DE PAGOS CAMPO DIRECTO */}
      {activeSubTab === "PAGOS" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Resumen Oficial de Pagos Efectuados por Campo Directo
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Conciliación bancaria de órdenes de pago, transferencias directas y valores acreditados a {currentEmpresa}.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-right">
              <span className="text-xs font-semibold uppercase text-blue-800 block">Total Transferido</span>
              <span className="text-xl font-black text-blue-950 font-mono">
                USD {totals.creditoTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-4">Fecha Pago</th>
                  <th className="py-3 px-4">Orden de Pago / Ref</th>
                  <th className="py-3 px-4">Concepto Imputado</th>
                  <th className="py-3 px-4">Operación Relacionada</th>
                  <th className="py-3 px-4 text-right">Monto Pagado (USD)</th>
                  <th className="py-3 px-4 text-center">Comprobante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {paymentsOnly.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No hay pagos registrados aún para esta fábrica.
                    </td>
                  </tr>
                ) : (
                  paymentsOnly.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {p.fecha}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-blue-900 whitespace-nowrap">
                        {p.numeroComprobante}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">{p.concepto}</span>
                        {p.observaciones && (
                          <div className="text-xs text-slate-500 mt-0.5">{p.observaciones}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                        {p.operacionRelacionada ? (
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                            {p.operacionRelacionada}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-blue-700 whitespace-nowrap">
                        USD {p.creditoUsd.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => alert(`Descargando comprobante bancario oficial: ${p.numeroComprobante}.pdf`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>PDF Pago</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR NOTA DE CRÉDITO O DÉBITO */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Registrar Nota de Crédito / Débito
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ajuste de cuenta corriente comercial con {currentEmpresa}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNoteModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="p-6 space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Tipo de Comprobante *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      noteTipo === "NOTA_CREDITO"
                        ? "bg-purple-50 border-purple-500 text-purple-900"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="noteTipo"
                      value="NOTA_CREDITO"
                      checked={noteTipo === "NOTA_CREDITO"}
                      onChange={() => setNoteTipo("NOTA_CREDITO")}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-bold text-sm">Nota de Crédito</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Deducción / Descuento a favor de CD (Disminuye saldo)
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      noteTipo === "NOTA_DEBITO"
                        ? "bg-amber-50 border-amber-500 text-amber-900"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="noteTipo"
                      value="NOTA_DEBITO"
                      checked={noteTipo === "NOTA_DEBITO"}
                      onChange={() => setNoteTipo("NOTA_DEBITO")}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-bold text-sm">Nota de Débito</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Cargo extra / ajuste a favor de Fábrica (Aumenta saldo)
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Number and Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    N° Comprobante Oficial *
                  </label>
                  <input
                    type="text"
                    required
                    value={noteNumero}
                    onChange={(e) => setNoteNumero(e.target.value)}
                    placeholder={noteTipo === "NOTA_CREDITO" ? "NC-A-0008-00000412" : "ND-A-0008-00000104"}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Monto Total (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                      USD
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      value={noteMonto}
                      onChange={(e) => setNoteMonto(e.target.value === "" ? "" : parseFloat(e.target.value))}
                      placeholder="0.00"
                      className="w-full pl-12 pr-3 py-2 text-sm font-mono font-bold text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Operación relacionada */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Operación Vinculada (Opcional)
                </label>
                <select
                  value={noteOperacion}
                  onChange={(e) => setNoteOperacion(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">-- Sin operación específica vinculada --</option>
                  {mySales.map((s) => (
                    <option key={s.id} value={s.numeroOperacion}>
                      {s.numeroOperacion} - {s.clienteNombre} (USD {s.totalFabricaUsd.toLocaleString("es-AR")})
                    </option>
                  ))}
                </select>
              </div>

              {/* Concepto */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Concepto / Motivo *
                </label>
                <input
                  type="text"
                  required
                  value={noteConcepto}
                  onChange={(e) => setNoteConcepto(e.target.value)}
                  placeholder="Ej: Bonificación comercial por volumen / Ajuste de flete"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Observaciones adicionales
                </label>
                <textarea
                  rows={2}
                  value={noteObservaciones}
                  onChange={(e) => setNoteObservaciones(e.target.value)}
                  placeholder="Detalles sobre resolución comercial o acuerdo de partes..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-sm flex items-center gap-2"
                >
                  {noteSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Registrado</span>
                    </>
                  ) : (
                    <span>Registrar en Cuenta Corriente</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
