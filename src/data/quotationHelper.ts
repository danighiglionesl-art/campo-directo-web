import quotationData from "./quotationData.json";
import { InsumoItem, SemillaItem, GranosConfig } from "@/types/quotation";

export const allInsumos: InsumoItem[] = quotationData.insumos as InsumoItem[];
export const allSemillas: SemillaItem[] = quotationData.semillas as SemillaItem[];
export const granosConfig: GranosConfig = quotationData.granosConfig as GranosConfig;

// Extract unique lists for Insumos
export const insumoEmpresas: string[] = Array.from(
  new Set(allInsumos.map((i) => i.empresa).filter(Boolean))
).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

export const insumoCategorias: string[] = Array.from(
  new Set(allInsumos.map((i) => i.categoria).filter(Boolean))
).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

export const insumoPrincipios: string[] = Array.from(
  new Set(allInsumos.map((i) => i.principioActivo).filter(Boolean))
).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

// Extract unique commercial product names
export const insumoProductos: string[] = Array.from(
  new Set(allInsumos.map((i) => i.producto).filter(Boolean))
).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

// Extract unique individual crops from the comma-separated or text descriptions
export const insumoCultivos: string[] = [
  "SOJA",
  "MAÍZ",
  "TRIGO",
  "GIRASOL",
  "CEBADA",
  "SORGO",
  "BARBECHO",
  "PASTURAS",
  "ALFALFA",
  "ARROZ",
  "ALGODÓN",
  "MANÍ",
  "PAPA",
  "FRUTALES / CÍTRICOS",
  "HORTALIZAS",
  "CEREALES DE INVIERNO",
  "TODOS LOS CULTIVOS",
];

// Extract unique lists for Semillas
export const semillaEmpresas: string[] = Array.from(
  new Set(allSemillas.map((s) => s.empresa).filter(Boolean))
).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

export const semillaCultivos: string[] = Array.from(
  new Set(allSemillas.map((s) => s.semilla).filter(Boolean))
).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

export const semillaTecnologias: string[] = Array.from(
  new Set(allSemillas.map((s) => s.tecnologia).filter(Boolean))
).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

export const semillaVariedades: string[] = Array.from(
  new Set(allSemillas.map((s) => s.variedad).filter(Boolean))
).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

// List of Argentine provinces
export const ARGENTINE_PROVINCES: string[] = [
  "BUENOS AIRES",
  "CIUDAD AUTÓNOMA DE BUENOS AIRES",
  "CÓRDOBA",
  "SANTA FE",
  "ENTRE RÍOS",
  "LA PAMPA",
  "SANTIAGO DEL ESTERO",
  "CHACO",
  "SALTA",
  "TUCUMÁN",
  "CORRIENTES",
  "MISIONES",
  "SAN LUIS",
  "MENDOZA",
  "SAN JUAN",
  "LA RIOJA",
  "CATAMARCA",
  "JUJUY",
  "FORMOSA",
  "NEUQUÉN",
  "RÍO NEGRO",
  "CHUBUT",
  "SANTA CRUZ",
  "TIERRA DEL FUEGO",
];

