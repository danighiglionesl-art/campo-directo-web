"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Inbox,
  Send,
  MapPin,
  CreditCard,
  LogOut,
  Search,
  ExternalLink,
  ShieldCheck,
  X,
  Building2,
  Trash2,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminTab } from "@/types/admin";
import { Logo } from "@/components/ui/Logo";

export const AdminNavigation: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    session,
    logout,
    clearAllData,
    clients,
    quotationsReceived,
    quotationsSent,
    establishments,
    paymentMethods,
    stats,
    factories,
  } = useAdmin();

  const tabs: {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badgeColor?: string;
  }[] = [
    {
      id: "dashboard",
      label: "Métricas",
      icon: LayoutDashboard,
    },
    {
      id: "usuarios",
      label: "1. Usuarios",
      icon: Users,
      count: clients.length,
    },
    {
      id: "cotizaciones-recibidas",
      label: "2. Cotizaciones Recibidas",
      icon: Inbox,
      count: stats.cotizacionesPendientes,
      badgeColor:
        stats.cotizacionesPendientes > 0
          ? "bg-amber-500 text-slate-950 font-bold"
          : "bg-slate-200 text-slate-700",
    },
    {
      id: "cotizaciones-enviadas",
      label: "3. Cotizaciones Enviadas",
      icon: Send,
      count: quotationsSent.length,
    },
    {
      id: "establecimientos",
      label: "4. Establecimientos",
      icon: MapPin,
      count: establishments.length,
    },
    {
      id: "formas-pago",
      label: "5. Formas de Pago",
      icon: CreditCard,
      count: paymentMethods.filter((p) => p.activo).length,
    },
    {
      id: "fabricas",
      label: "6. Fábricas & Proveedores",
      icon: Building2,
      count: factories.length,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Navbar principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Marca */}
          <div className="flex items-center gap-3">
            <Link
              href="/panel"
              className="flex items-center gap-2"
              onClick={() => setActiveTab("dashboard")}
            >
              <Logo width={140} height={36} />
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-campo-green-50 text-campo-green-800 text-xs font-semibold border border-campo-green-200">
              <ShieldCheck className="w-3.5 h-3.5 text-campo-green-600" />
              Panel de Control
            </span>
          </div>

          {/* Buscador Global Rápido */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por CUIT, productor, cotización, campo..."
                className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-campo-green-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Acciones de usuario y salir */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-campo-green-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title="Abrir sitio web público en otra pestaña"
            >
              <span>Ver Web</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 leading-none">
                  {session.username || "Operador"}
                </span>
                <span className="text-[10px] text-campo-green-700 flex items-center justify-end gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-campo-green-500 animate-pulse" />
                  Conectado
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (confirm("¿Confirmás vaciar y limpiar todos los datos de prueba del panel para iniciar en blanco?")) {
                    clearAllData();
                    alert("¡Panel de control vaciado con éxito! Ahora está 100% limpio y listo para operar.");
                  }
                }}
                title="Limpiar datos de prueba"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-amber-800 bg-slate-100 hover:bg-amber-100/80 border border-slate-200 hover:border-amber-300 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">Limpiar Demo</span>
              </button>

              <button
                type="button"
                onClick={logout}
                title="Cerrar sesión"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Buscador móvil si la pantalla es chica */}
      <div className="md:hidden px-4 pb-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar CUIT, cliente, cotización..."
            className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-campo-green-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Barra de Pestañas / Módulos de Control */}
      <div className="bg-slate-50/90 border-t border-slate-200 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 py-1.5 min-w-max" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-campo-green-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                  <span>{tab.label}</span>
                  {typeof tab.count === "number" && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                        isActive
                          ? "bg-white/25 text-white"
                          : tab.badgeColor || "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
