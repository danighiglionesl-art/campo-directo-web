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

      // 2. Clientes
      const savedClients = localStorage.getItem("cd_admin_clients");
      if (savedClients) {
        setClients(JSON.parse(savedClients));
      }

      // 3. Cotizaciones Recibidas
      const savedRec = localStorage.getItem("cd_admin_quotations_received");
      if (savedRec) {
        setQuotationsReceived(JSON.parse(savedRec));
      } else {
        // Si el cliente ya tenía cotizaciones enviadas en su portal, sincronizarlas aquí
        const clientSent = localStorage.getItem("cd_client_sent_quotations");
        if (clientSent) {
          try {
            const parsed = JSON.parse(clientSent);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // mezclar sin duplicar id
              const merged = [...initialAdminQuotationsReceived];
              parsed.forEach((c) => {
                if (!merged.some((m) => m.numero === c.numero)) {
                  merged.unshift({
                    id: c.id || `sent-${Date.now()}`,
                    numero: c.numero,
                    fecha: c.fecha,
                    clienteNombre: "AGROPECUARIA PEREZ S.A.",
                    clienteCuit: "30-71234567-8",
                    operacion: c.operacion,
                    estado: c.estado || "EN EVALUACIÓN",
                    establecimientoDestino: c.establecimientoDestino,
                    formaPagoSolicitada: c.formaPago || "Transferencia Bancaria",
                    items: c.items || [],
                    observaciones: c.observaciones,
                  });
                }
              });
              setQuotationsReceived(merged);
              localStorage.setItem("cd_admin_quotations_received", JSON.stringify(merged));
            }
          } catch (e) {
            console.error("Error sincronizando cotizaciones de cliente:", e);
          }
        }
      }

      // 4. Cotizaciones Enviadas
      const savedSent = localStorage.getItem("cd_admin_quotations_sent");
      if (savedSent) {
        setQuotationsSent(JSON.parse(savedSent));
      }

      // 5. Establecimientos
      const savedEst = localStorage.getItem("cd_admin_establishments");
      if (savedEst) {
        setEstablishments(JSON.parse(savedEst));
      }

      // 6. Formas de Pago
      const savedPay = localStorage.getItem("cd_admin_payment_methods");
      if (savedPay) {
        setPaymentMethods(JSON.parse(savedPay));
      }
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
