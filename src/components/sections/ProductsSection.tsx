"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MessageCircle, Send, Package, Filter, Check, X } from "lucide-react";
import { initialProducts, productCategories } from "@/data/products";
import { ProductItem } from "@/types";
import { getWhatsAppLink } from "@/data/siteConfig";

export const ProductsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [inquiryModalProduct, setInquiryModalProduct] = useState<ProductItem | null>(null);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  // Filtrado de productos por categoría
  const filteredProducts =
    selectedCategory === "Todas"
      ? initialProducts
      : initialProducts.filter((p) => p.category === selectedCategory);

  const handleOpenInquiry = (product: ProductItem) => {
    setInquiryModalProduct(product);
    setInquirySubmitted(false);
  };

  const handleCloseInquiry = () => {
    setInquiryModalProduct(null);
    setInquirySubmitted(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
    setTimeout(() => {
      handleCloseInquiry();
    }, 2500);
  };

  return (
    <section id="productos" className="py-16 sm:py-24 bg-white relative border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="max-w-3xl mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-campo-green-100 text-campo-green-800 text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-campo-green" />
            <span>Productos & Soluciones</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Líneas comerciales adaptadas a las exigencias del productor
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Explorá nuestro catálogo de insumos y tecnologías. Realizá tu consulta técnica o comercial de forma directa a través de WhatsApp o formulario.
          </p>
        </div>

        {/* Filtros de Categorías */}
        <div className="mb-10 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filtrar:</span>
            </div>
            {productCategories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-campo-green text-white shadow-md shadow-campo-green/20"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grilla de Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const productWhatsAppUrl = getWhatsAppLink(product.name);

            return (
              <div
                key={product.id}
                className="group rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Contenedor de Imagen */}
                <div className="relative w-full h-52 bg-slate-100 overflow-hidden">
                  <Image
                    src={product.imageUrl || "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-slate-800 shadow-xs">
                    {product.category}
                  </div>
                </div>

                {/* Contenido de la Ficha */}
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug group-hover:text-campo-green transition-colors">
                      {product.name}
                    </h3>

                    <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>

                    {product.presentation && (
                      <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        <Package className="w-3.5 h-3.5 text-campo-green" />
                        <span>{product.presentation}</span>
                      </div>
                    )}
                  </div>

                  {/* Acciones de Conversión Comercial */}
                  <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2.5">
                    {/* Botón Consultar (Modal/Form) */}
                    <button
                      type="button"
                      onClick={() => handleOpenInquiry(product)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5 text-slate-600" />
                      <span>Consultar</span>
                    </button>

                    {/* Botón WhatsApp Directo con Mensaje Específico */}
                    <a
                      href={productWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1caa51] shadow-xs transition-colors"
                      title={`Consultar por WhatsApp sobre ${product.name}`}
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Aclaración Comercial */}
        <div className="mt-12 text-center p-4 rounded-2xl bg-slate-50 border border-slate-200/80 max-w-2xl mx-auto">
          <p className="text-xs text-slate-500 leading-relaxed">
            * <strong>Objetivo comercial:</strong> Las consultas son canalizadas directamente con nuestro equipo técnico y de ventas para brindarte cotizaciones precisas, disponibilidad en zona y condiciones a medida.
          </p>
        </div>
      </div>

      {/* Modal de Consulta Rápida */}
      {inquiryModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
            <button
              type="button"
              onClick={handleCloseInquiry}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {inquirySubmitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-14 h-14 bg-campo-green-100 text-campo-green rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">¡Consulta enviada!</h3>
                <p className="text-sm text-slate-600">
                  Nos comunicaremos a la brevedad con la información sobre <strong>{inquiryModalProduct.name}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase text-campo-green tracking-wider">
                    Consulta Comercial
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    {inquiryModalProduct.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Presentación: {inquiryModalProduct.presentation}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre y Apellido *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-campo-green"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="Ej. +54 9 11..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-campo-green"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Localidad / Zona *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Ej. Pergamino"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-campo-green"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="contacto@ejemplo.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-campo-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mensaje o volumen requerido
                  </label>
                  <textarea
                    rows={2}
                    defaultValue={`Hola, quisiera consultar disponibilidad y condiciones comerciales para ${inquiryModalProduct.name}.`}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-campo-green"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-campo-green hover:bg-campo-green-600 transition-colors shadow-md"
                  >
                    Enviar Consulta
                  </button>

                  <a
                    href={getWhatsAppLink(inquiryModalProduct.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors"
                    title="Consultar por WhatsApp ahora"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
