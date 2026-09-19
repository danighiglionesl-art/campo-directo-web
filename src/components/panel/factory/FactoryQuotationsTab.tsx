"use client";

import React, { useState, useMemo } from "react";
import {
  Inbox,
  Search,
  MapPin,
  ExternalLink,
  DollarSign,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Eye,
  Building2,
  X,
  FileText,
  Navigation,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { FactoryQuotationDerivation, FactoryQuotationItem } from "@/types/admin";

export const FactoryQuotationsTab: React.FC = () => {
  const { session, factoryQuotations, submitFactoryQuotationResponse } = useAdmin();

  const currentEmpresa = session.empresa || "ADAMA";

  // Filtrar cotizaciones derivadas para esta empresa
  const myQuotations = useMemo(() => {
    return factoryQuotations.filter(
      (q) => q.empresa.toUpperCase() === currentEmpresa.toUpperCase()
    );
  }, [factoryQuotations, currentEmpresa]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");

  // Modal para Cotizar
  const [selectedQuote, setSelectedQuote] = useState<FactoryQuotationDerivation | null>(null);
  const [editingPrices, setEditingPrices] = useState<Record<string, number>>({});
  const [validezOferta, setValidezOferta] = useState("7 días corridos");
  const [condicionPago, setCondicionPago] = useState("echeq 60 días libre de recargo");
  const [plazoEntrega, setPlazoEntrega] = useState("Despacho en 48hs hábiles desde confirmación");
  const [observaciones, setObservaciones] = useState("");
  const [successQuoteId, setSuccessQuoteId] = useState<string | null>(null);

  const filteredQuotations = useMemo(() => {
    return myQuotations.filter((q) => {
      if (search) {
        const query = search.toLowerCase();
        const text = `${q.numeroCotizacion} ${q.clienteNombre} ${q.lugarEntrega.establecimiento} ${q.lugarEntrega.localidad}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
      if (statusFilter !== "TODOS" && q.estado !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [myQuotations, search, statusFilter]);

  const handleOpenQuoteModal = (quote: FactoryQuotationDerivation) => {
    setSelectedQuote(quote);
    const initialPrices: Record<string, number> = {};
    quote.items.forEach((it) => {
      initialPrices[it.id] = it.precioUnitarioFabricaUsd || 0;
    });
    setEditingPrices(initialPrices);
    setValidezOferta(quote.respuestaFabrica?.validezOferta || "7 días corridos");
    setCondicionPago(quote.respuestaFabrica?.condicionPago || "echeq 60 días libre de recargo");
    setPlazoEntrega(quote.respuestaFabrica?.plazoEntrega || "Despacho en 48hs hábiles desde confirmación");
    setObservaciones(quote.respuestaFabrica?.observaciones || "");
  };

  const handlePriceChange = (itemId: string, val: number) => {
    setEditingPrices((prev) => ({ ...prev, [itemId]: val }));
  };

  const totalCalculatedUsd = useMemo(() => {
    if (!selectedQuote) return 0;
    return selectedQuote.items.reduce((acc, it) => {
      const p = editingPrices[it.id] || 0;
      return acc + p * it.cantidad;
    }, 0);
  }, [selectedQuote, editingPrices]);

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;

    const itemsUpdated: FactoryQuotationItem[] = selectedQuote.items.map((it) => {
      const unitPrice = editingPrices[it.id] || 0;
      return {
        ...it,
        precioUnitarioFabricaUsd: unitPrice,
        subtotalFabricaUsd: unitPrice * it.cantidad,
      };
    });

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now.getFullYear()}`;

    submitFactoryQuotationResponse(
      selectedQuote.id,
      {
        totalFabricaUsd: totalCalculatedUsd,
        validezOferta,
        condicionPago,
        plazoEntrega,
        observaciones,
        fechaRespuesta: formattedDate,
      },
      itemsUpdated
    );

    setSuccessQuoteId(selectedQuote.id);
    setTimeout(() => {
      setSelectedQuote(null);
      setSuccessQuoteId(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-campo-green-100 text-campo-green-800 text-xs font-black uppercase tracking-wider">
              Sección 3
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              3. Cotizaciones Recibidas & Gestión de Entrega
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Recepción intermediada de pedidos derivados por <strong>Campo Directo</strong>. Revisá las cantidades, el lugar de entrega y cargá tus condiciones comerciales.
          </p>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por N° cotización, cliente, localidad..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-campo-green-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-campo-green-500"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="DERIVADA_A_FABRICA">Pendientes de Cotizar</option>
            <option value="COTIZADA_POR_FABRICA">Cotizadas por Fábrica</option>
            <option value="ENVIADA_A_CLIENTE">Enviadas al Cliente</option>
            <option value="ACEPTADA">Aceptadas</option>
          </select>
        </div>
      </div>

      {/* Tabla de Cotizaciones */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">N° Cotización & Fecha</th>
                <th className="py-3 px-4">Cliente Intermediado</th>
                <th className="py-3 px-4">Productos Solicitados</th>
                <th className="py-3 px-4">3b. Lugar de Entrega Georreferenciado</th>
                <th className="py-3 px-4">Cotización Fábrica (USD)</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No tenés cotizaciones derivadas en esta sección.
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((q) => {
                  const isCotizada =
                    q.estado === "COTIZADA_POR_FABRICA" ||
                    q.estado === "ENVIADA_A_CLIENTE" ||
                    q.estado === "ACEPTADA";

                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {q.numeroCotizacion}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Derivado: {q.fechaDerivacion}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{q.clienteNombre}</div>
                        <div className="text-[11px] text-slate-500">CUIT: {q.clienteCuit}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {q.items.map((it, idx) => (
                            <div key={idx} className="font-medium text-slate-800">
                              &bull; <strong>{it.producto}</strong>: {it.cantidad} {it.unidad}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* 3b: Lugar de Entrega */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="truncate">{q.lugarEntrega.establecimiento}</span>
                          </div>
                          <div className="text-[11px] text-slate-600">
                            {q.lugarEntrega.localidad}, {q.lugarEntrega.provincia}
                          </div>
                          {q.lugarEntrega.linkMaps && (
                            <a
                              href={q.lugarEntrega.linkMaps}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:underline pt-0.5"
                            >
                              <Navigation className="w-3 h-3" />
                              <span>Ver Ubicación en Maps</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Monto Cotizado Fábrica */}
                      <td className="py-3.5 px-4">
                        {isCotizada && q.respuestaFabrica ? (
                          <div>
                            <span className="font-mono font-black text-slate-900 text-sm">
                              USD {q.respuestaFabrica.totalFabricaUsd.toLocaleString("es-AR")}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              Plazo: {q.respuestaFabrica.plazoEntrega}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Sin cotizar</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            q.estado === "DERIVADA_A_FABRICA"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : q.estado === "COTIZADA_POR_FABRICA"
                              ? "bg-blue-100 text-blue-800 border border-blue-300"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          }`}
                        >
                          {q.estado === "DERIVADA_A_FABRICA"
                            ? "PENDIENTE COTIZAR"
                            : q.estado === "COTIZADA_POR_FABRICA"
                            ? "COTIZADA A CD"
                            : q.estado}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenQuoteModal(q)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-campo-green-600 hover:bg-campo-green-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{isCotizada ? "Actualizar Cotización" : "Cotizar Ahora"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Cotizar a Campo Directo */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-campo-green-500/20 text-campo-green-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    Cotización Fábrica: {selectedQuote.numeroCotizacion}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Definí tu precio unitario mayorista y condiciones de entrega para Campo Directo.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuote(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {successQuoteId === selectedQuote.id ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">
                    ¡Cotización enviada exitosamente a Campo Directo!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    El equipo comercial de Campo Directo aplicará el Markup correspondiente y remitirá la propuesta oficial al cliente productor.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitQuote} className="space-y-4">
                  {/* Ficha de Entrega (3b) */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-800">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <span>3b. Lugar de Entrega Georreferenciado</span>
                      </div>
                      {selectedQuote.lugarEntrega.linkMaps && (
                        <a
                          href={selectedQuote.lugarEntrega.linkMaps}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Abrir en Google Maps</span>
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                      <div>
                        <span className="text-slate-400 block">Establecimiento:</span>
                        <strong className="text-slate-900">{selectedQuote.lugarEntrega.establecimiento}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Localidad y Provincia:</span>
                        <strong className="text-slate-900">
                          {selectedQuote.lugarEntrega.localidad}, {selectedQuote.lugarEntrega.provincia}
                        </strong>
                      </div>
                      {selectedQuote.lugarEntrega.coordenadasGps && (
                        <div>
                          <span className="text-slate-400 block">Coordenadas GPS:</span>
                          <span className="font-mono font-semibold text-slate-800">
                            {selectedQuote.lugarEntrega.coordenadasGps}
                          </span>
                        </div>
                      )}
                      {selectedQuote.lugarEntrega.tipoDescarga && (
                        <div>
                          <span className="text-slate-400 block">Tipo de Descarga:</span>
                          <span className="font-semibold text-slate-800">
                            {selectedQuote.lugarEntrega.tipoDescarga}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tabla de Carga de Precios por Producto */}
                  <div>
                    <span className="font-bold text-slate-800 uppercase tracking-wider block mb-2">
                      Productos a Cotizar (Precio Fábrica en USD):
                    </span>
                    <div className="space-y-2">
                      {selectedQuote.items.map((it) => {
                        const unitPrice = editingPrices[it.id] || 0;
                        const subtotal = unitPrice * it.cantidad;

                        return (
                          <div
                            key={it.id}
                            className="p-3 bg-white border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center shadow-xs"
                          >
                            <div className="sm:col-span-5">
                              <span className="font-bold text-slate-900 text-sm block">
                                {it.producto}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {it.categoria} {it.detalle ? `• ${it.detalle}` : ""}
                              </span>
                            </div>

                            <div className="sm:col-span-2 text-center sm:text-left">
                              <span className="text-slate-400 text-[10px] block uppercase">Cantidad:</span>
                              <strong className="font-mono text-slate-800">
                                {it.cantidad} {it.unidad}
                              </strong>
                            </div>

                            <div className="sm:col-span-3">
                              <span className="text-slate-500 text-[10px] font-bold block mb-0.5">
                                Precio Unitario Fábrica (USD) *
                              </span>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-2.5 flex items-center text-slate-400 font-bold">
                                  $
                                </span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  required
                                  value={unitPrice || ""}
                                  onChange={(e) =>
                                    handlePriceChange(it.id, parseFloat(e.target.value) || 0)
                                  }
                                  placeholder="0.00"
                                  className="w-full pl-6 pr-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-campo-green-500 text-sm"
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-2 text-right">
                              <span className="text-slate-400 text-[10px] block uppercase">Subtotal:</span>
                              <strong className="font-mono text-campo-green-700 text-sm">
                                USD {subtotal.toFixed(2)}
                              </strong>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Totalizador Fábrica */}
                  <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-300 uppercase tracking-wider block font-semibold">
                        Total Cotización Fábrica (USD):
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Costo base sobre el que Campo Directo definirá el Markup.
                      </span>
                    </div>
                    <div className="text-2xl font-black font-mono text-emerald-400">
                      USD {totalCalculatedUsd.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Condiciones Comerciales */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Validez de la Oferta *
                      </label>
                      <input
                        type="text"
                        required
                        value={validezOferta}
                        onChange={(e) => setValidezOferta(e.target.value)}
                        placeholder="Ej: 7 días corridos"
                        className="w-full p-2 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Plazo de Entrega *
                      </label>
                      <input
                        type="text"
                        required
                        value={plazoEntrega}
                        onChange={(e) => setPlazoEntrega(e.target.value)}
                        placeholder="Ej: Despacho en 48hs"
                        className="w-full p-2 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Condición de Pago Fábrica *
                      </label>
                      <input
                        type="text"
                        required
                        value={condicionPago}
                        onChange={(e) => setCondicionPago(e.target.value)}
                        placeholder="Ej: echeq 60 días"
                        className="w-full p-2 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Observaciones Comerciales para Campo Directo:
                    </label>
                    <textarea
                      rows={2}
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Ej: Precios con flete incluido a destino. Descuento adicional por pago de contado anticipado."
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-campo-green-500"
                    />
                  </div>

                  {/* Footer Modal */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedQuote(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-campo-green-600 hover:bg-campo-green-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar Cotización a Campo Directo</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
