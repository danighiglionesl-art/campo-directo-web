import { NextResponse } from "next/server";
import { findUserByIdentifier, upsertUser } from "@/utils/serverAuthStore";
import { addClient, addEstablishment } from "@/utils/serverDataStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      cuit,
      razonSocial,
      apellidos,
      nombres,
      email,
      telefono,
      whatsapp,
      provincia,
      localidad,
      campoNombre,
      usuario,
      password,
    } = body as {
      cuit?: string;
      razonSocial?: string;
      apellidos?: string;
      nombres?: string;
      email?: string;
      telefono?: string;
      whatsapp?: string;
      provincia?: string;
      localidad?: string;
      campoNombre?: string;
      usuario?: string;
      password?: string;
    };

    const cleanCuit = String(cuit || "").replace(/\D/g, "");
    if (cleanCuit.length !== 11) {
      return NextResponse.json(
        { error: "Por favor ingresá un CUIT válido de 11 dígitos numéricos." },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Por favor ingresá un correo electrónico válido." },
        { status: 400 }
      );
    }

    const isGoogleAuth = body.authProvider === "google" || (!password && Boolean(email));
    if (!isGoogleAuth && (!password || password.length < 6)) {
      return NextResponse.json(
        { error: "La contraseña debe contener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const fullName = (
      razonSocial ||
      `${apellidos || ""} ${nombres || ""}`.trim() ||
      "PRODUCTOR AGROPECUARIO"
    ).toUpperCase();

    const cleanUser = (
      usuario?.trim() ||
      cleanEmail.split("@")[0] ||
      `productor_${cleanCuit.slice(2, 10)}`
    ).toLowerCase();

    // 1. Guardar en store de autenticación
    const clientId = `cli-${Date.now()}`;
    const serverUser = upsertUser({
      id: clientId,
      usuario: cleanUser,
      razonSocial: fullName,
      apellidos: (apellidos || fullName.split(" ")[0] || "PRODUCTOR").toUpperCase(),
      nombres: (
        nombres ||
        fullName.split(" ").slice(1).join(" ") ||
        "AGROPECUARIO"
      ).toUpperCase(),
      cuit: cuit || cleanCuit,
      email: cleanEmail,
      telefono: telefono || whatsapp || "",
      whatsapp: whatsapp || telefono || "",
      authProvider: isGoogleAuth ? "google" : "local",
      passwordHash: password || "GOOGLE_SSO_AUTH",
    });

    // 2. Guardar en almacén de datos del panel administrativo
    const registeredClient = addClient({
      usuario: cleanUser,
      razonSocial: fullName,
      apellidos: (apellidos || fullName.split(" ")[0] || "PRODUCTOR").toUpperCase(),
      nombres: (
        nombres ||
        fullName.split(" ").slice(1).join(" ") ||
        "AGROPECUARIO"
      ).toUpperCase(),
      cuit: cuit || cleanCuit,
      condicionIva: "Responsable Inscripto",
      email: cleanEmail,
      telefono: telefono || whatsapp || "",
      whatsapp: whatsapp || telefono || "",
      provincia: provincia?.trim().toUpperCase() || "CÓRDOBA",
      localidad: localidad?.trim().toUpperCase() || "CÓRDOBA",
      direccion: campoNombre?.trim().toUpperCase() || "TRANQUERA PRINCIPAL",
      actividadPrincipal: cleanCuit.startsWith("30") || cleanCuit.startsWith("33") ? "EMPRESA AGROPECUARIA" : "PRODUCCIÓN AGROPECUARIA",
      estado: "ACTIVO",
    });

    // 3. Si ingresó nombre de campo / establecimiento, registrarlo
    if (campoNombre && campoNombre.trim()) {
      addEstablishment({
        clienteId: registeredClient.id,
        clienteNombre: fullName,
        clienteCuit: cuit || cleanCuit,
        nombre: campoNombre.trim().toUpperCase(),
        provincia: provincia?.trim().toUpperCase() || "CÓRDOBA",
        localidad: localidad?.trim().toUpperCase() || "ZONA RURAL",
        hectareas: 300,
        actividad: "Agrícola",
        referenciaAcceso: "Tranquera de campo / Acceso principal",
        coordenadasGps: "",
        tipoDescarga: "Tranquera de campo / Silobolsa",
        esPrincipal: true,
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: registeredClient.id,
        usuario: serverUser.usuario,
        razonSocial: serverUser.razonSocial,
        apellidos: serverUser.apellidos,
        nombres: serverUser.nombres,
        cuit: serverUser.cuit,
        email: serverUser.email,
        telefono: serverUser.telefono,
        whatsapp: serverUser.whatsapp,
        provincia: registeredClient.provincia,
        localidad: registeredClient.localidad,
      },
      message: "Cuenta creada exitosamente en Campo Directo.",
    });
  } catch (error: any) {
    console.error("[api/auth/register] Error:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al procesar el registro de la cuenta." },
      { status: 500 }
    );
  }
}
