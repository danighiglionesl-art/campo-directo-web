import { NextResponse } from "next/server";
import { verifyAndResetPassword } from "@/utils/serverAuthStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, code, newPassword } = body as {
      identifier?: string;
      code?: string;
      newPassword?: string;
    };

    if (!identifier || !identifier.trim()) {
      return NextResponse.json(
        { error: "Identificador de usuario faltante." },
        { status: 400 }
      );
    }

    if (!code || !code.trim()) {
      return NextResponse.json(
        { error: "Por favor ingresá el código de 6 dígitos recibido por correo." },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    const result = verifyAndResetPassword(identifier, code, newPassword);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "No se pudo actualizar la contraseña." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "¡Contraseña actualizada con éxito! Ya podés ingresar a tu cuenta.",
    });
  } catch (error: any) {
    console.error("[reset-password] Error:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al restablecer la contraseña." },
      { status: 500 }
    );
  }
}
