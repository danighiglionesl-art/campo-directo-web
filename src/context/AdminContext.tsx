"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  AdminTab,
  FactoryTab,
  AdminSession,
  AdminClient,
  AdminQuotationReceived,
  AdminQuotationSent,
  AdminEstablishment,
  AdminPaymentMethod,
  AdminDashboardStats,
  FactoryAccount,
  FactoryProduct,
  FactoryQuotationDerivation,
  FactoryQuotationItem,
  FactorySale,
  SaleDocument,
  FactoryAccountMovement,
} from "@/types/admin";
import {
  initialAdminClients,
  initialAdminEstablishments,
  initialAdminQuotationsReceived,
  initialAdminQuotationsSent,
  initialAdminPaymentMethods,
  exportTableToExcel,
} from "@/data/adminData";
import {
  initialFactoryAccounts,
  initialFactoryProducts,
  initialFactoryQuotations,
  initialFactorySales,
  initialFactoryMovements,
} from "@/data/factoryData";

interface AdminContextType {
  session: AdminSession;
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  login: (usuario: string, contrasenia: string) => { success: boolean; error?: string };
  logout: () => void;

  // Clientes
  clients: AdminClient[];
  addClient: (client: Omit<AdminClient, "id" | "fechaAlta">) => AdminClient;
  updateClient: (id: string, updated: Partial<AdminClient>) => void;
  deleteClient: (id: string) => void;
  exportClientsExcel: () => void;

  // Cotizaciones Recibidas
  quotationsReceived: AdminQuotationReceived[];
  updateQuotationReceivedStatus: (
    id: string,
    status: AdminQuotationReceived["estado"]
  ) => void;
  deleteQuotationReceived: (id: string) => void;
  exportQuotationsReceivedExcel: () => void;

  // Cotizaciones Enviadas (Propuestas Comerciales)
  quotationsSent: AdminQuotationSent[];
  addQuotationSent: (
    quotation: Omit<AdminQuotationSent, "id">
  ) => AdminQuotationSent;
  updateQuotationSent: (id: string, updated: Partial<AdminQuotationSent>) => void;
  deleteQuotationSent: (id: string) => void;
  exportQuotationsSentExcel: () => void;

  // Establecimientos
  establishments: AdminEstablishment[];
  addEstablishment: (
    establishment: Omit<AdminEstablishment, "id">
  ) => AdminEstablishment;
  updateEstablishment: (
    id: string,
    updated: Partial<AdminEstablishment>
  ) => void;
  deleteEstablishment: (id: string) => void;
  exportEstablishmentsExcel: () => void;

  // Formas de Pago
  paymentMethods: AdminPaymentMethod[];
  addPaymentMethod: (
    method: Omit<AdminPaymentMethod, "id">
  ) => AdminPaymentMethod;
  updatePaymentMethod: (
    id: string,
    updated: Partial<AdminPaymentMethod>
  ) => void;
  togglePaymentMethod: (id: string) => void;
  exportPaymentMethodsExcel: () => void;
  clearAllData: () => void;

  // Estado y navegación del Panel Fábrica
  factoryActiveTab: FactoryTab;
  setFactoryActiveTab: (tab: FactoryTab) => void;
  viewAsFactory: (empresa: string) => void;
  returnToAdmin: () => void;

  // 1. SECCIÓN: GESTIÓN DE FÁBRICAS (CAMPO DIRECTO)
  factories: FactoryAccount[];
  addFactory: (factory: Omit<FactoryAccount, "id" | "fechaAlta">) => FactoryAccount;
  updateFactory: (id: string, updated: Partial<FactoryAccount>) => void;
  deleteFactory: (id: string) => void;
  exportFactoriesExcel: () => void;

  // 2. SECCIÓN: MIS PRODUCTOS (FÁBRICA - ABM VINCULADO AL PORTAL)
  factoryProducts: FactoryProduct[];
  addFactoryProduct: (prod: Omit<FactoryProduct, "id" | "fechaActualizacion">) => FactoryProduct;
  updateFactoryProduct: (id: string, updated: Partial<FactoryProduct>) => void;
  deleteFactoryProduct: (id: string) => void;

  // 3. SECCIÓN: COTIZACIONES INTERMEDIADAS & GESTIÓN CON LUGAR DE ENTREGA
  factoryQuotations: FactoryQuotationDerivation[];
  deriveQuotationToFactory: (
    cotizacionOriginalId: string,
    empresa: string,
    notas?: string
  ) => FactoryQuotationDerivation | null;
  submitFactoryQuotationResponse: (
    derivationId: string,
    respuesta: NonNullable<FactoryQuotationDerivation["respuestaFabrica"]>,
    itemsUpdated: FactoryQuotationItem[]
  ) => void;
  updateFactoryQuotationMarkup: (
    derivationId: string,
    markupGlobal: FactoryQuotationDerivation["markupGlobal"],
    itemsUpdated: FactoryQuotationItem[]
  ) => void;

  // 4. SECCIÓN: VENTAS (EN TRÁNSITO Y ENTREGADAS CON 4 COMPROBANTES PDF)
  factorySales: FactorySale[];
  addFactorySale: (sale: Omit<FactorySale, "id">) => FactorySale;
  updateFactorySaleStatus: (id: string, status: FactorySale["estado"]) => void;
  uploadSaleDocument: (saleId: string, doc: SaleDocument) => void;

  // 5. SECCIÓN: CUENTA CORRIENTE & NOTAS DE CRÉDITO/DÉBITO
  factoryMovements: FactoryAccountMovement[];
  addFactoryMovement: (movement: Omit<FactoryAccountMovement, "id">) => FactoryAccountMovement;
  exportFactoryMovementsExcel: (empresa?: string) => void;

