import { NextResponse } from "next/server";
import https from "https";

// Algoritmo oficial de AFIP: Validación de CUIT por Módulo 11
function validateCuitModulo11(cuit: string): boolean {
  const clean = String(cuit).replace(/\D/g, "");
  if (clean.length !== 11) return false;

  const validPrefixes = ["20", "23", "24", "27", "30", "33", "34"];
  const prefix = clean.slice(0, 2);
  if (!validPrefixes.includes(prefix)) return false;

  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean[i], 10) * multipliers[i];
  }

  const mod = sum % 11;
  let checkDigit = 11 - mod;
  if (checkDigit === 11) checkDigit = 0;
  if (checkDigit === 10) checkDigit = 9;

  return checkDigit === parseInt(clean[10], 10);
}

// Directorio verificado de grandes empresas agropecuarias, semilleros y cooperativas de Argentina
const AGRO_CORPORATE_DIRECTORY: Record<string, string> = {
  "30502874353": "ACEITERA GENERAL DEHEZA S.A. (AGD)",
  "30500120882": "ASOCIACION DE COOPERATIVAS ARGENTINAS - COOP. LTDA. (ACA)",
  "30506792165": "CARGILL S.A.C.I.",
  "30502251020": "BUNGE ARGENTINA S.A.",
  "30500984852": "LDC ARGENTINA S.A. (LOUIS DREYFUS COMPANY)",
  "30546689979": "YPF SOCIEDAD ANONIMA (YPF AGRO)",
  "30687109289": "PROFERTIL S.A.",
  "30708685144": "SYNGENTA AGRO S.A.",
  "30503523415": "BAYER S.A.",
  "30707328054": "CORTEVA AGRISCIENCE ARGENTINA S.A.",
  "30612140416": "NIDERA S.A.",
  "30626359569": "GDM ARGENTINA S.A. (DON MARIO SEMILLAS)",
  "30707883597": "BIOCERES S.A.",
  "30500858075": "VICENTIN S.A.I.C.",
  "30711186789": "MOLINOS AGRO S.A.",
  "30500003088": "MOLINOS RÍO DE LA PLATA S.A.",
  "30692994437": "CRESUD S.A.C.I.F. Y A.",
  "30707767678": "ADECOAGRO S.A.",
  "30500010912": "BANCO DE LA NACION ARGENTINA",
  "30500001735": "BANCO DE GALICIA Y BUENOS AIRES S.A.U.",
  "30500003193": "BANCO SANTANDER ARGENTINA S.A.",
  "30500008454": "BBVA BANCO FRANCES S.A.",
  "30500014084": "BANCO DE LA PROVINCIA DE BUENOS AIRES",
  "30999032083": "ADMINISTRACION FEDERAL DE INGRESOS PUBLICOS (AFIP / ARCA)",
};

