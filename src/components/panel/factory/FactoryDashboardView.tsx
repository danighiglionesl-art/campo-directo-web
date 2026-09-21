"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  Package,
  Inbox,
  Truck,
  DollarSign,
  LogOut,
  ArrowLeft,
  ExternalLink,
  ShieldAlert,
  User,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { FactoryTab } from "@/types/admin";
import { Logo } from "@/components/ui/Logo";

// Importación de las 5 secciones oficiales del Panel Fábrica
import { FactoryProfileTab } from "./FactoryProfileTab";
import { FactoryProductsTab } from "./FactoryProductsTab";
import { FactoryQuotationsTab } from "./FactoryQuotationsTab";
import { FactorySalesTab } from "./FactorySalesTab";
import { FactoryAccountTab } from "./FactoryAccountTab";

export const FactoryDashboardView: React.FC = () => {
  const {
    session,
    logout,
    returnToAdmin,
    factoryActiveTab,
    setFactoryActiveTab,
    factoryProducts,
    factoryQuotations,
    factorySales,
    factoryMovements,
  } = useAdmin();

  const currentEmpresa = session.empresa || "ADAMA";

  // Counts for tabs
  const productsCount = factoryProducts.filter(
    (p) => p.empresa.toUpperCase() === currentEmpresa.toUpperCase()
  ).length;

  const pendingQuotesCount = factoryQuotations.filter(
    (q) =>
      q.empresa.toUpperCase() === currentEmpresa.toUpperCase() &&
      q.estado === "DERIVADA_A_FABRICA"
  ).length;

  const transitSalesCount = factorySales.filter(
    (s) =>
      s.empresa.toUpperCase() === currentEmpresa.toUpperCase() &&
      s.estado === "EN_TRANSITO"
  ).length;

  const tabs: {
    id: FactoryTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badgeColor?: string;
  }[] = [
    {
      id: "mis-datos",
      label: "Mis Datos",
      icon: User,
    },
    {
      id: "mis-productos",
      label: "Mis Productos",
      icon: Package,
      count: productsCount,
      badgeColor: "bg-slate-200 text-slate-800",
    },
    {
      id: "cotizaciones",
      label: "Cotizaciones",
      icon: Inbox,
      count: pendingQuotesCount,
      badgeColor: pendingQuotesCount > 0 ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-700",
    },
    {
      id: "ventas",
      label: "Ventas",
      icon: Truck,
      count: transitSalesCount,
      badgeColor: transitSalesCount > 0 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700",
    },
    {
      id: "cuenta-corriente",
      label: "Cuenta Corriente",
      icon: DollarSign,
    },
  ];

  const isOperatorImpersonating = session.username === "CampoDirecto";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Top Banner if CampoDirecto operator is impersonating */}
      {isOperatorImpersonating && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 max-w-4xl">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-slate-950" />
            <span>
              <strong>Modo Simulación Operador:</strong> Estás visualizando la sesión de la empresa{" "}
              <span className="underline decoration-2">{currentEmpresa}</span> con permisos de administración.
            </span>
          </div>
          <button
            onClick={returnToAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 text-white rounded-lg hover:bg-slate-800 text-xs font-bold transition-all shadow-sm flex-shrink-0 ml-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Panel Campo Directo</span>
          </button>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Brand Title */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center group">
                <Logo size="md" />
              </Link>
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                    <Building2 className="w-3 h-3" />
                    Portal Fábrica
                  </span>
                  <span className="text-xs text-slate-500 hidden md:inline">
                    Gestión Integral Fábrica
                  </span>
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5 mt-0.5">
                  <span>{currentEmpresa}</span>
                </div>
              </div>
            </div>

            {/* Right actions: Link to Web, User info, Logout */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                title="Abrir portal público de Campo Directo"
              >
                <span>Ver Portal Web</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              {/* User Session Pill */}
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  {currentEmpresa.slice(0, 2)}
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-slate-800 leading-none">
                    {session.username}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                    {isOperatorImpersonating ? "Operador CD" : "Usuario Fábrica"}
                  </div>
                </div>
              </div>

              {/* Exit button */}
              {isOperatorImpersonating ? (
                <button
                  onClick={returnToAdmin}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200"
                  title="Volver al panel general de Campo Directo"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Salir a Panel Operador</span>
                </button>
              ) : (
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 transition-all border border-red-200"
                  title="Cerrar Sesión de Fábrica"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
              )}
            </div>
          </div>

          {/* Horizontal Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5 -mb-px border-t border-slate-100">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = factoryActiveTab === t.id;

              return (
                <button
                  key={t.id}
                  onClick={() => setFactoryActiveTab(t.id)}
                  className={`flex items-center gap-2.5 px-4 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md ring-2 ring-emerald-400"
                      : "bg-emerald-700 hover:bg-emerald-600 text-white shadow-xs"
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-emerald-400" : "text-white"}`} />
                  <span>{t.label}</span>

                  {t.count !== undefined && t.count > 0 && (
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-emerald-500 text-white"
                          : "bg-white text-emerald-900 shadow-2xs"
                      }`}
                    >
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {factoryActiveTab === "mis-datos" && <FactoryProfileTab />}
        {factoryActiveTab === "mis-productos" && <FactoryProductsTab />}
        {factoryActiveTab === "cotizaciones" && <FactoryQuotationsTab />}
        {factoryActiveTab === "ventas" && <FactorySalesTab />}
        {factoryActiveTab === "cuenta-corriente" && <FactoryAccountTab />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Campo Directo SRL &bull; Panel de Fábrica &bull; <strong>{currentEmpresa}</strong>
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Conexión Segura Mayorista &bull; https://campodirecto.ar/panel
          </span>
        </div>
      </footer>
    </div>
  );
};