// Key agricultural localities by province
export const LOCALITIES_BY_PROVINCE: Record<string, string[]> = {
  "BUENOS AIRES": [
    "PERGAMINO",
    "JUNÍN",
    "TANDIL",
    "BALCARCE",
    "NECOCHEA",
    "TRES ARROYOS",
    "BAHÍA BLANCA",
    "CHIVILCOY",
    "SALTO",
    "CHACABUCO",
    "9 DE JULIO",
    "TRENQUE LAUQUEN",
    "PEHUAJÓ",
    "BOLÍVAR",
    "AZUL",
    "OLAVARRÍA",
    "BRAGADO",
    "MERCEDES",
    "SAN NICOLÁS",
    "RAMALLO",
    "COLÓN",
    "ROJAS",
    "CARMEN DE ARECO",
    "LINCOLN",
    "VILLEGAS",
    "CORONEL SUÁREZ",
    "OTRA LOCALIDAD",
  ],
  "CÓRDOBA": [
    "RÍO CUARTO",
    "CÓRDOBA CAPITAL",
    "VILLA MARÍA",
    "MARCOS JUÁREZ",
    "SAN FRANCISCO",
    "BELL VILLE",
    "LABOULAYE",
    "JESÚS MARÍA",
    "RÍO TERCERO",
    "LA CARLOTA",
    "CANALS",
    "HUINCA RENANCÓ",
    "GENERAL DEHEZA",
    "GENERAL CABRERA",
    "HERNANDO",
    "LEONES",
    "MONTE BUEY",
    "ARIAS",
    "CORRAL DE BUSTOS",
    "VILLA DOLORES",
    "OTRA LOCALIDAD",
  ],
  "SANTA FE": [
    "ROSARIO",
    "SANTA FE CAPITAL",
    "VENADO TUERTO",
    "RAFAELA",
    "RECONQUISTA",
    "CASILDA",
    "SAN LORENZO",
    "TIMBÚES",
    "PUERTO GENERAL SAN MARTÍN",
    "ARROYO SECO",
    "VILLA CONSTITUCIÓN",
    "CAÑADA DE GÓMEZ",
    "ESPERANZA",
    "SUNCHALES",
    "FIRMAT",
    "RUFINO",
    "SAN JORGE",
    "SAN CRISTÓBAL",
    "CORONDA",
    "OTRA LOCALIDAD",
  ],
  "ENTRE RÍOS": [
    "PARANÁ",
    "GUALEGUAYCHÚ",
    "CONCORDIA",
    "VICTORIA",
    "NOGOYÁ",
    "VILLAGUAY",
    "CRESPO",
    "DIAMANTE",
    "LA PAZ",
    "URDINARRAIN",
    "GUALEGUAY",
    "CHAJARÍ",
    "OTRA LOCALIDAD",
  ],
  "LA PAMPA": [
    "SANTA ROSA",
    "GENERAL PICO",
    "REALICÓ",
    "INTENDENTE ALVEAR",
    "EDUARDO CASTEX",
    "MACACHÍN",
    "GUATRACHÉ",
    "GENERAL ACHA",
    "VICTORICA",
    "OTRA LOCALIDAD",
  ],
  "SANTIAGO DEL ESTERO": [
    "SANTIAGO DEL ESTERO CAPITAL",
    "BANDERA",
    "QUIMILÍ",
    "AÑATUYA",
    "FRÍAS",
    "LA BANDA",
    "SACHAYOJ",
    "LOS JURÍES",
    "OTRA LOCALIDAD",
  ],
  "CHACO": [
    "RESISTENCIA",
    "CHARATA",
    "PRESIDENCIA ROQUE SÁENZ PEÑA",
    "LAS BREÑAS",
    "VILLA ÁNGELA",
    "GENERAL PINEDO",
    "OTRA LOCALIDAD",
  ],
  "SALTA": [
    "SALTA CAPITAL",
    "LAS LAJITAS",
    "JOAQUÍN V. GONZÁLEZ",
    "METÁN",
    "ROSARIO DE LA FRONTERA",
    "ORÁN",
    "TARTAGAL",
    "OTRA LOCALIDAD",
  ],
  "TUCUMÁN": [
    "SAN MIGUEL DE TUCUMÁN",
    "CONCEPCIÓN",
    "BURRUYACÚ",
    "LEALES",
    "CRUZ ALTA",
    "TAFÍ VIEJO",
    "OTRA LOCALIDAD",
  ],
};

// Country codes with flags
export interface CountryCode {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRY_PHONE_CODES: CountryCode[] = [
  { code: "+54", name: "Argentina", flag: "🇦🇷" },
  { code: "+598", name: "Uruguay", flag: "🇺🇾" },
  { code: "+595", name: "Paraguay", flag: "🇵🇾" },
  { code: "+55", name: "Brasil", flag: "🇧🇷" },
  { code: "+56", name: "Chile", flag: "🇨🇱" },
  { code: "+591", name: "Bolivia", flag: "🇧🇴" },
  { code: "+1", name: "Estados Unidos", flag: "🇺🇸" },
  { code: "+34", name: "España", flag: "🇪🇸" },
  { code: "+00", name: "Otro país", flag: "🌍" },
];

export const HORARIOS_PREFERIDOS = [
  "MAÑANA (08:00 A 12:00 HS)",
  "MEDIODÍA (12:00 A 15:00 HS)",
  "TARDE (15:00 A 19:00 HS)",
  "CUALQUIER HORARIO / INDISTINTO",
];

// Helper to format CUIT XX-XXXXXXXX-X
export function formatCuit(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`;
}

// Known or sample AFIP names for quick instant mock lookup
const KNOWN_AFIP_ENTITIES: Record<string, string> = {
  "30712345678": "AGROPECUARIA EL TRÉBOL S.A.",
  "30708523691": "DON MANUEL CAMPOS Y HACIENDA S.R.L.",
  "20334455667": "GONZÁLEZ MARIANO ALBERTO",
  "30654321987": "ESTABLECIMIENTO LA ESPERANZA S.A.",
  "30716584932": "CEREALERA PAMPEANA S.A.",
  "20289456123": "ROSSI CARLOS EDUARDO",
};

export function simulateAfipLookup(cuit: string): Promise<string | null> {
  const clean = cuit.replace(/\D/g, "");
  return new Promise((resolve) => {
    setTimeout(() => {
      if (clean.length === 11) {
        if (KNOWN_AFIP_ENTITIES[clean]) {
          resolve(KNOWN_AFIP_ENTITIES[clean]);
        } else {
          // If valid length but not in sample table, generate a plausible company/producer name based on prefix
          if (clean.startsWith("30") || clean.startsWith("33")) {
            resolve(`AGROEMPRESA REGISTRADA S.A. (CUIT ${clean})`);
          } else {
            resolve(`PRODUCTOR AGROPECUARIO REGISTRADO (CUIT ${clean})`);
          }
        }
      } else {
        resolve(null);
      }
    }, 350);
  });
}
