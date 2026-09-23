export interface ClientProfile {
  id: string;
  usuario: string;
  razonSocial: string;
  apellidos: string;
  nombres: string;
  fechaNacimiento?: string;
  dni?: string;
  cuit: string;
  condicionIva: string;
  email: string;
  telefono: string;
  whatsapp: string;
  provincia: string;
  localidad: string;
  codigoPostal?: string;
  direccion: string;
  actividadPrincipal: string;
  horariosPreferidos?: string[];
  observaciones?: string;
  authProvider?: "google" | "local";
}

export interface Establishment {
  id: string;
  nombre: string;
  provincia: string;
  localidad: string;
  hectareas: number;
  actividad: "Agrícola" | "Ganadero" | "Mixto" | "Servicios Agropecuarios";
  referenciaAcceso: string;
  coordenadasGps: string;
  linkMaps?: string;
  tipoDescarga?: string;
  esPrincipal?: boolean;
}

export interface SentQuotationItem {
  id: string;
  tipo: "insumo" | "semilla" | "grano";
  nombre: string;
  categoriaOVariedad: string;
  empresa: string;
  cantidad: number;
  unidad: string;
  detalle?: string;
}

export interface SentQuotation {
  id: string;
  numero: string;
  fecha: string;
  operacion: "COMPRA" | "VENTA";
  estado: "EN EVALUACIÓN" | "COTIZADA" | "CERRADA";
  items: SentQuotationItem[];
  establecimientoDestino?: string;
  formaPago?: string;
  observaciones?: string;
}

export interface ReceivedQuotationItem {
  id: string;
  descripcion: string;
  cantidad: string;
  precioUnitarioUsd: number;
  subtotalUsd: number;
}

export interface ReceivedQuotation {
  id: string;
  numero: string;
  fecha: string;
  vencimiento: string;
  asunto: string;
  estado: "VIGENTE" | "ACEPTADA" | "VENCIDA";
  totalUsd: number;
  condicionPago: string;
  plazoEntrega: string;
  items: ReceivedQuotationItem[];
  observaciones?: string;
}
