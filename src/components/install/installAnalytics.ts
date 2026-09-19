/**
 * Sistema de eventos de analítica para la página de instalación de Campo Directo (/instalar).
 * Compatible con Google Tag Manager (dataLayer) y CustomEvent del DOM, sin librerías externas.
 */

export interface InstallAnalyticsParams {
  platform?: string;
  isStandalone?: boolean;
  isInAppBrowser?: boolean;
  isWhatsApp?: boolean;
  browser?: string;
  [key: string]: unknown;
}

export function trackInstallAnalytics(
  eventName: string,
  params: InstallAnalyticsParams = {}
): void {
  if (typeof window === "undefined") return;

  const payload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    page: "/instalar",
    ...params,
  };

  // 1. Enviar a dataLayer (GTM / GA4) si está presente
  const win = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
  if (Array.isArray(win.dataLayer)) {
    win.dataLayer.push(payload);
  }

  // 2. Disparar CustomEvent en el DOM para observadores o scripts analíticos futuros
  try {
    window.dispatchEvent(
      new CustomEvent("cd_install_analytics", {
        detail: payload,
      })
    );
  } catch {
    // Ignorar si el navegador no permite CustomEvent
  }
}
