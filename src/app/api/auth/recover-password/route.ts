import { NextResponse } from "next/server";
import { findUserByIdentifier, createPasswordResetOtp } from "@/utils/serverAuthStore";
import { renderRecoverPasswordOtpEmail } from "@/utils/emailTemplates";
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
    const { identifier } = body as { identifier?: string };

    if (!identifier || !identifier.trim()) {
      return NextResponse.json(
        { error: "Por favor ingresá tu usuario, CUIT o correo electrónico." },
        { status: 400 }
      );
    }

    const user = findUserByIdentifier(identifier);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No se encontró ninguna cuenta registrada con los datos ingresados.",
        },
        { status: 404 }
      );
    }

    // Si la cuenta es de Google, guiar amablemente al usuario
    if (user.authProvider === "google") {
      return NextResponse.json({
        success: false,
        isGoogleAccount: true,
        message:
          "Tu cuenta utiliza acceso seguro con Google. No requerís contraseña: podés iniciar sesión directamente con el botón 'Continuar con Google'.",
      });
    }

    // Generar código OTP de 6 dígitos válido por 15 minutos
    const minutesValid = 15;
    const { code } = createPasswordResetOtp(user.id, user.email, minutesValid);

    // Generar correo institucional
    const html = renderRecoverPasswordOtpEmail({
      codigoOtp: code,
      minutosExpiracion: minutesValid,
      usuario: user.usuario,
      razonSocial: user.razonSocial,
    });

    const emailResult = await sendEmail({
      to: user.email,
      subject: `Código de Seguridad: ${code} - Restablecer Contraseña Campo Directo`,
      html,
    });

    const masked = maskEmail(user.email);

    return NextResponse.json({
      success: true,
      emailMasked: masked,
      minutesValid,
      simulated: emailResult.simulated,
      // Solo en desarrollo para testing rápido si el usuario lo prueba en local
      devCode: process.env.NODE_ENV !== "production" ? code : undefined,
      message: `Enviamos un código de 6 dígitos a tu casilla ${masked}.`,
    });
  } catch (error: any) {
    console.error("[recover-password] Error:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al procesar la solicitud de recuperación de contraseña." },
      { status: 500 }
    );
  }
}
