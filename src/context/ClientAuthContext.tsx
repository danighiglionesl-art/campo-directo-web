"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  ClientProfile,
  Establishment,
  SentQuotation,
  ReceivedQuotation,
} from "@/types/portal";

export type PortalTab =
  | "mis-datos"
  | "cambiar-password"
  | "mis-establecimientos"
  | "cotizaciones-enviadas"
  | "cotizaciones-recibidas";

interface ClientAuthContextType {
  user: ClientProfile | null;
  isAuthenticated: boolean;
  isPortalOpen: boolean;
  activeTab: PortalTab;
  establishments: Establishment[];
  sentQuotations: SentQuotation[];
  receivedQuotations: ReceivedQuotation[];
  openPortal: (tab?: PortalTab) => void;
  closePortal: () => void;
  setActiveTab: (tab: PortalTab) => void;
  login: (usuarioOrCuit: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerClient: (profileData: Partial<ClientProfile>) => { success: boolean; user: ClientProfile };
  loginDemo: () => void;
  loginWithGoogle: (googleUser: {
    email: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
  }) => { success: boolean; user: ClientProfile };
  logout: () => void;
  updateProfile: (updated: Partial<ClientProfile>) => void;
  changePassword: (currentPass: string, newPass: string) => { success: boolean; error?: string };
  addEstablishment: (est: Omit<Establishment, "id">) => void;
  updateEstablishment: (id: string, est: Partial<Establishment>) => void;
  deleteEstablishment: (id: string) => void;
  addSentQuotation: (quotation: {
    operacion: "COMPRA" | "VENTA";
    items: {
      tipo: "insumo" | "semilla" | "grano";
      nombre: string;
      categoriaOVariedad: string;
      empresa: string;
      cantidad: number;
      unidad: string;
      detalle?: string;
    }[];
    establecimientoDestino?: string;
    formaPago?: string;
    observaciones?: string;
  }) => string;
}

const defaultClientProfile: ClientProfile = {
  id: "cli-001",
  usuario: "agroperez",
  razonSocial: "AGROPECUARIA PEREZ S.A.",
  apellidos: "PEREZ",
  nombres: "JUAN CARLOS",
  cuit: "20-33445566-7",
  condicionIva: "Responsable Inscripto",
  email: "administracion@agroperez.com.ar",
  telefono: "+54 9 358 4642200",
  whatsapp: "+54 9 358 5095475",
  provincia: "Córdoba",
  localidad: "Río Cuarto",
  codigoPostal: "5800",
  direccion: "Ruta Nac. 8 Km 605 - Parque Industrial",
  actividadPrincipal: "Producción Agrícola Extensiva (Soja, Maíz, Trigo, Girasol)",
};

const defaultEstablishments: Establishment[] = [];

const defaultSentQuotations: SentQuotation[] = [];

const defaultReceivedQuotations: ReceivedQuotation[] = [];

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

export const ClientAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ClientProfile | null>(null);
  const [isPortalOpen, setIsPortalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<PortalTab>("mis-datos");
  const [establishments, setEstablishments] = useState<Establishment[]>(defaultEstablishments);
  const [sentQuotations, setSentQuotations] = useState<SentQuotation[]>(defaultSentQuotations);
  const [receivedQuotations, setReceivedQuotations] = useState<ReceivedQuotation[]>(defaultReceivedQuotations);

  // Cargar estado inicial desde localStorage (cliente)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const demoUsernames = ["agroperez", "lasmarias", "donesteban", "laaurora", "coopbellville"];
      const demoCuits = [
        "30-71234567-8",
        "30-68945231-4",
        "33-71458923-9",
        "33-70894512-9",
        "30-54123789-2",
        "20-33445566-7",
      ];
      const demoClientIds = ["cli-001", "cli-002", "cli-003", "cli-004", "cli-005"];

      const savedUser = localStorage.getItem("cd_client_user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          const isDemo =
            !parsed ||
            demoClientIds.includes(parsed.id) ||
            demoCuits.includes(parsed.cuit) ||
            demoUsernames.includes((parsed.usuario || "").toLowerCase());
          if (isDemo) {
            localStorage.removeItem("cd_client_user");
            setUser(null);
          } else {
            setUser(parsed);
          }
        } catch {
          setUser(null);
        }
      }
      const savedEst = localStorage.getItem("cd_client_establishments");
      if (savedEst) {
        try {
          const parsed = JSON.parse(savedEst);
          const cleaned = Array.isArray(parsed)
            ? parsed.filter((e: Establishment) => !["est-001", "est-002", "est-003", "est-004", "est-005"].includes(e.id))
            : [];
          setEstablishments(cleaned);
          localStorage.setItem("cd_client_establishments", JSON.stringify(cleaned));
        } catch {
          setEstablishments([]);
        }
      } else {
        setEstablishments([]);
      }
      const savedSent = localStorage.getItem("cd_client_sent_quotations");
      if (savedSent) {
        try {
          const parsed = JSON.parse(savedSent);
          const demoSent = ["sent-001", "sent-002", "sent-003", "sent-004"];
          const cleaned = Array.isArray(parsed)
            ? parsed.filter((s: SentQuotation) => !demoSent.includes(s.id))
            : [];
          setSentQuotations(cleaned);
          localStorage.setItem("cd_client_sent_quotations", JSON.stringify(cleaned));
        } catch {
          setSentQuotations([]);
        }
      } else {
        setSentQuotations([]);
      }
      const savedRec = localStorage.getItem("cd_client_rec_quotations");
      if (savedRec) {
        try {
          const parsed = JSON.parse(savedRec);
          const demoRec = ["rec-001", "rec-002", "rec-003"];
          const cleaned = Array.isArray(parsed)
            ? parsed.filter((r: ReceivedQuotation) => !demoRec.includes(r.id))
            : [];
          setReceivedQuotations(cleaned);
          localStorage.setItem("cd_client_rec_quotations", JSON.stringify(cleaned));
        } catch {
          setReceivedQuotations([]);
        }
      } else {
        setReceivedQuotations([]);
      }
    } catch (e) {
      console.error("Error al leer datos locales de cliente:", e);
    }
  }, []);

  const openPortal = (tab?: PortalTab) => {
    if (tab) setActiveTab(tab);
    setIsPortalOpen(true);
  };

  const closePortal = () => {
    setIsPortalOpen(false);
  };

  const login = async (
    usuarioOrCuit: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanId = usuarioOrCuit.trim();
    if (!cleanId) {
      return { success: false, error: "Por favor ingresá tu usuario, CUIT o correo electrónico." };
    }
    if (!password.trim()) {
      return { success: false, error: "Por favor ingresá tu contraseña." };
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: cleanId, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data?.error || "Credenciales inválidas. Verificá tus datos.",
        };
      }

      const profileToUse: ClientProfile = {
        ...defaultClientProfile,
        id: data.user.id || `cli-${Date.now()}`,
        usuario: data.user.usuario || cleanId,
        razonSocial: data.user.razonSocial || cleanId.toUpperCase(),
        apellidos: data.user.apellidos || "PRODUCTOR",
        nombres: data.user.nombres || "AGROPECUARIO",
        cuit: data.user.cuit || "20-00000000-0",
        email: data.user.email || (cleanId.includes("@") ? cleanId : defaultClientProfile.email),
        telefono: data.user.telefono || "",
        whatsapp: data.user.whatsapp || "",
      };

      setUser(profileToUse);
      try {
        localStorage.setItem("cd_client_user", JSON.stringify(profileToUse));
      } catch (e) {
        console.error(e);
      }
      return { success: true };
    } catch (e) {
      console.warn("Fallo de red al autenticar con API, usando respaldo local:", e);
      // Respaldo local de contingencia offline
      const profileToUse: ClientProfile = {
        ...defaultClientProfile,
        usuario: cleanId.includes("@") ? cleanId.split("@")[0].toLowerCase() : cleanId.toLowerCase(),
        email: cleanId.includes("@") ? cleanId.toLowerCase() : defaultClientProfile.email,
      };

      setUser(profileToUse);
      try {
        localStorage.setItem("cd_client_user", JSON.stringify(profileToUse));
      } catch (err) {
        console.error(err);
      }
      return { success: true };
    }
  };

  const registerClient = (profileData: Partial<ClientProfile>): { success: boolean; user: ClientProfile } => {
    const newProfile: ClientProfile = {
      id: profileData.id || `cli-${Date.now()}`,
      usuario: profileData.usuario || "",
      razonSocial: profileData.razonSocial || "",
      apellidos: profileData.apellidos || "",
      nombres: profileData.nombres || "",
      fechaNacimiento: profileData.fechaNacimiento || "",
      dni: profileData.dni || "",
      cuit: profileData.cuit || "",
      condicionIva: profileData.condicionIva || "Responsable Inscripto",
      email: profileData.email || "",
      telefono: profileData.telefono || profileData.whatsapp || "",
      whatsapp: profileData.whatsapp || "",
      provincia: profileData.provincia || "BUENOS AIRES",
      localidad: profileData.localidad || "",
      codigoPostal: profileData.codigoPostal || "",
      direccion: profileData.direccion || "",
      actividadPrincipal: profileData.actividadPrincipal || "Producción Agropecuaria",
      horariosPreferidos: profileData.horariosPreferidos || [],
      observaciones: profileData.observaciones || "",
      authProvider: profileData.authProvider || "local",
      ...profileData,
    };
    setUser(newProfile);
    try {
      localStorage.setItem("cd_client_user", JSON.stringify(newProfile));
    } catch (e) {
      console.error(e);
    }
    return { success: true, user: newProfile };
  };

  const loginDemo = () => {
    setUser(defaultClientProfile);
    try {
      localStorage.setItem("cd_client_user", JSON.stringify(defaultClientProfile));
    } catch (e) {
      console.error(e);
    }
  };

  const loginWithGoogle = (googleUser: {
    email: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
  }): { success: boolean; user: ClientProfile } => {
    const email = googleUser.email.trim();
    const usuario = email.split("@")[0].toUpperCase();
    const nombres = (
      googleUser.given_name ||
      googleUser.name?.split(" ")[0] ||
      ""
    ).toUpperCase();
    const apellidos = (
      googleUser.family_name ||
      googleUser.name?.split(" ").slice(1).join(" ") ||
      ""
    ).toUpperCase();
    const razonSocial = (googleUser.name || `${apellidos} ${nombres}`).trim().toUpperCase();

    let baseProfile: ClientProfile = {
      id: `cli-${Date.now()}`,
      usuario,
      razonSocial,
      apellidos,
      nombres,
      fechaNacimiento: "",
      dni: "",
      cuit: "",
      condicionIva: "Responsable Inscripto",
      email: email.toLowerCase(),
      telefono: "",
      whatsapp: "",
      provincia: "BUENOS AIRES",
      localidad: "",
      codigoPostal: "",
      direccion: "",
      actividadPrincipal: "Producción Agropecuaria",
      horariosPreferidos: [],
      observaciones: "",
      authProvider: "google",
    };

    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("cd_client_user");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (
            parsed &&
            (parsed.email?.toLowerCase() === email.toLowerCase() ||
              parsed.usuario?.toLowerCase() === usuario.toLowerCase()) &&
            parsed.cuit &&
            parsed.cuit !== "20-33445566-7"
          ) {
            baseProfile = {
              ...parsed,
              email: email.toLowerCase(),
              nombres: nombres || parsed.nombres,
              apellidos: apellidos || parsed.apellidos,
              authProvider: "google",
            };
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    setUser(baseProfile);
    try {
      localStorage.setItem("cd_client_user", JSON.stringify(baseProfile));
    } catch (e) {
      console.error(e);
    }

    return { success: true, user: baseProfile };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("cd_client_user");
    } catch (e) {
      console.error(e);
    }
  };

  const updateProfile = (updated: Partial<ClientProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem("cd_client_user", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const changePassword = (currentPass: string, newPass: string): { success: boolean; error?: string } => {
    if (!currentPass.trim()) {
      return { success: false, error: "Debes ingresar tu contraseña actual." };
    }
    if (!newPass.trim() || newPass.length < 6) {
      return { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres." };
    }
    // Guardar simulación de cambio exitoso
    return { success: true };
  };

  const addEstablishment = (est: Omit<Establishment, "id">) => {
    const newEst: Establishment = {
      ...est,
      id: `est-${Date.now()}`,
      linkMaps: est.coordenadasGps
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(est.coordenadasGps)}`
        : undefined,
    };
    setEstablishments((prev) => {
      const next = [newEst, ...prev];
      try {
        localStorage.setItem("cd_client_establishments", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const updateEstablishment = (id: string, est: Partial<Establishment>) => {
    setEstablishments((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...est } : item));
      try {
        localStorage.setItem("cd_client_establishments", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const deleteEstablishment = (id: string) => {
    setEstablishments((prev) => {
      const next = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("cd_client_establishments", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const addSentQuotation = (quotation: {
    operacion: "COMPRA" | "VENTA";
    items: {
      tipo: "insumo" | "semilla" | "grano";
      nombre: string;
      categoriaOVariedad: string;
      empresa: string;
      cantidad: number;
      unidad: string;
      detalle?: string;
    }[];
    establecimientoDestino?: string;
    formaPago?: string;
    observaciones?: string;
  }): string => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `CD-2026-${randomNum}`;
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now.getFullYear()}`;

    const newQuotation: SentQuotation = {
      id: `sent-${Date.now()}`,
      numero: code,
      fecha: formattedDate,
      operacion: quotation.operacion,
      estado: "EN EVALUACIÓN",
      establecimientoDestino: quotation.establecimientoDestino || "Establecimiento Principal",
      formaPago: quotation.formaPago,
      items: quotation.items.map((it, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        ...it,
      })),
      observaciones: quotation.observaciones,
    };

    setSentQuotations((prev) => {
      const next = [newQuotation, ...prev];
      try {
        localStorage.setItem("cd_client_sent_quotations", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    return code;
  };

  return (
    <ClientAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isPortalOpen,
        activeTab,
        establishments,
        sentQuotations,
        receivedQuotations,
        openPortal,
        closePortal,
        setActiveTab,
        login,
        registerClient,
        loginDemo,
        loginWithGoogle,
        logout,
        updateProfile,
        changePassword,
        addEstablishment,
        updateEstablishment,
        deleteEstablishment,
        addSentQuotation,
      }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
};

export const useClientAuth = () => {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error("useClientAuth debe ser usado dentro de un ClientAuthProvider");
  }
  return context;
};
