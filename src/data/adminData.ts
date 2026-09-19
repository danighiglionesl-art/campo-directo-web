import {
  AdminClient,
  AdminQuotationReceived,
  AdminQuotationSent,
  AdminEstablishment,
  AdminPaymentMethod,
} from "@/types/admin";
import * as XLSX from "xlsx";

export const initialAdminClients: AdminClient[] = [];

export const initialAdminEstablishments: AdminEstablishment[] = [];

export const initialAdminQuotationsReceived: AdminQuotationReceived[] = [];

export const initialAdminQuotationsSent: AdminQuotationSent[] = [];

export const initialAdminPaymentMethods: AdminPaymentMethod[] = [
  {
    id: "pay-001",
    codigo: "CANJE_CEREAL",
    nombre: "Canje de Granos (Disponible / Futuro / Foward)",
    categoria: "GRANOS",
    descripcion:
      "Abona tus insumos entregando cereal (Soja, Maíz, Trigo). Ahorro fiscal de retenciones e IVA, sin costo financiero adicional.",
    requisitos: "Cuenta comitente activa en acopio o corretaje designado.",
    tasaOInteres: "Tasa 0% (Condición pizarra con bonificación)",
    plazoDias: "A fijar o vencimiento mayo/julio",
    activo: true,
    orden: 1,
  },
  {
    id: "pay-002",
    codigo: "ECHEQ_DIFERIDO",
    nombre: "e-Cheq de Pago Diferido (30 a 180 días)",
    categoria: "CHEQUES",
    descripcion:
      "Cheques electrónicos directos. Emisión 100% digital desde home banking con plazos acordes al ciclo biológico del cultivo.",
    requisitos: "Calificación crediticia previa y constancia de CUIT sin inhibiciones.",
    tasaOInteres: "Tasa preferencial convenio agro 0% a 1.5% mensual según plazo",
    plazoDias: "30 / 60 / 90 / 120 / 180 días",
    activo: true,
    orden: 2,
  },
  {
    id: "pay-003",
    codigo: "TRANSFERENCIA_CONTADO",
    nombre: "Transferencia Bancaria Inmediata / Contado",
    categoria: "BANCARIO",
    descripcion:
      "Pago directo a cuentas recaudadoras oficiales de Campo Directo. Aplicación con descuento directo por pago anticipado.",
    requisitos: "Envío de comprobante oficial de transferencia bancaria (COELSA/MEP).",
    tasaOInteres: "Descuento comercial del 5% al 8% según producto",
    plazoDias: "Contado inmediato / 48 hs",
    activo: true,
    orden: 3,
  },
  {
    id: "pay-004",
    codigo: "CONVENIOS_BANCARIOS",
    nombre: "Líneas Crediticias y Convenios Bancarios Oficiales",
    categoria: "BANCARIO",
    descripcion:
      "Financiación a través de convenios con Banco Nación (Agronación), Galicia Rural, Banco Macro Agro, Santander Agro y Banco Provincia (Procampo).",
    requisitos: "Línea comercial agropecuaria precalificada con la entidad bancaria.",
    tasaOInteres: "Tasas subsidiadas de convenio oficial",
    plazoDias: "Hasta 270 / 360 días",
    activo: true,
    orden: 4,
  },
  {
    id: "pay-005",
    codigo: "TARJETAS_AGRO",
    nombre: "Tarjetas de Crédito Agropecuarias",
    categoria: "TARJETA",
    descripcion:
      "Visa Agro, Mastercard Campo, AgroCabal y Caldén Agraria. Compra directa con diferimiento de pago.",
    requisitos: "Plástico agro habilitado con límite operativo suficiente.",
    tasaOInteres: "Según promociones y acuerdos de campaña",
    plazoDias: "Vencimiento resumen bancario a cosecha",
    activo: true,
    orden: 5,
  },
];

/**
 * Utilidad para exportar cualquier arreglo de objetos a un archivo Excel (.xlsx)
 */
export function exportTableToExcel(data: Record<string, unknown>[], fileName: string, sheetName = "Datos") {
  if (typeof window === "undefined" || !data || data.length === 0) return;
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}