  // Estadísticas del Dashboard
  stats: AdminDashboardStats;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Credenciales oficiales requeridas
const ADMIN_USER_EXPECTED = "CampoDirecto";
const ADMIN_PASS_EXPECTED = "Claro$008";

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AdminSession>({
    isAuthenticated: false,
    username: "",
    role: "admin",
  });
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [clients, setClients] = useState<AdminClient[]>(initialAdminClients);
  const [quotationsReceived, setQuotationsReceived] = useState<AdminQuotationReceived[]>(
    initialAdminQuotationsReceived
  );
  const [quotationsSent, setQuotationsSent] = useState<AdminQuotationSent[]>(
    initialAdminQuotationsSent
  );
  const [establishments, setEstablishments] = useState<AdminEstablishment[]>(
    initialAdminEstablishments
  );
  const [paymentMethods, setPaymentMethods] = useState<AdminPaymentMethod[]>(
    initialAdminPaymentMethods
  );

  // Estados específicos para Fábricas
  const [factoryActiveTab, setFactoryActiveTab] = useState<FactoryTab>("mis-datos");
  const [factories, setFactories] = useState<FactoryAccount[]>(initialFactoryAccounts);
  const [factoryProducts, setFactoryProducts] = useState<FactoryProduct[]>(initialFactoryProducts);
  const [factoryQuotations, setFactoryQuotations] = useState<FactoryQuotationDerivation[]>(
    initialFactoryQuotations
  );
  const [factorySales, setFactorySales] = useState<FactorySale[]>(initialFactorySales);
  const [factoryMovements, setFactoryMovements] = useState<FactoryAccountMovement[]>(
    initialFactoryMovements
  );

  // Inicializar estado desde localStorage al montar en el cliente
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      // 1. Sesión
      const savedSession = localStorage.getItem("cd_admin_session");
      if (savedSession) {
        setSession(JSON.parse(savedSession));
      }

      // 1. Purga forzada y definitiva de datos demo anteriores
      const currentStorageVer = localStorage.getItem("cd_panel_storage_version");
      if (currentStorageVer !== "v5_clean_production") {
        localStorage.removeItem("cd_admin_clients");
        localStorage.removeItem("cd_admin_quotations_received");
        localStorage.removeItem("cd_admin_quotations_sent");
        localStorage.removeItem("cd_admin_establishments");
        localStorage.removeItem("cd_client_user");
        localStorage.removeItem("cd_client_establishments");
        localStorage.removeItem("cd_client_sent_quotations");
        localStorage.removeItem("cd_client_rec_quotations");
        localStorage.setItem("cd_admin_clients", "[]");
        localStorage.setItem("cd_admin_quotations_received", "[]");
        localStorage.setItem("cd_admin_quotations_sent", "[]");
        localStorage.setItem("cd_admin_establishments", "[]");
        localStorage.setItem("cd_panel_storage_version", "v5_clean_production");
        setClients([]);
        setQuotationsReceived([]);
        setQuotationsSent([]);
        setEstablishments([]);
      }

      // Funciones de validación para asegurar que ningún residuo demo aparezca
      const isDemoClient = (c: any) => {
        if (!c) return true;
        const name = (c.razonSocial || c.clienteNombre || "").toUpperCase();
        if (
          name.includes("PEREZ") ||
          name.includes("MARÍAS") ||
          name.includes("MARIAS") ||
          name.includes("SANTILLAN") ||
          name.includes("AURORA") ||
          name.includes("PEDRO") ||
          name.includes("ESTEBAN") ||
          name.includes("BELL VILLE") ||
          name.includes("DEMO")
        ) {
          return true;
        }
        const cuitDigits = (c.cuit || c.clienteCuit || "").replace(/\D/g, "");
        if (
          ["30712345678", "30689452314", "20284918233", "33708945129", "30589214782", "20334455667", "20123456789"].includes(
            cuitDigits
          )
        ) {
          return true;
        }
        const user = (c.usuario || "").toLowerCase();
        if (
          [
            "agroperez",
            "estancia_las_marias",
            "lasmarias",
            "agro_santillan",
            "santillan",
            "la_aurora_agro",
            "laaurora",
            "don_pedro_pergamino",
            "donpedro",
            "prodagro",
          ].includes(user)
        ) {
          return true;
        }
        if (["cli-001", "cli-002", "cli-003", "cli-004", "cli-005"].includes(c.id)) {
          return true;
        }
        return false;
      };

      const isDemoQuote = (q: any) => {
        if (!q) return true;
        if (isDemoClient({ razonSocial: q.clienteNombre, cuit: q.clienteCuit, id: q.clienteId })) return true;
        if (
          [
            "CD-2026-0842",
            "CD-2026-0791",
            "CD-2026-0914",
            "CD-2026-0889",
            "PROP-9041",
            "PROP-8812",
            "PROP-9065",
          ].includes(q.numero)
        ) {
          return true;
        }
        if (["sent-001", "sent-002", "sent-003", "sent-004", "rec-001", "rec-002", "rec-003"].includes(q.id)) {
          return true;
        }
        return false;
      };

      const isDemoEstablishment = (e: any) => {
        if (!e) return true;
        if (isDemoClient({ razonSocial: e.clienteNombre, cuit: e.clienteCuit, id: e.clienteId })) return true;
        if (["est-001", "est-002", "est-003", "est-004", "est-005"].includes(e.id)) return true;
        return false;
      };

      // 2. Clientes
      const savedClients = localStorage.getItem("cd_admin_clients");
      if (savedClients) {
        try {
          const parsed = JSON.parse(savedClients);
          const cleaned = Array.isArray(parsed) ? parsed.filter((c) => !isDemoClient(c)) : [];
          setClients(cleaned);
          localStorage.setItem("cd_admin_clients", JSON.stringify(cleaned));
        } catch {
          setClients([]);
        }
      } else {
        setClients([]);
      }

