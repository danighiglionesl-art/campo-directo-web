"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Navigation,
  ArrowRight,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
} from "lucide-react";
import { getWhatsAppLink } from "@/data/siteConfig";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

interface MapPoint {
  id: string;
  name: string;
  region: string;
  x: number; // Porcentaje x en el mapa satelital (0 a 100)
  y: number; // Porcentaje y en el mapa satelital (0 a 100)
  highlight?: boolean;
}

const MAP_POINTS: MapPoint[] = [
  // Región Centro / Córdoba
  { id: "rio-cuarto", name: "Río Cuarto", region: "Córdoba", x: 46, y: 39, highlight: true },
  { id: "cordoba-cap", name: "Córdoba Centro", region: "Córdoba", x: 47, y: 34 },
  { id: "marcos-juarez", name: "Marcos Juárez", region: "Córdoba", x: 53, y: 37 },
  { id: "san-francisco", name: "San Francisco", region: "Córdoba", x: 52, y: 33 },

  // Santa Fe
  { id: "rosario", name: "Rosario", region: "Santa Fe", x: 58, y: 38, highlight: true },
  { id: "venado-tuerto", name: "Venado Tuerto", region: "Santa Fe", x: 53, y: 40 },
  { id: "rafaela", name: "Rafaela", region: "Santa Fe", x: 54, y: 33 },

  // Buenos Aires
  { id: "caba", name: "Buenos Aires / Central", region: "Buenos Aires", x: 62.5, y: 41.5, highlight: true },
  { id: "pergamino", name: "Pergamino", region: "Buenos Aires", x: 57, y: 42, highlight: true },
  { id: "junin", name: "Junín", region: "Buenos Aires", x: 54, y: 44 },
  { id: "tandil", name: "Tandil", region: "Buenos Aires", x: 58, y: 49 },
  { id: "bahia-blanca", name: "Bahía Blanca", region: "Buenos Aires", x: 50, y: 54 },
  { id: "trenque-lauquen", name: "Trenque Lauquen", region: "Buenos Aires", x: 49, y: 46 },

  // Entre Ríos
  { id: "parana", name: "Paraná", region: "Entre Ríos", x: 59, y: 34 },
  { id: "gualeguaychu", name: "Gualeguaychú", region: "Entre Ríos", x: 62, y: 38 },

  // La Pampa
  { id: "gral-pico", name: "Gral. Pico", region: "La Pampa", x: 46, y: 46 },
  { id: "santa-rosa", name: "Santa Rosa", region: "La Pampa", x: 45, y: 50 },

  // NOA & NEA
  { id: "salta", name: "Las Lajitas / Salta", region: "Salta", x: 43, y: 17 },
  { id: "tucuman", name: "San Miguel", region: "Tucumán", x: 42, y: 22 },
  { id: "santiago", name: "Bandera / Quimilí", region: "Santiago del Estero", x: 49, y: 26 },
  { id: "chaco", name: "Charata / Resistencia", region: "Chaco", x: 55, y: 22 },
  { id: "corrientes", name: "Mercedes / Corrientes", region: "Corrientes", x: 63, y: 26 },

  // Cuyo & San Luis
  { id: "san-luis", name: "Villa Mercedes", region: "San Luis", x: 40, y: 40 },
  { id: "mendoza", name: "Valle de Uco", region: "Mendoza", x: 33, y: 41 },

  // Patagonia
  { id: "rio-negro", name: "Alto Valle", region: "Río Negro", x: 39, y: 61 },
  { id: "chubut", name: "Valle Inferior", region: "Chubut", x: 42, y: 71 },
];

