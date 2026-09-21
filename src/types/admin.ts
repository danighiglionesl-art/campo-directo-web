export type AdminTab =
  | "dashboard"
  | "usuarios"
  | "cotizaciones-recibidas"
  | "cotizaciones-enviadas"
  | "establecimientos"
  | "formas-pago"
  | "fabricas"
  | "configuracion";

export type FactoryTab =
  | "mis-datos"
  | "mis-productos"
  | "cotizaciones"
  | "ventas"
  | "cuenta-corriente";

export interface AdminSession {
  isAuthenticated: boolean;
  username: string;
  role?: "admin" | "fabrica";
  empresa?: string;
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
  localidad?: string;
  provincia?: string;
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
  totalFabricas?: number;
  ventasTransitoTotalUsd?: number;
}

// 1. SECCIÓN: USUARIOS FÁBRICA / CUENTA DE FÁBRICA
export interface FactoryAccount {
  id: string;
  empresa: string; // Nombre Fijo: Ej: ADAMA, INSUAGRO
  razonSocial: string; // 1a
  cuit: string; // 1b
  contactoComercial: string; // 1c: Apellidos y Nombres
  whatsapp: string; // 1d
  email: string; // 1e
  usuario: string; // 2a: Ej: fab.adama
  claveActiva: string; // 2b y 2c: Ej: adama.2026 (Visible y editable por CampoDirecto)
  estado: "ACTIVO" | "INACTIVO";
  fechaAlta: string;
  rubroPrincipal?: "Insumos" | "Semillas" | "Ambos";
  direccion?: string;
  localidad?: string;
  provincia?: string;
}

// 2. SECCIÓN: MIS PRODUCTOS (ABM Vinculado al Portal)
export interface FactoryProduct {
  id: string;
  empresa: string; // Nombre Fijo
  rubro: "Semillas" | "Insumos"; // 2a
  nombre: string; // 2b: Nombre comercial / producto
  categoria: string; // 2c: Ej. Herbicida, Fungicida, Insecticida, etc.
  principioActivo: string; // 2d: Principio activo o tecnología
  cultivos: string[]; // 2e: Lista preseleccionable
  imagenUrl: string; // 2f: Imagen (Base64 o URL)
  imagenFormato?: string;
  presentacion?: string;
  descripcion?: string;
  fechaActualizacion: string;
  activoEnPortal: boolean;
  cultivoSemilla?: string;
  variedadSemilla?: string;
  tecnologiaSemilla?: string;
  caracteristicasSemilla?: string;
}

// 3. SECCIÓN: COTIZACIONES INTERMEDIADAS & GESTIÓN CON LUGAR DE ENTREGA
export interface FactoryQuotationItem {
  id: string;
  producto: string;
  categoria: string;
  cantidad: number;
  unidad: string;
  detalle?: string;
  // Cotización Fábrica
  precioUnitarioFabricaUsd?: number;
  subtotalFabricaUsd?: number;
  plazoEntrega?: string;
  disponibilidad?: string;
  // Definición Granular de Markup por Producto (por CampoDirecto)
  markupTipo?: "PORCENTAJE" | "MONTO_FIJO"; // Porcentaje o Monto Fijo en USD
  markupValor?: number; // ej: 10% o USD 2.50
  precioUnitarioClienteUsd?: number;
  subtotalClienteUsd?: number;
}

export interface FactoryQuotationDerivation {
  id: string;
  cotizacionOriginalId: string;
  numeroCotizacion: string;
  fechaDerivacion: string;
  empresa: string; // Fábrica asignada
  clienteNombre: string;
  clienteCuit: string;
  clienteTelefono?: string;
  clienteEmail?: string;
  // 3b: Lugar de Entrega Georreferenciado
  lugarEntrega: {
    establecimiento: string;
    localidad: string;
    provincia: string;
    coordenadasGps?: string;
    linkMaps?: string;
    tipoDescarga?: string;
    referenciaAcceso?: string;
  };
  formaPago: string;
  items: FactoryQuotationItem[];
  estado: "DERIVADA_A_FABRICA" | "COTIZADA_POR_FABRICA" | "ENVIADA_A_CLIENTE" | "ACEPTADA" | "RECHAZADA";
  notasCampoDirecto?: string;
  // Respuesta comercial de la Fábrica
  respuestaFabrica?: {
    totalFabricaUsd: number;
    validezOferta: string;
    condicionPago: string;
    plazoEntrega: string;
    observaciones: string;
    fechaRespuesta: string;
  };
  // Configuración de Markup por Cotización
  markupGlobal?: {
    tipo: "GLOBAL" | "POR_PRODUCTO";
    porcentajeGlobal?: number;
    totalClienteUsd: number;
    totalMarkupUsd: number;
  };
}

// 4. SECCIÓN: VENTAS (EN TRÁNSITO Y ENTREGADAS CON 4 COMPROBANTES PDF)
export interface SaleDocument {
  tipo: "REMITO" | "FACTURA" | "PAGO" | "RECIBO";
  nombreArchivo: string;
  urlPdf?: string; // Data URL o URL del archivo
  fechaSubida: string;
  subidoPor: "FABRICA" | "CAMPO_DIRECTO";
  tamanoKb?: number;
}

export interface FactorySale {
  id: string;
  numeroOperacion: string; // Ej: VTA-2026-0891
  empresa: string;
  cotizacionRelacionadaId?: string;
  fechaVenta: string;
  clienteNombre: string;
  clienteCuit: string;
  lugarEntrega: string;
  estado: "EN_TRANSITO" | "ENTREGADA" | "CANCELADA";
  fechaEntregaEstimada?: string;
  fechaEntregaReal?: string;
  items: {
    producto: string;
    cantidad: number;
    unidad: string;
    precioUnitarioFabricaUsd: number;
    subtotalFabricaUsd: number;
    precioUnitarioClienteUsd?: number;
    subtotalClienteUsd?: number;
  }[];
  totalFabricaUsd: number;
  totalClienteUsd: number;
  markupCampoDirectoUsd: number;
  // 4aI: PDF Remito
  pdfRemito?: SaleDocument;
  // 4aII: PDF Factura
  pdfFactura?: SaleDocument;
  // 4aIII: PDF Pago (Cargado por gestión CampoDirecto)
  pdfPago?: SaleDocument;
  // 4aIV: PDF Recibo oficial
  pdfRecibo?: SaleDocument;
  observaciones?: string;
}

// 5. SECCIÓN: CUENTA CORRIENTE & NOTAS DE CRÉDITO / DÉBITO
export interface FactoryAccountMovement {
  id: string;
  empresa: string;
  fecha: string;
  tipo: "FACTURA_COMPRA" | "PAGO_CAMPO_DIRECTO" | "NOTA_CREDITO" | "NOTA_DEBITO";
  numeroComprobante: string;
  concepto: string;
  operacionRelacionada?: string;
  debitoUsd: number; // A favor de la Fábrica (monto facturado)
  creditoUsd: number; // Pagado por CampoDirecto o deducciones
  saldoAcumuladoUsd: number;
  markupIntermediarioUsd?: number; // Markup registrado en la operación
  comprobantePdfUrl?: string;
  observaciones?: string;
}
