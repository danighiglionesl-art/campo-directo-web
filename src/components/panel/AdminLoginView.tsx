"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export const AdminLoginView: React.FC = () => {
  const { login } = useAdmin();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    setTimeout(() => {
      const res = login(usuario, password);
      if (!res.success) {
        setErrorMsg(res.error || "Credenciales inválidas.");
      }
      setIsLoading(false);
    }, 350);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-br from-slate-900 via-slate-800 to-campo-green-950 text-slate-100">
      {/* Glow ambiental */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-campo-green-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Encabezado: Logo de Campo Directo centrado en PNG */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="flex items-center justify-center mb-5">
            <Image
              src="/images/logo-transparent.png"
              alt="Campo Directo"
              width={360}
              height={120}
              priority
              className="h-16 sm:h-20 w-auto object-contain filter drop-shadow-lg select-none"
            />
          </div>

          {/* Acceso Panel de Control centrado */}
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-campo-green-500/20 text-campo-green-300 text-xs font-semibold uppercase tracking-wider mb-3 border border-campo-green-500/30 shadow-sm mx-auto">
            <ShieldCheck className="w-4 h-4 text-campo-green-400" />
            <span>Acceso Panel de Control</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white text-center">
            Panel de Control
          </h1>
          <p className="text-sm text-slate-300 mt-1.5 text-center max-w-sm mx-auto">
            Gestión de operaciones, cotizaciones y acceso a fábricas aliadas
          </p>
        </div>

        {/* Tarjeta de Formulario */}
        <div className="bg-slate-900/85 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-user"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Usuario Operador o Fábrica
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="admin-user"
                  type="text"
                  required
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ej: CampoDirecto o fab.adama"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-campo-green-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="admin-pass"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                >
                  Contraseña de Seguridad
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-pass"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-campo-green-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Acciones principales con igual jerarquía visual */}
            <div className="space-y-3 pt-2">
              {/* Botón 1: Ingresar al Panel */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-campo-green-600 hover:bg-campo-green-500 text-white font-semibold text-sm shadow-lg shadow-campo-green-900/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Ingresar al Panel</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Botón 2: Regresar a Campo Directo (debajo y con la misma jerarquía de botón principal) */}
              <Link
                href="/"
                className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/90 text-white font-semibold text-sm border border-slate-600/80 hover:border-slate-500 shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer group"
                title="Regresar a la página principal de Campo Directo"
              >
                <ArrowLeft className="w-4 h-4 text-campo-green-400 group-hover:-translate-x-1 transition-transform" />
                <span>Regresar a Campo Directo</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Footer institucional */}
        <div className="text-center mt-6 text-xs text-slate-500">
          Campo Directo SRL &copy; {new Date().getFullYear()} — Plataforma de Gestión Comercial
        </div>
      </div>
    </div>
  );
};
