export type OperationType = "COMPRAR" | "VENDER";
export type CategoryType = "INSUMOS" | "SEMILLAS" | "GRANOS";

export interface InsumoItem {
  id: string;
  empresa: string;
  producto: string;
  principioActivo: string;
  categoria: string;
  cultivosPrincipales: string;
}

export interface SemillaItem {
  id: string;
  empresa: string;
  semilla: string;
  variedad: string;
  tecnologia: string;
  caracteristicas: string;
}

export interface GranosConfig {
  granos: string[];
  puertos: string[];
  condiciones: string[];
  mercados: string[];
  precioBuscado: string[];
  fletes: string[];
}

export interface QuoteItem {
  id: string;
  type: CategoryType;
  title: string;
  subtitle: string;
  badge: string;
  details: string;
  quantity: number | string;
  unit: string;
}

export interface DeliveryLocation {
  id: string;
  nombreLote: string;
  referenciaAcceso: string;
  coordenadasGps: string;
  linkMaps?: string;
  tipoDescarga?: string;
  esPrincipal?: boolean;
}

export interface ClientRegistrationData {
  apellidos: string;
  nombres: string;
  fechaNacimiento: string;
  dni: string;
  whatsappCountryCode: string;
  whatsappNumber: string;
  email: string;
  provincia: string;
  localidad: string;
  cuit: string;
  razonSocial: string;
  horariosPreferidos: string[];
  observaciones: string;
  tipoCliente: "NUEVO" | "REGISTRADO";
  puntosEntrega?: DeliveryLocation[];
  formaPago?: string;
}