      // 3. Cotizaciones Recibidas
      const savedRec = localStorage.getItem("cd_admin_quotations_received");
      if (savedRec) {
        try {
          const parsed = JSON.parse(savedRec);
          const cleaned = Array.isArray(parsed) ? parsed.filter((q) => !isDemoQuote(q)) : [];
          setQuotationsReceived(cleaned);
          localStorage.setItem("cd_admin_quotations_received", JSON.stringify(cleaned));
        } catch {
          setQuotationsReceived([]);
        }
      } else {
        setQuotationsReceived([]);
      }

      // 4. Cotizaciones Enviadas
      const savedSent = localStorage.getItem("cd_admin_quotations_sent");
      if (savedSent) {
        try {
          const parsed = JSON.parse(savedSent);
          const cleaned = Array.isArray(parsed) ? parsed.filter((q) => !isDemoQuote(q)) : [];
          setQuotationsSent(cleaned);
          localStorage.setItem("cd_admin_quotations_sent", JSON.stringify(cleaned));
        } catch {
          setQuotationsSent([]);
        }
      } else {
        setQuotationsSent([]);
      }

      // 5. Establecimientos
      const savedEst = localStorage.getItem("cd_admin_establishments");
      if (savedEst) {
        try {
          const parsed = JSON.parse(savedEst);
          const cleaned = Array.isArray(parsed) ? parsed.filter((e) => !isDemoEstablishment(e)) : [];
          setEstablishments(cleaned);
          localStorage.setItem("cd_admin_establishments", JSON.stringify(cleaned));
        } catch {
          setEstablishments([]);
        }
      } else {
        setEstablishments([]);
      }

      // 6. Formas de Pago
      const savedPay = localStorage.getItem("cd_admin_payment_methods");
      if (savedPay) {
        setPaymentMethods(JSON.parse(savedPay));
      }

      // Sincronización en segundo plano con la API de datos del Servidor
      const syncWithServer = async () => {
        try {
          const [recRes, sentRes, cliRes, estRes, payRes] = await Promise.allSettled([
            fetch("/api/panel/quotations-received").then((r) => r.json()),
            fetch("/api/panel/quotations-sent").then((r) => r.json()),
            fetch("/api/panel/clients").then((r) => r.json()),
            fetch("/api/panel/establishments").then((r) => r.json()),
            fetch("/api/panel/payment-methods").then((r) => r.json()),
          ]);

          if (recRes.status === "fulfilled" && recRes.value?.success && Array.isArray(recRes.value.data)) {
            const cleaned = recRes.value.data.filter((q: any) => !isDemoQuote(q));
            setQuotationsReceived(cleaned);
            localStorage.setItem("cd_admin_quotations_received", JSON.stringify(cleaned));
          }

          if (sentRes.status === "fulfilled" && sentRes.value?.success && Array.isArray(sentRes.value.data)) {
            const cleaned = sentRes.value.data.filter((q: any) => !isDemoQuote(q));
            setQuotationsSent(cleaned);
            localStorage.setItem("cd_admin_quotations_sent", JSON.stringify(cleaned));
          }

          if (cliRes.status === "fulfilled" && cliRes.value?.success && Array.isArray(cliRes.value.data)) {
            const cleaned = cliRes.value.data.filter((c: any) => !isDemoClient(c));
            setClients(cleaned);
            localStorage.setItem("cd_admin_clients", JSON.stringify(cleaned));
          }

          if (estRes.status === "fulfilled" && estRes.value?.success && Array.isArray(estRes.value.data)) {
            const cleaned = estRes.value.data.filter((e: any) => !isDemoEstablishment(e));
            setEstablishments(cleaned);
            localStorage.setItem("cd_admin_establishments", JSON.stringify(cleaned));
          }

          if (payRes.status === "fulfilled" && payRes.value?.success && Array.isArray(payRes.value.data)) {
            if (payRes.value.data.length > 0) {
              setPaymentMethods(payRes.value.data);
              localStorage.setItem("cd_admin_payment_methods", JSON.stringify(payRes.value.data));
            }
          }
        } catch (serverErr) {
          console.warn("Sincronización con API de panel:", serverErr);
        }
      };

      // 7. Fábricas y Catálogo Completo (Sincronización v2_full_sync)
      const currentFabVer = localStorage.getItem("cd_factory_storage_version");
      if (currentFabVer !== "v2_full_sync") {
        localStorage.setItem("cd_factory_accounts", JSON.stringify(initialFactoryAccounts));
        localStorage.setItem("cd_factory_products", JSON.stringify(initialFactoryProducts));
        localStorage.setItem("cd_factory_storage_version", "v2_full_sync");
        setFactories(initialFactoryAccounts);
        setFactoryProducts(initialFactoryProducts);
      } else {
        const savedFab = localStorage.getItem("cd_factory_accounts");
        if (savedFab) {
          try {
            const parsed = JSON.parse(savedFab);
            setFactories(Array.isArray(parsed) && parsed.length >= 44 ? parsed : initialFactoryAccounts);
          } catch {
            setFactories(initialFactoryAccounts);
          }
        } else {
          localStorage.setItem("cd_factory_accounts", JSON.stringify(initialFactoryAccounts));
          setFactories(initialFactoryAccounts);
        }

        const savedFabProd = localStorage.getItem("cd_factory_products");
        if (savedFabProd) {
          try {
            const parsed = JSON.parse(savedFabProd);
            setFactoryProducts(Array.isArray(parsed) && parsed.length >= 1000 ? parsed : initialFactoryProducts);
          } catch {
            setFactoryProducts(initialFactoryProducts);
          }
        } else {
          localStorage.setItem("cd_factory_products", JSON.stringify(initialFactoryProducts));
          setFactoryProducts(initialFactoryProducts);
        }
      }

      // 9. Cotizaciones Fábrica
      const savedFabQuotes = localStorage.getItem("cd_factory_quotations");
      if (savedFabQuotes) {
        try {
          const parsed = JSON.parse(savedFabQuotes);
          const cleaned = Array.isArray(parsed)
            ? parsed.filter((q: FactoryQuotationDerivation) => !q.id?.startsWith("deriv-") && !q.numeroCotizacion?.includes("CD-2026-0842"))
            : [];
          setFactoryQuotations(cleaned);
          localStorage.setItem("cd_factory_quotations", JSON.stringify(cleaned));
        } catch {
          setFactoryQuotations([]);
        }
      } else {
        localStorage.setItem("cd_factory_quotations", JSON.stringify([]));
        setFactoryQuotations([]);
      }

