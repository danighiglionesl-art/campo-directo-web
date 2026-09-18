"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sprout,
  UserCheck,
  ShieldCheck,
  Truck,
  BarChart3,
  Link2,
  ArrowRight,
  Leaf,
  Coins,
  Users,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

interface WhatWeDoItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  actionText: string;
  actionHref: string;
  icon: React.ElementType;
  image: string;
}

const WHAT_WE_DO_ITEMS: WhatWeDoItem[] = [
  {
    id: "comercializacion-insumos",
    badge: "DIRECTO",
    title: "Comercialización Directa de Insumos",
    description:
      "Acceso a insumos agropecuarios con vinculación directa entre industria y productor, reduciendo intermediaciones y costos innecesarios.",
    actionText: "Consultar",
    actionHref: "#contacto",
    icon: Sprout,
    image: "/images/que-hacemos/comercializacion-insumos.jpg",
  },
  {
    id: "asesoramiento-tecnico",
    badge: "ASESORAMIENTO",
    title: "Asesoramiento Técnico y Comercial",
    description:
      "Acompañamiento profesional para encontrar la solución más adecuada para cada necesidad productiva y comercial.",
    actionText: "Conocer más",
    actionHref: "#contacto",
    icon: UserCheck,
    image: "/images/que-hacemos/asesoramiento-tecnico.jpg",
  },
  {
    id: "proteccion-cultivos",
    badge: "SOLUCIONES",
    title: "Protección y Nutrición de Cultivos",
    description:
      "Soluciones para protección, nutrición y bioestimulación, provenientes de fabricantes y laboratorios especializados.",
    actionText: "Conocer más",
    actionHref: "#contacto",
    icon: ShieldCheck,
    image: "/images/que-hacemos/proteccion-cultivos.jpg",
  },
  {
    id: "logistica-directa",
    badge: "LOGÍSTICA",
    title: "Logística Directa a Campo",
    description:
      "Coordinamos entregas eficientes desde origen, reduciendo movimientos, almacenamiento y costos logísticos innecesarios.",
    actionText: "Consultar",
    actionHref: "#contacto",
    icon: Truck,
    image: "/images/que-hacemos/logistica-directa.jpg",
  },
  {
    id: "condiciones-comerciales",
    badge: "EFICIENCIA",
    title: "Condiciones Comerciales Eficientes",
    description:
      "Una cadena más corta permite reducir recargos y costos acumulativos, generando mejores condiciones para cada operación.",
    actionText: "Conocer más",
    actionHref: "#contacto",
    icon: BarChart3,
    image: "/images/que-hacemos/condiciones-comerciales.jpg",
  },
  {
    id: "conexion-industria",
    badge: "CONEXIÓN",
    title: "Conexión Industria – Productor",
    description:
      "Creamos un vínculo más directo entre quienes desarrollan soluciones para el agro y quienes las utilizan en el campo.",
    actionText: "Conocer más",
    actionHref: "#contacto",
    icon: Link2,
    image: "/images/que-hacemos/conexion-industria.jpg",
  },
];

export const WhatWeDoSection: React.FC = () => {
  return (
    <section
      id="que-hacemos"
      className="py-16 sm:py-24 bg-slate-50 relative border-t border-slate-200/70 overflow-hidden"
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
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-slate-50/70 to-slate-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Encabezado Principal con Logo Destacado y Eslogan Oficial */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12 sm:mb-16 pb-8 border-b border-slate-200/80">
          {/* Lado Izquierdo: Badge, Título y Descripción */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-campo-green-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Leaf className="w-3.5 h-3.5 text-campo-green" />
              <span>QUÉ HACEMOS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Soluciones que conectan <br className="hidden sm:inline" />
              <span className="text-campo-green">la industria con el campo</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Acercamos productos, tecnología y conocimiento directamente al productor, simplificando la cadena comercial y generando mayor eficiencia en cada operación.
            </p>
          </div>

          {/* Lado Derecho: Logo Campo Directo con Gran Presencia Visual + Eslogan */}
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

        {/* Grilla de las 6 Tarjetas Compuestas (2 filas de 3 columnas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHAT_WE_DO_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-card hover:shadow-card-hover border border-slate-100 hover:border-campo-green/40 transition-all duration-300 flex flex-row items-stretch justify-between gap-4 sm:gap-5 group hover:-translate-y-1 overflow-hidden"
              >
                {/* Lado Izquierdo: Contenido Textual y Acción */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    {/* Fila Superior: Icono + Pastilla Badge */}
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-campo-green flex items-center justify-center group-hover:scale-105 group-hover:bg-campo-green group-hover:text-white transition-all duration-300 shadow-xs shrink-0">
                        <Icon className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-emerald-100/70 text-campo-green-800">
                        {item.badge}
                      </span>
                    </div>

                    {/* Título de la Solución */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-campo-green transition-colors mb-2">
                      {item.title}
                    </h3>

                    {/* Descripción */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Enlace de Acción */}
                  <div className="pt-4 mt-3">
                    <Link
                      href={item.actionHref}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-campo-green hover:text-campo-green-700 transition-colors group/btn"
                    >
                      <span>{item.actionText}</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Lado Derecho: Fotografía Real del Servicio */}
                <div className="w-24 sm:w-28 md:w-32 shrink-0 relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xs border border-slate-100/80 bg-slate-100">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 select-none pointer-events-none"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pie de Sección Oficial: Cierre Institucional y 3 Pilares Resumen */}
        <div className="mt-12 pt-6 border-t border-slate-300/80 flex flex-col lg:flex-row items-center justify-between gap-6 text-xs font-bold text-slate-700 relative z-10">
          {/* Lema Central */}
          <div className="flex items-center gap-3">
            <Leaf className="w-4 h-4 text-campo-green shrink-0" />
            <div className="w-8 h-px bg-slate-300 hidden sm:block" />
            <span className="text-sm sm:text-base font-extrabold text-slate-800">
              Menos intermediación. Más eficiencia. Más valor para el campo.
            </span>
          </div>

          {/* 3 Micro-Insignias */}
          <div className="flex items-center gap-3 sm:gap-6 divide-x divide-slate-300 text-center">
            <div className="flex items-center gap-1.5 pl-3 sm:pl-6 first:pl-0">
              <Leaf className="w-4 h-4 text-campo-green" />
              <span className="uppercase text-[11px] font-black tracking-wider text-slate-800">
                MÁS DIRECTO
              </span>
            </div>
            <div className="flex items-center gap-1.5 pl-3 sm:pl-6">
              <Coins className="w-4 h-4 text-campo-green" />
              <span className="uppercase text-[11px] font-black tracking-wider text-slate-800">
                MÁS RENTABLE
              </span>
            </div>
            <div className="flex items-center gap-1.5 pl-3 sm:pl-6">
              <Users className="w-4 h-4 text-campo-green" />
              <span className="uppercase text-[11px] font-black tracking-wider text-slate-800">
                UN CAMPO MÁS FUERTE
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
