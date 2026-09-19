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
    deriveQuotationToFactory,
    factories,
  } = useAdmin();

  const [localSearch, setLocalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");
  const [operationFilter, setOperationFilter] = useState<string>("TODAS");
  const [empresaFilter, setEmpresaFilter] = useState<string>("TODAS");
  const [selectedQuote, setSelectedQuote] = useState<AdminQuotationReceived | null>(null);

  // Derivación a Fábrica
  const [derivingQuote, setDerivingQuote] = useState<AdminQuotationReceived | null>(null);
  const [deriveTargetEmpresa, setDeriveTargetEmpresa] = useState<string>("");
  const [deriveNotes, setDeriveNotes] = useState<string>("");
  const [deriveSuccessMsg, setDeriveSuccessMsg] = useState<string>("");

  const queryEffective = (localSearch || searchQuery).toLowerCase().trim();

  // Lista de empresas detectadas en las cotizaciones
  const availableEmpresas = useMemo(() => {
    const fromQuotes = quotationsReceived
      .flatMap((q) => q.items?.map((i) => i.empresa) || [])
      .filter(Boolean);
    const fromFactories = factories.map((f) => f.empresa);
    return Array.from(new Set([...fromQuotes, ...fromFactories])).sort();
  }, [quotationsReceived, factories]);

  const filteredQuotes = useMemo(() => {
    return quotationsReceived.filter((q) => {
      // Filtro texto
      if (queryEffective) {
        const text = `${q.numero} ${q.clienteNombre} ${q.clienteCuit} ${q.establecimientoDestino} ${q.formaPagoSolicitada}`.toLowerCase();
        const itemsText = q.items?.map((i) => `${i.nombre} ${i.categoriaOVariedad} ${i.empresa || ""}`).join(" ").toLowerCase() || "";
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

      // Filtro empresa
      if (empresaFilter !== "TODAS") {
        const matchesEmpresa = q.items?.some(
          (it) => (it.empresa || "").toUpperCase() === empresaFilter.toUpperCase()
        );
        if (!matchesEmpresa) return false;
      }

      return true;
    });
  }, [quotationsReceived, queryEffective, statusFilter, operationFilter, empresaFilter]);

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

          {/* Filtro Empresa */}
          <select
            value={empresaFilter}
            onChange={(e) => setEmpresaFilter(e.target.value)}
            className="p-2 text-xs rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 max-w-[180px]"
            title="Filtrar pedidos por empresa proveedora de insumos/semillas"
          >
            <option value="TODAS">Todas las Empresas</option>
            {availableEmpresas.map((emp) => (
              <option key={emp} value={emp}>
                {emp}
              </option>
            ))}
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
                        {/* Botón Derivar a Fábrica (Paso intermedio Campo Directo) */}
                        <button
                          type="button"
                          onClick={() => {
                            setDerivingQuote(q);
                            const suggestedEmpresa = q.items?.[0]?.empresa || factories[0]?.empresa || "ADAMA";
                            setDeriveTargetEmpresa(suggestedEmpresa);
                            setDeriveNotes("");
                            setDeriveSuccessMsg("");
                          }}
                          title="Derivar al Panel de la Fábrica (paso intermedio Campo Directo)"
                          className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Building2 className="w-3 h-3" />
                          <span className="hidden md:inline">A Fábrica</span>
                        </button>

                        {/* Botón Responder con Propuesta */}
                        {onAnswerWithProposal && (
                          <button
                            type="button"
                            onClick={() => onAnswerWithProposal(q)}
                            title="Responder y Cotizar Oficialmente al Cliente"
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

      {/* Modal de Derivación Intermedia a Fábrica */}
      {derivingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    Derivar Cotización {derivingQuote.numero} a Fábrica
                  </h3>
                  <p className="text-xs text-slate-300">
                    Paso intermedio Campo Directo: el pedido será enviado al panel de la empresa proveedora.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDerivingQuote(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {deriveSuccessMsg ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{deriveSuccessMsg}</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    La fábrica ya tiene disponible este requerimiento en su sección <strong>Cotizaciones Recibidas</strong> junto a la ubicación de entrega para cotizar.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setDerivingQuote(null)}
                      className="px-5 py-2 rounded-xl bg-campo-green-600 text-white font-semibold text-xs"
                    >
                      Entendido
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!deriveTargetEmpresa) {
                      return alert("Por favor seleccioná la fábrica proveedora.");
                    }
                    deriveQuotationToFactory(
                      derivingQuote.id,
                      deriveTargetEmpresa,
                      deriveNotes
                    );
                    setDeriveSuccessMsg(
                      `¡Cotización enviada exitosamente al panel de ${deriveTargetEmpresa}!`
                    );
                  }}
                  className="space-y-4"
                >
                  {/* Selector de Fábrica Destino */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Empresa / Fábrica Destino *
                    </label>
                    <select
                      required
                      value={deriveTargetEmpresa}
                      onChange={(e) => setDeriveTargetEmpresa(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-campo-green-500"
                    >
                      <option value="">-- Seleccionar Fábrica Aliada --</option>
                      {factories.map((f) => (
                        <option key={f.id} value={f.empresa}>
                          {f.empresa} ({f.razonSocial})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Detalle de Productos a Cotizar */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-700 uppercase tracking-wider block mb-2">
                      Productos Solicitados por el Cliente:
                    </span>
                    <div className="space-y-1.5">
                      {derivingQuote.items?.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{it.nombre}</span>
                            <span className="text-slate-500 ml-2">({it.categoriaOVariedad})</span>
                          </div>
                          <span className="font-bold text-campo-green-700 font-mono">
                            {it.cantidad} {it.unidad}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lugar de Entrega Georreferenciado */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 uppercase tracking-wider mb-2">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <span>Lugar de Entrega para la Fábrica:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <div>
                        <span className="text-slate-400 block">Establecimiento:</span>
                        <strong className="text-slate-900">
                          {derivingQuote.establecimientoDestino || "Establecimiento Principal"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Forma de Pago Requerida:</span>
                        <strong className="text-slate-900">{derivingQuote.formaPagoSolicitada}</strong>
                      </div>
                      {derivingQuote.coordenadasGps && (
                        <div className="col-span-2">
                          <span className="text-slate-400 block">Coordenadas GPS:</span>
                          <span className="font-mono">{derivingQuote.coordenadasGps}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Instrucciones internas Campo Directo */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Instrucciones o Condiciones para la Fábrica (Opcional):
                    </label>
                    <textarea
                      rows={2}
                      value={deriveNotes}
                      onChange={(e) => setDeriveNotes(e.target.value)}
                      placeholder="Ej: Cliente con pago contado contra entrega. Bonificar flete a Pergamino."
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-campo-green-500"
                    />
                  </div>

                  {/* Footer modal */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDerivingQuote(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-md transition-colors cursor-pointer"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Enviar al Panel de {deriveTargetEmpresa || "la Fábrica"}</span>
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