      // 10. Ventas Fábrica
      const savedFabSales = localStorage.getItem("cd_factory_sales");
      if (savedFabSales) {
        try {
          const parsed = JSON.parse(savedFabSales);
          const cleaned = Array.isArray(parsed)
            ? parsed.filter((s: FactorySale) => !s.id?.startsWith("vta-") && !s.numeroOperacion?.includes("VTA-2026-"))
            : [];
          setFactorySales(cleaned);
          localStorage.setItem("cd_factory_sales", JSON.stringify(cleaned));
        } catch {
          setFactorySales([]);
        }
      } else {
        localStorage.setItem("cd_factory_sales", JSON.stringify([]));
        setFactorySales([]);
      }

      // 11. Cuenta Corriente Fábrica
      const savedFabMov = localStorage.getItem("cd_factory_movements");
      if (savedFabMov) {
        try {
          const parsed = JSON.parse(savedFabMov);
          const cleaned = Array.isArray(parsed)
            ? parsed.filter((m: FactoryAccountMovement) => !m.id?.startsWith("mov-") && !m.numeroComprobante?.includes("FC A-0008-") && !m.numeroComprobante?.includes("OP-CD-"))
            : [];
          setFactoryMovements(cleaned);
          localStorage.setItem("cd_factory_movements", JSON.stringify(cleaned));
        } catch {
          setFactoryMovements([]);
        }
      } else {
        localStorage.setItem("cd_factory_movements", JSON.stringify([]));
        setFactoryMovements([]);
      }

