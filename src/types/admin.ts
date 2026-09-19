export type AdminTab =
  | "dashboard"
  | "usuarios"
  | "cotizaciones-recibidas"
  | "cotizaciones-enviadas"
  | "establecimientos"
  | "formas-pago"
  | "configuracion";

export interface AdminSession {
  isAuthenticated: boolean;
  username: string;
  loginTime?: string;
}

export interface AdminClient {
  id: string;
  usuario: string;
  razonSocial: string;
  apellidos: string;
  nombres: string;
  cuit: string;
  condicionIva: "Responsable Inscripto" | "Monotributo" | "Exento" | "Consumidor Final";
  email: string;
  telefono: string;
  whatsapp: string;
  provincia: string;
  localidad: string;
  codigoPostal?: string;
  direccion: string;
  actividadPrincipal: string;
  estado: "ACTIVO" | "VERIFICACIÓN PENDIENTE" | "INACTIVO";
  fechaAlta: string;
  notasInternas?: string;
}

export interface AdminQuotationItem {
  id: string;
  tipo: "insumo" | "semilla" | "grano";
  nombre: string;
  categoriaOVariedad: string;
  empresa: string;
  cantidad: number;
  unidad: string;
  detalle?: string;
}

export interface AdminQuotationReceived {
  id: string;
  numero: string;
  fecha: string;
  clienteId?: string;
  clienteNombre: string;
  clienteCuit: string;
  clienteTelefono?: string;
  clienteEmail?: string;
  operacion: "COMPRA" | "VENTA";
  estado: "NUEVA" | "EN EVALUACIÓN" | "COTIZADA" | "CERRADA" | "DESESTIMADA";
  establecimientoDestino?: string;
  coordenadasGps?: string;
  linkMaps?: string;
  referenciaAcceso?: string;
  tipoDescarga?: string;
  formaPagoSolicitada: string;
  items: AdminQuotationItem[];
  observaciones?: string;
  fechaRespuesta?: string;
}

export interface CommercialProposalItem {
  id: string;
  descripcion: string;
  cantidad: string;
  precioUnitarioUsd: number;
  subtotalUsd: number;
}

export interface CommercialAttachment {
  nombre: string;
  tamanoKb: number;
  tipo: "pdf" | "xlsx" | "doc" | "img";
  url?: string;
  fechaSubida?: string;
}

export interface AdminQuotationSent {
  id: string;
  numero: string; // ej: PROP-9041
  fechaEmision: string;
  fechaVencimiento: string;
  clienteId: string;
  clienteNombre: string;
  clienteCuit: string;
  clienteEmail?: string;
  asunto: string;
  estado: "VIGENTE" | "ACEPTADA" | "VENCIDA" | "RECHAZADA";
  totalUsd: number;
  condicionPago: string;
  plazoEntrega: string;
  items: CommercialProposalItem[];
  observaciones?: string;
  archivoAdjunto?: CommercialAttachment;
  cotizacionRecibidaRelacionadaId?: string;
}

export interface AdminEstablishment {
  id: string;
  clienteId?: string;
  clienteNombre: string;
  clienteCuit?: string;
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

export interface AdminPaymentMethod {
  id: string;
  codigo: string;
  nombre: string;
  categoria: "GRANOS" | "CHEQUES" | "BANCARIO" | "TARJETA" | "OTRO";
  descripcion: string;
  requisitos: string;
  tasaOInteres: string;
  plazoDias: string;
  activo: boolean;
  orden: number;
}

export interface AdminDashboardStats {
  totalClientes: number;
  cotizacionesPendientes: number;
  cotizacionesEnviadasTotalUsd: number;
  establecimientosTotales: number;
  cotizacionesMes: number;
}
