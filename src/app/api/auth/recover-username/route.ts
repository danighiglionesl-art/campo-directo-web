import { NextResponse } from "next/server";
import { findUserByCuitOrEmail } from "@/utils/serverAuthStore";
import { renderRecoverUsernameEmail } from "@/utils/emailTemplates";
import { sendEmail } from "@/utils/emailService";

function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const [name, domain] = parts;
  const visibleChars = Math.min(2, Math.floor(name.length / 2));
  const maskedName =
    name.slice(0, visibleChars) +
    "*".repeat(Math.max(2, name.length - visibleChars));
  return `${maskedName}@${domain}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cuitOrEmail } = body as { cuitOrEmail?: string };

    if (!cuitOrEmail || !cuitOrEmail.trim()) {
      return NextResponse.json(
        { error: "Por favor ingresá tu CUIT o tu correo electrónico." },
        { status: 400 }
      );
    }

    const user = findUserByCuitOrEmail(cuitOrEmail);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No se encontró ninguna cuenta registrada con el CUIT o correo electrónico ingresado.",
        },
        { status: 404 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://campodirecto.ar";

    // Generar email institucional
    const html = renderRecoverUsernameEmail({
      usuario: user.usuario,
      cuit: user.cuit,
      razonSocial: user.razonSocial,
      loginUrl: `${baseUrl}`,
    });

    const emailResult = await sendEmail({
      to: user.email,
      subject: "Recordatorio de tu Nombre de Usuario - Campo Directo",
      html,
    });

    const masked = maskEmail(user.email);

    return NextResponse.json({
      success: true,
      emailMasked: masked,
      simulated: emailResult.simulated,
      // Solo en desarrollo para testing rápido
      devUsername: process.env.NODE_ENV !== "production" ? user.usuario : undefined,
      message: `Hemos enviado tu nombre de usuario al correo ${masked}.`,
    });
  } catch (error: any) {
    console.error("[recover-username] Error:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al procesar la solicitud de recuperación de usuario." },
      { status: 500 }
    );
  }
}
