"use client";

import React from "react";
import Image from "next/image";
import {
  Users,
  TrendingUp,
  Coins,
  Handshake,
  Sprout,
  MapPin,
  Cog,
  Lightbulb,
  Leaf,
  LucideIcon,
} from "lucide-react";
import { differentialsData } from "@/data/differentials";
import { Logo } from "@/components/ui/Logo";

const iconMap: Record<string, LucideIcon> = {
  Users,
  TrendingUp,
  Coins,
  Handshake,
  Sprout,
  MapPin,
  Cog,
  Lightbulb,
};

export const WhyUsSection: React.FC = () => {
  return (
    <section
      id="por-que-campo-directo"
      className="py-16 sm:py-24 bg-white relative border-t border-slate-200/70 overflow-hidden"
    >
      {/* Marca de agua de sembrado de soja en el fondo inferior de la sección */}
      <div className="absolute bottom-0 left-0 right-0 h-72 sm:h-96 pointer-events-none overflow-hidden z-0 select-none">
        <Image
          src="/images/sembrado-soja-watermark.jpg"
          alt="Sembrado de soja Campo Directo"
          fill
          sizes="100vw"
          className="object-cover object-bottom opacity-20"
        />
        {/* Degradado suave para fundir la imagen con el blanco del fondo */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/70 to-white" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Encabezado Principal con Bloque de Marca y Eslogan */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12 sm:mb-16 pb-8 border-b border-slate-100">
          {/* Lado Izquierdo: Badge, Título y Descripción */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-campo-green-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Leaf className="w-3.5 h-3.5 text-campo-green" />
              <span>NUESTROS DIFERENCIALES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Por qué elegir <span className="text-campo-green">Campo Directo</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Nuestra propuesta de valor se apoya en 8 pilares que responden a las verdaderas necesidades del campo, generando una cadena más simple, eficiente y rentable.
            </p>
          </div>

          {/* Lado Derecho: Logo Campo Directo con Mayor Relevancia Visual + Eslogan Oficial */}
          <div className="flex items-center gap-5 sm:gap-7 shrink-0 self-start lg:self-center py-2">
            <div className="relative flex items-center justify-center">
              <Logo
                className="h-20 sm:h-24 lg:h-28 w-auto filter drop-shadow-md"
                variant="standard"
              />
            </div>
            <div className="h-16 sm:h-20 w-[2px] bg-campo-green/80" />
            <div>
              <span className="text-xl sm:text-2xl lg:text-3xl font-black text-campo-green tracking-tight leading-tight block">
                Del Laboratorio<br />a tu campo
              </span>
              <div className="w-14 sm:w-16 h-1.5 bg-campo-green rounded-full mt-2" />
            </div>
          </div>
        </div>

        {/* Grilla de los 8 Pilares (4 columnas en desktop, 2 en tablet, 1 en mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {differentialsData.map((item) => {
            const IconComponent = iconMap[item.iconName] || Sprout;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-card hover:shadow-card-hover border border-slate-100 hover:border-campo-green/40 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  {/* Icono con contenedor suave */}
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-campo-green flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-campo-green group-hover:text-white transition-all duration-300 shadow-xs">
                    <IconComponent className="w-6 h-6 stroke-[2.2]" />
                  </div>

                  {/* Título del Pilar */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2.5 group-hover:text-campo-green transition-colors">
                    {item.title}
                  </h3>

                  {/* Descripción clara y concisa */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Tag inferior del Pilar */}
                <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-campo-green">
                    {item.pilarNumber}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-campo-green/40 group-hover:bg-campo-green transition-colors" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pie de Sección Oficial: Eslogan y Cierre Institucional */}
        <div className="mt-12 pt-6 border-t border-slate-300/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-600 relative z-10">
          <div className="flex items-center gap-2.5">
            <Leaf className="w-4 h-4 text-campo-green shrink-0" />
            <span className="tracking-wider uppercase text-slate-700">
              UNA CADENA MÁS CORTA, UN CAMPO MÁS FUERTE
            </span>
          </div>
          <div>
            <span>
              <strong className="text-campo-green font-extrabold">Campo Directo</strong>{" "}
              | Más Directo, más rentable
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
