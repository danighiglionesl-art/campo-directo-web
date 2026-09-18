"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Mail,
  Lock,
  ArrowRight,
  User,
  Building2,
  MapPin,
  MessageSquare,
  CheckCircle2,
  Zap,
  Users,
  MessageCircle,
  Instagram,
  Facebook,
  Megaphone,
  TrendingUp,
  Newspaper,
  ThumbsUp,
  ChevronDown,
} from "lucide-react";
import { siteConfig, getWhatsAppLink } from "@/data/siteConfig";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Logo } from "@/components/ui/Logo";
import { ContactFormData } from "@/types";

const ARGENTINA_PROVINCES = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

const LOCALITIES_BY_PROVINCE_MAP: Record<string, string[]> = {
  "Buenos Aires": [
    "Pergamino",
    "Junín",
    "Tandil",
    "Balcarce",
    "Necochea",
    "Tres Arroyos",
    "Bahía Blanca",
    "Chivilcoy",
    "Salto",
    "Chacabuco",
    "9 de Julio",
    "Trenque Lauquen",
    "Pehuajó",
    "Bolívar",
    "Azul",
    "Olavarría",
    "Bragado",
    "Mercedes",
    "San Nicolás",
    "Ramallo",
    "Colón",
    "Rojas",
    "Carmen de Areco",
    "Lincoln",
    "Villegas",
    "Coronel Suárez",
    "Otra localidad",
  ],
  "CABA": [
    "CABA - Ciudad Autónoma de Buenos Aires",
    "Otra localidad",
  ],
  "Catamarca": [
    "San Fernando del Valle de Catamarca",
    "Valle Viejo",
    "Andalgalá",
    "Tinogasta",
    "Belén",
    "Santa María",
    "Recreo",
    "Otra localidad",
  ],
  "Chaco": [
    "Resistencia",
    "Presidencia Roque Sáenz Peña",
    "Villa Ángela",
    "Charata",
    "Las Breñas",
    "General Pinedo",
    "Castelli",
    "Machagai",
    "Otra localidad",
  ],
  "Chubut": [
    "Rawson",
    "Comodoro Rivadavia",
    "Trelew",
    "Puerto Madryn",
    "Esquel",
    "Sarmiento",
    "Gaiman",
    "Otra localidad",
  ],
  "Córdoba": [
    "Río Cuarto",
    "Córdoba Capital",
    "Villa María",
    "Marcos Juárez",
    "San Francisco",
    "Bell Ville",
    "Laboulaye",
    "Jesús María",
    "Río Tercero",
    "La Carlota",
    "Canals",
    "Huinca Renancó",
    "General Deheza",
    "General Cabrera",
    "Hernando",
    "Leones",
    "Monte Buey",
    "Arias",
    "Corral de Bustos",
    "Villa Dolores",
    "Otra localidad",
  ],
  "Corrientes": [
    "Corrientes Capital",
    "Goya",
    "Paso de los Libres",
    "Curuzú Cuatiá",
    "Mercedes",
    "Santo Tomé",
    "Monte Caseros",
    "Esquina",
    "Otra localidad",
  ],
  "Entre Ríos": [
    "Paraná",
    "Gualeguaychú",
    "Concordia",
    "Victoria",
    "Nogoyá",
    "Villaguay",
    "Crespo",
    "Diamante",
    "La Paz",
    "Urdinarrain",
    "Gualeguay",
    "Chajarí",
    "Otra localidad",
  ],
  "Formosa": [
    "Formosa Capital",
    "Clorinda",
    "Pirané",
    "El Colorado",
    "Las Lomitas",
    "Ibarreta",
    "Otra localidad",
  ],
  "Jujuy": [
    "San Salvador de Jujuy",
    "San Pedro de Jujuy",
    "Palpalá",
    "Perico",
    "Libertador General San Martín",
    "El Carmen",
    "Otra localidad",
  ],
  "La Pampa": [
    "Santa Rosa",
    "General Pico",
    "Realicó",
    "Intendente Alvear",
    "Eduardo Castex",
    "Macachín",
    "Guatraché",
    "General Acha",
    "Victorica",
    "Otra localidad",
  ],
  "La Rioja": [
    "La Rioja Capital",
    "Chilecito",
    "Aimogasta",
    "Chamical",
    "Chepes",
    "Villa Unión",
    "Otra localidad",
  ],
  "Mendoza": [
    "Mendoza Capital",
    "San Rafael",
    "Godoy Cruz",
    "Guaymallén",
    "Las Heras",
    "Maipú",
    "Luján de Cuyo",
    "San Martín",
    "Tunuyán",
    "General Alvear",
    "Rivadavia",
    "Otra localidad",
  ],
  "Misiones": [
    "Posadas",
    "Oberá",
    "Eldorado",
    "Apóstoles",
    "Leandro N. Alem",
    "Puerto Iguazú",
    "San Vicente",
    "Otra localidad",
  ],
  "Neuquén": [
    "Neuquén Capital",
    "Plottier",
    "Centenario",
    "Cutral Có",
    "Zapala",
    "San Martín de los Andes",
    "Rincón de los Sauces",
    "Otra localidad",
  ],
  "Río Negro": [
    "Viedma",
    "General Roca",
    "Cipolletti",
    "San Carlos de Bariloche",
    "Villa Regina",
    "Allen",
    "Cinco Saltos",
    "Catriel",
    "Choele Choel",
    "Otra localidad",
  ],
  "Salta": [
    "Salta Capital",
    "Metán",
    "Rosario de la Frontera",
    "Joaquín V. González",
    "Las Lajitas",
    "Orán",
    "Tartagal",
    "General Güemes",
    "Otra localidad",
  ],
  "San Juan": [
    "San Juan Capital",
    "Rawson",
    "Rivadavia",
    "Chimbas",
    "Santa Lucía",
    "Pocito",
    "Caucete",
    "Jáchal",
    "Otra localidad",
  ],
  "San Luis": [
    "San Luis Capital",
    "Villa Mercedes",
    "Merlo",
    "Justo Daract",
    "La Toma",
    "Quines",
    "Santa Rosa del Conlara",
    "Buena Esperanza",
    "Otra localidad",
  ],
  "Santa Cruz": [
    "Río Gallegos",
    "Caleta Olivia",
    "Pico Truncado",
    "Las Heras",
    "El Calafate",
    "Puerto Deseado",
    "Otra localidad",
  ],
  "Santa Fe": [
    "Rosario",
    "Santa Fe Capital",
    "Venado Tuerto",
    "Rafaela",
    "Reconquista",
    "Casilda",
    "San Lorenzo",
    "Timbúes",
    "Puerto General San Martín",
    "Arroyo Seco",
    "Villa Constitución",
    "Cañada de Gómez",
    "Esperanza",
    "Sunchales",
    "Firmat",
    "Rufino",
    "San Jorge",
    "San Cristóbal",
    "Coronda",
    "Otra localidad",
  ],
  "Santiago del Estero": [
    "Santiago del Estero Capital",
    "Bandera",
    "Quimilí",
    "Añatuya",
    "Frías",
    "Fernández",
    "Loreto",
    "Suncho Corral",
    "Otra localidad",
  ],
  "Tierra del Fuego": [
    "Ushuaia",
    "Río Grande",
    "Tolhuin",
    "Otra localidad",
  ],
  "Tucumán": [
    "San Miguel de Tucumán",
    "Concepción",
    "Tafí Viejo",
    "Monteros",
    "Aguilares",
    "Famaillá",
    "Burruyacú",
    "Leales",
    "Otra localidad",
  ],
};

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: "",
    company: "",
    locality: "",
    province: "",
    phone: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const whatsappGeneralUrl = getWhatsAppLink();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvince = e.target.value;
    setFormData((prev) => ({
      ...prev,
      province: newProvince,
      locality: "",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const toEmail = siteConfig.contact.email || "info@campodirecto.ar";
    const subject = encodeURIComponent(
      `Consulta Comercial Campo Directo - ${formData.fullName} (${formData.company})`
    );
    const bodyText =
      `Hola equipo de Campo Directo,\n\n` +
      `Se ha enviado una nueva consulta comercial desde el sitio web:\n\n` +
      `• Nombre y apellido: ${formData.fullName}\n` +
      `• Empresa / Establecimiento / Productor: ${formData.company}\n` +
      `• Localidad: ${formData.locality}\n` +
      `• Provincia: ${formData.province}\n` +
      `• Teléfono / WhatsApp: ${formData.phone}\n` +
      `• Email: ${formData.email}\n\n` +
      `Consulta:\n${formData.message}\n\n` +
      `--\nEnviado desde campodirecto.ar`;

    const mailtoUrl = `mailto:${toEmail}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;

    window.location.href = mailtoUrl;

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({
        fullName: "",
        company: "",
        locality: "",
        province: "",
        phone: "",
        email: "",
        message: "",
      });
    }, 1000);
  };

  return (
    <section
      id="contacto"
      className="relative pt-16 sm:pt-20 pb-16 sm:pb-20 overflow-hidden border-t border-slate-200/80 bg-slate-50"
    >
      {/* Marca de agua de fondo: Sembrado de soja con degradado natural continuo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <Image
          src="/images/sembrado-soja-watermark.jpg"
          alt="Sembrado Campo Directo"
          fill
          sizes="100vw"
          className="object-cover object-top opacity-35"
          priority
        />
        {/* Degradado suave continuo hacia el verde oscuro del campo (sin cortes ni líneas negras) */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/85 via-65% to-emerald-950/75" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ========================================================================= */}
        {/* ENCABEZADO: Título a la izquierda y Bloque de Marca con Eslogan a la derecha */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8 mb-10 sm:mb-12 pb-8 border-b border-slate-200/80">
          {/* Lado Izquierdo: Badge, Título 'Hablemos Directo' y Subtítulo */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/90 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
              <Mail className="w-3.5 h-3.5 text-emerald-800" />
              <span>CONTACTO COMERCIAL</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Hablemos <span className="text-campo-green">Directo</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
              ¿Buscás un producto, necesitás asesoramiento o querés conocer nuestras condiciones
              comerciales? Completá el formulario o contactanos directamente por nuestros canales oficiales.
            </p>
          </div>

          {/* Lado Derecho: Logo Campo Directo + Eslogan Oficial 'Del laboratorio a tu campo' (igual al resto de bloques) */}
          <div className="flex items-center gap-5 sm:gap-7 shrink-0 self-start lg:self-center py-2">
            <div className="relative flex items-center justify-center">
              <Logo
                className="h-20 sm:h-24 lg:h-28 w-auto filter drop-shadow-md hover:scale-105 transition-transform"
                variant="standard"
                priority
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

        {/* ========================================================================= */}
        {/* GRILLA EQUIPARADA EN ALTURA (50% / 50% con items-stretch):               */}
        {/* Bloque Izquierdo (Formulario) y Bloque Derecho (3 Canales + Seguridad)   */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7 items-stretch mb-10 sm:mb-12">
          {/* ----------------------------------------------------------------------- */}
          {/* COLUMNA IZQUIERDA: FORMULARIO "Completá tus datos"                      */}
          {/* ----------------------------------------------------------------------- */}
          <div className="bg-[#f0f8f2] rounded-3xl p-5 sm:p-7 shadow-card border-2 border-campo-green/20 flex flex-col justify-between h-full">
            <div>
              <div className="mb-4">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Completá tus <span className="text-campo-green">datos</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                  Nos comunicaremos a la brevedad para brindarte una respuesta.
                </p>
              </div>

              {isSuccess ? (
                <div className="py-12 text-center space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900">
                    ¡Consulta enviada con éxito!
                  </h4>
                  <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed">
                    Tu mensaje fue dirigido a <strong>{siteConfig.contact.email}</strong>. Un representante de nuestro equipo comercial se comunicará a la brevedad.
                  </p>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setIsSuccess(false)}
                      className="px-6 py-2.5 bg-[#126639] text-white font-bold text-sm rounded-xl hover:bg-[#0e522e] transition-colors shadow-sm"
                    >
                      Enviar otra consulta
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* 1. Nombre y apellido */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
                    <label
                      htmlFor="fullName"
                      className="block text-xs sm:text-sm font-bold text-slate-800 mb-1"
                    >
                      Nombre y apellido <span className="text-[#126639]">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Ej. Juan Manuel Rossi"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#126639] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* 2. Empresa / Establecimiento / Productor */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
                    <label
                      htmlFor="company"
                      className="block text-xs sm:text-sm font-bold text-slate-800 mb-1"
                    >
                      Empresa / Establecimiento / Productor <span className="text-[#126639]">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="company"
                        name="company"
                        type="text"
                        required
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Ej. Agropecuaria Las Acacias / Productor individual"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#126639] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* 3 & 4. Provincia y Localidad */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="province"
                          className="block text-xs sm:text-sm font-bold text-slate-800 mb-1"
                        >
                          Provincia <span className="text-[#126639]">*</span>
                        </label>
                        <div className="relative">
                          <select
                            id="province"
                            name="province"
                            required
                            value={formData.province}
                            onChange={handleProvinceChange}
                            className="w-full pl-4 pr-10 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#126639] focus:border-transparent transition-all cursor-pointer"
                          >
                            <option value="">Seleccioná una provincia</option>
                            {ARGENTINA_PROVINCES.map((prov) => (
                              <option key={prov} value={prov}>
                                {prov}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="locality"
                          className="block text-xs sm:text-sm font-bold text-slate-800 mb-1"
                        >
                          Localidad <span className="text-[#126639]">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <select
                            id="locality"
                            name="locality"
                            required
                            disabled={!formData.province}
                            value={formData.locality}
                            onChange={handleChange}
                            className="w-full pl-10 pr-10 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#126639] focus:border-transparent transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100"
                          >
                            <option value="">
                              {formData.province
                                ? "Seleccioná una localidad"
                                : "Primero seleccioná una provincia"}
                            </option>
                            {formData.province &&
                              (LOCALITIES_BY_PROVINCE_MAP[formData.province] || ["Otra localidad"]).map(
                                (loc) => (
                                  <option key={loc} value={loc}>
                                    {loc}
                                  </option>
                                )
                              )}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5 & 6. Teléfono / WhatsApp y Email */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-xs sm:text-sm font-bold text-slate-800 mb-1"
                        >
                          Teléfono / WhatsApp <span className="text-[#126639]">*</span>
                        </label>
                        <div className="relative">
                          <div className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                            <WhatsAppIcon className="w-4 h-4" />
                          </div>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Ej. +54 9 358 ..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#126639] focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-xs sm:text-sm font-bold text-slate-800 mb-1"
                        >
                          Email <span className="text-[#126639]">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Ej. nombre@correo.com"
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#126639] focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 7. Consulta */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
                    <label
                      htmlFor="message"
                      className="block text-xs sm:text-sm font-bold text-slate-800 mb-1"
                    >
                      Consulta <span className="text-[#126639]">*</span>
                    </label>
                    <div className="relative">
                      <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={3}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Contanos qué producto, solución o asesoramiento estás buscando..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#126639] focus:border-transparent transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Botón: Enviar consulta */}
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-[#126639] hover:bg-[#0e522e] active:bg-[#0a3f23] shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer text-base group"
                    >
                      {isSubmitting ? (
                        <span>Preparando consulta...</span>
                      ) : (
                        <>
                          <span>Enviar consulta</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Pie del formulario con icono de candado */}
            <div className="flex items-center justify-center gap-1.5 pt-3 border-t border-slate-200/70 text-xs text-slate-500 font-medium mt-3">
              <Lock className="w-3.5 h-3.5 text-[#126639]" />
              <span>Tu mensaje se remitirá directamente a nuestro equipo comercial.</span>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* COLUMNA DERECHA: 3 CANALES + SEGURIDAD (Equiparados exactamente en h)   */}
          {/* ----------------------------------------------------------------------- */}
          <div className="flex flex-col justify-between gap-3 sm:gap-3.5 h-full">
            {/* 1. Tarjeta WhatsApp (mismo color verde suave que Completá tus datos) */}
            <div className="flex-1 p-3.5 sm:p-4 rounded-2xl bg-[#f0f8f2] border border-campo-green/25 shadow-card hover:shadow-card-hover flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 transition-all hover:border-[#25D366]">
              {/* Lado Izquierdo */}
              <div className="flex-1 w-full sm:w-auto flex items-center gap-3.5">
                <a
                  href={whatsappGeneralUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 transition-transform hover:scale-110 block"
                  title="Iniciar conversación por WhatsApp"
                >
                  <Image
                    src="/images/icons/icon-whatsapp.png"
                    alt="WhatsApp"
                    width={56}
                    height={56}
                    className="w-full h-full object-contain filter drop-shadow-sm"
                  />
                </a>
                <div>
                  <a
                    href={whatsappGeneralUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base font-bold text-slate-900 leading-snug hover:text-emerald-700 transition-colors block"
                  >
                    Hablemos por WhatsApp
                  </a>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-tight mt-0.5">
                    Para consultas, cotizaciones y atención comercial directa.
                  </p>
                </div>
              </div>

              {/* Divisor vertical */}
              <div className="hidden sm:block w-px bg-campo-green/20 self-stretch my-0.5" />

              {/* Lado Derecho: 3 atributos */}
              <div className="w-full sm:w-44 shrink-0 flex flex-col justify-center space-y-1.5 text-xs text-slate-700 font-semibold pl-0 sm:pl-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-campo-green/20">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-[#127944] shrink-0" />
                  <span>Respuesta ágil</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-[#127944] shrink-0" />
                  <span>Atención personalizada</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5 text-[#127944] shrink-0" />
                  <span>Sin intermediarios</span>
                </div>
              </div>
            </div>

            {/* 2. Tarjeta Instagram (tonalidad suave abajo para armonía) */}
            <div className="flex-1 p-3.5 sm:p-4 rounded-2xl bg-[#faf5f6] border border-[#f3e6e9] shadow-card hover:shadow-card-hover flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 transition-all hover:border-pink-300">
              {/* Lado Izquierdo */}
              <div className="flex-1 w-full sm:w-auto flex items-center gap-3.5">
                <a
                  href={siteConfig.contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 transition-transform hover:scale-110 block"
                  title="Visitar Instagram de Campo Directo"
                >
                  <Image
                    src="/images/icons/icon-instagram.png"
                    alt="Instagram"
                    width={56}
                    height={56}
                    className="w-full h-full object-contain filter drop-shadow-sm rounded-xl"
                  />
                </a>
                <div>
                  <a
                    href={siteConfig.contact.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base font-bold text-slate-900 leading-snug hover:text-rose-600 transition-colors block"
                  >
                    Seguinos en Instagram
                  </a>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-tight mt-0.5">
                    Novedades, productos y actualidad de Campo Directo.
                  </p>
                </div>
              </div>

              {/* Divisor vertical */}
              <div className="hidden sm:block w-px bg-[#ebd5da] self-stretch my-0.5" />

              {/* Lado Derecho: 3 atributos */}
              <div className="w-full sm:w-44 shrink-0 flex flex-col justify-center space-y-1.5 text-xs text-slate-700 font-semibold pl-0 sm:pl-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#ebd5da]">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-3.5 h-3.5 text-[#dc2743] shrink-0" />
                  <span>Novedades del sector</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-[#dc2743] shrink-0" />
                  <span>Lanzamientos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-[#dc2743] shrink-0" />
                  <span>Comunidad agro</span>
                </div>
              </div>
            </div>

            {/* 3. Tarjeta Facebook (tonalidad suave abajo para armonía) */}
            <div className="flex-1 p-3.5 sm:p-4 rounded-2xl bg-[#f4f7fa] border border-[#e2e8f0] shadow-card hover:shadow-card-hover flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 transition-all hover:border-blue-300">
              {/* Lado Izquierdo */}
              <div className="flex-1 w-full sm:w-auto flex items-center gap-3.5">
                <a
                  href={siteConfig.contact.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 transition-transform hover:scale-110 block rounded-full"
                  title="Visitar Facebook de Campo Directo"
                >
                  <Image
                    src="/images/icons/icon-facebook.png"
                    alt="Facebook"
                    width={56}
                    height={56}
                    className="w-full h-full object-contain filter drop-shadow-sm rounded-full"
                  />
                </a>
                <div>
                  <a
                    href={siteConfig.contact.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base font-bold text-slate-900 leading-snug hover:text-[#1877F2] transition-colors block"
                  >
                    Seguinos en Facebook
                  </a>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-tight mt-0.5">
                    Información útil, actividades y contenido del agro.
                  </p>
                </div>
              </div>

              {/* Divisor vertical */}
              <div className="hidden sm:block w-px bg-[#d7e2ee] self-stretch my-0.5" />

              {/* Lado Derecho: 3 atributos */}
              <div className="w-full sm:w-44 shrink-0 flex flex-col justify-center space-y-1.5 text-xs text-slate-700 font-semibold pl-0 sm:pl-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#d7e2ee]">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-3.5 h-3.5 text-[#1877F2] shrink-0" />
                  <span>Actualidad del agro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-[#1877F2] shrink-0" />
                  <span>Eventos y noticias</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-3.5 h-3.5 text-[#1877F2] shrink-0" />
                  <span>Nuestra comunidad</span>
                </div>
              </div>
            </div>

            {/* 4. Tarjeta de Seguridad y Logo Campo Directo con Tamaño Equilibrado y Línea Alineada */}
            <div className="flex-1 p-3.5 sm:p-4 rounded-2xl bg-[#f0f8f2] border border-campo-green/25 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              {/* Lado Izquierdo: Título con 'datos' y 'seguros' en verde y texto fluido */}
              <div className="flex-1 min-w-0 pr-0 sm:pr-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                  <Lock className="w-4 h-4 text-[#126639] shrink-0" />
                  <span>Tus <span className="text-campo-green">datos</span>, siempre <span className="text-campo-green">seguros</span></span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-600 font-normal leading-relaxed mt-1">
                  La información que nos brindás será utilizada exclusivamente para responder tu consulta y, con tu consentimiento, para enviarte novedades comerciales de Campo Directo. Podés solicitar su eliminación en cualquier momento.
                </p>
              </div>

              {/* Divisor vertical alineado exactamente con los rectángulos anteriores */}
              <div className="hidden sm:block w-px bg-campo-green/20 self-stretch my-0.5" />

              {/* Lado Derecho: sm:w-44 idéntico al rectángulo anterior, con logo de Campo Directo con máxima presencia visual */}
              <div className="w-full sm:w-44 shrink-0 flex items-center justify-center pl-0 sm:pl-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-campo-green/20 self-stretch">
                <div className="relative w-full max-w-[162px] h-28 sm:h-32 lg:h-36 flex items-center justify-center">
                  <Image
                    src="/images/logo-transparent.png"
                    alt="Campo Directo"
                    fill
                    sizes="(max-width: 640px) 140px, 170px"
                    className="object-contain filter drop-shadow-md hover:scale-105 transition-transform duration-300"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
