import crypto from "crypto";

export interface ServerUserRecord {
  id: string;
  usuario: string;
  razonSocial: string;
  apellidos: string;
  nombres: string;
  cuit: string;
  email: string;
  telefono?: string;
  whatsapp?: string;
  authProvider: "local" | "google";
  passwordHash?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OtpRecord {
  code: string;
  identifier: string; // normalizado
  userId: string;
  email: string;
  expiresAt: number;
  attempts: number;
  used: boolean;
}

// Usuarios del sistema (inicialmente vacío para operar con productores reales)
const SEED_USERS: ServerUserRecord[] = [];

// Preservar en globalThis para que persista durante Hot Reload en Next.js
declare global {
  // eslint-disable-next-line no-var
  var __campoDirectoUsers: Map<string, ServerUserRecord> | undefined;
  // eslint-disable-next-line no-var
  var __campoDirectoOtps: Map<string, OtpRecord> | undefined;
}

if (!globalThis.__campoDirectoUsers) {
  globalThis.__campoDirectoUsers = new Map<string, ServerUserRecord>();
  for (const u of SEED_USERS) {
    globalThis.__campoDirectoUsers.set(u.id, u);
  }
}

if (!globalThis.__campoDirectoOtps) {
  globalThis.__campoDirectoOtps = new Map<string, OtpRecord>();
}

const usersMap = globalThis.__campoDirectoUsers;
const otpsMap = globalThis.__campoDirectoOtps;

// Limpiar caracteres no numéricos del CUIT para búsquedas flexibles
function cleanCuit(cuit: string): string {
  return cuit.replace(/\D/g, "");
}

/**
 * Busca un usuario por CUIT o por correo electrónico
 */
export function findUserByCuitOrEmail(query: string): ServerUserRecord | null {
  const trimmed = query.trim().toLowerCase();
  const digits = cleanCuit(trimmed);

  for (const user of Array.from(usersMap.values())) {
    // Comparar por email
    if (user.email.toLowerCase() === trimmed) {
      return user;
    }
    // Comparar por CUIT (exacto o solo dígitos)
    if (digits && cleanCuit(user.cuit) === digits) {
      return user;
    }
    if (user.cuit.toLowerCase() === trimmed) {
      return user;
    }
  }

  return null;
}

/**
 * Busca un usuario por Usuario, CUIT o Email
 */
export function findUserByIdentifier(identifier: string): ServerUserRecord | null {
  const trimmed = identifier.trim().toLowerCase();
  const digits = cleanCuit(trimmed);

  for (const user of Array.from(usersMap.values())) {
    if (user.usuario.toLowerCase() === trimmed) {
      return user;
    }
    if (user.email.toLowerCase() === trimmed) {
      return user;
    }
    if (digits && cleanCuit(user.cuit) === digits) {
      return user;
    }
    if (user.cuit.toLowerCase() === trimmed) {
      return user;
    }
  }

  return null;
}

/**
 * Registra o actualiza un usuario en el almacén de memoria
 */
export function upsertUser(userData: Partial<ServerUserRecord> & { id: string }): ServerUserRecord {
  const existing = usersMap.get(userData.id);
  const now = new Date().toISOString();

  const merged: ServerUserRecord = {
    id: userData.id,
    usuario: userData.usuario || existing?.usuario || `user_${Date.now()}`,
    razonSocial: userData.razonSocial || existing?.razonSocial || "PRODUCTOR AGROPECUARIO",
    apellidos: userData.apellidos || existing?.apellidos || "",
    nombres: userData.nombres || existing?.nombres || "",
    cuit: userData.cuit || existing?.cuit || "",
    email: userData.email || existing?.email || "",
    telefono: userData.telefono || existing?.telefono,
    whatsapp: userData.whatsapp || existing?.whatsapp,
    authProvider: userData.authProvider || existing?.authProvider || "local",
    passwordHash: userData.passwordHash || existing?.passwordHash,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  usersMap.set(merged.id, merged);
  return merged;
}

/**
 * Genera y almacena un código OTP de 6 dígitos seguro
 * Validez por defecto: 15 minutos
 */
export function createPasswordResetOtp(
  userId: string,
  email: string,
  minutesValid: number = 15
): { code: string; expiresAt: number } {
  // Generar número criptográfico entre 100000 y 999999
  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + minutesValid * 60 * 1000;

  const otpRecord: OtpRecord = {
    code,
    identifier: userId,
    userId,
    email,
    expiresAt,
    attempts: 0,
    used: false,
  };

  // Guardar por clave única
  otpsMap.set(`${userId}:${code}`, otpRecord);

  // También asociar como último OTP del usuario
  otpsMap.set(`latest:${userId}`, otpRecord);

  return { code, expiresAt };
}

/**
 * Verifica el código OTP y actualiza la contraseña del usuario
 */
export function verifyAndResetPassword(
  identifier: string,
  code: string,
  newPassword: string
): { success: boolean; error?: string } {
  const user = findUserByIdentifier(identifier);
  if (!user) {
    return { success: false, error: "No se encontró ningún usuario con los datos indicados." };
  }

  if (user.authProvider === "google") {
    return {
      success: false,
      error: "Esta cuenta utiliza autenticación con Google. Podés iniciar sesión directamente con el botón 'Continuar con Google'.",
    };
  }

  const cleanCode = code.trim();
  const key = `${user.id}:${cleanCode}`;
  const record = otpsMap.get(key) || otpsMap.get(`latest:${user.id}`);

  if (!record) {
    return { success: false, error: "El código ingresado es incorrecto o ha caducado." };
  }

  if (record.used) {
    return { success: false, error: "Este código ya fue utilizado. Por favor solicitá uno nuevo." };
  }

  if (Date.now() > record.expiresAt) {
    return { success: false, error: "El código ha vencido (validez de 15 minutos). Solicitá uno nuevo." };
  }

  if (record.code !== cleanCode) {
    record.attempts += 1;
    if (record.attempts >= 5) {
      record.used = true;
      return { success: false, error: "Demasiados intentos fallidos. El código ha sido invalidado por seguridad." };
    }
    return { success: false, error: `Código incorrecto. Te quedan ${5 - record.attempts} intentos.` };
  }

  // Código verificado con éxito: marcar como usado
  record.used = true;

  // Actualizar contraseña
  user.passwordHash = newPassword; // En producción con Supabase/Auth se hashea con bcrypt
  user.updatedAt = new Date().toISOString();
  usersMap.set(user.id, user);

  return { success: true };
}

/**
 * Obtener todos los usuarios registrados
 */
export function getAllUsers(): ServerUserRecord[] {
  return Array.from(usersMap.values());
}
