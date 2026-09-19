import {
  AdminClient,
  AdminQuotationReceived,
  AdminQuotationSent,
  AdminEstablishment,
  AdminPaymentMethod,
} from "@/types/admin";
import { initialAdminPaymentMethods } from "@/data/adminData";

interface ServerDataStore {
  clients: Map<string, AdminClient>;
  quotationsReceived: Map<string, AdminQuotationReceived>;
  quotationsSent: Map<string, AdminQuotationSent>;
  establishments: Map<string, AdminEstablishment>;
  paymentMethods: Map<string, AdminPaymentMethod>;
}

declare global {
  // eslint-disable-next-line no-var
  var __campoDirectoDataStore: ServerDataStore | undefined;
}

if (!globalThis.__campoDirectoDataStore) {
  const paymentMap = new Map<string, AdminPaymentMethod>();
  for (const p of initialAdminPaymentMethods) {
    paymentMap.set(p.id, p);
  }

  globalThis.__campoDirectoDataStore = {
    clients: new Map<string, AdminClient>(),
    quotationsReceived: new Map<string, AdminQuotationReceived>(),
    quotationsSent: new Map<string, AdminQuotationSent>(),
    establishments: new Map<string, AdminEstablishment>(),
    paymentMethods: paymentMap,
  };
}

const store = globalThis.__campoDirectoDataStore;

// ==========================================
// COTIZACIONES RECIBIDAS (SOLICITUDES DE CLIENTES)
// ==========================================
export function getQuotationsReceived(): AdminQuotationReceived[] {
  return Array.from(store.quotationsReceived.values()).sort(
    (a, b) => (b.id > a.id ? 1 : -1)
  );
}

export function addQuotationReceived(
  data: Omit<AdminQuotationReceived, "id">
): AdminQuotationReceived {
  const id = `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const record: AdminQuotationReceived = {
    ...data,
    id,
  };
  store.quotationsReceived.set(id, record);
  return record;
}

export function updateQuotationReceivedStatus(
  id: string,
  estado: AdminQuotationReceived["estado"],
  fechaRespuesta?: string
): AdminQuotationReceived | null {
  const existing = store.quotationsReceived.get(id);
  if (!existing) return null;

  const updated: AdminQuotationReceived = {
    ...existing,
    estado,
    fechaRespuesta: fechaRespuesta || existing.fechaRespuesta,
  };
  store.quotationsReceived.set(id, updated);
  return updated;
}

export function deleteQuotationReceived(id: string): boolean {
  return store.quotationsReceived.delete(id);
}

// ==========================================
// COTIZACIONES ENVIADAS (PROPUESTAS COMERCIALES)
// ==========================================
export function getQuotationsSent(): AdminQuotationSent[] {
  return Array.from(store.quotationsSent.values()).sort(
    (a, b) => (b.id > a.id ? 1 : -1)
  );
}

export function addQuotationSent(
  data: Omit<AdminQuotationSent, "id">
): AdminQuotationSent {
  const id = `prop-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const record: AdminQuotationSent = {
    ...data,
    id,
  };
  store.quotationsSent.set(id, record);
  return record;
}

export function updateQuotationSent(
  id: string,
  data: Partial<AdminQuotationSent>
): AdminQuotationSent | null {
  const existing = store.quotationsSent.get(id);
  if (!existing) return null;

  const updated: AdminQuotationSent = {
    ...existing,
    ...data,
  };
  store.quotationsSent.set(id, updated);
  return updated;
}

export function deleteQuotationSent(id: string): boolean {
  return store.quotationsSent.delete(id);
}

// ==========================================
// CLIENTES (PRODUCTORES Y EMPRESAS)
// ==========================================
export function getClients(): AdminClient[] {
  return Array.from(store.clients.values()).sort(
    (a, b) => (b.fechaAlta > a.fechaAlta ? 1 : -1)
  );
}

export function addClient(
  data: Omit<AdminClient, "id" | "fechaAlta">
): AdminClient {
  const id = `cli-${Date.now()}`;
  const now = new Date();
  const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${now.getFullYear()}`;

  const record: AdminClient = {
    ...data,
    id,
    fechaAlta: formattedDate,
  };
  store.clients.set(id, record);
  return record;
}

export function updateClient(
  id: string,
  data: Partial<AdminClient>
): AdminClient | null {
  const existing = store.clients.get(id);
  if (!existing) return null;

  const updated: AdminClient = {
    ...existing,
    ...data,
  };
  store.clients.set(id, updated);
  return updated;
}

export function deleteClient(id: string): boolean {
  return store.clients.delete(id);
}

// ==========================================
// ESTABLECIMIENTOS (CAMPOS Y DESTINOS)
// ==========================================
export function getEstablishments(): AdminEstablishment[] {
  return Array.from(store.establishments.values());
}

export function addEstablishment(
  data: Omit<AdminEstablishment, "id">
): AdminEstablishment {
  const id = `est-${Date.now()}`;
  const record: AdminEstablishment = {
    ...data,
    id,
  };
  store.establishments.set(id, record);
  return record;
}

export function updateEstablishment(
  id: string,
  data: Partial<AdminEstablishment>
): AdminEstablishment | null {
  const existing = store.establishments.get(id);
  if (!existing) return null;

  const updated: AdminEstablishment = {
    ...existing,
    ...data,
  };
  store.establishments.set(id, updated);
  return updated;
}

export function deleteEstablishment(id: string): boolean {
  return store.establishments.delete(id);
}

// ==========================================
// FORMAS DE PAGO Y CONDICIONES COMERCIALES
// ==========================================
export function getPaymentMethods(): AdminPaymentMethod[] {
  return Array.from(store.paymentMethods.values()).sort(
    (a, b) => a.orden - b.orden
  );
}

export function updatePaymentMethod(
  id: string,
  data: Partial<AdminPaymentMethod>
): AdminPaymentMethod | null {
  const existing = store.paymentMethods.get(id);
  if (!existing) return null;

  const updated: AdminPaymentMethod = {
    ...existing,
    ...data,
  };
  store.paymentMethods.set(id, updated);
  return updated;
}
