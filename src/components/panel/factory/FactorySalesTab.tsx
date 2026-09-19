"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Truck,
  CheckCircle2,
  FileText,
  Upload,
  Download,
  Eye,
  AlertCircle,
  Clock,
  MapPin,
  Calendar,
  Building2,
  DollarSign,
  ShieldCheck,
  X,
  FileCheck,
  Receipt,
  CreditCard,
  Plus,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { FactorySale, SaleDocument } from "@/types/admin";

export const FactorySalesTab: React.FC = () => {
  const { session, factorySales, updateFactorySaleStatus, uploadSaleDocument } = useAdmin();

  const currentEmpresa = session.empresa || "ADAMA";

  const mySales = useMemo(() => {
    return factorySales.filter(
      (s) => s.empresa.toUpperCase() === currentEmpresa.toUpperCase()
    );
  }, [factorySales, currentEmpresa]);

  const [activeSubTab, setActiveSubTab] = useState<"TRANSITO" | "ENTREGADAS">("TRANSITO");
  const [selectedSaleForDocs, setSelectedSaleForDocs] = useState<FactorySale | null>(null);
  const [viewingDoc, setViewingDoc] = useState<{ doc: SaleDocument; saleNumero: string } | null>(null);

  // Upload modal state
  const [uploadDocType, setUploadDocType] = useState<"REMITO" | "FACTURA" | "RECIBO">("REMITO");
  const [uploadFileName, setUploadFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const transitSales = useMemo(
    () => mySales.filter((s) => s.estado === "EN_TRANSITO"),
    [mySales]
  );
  const deliveredSales = useMemo(
    () => mySales.filter((s) => s.estado === "ENTREGADA"),
    [mySales]
  );

  const displayedSales = activeSubTab === "TRANSITO" ? transitSales : deliveredSales;

  const handleTriggerUpload = (sale: FactorySale, docType: "REMITO" | "FACTURA" | "RECIBO") => {
    setSelectedSaleForDocs(sale);
    setUploadDocType(docType);
    setUploadFileName("");
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSaleForDocs) return;

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now.getFullYear()}`;

    const newDoc: SaleDocument = {
      tipo: uploadDocType,
      nombreArchivo: file.name,
      fechaSubida: formattedDate,
      subidoPor: "FABRICA",
      tamanoKb: Math.round(file.size / 1024) || 250,
      urlPdf: "#",
    };

    uploadSaleDocument(selectedSaleForDocs.id, newDoc);
    alert(`¡Documento PDF ${uploadDocType} subido exitosamente para la operación ${selectedSaleForDocs.numeroOperacion}!`);
  };

  const handleMarkDelivered = (sale: FactorySale) => {
    if (confirm(`¿Confirmás que la operación ${sale.numeroOperacion} ha sido entregada y conformada en destino?`)) {
      updateFactorySaleStatus(sale.id, "ENTREGADA");
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-campo-green-100 text-campo-green-800 text-xs font-black uppercase tracking-wider">
              Sección 4
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              4. Gestión de Ventas & Documentación Oficial
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Seguimiento de despachos y auditoría de los 4 comprobantes en PDF: <strong>Remito, Factura, Pago y Recibo Oficial</strong>.
          </p>
        </div>

        {/* Selector de Subpestañas 4a y 4b */}
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveSubTab("TRANSITO")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === "TRANSITO"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Truck className="w-4 h-4 text-amber-600" />
            <span>4a. Ventas en Tránsito ({transitSales.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("ENTREGADAS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === "ENTREGADAS"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>4b. Ventas Entregadas ({deliveredSales.length})</span>
          </button>
        </div>
      </div>

      {/* Input de archivo oculto para subir PDFs */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf"
        onChange={handleFileSelected}
        className="hidden"
      />

      {/* Listado de Ventas */}
      <div className="space-y-4">
        {displayedSales.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              {activeSubTab === "TRANSITO" ? <Truck className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>
            <h3 className="text-sm font-bold text-slate-700">
              No hay ventas {activeSubTab === "TRANSITO" ? "en tránsito actualmente" : "entregadas registradas"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Las ventas confirmadas por Campo Directo se listan aquí para asociar sus remitos, facturas, pagos y recibos.
            </p>
          </div>
        ) : (
          displayedSales.map((sale) => (
            <div
              key={sale.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden p-6 space-y-5"
            >
              {/* Encabezado de la Venta */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      sale.estado === "EN_TRANSITO"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {sale.estado === "EN_TRANSITO" ? <Truck className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-slate-900 text-base">
                        {sale.numeroOperacion}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          sale.estado === "EN_TRANSITO"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        }`}
                      >
                        {sale.estado === "EN_TRANSITO" ? "EN TRÁNSITO HACIA DESTINO" : "ENTREGADA & CONFORMADA"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Fecha de Venta: <strong>{sale.fechaVenta}</strong>
                      {sale.fechaEntregaEstimada && (
                        <span> &bull; Entrega Estimada: <strong>{sale.fechaEntregaEstimada}</strong></span>
                      )}
                      {sale.fechaEntregaReal && (
                        <span> &bull; Entregado el: <strong>{sale.fechaEntregaReal}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Total Facturado a Fábrica:
                    </span>
                    <span className="font-mono font-black text-xl text-slate-900">
                      USD {sale.totalFabricaUsd.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {sale.estado === "EN_TRANSITO" && (
                    <button
                      type="button"
                      onClick={() => handleMarkDelivered(sale)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Marcar Entregada</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Datos del Cliente y Productos */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
                <div className="sm:col-span-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Cliente Productor Intermediado:
                  </span>
                  <div className="font-bold text-slate-900 text-sm">{sale.clienteNombre}</div>
                  <div className="text-slate-500 font-mono mt-0.5">CUIT: {sale.clienteCuit}</div>
                  <div className="flex items-center gap-1 text-slate-600 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{sale.lugarEntrega}</span>
                  </div>
                </div>

                <div className="sm:col-span-8 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                    Detalle de Productos Despachados:
                  </span>
                  <div className="space-y-1">
                    {sale.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 text-xs"
                      >
                        <div className="font-semibold text-slate-900">
                          {it.producto} ({it.cantidad} {it.unidad})
                        </div>
                        <div className="font-mono font-bold text-slate-700">
                          USD {it.subtotalFabricaUsd.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* GESTIÓN DE LOS 4 COMPROBANTES PDF (4aI a 4aIV / 4b) */}
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 block mb-2.5">
                  Comprobantes Oficiales de la Operación (4 PDFs Requeridos):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* 4aI / 4b: PDF REMITO */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold uppercase text-slate-700">
                          4aI. PDF Remito
                        </span>
                        {sale.pdfRemito ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Disponible
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            Pendiente
                          </span>
                        )}
                      </div>
                      {sale.pdfRemito ? (
                        <p className="text-[11px] text-slate-600 truncate font-mono">
                          {sale.pdfRemito.nombreArchivo}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400">Subir remito conformado con firma</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      {sale.pdfRemito ? (
                        <button
                          type="button"
                          onClick={() => setViewingDoc({ doc: sale.pdfRemito!, saleNumero: sale.numeroOperacion })}
                          className="inline-flex items-center gap-1 text-xs font-bold text-campo-green-700 hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Remito</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTriggerUpload(sale, "REMITO")}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-campo-green"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Subir PDF</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 4aII / 4b: PDF FACTURA */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold uppercase text-slate-700">
                          4aII. PDF Factura
                        </span>
                        {sale.pdfFactura ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Disponible
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            Pendiente
                          </span>
                        )}
                      </div>
                      {sale.pdfFactura ? (
                        <p className="text-[11px] text-slate-600 truncate font-mono">
                          {sale.pdfFactura.nombreArchivo}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400">Factura A o B de provisión</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      {sale.pdfFactura ? (
                        <button
                          type="button"
                          onClick={() => setViewingDoc({ doc: sale.pdfFactura!, saleNumero: sale.numeroOperacion })}
                          className="inline-flex items-center gap-1 text-xs font-bold text-campo-green-700 hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Factura</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTriggerUpload(sale, "FACTURA")}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-campo-green"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Subir PDF</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 4aIII / 4b: PDF PAGO (Le aparecerá desde la gestión de CampoDirecto) */}
                  <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/40 shadow-xs flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold uppercase text-emerald-900 flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                          <span>4aIII. PDF Pago</span>
                        </span>
                        {sale.pdfPago ? (
                          <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded-full">
                            Pagado CD
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                            En Proceso
                          </span>
                        )}
                      </div>
                      {sale.pdfPago ? (
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-mono text-emerald-950 font-bold truncate">
                            {sale.pdfPago.nombreArchivo}
                          </p>
                          <span className="text-[10px] text-emerald-800 block">
                            Cargado por Campo Directo ({sale.pdfPago.fechaSubida})
                          </span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500">
                          Le aparecerá cargado desde la gestión de usuario CampoDirecto al emitir el pago.
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-emerald-200 flex items-center justify-between">
                      {sale.pdfPago ? (
                        <button
                          type="button"
                          onClick={() => setViewingDoc({ doc: sale.pdfPago!, saleNumero: sale.numeroOperacion })}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Orden de Pago</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Pendiente de acreditación</span>
                      )}
                    </div>
                  </div>

                  {/* 4aIV / 4b: PDF RECIBO OFICIAL */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold uppercase text-slate-700">
                          4aIV. PDF Recibo Oficial
                        </span>
                        {sale.pdfRecibo ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Disponible
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            Pendiente
                          </span>
                        )}
                      </div>
                      {sale.pdfRecibo ? (
                        <p className="text-[11px] text-slate-600 truncate font-mono">
                          {sale.pdfRecibo.nombreArchivo}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400">Recibo oficial de cobranza emitido</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      {sale.pdfRecibo ? (
                        <button
                          type="button"
                          onClick={() => setViewingDoc({ doc: sale.pdfRecibo!, saleNumero: sale.numeroOperacion })}
                          className="inline-flex items-center gap-1 text-xs font-bold text-campo-green-700 hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Recibo</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTriggerUpload(sale, "RECIBO")}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-campo-green"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Subir PDF</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {sale.observaciones && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                  <strong>Logística & Chofer:</strong> {sale.observaciones}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Visor Modal de Comprobante PDF */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-campo-green-400" />
                <div>
                  <h3 className="text-sm font-bold">{viewingDoc.doc.nombreArchivo}</h3>
                  <span className="text-[11px] text-slate-400">
                    Operación: {viewingDoc.saleNumero} &bull; Tipo: {viewingDoc.doc.tipo}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto border border-slate-200">
                <FileText className="w-8 h-8 text-campo-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Documento Digital Verificado</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Subido por: <strong>{viewingDoc.doc.subidoPor === "CAMPO_DIRECTO" ? "Campo Directo SRL" : currentEmpresa}</strong> el {viewingDoc.doc.fechaSubida} ({viewingDoc.doc.tamanoKb || 250} KB).
                </p>
              </div>

              <div className="pt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => alert(`Iniciando descarga segura de ${viewingDoc.doc.nombreArchivo}`)}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-campo-green-600 hover:bg-campo-green-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Archivo PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingDoc(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
