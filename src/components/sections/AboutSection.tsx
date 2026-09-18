"use client";

import React from "react";
import Image from "next/image";
import {
  Compass,
  Target,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Leaf,
  ArrowRight,
  Zap,
  Eye,
  HeartHandshake,
  Lightbulb,
  Layers,
  Trophy,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

interface ValueItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const VALUES_DATA: ValueItem[] = [
  { name: "Eficiencia", icon: Zap },
  { name: "Transparencia", icon: Eye },
  { name: "Cercanía", icon: HeartHandshake },
  { name: "Innovación", icon: Lightbulb },
  { name: "Simplicidad", icon: Layers },
  { name: "Competitividad", icon: Trophy },
  { name: "Confianza", icon: ShieldCheck },
  { name: "Oportunidad", icon: Compass },
];

export const AboutSection: React.FC = () => {
  return (
    <section
      id="nosotros"
      className="pt-16 sm:pt-24 pb-20 sm:pb-28 bg-slate-50 relative border-b border-slate-200/70 overflow-hidden"
    >
      {/* Marca de agua de sembrado de soja en el fondo inferior de la sección */}
      <div className="absolute bottom-0 left-0 right-0 h-72 sm:h-96 pointer-events-none overflow-hidden z-0 select-none">
        <Image
          src="/images/sembrado-soja-watermark.jpg"
          alt="Sembrado de soja Campo Directo"
          fill
          sizes="100vw"
          className="object-cover object-bottom opacity-25"
        />
        {/* Degradado suave para fundir la imagen con el fondo de la sección */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-slate-50/70 to-slate-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Encabezado Principal con Logo Destacado y Eslogan Oficial */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12 sm:mb-16 pb-8 border-b border-slate-200/80">
          {/* Lado Izquierdo: Badge, Título y Descripción */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-campo-green-800 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
              <Leaf className="w-3.5 h-3.5 text-campo-green" />
              <span>QUIÉNES SOMOS</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Sobre <span className="text-campo-green">Nosotros</span>
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
              Conectamos de forma directa la industria con el productor, haciendo más transparente y eficiente la cadena comercial del agro argentino.
            </p>
          </div>

          {/* Lado Derecho: Logo Campo Directo + Eslogan Unificado en Verde sin punto */}
          <div className="flex items-center gap-5 sm:gap-7 shrink-0 self-start lg:self-center py-2">
            <div className="relative flex items-center justify-center">
              <Logo
                className="h-20 sm:h-24 lg:h-28 w-auto filter drop-shadow-md hover:scale-105 transition-transform"
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

        {/* Bloque 1: Narrativa Institucional Sobre Nosotros */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          <div className="lg:col-span-8 space-y-5 bg-white p-7 sm:p-10 rounded-3xl border border-slate-100 shadow-card">
            <p className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
              Campo Directo nace de una idea simple:{" "}
              <span className="text-campo-green">
                cuanto más directa es la relación entre la industria y el productor, más eficiente es toda la cadena.
              </span>
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Creamos un modelo que conecta a fabricantes y laboratorios directamente con el campo, reduciendo intermediaciones, costos logísticos, almacenamiento y recargos comerciales.
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              La clave está en la <strong>facturación directa entre las partes</strong>, evitando la duplicidad de impuestos y el efecto cascada de tasas y costos que se generan cuando un producto atraviesa sucesivos eslabones antes de llegar al productor.
            </p>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 text-slate-800 text-sm sm:text-base font-semibold flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-campo-green shrink-0" />
              <span>
                No buscamos cambiar quién produce ni quién fabrica. Buscamos hacer más corto, transparente y eficiente el camino que los conecta.
              </span>
            </div>
          </div>

          {/* Tarjeta Visual Destacada con Lema Oficial */}
          <div className="lg:col-span-4 h-full">
            <div className="h-full rounded-3xl bg-gradient-to-br from-campo-green-900 via-slate-900 to-slate-950 text-white p-8 sm:p-10 shadow-card flex flex-col justify-between relative overflow-hidden border border-campo-green/30">
              {/* Marca de agua de fondo */}
              <div className="absolute inset-0 opacity-15">
                <Image
                  src="/images/sembrado-soja-watermark.jpg"
                  alt="Campo Argentino"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="relative z-10 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-campo-yellow">
                  Propósito Central
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-campo-green leading-tight">
                  Del Laboratorio a tu campo
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Generamos un vínculo directo y profesional para que los recursos queden donde deben estar: en la producción agropecuaria argentina.
                </p>
              </div>

              <div className="relative z-10 pt-8 mt-6 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Modelo Directo</p>
                  <p className="text-sm font-bold text-white">Transparencia Total</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-campo-yellow animate-ping" />
              </div>
            </div>
          </div>
        </div>

        {/* Bloque 2: Misión y Visión (2 Tarjetas Comparativas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16">
          {/* Misión */}
          <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
            <div>
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-campo-green flex items-center justify-center group-hover:scale-110 group-hover:bg-campo-green group-hover:text-white transition-all duration-300 shadow-xs">
                  <Target className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-campo-green">
                    Nuestro Enfoque
                  </span>
                  <h3 className="text-2xl font-black text-slate-900">MISIÓN</h3>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-6 font-medium">
                Conectar de manera directa a la industria con el productor agropecuario, simplificando la cadena comercial y reduciendo intermediaciones, costos logísticos, financieros, impositivos y operativos.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong className="text-slate-900 block mb-1">Nuestro propósito:</strong>
              Que cada peso que pueda dejar de perderse en la cadena se transforme en mayor competitividad para quienes producen y para quienes fabrican.
            </div>
          </div>

          {/* Visión */}
          <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
            <div>
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-campo-green flex items-center justify-center group-hover:scale-110 group-hover:bg-campo-green group-hover:text-white transition-all duration-300 shadow-xs">
                  <Sparkles className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-campo-green">
                    HACIA DÓNDE VAMOS
                  </span>
                  <h3 className="text-2xl font-black text-slate-900">VISIÓN</h3>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-6 font-medium">
                Construir una nueva forma de comercialización agroindustrial, más directa, eficiente y transparente, donde la tecnología permita acercar los extremos de la cadena y generar mejores oportunidades para ambas partes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong className="text-slate-900 block mb-1">Nuestra aspiración:</strong>
              Que Campo Directo se convierta en un canal de referencia entre la industria y el campo, demostrando que una cadena más corta puede ser también una cadena más competitiva.
            </div>
          </div>
        </div>

        {/* Bloque 3: Valores Institucionales */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-card relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
            {/* Columna de Contenido: Valores con Iconos y Efectos Hover (8 columnas) */}
            <div className="lg:col-span-8 space-y-6 flex flex-col justify-between">
              <div>
                {/* Encabezado con la misma imagen y estructura que Misión y Visión */}
                <div className="flex items-center gap-3.5 mb-5 group/valheader cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-campo-green flex items-center justify-center shadow-xs shrink-0 transition-all duration-300 hover:scale-110 hover:bg-campo-green hover:text-white group-hover/valheader:bg-campo-green group-hover/valheader:text-white group-hover/valheader:scale-110">
                    <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-campo-green">
                      PRINCIPIOS FUNDAMENTALES
                    </span>
                    <h3 className="text-2xl font-black text-slate-900">
                      NUESTROS VALORES
                    </h3>
                  </div>
                </div>

                {/* Pastillas de los 8 Valores organizadas en 4 arriba y 4 abajo, con icono y cambio de color al pararse sobre ellos */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  {VALUES_DATA.map((item, idx) => {
                    const IconComp = item.icon;
                    return (
                      <div
                        key={idx}
                        className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-campo-green text-slate-800 hover:text-white border border-slate-200/80 hover:border-campo-green transition-all duration-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 cursor-default select-none"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-100/90 text-campo-green group-hover:bg-white/20 group-hover:text-white flex items-center justify-center shrink-0 transition-colors duration-300">
                          <IconComp className="w-4 h-4 stroke-[2.2] group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold tracking-tight truncate group-hover:text-white transition-colors duration-300">
                          {item.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Manifiesto oficial actualizado */}
              <div className="pt-4 border-t border-slate-100 mt-4">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl font-medium">
                  Creemos en hacer más eficientes los procesos, acercar a quienes producen con quienes desarrollan las soluciones que necesitan y utilizar la tecnología para construir relaciones comerciales más directas, ágiles y rentables.
                </p>
              </div>
            </div>

            {/* Columna en el Espacio Libre: Logotipo Oficial Campo Directo con Mayor Presencia (4 columnas, sin eslogan y el doble de tamaño) */}
            <div className="lg:col-span-4 flex items-center justify-center p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-50 via-emerald-50/20 to-emerald-50/50 border border-slate-200/80 shadow-xs h-full min-h-[260px]">
              <div className="relative w-full h-48 sm:h-56 lg:h-64 flex items-center justify-center p-2">
                <Image
                  src="/images/logo-transparent.png"
                  alt="Campo Directo"
                  width={480}
                  height={260}
                  className="max-h-full max-w-full w-auto h-auto object-contain filter drop-shadow-md hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