export const CoverageSection: React.FC = () => {
  const [activePoint, setActivePoint] = useState<MapPoint | null>(null);
  const whatsappCoverageUrl = getWhatsAppLink("envíos y cobertura en mi zona");

  return (
    <section
      id="cobertura"
      className="py-16 sm:py-24 bg-slate-50 relative border-t border-slate-200/70 overflow-hidden"
    >
      {/* Marca de agua de sembrado de soja en el fondo inferior de la sección de cobertura */}
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-campo-green-100 text-campo-green-800 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
              <Navigation className="w-4 h-4 text-campo-green" />
              <span>Presencia Territorial</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Cobertura <span className="text-campo-green">Nacional</span> y Logística <span className="text-campo-green">Directa</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Coordinamos entregas, abastecimiento y asesoramiento comercial directo en los principales nodos productivos de la República Argentina.
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

        {/* Bloque de Representación Geográfica: Alturas equiparadas con items-stretch */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Panel Izquierdo: Información Operativa y Despacho (Equiparado al Mapa) */}
          <div className="lg:col-span-6 h-full flex flex-col">
            <div className="relative p-6 sm:p-8 md:p-9 rounded-3xl bg-white/95 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-campo-green/40 transition-all duration-300 flex flex-col justify-between h-full overflow-hidden backdrop-blur-xs group">
              {/* Marca de agua de sembrado de soja en el fondo del cuadro */}
              <div className="absolute -bottom-10 -right-10 w-72 h-72 opacity-10 pointer-events-none select-none">
                <Image
                  src="/images/sembrado-soja-watermark.jpg"
                  alt="Marca de agua campo"
                  fill
                  className="object-cover rounded-full filter blur-xs"
                />
              </div>

              {/* Contenido Superior */}
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-campo-green flex items-center justify-center shadow-xs shrink-0 group-hover:scale-110 group-hover:bg-campo-green group-hover:text-white transition-all duration-300">
                    <Truck className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-campo-green transition-colors">
                      Articulación y Envíos al Campo
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      Atención técnica y coordinación logística sin intermediarios
                    </p>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Nuestra red de comercialización y distribución está estructurada para llegar en tiempo y forma a cada establecimiento, cuidando los costos y los plazos de cada campaña agrícola o ganadera.
                </p>

                {/* Puntos destacados de servicio */}
                <div className="space-y-3.5 pt-2 border-t border-slate-100">
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-campo-green shrink-0 mt-0.5" />
                    <span><strong>Entrega en tranquera y acopio:</strong> Coordinación de fletes y logística directa al lote para insumos a granel y paletizados.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-campo-green shrink-0 mt-0.5" />
                    <span><strong>Presencia en cuencas productivas clave:</strong> Zona Núcleo, Litoral, Centro, NOA, NEA y Cuyo.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <Clock className="w-4 h-4 text-campo-green shrink-0 mt-0.5" />
                    <span><strong>Respuestas comerciales ágiles:</strong> Cotizaciones en el día y disponibilidad comercial inmediata.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-campo-green shrink-0 mt-0.5" />
                    <span><strong>Sin sobrecostos de intermediación:</strong> Despacho directo desde origen optimizando tiempos de campaña.</span>
                  </div>
                </div>

                {/* Recuadro de Garantía Operativa */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-campo-green shrink-0 animate-pulse" />
                  <p className="text-xs sm:text-sm text-slate-800 font-medium">
                    Operatividad coordinada para que tus insumos lleguen en la ventana agronómica exacta.
                  </p>
                </div>
              </div>

              {/* Botones de Consulta de Cobertura */}
              <div className="relative z-10 pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <a
                  href={whatsappCoverageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold text-slate-900 bg-white hover:bg-emerald-50 active:bg-emerald-100 transition-all shadow-xs border-2 border-[#25D366]"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  <span>Consultar envíos a mi zona</span>
                </a>

                <Link
                  href="#contacto"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  <span>Escribir por formulario</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Panel Derecho: Mapa de Argentina con Puntos de Maps interactivos (Equiparado) */}
          <div className="lg:col-span-6 h-full flex flex-col">
            <div className="relative rounded-3xl bg-white/95 border border-slate-200/80 p-6 sm:p-8 shadow-card flex flex-col items-center justify-between h-full overflow-hidden backdrop-blur-xs">
              {/* Fondo sutil */}
              <div className="absolute inset-0 bg-gradient-to-b from-campo-green-50/20 via-white to-slate-50 pointer-events-none" />

              {/* Cabecera del Mapa */}
              <div className="relative z-10 w-full flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335] animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Puntos de Cobertura Activa
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {MAP_POINTS.length} zonas en red
                </span>
              </div>

              {/* Contenedor del Mapa Satelital con Pines de Google Maps */}
              <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[896/1200] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-200/90 bg-slate-950">
                {/* Imagen Satelital Topográfica de Alta Resolución de la República Argentina */}
                <Image
                  src="/images/mapa-argentina-satelital.jpg"
                  alt="Mapa Satelital de Cobertura República Argentina - Campo Directo"
                  fill
                  priority
                  sizes="(max-width: 640px) 340px, 380px"
                  className="object-cover object-center select-none pointer-events-none"
                />

                {/* Badge Sutil de Vista Satelital */}
                <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white tracking-wide border border-white/20 select-none">
                  VISTA SATELITAL
                </div>

                {/* Puntos de Google Maps Distribuidos sobre la Geografía Satelital */}
                {MAP_POINTS.map((pt) => {
                  const isHovered = activePoint?.id === pt.id;

                  return (
                    <div
                      key={pt.id}
                      style={{
                        left: `${pt.x}%`,
                        top: `${pt.y}%`,
                        transform: "translate(-50%, -100%)",
                      }}
                      className="absolute z-20 cursor-pointer group/pin"
                      onMouseEnter={() => setActivePoint(pt)}
                      onMouseLeave={() => setActivePoint(null)}
                      onClick={() => setActivePoint(isHovered ? null : pt)}
                    >
                      {/* Onda de pulso para puntos neurálgicos */}
                      {pt.highlight && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#EA4335] animate-ping opacity-80 pointer-events-none" />
                      )}

                      {/* Icono de Pin estilo Google Maps */}
                      <svg
                        viewBox="0 0 24 32"
                        className={`transition-all duration-200 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
                          pt.highlight
                            ? "w-6 h-8 text-[#EA4335] group-hover/pin:scale-130"
                            : "w-5 h-7 text-[#25D366] group-hover/pin:scale-125 group-hover/pin:text-[#EA4335]"
                        }`}
                        fill="currentColor"
                      >
                        {/* Forma de gota/marcador de Maps */}
                        <path d="M12 0C5.373 0 0 5.373 0 12C0 19.5 10.5 30.75 11.25 31.5C11.625 31.875 12.375 31.875 12.75 31.5C13.5 30.75 24 19.5 24 12C24 5.373 18.627 0 12 0ZM12 16.5C9.515 16.5 7.5 14.485 7.5 12C7.5 9.515 9.515 7.5 12 7.5C14.485 7.5 16.5 9.515 16.5 12C16.5 14.485 14.485 16.5 12 16.5Z" />
                        {/* Punto blanco central */}
                        <circle cx="12" cy="12" r="3.5" fill="white" />
                      </svg>

                      {/* Tooltip emergente con nombre, provincia y puntero */}
                      <div
                        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 rounded-lg bg-slate-950/95 text-white text-[11px] font-semibold whitespace-nowrap pointer-events-none shadow-2xl border border-white/20 transition-all duration-150 z-30 ${
                          isHovered
                            ? "opacity-100 scale-100 translate-y-0"
                            : "opacity-0 scale-95 translate-y-1"
                        }`}
                      >
                        <span>{pt.name}</span>
                        <span className="text-campo-yellow ml-1 font-normal">({pt.region})</span>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-4 border-transparent border-t-slate-950/95" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pie explicativo del mapa */}
              <div className="relative z-10 text-center mt-3">
                <p className="text-xs text-slate-500 font-medium">
                  Hacé hover sobre los pines para ver las localidades y nodos de distribución.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
