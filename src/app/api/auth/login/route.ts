import { NextResponse } from "next/server";
import { findUserByIdentifier, upsertUser } from "@/utils/serverAuthStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body as {
      identifier?: string;
      password?: string;
    };

    if (!identifier || !identifier.trim()) {
      return NextResponse.json(
        { error: "Por favor ingresá tu usuario, CUIT o correo electrónico." },
        { status: 400 }
      );
    }

    if (!password || !password.trim()) {
      return NextResponse.json(
        { error: "Por favor ingresá tu contraseña." },
        { status: 400 }
      );
    }

    const cleanId = identifier.trim();
    let user = findUserByIdentifier(cleanId);

    // Si el usuario no existía aún en el store pero ingresa credenciales,
    // registrarlo dinámicamente para que en adelante cuente con recuperación completa
    if (!user) {
      const isEmail = cleanId.includes("@");
      const generatedUsername = isEmail
        ? cleanId.split("@")[0].toLowerCase()
        : cleanId.toLowerCase();

      user = upsertUser({
        id: `cli-${Date.now()}`,
        usuario: generatedUsername,
        razonSocial: generatedUsername.toUpperCase(),
        apellidos: "PRODUCTOR",
        nombres: "AGROPECUARIO",
        cuit: cleanId.replace(/\D/g, "").length === 11 ? cleanId : "20-00000000-0",
        email: isEmail ? cleanId.toLowerCase() : `${generatedUsername}@campodirecto.ar`,
        authProvider: "local",
        passwordHash: password,
      });
    } else {
      // Si el usuario existe y tiene contraseña registrada, verificar coincidencia
      if (user.authProvider === "google") {
        return NextResponse.json(
          {
            error:
              "Esta cuenta utiliza inicio de sesión con Google. Por favor utilizá el botón 'Continuar con Google'.",
            isGoogleAccount: true,
          },
          { status: 400 }
        );
      }

      if (user.passwordHash && user.passwordHash !== password) {
        return NextResponse.json(
          { error: "La contraseña ingresada es incorrecta. ¿Olvidaste tu contraseña?" },
          { status: 401 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        usuario: user.usuario,
        razonSocial: user.razonSocial,
        apellidos: user.apellidos,
        nombres: user.nombres,
        cuit: user.cuit,
        email: user.email,
        telefono: user.telefono || "",
        whatsapp: user.whatsapp || "",
      },
    });
  } catch (error: any) {
    console.error("[auth-login] Error:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al procesar el inicio de sesión." },
      { status: 500 }
    );
  }
}
