import { NextResponse } from "next/server";
import { QuoteItem, ClientRegistrationData } from "@/types/quotation";
import { addQuotationReceived, addEstablishment } from "@/utils/serverDataStore";
import { upsertUser } from "@/utils/serverAuthStore";
import { sendEmail } from "@/utils/emailService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { operation, items, client, formaPago, generalObservations } = body as {
      operation: "COMPRAR" | "VENDER";
      items: QuoteItem[];
      client: Partial<ClientRegistrationData> & {
        telefono?: string;
        establecimientoDestino?: string;
        usuario?: string;
        password?: string;
      };
      formaPago?: string;
      generalObservations?: string;
    };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No se seleccionaron productos para cotizar" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
    });

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `CD-2026-${randomNum}`;
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now.getFullYear()}`;

    const clientName =
      client.razonSocial ||
      `${client.apellidos || ""} ${client.nombres || ""}`.trim() ||
      "Productor Agropecuario";

    const clientCuit = client.cuit || "Sin CUIT";
    const clientTel = `${client.whatsappCountryCode || ""} ${client.whatsappNumber || client.telefono || ""}`.trim();
    const clientEmail = client.email || "";

    const selectedPaymentMethod = formaPago || client.formaPago || "NO ESPECIFICADA";

    const primaryGps =
      client.puntosEntrega && client.puntosEntrega.length > 0
        ? client.puntosEntrega[0]
        : null;

    const targetEst =
      client.establecimientoDestino ||
      primaryGps?.nombreLote ||
      "ESTABLECIMIENTO PRINCIPAL";

    // 1. Guardar en el almacén de datos del servidor para el Panel Administrativo
    const savedQuotation = addQuotationReceived({
      numero: code,
      fecha: formattedDate,
      clienteNombre: clientName,
      clienteCuit: clientCuit,
      clienteTelefono: clientTel,
      clienteEmail: clientEmail,
      operacion: operation === "VENDER" ? "VENTA" : "COMPRA",
      estado: "NUEVA",
      establecimientoDestino: targetEst,
      coordenadasGps: primaryGps?.coordenadasGps || undefined,
      linkMaps: primaryGps?.linkMaps || undefined,
      referenciaAcceso: primaryGps?.referenciaAcceso || undefined,
      tipoDescarga: primaryGps?.tipoDescarga || undefined,
      formaPagoSolicitada: selectedPaymentMethod,
      items: items.map((it, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        tipo:
          it.type === "INSUMOS"
            ? "insumo"
            : it.type === "SEMILLAS"
            ? "semilla"
            : "grano",
        nombre: it.title,
        categoriaOVariedad: it.subtitle || it.badge,
        empresa: it.badge,
        cantidad:
          typeof it.quantity === "number"
            ? it.quantity
            : parseFloat(String(it.quantity)) || 1,
        unidad: it.unit,
        detalle: it.details,
      })),
      observaciones: generalObservations || client.observaciones || undefined,
    });

    // 2. Si el cliente completó datos de usuario/cuenta, sincronizar con el gestor de autenticación
    if (clientEmail || clientCuit !== "Sin CUIT") {
      const generatedUsername = client.usuario || (clientEmail ? clientEmail.split("@")[0].toLowerCase() : `prod_${Date.now()}`);
      upsertUser({
        id: `cli-${Date.now()}`,
        usuario: generatedUsername,
        razonSocial: clientName,
        apellidos: client.apellidos || "",
        nombres: client.nombres || "",
        cuit: clientCuit,
        email: clientEmail,
        telefono: clientTel,
        whatsapp: clientTel,
        authProvider: "local",
        passwordHash: client.password || undefined,
      });
    }

    // 3. Si hay punto de entrega satelital registrado, guardarlo en la sección de Establecimientos del Panel
    if (primaryGps) {
      addEstablishment({
        clienteNombre: clientName,
        clienteCuit: clientCuit,
        nombre: primaryGps.nombreLote || "LOTE PRINCIPAL",
        provincia: client.provincia || "Córdoba",
        localidad: client.localidad || "",
        hectareas: 300,
        actividad: "Agrícola",
        referenciaAcceso: primaryGps.referenciaAcceso || "",
        coordenadasGps: primaryGps.coordenadasGps || "",
        linkMaps: primaryGps.linkMaps || "",
        tipoDescarga: primaryGps.tipoDescarga || "TRANQUERA DE CAMPO",
        esPrincipal: primaryGps.esPrincipal ?? true,
      });
    }

    // 4. Registro y despacho de correo al productor si tiene email
    if (clientEmail && clientEmail.includes("@")) {
      const itemsListHtml = items
        .map(
          (it, idx) =>
            `<li style="margin-bottom: 6px;"><strong>${it.title}</strong> (${it.badge}) - Cantidad: ${it.quantity} ${it.unit}</li>`
        )
        .join("");

      const clientConfirmHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h2 style="color: #1b4d3e;">¡Recibimos tu solicitud de cotización ${code}!</h2>
          <p>Hola <strong>${clientName}</strong>, tu cotización ha ingresado con éxito al sistema de Campo Directo.</p>
          <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #166534;">Resumen de solicitud:</p>
            <ul style="margin: 0; padding-left: 20px; color: #14532d;">
              ${itemsListHtml}
            </ul>
            <p style="margin: 12px 0 0 0; font-size: 13px; color: #166534;"><strong>Forma de pago:</strong> ${selectedPaymentMethod}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #166534;"><strong>Destino:</strong> ${targetEst}</p>
          </div>
          <p style="font-size: 13px; color: #64748b;">Nuestro equipo comercial se contactará a la brevedad con la propuesta oficial correspondiente.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">Campo Directo Argentina · campodirecto.ar</p>
        </div>
      `;

      sendEmail({
        to: clientEmail,
        subject: `Confirmación de Cotización ${code} - Campo Directo`,
        html: clientConfirmHtml,
      }).catch((e) => console.error("Error enviando email confirmación cliente:", e));
    }

    return NextResponse.json({
      success: true,
      quotationNumber: code,
      data: savedQuotation,
      message: "Tu cotización fue enviada y registrada con éxito",
      itemsCount: items.length,
      formaPago: selectedPaymentMethod,
      timestamp,
    });
  } catch (error: any) {
    console.error("Error al procesar la cotización:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al procesar la solicitud." },
      { status: 500 }
    );
  }
}
