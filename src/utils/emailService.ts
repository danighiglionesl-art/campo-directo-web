/**
 * Servicio Despachador de Correos Electrónicos Oficiales de Campo Directo
 * Soporta Resend API en producción y modo simulado en desarrollo/local.
 */

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: SendEmailOptions): Promise<SendEmailResult> {
  const fromAddress =
    from ||
    process.env.EMAIL_FROM ||
    "Campo Directo <seguridad@campodirecto.ar>";

  const resendApiKey = process.env.RESEND_API_KEY;

  // Si existe una API key de Resend configurada, despachar de manera real
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject,
          html,
          text: text || subject,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("[EmailService] Error desde Resend API:", data);
        return {
          success: false,
          error: data?.message || "No se pudo enviar el correo a través de Resend.",
        };
      }

      console.log(`[EmailService] Correo enviado exitosamente a ${to} (ID: ${data.id})`);
      return {
        success: true,
        messageId: data.id,
        simulated: false,
      };
    } catch (err: any) {
      console.error("[EmailService] Excepción de red al enviar correo:", err);
      return {
        success: false,
        error: err?.message || "Fallo de conexión al enviar el correo.",
      };
    }
  }

  // MODO SIMULADO / DESARROLLO (sin API Key configurada todavía)
  // Imprime de forma muy visual y clara en la consola para pruebas
  console.log("\n========================================================");
  console.log("📨 [CORREO SIMULADO - CAMPO DIRECTO]");
  console.log(`DE:      ${fromAddress}`);
  console.log(`PARA:    ${to}`);
  console.log(`ASUNTO:  ${subject}`);
  console.log("--------------------------------------------------------");
  if (text) {
    console.log(`TEXTO:\n${text}`);
  } else {
    // Extraer texto simple si no viene provisto
    const cleanText = html.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
    console.log(`CONTENIDO (Resumen):\n${cleanText.slice(0, 300)}...`);
  }
  console.log("========================================================\n");

  return {
    success: true,
    messageId: `sim-${Date.now()}`,
    simulated: true,
  };
}
