import { NextResponse } from "next/server";
import { QuoteItem, ClientRegistrationData } from "@/types/quotation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { operation, items, client, formaPago, generalObservations } = body as {
      operation: "COMPRAR" | "VENDER";
      items: QuoteItem[];
      client: Partial<ClientRegistrationData>;
      formaPago?: string;
      generalObservations?: string;
    };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No se seleccionaron productos para cotizar" },
        { status: 400 }
      );
    }

    // Format structured summary for internal logging / email dispatch
    const timestamp = new Date().toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
    });

    const itemsSummary = items
      .map(
        (item, index) =>
          `${index + 1}. [${item.type}] ${item.title} (${item.badge}) | Cantidad: ${item.quantity} ${item.unit} | Detalle: ${item.details || "-"}`
      )
      .join("\n");

    const puntosEntregaSummary =
      client.puntosEntrega && client.puntosEntrega.length > 0
        ? `\n- Geoposición Satelital de Entrega (${client.puntosEntrega.length} opciones):\n` +
          client.puntosEntrega
            .map(
              (p, idx) =>
                `  ${idx + 1}. [${p.tipoDescarga || "TRANQUERA"}] ${p.nombreLote || "LOTE SIN NOMBRE"}\n` +
                `     Acceso: ${p.referenciaAcceso || "Sin referencias adicionales"}\n` +
                `     GPS: ${p.coordenadasGps || "No especificadas"}${p.linkMaps ? ` (Link: ${p.linkMaps})` : ""}`
            )
            .join("\n")
        : "";

    const clientSummary =
      client.tipoCliente === "REGISTRADO"
        ? `CLIENTE REGISTRADO:\n- Identificador/Email: ${client.email || client.cuit || "No provisto"}`
        : `CLIENTE NUEVO:\n` +
          `- Apellido y Nombre: ${client.apellidos || ""} ${client.nombres || ""}\n` +
          `- DNI: ${client.dni || "-"}\n` +
          `- Fecha Nacimiento: ${client.fechaNacimiento || "-"}\n` +
          `- WhatsApp: ${client.whatsappCountryCode || ""} ${client.whatsappNumber || "-"}\n` +
          `- Email: ${client.email || "-"}\n` +
          `- Ubicación: ${client.localidad || "-"}, ${client.provincia || "-"}\n` +
          `- CUIT: ${client.cuit || "-"}\n` +
          `- Razón Social: ${client.razonSocial || "-"}\n` +
          `- Horarios de contacto preferidos: ${client.horariosPreferidos?.join(", ") || "Indistinto"}\n` +
          `- Observaciones: ${client.observaciones || generalObservations || "-"}` +
          puntosEntregaSummary;

    const selectedPaymentMethod = formaPago || client.formaPago || "NO ESPECIFICADA";

    const quotationReport = `
========================================
NUEVA COTIZACIÓN SOLICITADA - CAMPO DIRECTO
Fecha: ${timestamp}
Operación: ${operation === "VENDER" ? "VENTA (PRODUCTOR VENDE)" : "COMPRA (PRODUCTOR COMPRA)"}
Forma de Pago Seleccionada: ${selectedPaymentMethod}
========================================

${clientSummary}

FORMA DE PAGO:
----------------------------------------
${selectedPaymentMethod}

PRODUCTOS SOLICITADOS (${items.length}):
----------------------------------------
${itemsSummary}

OBSERVACIONES ADICIONALES:
----------------------------------------
${generalObservations || client.observaciones || "Sin observaciones adicionales."}
========================================
`;

    // Log the quotation on the server
    console.log(quotationReport);

    // If an SMTP or email dispatch service is configured, it would be dispatched here.
    // For now, it logs cleanly and returns success to the client without leaking destination email.
    return NextResponse.json({
      success: true,
      message: "Tu cotización fue enviada con éxito",
      itemsCount: items.length,
      formaPago: selectedPaymentMethod,
      timestamp,
    });
  } catch (error) {
    console.error("Error al procesar la cotización:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al procesar la solicitud." },
      { status: 500 }
    );
  }
}
