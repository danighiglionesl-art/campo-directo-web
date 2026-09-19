"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  MapPin,
  ShieldAlert,
  X,
  ArrowUp,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { siteConfig, getWhatsAppLink } from "@/data/siteConfig";

export const Footer: React.FC = () => {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const whatsappUrl = getWhatsAppLink();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-100 text-slate-800 relative border-t border-slate-200 overflow-hidden">
      {/* Marca de agua de sembrado de soja en el pie de página */}
      <div className="absolute inset-0 pointer-events-none opacity-10 select-none overflow-hidden">
        <Image
          src="/images/sembrado-soja-watermark.jpg"
          alt="Marca de agua campo"
          fill
          className="object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-100/95 via-slate-100/80 to-slate-100" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-slate-200">
          {/* 1. Columna Institucional & Logo Destacado (5 columnas) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Logo de Campo Directo más destacado */}
            <div className="flex items-center">
              <Logo className="h-28 sm:h-32 lg:h-36 w-auto filter drop-shadow-md" variant="standard" priority />
            </div>

            {/* Texto descriptivo reducido */}
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Soluciones agropecuarias, comercialización y asesoramiento directo para el productor en Argentina. Cercanía, confianza y eficiencia comercial.
            </p>
          </div>

          {/* 2. Navegación Rápida (3 columnas) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-campo-green">
              Navegación
            </h4>
            <ul className="space-y-2.5">
              {siteConfig.navigation.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-slate-600 hover:text-campo-green transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/panel"
                  className="text-sm font-medium text-emerald-700 hover:text-campo-green transition-colors flex items-center gap-1.5"
                >
                  <span>Acceso a Fábrica</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Canales de Contacto (4 columnas) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-campo-green">
              Canales de Contacto
            </h4>
            <ul className="space-y-3 text-sm text-slate-700">
              {/* WhatsApp */}
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 font-bold text-slate-900 hover:text-emerald-700 transition-colors group"
                >
                  <div className="relative w-6 h-6 shrink-0 flex items-center justify-center">
                    <Image
                      src="/images/icons/icon-whatsapp.png"
                      alt="WhatsApp"
                      width={24}
                      height={24}
                      className="w-full h-full object-contain filter drop-shadow-xs group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <span className="group-hover:underline">WhatsApp Comercial</span>
                </a>
              </li>

              {/* Facebook */}
              <li>
                <a
                  href={siteConfig.contact.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 font-bold text-slate-900 hover:text-[#1877F2] transition-colors group"
                >
                  <div className="relative w-6 h-6 shrink-0 flex items-center justify-center">
                    <Image
                      src="/images/icons/icon-facebook.png"
                      alt="Facebook"
                      width={24}
                      height={24}
                      className="w-full h-full object-contain filter drop-shadow-xs rounded-full group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <span className="group-hover:underline">Facebook</span>
                </a>
              </li>

              {/* Instagram */}
              <li>
                <a
                  href={siteConfig.contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 font-bold text-slate-900 hover:text-rose-600 transition-colors group"
                >
                  <div className="relative w-6 h-6 shrink-0 flex items-center justify-center">
                    <Image
                      src="/images/icons/icon-instagram.png"
                      alt="Instagram"
                      width={24}
                      height={24}
                      className="w-full h-full object-contain filter drop-shadow-xs rounded-sm group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <span className="group-hover:underline">Instagram</span>
                </a>
              </li>

              {/* Correo Electrónico */}
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="inline-flex items-center gap-3 font-bold text-slate-900 hover:text-campo-green transition-colors group"
                >
                  <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-emerald-800 shrink-0 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="group-hover:underline">Correo Electrónico</span>
                </a>
              </li>

              {/* Alcance Operativo */}
              <li className="inline-flex items-center gap-3 text-slate-900 font-bold">
                <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-campo-green shrink-0" />
                </div>
                <span>
                  Alcance Operativo: <span className="font-normal text-slate-600">República Argentina</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra Inferior con Legales y Volver Arriba */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <p>© {new Date().getFullYear()} Campo Directo. Todos los derechos reservados.</p>
            <button
              type="button"
              onClick={() => setLegalModalOpen(true)}
              className="hover:text-slate-800 underline transition-colors"
            >
              Aviso legal & Privacidad
            </button>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-campo-green transition-colors"
          >
            <span>Volver arriba</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modal de Aviso Legal / Privacidad */}
      {legalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setLegalModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-campo-green font-bold text-sm">
                <ShieldAlert className="w-5 h-5" />
                <span>Información Legal & Privacidad</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Aviso Legal y Tratamiento de Datos
              </h3>
              <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
                <p>
                  El presente sitio web pertenece a <strong>Campo Directo</strong> (Argentina). La información contenida en este sitio tiene fines exclusivamente informativos y de vinculación comercial con productores y empresas del sector agropecuario.
                </p>
                <p>
                  <strong>Privacidad de los datos:</strong> Los datos remitidos a través del formulario de contacto (nombre, empresa, localidad, provincia, teléfono y correo electrónico) son utilizados únicamente para responder a consultas técnicas y comerciales. No se comparten con terceros ni se comercializan.
                </p>
                <p>
                  <strong>Propiedad Intelectual:</strong> Las marcas, logotipos y elementos gráficos pertenecen a sus respectivos titulares y se encuentran protegidos conforme a la legislación aplicable en la República Argentina.
                </p>
              </div>
              <div className="pt-4 text-right">
                <button
                  type="button"
                  onClick={() => setLegalModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-campo-green text-white font-semibold text-xs hover:bg-campo-green-600 transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
