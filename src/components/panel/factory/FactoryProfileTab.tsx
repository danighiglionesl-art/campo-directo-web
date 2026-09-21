"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Save,
  AlertCircle,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { formatCuit, validateCuitModulo11 } from "@/data/quotationHelper";

export const FactoryProfileTab: React.FC = () => {
  const { session, factories, updateFactory } = useAdmin();

  // Buscar la fábrica correspondiente a la sesión actual
  const currentFactory = factories.find(
    (f) => f.empresa.toLowerCase() === (session.empresa || "").toLowerCase()
  ) || factories[0];

  // Estados del Formulario
  const [razonSocial, setRazonSocial] = useState("");
  const [cuit, setCuit] = useState("");
  const [contactoComercial, setContactoComercial] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [provincia, setProvincia] = useState("BUENOS AIRES");
  const [direccion, setDireccion] = useState("");

  // Gestión de Claves (1f)
  const [claveActual, setClaveActual] = useState("");
  const [nuevaClave, setNuevaClave] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Estados de retroalimentación
  const [cuitError, setCuitError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [keySuccess, setKeySuccess] = useState(false);
  const [keyError, setKeyError] = useState("");

  useEffect(() => {
    if (currentFactory) {
      setRazonSocial(currentFactory.razonSocial || "");
      setCuit(currentFactory.cuit || "");
      setContactoComercial(currentFactory.contactoComercial || "");
      setWhatsapp(currentFactory.whatsapp || "");
      setEmail(currentFactory.email || "");
      setLocalidad(currentFactory.localidad || "");
      setProvincia(currentFactory.provincia || "BUENOS AIRES");
      setDireccion(currentFactory.direccion || "");
      setClaveActual(currentFactory.claveActiva || "");
    }
  }, [currentFactory]);

  const handleCuitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCuit(e.target.value);
    setCuit(formatted);
    if (formatted.length === 13) {
      if (!validateCuitModulo11(formatted)) {
        setCuitError("CUIT inválido según módulo 11 de AFIP");
      } else {
        setCuitError("");
      }
    } else {
      setCuitError("");
    }
  };

  const handleSaveData = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFactory) return;

    updateFactory(currentFactory.id, {
      razonSocial: razonSocial.trim(),
      cuit: cuit.trim(),
      contactoComercial: contactoComercial.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      localidad: localidad.trim(),
      provincia,
      direccion: direccion.trim(),
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyError("");
    setKeySuccess(false);

    if (!nuevaClave.trim()) {
      setKeyError("Por favor ingresá la nueva contraseña");
      return;
    }
    if (nuevaClave.length < 6) {
      setKeyError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (nuevaClave !== confirmarClave) {
      setKeyError("Las contraseñas no coinciden");
      return;
    }

    if (currentFactory) {
      updateFactory(currentFactory.id, {
        claveActiva: nuevaClave.trim(),
      });
      setClaveActual(nuevaClave.trim());
      setNuevaClave("");
      setConfirmarClave("");
      setKeySuccess(true);
      setTimeout(() => setKeySuccess(false), 3500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado de la Sección */}
      <div className="bg-emerald-50/70 p-6 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Mis Datos de Empresa
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Mantené actualizados los datos institucionales, de contacto comercial y credenciales de acceso de tu empresa.
          </p>
        </div>

        {/* Nombre Fijo de Empresa Destacado */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm">
          <Building2 className="w-5 h-5 text-campo-green-400" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block leading-none">
              Empresa Titular (Fijo)
            </span>
            <span className="text-base font-black tracking-wide text-white leading-tight">
              {currentFactory?.empresa || session.empresa || "FÁBRICA"}
            </span>
          </div>
          <span title="El nombre de empresa permanece fijo e inmutable">
            <Lock className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulario Principal de Datos Comerciales (8 cols) */}
        <div className="lg:col-span-8 bg-emerald-50/70 p-6 sm:p-7 rounded-2xl border border-emerald-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-emerald-200/70">
            <h3 className="text-sm font-black uppercase tracking-wider text-emerald-950 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Identificación & Contacto Comercial</span>
            </h3>
            {saveSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-300 shadow-xs animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ¡Datos guardados con éxito!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveData} className="space-y-4 text-xs">
            {/* Nombre de Empresa (Fijo) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Nombre de Empresa (FIJO)
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={currentFactory?.empresa || ""}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-100/50 text-slate-700 font-bold text-sm uppercase cursor-not-allowed"
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                El nombre de la empresa queda fijo e inmutable por acuerdo de canal comercial con Campo Directo.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Razón Social */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Razón Social *
                </label>
                <input
                  type="text"
                  required
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  placeholder="Ej: ADAMA ARGENTINA S.A."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold shadow-xs"
                />
              </div>

              {/* CUIT */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  CUIT *
                </label>
                <input
                  type="text"
                  required
                  value={cuit}
                  onChange={handleCuitChange}
                  placeholder="30-XXXXXXXX-X"
                  maxLength={13}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
                {cuitError && <p className="text-[11px] text-red-500 mt-0.5">{cuitError}</p>}
              </div>
            </div>

            {/* Contacto Comercial: Apellidos y Nombres */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Contacto Comercial: Apellidos y Nombres *
              </label>
              <input
                type="text"
                required
                value={contactoComercial}
                onChange={(e) => setContactoComercial(e.target.value)}
                placeholder="Ej: González, Martín Ignacio"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold shadow-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>WhatsApp Comercial *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+54 9 11 4892-3100"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Correo Electrónico *</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="comercial@empresa.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Dirección Comercial
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej: Av. Del Libertador 602"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Localidad
                </label>
                <input
                  type="text"
                  value={localidad}
                  onChange={(e) => setLocalidad(e.target.value)}
                  placeholder="Ej: Vicente López"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Provincia
                </label>
                <input
                  type="text"
                  value={provincia}
                  onChange={(e) => setProvincia(e.target.value)}
                  placeholder="BUENOS AIRES"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase shadow-xs font-medium"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios de Mis Datos</span>
              </button>
            </div>
          </form>
        </div>

        {/* Gestión de Claves (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-emerald-50/70 p-6 rounded-2xl border border-emerald-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-emerald-200/70">
              <KeyRound className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-950">
                Gestión de Claves
              </h3>
            </div>

            {/* Clave Activa Actual */}
            <div className="p-3.5 rounded-xl bg-white border border-emerald-200/80 mb-5 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                Usuario de Acceso Oficial
              </div>
              <div className="font-mono font-extrabold text-emerald-800 text-sm mb-3">
                {currentFactory?.usuario || `fab.${(session.empresa || "").toLowerCase()}`}
              </div>

              <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                Clave Activa Vigente
              </div>
              <div className="flex items-center justify-between bg-emerald-50/60 px-3 py-2 rounded-lg border border-emerald-200">
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {showPassword ? claveActual : "••••••••••••"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                Esta misma clave es visible por Campo Directo para asistencia comercial.
              </p>
            </div>

            {/* Formulario de Cambio de Clave */}
            <form onSubmit={handleUpdatePassword} className="space-y-3.5 text-xs">
              <h4 className="font-bold text-slate-800 text-xs">Modificar Contraseña</h4>

              {keyError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{keyError}</span>
                </div>
              )}

              {keySuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                  <span>¡Contraseña actualizada con éxito!</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nueva Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={nuevaClave}
                    onChange={(e) => setNuevaClave(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-2.5 flex items-center text-slate-400"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Confirmar Nueva Contraseña *
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={confirmarClave}
                  onChange={(e) => setConfirmarClave(e.target.value)}
                  placeholder="Repetir contraseña"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono shadow-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Actualizar Contraseña
              </button>
            </form>
          </div>

          {/* Tarjeta de Asistencia */}
          <div className="p-4 rounded-2xl bg-emerald-100/60 border border-emerald-200 text-xs text-emerald-900 shadow-xs">
            <div className="flex items-center gap-2 font-bold mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-800" />
              <span>Soporte Comercial Campo Directo</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800">
              Ante cualquier duda con tu cuenta o para dar de alta nuevos usuarios comerciales, comunicate con el equipo de operaciones de Campo Directo SRL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
