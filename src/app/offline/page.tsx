"use client";

import React from "react";
import Image from "next/image";
import { WifiOff, RefreshCw } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-10">
        {/* Logo oficial */}
        <div className="flex justify-center mb-6">
          <Logo className="h-16 w-auto" priority />
        </div>

        {/* Ícono de estado sin conexión */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <WifiOff className="w-8 h-8" />
        </div>

        {/* Títulos requeridos */}
        <h1 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
          Estás sin conexión
        </h1>
        <p className="text-sm text-slate-600 mb-8 leading-relaxed">
          Cuando recuperes la conexión podrás continuar utilizando Campo Directo.
        </p>

        {/* Botón de reintento */}
        <button
          type="button"
          onClick={handleRetry}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-campo-green hover:bg-campo-green-600 active:bg-campo-green-700 transition-colors rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-campo-green focus:ring-offset-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reintentar</span>
        </button>
      </div>
    </div>
  );
}
