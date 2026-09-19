"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Download,
  Share2,
  ExternalLink,
  CheckCircle2,
  Smartphone,
  Monitor,
  ArrowRight,
  Sparkles,
  QrCode,
  Copy,
  Check,
  Compass,
  MoreVertical,
  MoreHorizontal,
} from "lucide-react";
import { QrCodeSvg } from "@/components/install/QrCodeSvg";
import { trackInstallAnalytics } from "@/components/install/installAnalytics";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const InstallClientPage: React.FC = () => {
  // Estado de detección del entorno
  const [isMounted, setIsMounted] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isIpad, setIsIpad] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isWhatsApp, setIsWhatsApp] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  // Estados de interacción
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const [manualGuideAndroid, setManualGuideAndroid] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [showDesktopQr, setShowDesktopQr] = useState(false);

  // Detección inicial
  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsMounted(true);

    const ua = window.navigator.userAgent || "";
    const uaLower = ua.toLowerCase();

    // 1. Verificación Standalone (App ejecutándose dentro de su propia ventana independiente)
    const checkIsStandalone = () => {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes("android-app://")
      );
    };

    // Limpiar flag estático de localStorage para permitir reinstalaciones si el usuario desinstaló la app
    try {
      localStorage.removeItem("cd_pwa_installed");
    } catch {}

    const standaloneMode = checkIsStandalone();
    setIsStandalone(standaloneMode);

    // 2. Detección de Sistema Operativo y Dispositivo
    const iosDevice =
      /iphone|ipod/.test(uaLower) ||
      (/ipad/.test(uaLower)) ||
      (window.navigator.maxTouchPoints > 1 && /macintosh/.test(uaLower));
    const ipadDevice = /ipad/.test(uaLower) || (window.navigator.maxTouchPoints > 1 && /macintosh/.test(uaLower));
    const androidDevice = /android/.test(uaLower);
    const mobileDevice = iosDevice || androidDevice || /mobile|tablet|phone/.test(uaLower);
    const desktopDevice = !mobileDevice;

    // 3. Detección de WhatsApp y Navegadores In-App (WebViews)
    const whatsAppBrowser = /whatsapp/i.test(uaLower);
    const otherInApp =
      /fban|fbav|instagram|messenger|threads|tiktok|linkedin|twitter|line/i.test(uaLower) ||
      (androidDevice && /wv/.test(uaLower));
    const inApp = whatsAppBrowser || otherInApp;

    // 4. Safari en iOS
    const safariBrowser =
      iosDevice &&
      /safari/.test(uaLower) &&
      !/crios|fxios|optios|edgios|whatsapp|instagram|fbav/i.test(uaLower);

    setIsIos(iosDevice);
    setIsIpad(ipadDevice);
    setIsAndroid(androidDevice);
    setIsMobile(mobileDevice);
    setIsDesktop(desktopDevice);
    setIsWhatsApp(whatsAppBrowser);
    setIsInAppBrowser(inApp);
    setIsSafari(safariBrowser);

    // Registrar visita analítica
    trackInstallAnalytics("install_page_view", {
      platform: iosDevice ? "ios" : androidDevice ? "android" : "desktop",
      isStandalone: standaloneMode,
      isInAppBrowser: inApp,
      isWhatsApp: whatsAppBrowser,
      isSafari: safariBrowser,
    });

    if (iosDevice && !inApp) {
      trackInstallAnalytics("install_ios_instructions_viewed", { device: ipadDevice ? "ipad" : "iphone" });
    } else if (inApp) {
      trackInstallAnalytics("install_inapp_instructions_viewed", { isWhatsApp: whatsAppBrowser, platform: iosDevice ? "ios" : "android" });
    }

    // 5. Capturar o recuperar prompt diferido si ya existía en memoria global
    const globalPrompt = (window as unknown as { __cd_deferred_prompt?: BeforeInstallPromptEvent }).__cd_deferred_prompt;
    if (globalPrompt) {
      setDeferredPrompt(globalPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      (window as unknown as { __cd_deferred_prompt?: BeforeInstallPromptEvent }).__cd_deferred_prompt = promptEvent;
      setDeferredPrompt(promptEvent);
      setIsStandalone(false);
    };

    const handleCustomPromptEvent = (e: Event) => {
      const customEvent = e as CustomEvent<BeforeInstallPromptEvent>;
      if (customEvent.detail) {
        setDeferredPrompt(customEvent.detail);
        setIsStandalone(false);
      }
    };

    // 6. Detección de instalación completada
    const handleAppInstalled = () => {
      setInstalledSuccess(true);
      trackInstallAnalytics("install_confirmed", {
        platform: iosDevice ? "ios" : androidDevice ? "android" : "desktop",
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("cd_beforeinstallprompt", handleCustomPromptEvent);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("cd_beforeinstallprompt", handleCustomPromptEvent);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Manejar clic en "Instalar Campo Directo"
  const handleInstallClick = async () => {
    trackInstallAnalytics("install_click_install", {
      hasDeferredPrompt: !!deferredPrompt,
      platform: isIos ? "ios" : isAndroid ? "android" : "desktop",
    });

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setInstalledSuccess(true);
          localStorage.setItem("cd_pwa_installed", "true");
          trackInstallAnalytics("install_confirmed", { outcome: "accepted" });
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("Error al ejecutar prompt de instalación:", err);
      }
    } else if (isAndroid) {
      // Si el prompt nativo aún no está listo o el navegador no lo disparó, mostramos la guía de menú
      setManualGuideAndroid(true);
    }
  };

  // Abrir enlace externo en Google Chrome (Android intent)
  const handleOpenChromeIntent = () => {
    trackInstallAnalytics("install_open_chrome_intent");
    const urlWithoutScheme = "campodirecto.ar/instalar";
    const intentUrl = `intent://${urlWithoutScheme}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = intentUrl;
  };

  // Manejador de "Compartir Campo Directo"
  const handleShareClick = async () => {
    trackInstallAnalytics("install_click_share");
    const shareData = {
      title: "Campo Directo",
      text: "Llevá Campo Directo en tu celular y accedé directamente a la plataforma.",
      url: "https://campodirecto.ar/instalar",
    };

    if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }

    // Fallback: copiar al portapapeles
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText("https://campodirecto.ar/instalar");
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 3500);
      } catch {
        // Fallback silencioso
      }
    }
  };

  const handleContinueWeb = () => {
    trackInstallAnalytics("install_click_continue_web");
  };

  const handleOpenApp = () => {
    trackInstallAnalytics("install_click_open_app");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex flex-col justify-between selection:bg-campo-green selection:text-white">
      {/* Toast flotante de copiado al portapapeles */}
      {copiedToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-full shadow-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4"
        >
          <Check className="w-4 h-4 text-campo-green shrink-0" />
          <span>¡Enlace copiado para compartir!</span>
        </div>
      )}

      {/* Contenedor Principal Centrado */}
      <div className="w-full max-w-lg mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-12 flex-grow flex flex-col justify-center">
        {/* 1. ENCABEZADO INSTITUCIONAL */}
        <header className="text-center mb-8 sm:mb-10">
          <Link
            href="/"
            onClick={handleContinueWeb}
            className="inline-block transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-campo-green focus:ring-offset-2 rounded-xl mb-6"
            aria-label="Ir a la página principal de Campo Directo"
          >
            <div className="relative h-28 sm:h-32 w-80 sm:w-96 max-w-full mx-auto flex items-center justify-center">
              <Image
                src="/images/logo-transparent.png"
                alt="Campo Directo"
                width={600}
                height={240}
                priority
                className="h-full w-auto object-contain select-none"
              />
            </div>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Llevá <span className="text-campo-green">Campo Directo</span> con vos
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-sm mx-auto">
            Accedé directamente desde tu celular agregando Campo Directo a tu pantalla de inicio.
          </p>
        </header>

        {/* 2. ÁREA DE ESTADO SEGÚN DISPOSITIVO Y CONTEXTO */}
        <main className="w-full space-y-6">
          {/* CASO 1: YA INSTALADA / MODO STANDALONE */}
          {isMounted && isStandalone && !installedSuccess && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 text-center animate-in fade-in">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-campo-green mb-5 shadow-xs">
                <CheckCircle2 className="w-8 h-8 text-campo-green" />
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Campo Directo ya está instalado
              </h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Ya podés acceder directamente a la plataforma desde tu dispositivo.
              </p>

              <Link
                href="/"
                onClick={handleOpenApp}
                className="w-full inline-flex items-center justify-center gap-2.5 py-4 px-6 text-sm sm:text-base font-bold text-white bg-campo-green hover:bg-campo-green-600 active:bg-campo-green-700 transition-all duration-200 rounded-2xl shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-campo-green/30"
              >
                <span>Ir a Campo Directo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem("cd_pwa_installed");
                  } catch {}
                  setIsStandalone(false);
                }}
                className="mt-4 text-xs font-semibold text-slate-500 hover:text-campo-green transition-colors underline underline-offset-2"
              >
                ¿Querés volver a instalarlo o no encontrás el acceso? Tocá acá
              </button>
            </div>
          )}

          {/* CASO 2: INSTALACIÓN CONFIRMADA RECIÉN COMPLETADA */}
          {installedSuccess && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 text-center animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-campo-green mb-5 shadow-xs">
                <Sparkles className="w-8 h-8 text-campo-green" />
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-2">
                ¡Campo Directo ya está en tu celular!
              </h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                El ícono de acceso directo ya se encuentra en tu pantalla de inicio para que ingreses cuando lo necesites.
              </p>

              <Link
                href="/"
                onClick={handleOpenApp}
                className="w-full inline-flex items-center justify-center gap-2.5 py-4 px-6 text-sm sm:text-base font-bold text-white bg-campo-green hover:bg-campo-green-600 active:bg-campo-green-700 transition-all duration-200 rounded-2xl shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-campo-green/30"
              >
                <span>Abrir Campo Directo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* CASO 3: ANDROID DENTRO DE WHATSAPP / NAVEGADOR IN-APP */}
          {isMounted && !isStandalone && !installedSuccess && isAndroid && isInAppBrowser && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-amber-200/70 text-left animate-in fade-in">
              <div className="flex items-start gap-3.5 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-campo-gold shrink-0">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    Para instalar Campo Directo, abrí esta página en Chrome
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    {isWhatsApp
                      ? "WhatsApp no permite la instalación directa dentro de sus mensajes."
                      : "Tu navegador actual restringe la instalación directa."}{" "}
                    Seguí estos sencillos pasos:
                  </p>
                </div>
              </div>

              {/* Pasos numerados visuales */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-xs sm:text-sm text-slate-700 mb-6">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-campo-green/15 text-campo-green font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    1
                  </span>
                  <span className="flex-1 leading-relaxed">
                    Tocá los <strong>tres puntos</strong> (⋮) en la esquina superior derecha.
                  </span>
                  <MoreVertical className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                </div>

                <div className="border-t border-slate-200/70" />

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-campo-green/15 text-campo-green font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    2
                  </span>
                  <span className="flex-1 leading-relaxed">
                    Elegí <strong>“Abrir en Chrome”</strong> o <strong>“Abrir en el navegador”</strong>.
                  </span>
                  <ExternalLink className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                </div>

                <div className="border-t border-slate-200/70" />

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-campo-green/15 text-campo-green font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    3
                  </span>
                  <span className="flex-1 leading-relaxed">
                    En Chrome, tocá el botón <strong>“Instalar Campo Directo”</strong>.
                  </span>
                  <Download className="w-4 h-4 text-campo-green shrink-0 mt-0.5" />
                </div>
              </div>

              {/* Botón directo Intent de Android para abrir Chrome */}
              <button
                type="button"
                onClick={handleOpenChromeIntent}
                className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-5 text-sm sm:text-base font-bold text-white bg-campo-green hover:bg-campo-green-600 active:bg-campo-green-700 transition-all duration-200 rounded-2xl shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-campo-green/30"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir en Chrome</span>
              </button>
            </div>
          )}

          {/* CASO 4: ANDROID CHROME NATIVO (O NAVEGADOR ANDROID INDEPENDIENTE) */}
          {isMounted && !isStandalone && !installedSuccess && isAndroid && !isInAppBrowser && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 text-center animate-in fade-in">
              {/* Ícono de aplicación */}
              <div className="w-20 h-20 mx-auto rounded-2xl bg-white border border-slate-100 shadow-sm p-2 mb-6 flex items-center justify-center overflow-hidden">
                <Image
                  src="/icon-transparent-192x192.png?v=5"
                  alt="Ícono Campo Directo"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                Instalar Campo Directo
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mb-7 max-w-xs mx-auto leading-relaxed">
                Se agregará Campo Directo a la pantalla de inicio de tu celular para que puedas acceder directamente cuando lo necesites.
              </p>

              {/* Botón Principal Prominente */}
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full inline-flex items-center justify-center gap-3 py-4 px-6 text-base font-bold text-white bg-campo-green hover:bg-campo-green-600 active:bg-campo-green-700 transition-all duration-200 rounded-2xl shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-campo-green/30 active:scale-[0.99]"
              >
                <Download className="w-5 h-5 shrink-0" />
                <span>Instalar Campo Directo</span>
              </button>

              {/* Guía complementaria si el navegador requiere acción manual del menú */}
              {manualGuideAndroid && (
                <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs text-slate-700 animate-in fade-in">
                  <p className="font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5">
                    <MoreVertical className="w-3.5 h-3.5 text-campo-green" />
                    <span>Para completar la instalación:</span>
                  </p>
                  <p className="leading-relaxed">
                    Tocá los <strong>tres puntos (⋮)</strong> arriba a la derecha de Chrome y seleccioná <strong>“Instalar aplicación”</strong> o <strong>“Agregar a pantalla principal”</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* CASO 5: IPHONE / IPAD DENTRO DE WHATSAPP / IN-APP */}
          {isMounted && !isStandalone && !installedSuccess && isIos && isInAppBrowser && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-amber-200/70 text-left animate-in fade-in">
              <div className="flex items-start gap-3.5 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-campo-gold shrink-0">
                  <Compass className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    Para agregar Campo Directo a tu pantalla de inicio, abrí esta página en Safari
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    {isWhatsApp
                      ? "Desde el navegador interno de WhatsApp no es posible añadir aplicaciones."
                      : "Desde este visor no es posible añadir aplicaciones."}{" "}
                    Abrila en Safari siguiendo estos pasos:
                  </p>
                </div>
              </div>

              {/* Pasos visuales para iOS In-App */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-xs sm:text-sm text-slate-700 mb-2">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-campo-green/15 text-campo-green font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    1
                  </span>
                  <span className="flex-1 leading-relaxed">
                    Tocá el botón <strong>Compartir</strong> o los <strong>tres puntos</strong> (•••).
                  </span>
                  <MoreHorizontal className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                </div>

                <div className="border-t border-slate-200/70" />

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-campo-green/15 text-campo-green font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    2
                  </span>
                  <span className="flex-1 leading-relaxed">
                    Seleccioná <strong>“Abrir en el navegador”</strong> o <strong>“Abrir en Safari”</strong>.
                  </span>
                  <Compass className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                </div>

                <div className="border-t border-slate-200/70" />

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-campo-green/15 text-campo-green font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    3
                  </span>
                  <span className="flex-1 leading-relaxed">
                    En Safari podrás agregarlo a tu pantalla de inicio en un instante.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* CASO 6: IPHONE / IPAD EN SAFARI (GUÍA VISUAL PASO A PASO) */}
          {isMounted && !isStandalone && !installedSuccess && isIos && !isInAppBrowser && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 text-left animate-in fade-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white border border-slate-100 shadow-sm p-2 mb-4 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/icon-transparent-192x192.png?v=5"
                    alt="Ícono Campo Directo"
                    width={56}
                    height={56}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {isIpad ? "Instalá Campo Directo en tu iPad" : "Instalá Campo Directo en tu iPhone"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Seguí estos 3 sencillos pasos en Safari:
                </p>
              </div>

              {/* Guía Visual con íconos vectoriales del sistema */}
              <div className="space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/70 text-slate-800 text-xs sm:text-sm">
                {/* Paso 1: Compartir */}
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-campo-green text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">Tocá Compartir</p>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">
                      En la barra inferior de Safari, tocá el botón de compartir.
                    </p>
                  </div>
                  {/* Ícono vectorial de Compartir de iOS */}
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sky-600 shrink-0 shadow-2xs">
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  </div>
                </div>

                <div className="border-t border-slate-200" />

                {/* Paso 2: Añadir a pantalla de inicio */}
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-campo-green text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">Elegí “Añadir a pantalla de inicio”</p>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">
                      Deslizá hacia abajo en el menú de opciones y seleccionalo.
                    </p>
                  </div>
                  {/* Ícono vectorial de Añadir a pantalla de inicio */}
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 shrink-0 shadow-2xs">
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="4" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  </div>
                </div>

                <div className="border-t border-slate-200" />

                {/* Paso 3: Añadir */}
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-campo-green text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">Tocá “Añadir”</p>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">
                      Confirmá arriba a la derecha para guardarla.
                    </p>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-campo-green shrink-0 shadow-2xs">
                    Añadir
                  </div>
                </div>
              </div>

              {/* Mensaje de confirmación final */}
              <div className="mt-5 p-3.5 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-campo-green shrink-0" />
                <p className="text-xs sm:text-sm font-semibold text-emerald-950">
                  Listo. Campo Directo aparecerá junto a tus aplicaciones.
                </p>
              </div>
            </div>
          )}

          {/* CASO 7: ESCRITORIO (DESKTOP) */}
          {isMounted && !isStandalone && !installedSuccess && isDesktop && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 text-center animate-in fade-in">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-campo-green mb-5 shadow-xs">
                <Monitor className="w-8 h-8 text-campo-green" />
              </div>

              {/* Si el navegador de escritorio soporta prompt PWA */}
              {deferredPrompt ? (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                    Instalar Campo Directo en esta computadora
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed">
                    Instalalo como aplicación de escritorio para acceder más rápido y sin distracciones.
                  </p>
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full inline-flex items-center justify-center gap-3 py-3.5 px-6 text-sm sm:text-base font-bold text-white bg-campo-green hover:bg-campo-green-600 active:bg-campo-green-700 transition-all duration-200 rounded-2xl shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-campo-green/30"
                  >
                    <Download className="w-5 h-5" />
                    <span>Instalar en esta computadora</span>
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                    Acceder a Campo Directo
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed">
                    También podés utilizar Campo Directo directamente desde tu navegador.
                  </p>
                  <Link
                    href="/"
                    onClick={handleContinueWeb}
                    className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 text-sm sm:text-base font-bold text-white bg-campo-green hover:bg-campo-green-600 active:bg-campo-green-700 transition-all duration-200 rounded-2xl shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-campo-green/30"
                  >
                    <span>Ingresar a Campo Directo</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              )}

              {/* Sección de Código QR para el celular */}
              <div className="mt-8 pt-6 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setShowDesktopQr(!showDesktopQr)}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-campo-green transition-colors"
                >
                  <QrCode className="w-4 h-4 text-campo-green" />
                  <span>
                    {showDesktopQr ? "Ocultar código QR" : "¿Querés instalarlo en tu celular? Ver código QR"}
                  </span>
                </button>

                {showDesktopQr && (
                  <div className="mt-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/80 text-center animate-in fade-in">
                    <div className="flex justify-center mb-3">
                      <QrCodeSvg size={180} />
                    </div>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                      Apuntá la cámara de tu celular a este código para abrir la instalación directa en tu teléfono.
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">
                      campodirecto.ar/instalar
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CASO 8: FALLBACK NAVEGADORES NO COMPATIBLES O SIN DETERMINAR */}
          {isMounted && !isStandalone && !installedSuccess && !isAndroid && !isIos && !isDesktop && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 text-center animate-in fade-in">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Accedé a Campo Directo
              </h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Podés acceder a Campo Directo directamente desde tu navegador.
              </p>
              <Link
                href="/"
                onClick={handleContinueWeb}
                className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 text-sm sm:text-base font-bold text-white bg-campo-green hover:bg-campo-green-600 active:bg-campo-green-700 transition-all duration-200 rounded-2xl shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-campo-green/30"
              >
                <span>Ingresar a Campo Directo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* 3. BOTONES DE ACCIÓN SECUNDARIA PERMANENTES */}
          <div className="pt-2 space-y-3">
            {/* Botón universal: Continuar en la web */}
            <Link
              href="/"
              onClick={handleContinueWeb}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-white transition-all rounded-xl border border-slate-200/80"
            >
              <span>Continuar en la web</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            {/* Botón: Compartir Campo Directo */}
            <button
              type="button"
              onClick={handleShareClick}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold text-campo-green hover:text-campo-green-700 hover:bg-emerald-50/50 transition-all rounded-xl"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartir Campo Directo</span>
            </button>
          </div>
        </main>
      </div>

      {/* 4. PIE DE PÁGINA DISCRETO */}
      <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-200/60">
        <p className="font-medium">
          Campo Directo &middot; Soluciones Directas para el Agro
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          campodirecto.ar/instalar
        </p>
      </footer>
    </div>
  );
};
