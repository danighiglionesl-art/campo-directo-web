"use client";

import React, { useState, useMemo } from "react";
import {
  Inbox,
  Search,
  FileSpreadsheet,
  MessageCircle,
  Eye,
  CheckCircle2,
  Clock,
  Send,
  MapPin,
  Building2,
  Trash2,
  X,
  ExternalLink,
  ChevronDown,
  Filter,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminQuotationReceived } from "@/types/admin";

export const AdminQuotationsReceivedTab: React.FC<{
  onAnswerWithProposal?: (quotation: AdminQuotationReceived) => void;
}> = ({ onAnswerWithProposal }) => {
  const {
    quotationsReceived,
    updateQuotationReceivedStatus,
    deleteQuotationReceived,
    exportQuotationsReceivedExcel,
    searchQuery,
  } = useAdmin();

  const [localSearch, setLocalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");
  const [operationFilter, setOperationFilter] = useState<string>("TODAS");
  const [selectedQuote, setSelectedQuote] = useState<AdminQuotationReceived | null>(null);

  const queryEffective = (localSearch || searchQuery).toLowerCase().trim();

  const filteredQuotes = useMemo(() => {
    return quotationsReceived.filter((q) => {
      // Filtro texto
      if (queryEffective) {
        const text = `${q.numero} ${q.clienteNombre} ${q.clienteCuit} ${q.establecimientoDestino} ${q.formaPagoSolicitada}`.toLowerCase();
        const itemsText = q.items?.map((i) => `${i.nombre} ${i.categoriaOVariedad}`).join(" ").toLowerCase() || "";
        if (!text.includes(queryEffective) && !itemsText.includes(queryEffective)) {
          return false;
        }
      }

      // Filtro estado
      if (statusFilter !== "TODOS" && q.estado !== statusFilter) {
        return false;
      }

      // Filtro operación
      if (operationFilter !== "TODAS" && q.operacion !== operationFilter) {
        return false;
      }

      return true;
    });
  }, [quotationsReceived, queryEffective, statusFilter, operationFilter]);

  const handleStatusChange = (
    id: string,
    newStatus: AdminQuotationReceived["estado"]
  ) => {
    updateQuotationReceivedStatus(id, newStatus);
    if (selectedQuote?.id === id) {
      setSelectedQuote((prev) => (prev ? { ...prev, estado: newStatus } : null));
    }
  };

  const handleDelete = (id: string, numero: string) => {
    if (confirm(`¿Eliminar la solicitud de cotización ${numero}?`)) {
      deleteQuotationReceived(id);
      if (selectedQuote?.id === id) setSelectedQuote(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="w-6 h-6 text-campo-green-600" />
            <h1 className="text-xl font-bold text-slate-900">
              2. Cotizaciones Recibidas ({quotationsReceived.length})
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pedidos de cotización de insumos, semillas y granos solicitados por productores desde el sitio web o portal.
          </p>
        </div>

        <button
          type="button"
          onClick={exportQuotationsReceivedExcel}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Exportar a Excel</span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Buscador */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Buscar por N°, cliente, insumo..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-campo-green-500"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 text-xs rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="NUEVA">NUEVA</option>
            <option value="EN EVALUACIÓN">EN EVALUACIÓN</option>
            <option value="COTIZADA">COTIZADA</option>
            <option value="CERRADA">CERRADA</option>
            <option value="DESESTIMADA">DESESTIMADA</option>
          </select>

          {/* Filtro Operación */}
          <select
            value={operationFilter}
            onChange={(e) => setOperationFilter(e.target.value)}
            className="p-2 text-xs rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
          >
            <option value="TODAS">Todas las Operaciones</option>
            <option value="COMPRA">COMPRA (Productor Compra)</option>
            <option value="VENTA">VENTA (Productor Vende)</option>
          </select>
        </div>

        <span className="text-xs text-slate-500">
          Mostrando <strong>{filteredQuotes.length}</strong> solicitudes
        </span>
      </div>

      {/* Tabla de Cotizaciones Recibidas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Número & Fecha</th>
                <th className="py-3 px-4">Operación</th>
                <th className="py-3 px-4">Productor / Razón Social</th>
                <th className="py-3 px-4">Productos Solicitados</th>
                <th className="py-3 px-4">Destino & Pago</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    {quotationsReceived.length === 0 ? (
                      <div className="space-y-2">
                        <p className="font-semibold text-slate-700">No hay cotizaciones solicitadas por productores aún.</p>
                        <p className="text-xs text-slate-400">Cuando un productor cargue un pedido de cotización en la web pública o en su portal, aparecerá automáticamente acá.</p>
                      </div>
                    ) : (
                      "No hay cotizaciones recibidas con esos filtros."
                    )}
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded block w-fit">
                        {q.numero}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">{q.fecha}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          q.operacion === "VENTA"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {q.operacion === "VENTA" ? "VENTA" : "COMPRA"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{q.clienteNombre}</div>
                      <div className="text-[11px] text-slate-500">CUIT: {q.clienteCuit}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="space-y-0.5">
                        {q.items?.map((it, idx) => (
                          <div key={idx} className="truncate text-slate-700 font-medium">
                            &bull; <strong>{it.nombre}</strong> ({it.cantidad} {it.unidad})
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium truncate max-w-[180px]">
                        {q.establecimientoDestino || "Principal"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Pago: <strong>{q.formaPagoSolicitada}</strong>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={q.estado}
                        onChange={(e) =>
                          handleStatusChange(
                            q.id,
                            e.target.value as AdminQuotationReceived["estado"]
                          )
                        }
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          q.estado === "NUEVA"
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : q.estado === "EN EVALUACIÓN"
                            ? "bg-blue-50 text-blue-800 border-blue-300"
                            : q.estado === "COTIZADA"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-slate-100 text-slate-700 border-slate-300"
                        }`}
                      >
                        <option value="NUEVA">NUEVA</option>
                        <option value="EN EVALUACIÓN">EN EVALUACIÓN</option>
                        <option value="COTIZADA">COTIZADA</option>
                        <option value="CERRADA">CERRADA</option>
                        <option value="DESESTIMADA">DESESTIMADA</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Botón Responder con Propuesta */}
                        {onAnswerWithProposal && (
                          <button
                            type="button"
                            onClick={() => onAnswerWithProposal(q)}
                            title="Responder y Cotizar Oficialmente"
                            className="px-2.5 py-1 rounded-lg bg-campo-green-600 hover:bg-campo-green-500 text-white font-semibold text-[11px] flex items-center gap-1 shadow-sm"
                          >
                            <Send className="w-3 h-3" />
                            <span className="hidden md:inline">Cotizar</span>
                          </button>
                        )}

                        {q.clienteTelefono && (
                          <a
                            href={`https://wa.me/${q.clienteTelefono.replace(/\D/g, "")}?text=${encodeURIComponent(
                              `Hola ${q.clienteNombre}, te contactamos desde Campo Directo en relación a tu cotización ${q.numero}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Escribir por WhatsApp"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedQuote(q)}
                          title="Ver Detalle de la Solicitud"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(q.id, q.numero)}
                          title="Eliminar"
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETALLE DE COTIZACIÓN RECIBIDA */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Cabecera */}
            <div className="p-6 bg-gradient-to-r from-campo-green-900 to-slate-900 text-white rounded-t-2xl flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/20">
                    {selectedQuote.numero}
                  </span>
                  <span className="text-xs text-slate-300">Fecha: {selectedQuote.fecha}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-campo-yellow text-slate-950">
                    {selectedQuote.operacion}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-2">
                  {selectedQuote.clienteNombre}
                </h2>
                <p className="text-xs text-campo-green-200">
                  CUIT: {selectedQuote.clienteCuit} &bull; Estado: {selectedQuote.estado}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedQuote(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-5 text-xs text-slate-700">
              {/* Productos Requeridos */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  Productos / Insumos Solicitados ({selectedQuote.items?.length || 0})
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {selectedQuote.items?.map((it, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{it.nombre}</span>
                        <div className="text-slate-500 mt-0.5">
                          Rubro: {it.categoriaOVariedad} &bull; Marca: {it.empresa}
                          {it.detalle && <p className="text-slate-600 mt-0.5 italic">{it.detalle}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-campo-green-800 bg-campo-green-50 px-2.5 py-1 rounded-lg border border-campo-green-200">
                          {it.cantidad} {it.unidad}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Entrega y Pago */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-campo-green-600" />
                    Establecimiento de Entrega
                  </h4>
                  <p className="font-semibold text-slate-800">
                    {selectedQuote.establecimientoDestino || "Establecimiento Principal"}
                  </p>
                  {selectedQuote.tipoDescarga && (
                    <p className="text-slate-500">
                      <strong>Tipo descarga:</strong> {selectedQuote.tipoDescarga}
                    </p>
                  )}
                  {selectedQuote.referenciaAcceso && (
                    <p className="text-slate-500">
                      <strong>Acceso:</strong> {selectedQuote.referenciaAcceso}
                    </p>
                  )}
                  {selectedQuote.coordenadasGps && (
                    <div className="pt-1">
                      <a
                        href={
                          selectedQuote.linkMaps ||
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            selectedQuote.coordenadasGps
                          )}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-campo-green-700 font-bold hover:underline"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Ver GPS en Google Maps ({selectedQuote.coordenadasGps})</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900">Condición Comercial</h4>
                  <p>
                    <strong>Forma de Pago solicitada:</strong> {selectedQuote.formaPagoSolicitada}
                  </p>
                  <div className="pt-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Cambiar Estado:
                    </label>
                    <select
                      value={selectedQuote.estado}
                      onChange={(e) =>
                        handleStatusChange(
                          selectedQuote.id,
                          e.target.value as AdminQuotationReceived["estado"]
                        )
                      }
                      className="w-full p-2 rounded-lg border border-slate-300 font-semibold"
                    >
                      <option value="NUEVA">NUEVA</option>
                      <option value="EN EVALUACIÓN">EN EVALUACIÓN</option>
                      <option value="COTIZADA">COTIZADA</option>
                      <option value="CERRADA">CERRADA</option>
                      <option value="DESESTIMADA">DESESTIMADA</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              {selectedQuote.observaciones && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <span className="font-bold block text-[10px] uppercase tracking-wider mb-0.5">
                    Observaciones del Productor:
                  </span>
                  <p>{selectedQuote.observaciones}</p>
                </div>
              )}
            </div>

            {/* Footer con acciones */}
            <div className="p-4 bg-slate-50 rounded-b-2xl border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div>
                {selectedQuote.clienteTelefono && (
                  <a
                    href={`https://wa.me/${selectedQuote.clienteTelefono.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold text-xs transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Productor</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                {onAnswerWithProposal && (
                  <button
                    type="button"
                    onClick={() => {
                      onAnswerWithProposal(selectedQuote);
                      setSelectedQuote(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-campo-green-600 hover:bg-campo-green-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>Responder con Cotización Oficial</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs"
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
