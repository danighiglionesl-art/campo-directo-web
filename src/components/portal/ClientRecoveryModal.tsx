"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  KeyRound,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export type RecoveryTab = "password" | "usuario";

interface ClientRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: RecoveryTab;
  onSuccessLoginPrefill?: (identifier: string) => void;
  onTriggerGoogleLogin?: () => void;
}

export const ClientRecoveryModal: React.FC<ClientRecoveryModalProps> = ({
  isOpen,
  onClose,
  initialTab = "password",
  onSuccessLoginPrefill,
  onTriggerGoogleLogin,
}) => {
  const [activeTab, setActiveTab] = useState<RecoveryTab>(initialTab);

  // Estados Flujo Contraseña
  const [passStep, setPassStep] = useState<1 | 2 | 3>(1);
  const [passIdentifier, setPassIdentifier] = useState("");
  const [passCode, setPassCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [passMaskedEmail, setPassMaskedEmail] = useState("");
  const [passDevCode, setPassDevCode] = useState<string | null>(null);
  const [isPassLoading, setIsPassLoading] = useState(false);
  const [passError, setPassError] = useState("");
  const [passIsGoogle, setPassIsGoogle] = useState(false);

  // Estados Flujo Usuario
  const [userQuery, setUserQuery] = useState("");
  const [userMaskedEmail, setUserMaskedEmail] = useState("");
  const [userDevUsername, setUserDevUsername] = useState<string | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [userError, setUserError] = useState("");
  const [userSuccess, setUserSuccess] = useState(false);

  // Sincronizar tab inicial al abrir
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setPassStep(1);
      setPassError("");
      setUserError("");
      setUserSuccess(false);
      setPassIsGoogle(false);
    }
  }, [isOpen, initialTab]);

  // Tecla Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // --- SUBMIT RECUPERACIÓN CONTRASEÑA: PASO 1 (SOLICITAR CÓDIGO) ---
  const handleRequestPasswordOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassIsGoogle(false);

    if (!passIdentifier.trim()) {
      setPassError("Por favor ingresá tu usuario, CUIT o correo electrónico.");
      return;
    }

    setIsPassLoading(true);
    try {
      const res = await fetch("/api/auth/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: passIdentifier.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data?.isGoogleAccount) {
          setPassIsGoogle(true);
          setPassError(data.message);
        } else {
          setPassError(data?.error || "No se pudo procesar la solicitud.");
        }
        return;
      }

      setPassMaskedEmail(data.emailMasked || "");
      if (data.devCode) {
        setPassDevCode(data.devCode);
      }
      setPassStep(2);
    } catch (err) {
      console.error(err);
      setPassError("Error de conexión con el servidor. Verificá tu red.");
    } finally {
      setIsPassLoading(false);
    }
  };

  // --- SUBMIT RECUPERACIÓN CONTRASEÑA: PASO 2 (VALIDAR Y CAMBIAR) ---
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");

    if (!passCode.trim() || passCode.trim().length !== 6) {
      setPassError("Por favor ingresá el código de seguridad de 6 dígitos.");
      return;
    }

    if (newPassword.length < 6) {
      setPassError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("Las contraseñas ingresadas no coinciden.");
      return;
    }

    setIsPassLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: passIdentifier.trim(),
          code: passCode.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setPassError(data?.error || "Código incorrecto o expirado.");
        return;
      }

      setPassStep(3);
    } catch (err) {
      console.error(err);
      setPassError("Error de comunicación al actualizar la contraseña.");
    } finally {
      setIsPassLoading(false);
    }
  };

  // --- SUBMIT RECUPERACIÓN DE USUARIO ---
  const handleRecoverUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError("");
    setUserSuccess(false);

    if (!userQuery.trim()) {
      setUserError("Por favor ingresá tu CUIT o tu correo electrónico.");
      return;
    }

    setIsUserLoading(true);
    try {
      const res = await fetch("/api/auth/recover-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cuitOrEmail: userQuery.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setUserError(
          data?.error ||
            "No encontramos ninguna cuenta vinculada a ese CUIT o correo."
        );
        return;
      }

      setUserMaskedEmail(data.emailMasked || "");
      if (data.devUsername) {
        setUserDevUsername(data.devUsername);
      }
      setUserSuccess(true);
    } catch (err) {
      console.error(err);
      setUserError("Error de conexión al buscar tus datos de usuario.");
    } finally {
      setIsUserLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabecera del Modal */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-campo-green/20 border border-campo-green/40 flex items-center justify-center text-campo-green shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                Recuperación de <span className="text-campo-green">Credenciales</span>
              </h2>
              <p className="text-xs text-slate-300">
                Seguridad de Cuentas Campo Directo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Cerrar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Solapas Selectoras */}
        <div className="bg-slate-100 p-1.5 border-b border-slate-200 flex gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("password");
              setPassError("");
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "password"
                ? "bg-white text-campo-green shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>RECUPERAR CONTRASEÑA</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("usuario");
              setUserError("");
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "usuario"
                ? "bg-white text-campo-green shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>RECUPERAR USUARIO</span>
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[75vh]">
          
          {/* ========================================================================= */}
          {/* SOLAPA 1: RECUPERACIÓN DE CONTRASEÑA                                      */}
          {/* ========================================================================= */}
          {activeTab === "password" && (
            <div>
              {/* PASO 1: Ingreso de Identificador */}
              {passStep === 1 && (
                <div>
                  <div className="text-center mb-6">
                    <h3 className="text-base font-bold text-slate-900">
                      ¿Olvidaste tu contraseña?
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Ingresá tu usuario, CUIT o email registrado. Te enviaremos un código de seguridad para crear una nueva clave.
                    </p>
                  </div>

                  {passError && (
                    <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span>{passError}</span>
                        {passIsGoogle && onTriggerGoogleLogin && (
                          <div className="mt-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onTriggerGoogleLogin();
                              }}
                              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-lg text-xs font-bold hover:bg-slate-50 flex items-center gap-2 shadow-2xs"
                            >
                              <span>Ingresar con Google</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleRequestPasswordOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Usuario, CUIT o Correo Electrónico
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={passIdentifier}
                          onChange={(e) => setPassIdentifier(e.target.value)}
                          placeholder="Ej: agroperez o 20-33445566-7"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-campo-green focus:border-campo-green transition-all"
                          autoFocus
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isPassLoading}
                      className="w-full py-3 px-4 bg-campo-green hover:bg-campo-green-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 uppercase"
                    >
                      {isPassLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>ENVIANDO CÓDIGO...</span>
                        </>
                      ) : (
                        <>
                          <span>ENVIAR CÓDIGO DE RECUPERACIÓN</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* PASO 2: Ingreso de Código OTP y Nueva Clave */}
              {passStep === 2 && (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setPassStep(1);
                      setPassError("");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-4 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Cambiar usuario / email</span>
                  </button>

                  <div className="text-center mb-5">
                    <div className="w-12 h-12 bg-emerald-50 text-campo-green rounded-full flex items-center justify-center mx-auto mb-2.5 border border-emerald-200">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      Revisá tu casilla de correo
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Enviamos un código de seguridad a:
                    </p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {passMaskedEmail || "tu correo registrado"}
                    </p>
                    {passDevCode && (
                      <div className="mt-2 inline-block px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold rounded-lg">
                        Prueba Local: Código = {passDevCode}
                      </div>
                    )}
                  </div>

                  {passError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{passError}</span>
                    </div>
                  )}

                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-center">
                        Código de Seguridad (6 dígitos)
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={passCode}
                        onChange={(e) => setPassCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••••"
                        className="w-full py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-center text-2xl font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-campo-green focus:border-campo-green focus:bg-white transition-all"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Nueva Contraseña (mínimo 6 caracteres)
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPass ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-campo-green focus:border-campo-green transition-all"
                        />
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Confirmar Nueva Contraseña
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPass ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-campo-green focus:border-campo-green transition-all"
                        />
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isPassLoading}
                      className="w-full py-3 px-4 bg-campo-green hover:bg-campo-green-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 uppercase mt-2"
                    >
                      {isPassLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>RESTABLECIENDO...</span>
                        </>
                      ) : (
                        <>
                          <span>ESTABLECER NUEVA CONTRASEÑA</span>
                          <CheckCircle2 className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={handleRequestPasswordOtp}
                        disabled={isPassLoading}
                        className="text-xs text-slate-500 hover:text-campo-green font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>¿No te llegó el correo? Reenviar código</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* PASO 3: Éxito Final */}
              {passStep === 3 && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-emerald-100 text-campo-green rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    ¡Contraseña actualizada con éxito!
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1.5">
                    Tu nueva clave ya está activa y protegida en el sistema de Campo Directo.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSuccessLoginPrefill) {
                        onSuccessLoginPrefill(passIdentifier);
                      }
                      onClose();
                    }}
                    className="mt-6 w-full py-3 px-4 bg-campo-green hover:bg-campo-green-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 uppercase"
                  >
                    <span>INGRESAR A MI CUENTA</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SOLAPA 2: RECUPERACIÓN DE NOMBRE DE USUARIO                               */}
          {/* ========================================================================= */}
          {activeTab === "usuario" && (
            <div>
              {!userSuccess ? (
                <div>
                  <div className="text-center mb-6">
                    <h3 className="text-base font-bold text-slate-900">
                      ¿No recordás tu nombre de usuario?
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Ingresá tu número de CUIT o correo electrónico. El sistema buscará tu cuenta y te enviará un recordatorio por correo electrónico.
                    </p>
                  </div>

                  {userError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{userError}</span>
                    </div>
                  )}

                  <form onSubmit={handleRecoverUsernameSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        CUIT o Correo Electrónico
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={userQuery}
                          onChange={(e) => setUserQuery(e.target.value)}
                          placeholder="Ej: 20-33445566-7 o administracion@agroperez.com.ar"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-campo-green focus:border-campo-green transition-all"
                          autoFocus
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isUserLoading}
                      className="w-full py-3 px-4 bg-campo-green hover:bg-campo-green-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 uppercase"
                    >
                      {isUserLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>BUSCANDO CUENTA...</span>
                        </>
                      ) : (
                        <>
                          <span>BUSCAR Y ENVIAR MI USUARIO</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-emerald-100 text-campo-green rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    ¡Recordatorio enviado con éxito!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1.5">
                    Hemos enviado tu nombre de usuario oficial al correo vinculado:
                  </p>
                  <p className="text-sm font-extrabold text-slate-900 mt-1">
                    {userMaskedEmail || "tu correo registrado"}
                  </p>
                  {userDevUsername && (
                    <div className="mt-3 inline-block px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold rounded-lg">
                      Prueba Local: Usuario = {userDevUsername}
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-3">
                    Revisá tu bandeja principal o carpeta de correo no deseado / spam.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      if (userDevUsername && onSuccessLoginPrefill) {
                        onSuccessLoginPrefill(userDevUsername);
                      }
                      onClose();
                    }}
                    className="mt-6 w-full py-3 px-4 bg-campo-green hover:bg-campo-green-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 uppercase"
                  >
                    <span>VOLVER A INICIAR SESIÓN</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Pie de Seguridad */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-campo-green" />
          <span>Tus datos están protegidos por encriptación bancaria SSL de 256 bits.</span>
        </div>

      </div>
    </div>
  );
};