      syncWithServer();
    } catch (e) {
      console.error("Error cargando datos administrativos locales:", e);
    }
  }, []);

  // Métodos de autenticación unificada
  const login = (usuario: string, contrasenia: string): { success: boolean; error?: string } => {
    const cleanUser = usuario.trim();
    const cleanPass = contrasenia.trim();

    if (!cleanUser) {
      return { success: false, error: "Por favor ingresá tu nombre de usuario." };
    }
    if (!cleanPass) {
      return { success: false, error: "Por favor ingresá la contraseña de acceso." };
    }

    // 1. Acceso Administrador Campo Directo
    if (
      cleanUser.toLowerCase() === ADMIN_USER_EXPECTED.toLowerCase() &&
      cleanPass === ADMIN_PASS_EXPECTED
    ) {
      const newSession: AdminSession = {
        isAuthenticated: true,
        username: ADMIN_USER_EXPECTED,
        role: "admin",
        loginTime: new Date().toISOString(),
      };
      setSession(newSession);
      try {
        localStorage.setItem("cd_admin_session", JSON.stringify(newSession));
      } catch (e) {
        console.error(e);
      }
      return { success: true };
    }

    // 2. Acceso Usuario Fábrica (fab.empresa / claveActiva)
    const currentFactories = (() => {
      try {
        const stored = localStorage.getItem("cd_factory_accounts");
        return stored ? JSON.parse(stored) : factories;
      } catch {
        return factories;
      }
    })();

    const foundFab = currentFactories.find(
      (f: FactoryAccount) => f.usuario.toLowerCase() === cleanUser.toLowerCase()
    );

    if (foundFab) {
      if (cleanPass === foundFab.claveActiva) {
        if (foundFab.estado === "INACTIVO") {
          return {
            success: false,
            error: "La cuenta de la empresa se encuentra temporalmente inactiva. Contactate con Campo Directo.",
          };
        }

        const newSession: AdminSession = {
          isAuthenticated: true,
          username: foundFab.usuario,
          role: "fabrica",
          empresa: foundFab.empresa,
          loginTime: new Date().toISOString(),
        };
        setSession(newSession);
        setFactoryActiveTab("mis-datos");
        try {
          localStorage.setItem("cd_admin_session", JSON.stringify(newSession));
        } catch (e) {
          console.error(e);
        }
        return { success: true };
      } else {
        return {
          success: false,
          error: "Contraseña incorrecta para el usuario de fábrica ingresado.",
        };
      }
    }

    return {
      success: false,
      error: "Credenciales incorrectas. Verificá tu usuario y contraseña de operador o fábrica.",
    };
  };

  const logout = () => {
    setSession({ isAuthenticated: false, username: "", role: "admin" });
    try {
      localStorage.removeItem("cd_admin_session");
    } catch (e) {
      console.error(e);
    }
  };

  const viewAsFactory = (empresa: string) => {
    const found = factories.find((f) => f.empresa.toLowerCase() === empresa.toLowerCase());
    const username = found ? found.usuario : `fab.${empresa.toLowerCase().replace(/\s+/g, "")}`;
    const newSession: AdminSession = {
      isAuthenticated: true,
      username,
      role: "fabrica",
      empresa: found ? found.empresa : empresa,
      loginTime: new Date().toISOString(),
    };
    setSession(newSession);
    setFactoryActiveTab("mis-datos");
    try {
      localStorage.setItem("cd_admin_session", JSON.stringify(newSession));
    } catch (e) {
      console.error(e);
    }
  };

  const returnToAdmin = () => {
    const newSession: AdminSession = {
      isAuthenticated: true,
      username: ADMIN_USER_EXPECTED,
      role: "admin",
      loginTime: new Date().toISOString(),
    };
    setSession(newSession);
    setActiveTab("fabricas");
    try {
      localStorage.setItem("cd_admin_session", JSON.stringify(newSession));
    } catch (e) {
      console.error(e);
    }
  };

  // CRUD CLIENTES
  const addClient = (clientData: Omit<AdminClient, "id" | "fechaAlta">): AdminClient => {
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now.getFullYear()}`;

    const newClient: AdminClient = {
      ...clientData,
      id: `cli-${Date.now()}`,
      fechaAlta: formattedDate,
    };

    setClients((prev) => {
      const next = [newClient, ...prev];
      try {
        localStorage.setItem("cd_admin_clients", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    fetch("/api/panel/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newClient),
    }).catch((e) => console.warn("Error enviando cliente a servidor:", e));

    return newClient;
  };

  const updateClient = (id: string, updated: Partial<AdminClient>) => {
    setClients((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...updated } : item));
      try {
        localStorage.setItem("cd_admin_clients", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    fetch(`/api/panel/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch((e) => console.warn("Error actualizando cliente en servidor:", e));
  };

  const deleteClient = (id: string) => {
    setClients((prev) => {
      const next = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("cd_admin_clients", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    fetch(`/api/panel/clients/${id}`, {
      method: "DELETE",
    }).catch((e) => console.warn("Error eliminando cliente en servidor:", e));
  };

  const exportClientsExcel = () => {
    const exportData = clients.map((c) => ({
      "Razón Social": c.razonSocial,
      "CUIT": c.cuit,
      "Contacto": `${c.apellidos} ${c.nombres}`.trim(),
      "Condición IVA": c.condicionIva,
      "Email": c.email,
      "Teléfono": c.telefono,
      "WhatsApp": c.whatsapp,
      "Provincia": c.provincia,
      "Localidad": c.localidad,
      "Dirección": c.direccion,
      "Código Postal": c.codigoPostal || "-",
      "Actividad Principal": c.actividadPrincipal,
      "Estado": c.estado,
      "Fecha Alta": c.fechaAlta,
      "Notas Internas": c.notasInternas || "",
    }));
    exportTableToExcel(exportData, "Clientes_Campo_Directo", "Productores");
  };

  // CRUD COTIZACIONES RECIBIDAS
  const updateQuotationReceivedStatus = (
    id: string,
    status: AdminQuotationReceived["estado"]
  ) => {
    setQuotationsReceived((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, estado: status } : item
      );
      try {
        localStorage.setItem("cd_admin_quotations_received", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    fetch(`/api/panel/quotations-received/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: status }),
    }).catch((e) => console.warn("Error actualizando estado de cotización en servidor:", e));
  };

  const deleteQuotationReceived = (id: string) => {
    setQuotationsReceived((prev) => {
      const next = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("cd_admin_quotations_received", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    fetch(`/api/panel/quotations-received/${id}`, {
      method: "DELETE",
    }).catch((e) => console.warn("Error eliminando cotización en servidor:", e));
  };

  const exportQuotationsReceivedExcel = () => {
    const exportData = quotationsReceived.map((q) => ({
      "N° Cotización": q.numero,
      "Fecha": q.fecha,
      "Operación": q.operacion,
      "Estado": q.estado,
      "Cliente / Razón Social": q.clienteNombre,
      "CUIT": q.clienteCuit,
      "Teléfono": q.clienteTelefono || "-",
      "Establecimiento Destino": q.establecimientoDestino || "-",
      "Forma de Pago": q.formaPagoSolicitada,
      "Cantidad de Ítems": q.items?.length || 0,
      "Productos": q.items?.map((i) => `${i.nombre} (${i.cantidad} ${i.unidad})`).join(" | ") || "-",
      "Observaciones": q.observaciones || "-",
      "Coordenadas GPS": q.coordenadasGps || "-",
    }));
    exportTableToExcel(exportData, "Cotizaciones_Recibidas_Campo_Directo", "Recibidas");
  };

  // CRUD COTIZACIONES ENVIADAS (PROPUESTAS COMERCIALES)
  const addQuotationSent = (
    quotationData: Omit<AdminQuotationSent, "id">
  ): AdminQuotationSent => {
    const newQuotation: AdminQuotationSent = {
      ...quotationData,
      id: `prop-${Date.now()}`,
    };

    setQuotationsSent((prev) => {
      const next = [newQuotation, ...prev];
      try {
        localStorage.setItem("cd_admin_quotations_sent", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    // Sincronizar también con el portal del cliente si corresponde
    try {
      if (typeof window !== "undefined") {
        const clientRecSaved = localStorage.getItem("cd_client_rec_quotations");
        let clientRecList = clientRecSaved ? JSON.parse(clientRecSaved) : [];
        if (!Array.isArray(clientRecList)) clientRecList = [];

        // Convertir formato para el portal del cliente
        clientRecList.unshift({
          id: newQuotation.id,
          numero: newQuotation.numero,
          fecha: newQuotation.fechaEmision,
          vencimiento: newQuotation.fechaVencimiento,
          asunto: newQuotation.asunto,
          estado: newQuotation.estado === "RECHAZADA" ? "VENCIDA" : newQuotation.estado,
          totalUsd: newQuotation.totalUsd,
          condicionPago: newQuotation.condicionPago,
          plazoEntrega: newQuotation.plazoEntrega,
          items: newQuotation.items.map((it) => ({
            id: it.id,
            descripcion: it.descripcion,
            cantidad: it.cantidad,
            precioUnitarioUsd: it.precioUnitarioUsd,
            subtotalUsd: it.subtotalUsd,
          })),
          observaciones: newQuotation.observaciones,
        });

        localStorage.setItem("cd_client_rec_quotations", JSON.stringify(clientRecList));
      }
    } catch (err) {
      console.error("Error al sincronizar cotización con el portal del cliente:", err);
    }

    fetch("/api/panel/quotations-sent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQuotation),
    }).catch((e) => console.warn("Error enviando propuesta a servidor:", e));

    return newQuotation;
  };

  const updateQuotationSent = (id: string, updated: Partial<AdminQuotationSent>) => {
    setQuotationsSent((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...updated } : item));
      try {
        localStorage.setItem("cd_admin_quotations_sent", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    fetch(`/api/panel/quotations-sent/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch((e) => console.warn("Error actualizando propuesta en servidor:", e));
  };

  const deleteQuotationSent = (id: string) => {
    setQuotationsSent((prev) => {
      const next = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("cd_admin_quotations_sent", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    fetch(`/api/panel/quotations-sent/${id}`, {
      method: "DELETE",
    }).catch((e) => console.warn("Error eliminando propuesta en servidor:", e));
  };

  const exportQuotationsSentExcel = () => {
    const exportData = quotationsSent.map((q) => ({
      "N° Propuesta": q.numero,
      "Fecha Emisión": q.fechaEmision,
      "Fecha Vencimiento": q.fechaVencimiento,
      "Cliente": q.clienteNombre,
      "CUIT": q.clienteCuit,
      "Asunto": q.asunto,
      "Estado": q.estado,
      "Total (USD)": q.totalUsd,
      "Condición de Pago": q.condicionPago,
      "Plazo de Entrega": q.plazoEntrega,
      "Archivo Adjunto": q.archivoAdjunto ? `${q.archivoAdjunto.nombre} (${q.archivoAdjunto.tamanoKb} KB)` : "Sin adjunto",
      "Detalle de Ítems": q.items.map((i) => `${i.descripcion} [Cant: ${i.cantidad}, USD ${i.precioUnitarioUsd}]`).join(" | "),
      "Observaciones": q.observaciones || "-",
    }));
    exportTableToExcel(exportData, "Cotizaciones_Enviadas_Oficiales_Campo_Directo", "Enviadas");
  };

  // CRUD ESTABLECIMIENTOS
  const addEstablishment = (
    estData: Omit<AdminEstablishment, "id">
  ): AdminEstablishment => {
    const newEst: AdminEstablishment = {
      ...estData,
      id: `est-${Date.now()}`,
      linkMaps: estData.coordenadasGps
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(estData.coordenadasGps)}`
        : undefined,
    };

    setEstablishments((prev) => {
      const next = [newEst, ...prev];
      try {
        localStorage.setItem("cd_admin_establishments", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    fetch("/api/panel/establishments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEst),
    }).catch((e) => console.warn("Error enviando establecimiento a servidor:", e));

    return newEst;
  };

  const updateEstablishment = (id: string, updated: Partial<AdminEstablishment>) => {
    setEstablishments((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...updated } : item));
      try {
        localStorage.setItem("cd_admin_establishments", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    fetch(`/api/panel/establishments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch((e) => console.warn("Error actualizando establecimiento en servidor:", e));
  };

  const deleteEstablishment = (id: string) => {
    setEstablishments((prev) => {
      const next = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("cd_admin_establishments", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    fetch(`/api/panel/establishments/${id}`, {
      method: "DELETE",
    }).catch((e) => console.warn("Error eliminando establecimiento en servidor:", e));
  };

  const exportEstablishmentsExcel = () => {
    const exportData = establishments.map((e) => ({
      "Establecimiento": e.nombre,
      "Titular / Razón Social": e.clienteNombre,
      "CUIT": e.clienteCuit || "-",
      "Provincia": e.provincia,
      "Localidad": e.localidad,
      "Hectáreas": e.hectareas,
      "Actividad Productiva": e.actividad,
      "Tipo de Descarga": e.tipoDescarga || "Tranquera de campo",
      "Coordenadas GPS": e.coordenadasGps,
      "Referencia de Acceso": e.referenciaAcceso,
      "Es Principal": e.esPrincipal ? "SÍ" : "NO",
    }));
    exportTableToExcel(exportData, "Establecimientos_Campo_Directo", "Establecimientos");
  };

  // CRUD FORMAS DE PAGO
  const addPaymentMethod = (
    methodData: Omit<AdminPaymentMethod, "id">
  ): AdminPaymentMethod => {
    const newMethod: AdminPaymentMethod = {
      ...methodData,
      id: `pay-${Date.now()}`,
    };

    setPaymentMethods((prev) => {
      const next = [...prev, newMethod];
      try {
        localStorage.setItem("cd_admin_payment_methods", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    return newMethod;
  };

  const updatePaymentMethod = (id: string, updated: Partial<AdminPaymentMethod>) => {
    setPaymentMethods((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...updated } : item));
      try {
        localStorage.setItem("cd_admin_payment_methods", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const togglePaymentMethod = (id: string) => {
    setPaymentMethods((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, activo: !item.activo } : item
      );
      try {
        localStorage.setItem("cd_admin_payment_methods", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const exportPaymentMethodsExcel = () => {
    const exportData = paymentMethods.map((p) => ({
      "Código": p.codigo,
      "Forma de Pago": p.nombre,
      "Categoría": p.categoria,
      "Estado": p.activo ? "ACTIVA" : "INACTIVA",
      "Tasa o Interés": p.tasaOInteres,
      "Plazo Habitual": p.plazoDias,
      "Descripción Comercial": p.descripcion,
      "Requisitos de Calificación": p.requisitos,
    }));
    exportTableToExcel(exportData, "Formas_de_Pago_Campo_Directo", "FormasDePago");
  };

  const clearAllData = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cd_admin_clients");
      localStorage.removeItem("cd_admin_quotations_received");
      localStorage.removeItem("cd_admin_quotations_sent");
      localStorage.removeItem("cd_admin_establishments");
      localStorage.removeItem("cd_client_user");
      localStorage.removeItem("cd_client_establishments");
      localStorage.removeItem("cd_client_sent_quotations");
      localStorage.removeItem("cd_client_rec_quotations");
      localStorage.setItem("cd_admin_clients", "[]");
      localStorage.setItem("cd_admin_quotations_received", "[]");
      localStorage.setItem("cd_admin_quotations_sent", "[]");
      localStorage.setItem("cd_admin_establishments", "[]");
      localStorage.setItem("cd_panel_storage_version", "v5_clean_production");
    }
    setClients([]);
    setQuotationsReceived([]);
    setQuotationsSent([]);
    setEstablishments([]);
  };

  // 1. CRUD FÁBRICAS (GESTIÓN OPERADOR CAMPO DIRECTO)
  const addFactory = (data: Omit<FactoryAccount, "id" | "fechaAlta">): FactoryAccount => {
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now.getFullYear()}`;

    const newFactory: FactoryAccount = {
      ...data,
      id: `fab-${Date.now()}`,
      fechaAlta: formattedDate,
    };

    setFactories((prev) => {
      const next = [newFactory, ...prev];
      try {
        localStorage.setItem("cd_factory_accounts", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    return newFactory;
  };

  const updateFactory = (id: string, updated: Partial<FactoryAccount>) => {
    setFactories((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, ...updated } : f));
      try {
        localStorage.setItem("cd_factory_accounts", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const deleteFactory = (id: string) => {
    setFactories((prev) => {
      const next = prev.filter((f) => f.id !== id);
      try {
        localStorage.setItem("cd_factory_accounts", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const exportFactoriesExcel = () => {
    const exportData = factories.map((f) => ({
      "Empresa": f.empresa,
      "Razón Social": f.razonSocial,
      "CUIT": f.cuit,
      "Contacto Comercial": f.contactoComercial,
      "WhatsApp": f.whatsapp,
      "Email": f.email,
      "Usuario de Acceso": f.usuario,
      "Clave Activa": f.claveActiva,
      "Estado": f.estado,
      "Fecha Alta": f.fechaAlta,
      "Rubro": f.rubroPrincipal || "Insumos",
      "Localidad": f.localidad || "-",
      "Provincia": f.provincia || "-",
    }));
    exportTableToExcel(exportData, "Fabricas_Aliadas_Campo_Directo", "Fabricas");
  };

  // 2. SECCIÓN: MIS PRODUCTOS (ABM VINCULADO AL PORTAL)
  const addFactoryProduct = (
    data: Omit<FactoryProduct, "id" | "fechaActualizacion">
  ): FactoryProduct => {
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now.getFullYear()}`;

    const newProd: FactoryProduct = {
      ...data,
      id: `fprod-${Date.now()}`,
      fechaActualizacion: formattedDate,
    };

    setFactoryProducts((prev) => {
      const next = [newProd, ...prev];
      try {
        localStorage.setItem("cd_factory_products", JSON.stringify(next));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("cd_factory_products_updated"));
        }
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    return newProd;
  };

  const updateFactoryProduct = (id: string, updated: Partial<FactoryProduct>) => {
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now.getFullYear()}`;

    setFactoryProducts((prev) => {
      const next = prev.map((p) =>
        p.id === id ? { ...p, ...updated, fechaActualizacion: formattedDate } : p
      );
      try {
        localStorage.setItem("cd_factory_products", JSON.stringify(next));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("cd_factory_products_updated"));
        }
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const deleteFactoryProduct = (id: string) => {
    setFactoryProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem("cd_factory_products", JSON.stringify(next));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("cd_factory_products_updated"));
        }
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // 3. SECCIÓN: COTIZACIONES INTERMEDIADAS & GESTIÓN CON LUGAR DE ENTREGA
  const deriveQuotationToFactory = (
    cotizacionOriginalId: string,
    empresa: string,
    notas?: string
  ): FactoryQuotationDerivation | null => {
    const original = quotationsReceived.find((q) => q.id === cotizacionOriginalId);
    if (!original) return null;

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now.getFullYear()}`;

    const newDerivation: FactoryQuotationDerivation = {
      id: `deriv-${Date.now()}`,
      cotizacionOriginalId: original.id,
      numeroCotizacion: original.numero,
      fechaDerivacion: formattedDate,
      empresa,
      clienteNombre: original.clienteNombre,
      clienteCuit: original.clienteCuit,
      clienteTelefono: original.clienteTelefono,
      clienteEmail: original.clienteEmail,
      lugarEntrega: {
        establecimiento: original.establecimientoDestino || "Establecimiento Principal",
        localidad: original.localidad || "Zona de Entrega",
        provincia: original.provincia || "Argentina",
        coordenadasGps: original.coordenadasGps,
        linkMaps: original.linkMaps,
        tipoDescarga: original.tipoDescarga || "Tranquera de campo / Galpón",
        referenciaAcceso: original.referenciaAcceso,
      },
      formaPago: original.formaPagoSolicitada,
      items: (original.items || []).map((it) => ({
        id: `it-f-${Date.now()}-${it.id}`,
        producto: it.nombre,
        categoria: it.categoriaOVariedad,
        cantidad: it.cantidad,
        unidad: it.unidad,
        detalle: it.detalle,
      })),
      estado: "DERIVADA_A_FABRICA",
      notasCampoDirecto: notas,
    };

    setFactoryQuotations((prev) => {
      const next = [newDerivation, ...prev];
      try {
        localStorage.setItem("cd_factory_quotations", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    updateQuotationReceivedStatus(cotizacionOriginalId, "EN EVALUACIÓN");
    return newDerivation;
  };

  const submitFactoryQuotationResponse = (
    derivationId: string,
    respuesta: NonNullable<FactoryQuotationDerivation["respuestaFabrica"]>,
    itemsUpdated: FactoryQuotationItem[]
  ) => {
    setFactoryQuotations((prev) => {
      const next = prev.map((q) =>
        q.id === derivationId
          ? {
              ...q,
              estado: "COTIZADA_POR_FABRICA" as const,
              respuestaFabrica: respuesta,
              items: itemsUpdated,
            }
          : q
      );
      try {
        localStorage.setItem("cd_factory_quotations", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const updateFactoryQuotationMarkup = (
    derivationId: string,
    markupGlobal: FactoryQuotationDerivation["markupGlobal"],
    itemsUpdated: FactoryQuotationItem[]
  ) => {
    setFactoryQuotations((prev) => {
      const next = prev.map((q) =>
        q.id === derivationId
          ? {
              ...q,
              markupGlobal,
              items: itemsUpdated,
              estado: "ENVIADA_A_CLIENTE" as const,
            }
          : q
      );
      try {
        localStorage.setItem("cd_factory_quotations", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // 4. SECCIÓN: VENTAS (EN TRÁNSITO Y ENTREGADAS CON 4 COMPROBANTES PDF)
  const addFactorySale = (saleData: Omit<FactorySale, "id">): FactorySale => {
    const newSale: FactorySale = {
      ...saleData,
      id: `vta-${Date.now()}`,
    };

    setFactorySales((prev) => {
      const next = [newSale, ...prev];
      try {
        localStorage.setItem("cd_factory_sales", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    return newSale;
  };

  const updateFactorySaleStatus = (id: string, status: FactorySale["estado"]) => {
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now.getFullYear()}`;

    setFactorySales((prev) => {
      const next = prev.map((s) =>
        s.id === id
          ? {
              ...s,
              estado: status,
              fechaEntregaReal: status === "ENTREGADA" ? formattedDate : s.fechaEntregaReal,
            }
          : s
      );
      try {
        localStorage.setItem("cd_factory_sales", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const uploadSaleDocument = (saleId: string, doc: SaleDocument) => {
    setFactorySales((prev) => {
      const next = prev.map((s) => {
        if (s.id !== saleId) return s;
        if (doc.tipo === "REMITO") return { ...s, pdfRemito: doc };
        if (doc.tipo === "FACTURA") return { ...s, pdfFactura: doc };
        if (doc.tipo === "PAGO") return { ...s, pdfPago: doc };
        if (doc.tipo === "RECIBO") return { ...s, pdfRecibo: doc };
        return s;
      });
      try {
        localStorage.setItem("cd_factory_sales", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // 5. SECCIÓN: CUENTA CORRIENTE & NOTAS DE CRÉDITO/DÉBITO
  const addFactoryMovement = (
    movementData: Omit<FactoryAccountMovement, "id">
  ): FactoryAccountMovement => {
    const newMov: FactoryAccountMovement = {
      ...movementData,
      id: `mov-${Date.now()}`,
    };

    setFactoryMovements((prev) => {
      const next = [newMov, ...prev];
      try {
        localStorage.setItem("cd_factory_movements", JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    return newMov;
  };

  const exportFactoryMovementsExcel = (empresa?: string) => {
    const filtered = empresa
      ? factoryMovements.filter((m) => m.empresa.toLowerCase() === empresa.toLowerCase())
      : factoryMovements;

    const exportData = filtered.map((m) => ({
      "Fecha": m.fecha,
      "Fábrica": m.empresa,
      "Tipo Comprobante": m.tipo,
      "N° Comprobante": m.numeroComprobante,
      "Concepto": m.concepto,
      "Operación Relacionada": m.operacionRelacionada || "-",
      "Débito (USD)": m.debitoUsd,
      "Crédito (USD)": m.creditoUsd,
      "Saldo Acumulado (USD)": m.saldoAcumuladoUsd,
      "Markup Campo Directo (USD)": m.markupIntermediarioUsd || 0,
      "Observaciones": m.observaciones || "-",
    }));

    exportTableToExcel(
      exportData,
      `Cuenta_Corriente_${empresa ? empresa : "Todas_las_Fabricas"}_Campo_Directo`,
      "CuentaCorriente"
    );
  };

  // Estadísticas del Dashboard
  const stats: AdminDashboardStats = useMemo(() => {
    const pendientes = quotationsReceived.filter(
      (q) => q.estado === "NUEVA" || q.estado === "EN EVALUACIÓN"
    ).length;

    const totalUsd = quotationsSent.reduce(
      (acc, curr) => acc + (curr.totalUsd || 0),
      0
    );

    const ventasTransitoUsd = factorySales
      .filter((s) => s.estado === "EN_TRANSITO")
      .reduce((acc, curr) => acc + (curr.totalFabricaUsd || 0), 0);

    return {
      totalClientes: clients.length,
      cotizacionesPendientes: pendientes,
      cotizacionesEnviadasTotalUsd: totalUsd,
      establecimientosTotales: establishments.length,
      cotizacionesMes: quotationsReceived.length + quotationsSent.length,
      totalFabricas: factories.length,
      ventasTransitoTotalUsd: ventasTransitoUsd,
    };
  }, [clients, quotationsReceived, quotationsSent, establishments, factories, factorySales]);

  return (
    <AdminContext.Provider
      value={{
        session,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        login,
        logout,
        factoryActiveTab,
        setFactoryActiveTab,
        viewAsFactory,
        returnToAdmin,
        factories,
        addFactory,
        updateFactory,
        deleteFactory,
        exportFactoriesExcel,
        factoryProducts,
        addFactoryProduct,
        updateFactoryProduct,
        deleteFactoryProduct,
        factoryQuotations,
        deriveQuotationToFactory,
        submitFactoryQuotationResponse,
        updateFactoryQuotationMarkup,
        factorySales,
        addFactorySale,
        updateFactorySaleStatus,
        uploadSaleDocument,
        factoryMovements,
        addFactoryMovement,
        exportFactoryMovementsExcel,
        clients,
        addClient,
        updateClient,
        deleteClient,
        exportClientsExcel,
        quotationsReceived,
        updateQuotationReceivedStatus,
        deleteQuotationReceived,
        exportQuotationsReceivedExcel,
        quotationsSent,
        addQuotationSent,
        updateQuotationSent,
        deleteQuotationSent,
        exportQuotationsSentExcel,
        establishments,
        addEstablishment,
        updateEstablishment,
        deleteEstablishment,
        exportEstablishmentsExcel,
        paymentMethods,
        addPaymentMethod,
        updatePaymentMethod,
        togglePaymentMethod,
        exportPaymentMethodsExcel,
        clearAllData,
        stats,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin debe ser usado dentro de un AdminProvider");
  }
  return context;
};
