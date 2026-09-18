"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { siteConfig, getWhatsAppLink } from "@/data/siteConfig";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { BrandsCarouselSection } from "./BrandsCarouselSection";

const BANNER_SLIDES = [
  {
    id: 1,
    src: "/images/banners/banner-1.png?v=3",
    alt: "Campo Directo - Sin duplicidad de impuestos",
    title: "Sin duplicidad de impuestos",
  },
  {
    id: 2,
    src: "/images/banners/banner-2.jpg?v=3",
    alt: "Campo Directo - Sin efecto cascada de tasas",
    title: "Sin efecto cascada de tasas",
  },
  {
    id: 3,
    src: "/images/banners/banner-3.png?v=3",
    alt: "Campo Directo - Del laboratorio a tu campo",
    title: "Del laboratorio a tu campo",
  },
  {
    id: 4,
    src: "/images/banners/banner-4.png?v=3",
    alt: "Campo Directo - Más directo, más rentable",
    title: "Más directo, más rentable",
  },
  {
    id: 5,
    src: "/images/banners/banner-5.png?v=3",
    alt: "Campo Directo - Facturación directa",
    title: "Facturación directa",
  },
];

export const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const whatsappUrl = getWhatsAppLink();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);
  }, []);

  // Autoplay continuo cada 5 segundos que se reinicia al interactuar
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, currentSlide]);

  // Soporte táctil swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
  };

  return (
    <section id="inicio" className="relative w-full bg-slate-50 pb-10 sm:pb-14 border-b border-slate-200/70">
      {/* Carrusel de Banners Panorámico Deslizante */}
      <div
        className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full aspect-[1024/426] min-h-[220px] sm:min-h-[320px] md:min-h-[400px] lg:min-h-[460px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-900 group">
          {/* Pista Deslizante Horizontal (Slider Track) */}
          <div
            className="flex w-full h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {BANNER_SLIDES.map((slide, index) => (
              <div
                key={slide.id}
                className="w-full h-full shrink-0 relative select-none"
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="object-cover object-center select-none pointer-events-none"
                />
              </div>
            ))}
          </div>

          {/* Flecha Izquierda - Siempre visible y de alto contraste */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Banner anterior"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-campo-green-700 shadow-xl flex items-center justify-center transition-all duration-200 border border-slate-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-campo-green"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Flecha Derecha - Siempre visible y de alto contraste */}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Siguiente banner"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-campo-green-700 shadow-xl flex items-center justify-center transition-all duration-200 border border-slate-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-campo-green"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Badge Indicador de Diapositiva Superior */}
          <div className="absolute top-3 sm:top-5 right-3 sm:right-5 z-20 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-semibold tracking-wide border border-white/10 select-none">
            {currentSlide + 1} / {BANNER_SLIDES.length}
          </div>

          {/* Indicadores de Diapositiva (Dots) */}
          <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/45 backdrop-blur-sm border border-white/10">
            {BANNER_SLIDES.map((slide, index) => {
              const isActive = index === currentSlide;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Ir al banner ${index + 1}: ${slide.title}`}
                  className={`transition-all duration-300 rounded-full ${
                    isActive
                      ? "w-8 h-2.5 bg-campo-yellow shadow-xs"
                      : "w-2.5 h-2.5 bg-white/60 hover:bg-white"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Botones de Acceso Rápido por Título de Banner */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
          {BANNER_SLIDES.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 border ${
                  isActive
                    ? "bg-campo-green text-white border-campo-green shadow-md scale-102"
                    : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-200/90 shadow-xs"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isActive ? "bg-campo-yellow animate-pulse" : "bg-slate-300"
                  }`}
                />
                <span>{slide.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Carrusel de Principales Marcas (Ancho del banner principal y desplazamiento indeterminado) */}
      <BrandsCarouselSection />

      {/* Barra de Conversión Comercial y Confianza */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6">
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Texto y Propuesta */}
          <div className="text-center lg:text-left space-y-1.5 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-campo-green">
              Soluciones Comerciales para el Agro Argentino
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
              Conectamos el campo con soluciones directas y eficientes
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Comercialización directa, asesoramiento oportuno y condiciones pensadas para maximizar la rentabilidad del productor.
            </p>
          </div>

          {/* Botones de Conversión */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
            <Link
              href="#contacto"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-sm sm:text-base font-bold text-white bg-campo-green hover:bg-campo-green-600 active:bg-campo-green-700 rounded-xl shadow-md hover:shadow-lg transition-all group"
            >
              <span>Contactar al equipo</span>
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-bold text-slate-900 bg-white hover:bg-emerald-50 active:bg-emerald-100 rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-[#25D366]"
            >
              <WhatsAppIcon className="w-5 h-5" />
              <span>Consultar por WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Micro-indicadores de valor */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-slate-700">
          <div className="group flex items-center justify-center sm:justify-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-100/70 hover:bg-white border border-slate-200/60 hover:border-campo-green/50 hover:shadow-xs transition-all duration-300 cursor-default">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-campo-green group-hover:bg-campo-green group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-300 shadow-2xs group-hover:scale-110">
              <CheckCircle2 className="w-4 h-4 stroke-[2.2] transition-colors" />
            </div>
            <span className="font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
              Atención directa sin intermediación
            </span>
          </div>

          <div className="group flex items-center justify-center sm:justify-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-100/70 hover:bg-white border border-slate-200/60 hover:border-campo-green/50 hover:shadow-xs transition-all duration-300 cursor-default">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-campo-green group-hover:bg-campo-green group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-300 shadow-2xs group-hover:scale-110">
              <ShieldCheck className="w-4 h-4 stroke-[2.2] transition-colors" />
            </div>
            <span className="font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
              Cobertura y presencia en el territorio
            </span>
          </div>

          <div className="group flex items-center justify-center sm:justify-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-100/70 hover:bg-white border border-slate-200/60 hover:border-campo-green/50 hover:shadow-xs transition-all duration-300 cursor-default">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-campo-green group-hover:bg-campo-green group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-300 shadow-2xs group-hover:scale-110">
              <Zap className="w-4 h-4 stroke-[2.2] transition-colors" />
            </div>
            <span className="font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
              Agilidad y respuestas comerciales rápidas
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
