"use client";

import React from "react";
import {
  Users,
  Inbox,
  Send,
  MapPin,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowUpRight,
  MessageCircle,
  Plus,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export const AdminDashboardView: React.FC<{
  onOpenNewProposal?: () => void;
  onOpenNewClient?: () => void;
}> = ({ onOpenNewProposal, onOpenNewClient }) => {
  const {
    stats,
    setActiveTab,
    quotationsReceived,
    clients,
    establishments,
    exportClientsExcel,
    exportQuotationsReceivedExcel,
    exportQuotationsSentExcel,
  } = useAdmin();

  // Calcular hectáreas totales bajo gestión
  const totalHectareas = establishments.reduce(
    (acc, e) => acc + (Number(e.hectareas) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Encabezado del Dashboard con saludo y acciones directas */}
      <div className="bg-gradient-to-r from-campo-green-800 to-campo-green-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-campo-yellow-light text-xs font-semibold uppercase tracking-wider mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              Panel de Control Central
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Mostrador Comercial Campo Directo
            </h1>
            <p className="text-sm text-campo-green-100 mt-1 max-w-2xl">
              Monitoreo en tiempo real de productores registrados, cotizaciones solicitadas,
              propuestas comerciales emitidas y establecimientos agrícolas georreferenciados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenNewProposal && (
              <button
                type="button"
                onClick={onOpenNewProposal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-campo-yellow hover:bg-campo-yellow-dark text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Cotización Comercial</span>
              </button>
            )}

            {onOpenNewClient && (
              <button
                type="button"
                onClick={onOpenNewClient}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>+ Nuevo Productor</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Tarjetas de Métricas Clave (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Usuarios Registrados */}
        <div
          onClick={() => setActiveTab("usuarios")}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-campo-green-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              1. Usuarios Registrados
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.totalClientes}
            </span>
            <span className="text-xs font-semibold text-emerald-600">Productores activos</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Fichas completas & CUIT</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-campo-green-600 transition-colors" />
          </div>
        </div>

        {/* KPI 2: Cotizaciones Recibidas */}
        <div
          onClick={() => setActiveTab("cotizaciones-recibidas")}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              2. Cotizaciones Recibidas
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {quotationsReceived.length}
            </span>
            {stats.cotizacionesPendientes > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                {stats.cotizacionesPendientes} pendientes
              </span>
            ) : (
              <span className="text-xs font-semibold text-emerald-600">Al día</span>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Requerimientos de compra/venta</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
        </div>

        {/* KPI 3: Cotizaciones Enviadas (USD) */}
        <div
          onClick={() => setActiveTab("cotizaciones-enviadas")}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-campo-green-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              3. Cotizaciones Enviadas
            </span>
            <div className="w-10 h-10 rounded-xl bg-campo-green-50 text-campo-green-700 flex items-center justify-center group-hover:bg-campo-green-600 group-hover:text-white transition-colors">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              USD ${stats.cotizacionesEnviadasTotalUsd.toLocaleString("es-AR")}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Con presupuestos & adjuntos</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-campo-green-600 transition-colors" />
          </div>
        </div>

        {/* KPI 4: Establecimientos y Hectáreas */}
        <div
          onClick={() => setActiveTab("establecimientos")}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              4. Establecimientos
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.establecimientosTotales}
            </span>
            <span className="text-xs font-semibold text-purple-700">
              {totalHectareas.toLocaleString("es-AR")} Has.
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>GPS satelital & descarga</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
          </div>
        </div>
      </div>

      {/* 2 Columnas de Resumen Operativo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda (2/3): Cotizaciones Recibidas Recientes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-campo-green-600" />
              <h2 className="text-base font-bold text-slate-900">
                Últimas Cotizaciones Solicitadas por Productores
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("cotizaciones-recibidas")}
              className="text-xs font-semibold text-campo-green-700 hover:text-campo-green-800"
            >
              Ver todas ({quotationsReceived.length}) &rarr;
            </button>
          </div>

          {quotationsReceived.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">Sin cotizaciones recibidas</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Las solicitudes de cotización enviadas por productores desde la web o el portal aparecerán acá en tiempo real.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {quotationsReceived.slice(0, 4).map((q) => (
                <div
                  key={q.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl px-2 -mx-2 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {q.numero}
                      </span>
                      <span className="text-xs text-slate-500">{q.fecha}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          q.operacion === "VENTA"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {q.operacion === "VENTA" ? "PRODUCTOR VENDE" : "PRODUCTOR COMPRA"}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          q.estado === "NUEVA"
                            ? "bg-amber-100 text-amber-800"
                            : q.estado === "EN EVALUACIÓN"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {q.estado}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-800">
                      {q.clienteNombre} <span className="text-xs text-slate-500 font-normal">({q.clienteCuit})</span>
                    </p>

                    <p className="text-xs text-slate-600">
                      <strong>Ítems:</strong>{" "}
                      {q.items?.map((it) => `${it.nombre} (${it.cantidad} ${it.unidad})`).join(", ")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab("cotizaciones-recibidas")}
                      className="px-3 py-1.5 rounded-lg bg-campo-green-50 hover:bg-campo-green-100 text-campo-green-800 text-xs font-semibold border border-campo-green-200 transition-colors"
                    >
                      Ver Detalle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha (1/3): Productores Recientes & Acceso a WhatsApp */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-campo-green-600" />
              <h2 className="text-base font-bold text-slate-900">Productores</h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("usuarios")}
              className="text-xs font-semibold text-campo-green-700 hover:text-campo-green-800"
            >
              Ver todos &rarr;
            </button>
          </div>

          {clients.length === 0 ? (
            <div className="py-8 px-3 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">Sin productores registrados</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Creá el primer productor o esperá que se registren desde el portal.
              </p>
              {onOpenNewClient && (
                <button
                  type="button"
                  onClick={onOpenNewClient}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-campo-green-50 hover:bg-campo-green-100 text-campo-green-800 text-xs font-semibold border border-campo-green-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Nuevo Productor</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {clients.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{c.razonSocial}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {c.nombres} {c.apellidos} &bull; {c.localidad}, {c.provincia}
                    </p>
                  </div>

                  {c.whatsapp && (
                    <a
                      href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                        `Hola ${c.nombres}, te contactamos desde el equipo comercial de Campo Directo.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Enviar WhatsApp directo al productor"
                      className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors flex-shrink-0"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Botones de Descarga Directa Excel */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-600 mb-2">Exportación Rápida (.xlsx):</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={exportClientsExcel}
                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Usuarios</span>
              </button>
              <button
                type="button"
                onClick={exportQuotationsReceivedExcel}
                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                <span>Cotizaciones</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
