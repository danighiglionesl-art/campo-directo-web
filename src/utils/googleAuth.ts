import { siteConfig } from "@/data/siteConfig";

export interface GoogleUserData {
  sub: string;
  email: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email_verified?: boolean;
}

// Declaraciones de tipos para la API global de Google Identity Services (GIS)
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              error_description?: string;
            }) => void;
            error_callback?: (error: any) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
        };
      };
    };
  }
}

/**
 * Asegura la carga asíncrona del script oficial de Google Identity Services.
 */
export const loadGoogleIdentityScript = (): Promise<void> => {
  if (typeof window === "undefined") return Promise.reject(new Error("Ejecución en servidor (SSR)"));
  if (window.google?.accounts) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.getElementById("google-gsi-client");
    if (existing) {
      if (window.google?.accounts) {
        resolve();
      } else {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", (e) => reject(e));
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-client";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(new Error("No se pudo cargar la librería de Google Sign-In"));
    document.head.appendChild(script);
  });
};

/**
 * Decodifica el token JWT devuelto por Google en el flujo ID Token.
 */
export const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Error al decodificar JWT de Google:", err);
    return null;
  }
};

/**
 * Abre el diálogo emergente oficial de Google OAuth 2.0 y retorna los datos verificados del usuario.
 */
export const triggerGoogleAuth = async (
  customClientId?: string
): Promise<GoogleUserData> => {
  await loadGoogleIdentityScript();

  const clientId = customClientId || siteConfig.googleClientId;

  if (!clientId) {
    throw new Error("No se encontró el Client ID de Google configurado.");
  }

  return new Promise<GoogleUserData>((resolve, reject) => {
    try {
      if (!window.google?.accounts?.oauth2) {
        reject(new Error("La librería de autenticación de Google aún no está disponible."));
        return;
      }

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "email profile openid",
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            console.error("Error devuelto por Google OAuth:", tokenResponse);
            reject(new Error(tokenResponse.error_description || tokenResponse.error));
            return;
          }

          if (!tokenResponse.access_token) {
            reject(new Error("No se recibió el token de acceso de Google."));
            return;
          }

          try {
            // Consultar datos reales y verificados de la cuenta de Google
            const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });

            if (!res.ok) {
              throw new Error(`Google UserInfo devolvió status ${res.status}`);
            }

            const profile: GoogleUserData = await res.json();
            resolve(profile);
          } catch (fetchErr: any) {
            console.error("Error al obtener perfil desde Google:", fetchErr);
            reject(new Error("Error al obtener la información de tu perfil de Google."));
          }
        },
        error_callback: (err: any) => {
          console.error("Error de inicialización Google OAuth:", err);
          reject(new Error("La ventana de Google fue cerrada o cancelada."));
        },
      });

      // Solicita el token abriendo la ventana emergente de Google
      tokenClient.requestAccessToken({ prompt: "select_account" });
    } catch (err: any) {
      console.error("Fallo al iniciar Google OAuth:", err);
      reject(err);
    }
  });
};
