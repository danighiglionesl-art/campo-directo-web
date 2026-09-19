"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  AdminTab,
  AdminSession,
  AdminClient,
  AdminQuotationReceived,
  AdminQuotationSent,
  AdminEstablishment,
  AdminPaymentMethod,
  AdminDashboardStats,
} from "@/types/admin";
import {
  initialAdminClients,
  initialAdminEstablishments,
  initialAdminQuotationsReceived,
  initialAdminQuotationsSent,
  initialAdminPaymentMethods,
  exportTableToExcel,
} from "@/data/adminData";

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

  // Inicializar estado desde localStorage al montar en el cliente
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      // 1. Sesión
      const savedSession = localStorage.getItem("cd_admin_session");
      if (savedSession) {
        setSession(JSON.parse(savedSession));
      }

      // 2. Clientes: Limpiar clientes demo anteriores
      const savedClients = localStorage.getItem("cd_admin_clients");
      const demoClientIds = ["cli-001", "cli-002", "cli-003", "cli-004", "cli-005"];
      const demoCuits = [
        "30-71234567-8",
        "30-68945231-4",
        "33-71458923-9",
        "33-70894512-9",
        "30-54123789-2",
      ];
      const demoUsernames = ["agroperez", "lasmarias", "donesteban", "laaurora", "coopbellville"];

      if (savedClients) {
        try {
          const parsed = JSON.parse(savedClients);
          const cleaned = Array.isArray(parsed)
            ? parsed.filter(
                (c: AdminClient) =>
                  !demoClientIds.includes(c.id) &&
                  !demoCuits.includes(c.cuit) &&
                  !demoUsernames.includes((c.usuario || "").toLowerCase())
              )
            : [];
          setClients(cleaned);
          localStorage.setItem("cd_admin_clients", JSON.stringify(cleaned));
        } catch {
          setClients([]);
        }
      } else {
        setClients([]);
      }

      // 3. Cotizaciones Recibidas: Limpiar cotizaciones demo anteriores
      const savedRec = localStorage.getItem("cd_admin_quotations_received");
      const demoQuoteRecIds = ["sent-001", "sent-002", "sent-003", "sent-004"];
      const demoQuoteRecNumbers = ["CD-2026-0842", "CD-2026-0791", "CD-2026-0914", "CD-2026-0889"];
      if (savedRec) {
        try {
          const parsed = JSON.parse(savedRec);
          const cleaned = Array.isArray(parsed)
            ? parsed.filter(
                (q: AdminQuotationReceived) =>
                  !demoQuoteRecIds.includes(q.id) &&
                  !demoQuoteRecNumbers.includes(q.numero) &&
                  !(q.clienteCuit && demoCuits.includes(q.clienteCuit)) &&
                  !(q.clienteId && demoClientIds.includes(q.clienteId))
              )
            : [];
          setQuotationsReceived(cleaned);
          localStorage.setItem("cd_admin_quotations_received", JSON.stringify(cleaned));
        } catch {
          setQuotationsReceived([]);
        }
      } else {
        setQuotationsReceived([]);
      }

      // 4. Cotizaciones Enviadas: Limpiar propuestas demo anteriores
      const savedSent = localStorage.getItem("cd_admin_quotations_sent");
      const demoQuoteSentIds = ["rec-001", "rec-002", "rec-003"];
      const demoQuoteSentNumbers = ["PROP-9041", "PROP-8812", "PROP-9065"];
      if (savedSent) {
        try {
          const parsed = JSON.parse(savedSent);
          const cleaned = Array.isArray(parsed)
            ? parsed.filter(
                (q: AdminQuotationSent) =>
                  !demoQuoteSentIds.includes(q.id) &&
                  !demoQuoteSentNumbers.includes(q.numero) &&
                  !(q.clienteCuit && demoCuits.includes(q.clienteCuit)) &&
                  !(q.clienteId && demoClientIds.includes(q.clienteId))
              )
            : [];
          setQuotationsSent(cleaned);
          localStorage.setItem("cd_admin_quotations_sent", JSON.stringify(cleaned));
        } catch {
          setQuotationsSent([]);
        }
      } else {
        setQuotationsSent([]);
      }

      // 5. Establecimientos: Borrar los de prueba y mantener solo los cargados por el operador
      const savedEst = localStorage.getItem("cd_admin_establishments");
      if (savedEst) {
        try {
          const parsed = JSON.parse(savedEst);
          const demoIds = ["est-001", "est-002", "est-003", "est-004", "est-005"];
          const cleaned = Array.isArray(parsed)
            ? parsed.filter(
                (e: AdminEstablishment) =>
                  !demoIds.includes(e.id) &&
                  !(e.clienteCuit && demoCuits.includes(e.clienteCuit)) &&
                  !(e.clienteId && demoClientIds.includes(e.clienteId))
              )
            : [];
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
            const cleaned = recRes.value.data.filter(
              (q: AdminQuotationReceived) =>
                !demoQuoteRecIds.includes(q.id) &&
                !demoQuoteRecNumbers.includes(q.numero) &&
                !(q.clienteCuit && demoCuits.includes(q.clienteCuit)) &&
                !(q.clienteId && demoClientIds.includes(q.clienteId))
            );
            setQuotationsReceived(cleaned);
            localStorage.setItem("cd_admin_quotations_received", JSON.stringify(cleaned));
          }

          if (sentRes.status === "fulfilled" && sentRes.value?.success && Array.isArray(sentRes.value.data)) {
            const cleaned = sentRes.value.data.filter(
              (q: AdminQuotationSent) =>
                !demoQuoteSentIds.includes(q.id) &&
                !demoQuoteSentNumbers.includes(q.numero) &&
                !(q.clienteCuit && demoCuits.includes(q.clienteCuit)) &&
                !(q.clienteId && demoClientIds.includes(q.clienteId))
            );
            setQuotationsSent(cleaned);
            localStorage.setItem("cd_admin_quotations_sent", JSON.stringify(cleaned));
          }

          if (cliRes.status === "fulfilled" && cliRes.value?.success && Array.isArray(cliRes.value.data)) {
            const cleaned = cliRes.value.data.filter(
              (c: AdminClient) =>
                !demoClientIds.includes(c.id) &&
                !demoCuits.includes(c.cuit) &&
                !demoUsernames.includes((c.usuario || "").toLowerCase())
            );
            setClients(cleaned);
            localStorage.setItem("cd_admin_clients", JSON.stringify(cleaned));
          }

          if (estRes.status === "fulfilled" && estRes.value?.success && Array.isArray(estRes.value.data)) {
            const cleaned = estRes.value.data.filter(
              (e: AdminEstablishment) =>
                !demoIds.includes(e.id) &&
                !(e.clienteCuit && demoCuits.includes(e.clienteCuit)) &&
                !(e.clienteId && demoClientIds.includes(e.clienteId))
            );
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

      syncWithServer();
    } catch (e) {
      console.error("Error cargando datos administrativos locales:", e);
    }
  }, []);

  // Métodos de autenticación
  const login = (usuario: string, contrasenia: string): { success: boolean; error?: string } => {
    const cleanUser = usuario.trim();
    const cleanPass = contrasenia.trim();

    if (!cleanUser) {
      return { success: false, error: "Por favor ingresá tu nombre de usuario." };
    }
    if (!cleanPass) {
      return { success: false, error: "Por favor ingresá la contraseña de acceso." };
    }

    if (
      cleanUser.toLowerCase() === ADMIN_USER_EXPECTED.toLowerCase() &&
      cleanPass === ADMIN_PASS_EXPECTED
    ) {
      const newSession: AdminSession = {
        isAuthenticated: true,
        username: ADMIN_USER_EXPECTED,
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

    return {
      success: false,
      error: "Credenciales incorrectas. Verificá tu usuario y contraseña de administrador.",
    };
  };

  const logout = () => {
    setSession({ isAuthenticated: false, username: "" });
    try {
      localStorage.removeItem("cd_admin_session");
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

  // Estadísticas del Dashboard
  const stats: AdminDashboardStats = useMemo(() => {
    const pendientes = quotationsReceived.filter(
      (q) => q.estado === "NUEVA" || q.estado === "EN EVALUACIÓN"
    ).length;

    const totalUsd = quotationsSent.reduce(
      (acc, curr) => acc + (curr.totalUsd || 0),
      0
    );

    return {
      totalClientes: clients.length,
      cotizacionesPendientes: pendientes,
      cotizacionesEnviadasTotalUsd: totalUsd,
      establecimientosTotales: establishments.length,
      cotizacionesMes: quotationsReceived.length + quotationsSent.length,
    };
  }, [clients, quotationsReceived, quotationsSent, establishments]);

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
