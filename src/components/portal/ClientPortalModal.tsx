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
  UserPlus,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";
import { useClientAuth, PortalTab } from "@/context/ClientAuthContext";
import { triggerGoogleAuth } from "@/utils/googleAuth";
import {
  ARGENTINE_PROVINCES,
  LOCALITIES_BY_PROVINCE,
  COUNTRY_PHONE_CODES,
  HORARIOS_PREFERIDOS,
  formatCuit,
  lookupCuitAfip,
  validateCuitModulo11,
} from "@/data/quotationHelper";
import { ClientRecoveryModal, RecoveryTab } from "@/components/portal/ClientRecoveryModal";
import { generateProposalPdf } from "@/utils/quotationPdfGenerator";

const ClientPortalModalContent: React.FC = () => {
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
    registerClient,
    loginWithGoogle,
    logout,
    updateProfile,
    changePassword,
    addEstablishment,
    deleteEstablishment,
  } = useClientAuth();

  // Modo de Autenticación: Login o Primer Ingreso (selección de credenciales / Google)
  const [authMode, setAuthMode] = useState<"login" | "primer-ingreso-creds">("login");

  // Control de pantalla "Registro de Cliente" (aparece recién tras haber ingresado con credenciales o Google)
  const [isClientRegistrationStep, setIsClientRegistrationStep] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [pendingPassword, setPendingPassword] = useState("");

  // Estados locales de Login
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Estados de Registro de Cliente (14 Campos Obligatorios en Mayúsculas)
  const [formReg, setFormReg] = useState({
    apellidos: "",
    nombres: "",
    fechaNacimiento: "",
    dni: "",
    whatsappCountryCode: "+54",
    whatsappNumber: "",
    email: "",
    provincia: "BUENOS AIRES",
    localidad: "",
    codigoPostal: "",
    cuit: "",
    razonSocial: "",
    condicionIva: "Responsable Inscripto" as "Responsable Inscripto" | "Monotributo" | "Exento" | "Consumidor Final",
    horariosPreferidos: ["MAÑANA (08:00 A 12:00 HS)"],
    observaciones: "",
    campoNombre: "",
    usuario: "",
    password: "",
    confirmPassword: "",
  });
  const [isCustomLocalidad, setIsCustomLocalidad] = useState(false);
  const [isRazonSocialAuto, setIsRazonSocialAuto] = useState(false);
  const [isAfipLoading, setIsAfipLoading] = useState(false);
  const [afipSuccessMessage, setAfipSuccessMessage] = useState<string | null>(null);
  const [afipErrorMessage, setAfipErrorMessage] = useState<string | null>(null);
  const [regError, setRegError] = useState("");
  const [isRegLoading, setIsRegLoading] = useState(false);

  const currentRegLocalities = React.useMemo(() => {
    return LOCALITIES_BY_PROVINCE[formReg.provincia] || [];
  }, [formReg.provincia]);

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

  // Reset al cerrar portal
  useEffect(() => {
    if (!isPortalOpen) {
      setAuthMode("login");
      setLoginError("");
      setRegError("");
      if (!isAuthenticated) {
        setIsClientRegistrationStep(false);
      }
    }
  }, [isPortalOpen, isAuthenticated]);

  // Si no está abierto, no renderizar nada
  if (!isPortalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = await login(loginId, loginPassword);
    if (!res.success) {
      setLoginError(res.error || "Usuario o contraseña inválidos");
      return;
    }
    setIsClientRegistrationStep(false);
  };

  const handlePrimerIngresoClick = () => {
    setLoginError("");
    setRegError("");
    setIsGoogleUser(false);

    const cleanId = loginId.trim().toUpperCase();
    const isEmail = cleanId.includes("@");
    setFormReg((prev) => ({
      ...prev,
      usuario: cleanId || prev.usuario,
      email: isEmail ? cleanId : prev.email,
      password: loginPassword,
      confirmPassword: loginPassword,
    }));
    setIsClientRegistrationStep(true);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setLoginError("");
      setRegError("");
      const googleUser = await triggerGoogleAuth();
      const loginRes = loginWithGoogle(googleUser);

      const existingUser = loginRes.user;
      const cleanCuit = (existingUser?.cuit || "").replace(/\D/g, "");
      const isComplete =
        cleanCuit.length === 11 &&
        cleanCuit !== "20000000000" &&
        cleanCuit !== "20334455667" &&
        Boolean(existingUser?.razonSocial && existingUser.razonSocial !== "PRODUCTOR AGROPECUARIO") &&
        Boolean(existingUser?.whatsapp || existingUser?.telefono) &&
        Boolean(existingUser?.localidad) &&
        Boolean(existingUser?.dni);

      if (!isComplete) {
        // Primer ingreso con Google: se muestra el FORMULARIO REGISTRO
        const nombres = (googleUser.given_name || googleUser.name?.split(" ")[0] || "").toUpperCase();
        const apellidos = (googleUser.family_name || googleUser.name?.split(" ").slice(1).join(" ") || "").toUpperCase();
        const email = googleUser.email.toUpperCase();

        setFormReg((prev) => ({
          ...prev,
          email,
          nombres: nombres || prev.nombres,
          apellidos: apellidos || prev.apellidos,
          razonSocial: googleUser.name?.toUpperCase() || `${apellidos} ${nombres}`.trim(),
          usuario: email,
        }));
        setIsGoogleUser(true);
        setIsClientRegistrationStep(true);
      } else {
        setIsClientRegistrationStep(false);
      }
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

  const handleApellidosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setFormReg((prev) => {
      const next = { ...prev, apellidos: val };
      if (isRazonSocialAuto || !prev.razonSocial.trim()) {
        const auto = `${val} ${prev.nombres}`.trim();
        next.razonSocial = auto;
        if (auto) setIsRazonSocialAuto(true);
      }
      return next;
    });
  };

  const handleNombresChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setFormReg((prev) => {
      const next = { ...prev, nombres: val };
      if (isRazonSocialAuto || !prev.razonSocial.trim()) {
        const auto = `${prev.apellidos} ${val}`.trim();
        next.razonSocial = auto;
        if (auto) setIsRazonSocialAuto(true);
      }
      return next;
    });
  };

  const handleFechaNacimientoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 8);
    if (v.length >= 5) {
      v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    } else if (v.length >= 3) {
      v = `${v.slice(0, 2)}/${v.slice(2)}`;
    }
    setFormReg((prev) => ({ ...prev, fechaNacimiento: v }));
  };

  const toggleHorario = (horario: string) => {
    setFormReg((prev) => {
      const exists = prev.horariosPreferidos.includes(horario);
      if (exists) {
        return {
          ...prev,
          horariosPreferidos: prev.horariosPreferidos.filter((h) => h !== horario),
        };
      } else {
        return {
          ...prev,
          horariosPreferidos: [...prev.horariosPreferidos, horario],
        };
      }
    });
  };

  const handleCuitChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 11);
    const formatted = formatCuit(rawVal);
    setFormReg((prev) => ({ ...prev, cuit: formatted }));

    setAfipSuccessMessage(null);
    setAfipErrorMessage(null);

    if (rawVal.length === 11) {
      if (!validateCuitModulo11(rawVal)) {
        setAfipErrorMessage("CUIT INVÁLIDO: El número ingresado no coincide con el dígito verificador oficial de AFIP.");
        return;
      }

      setIsAfipLoading(true);
      try {
        const result = await lookupCuitAfip(rawVal);
        if (!result.valid) {
          setAfipErrorMessage(result.error || "CUIT INVÁLIDO: No superó la validación oficial.");
        } else {
          if (result.dni) {
            setFormReg((prev) => (prev.dni ? prev : { ...prev, dni: result.dni! }));
          }

          const isCleanOfficialName =
            Boolean(result.razonSocial) &&
            typeof result.razonSocial === "string" &&
            result.razonSocial.trim().length >= 3 &&
            !/moment|just\s+a|cloudflare|challenge|turnstile|captcha|ray\s*id|attention|security|error/i.test(
              result.razonSocial
            ) &&
            /^[A-ZÁÉÍÓÚÑa-záéíóúñ0-9\s.,&'()-]+$/.test(result.razonSocial.trim());

          if (isCleanOfficialName) {
            const officialName = result.razonSocial!.trim().toUpperCase();
            setFormReg((prev) => {
              const updated = {
                ...prev,
                razonSocial: officialName,
              };
              if (result.isPersonaFisica) {
                const parts = officialName.trim().split(/\s+/);
                if (parts.length >= 2) {
                  if (!prev.apellidos.trim()) updated.apellidos = parts[0];
                  if (!prev.nombres.trim()) updated.nombres = parts.slice(1).join(" ");
                } else if (parts.length === 1) {
                  if (!prev.apellidos.trim()) updated.apellidos = parts[0];
                }
              }
              return updated;
            });
            setIsRazonSocialAuto(true);
            setAfipSuccessMessage(`✓ CUIT OFICIAL VALIDADO (${result.tipoPersona || "CONTRIBUYENTE"}): ${officialName}`);
          } else {
            const nombreCompleto = `${formReg.apellidos.trim()} ${formReg.nombres.trim()}`.trim();
            if (nombreCompleto) {
              setFormReg((prev) => ({ ...prev, razonSocial: nombreCompleto.toUpperCase() }));
              setIsRazonSocialAuto(true);
              setAfipSuccessMessage(`✓ CUIT VÁLIDO ANTE AFIP (${result.tipoPersona || "CONTRIBUYENTE"}): ${nombreCompleto.toUpperCase()}`);
            } else {
              setFormReg((prev) => ({ ...prev, razonSocial: "" }));
              setIsRazonSocialAuto(true);
              setAfipSuccessMessage(
                `✓ CUIT VÁLIDO ANTE AFIP (${result.tipoPersona || "CONTRIBUYENTE"}). Se completará automáticamente con tu Apellido y Nombre.`
              );
            }
          }
        }
      } catch (err) {
        console.error("Error al consultar CUIT:", err);
      } finally {
        setIsAfipLoading(false);
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!formReg.apellidos.trim()) {
      setRegError("EL CAMPO APELLIDO/S ES OBLIGATORIO");
      return;
    }
    if (!formReg.nombres.trim()) {
      setRegError("EL CAMPO NOMBRES/S ES OBLIGATORIO");
      return;
    }
    if (!formReg.fechaNacimiento.trim() || formReg.fechaNacimiento.length < 10) {
      setRegError("LA FECHA DE NACIMIENTO ES OBLIGATORIA (FORMATO DD/MM/AAAA)");
      return;
    }
    if (!formReg.dni.trim()) {
      setRegError("EL CAMPO DNI ES OBLIGATORIO");
      return;
    }
    if (!formReg.whatsappNumber.trim()) {
      setRegError("EL NÚMERO DE WHATSAPP ES OBLIGATORIO");
      return;
    }
    if (!formReg.email.trim() || !formReg.email.includes("@")) {
      setRegError("EL CORREO ELECTRÓNICO ES OBLIGATORIO Y DEBE SER VÁLIDO");
      return;
    }
    if (!formReg.provincia.trim()) {
      setRegError("LA PROVINCIA ES OBLIGATORIA");
      return;
    }
    if (!formReg.localidad.trim()) {
      setRegError("LA LOCALIDAD ES OBLIGATORIA");
      return;
    }
    if (!formReg.codigoPostal.trim() || formReg.codigoPostal.length !== 4) {
      setRegError("EL CÓDIGO POSTAL ES OBLIGATORIO (FORMATO DE 4 NÚMEROS)");
      return;
    }
    const cleanCuit = formReg.cuit.replace(/\D/g, "");
    if (cleanCuit.length !== 11) {
      setRegError("EL CUIT ES OBLIGATORIO Y DEBE TENER 11 DÍGITOS");
      return;
    }
    if (!validateCuitModulo11(cleanCuit)) {
      setRegError("EL CUIT INGRESADO NO ES VÁLIDO SEGÚN EL DÍGITO VERIFICADOR OFICIAL DE AFIP");
      return;
    }

    if (!isGoogleUser) {
      if (!formReg.usuario.trim()) {
        setRegError("POR FAVOR DEFINÍ UN NOMBRE DE USUARIO O CUIT/CORREO");
        return;
      }
      if (!formReg.password || formReg.password.length < 6) {
        setRegError("LA CONTRASEÑA DEBE TENER AL MENOS 6 CARACTERES");
        return;
      }
      if (formReg.password !== formReg.confirmPassword) {
        setRegError("LAS CONTRASEÑAS NO COINCIDEN");
        return;
      }
    }

    const autoResolvedRazonSocial = (
      formReg.razonSocial.trim() ||
      `${formReg.apellidos.trim()} ${formReg.nombres.trim()}`.trim() ||
      formReg.cuit
    ).toUpperCase();

    const fullWhatsapp = `${formReg.whatsappCountryCode} ${formReg.whatsappNumber.trim()}`;
    const cleanEmail = formReg.email.trim().toLowerCase();
    const cleanUser = (
      formReg.usuario.trim() ||
      cleanEmail.split("@")[0] ||
      `productor_${cleanCuit.slice(2, 10)}`
    ).toUpperCase();

    try {
      setIsRegLoading(true);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cuit: formReg.cuit.trim(),
          razonSocial: autoResolvedRazonSocial,
          apellidos: formReg.apellidos.trim().toUpperCase(),
          nombres: formReg.nombres.trim().toUpperCase(),
          fechaNacimiento: formReg.fechaNacimiento.trim(),
          dni: formReg.dni.trim(),
          email: cleanEmail,
          telefono: fullWhatsapp,
          whatsapp: fullWhatsapp,
          provincia: formReg.provincia,
          localidad: formReg.localidad.trim().toUpperCase(),
          codigoPostal: formReg.codigoPostal.trim(),
          campoNombre: formReg.campoNombre.trim() || "ESTABLECIMIENTO PRINCIPAL",
          usuario: cleanUser,
          password: isGoogleUser ? "GOOGLE_SSO_AUTH" : formReg.password,
          authProvider: isGoogleUser ? "google" : "local",
          horariosPreferidos: formReg.horariosPreferidos,
          observaciones: formReg.observaciones.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setRegError(data.error || "NO SE PUDO REGISTRAR LA CUENTA. INTENTE NUEVAMENTE.");
        setIsRegLoading(false);
        return;
      }

      const updatedProfile = {
        id: data.user?.id || user?.id || `cli-${Date.now()}`,
        usuario: cleanUser,
        razonSocial: autoResolvedRazonSocial,
        apellidos: formReg.apellidos.trim().toUpperCase(),
        nombres: formReg.nombres.trim().toUpperCase(),
        fechaNacimiento: formReg.fechaNacimiento.trim(),
        dni: formReg.dni.trim(),
        cuit: formReg.cuit.trim(),
        condicionIva: formReg.condicionIva,
        email: cleanEmail,
        telefono: fullWhatsapp,
        whatsapp: fullWhatsapp,
        provincia: formReg.provincia,
        localidad: formReg.localidad.trim().toUpperCase(),
        codigoPostal: formReg.codigoPostal.trim(),
        direccion: formReg.campoNombre.trim().toUpperCase() || "TRANQUERA PRINCIPAL",
        actividadPrincipal: "Producción Agropecuaria",
        horariosPreferidos: formReg.horariosPreferidos,
        observaciones: formReg.observaciones.trim().toUpperCase(),
        authProvider: isGoogleUser ? ("google" as const) : ("local" as const),
      };

      registerClient(updatedProfile);
      updateProfile(updatedProfile);

      if (formReg.campoNombre.trim()) {
        addEstablishment({
          nombre: formReg.campoNombre.trim().toUpperCase(),
          provincia: formReg.provincia,
          localidad: formReg.localidad.trim().toUpperCase(),
          hectareas: 300,
          actividad: "Agrícola",
          referenciaAcceso: "Tranquera Principal",
          coordenadasGps: "",
          tipoDescarga: "Tranquera de campo / Silobolsa",
          esPrincipal: true,
        });
      }

      setIsClientRegistrationStep(false);
    } catch (err: any) {
      console.error("Error en registro:", err);
      setRegError(err?.message || "ERROR AL PROCESAR EL REGISTRO. VERIFIQUE SU CONEXIÓN.");
    } finally {
      setIsRegLoading(false);
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
        className={`relative w-full ${(!isAuthenticated || isClientRegistrationStep) ? (isClientRegistrationStep ? "max-w-4xl" : "max-w-md") : "max-w-4xl"} bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[92vh] max-h-[860px] animate-in fade-in zoom-in-95 duration-200`}
      >
        {/* ========================================================================= */}
        {/* VISTA 1: LOGIN O FORMULARIO REGISTRO                                      */}
        {/* ========================================================================= */}
        {!isAuthenticated || isClientRegistrationStep ? (
          <div className="flex-1 flex flex-col justify-between overflow-y-auto p-4 sm:p-7">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
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
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                    {isClientRegistrationStep ? (
                      <>
                        FORMULARIO <span className="text-campo-green">REGISTRO</span>
                      </>
                    ) : (
                      <>
                        Acceso a <span className="text-campo-green">Clientes</span>
                      </>
                    )}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">
                    {isClientRegistrationStep
                      ? "(TODOS LOS CAMPOS SOLO DEBE TENER LA OPCIÓN MAYÚSCULAS)"
                      : "Portal exclusivo de autogestión para productores y empresas"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closePortal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Cerrar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* =================================================================== */}
            {/* CASO 1: FORMULARIO REGISTRO (14 CAMPOS EN MAYÚSCULAS)               */}
            {/* =================================================================== */}
            {isClientRegistrationStep ? (
              <div className="max-w-3xl w-full mx-auto my-auto py-2">
                <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                  {/* Banner de Estado Google o Botón Google */}
                  {isGoogleUser ? (
                    <div className="flex items-center justify-between p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl mb-3">
                      <div className="flex items-center gap-2.5">
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                        <div>
                          <p className="text-xs font-bold text-slate-800 uppercase">
                            VINCULADO CON CUENTA DE GOOGLE
                          </p>
                          <p className="text-[11px] font-semibold text-slate-600">
                            {formReg.email}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsClientRegistrationStep(false);
                          setAuthMode("login");
                        }}
                        className="text-[11px] font-bold text-slate-500 hover:text-red-600 transition-colors uppercase cursor-pointer"
                      >
                        Cambiar cuenta
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end mb-3">
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isGoogleLoading}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs uppercase cursor-pointer disabled:opacity-50"
                      >
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
                        <span>
                          {isGoogleLoading
                            ? "CONECTANDO..."
                            : "COMPLETAR CON MI CUENTA GOOGLE"}
                        </span>
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    {/* 1. Apellido/s y 2. Nombres */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                            APELLIDO/S *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="APELLIDOS"
                            value={formReg.apellidos}
                            onChange={handleApellidosChange}
                            className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                            NOMBRES/S *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="NOMBRES"
                            value={formReg.nombres}
                            onChange={handleNombresChange}
                            className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. Fecha Nacimiento & 4. DNI */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                            FECHA NACIMIENTO (DD/MM/AAAA) *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="DD/MM/AAAA"
                            maxLength={10}
                            value={formReg.fechaNacimiento}
                            onChange={handleFechaNacimientoChange}
                            className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                            DNI *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="NÚMERO DE DOCUMENTO"
                            value={formReg.dni}
                            onChange={(e) =>
                              setFormReg((prev) => ({
                                ...prev,
                                dni: e.target.value.replace(/\D/g, "").slice(0, 9),
                              }))
                            }
                            className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 5. WhatsApp & 6. Correo Electrónico */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                            WHATSAPP (CÓDIGO PAÍS Y NÚMERO) *
                          </label>
                          <div className="flex gap-2 min-w-0">
                            <select
                              value={formReg.whatsappCountryCode}
                              onChange={(e) =>
                                setFormReg((prev) => ({
                                  ...prev,
                                  whatsappCountryCode: e.target.value,
                                }))
                              }
                              className="w-24 sm:w-28 py-2 px-2 rounded-lg border border-slate-300 text-xs font-bold bg-slate-50 focus:outline-none focus:border-campo-green shrink-0 cursor-pointer"
                            >
                              {COUNTRY_PHONE_CODES.map((c) => (
                                <option key={c.code} value={c.code}>
                                  {c.flag} {c.code} ({c.name.toUpperCase()})
                                </option>
                              ))}
                            </select>
                            <input
                              type="tel"
                              required
                              placeholder="EJ. 358 5095475"
                              value={formReg.whatsappNumber}
                              onChange={(e) =>
                                setFormReg((prev) => ({
                                  ...prev,
                                  whatsappNumber: e.target.value.replace(/[^0-9 ]/g, ""),
                                }))
                              }
                              className="flex-1 min-w-0 py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                            CORREO ELECTRÓNICO *
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="EJEMPLO@CORREO.COM"
                            value={formReg.email}
                            onChange={(e) =>
                              setFormReg((prev) => ({
                                ...prev,
                                email: e.target.value.toUpperCase(),
                              }))
                            }
                            className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 7. Provincia, 8. Localidad y 9. Código Postal */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-5">
                          <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                            PROVINCIA (DESPLEGABLE) *
                          </label>
                          <select
                            value={formReg.provincia}
                            onChange={(e) => {
                              const newProv = e.target.value.toUpperCase();
                              setIsCustomLocalidad(false);
                              setFormReg((prev) => ({
                                ...prev,
                                provincia: newProv,
                                localidad: "",
                              }));
                            }}
                            className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:border-campo-green cursor-pointer"
                          >
                            {ARGENTINE_PROVINCES.map((prov) => (
                              <option key={prov} value={prov}>
                                {prov}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                            LOCALIDAD (DESPLEGABLE) *
                          </label>
                          <select
                            required
                            value={isCustomLocalidad ? "OTRA" : formReg.localidad}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "OTRA") {
                                setIsCustomLocalidad(true);
                                setFormReg((prev) => ({ ...prev, localidad: "" }));
                              } else {
                                setIsCustomLocalidad(false);
                                setFormReg((prev) => ({ ...prev, localidad: val }));
                              }
                            }}
                            className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:border-campo-green cursor-pointer"
                          >
                            <option value="">-- SELECCIONÁ TU LOCALIDAD ({currentRegLocalities.length}) --</option>
                            {currentRegLocalities.map((loc) => (
                              <option key={loc} value={loc}>
                                {loc}
                              </option>
                            ))}
                            <option value="OTRA">OTRA LOCALIDAD (ESCRIBIR MANUALMENTE)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                            CÓDIGO POSTAL (4 NÚMEROS) *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="EJ. 5800"
                            maxLength={4}
                            value={formReg.codigoPostal}
                            onChange={(e) =>
                              setFormReg((prev) => ({
                                ...prev,
                                codigoPostal: e.target.value.replace(/\D/g, "").slice(0, 4),
                              }))
                            }
                            className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:border-campo-green"
                          />
                        </div>

                        {isCustomLocalidad && (
                          <div className="sm:col-span-12">
                            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                              ESCRIBÍ TU LOCALIDAD, PARAJE O COLONIA *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="ESCRIBÍ EL NOMBRE DE TU LOCALIDAD"
                              value={formReg.localidad}
                              onChange={(e) =>
                                setFormReg((prev) => ({
                                  ...prev,
                                  localidad: e.target.value.toUpperCase(),
                                }))
                              }
                              className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:border-campo-green"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 10. CUIT y 11. Nombre o Razón Social con AFIP */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-black uppercase text-slate-700">
                              CUIT EMPRESA O PERSONA FÍSICA *
                            </label>
                            {isAfipLoading && (
                              <span className="inline-flex items-center text-[10px] text-campo-green font-bold gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                VALIDANDO AFIP / BCRA...
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            required
                            placeholder="XX-XXXXXXXX-X"
                            maxLength={13}
                            value={formReg.cuit}
                            onChange={handleCuitChange}
                            className={`w-full uppercase py-2 px-3 rounded-lg border text-xs font-semibold focus:outline-none transition-colors ${
                              afipErrorMessage
                                ? "border-red-400 bg-red-50/20 text-red-900 focus:border-red-500"
                                : afipSuccessMessage
                                ? "border-campo-green bg-campo-green-50/20 text-slate-900 focus:border-campo-green"
                                : "border-slate-300 focus:border-campo-green bg-white"
                            }`}
                          />
                          <div className="mt-1.5 flex items-center justify-between">
                            <a
                              href="https://seti.afip.gob.ar/padron-puc-constancia-internet/ConsultaConstanciaAction.do"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-campo-green hover:underline uppercase"
                            >
                              <span>Consultar Constancia Oficial en AFIP (ARCA)</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-black uppercase text-slate-700">
                              NOMBRE O RAZÓN SOCIAL A FACTURAR *
                            </label>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              readOnly
                              tabIndex={-1}
                              placeholder="BÚSQUEDA AUTOMÁTICA EN AFIP SEGÚN CUIT"
                              value={formReg.razonSocial}
                              className={`w-full uppercase py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-default select-none ${
                                formReg.razonSocial
                                  ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 font-black"
                                  : "bg-slate-50 border-slate-300 text-slate-400 font-semibold"
                              } focus:outline-none`}
                            />
                            {formReg.razonSocial && (
                              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  VALIDADO
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {afipSuccessMessage && (
                        <p className="mt-2 text-[10px] font-bold text-campo-green flex items-center gap-1.5 break-words">
                          <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />
                          <span className="flex-1 break-words">{afipSuccessMessage}</span>
                        </p>
                      )}

                      {afipErrorMessage && (
                        <p className="mt-2 text-[10px] font-bold text-red-600 flex items-center gap-1.5 break-words">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span className="flex-1 break-words">{afipErrorMessage}</span>
                        </p>
                      )}
                    </div>

                    {/* 12. Horario de Contacto Preferido */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      <label className="block text-[11px] font-black uppercase text-slate-700 mb-2">
                        HORARIO DE CONTACTO PREFERIDO (LISTA DE HORARIOS CON TILDES)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {HORARIOS_PREFERIDOS.map((horario) => {
                          const isChecked = formReg.horariosPreferidos.includes(horario);
                          return (
                            <button
                              type="button"
                              key={horario}
                              onClick={() => toggleHorario(horario)}
                              className={`flex items-center gap-2.5 p-2 rounded-lg border text-left text-xs transition-colors uppercase cursor-pointer ${
                                isChecked
                                  ? "border-campo-green bg-campo-green-50 text-campo-green-950 font-bold"
                                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded flex items-center justify-center border ${
                                  isChecked
                                    ? "bg-campo-green border-campo-green text-white"
                                    : "border-slate-300 bg-white"
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </span>
                              <span className="text-[11px]">{horario}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 13. Observaciones */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                        OBSERVACIONES (OPCIONAL)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="DETALLES DE ENTREGA, PLAZOS O CONDICIONES PARTICULARES..."
                        value={formReg.observaciones}
                        onChange={(e) =>
                          setFormReg((prev) => ({
                            ...prev,
                            observaciones: e.target.value.toUpperCase(),
                          }))
                        }
                        className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                      />
                    </div>

                    {/* 14. Usuario y Contraseña */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <span className="block text-[11px] font-black uppercase text-slate-700">
                        USUARIO Y CONTRASEÑA DE ACCESO
                      </span>
                      {isGoogleUser ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase text-slate-500">USUARIO</p>
                              <p className="text-xs font-bold text-slate-900 truncate uppercase">REGISTRADO CON GOOGLE</p>
                              <p className="text-[11px] font-semibold text-slate-600 truncate">{formReg.email}</p>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase text-slate-500">CONTRASEÑA</p>
                              <p className="text-xs font-bold text-slate-900 uppercase">CONTRASEÑA DE GMAIL</p>
                              <p className="text-[11px] font-semibold text-slate-600">GESTIONADA POR GOOGLE</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                              USUARIO (EMAIL / CUIT) *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="USUARIO"
                              value={formReg.usuario}
                              onChange={(e) =>
                                setFormReg((prev) => ({
                                  ...prev,
                                  usuario: e.target.value.toUpperCase(),
                                }))
                              }
                              className="w-full uppercase py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                              CONTRASEÑA *
                            </label>
                            <input
                              type="password"
                              required
                              placeholder="MÍNIMO 6 CARACTERES"
                              value={formReg.password}
                              onChange={(e) =>
                                setFormReg((prev) => ({
                                  ...prev,
                                  password: e.target.value,
                                }))
                              }
                              className="w-full py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                              CONFIRMAR CONTRASEÑA *
                            </label>
                            <input
                              type="password"
                              required
                              placeholder="REPETIR CONTRASEÑA"
                              value={formReg.confirmPassword}
                              onChange={(e) =>
                                setFormReg((prev) => ({
                                  ...prev,
                                  confirmPassword: e.target.value,
                                }))
                              }
                              className="w-full py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold focus:border-campo-green focus:outline-none bg-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mensaje de Error */}
                    {regError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="uppercase">{regError}</span>
                      </div>
                    )}

                    {/* Botón Enviar */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isRegLoading}
                        className="w-full py-3.5 px-4 rounded-xl bg-campo-green hover:bg-campo-green-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-campo-green/20 uppercase cursor-pointer disabled:opacity-50"
                      >
                        {isRegLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>REGISTRANDO CUENTA...</span>
                          </>
                        ) : (
                          <>
                            <span>FINALIZAR REGISTRO Y CONTINUAR</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              /* =================================================================== */
              /* CASO 2: FORMULARIO DE LOGIN PRINCIPAL                               */
              /* =================================================================== */
              <div className="max-w-md w-full mx-auto my-auto py-5">
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

                    {/* Botón Ingresar a mi cuenta */}
                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-campo-green hover:bg-campo-green-600 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                    >
                      <span>INGRESAR A MI CUENTA</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Botón Primer Ingreso */}
                    <button
                      type="button"
                      onClick={handlePrimerIngresoClick}
                      className="w-full py-3 px-4 bg-campo-green hover:bg-campo-green-600 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 mt-2.5 cursor-pointer uppercase tracking-wider"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>PRIMER INGRESO</span>
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
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2.5 uppercase disabled:opacity-50 cursor-pointer"
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
            )}

            {/* Footer Modal */}
            <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-campo-green" />
                Conexión encriptada y protegida de Campo Directo
              </span>
              <span>
                {isClientRegistrationStep ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsClientRegistrationStep(false);
                      setAuthMode("login");
                    }}
                    className="font-bold text-campo-green hover:underline cursor-pointer uppercase"
                  >
                    ¿Ya tenés cuenta? Iniciar Sesión
                  </button>
                ) : (
                  <>
                    ¿Primer ingreso?{" "}
                    <button
                      type="button"
                      onClick={handlePrimerIngresoClick}
                      className="font-bold text-campo-green hover:underline cursor-pointer"
                    >
                      Registrate aquí
                    </button>
                  </>
                )}
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
                  {(establishments || []).length}
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
                  {(sentQuotations || []).length}
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
                  {(receivedQuotations || []).filter((r) => r && r.estado === "VIGENTE").length}
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

                  {(sentQuotations || []).length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300">
                      <Send className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-medium">
                        Aún no tenés cotizaciones enviadas registradas.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(sentQuotations || []).map((quotation) => (
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
                              Productos Solicitados ({(quotation.items || []).length}):
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              {(quotation.items || []).map((item, idx) => (
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
                    {(receivedQuotations || []).map((prop) => (
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
                              U$S {(prop.totalUsd || 0).toLocaleString("es-AR")}
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
                            {(prop.items || []).map((it) => (
                              <div
                                key={it.id}
                                className="p-2.5 bg-white flex items-center justify-between text-xs"
                              >
                                <div>
                                  <span className="font-bold text-slate-800">{it.descripcion}</span>
                                  <span className="text-slate-500 block text-[11px]">
                                    Cantidad: {it.cantidad} · Unitario: U$S {(it.precioUnitarioUsd != null ? Number(it.precioUnitarioUsd) : 0).toFixed(2)}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-slate-900">
                                    U$S {(it.subtotalUsd || 0).toLocaleString("es-AR")}
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

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class PortalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("PortalErrorBoundary caught error:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem("cd_client_user");
      localStorage.removeItem("cd_client_rec_quotations");
      localStorage.removeItem("cd_client_sent_quotations");
      localStorage.removeItem("cd_client_establishments");
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border border-red-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Portal de Clientes en Mantenimiento</h3>
            <p className="text-xs text-slate-600">
              Ocurrió una interrupción al cargar la información del portal. Podés reiniciar la sesión o comunicarte directamente por WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 bg-campo-green text-white text-xs font-bold rounded-xl hover:bg-campo-green-600 transition-colors"
              >
                Limpiar datos y reintentar
              </button>
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const ClientPortalModal: React.FC = () => {
  return (
    <PortalErrorBoundary>
      <ClientPortalModalContent />
    </PortalErrorBoundary>
  );
};

