"use client";

import React from "react";
import Image from "next/image";

const TOTAL_LOGOS = 45;
const BRAND_LOGOS = Array.from({ length: TOTAL_LOGOS }, (_, i) => ({
  id: i + 1,
  src: `/images/banners-marcas/${i + 1}.png`,
}));

export const BrandsCarouselSection: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6">
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm overflow-hidden">
        {/* Título: Principales marcas con letra blanca y recuadro verde */}
        <div className="text-center mb-4 sm:mb-5">
          <span className="inline-flex items-center justify-center px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl bg-campo-green text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-xs">
            Principales marcas
          </span>
        </div>

        {/* Riel del Carrusel Infinito con Máscaras de Gradiente */}
        <div className="relative w-full overflow-hidden">
          {/* Degradado lateral izquierdo para entrada suave */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-14 sm:w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />

          {/* Degradado lateral derecho para salida suave */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-14 sm:w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

          {/* Pista continua animada (CSS Marquee infinito que se pausa al pasar el mouse) */}
          <div className="animate-marquee flex items-center gap-4 sm:gap-6 py-2">
            {/* Tanda 1 (44 marcas) */}
            {BRAND_LOGOS.map((brand) => (
              <div
                key={`brand-track1-${brand.id}`}
                className="w-56 sm:w-72 h-24 sm:h-32 px-5 sm:px-6 py-3 sm:py-4 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/70 hover:border-campo-green/50 shadow-2xs hover:shadow-lg flex items-center justify-center shrink-0 transition-all duration-300 group cursor-default select-none"
                title={`Marca aliada #${brand.id}`}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={brand.src}
                    alt={`Marca ${brand.id}`}
                    width={280}
                    height={100}
                    className="max-h-16 sm:max-h-20 w-auto max-w-full object-contain filter contrast-105 opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                  />
                </div>
              </div>
            ))}

            {/* Tanda 2 duplicada para ciclo infinito perfecto */}
            {BRAND_LOGOS.map((brand) => (
              <div
                key={`brand-track2-${brand.id}`}
                className="w-56 sm:w-72 h-24 sm:h-32 px-5 sm:px-6 py-3 sm:py-4 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/70 hover:border-campo-green/50 shadow-2xs hover:shadow-lg flex items-center justify-center shrink-0 transition-all duration-300 group cursor-default select-none"
                title={`Marca aliada #${brand.id}`}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={brand.src}
                    alt={`Marca ${brand.id}`}
                    width={280}
                    height={100}
                    className="max-h-16 sm:max-h-20 w-auto max-w-full object-contain filter contrast-105 opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
