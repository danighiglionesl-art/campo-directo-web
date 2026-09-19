"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, Share, PlusSquare, X, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Hook auxiliar para registrar eventos de analítica sin dependencias pesadas
const trackPwaAnalytics = (
  eventName: string,
  parameters: Record<string, any> = {}
) => {
  if (typeof window === "undefined") return;

  // 1. Integración con Google Tag Manager / dataLayer si existe
  const windowWithDataLayer = window as unknown as { dataLayer?: any[] };
  if (Array.isArray(windowWithDataLayer.dataLayer)) {
    windowWithDataLayer.dataLayer.push({
      event: eventName,
      ...parameters,
    });
  }

  // 2. Disparar CustomEvent en el DOM para integraciones futuras
  window.dispatchEvent(
    new CustomEvent("cd_pwa_analytics", {
      detail: { event: eventName, ...parameters },
    })
  );
};

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Detectar si ya está en modo standalone (App ya instalada y abierta)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(isStandaloneMode);
      if (isStandaloneMode) {
        trackPwaAnalytics("pwa_opened_standalone");
      }
      return isStandaloneMode;
    };

    if (checkStandalone()) {
      return; // No mostrar nada si ya está en standalone
    }

    // 2. Verificar si el usuario ya instaló o pospuso el aviso recientemente
    const isAlreadyInstalled = localStorage.getItem("cd_pwa_installed") === "true";
    if (isAlreadyInstalled) {
      return;
    }

    const dismissedUntil = localStorage.getItem("cd_pwa_dismissed_until");
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }

    // 3. Detección de iOS / iPadOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    if (isIosDevice) {
      // En iOS Safari no hay beforeinstallprompt. Mostramos una invitación discreta tras unos segundos
      const timer = setTimeout(() => {
        setShowPrompt(true);
        trackPwaAnalytics("pwa_prompt_displayed", { platform: "ios" });
      }, 4000);
      return () => clearTimeout(timer);
    }

    // 4. Captura del evento nativo para Android, Windows, macOS, Chrome y Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setShowPrompt(true);
      trackPwaAnalytics("pwa_prompt_displayed", {
        platform: "chromium",
        platforms: promptEvent.platforms,
      });
    };

    // 5. Escuchar cuando la aplicación se haya instalado exitosamente
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setShowIosGuide(false);
      setInstalledSuccess(true);
      localStorage.setItem("cd_pwa_installed", "true");
      trackPwaAnalytics("pwa_install_confirmed");
      setTimeout(() => setInstalledSuccess(false), 5000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Manejador del clic en el botón de instalación
  const handleInstallClick = async () => {
    trackPwaAnalytics("pwa_install_click", { platform: isIos ? "ios" : "chromium" });

    if (isIos) {
      // En iOS abrimos la guía visual con pasos
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    // Disparar el prompt nativo de Android / Chrome / Edge
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      trackPwaAnalytics("pwa_install_accepted");
      setShowPrompt(false);
    } else {
      trackPwaAnalytics("pwa_install_dismissed");
      handleDismiss();
    }
    setDeferredPrompt(null);
  };

  // Posponer la invitación por 7 días para no incomodar al usuario
  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIosGuide(false);
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("cd_pwa_dismissed_until", (Date.now() + oneWeekMs).toString());
    trackPwaAnalytics("pwa_prompt_dismissed_user");
  };

  // No renderizar si ya está instalada o no hay prompt activo
  if (isStandalone || (!showPrompt && !installedSuccess)) {
    return null;
  }

  // Notificación de éxito al completar instalación
  if (installedSuccess) {
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-md w-full bg-emerald-800 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
        <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
        <p className="text-xs sm:text-sm font-semibold">
          ¡Campo Directo se instaló correctamente en tu dispositivo!
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Banner Principal de Invitación a la Instalación */}
      <div
        role="region"
        aria-label="Instalación de aplicación"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-40 max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-4 sm:p-5 animate-in fade-in slide-in-from-bottom-5 duration-300"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            {/* Ícono de la app con marco redondeado */}
            <div className="relative w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 shadow-xs shrink-0 overflow-hidden flex items-center justify-center p-1">
              <Image
                src="/android-chrome-192x192.png?v=3"
                alt="Campo Directo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Llevá Campo Directo con vos
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Instalalo en tu dispositivo y accedé directamente cuando lo necesites.
              </p>
            </div>
          </div>

          {/* Botón de cierre discreto */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Cerrar invitación de instalación"
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Acciones */}
        <div className="mt-4 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors rounded-xl"
          >
            Ahora no
          </button>
          <button
            type="button"
            onClick={handleInstallClick}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-campo-green hover:bg-campo-green-600 active:bg-campo-green-700 transition-all duration-200 rounded-xl shadow-xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-campo-green focus:ring-offset-2"
          >
            <Download className="w-4 h-4" />
            <span>Instalar Campo Directo</span>
          </button>
        </div>
      </div>

      {/* Modal / Guía Visual para usuarios de iPhone y iPad (Safari) */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-10 sm:zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-1">
                  <Image
                    src="/android-chrome-192x192.png?v=3"
                    alt="Campo Directo"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Campo Directo</h4>
                  <p className="text-xs text-slate-500">Instalación en iPhone / iPad</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Para agregar Campo Directo a tu pantalla de inicio en iOS:
            </p>

            <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-campo-green/15 text-campo-green font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="flex-1">
                  Tocá el botón <strong>Compartir</strong> en la barra inferior de Safari.
                </span>
                <Share className="w-4 h-4 text-sky-600 shrink-0" />
              </div>

              <div className="border-t border-slate-200/70" />

              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-campo-green/15 text-campo-green font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="flex-1">
                  Buscá y seleccioná <strong>Añadir a pantalla de inicio</strong>.
                </span>
                <PlusSquare className="w-4 h-4 text-slate-700 shrink-0" />
              </div>

              <div className="border-t border-slate-200/70" />

              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-campo-green/15 text-campo-green font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <span className="flex-1">
                  Confirmá tocando <strong>Añadir</strong> arriba a la derecha.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full mt-5 py-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors rounded-xl"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