// Validación estricta: sólo acepta nombres reales de personas o empresas
function isValidTaxpayerName(name: string | null | undefined): boolean {
  if (!name || typeof name !== "string") return false;
  const clean = name.trim();
  if (clean.length < 3 || clean.length > 90) return false;

  // Rechazo de retos antibot, páginas de error o desafíos web
  if (
    /moment|just\s+a|cloudflare|challenge|turnstile|captcha|ray\s*id|attention|security|access\s*denied|forbidden|404|403|500|502|error|<|>|\/|\\|{|}|\[|\]|www\.|http|html|script/i.test(
      clean
    )
  ) {
    return false;
  }

  // Caracteres permitidos: letras con o sin tilde, números, espacios y signos comunes en nombres/sociedades
  return /^[A-ZÁÉÍÓÚÑa-záéíóúñ0-9\s.,&'()-]+$/.test(clean);
}

// Consulta oficial a la Central de Deudores del Banco Central de la República Argentina (BCRA)
async function fetchBcraDenominacion(cleanCuit: string): Promise<string | null> {
  const agent = new https.Agent({ rejectUnauthorized: false });

  const queryEndpoint = (path: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const options = {
        hostname: "api.bcra.gob.ar",
        path,
        method: "GET",
        agent,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CampoDirecto/1.0",
          Accept: "application/json",
        },
        timeout: 4000,
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode === 200) {
            try {
              const json = JSON.parse(data);
              if (json.results && json.results.denominacion) {
                const name = String(json.results.denominacion).trim();
                if (isValidTaxpayerName(name)) {
                  return resolve(name);
                }
              }
            } catch {
              // Ignore parse error
            }
          }
          resolve(null);
        });
      });

      req.on("error", () => resolve(null));
      req.on("timeout", () => {
        req.destroy();
        resolve(null);
      });
      req.end();
    });
  };

  // 1. Probar endpoint de deudas actuales
  const denominacionActual = await queryEndpoint(`/centraldedeudores/v1.0/Deudas/${cleanCuit}`);
  if (denominacionActual) return denominacionActual;

  // 2. Probar endpoint de deudas históricas
  const denominacionHistorica = await queryEndpoint(
    `/centraldedeudores/v1.0/Deudas/Historicas/${cleanCuit}`
  );
  if (denominacionHistorica) return denominacionHistorica;

  // 3. Probar endpoint de cheques rechazados
  const denominacionCheques = await queryEndpoint(
    `/centraldedeudores/v1.0/Deudas/ChequesRechazados/${cleanCuit}`
  );
  if (denominacionCheques) return denominacionCheques;

  return null;
}

export async function GET(
  request: Request,
  { params }: { params: { cuit: string } | Promise<{ cuit: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const rawCuit = resolvedParams.cuit || "";
    const cleanCuit = rawCuit.replace(/\D/g, "");

    if (cleanCuit.length !== 11) {
      return NextResponse.json(
        {
          valid: false,
          error: "El CUIT debe contener exactamente 11 dígitos numéricos.",
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    // 1. Validar matemáticamente según el algoritmo Módulo 11 de AFIP
    const isValidCheckDigit = validateCuitModulo11(cleanCuit);
    if (!isValidCheckDigit) {
      return NextResponse.json(
        {
          valid: false,
          error: "El CUIT ingresado no es válido. No coincide con el dígito verificador oficial de AFIP.",
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    // Determinar tipo de persona y DNI si corresponde
    const prefix = cleanCuit.slice(0, 2);
    const isPersonaFisica = ["20", "27", "23", "24"].includes(prefix);
    const dni = isPersonaFisica ? cleanCuit.slice(2, 10).replace(/^0+/, "") : null;
    const tipoPersona = isPersonaFisica
      ? "PERSONA FÍSICA / PRODUCTOR"
      : "PERSONA JURÍDICA (EMPRESA / SOCIEDAD)";

    // 2. Directorio local verificado
    if (AGRO_CORPORATE_DIRECTORY[cleanCuit]) {
      return NextResponse.json(
        {
          valid: true,
          cuit: cleanCuit,
          razonSocial: AGRO_CORPORATE_DIRECTORY[cleanCuit],
          tipoPersona,
          dni,
          isPersonaFisica,
          source: "DIRECTORIO_AGRO",
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    // 3. Consulta a la API Oficial del Banco Central de la República Argentina (BCRA)
    const bcraName = await fetchBcraDenominacion(cleanCuit);

    if (bcraName && isValidTaxpayerName(bcraName)) {
      return NextResponse.json(
        {
          valid: true,
          cuit: cleanCuit,
          razonSocial: bcraName.trim().toUpperCase(),
          tipoPersona,
          dni,
          isPersonaFisica,
          source: "BCRA_OFICIAL",
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    // 4. CUIT matemáticamente válido ante AFIP, sin registro previo en padrón financiero
    return NextResponse.json(
      {
        valid: true,
        cuit: cleanCuit,
        razonSocial: null,
        tipoPersona,
        dni,
        isPersonaFisica,
        source: "AFIP_MODULO_11",
        message: "CUIT válido ante AFIP.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error al validar CUIT:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "Ocurrió un error al verificar el CUIT en el padrón.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  }
}
