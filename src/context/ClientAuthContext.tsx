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
  login: (usuarioOrCuit: string, password: string) => { success: boolean; error?: string };
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

const defaultSentQuotations: SentQuotation[] = [
  {
    id: "sent-001",
    numero: "CD-2026-0842",
    fecha: "15/09/2026",
    operacion: "COMPRA",
    estado: "EN EVALUACIÓN",
    establecimientoDestino: "La Rinconada (Río Cuarto)",
    items: [
      {
        id: "item-1",
        tipo: "insumo",
        nombre: "Arsonex",
        categoriaOVariedad: "Herbicida",
        empresa: "AGROSUMA",
        cantidad: 120,
        unidad: "Lts",
        detalle: "Principio Activo: Imazamox",
      },
      {
        id: "item-2",
        tipo: "semilla",
        nombre: "DM 46E26 SE",
        categoriaOVariedad: "Soja",
        empresa: "DON MARIO",
        cantidad: 40,
        unidad: "Bolsas",
        detalle: "Tecnología: Enlist E3 / STS",
      },
    ],
    formaPago: "Transferencia Bancaria",
    observaciones: "Cotización con flete directo a campo. Entrega primera quincena de Octubre.",
  },
  {
    id: "sent-002",
    numero: "CD-2026-0791",
    fecha: "28/08/2026",
    operacion: "COMPRA",
    estado: "COTIZADA",
    establecimientoDestino: "El Trébol (Adelia María)",
    formaPago: "Canje de granos",
    items: [
      {
        id: "item-3",
        tipo: "insumo",
        nombre: "Urea Granulada 46% N",
        categoriaOVariedad: "Fertilizante",
        empresa: "PROFERTIL",
        cantidad: 25,
        unidad: "Tn",
        detalle: "A granel con descarga directa",
      },
    ],
    observaciones: "Condición canje disponible o pago diferido.",
  },
];

const defaultReceivedQuotations: ReceivedQuotation[] = [
  {
    id: "rec-001",
    numero: "PROP-9041",
    fecha: "16/09/2026",
    vencimiento: "25/09/2026",
    asunto: "Propuesta Comercial Campaña Gruesa 2026/27 - Herbicidas & Semillas",
    estado: "VIGENTE",
    totalUsd: 14850,
    condicionPago: "Canje Cereal Mayo 2027 o 180 días con e-Cheq Tasa 0%",
    plazoEntrega: "Entrega programada a campo dentro de los 5 días de confirmación",
    items: [
      {
        id: "item-r1",
        descripcion: "Arsonex Herbicida (Imazamox) - AGM/AGROSUMA",
        cantidad: "120 Lts",
        precioUnitarioUsd: 32.5,
        subtotalUsd: 3900,
      },
      {
        id: "item-r2",
        descripcion: "DM 46E26 SE Semilla Soja Curada Don Mario",
        cantidad: "40 Bolsas",
        precioUnitarioUsd: 55.0,
        subtotalUsd: 2200,
      },
      {
        id: "item-r3",
        descripcion: "Fertilizante Foliar Bioestimulante Spraytec",
        cantidad: "150 Lts",
        precioUnitarioUsd: 18.0,
        subtotalUsd: 2700,
      },
      {
        id: "item-r4",
        descripcion: "Urea Granulada Profertil a Granel",
        cantidad: "12 Tn",
        precioUnitarioUsd: 504.16,
        subtotalUsd: 6050,
      },
    ],
    observaciones:
      "Precios oficiales directos de fábrica sin intermediaciones. Flete bonificado puesto en La Rinconada.",
  },
  {
    id: "rec-002",
    numero: "PROP-8812",
    fecha: "02/09/2026",
    vencimiento: "10/09/2026",
    asunto: "Oferta Insumos Barbecho Químico - Lote Completo",
    estado: "VENCIDA",
    totalUsd: 8400,
    condicionPago: "Contado contra entrega / 30 días",
    plazoEntrega: "Inmediata",
    items: [
      {
        id: "item-r5",
        descripcion: "Glifosato 66% Concentrado x 400 Lts",
        cantidad: "400 Lts",
        precioUnitarioUsd: 8.5,
        subtotalUsd: 3400,
      },
      {
        id: "item-r6",
        descripcion: "2,4-D Éster x 200 Lts",
        cantidad: "200 Lts",
        precioUnitarioUsd: 9.5,
        subtotalUsd: 1900,
      },
      {
        id: "item-r7",
        descripcion: "Coadyuvante Siliconado Antideriva",
        cantidad: "60 Lts",
        precioUnitarioUsd: 12.0,
        subtotalUsd: 720,
      },
      {
        id: "item-r8",
        descripcion: "Graminicida Cletodim x 120 Lts",
        cantidad: "120 Lts",
        precioUnitarioUsd: 19.83,
        subtotalUsd: 2380,
      },
    ],
    observaciones: "Propuesta cerrada por vigencia de lista de precios de Agosto.",
  },
];

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
      const savedUser = localStorage.getItem("cd_client_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      const savedEst = localStorage.getItem("cd_client_establishments");
      if (savedEst) {
        try {
          const parsed = JSON.parse(savedEst);
          const cleaned = Array.isArray(parsed)
            ? parsed.filter((e: Establishment) => !["est-001", "est-002"].includes(e.id))
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
        setSentQuotations(JSON.parse(savedSent));
      }
      const savedRec = localStorage.getItem("cd_client_rec_quotations");
      if (savedRec) {
        setReceivedQuotations(JSON.parse(savedRec));
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

  const login = (usuarioOrCuit: string, password: string): { success: boolean; error?: string } => {
    const cleanId = usuarioOrCuit.trim().toLowerCase();
    if (!cleanId) {
      return { success: false, error: "Por favor ingresá tu usuario, CUIT o correo electrónico." };
    }
    if (!password.trim()) {
      return { success: false, error: "Por favor ingresá tu contraseña." };
    }

    // Permite login con cuenta demo o con cualquier credencial válida
    const profileToUse: ClientProfile = {
      ...defaultClientProfile,
      usuario: cleanId.includes("@") ? cleanId.split("@")[0] : cleanId,
      email: cleanId.includes("@") ? cleanId : defaultClientProfile.email,
    };

    setUser(profileToUse);
    try {
      localStorage.setItem("cd_client_user", JSON.stringify(profileToUse));
    } catch (e) {
      console.error(e);
    }
    return { success: true };
  };

  const registerClient = (profileData: Partial<ClientProfile>): { success: boolean; user: ClientProfile } => {
    const newProfile: ClientProfile = {
      ...defaultClientProfile,
      ...profileData,
      id: profileData.id || `cli-${Date.now()}`,
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
      "PRODUCTOR"
    ).toUpperCase();
    const apellidos = (
      googleUser.family_name ||
      googleUser.name?.split(" ").slice(1).join(" ") ||
      "AGROPECUARIO"
    ).toUpperCase();
    const razonSocial = `${apellidos} ${nombres}`.trim();

    let baseProfile: ClientProfile = {
      ...defaultClientProfile,
      id: `cli-${Date.now()}`,
      usuario,
      razonSocial,
      apellidos,
      nombres,
      email: email.toLowerCase(),
    };

    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("cd_client_user");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (
            parsed &&
            (parsed.email?.toLowerCase() === email.toLowerCase() ||
              parsed.usuario?.toLowerCase() === usuario.toLowerCase())
          ) {
            baseProfile = {
              ...parsed,
              email: email.toLowerCase(),
              nombres,
              apellidos,
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
