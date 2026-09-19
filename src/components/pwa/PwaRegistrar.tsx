"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";

export const PwaRegistrar: React.FC = () => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Verificar si ya hay un worker esperando activación
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowUpdateNotification(true);
        }

        // Escuchar cuando se descubre una nueva versión
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                setWaitingWorker(newWorker);
                setShowUpdateNotification(true);
              }
            });
          }
        });

        // Recargar automáticamente cuando el nuevo Service Worker toma el control
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });
      } catch (error) {
        console.error("Error al registrar Service Worker PWA:", error);
      }
    };

    window.addEventListener("load", registerSW);
    return () => window.removeEventListener("load", registerSW);
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ action: "skipWaiting" });
      setShowUpdateNotification(false);
    }
  };

  if (!showUpdateNotification) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-sm w-full bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-700/60 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-campo-green/20 text-campo-green flex items-center justify-center shrink-0">
          <RefreshCw className="w-4 h-4 animate-spin" />
        </div>
        <div className="text-xs sm:text-sm">
          <p className="font-semibold text-slate-100 leading-snug">
            Hay una nueva versión de Campo Directo disponible.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleUpdate}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-campo-green hover:bg-campo-green-600 active:bg-campo-green-700 transition-colors rounded-lg shadow-sm"
        >
          Actualizar
        </button>
        <button
          type="button"
          onClick={() => setShowUpdateNotification(false)}
          aria-label="Cerrar aviso de actualización"
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
