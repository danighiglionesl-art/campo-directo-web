"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  User,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  MapPin,
  Send,
  Inbox,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  Phone,
  MessageCircle,
  ShieldCheck,
  FileText,
  CreditCard,
  ChevronRight,
  Loader2,
  Download,
} from "lucide-react";
import { useClientAuth, PortalTab } from "@/context/ClientAuthContext";
import { triggerGoogleAuth } from "@/utils/googleAuth";
import { ARGENTINE_PROVINCES } from "@/data/quotationHelper";
import { ClientRecoveryModal, RecoveryTab } from "@/components/portal/ClientRecoveryModal";
import { generateProposalPdf } from "@/utils/quotationPdfGenerator";

export const ClientPortalModal: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isPortalOpen,
    activeTab,
    establishments,
    sentQuotations,
    receivedQuotations,
    closePortal,
    setActiveTab,
    login,
    loginWithGoogle,
    logout,
    updateProfile,
    changePassword,
    addEstablishment,
    deleteEstablishment,
  } = useClientAuth();

  // Estados locales de Login
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Estados de Recuperación de Credenciales
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryInitialTab, setRecoveryInitialTab] = useState<RecoveryTab>("password");

  // Estados locales de Mis Datos (formulario de edición)
  const [profileForm, setProfileForm] = useState(user || {
    id: "",
    usuario: "",
    razonSocial: "",
    apellidos: "",
    nombres: "",
    cuit: "",
    condicionIva: "Responsable Inscripto",
    email: "",
    telefono: "",
    whatsapp: "",
    provincia: "Córdoba",
    localidad: "Río Cuarto",
    direccion: "",
    actividadPrincipal: "",
  });
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // Estados locales de Cambiar Contraseña
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPassText, setShowPassText] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  // Estados locales de Nuevo Establecimiento
  const [showNewEstForm, setShowNewEstForm] = useState(false);
  const [newEst, setNewEst] = useState({
    nombre: "",
    provincia: "Córdoba",
    localidad: "",
    hectareas: 300,
    actividad: "Agrícola" as const,
    referenciaAcceso: "",
    coordenadasGps: "",
    tipoDescarga: "Tranquera de campo / Silobolsa",
    esPrincipal: false,
  });

  // Modal de detalle de cotización recibida
  const [viewingProposal, setViewingProposal] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Sincronizar formulario de perfil al cambiar usuario
  useEffect(() => {
    if (user) {
      setProfileForm(user);
    }
  }, [user]);

  // Manejo de atajo tecla ESC para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPortalOpen) {
        closePortal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPortalOpen, closePortal]);

  // Si no está abierto, no renderizar nada
  if (!isPortalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = await login(loginId, loginPassword);
    if (!res.success) {
      setLoginError(res.error || "Usuario o contraseña inválidos");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setLoginError("");
      const googleUser = await triggerGoogleAuth();
      loginWithGoogle(googleUser);
    } catch (err: any) {
      console.warn("Google Auth cancelado o con error:", err);
      const msg = err?.message || "";
      if (
        !msg.toLowerCase().includes("cerrada") &&
        !msg.toLowerCase().includes("popup_closed") &&
        !msg.toLowerCase().includes("cancelada")
      ) {
        setLoginError(msg || "Error al conectar con tu cuenta de Google.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileForm);
    setProfileSuccessMsg("¡Datos actualizados con éxito!");
    setTimeout(() => setProfileSuccessMsg(""), 4000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (newPass !== confirmPass) {
      setPassError("Las contraseñas no coinciden.");
      return;
    }

    const res = changePassword(currentPass, newPass);
    if (!res.success) {
      setPassError(res.error || "No se pudo actualizar la contraseña.");
    } else {
      setPassSuccess("¡Contraseña actualizada con éxito!");
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      setTimeout(() => setPassSuccess(""), 4000);
    }
  };

  const handleAddEstSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEst.nombre.trim()) return;
    addEstablishment(newEst);
    setShowNewEstForm(false);
    setNewEst({
      nombre: "",
      provincia: "Córdoba",
      localidad: "",
      hectareas: 300,
      actividad: "Agrícola",
      referenciaAcceso: "",
      coordenadasGps: "",
      tipoDescarga: "Tranquera de campo / Silobolsa",
      esPrincipal: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[92vh] max-h-[780px] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* ========================================================================= */}
        {/* VISTA 1: INICIAR SESIÓN (SI NO ESTÁ AUTENTICADO)                           */}
        {/* ========================================================================= */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col justify-between overflow-y-auto p-6 sm:p-10">
            {/* Header Login */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 shrink-0">
                  <Image
                    src="/images/logo-transparent.png"
                    alt="Campo Directo"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Acceso a <span className="text-campo-green">Clientes</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Portal exclusivo de autogestión para productores y empresas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closePortal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Cerrar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario Login */}
            <div className="max-w-md w-full mx-auto my-auto py-6">
              <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-campo-green/10 text-campo-green rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Ingresá a tu cuenta</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Gestioná tus datos, establecimientos y cotizaciones directas
                  </p>
                </div>

                {loginError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Usuario, CUIT o Correo
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setRecoveryInitialTab("usuario");
                          setIsRecoveryOpen(true);
                        }}
                        className="text-[11px] font-semibold text-campo-green hover:underline hover:text-campo-green-600 transition-colors"
                      >
                        ¿Olvidaste tu usuario?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        placeholder="Ej: agroperez o 20-33445566-7"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-campo-green focus:border-campo-green transition-all"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Contraseña
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setRecoveryInitialTab("password");
                          setIsRecoveryOpen(true);
                        }}
                        className="text-[11px] font-semibold text-campo-green hover:underline hover:text-campo-green-600 transition-colors"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-campo-green focus:border-campo-green transition-all"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        title={showLoginPassword ? "Ocultar" : "Mostrar"}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-campo-green hover:bg-campo-green-600 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                  >
                    <span>INGRESAR A MI CUENTA</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-50 px-2 text-slate-400 font-bold">O también</span>
                  </div>
                </div>

                {/* Botón Continuar con Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2.5 uppercase disabled:opacity-50"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-campo-green" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>
                    {isGoogleLoading
                      ? "CONECTANDO CON GOOGLE..."
                      : "CONTINUAR CON GOOGLE"}
                  </span>
                </button>
              </div>
            </div>

            {/* Footer Login */}
            <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-campo-green" />
                Conexión encriptada y protegida de Campo Directo
              </span>
              <span>
                ¿Necesitás una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    closePortal();
                    const el = document.getElementById("cotizacion");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="font-bold text-campo-green hover:underline"
                >
                  Solicitá tu cotización aquí
                </button>
              </span>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* VISTA 2: PANEL DE AUTOGESTIÓN CLIENTE (AUTENTICADO)                       */
          /* ========================================================================= */
          <>
            {/* Header del Portal Pinned */}
            <div className="shrink-0 bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-campo-green/20 border border-campo-green/40 flex items-center justify-center text-campo-green font-black text-sm shrink-0">
                  {user?.nombres?.charAt(0) || "C"}
                  {user?.apellidos?.charAt(0) || "D"}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                      {user?.razonSocial || "MI CUENTA"}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      CLIENTE VERIFICADO
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    {user?.apellidos} {user?.nombres} · CUIT: {user?.cuit}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span>Salir</span>
                </button>
                <button
                  type="button"
                  onClick={closePortal}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Cerrar (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Pestañas de Navegación del Portal Pinned */}
            <div className="shrink-0 bg-slate-100 border-b border-slate-200 overflow-x-auto flex items-center gap-1 px-3 py-2 custom-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab("mis-datos")}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === "mis-datos"
                    ? "bg-white text-campo-green shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>Mis Datos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("cambiar-password")}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === "cambiar-password"
                    ? "bg-white text-campo-green shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 shrink-0" />
                <span>Cambiar Contraseña</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("mis-establecimientos")}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === "mis-establecimientos"
                    ? "bg-white text-campo-green shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>Mis Establecimientos</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
                  {establishments.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("cotizaciones-enviadas")}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === "cotizaciones-enviadas"
                    ? "bg-white text-campo-green shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Send className="w-3.5 h-3.5 shrink-0" />
                <span>Cotizaciones Enviadas</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
                  {sentQuotations.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("cotizaciones-recibidas")}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === "cotizaciones-recibidas"
                    ? "bg-white text-campo-green shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Inbox className="w-3.5 h-3.5 shrink-0" />
                <span>Cotizaciones Recibidas</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-black">
                  {receivedQuotations.filter((r) => r.estado === "VIGENTE").length}
                </span>
              </button>
            </div>

            {/* Cuerpo del Tab Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 custom-scrollbar">
              {/* ------------------------------------------------------------- */}
              {/* TAB 1: MIS DATOS                                              */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "mis-datos" && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Información de la Cuenta y Datos Fiscales
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Mantené tus datos de contacto y facturación actualizados para tus operaciones directas.
                      </p>
                    </div>
                  </div>

                  {profileSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{profileSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleProfileSubmit} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Razón Social / Nombre Comercial
                        </label>
                        <input
                          type="text"
                          value={profileForm.razonSocial}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, razonSocial: e.target.value.toUpperCase() })
                          }
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-campo-green focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          CUIT / CUIL
                        </label>
                        <input
                          type="text"
                          value={profileForm.cuit}
                          onChange={(e) => setProfileForm({ ...profileForm, cuit: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-campo-green focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Apellido/s de Contacto
                        </label>
                        <input
                          type="text"
                          value={profileForm.apellidos}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, apellidos: e.target.value.toUpperCase() })
                          }
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-campo-green focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Nombres de Contacto
                        </label>
                        <input
                          type="text"
                          value={profileForm.nombres}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, nombres: e.target.value.toUpperCase() })
                          }
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-campo-green focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Condición Frente al IVA
                        </label>
                        <select
                          value={profileForm.condicionIva}
                          onChange={(e) => setProfileForm({ ...profileForm, condicionIva: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-campo-green focus:outline-none"
                        >
                          <option value="Responsable Inscripto">Responsable Inscripto</option>
                          <option value="Monotributo">Monotributo</option>
                          <option value="Exento">Exento</option>
                          <option value="Consumidor Final">Consumidor Final</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-campo-green focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Teléfono de Contacto
                        </label>
                        <input
                          type="text"
                          value={profileForm.telefono}
                          onChange={(e) => setProfileForm({ ...profileForm, telefono: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-campo-green focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          WhatsApp de Operaciones
                        </label>
                        <input
                          type="text"
                          value={profileForm.whatsapp}
                          onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-campo-green focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Provincia
                        </label>
                        <select
                          value={profileForm.provincia}
                          onChange={(e) => setProfileForm({ ...profileForm, provincia: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-campo-green focus:outline-none"
                        >
                          {ARGENTINE_PROVINCES.map((prov) => (
                            <option key={prov} value={prov}>
                              {prov}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Localidad
                        </label>
                        <input
                          type="text"
                          value={profileForm.localidad}
                          onChange={(e) => setProfileForm({ ...profileForm, localidad: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-campo-green focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Actividad Agropecuaria Principal
                        </label>
                        <input
                          type="text"
                          value={profileForm.actividadPrincipal}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, actividadPrincipal: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-campo-green focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-campo-green hover:bg-campo-green-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>GUARDAR CAMBIOS</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 2: CAMBIAR CONTRASEÑA                                     */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "cambiar-password" && (
                <div className="max-w-md mx-auto space-y-6">
                  <div className="pb-3 border-b border-slate-200">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Actualizar Contraseña de Acceso
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Elegí una contraseña segura para proteger tus operaciones y cotizaciones.
                    </p>
                  </div>

                  {passError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{passError}</span>
                    </div>
                  )}

                  {passSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{passSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Contraseña Actual
                      </label>
                      <input
                        type={showPassText ? "text" : "password"}
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-campo-green"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nueva Contraseña
                      </label>
                      <input
                        type={showPassText ? "text" : "password"}
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-campo-green"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Confirmar Nueva Contraseña
                      </label>
                      <input
                        type={showPassText ? "text" : "password"}
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        placeholder="Repetí la nueva contraseña"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-campo-green"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showPassText}
                          onChange={(e) => setShowPassText(e.target.checked)}
                          className="rounded text-campo-green focus:ring-campo-green"
                        />
                        <span>Mostrar contraseñas</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-campo-green hover:bg-campo-green-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>ACTUALIZAR CONTRASEÑA</span>
                    </button>
                  </form>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 3: MIS ESTABLECIMIENTOS                                   */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "mis-establecimientos" && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Establecimientos y Lotes de Producción
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Puntos de entrega para flete directo a campo y descarga de insumos.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNewEstForm(!showNewEstForm)}
                      className="px-4 py-2 bg-campo-green hover:bg-campo-green-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>NUEVO ESTABLECIMIENTO</span>
                    </button>
                  </div>

                  {/* Formulario Desplegable para Agregar Establecimiento */}
                  {showNewEstForm && (
                    <form
                      onSubmit={handleAddEstSubmit}
                      className="bg-emerald-50/50 p-5 rounded-2xl border border-campo-green/30 shadow-xs space-y-4 animate-in fade-in duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs sm:text-sm font-bold text-emerald-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-campo-green" />
                          <span>Alta de Nuevo Establecimiento / Campo</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowNewEstForm(false)}
                          className="text-xs text-slate-500 hover:text-slate-800"
                        >
                          Cancelar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            Nombre del Establecimiento / Lote
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: La Posta, Campo Norte"
                            value={newEst.nombre}
                            onChange={(e) => setNewEst({ ...newEst, nombre: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            Superficie (Has)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={newEst.hectareas}
                            onChange={(e) => setNewEst({ ...newEst, hectareas: Number(e.target.value) })}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            Provincia
                          </label>
                          <select
                            value={newEst.provincia}
                            onChange={(e) => setNewEst({ ...newEst, provincia: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                          >
                            {ARGENTINE_PROVINCES.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            Localidad más cercana
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: Marcos Juárez"
                            value={newEst.localidad}
                            onChange={(e) => setNewEst({ ...newEst, localidad: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            Actividad Productiva
                          </label>
                          <select
                            value={newEst.actividad}
                            onChange={(e) =>
                              setNewEst({ ...newEst, actividad: e.target.value as any })
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                          >
                            <option value="Agrícola">Agrícola</option>
                            <option value="Ganadero">Ganadero</option>
                            <option value="Mixto">Mixto</option>
                            <option value="Servicios Agropecuarios">Servicios Agropecuarios</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            Referencia de Acceso y Tranquera
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Ruta 9 Km 450, 8 km al sur por camino real..."
                            value={newEst.referenciaAcceso}
                            onChange={(e) => setNewEst({ ...newEst, referenciaAcceso: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                            Coordenadas GPS Satelitales
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: -32.6981, -62.1023"
                            value={newEst.coordenadasGps}
                            onChange={(e) => setNewEst({ ...newEst, coordenadasGps: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowNewEstForm(false)}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-campo-green hover:bg-campo-green-600 text-white text-xs font-bold rounded-xl"
                        >
                          GUARDAR ESTABLECIMIENTO
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Listado de Establecimientos */}
                  <div className="space-y-3">
                    {establishments.map((est) => (
                      <div
                        key={est.id}
                        className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-campo-green/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm sm:text-base font-bold text-slate-900">
                              {est.nombre}
                            </h4>
                            {est.esPrincipal && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-campo-green/10 text-campo-green border border-campo-green/20">
                                PRINCIPAL
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {est.hectareas} Hectáreas
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                              {est.actividad}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-campo-green shrink-0" />
                            <span>
                              {est.localidad}, {est.provincia}
                            </span>
                          </p>

                          {est.referenciaAcceso && (
                            <p className="text-xs text-slate-500 font-normal line-clamp-2">
                              <strong className="text-slate-700">Acceso:</strong> {est.referenciaAcceso}
                            </p>
                          )}

                          {est.coordenadasGps && (
                            <div className="pt-1 flex items-center gap-2 text-[11px]">
                              <span className="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                GPS: {est.coordenadasGps}
                              </span>
                              {est.linkMaps && (
                                <a
                                  href={est.linkMaps}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-campo-green font-bold hover:underline inline-flex items-center gap-1"
                                >
                                  <span>Ver Satélite</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {establishments.length > 1 && (
                            <button
                              type="button"
                              onClick={() => deleteEstablishment(est.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                              title="Eliminar establecimiento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 4: COTIZACIONES ENVIADAS                                  */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "cotizaciones-enviadas" && (
                <div className="max-w-3xl mx-auto space-y-4">
                  <div className="pb-3 border-b border-slate-200">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Cotizaciones Solicitadas por tu Empresa
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Historial en tiempo real de tus pedidos de cotización de insumos, semillas y granos.
                    </p>
                  </div>

                  {sentQuotations.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300">
                      <Send className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-medium">
                        Aún no tenés cotizaciones enviadas registradas.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sentQuotations.map((quotation) => (
                        <div
                          key={quotation.id}
                          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-campo-green/40 transition-all space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                                {quotation.numero}
                              </span>
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {quotation.fecha}
                              </span>
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {quotation.operacion}
                              </span>
                              {quotation.formaPago && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-campo-green-900 border border-campo-green/30 flex items-center gap-1">
                                  <CreditCard className="w-3 h-3 text-campo-green" />
                                  <span>Pago: {quotation.formaPago}</span>
                                </span>
                              )}
                            </div>

                            <div>
                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                  quotation.estado === "EN EVALUACIÓN"
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                                }`}
                              >
                                {quotation.estado}
                              </span>
                            </div>
                          </div>

                          {/* Lista de Items */}
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Productos Solicitados ({quotation.items.length}):
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              {quotation.items.map((item, idx) => (
                                <div
                                  key={item.id || idx}
                                  className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <span className="font-bold text-slate-900">{item.nombre}</span>{" "}
                                    <span className="text-slate-500">
                                      ({item.categoriaOVariedad}) · {item.empresa}
                                    </span>
                                    {item.detalle && (
                                      <p className="text-[11px] text-slate-500 mt-0.5">{item.detalle}</p>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="font-bold text-campo-green text-sm">
                                      {item.cantidad} {item.unidad}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {quotation.establecimientoDestino && (
                            <p className="text-[11px] text-slate-600">
                              <strong>Punto de descarga:</strong> {quotation.establecimientoDestino}
                            </p>
                          )}

                          {quotation.observaciones && (
                            <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                              <strong>Observaciones:</strong> {quotation.observaciones}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 5: COTIZACIONES RECIBIDAS (PROPUESTAS COMERCIALES)         */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "cotizaciones-recibidas" && (
                <div className="max-w-3xl mx-auto space-y-4">
                  <div className="pb-3 border-b border-slate-200">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Propuestas Comerciales Recibidas de Campo Directo
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Ofertas directas de industria a campo con precios netos, plazos y condiciones comerciales.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {receivedQuotations.map((prop) => (
                      <div
                        key={prop.id}
                        className={`bg-white p-5 rounded-2xl border shadow-xs transition-all space-y-3 ${
                          prop.estado === "VIGENTE"
                            ? "border-emerald-200/90 shadow-sm"
                            : "border-slate-200 opacity-80"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-campo-green text-white">
                                {prop.numero}
                              </span>
                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                  prop.estado === "VIGENTE"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {prop.estado}
                              </span>
                              <span className="text-xs text-slate-500">Emitida: {prop.fecha}</span>
                            </div>
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                              {prop.asunto}
                            </h4>
                          </div>

                          <div className="text-right self-end sm:self-center">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                              Total Cotizado
                            </span>
                            <span className="text-lg sm:text-xl font-black text-slate-900">
                              U$S {prop.totalUsd.toLocaleString("es-AR")}
                            </span>
                          </div>
                        </div>

                        {/* Condiciones comerciales destacadas */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">
                              Validez
                            </span>
                            <span className="font-bold text-slate-800">Hasta {prop.vencimiento}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">
                              Condición de Pago
                            </span>
                            <span className="font-semibold text-slate-800">{prop.condicionPago}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">
                              Logística / Entrega
                            </span>
                            <span className="font-semibold text-slate-800">{prop.plazoEntrega}</span>
                          </div>
                        </div>

                        {/* Detalle de Items */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Detalle de Insumos / Semillas Incluidos:
                          </span>
                          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                            {prop.items.map((it) => (
                              <div
                                key={it.id}
                                className="p-2.5 bg-white flex items-center justify-between text-xs"
                              >
                                <div>
                                  <span className="font-bold text-slate-800">{it.descripcion}</span>
                                  <span className="text-slate-500 block text-[11px]">
                                    Cantidad: {it.cantidad} · Unitario: U$S {it.precioUnitarioUsd.toFixed(2)}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-slate-900">
                                    U$S {it.subtotalUsd.toLocaleString("es-AR")}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {prop.observaciones && (
                          <p className="text-xs text-slate-600 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                            <strong>Condiciones:</strong> {prop.observaciones}
                          </p>
                        )}

                        {/* Botones de Acción */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              generateProposalPdf({
                                id: prop.id,
                                numero: prop.numero,
                                fechaEmision: prop.fecha,
                                fechaVencimiento: prop.vencimiento,
                                clienteId: user?.id || "cli-current",
                                clienteNombre:
                                  user?.razonSocial ||
                                  `${user?.apellidos || ""} ${user?.nombres || ""}`.trim() ||
                                  "Cliente Campo Directo",
                                clienteCuit: user?.cuit || "Sin CUIT",
                                clienteEmail: user?.email,
                                asunto: prop.asunto,
                                estado: prop.estado,
                                totalUsd: prop.totalUsd,
                                condicionPago: prop.condicionPago,
                                plazoEntrega: prop.plazoEntrega,
                                items: prop.items.map((i) => ({
                                  id: i.id,
                                  descripcion: i.descripcion,
                                  cantidad: i.cantidad,
                                  precioUnitarioUsd: i.precioUnitarioUsd,
                                  subtotalUsd: i.subtotalUsd,
                                })),
                                observaciones: prop.observaciones,
                              });
                            }}
                            className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5 text-campo-green" />
                            <span>Descargar PDF Oficial</span>
                          </button>

                          <a
                            href={`https://wa.me/5493585095475?text=${encodeURIComponent(
                              `Hola Campo Directo! Me comunico respecto a la Propuesta Comercial ${prop.numero} (${prop.asunto}) por U$S ${prop.totalUsd}. Quisiera avanzar con la operación.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Consultar por WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Informativo Pinned */}
            <div className="shrink-0 bg-white border-t border-slate-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-campo-green" />
                Campo Directo S.R.L. · Atención comercial directa: Lu a Vi 8:00 a 18:00 hs
              </span>
              <span className="font-semibold text-slate-700">
                Soporte / Mesa de Ayuda:{" "}
                <a
                  href="https://wa.me/5493585095475"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-campo-green hover:underline font-bold"
                >
                  +54 9 358 5095475
                </a>
              </span>
            </div>
          </>
        )}

        {/* Modal Autónomo de Recuperación de Credenciales */}
        <ClientRecoveryModal
          isOpen={isRecoveryOpen}
          onClose={() => setIsRecoveryOpen(false)}
          initialTab={recoveryInitialTab}
          onSuccessLoginPrefill={(id) => {
            setLoginId(id);
            setIsRecoveryOpen(false);
          }}
          onTriggerGoogleLogin={() => {
            setIsRecoveryOpen(false);
            handleGoogleLogin();
          }}
        />
      </div>
    </div>
  );
};
