"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { MessageCircle, Send, Package, Filter, Check, X, Building2, Sparkles, Tag } from "lucide-react";
import { initialProducts, productCategories } from "@/data/products";
import { initialFactoryProducts } from "@/data/factoryData";
import { ProductItem } from "@/types";
import { FactoryProduct } from "@/types/admin";
import { getWhatsAppLink } from "@/data/siteConfig";

export interface DisplayProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  presentation?: string;
  imageUrl?: string;
  empresa?: string;
  rubro?: "Semillas" | "Insumos";
  principioActivo?: string;
  cultivos?: string[];
  activoEnPortal?: boolean;
}

export const ProductsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [inquiryModalProduct, setInquiryModalProduct] = useState<DisplayProduct | null>(null);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [allProducts, setAllProducts] = useState<DisplayProduct[]>([]);

  // Sincronización en tiempo real con el ABM de Productos de las Fábricas
  useEffect(() => {
    const loadProducts = () => {
      let factoryList: FactoryProduct[] = initialFactoryProducts;
      try {
        const stored = localStorage.getItem("cd_factory_products");
        if (stored) {
          factoryList = JSON.parse(stored);
        }
      } catch (e) {
        console.error("Error reading factory products from localStorage", e);
      }

      // Filtrar sólo productos activos en el portal
      const activeFactoryProducts: DisplayProduct[] = factoryList
        .filter((fp) => fp.activoEnPortal !== false)
        .map((fp) => ({
          id: fp.id,
          name: fp.nombre,
          category: fp.categoria ? fp.categoria.toUpperCase() : (fp.rubro === "Semillas" ? "SEMILLAS" : "INSUMOS"),
          description: fp.descripcion || `Producto formulado y garantizado por ${fp.empresa}.`,
          presentation: fp.presentacion || (fp.rubro === "Semillas" ? "Bolsas / Big Bag" : "Bidones / Granel"),
          imageUrl: fp.imagenUrl || "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80",
          empresa: fp.empresa,
          rubro: fp.rubro,
          principioActivo: fp.principioActivo,
          cultivos: fp.cultivos,
          activoEnPortal: fp.activoEnPortal,
        }));

      // Convertir initialProducts estándar a DisplayProduct
      const baseProducts: DisplayProduct[] = initialProducts.map((p) => ({
        ...p,
        category: p.category.toUpperCase(),
      }));

      // Unir catálogo base y productos de fábrica
      setAllProducts([...baseProducts, ...activeFactoryProducts]);
    };

    loadProducts();

    // Escuchar cambios de storage entre pestañas o actualizaciones del panel
    window.addEventListener("storage", loadProducts);
    return () => window.removeEventListener("storage", loadProducts);
  }, []);

  // Lista dinámica de categorías basadas en productos activos
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    set.add("TODAS");
    allProducts.forEach((p) => {
      if (p.category) {
        set.add(p.category.trim().toUpperCase());
      }
    });
    return Array.from(set);
  }, [allProducts]);

  // Filtrado de productos por categoría
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Todas" || selectedCategory === "TODAS") {
      return allProducts;
    }
    return allProducts.filter(
      (p) => p.category.toUpperCase() === selectedCategory.toUpperCase()
    );
  }, [allProducts, selectedCategory]);

  const handleOpenInquiry = (product: DisplayProduct) => {
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
            <span>Productos & Soluciones Directo de Fábrica</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Líneas comerciales y tecnologías vinculadas en tiempo real
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Explorá nuestro catálogo de semillas e insumos provistos directamente por los laboratorios y semilleros
            líderes del país. Realizá tu consulta técnica o cotización mayorista a través de WhatsApp o formulario.
          </p>
        </div>

        {/* Filtros de Categorías */}
        <div className="mb-10 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filtrar:</span>
            </div>
            {categoriesList.map((cat) => {
              const isSelected =
                (selectedCategory === "Todas" && cat === "TODAS") ||
                selectedCategory.toUpperCase() === cat.toUpperCase();

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat === "TODAS" ? "Todas" : cat)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isSelected
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
            const productQuery = product.empresa
              ? `${product.name} (${product.empresa})`
              : product.name;
            const productWhatsAppUrl = getWhatsAppLink(productQuery);
            const isDataUrl = product.imageUrl?.startsWith("data:");

            return (
              <div
                key={product.id}
                className="group rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Contenedor de Imagen */}
                <div className="relative w-full h-56 bg-slate-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl || "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-slate-800 shadow-sm uppercase tracking-wider">
                    {product.category}
                  </div>

                  {product.empresa && (
                    <div className="absolute top-3 right-3 bg-emerald-800/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-sm flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-emerald-300" />
                      <span>{product.empresa}</span>
                    </div>
                  )}

                  {product.rubro && (
                    <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[10px] font-bold text-white">
                      {product.rubro}
                    </div>
                  )}
                </div>

                {/* Contenido de la Ficha */}
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug group-hover:text-campo-green transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    {/* Principio activo si existe */}
                    {product.principioActivo && (
                      <div className="mt-1.5 flex items-center gap-1 text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 font-medium">
                        <Tag className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                        <span className="line-clamp-1">{product.principioActivo}</span>
                      </div>
                    )}

                    <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Cultivos preseleccionables */}
                    {product.cultivos && product.cultivos.length > 0 && (
                      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-slate-400 font-semibold uppercase">Cultivos:</span>
                        {product.cultivos.slice(0, 4).map((cultivo) => (
                          <span
                            key={cultivo}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md"
                          >
                            {cultivo}
                          </span>
                        ))}
                      </div>
                    )}

                    {product.presentation && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
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
                      <span>Cotizar</span>
                    </button>

                    {/* Botón WhatsApp Directo con Mensaje Específico */}
                    <a
                      href={productWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1caa51] shadow-xs transition-colors"
                      title={`Consultar por WhatsApp sobre ${productQuery}`}
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
            * <strong>Venta Mayorista Directa:</strong> Las solicitudes son canalizadas de forma transparente
            entre el productor y las fábricas proveedoras autorizadas para garantizar máxima trazabilidad, lotes frescos y mejores condiciones de pago.
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
                <h3 className="text-xl font-bold text-slate-900">¡Solicitud recibida!</h3>
                <p className="text-sm text-slate-600">
                  Nos comunicaremos a la brevedad con la cotización oficial para{" "}
                  <strong>{inquiryModalProduct.name}</strong>
                  {inquiryModalProduct.empresa && ` (${inquiryModalProduct.empresa})`}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-bold uppercase text-campo-green tracking-wider">
                      Solicitud de Cotización
                    </span>
                    {inquiryModalProduct.empresa && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {inquiryModalProduct.empresa}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {inquiryModalProduct.name}
                  </h3>
                  {inquiryModalProduct.principioActivo && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {inquiryModalProduct.principioActivo}
                    </p>
                  )}
                  {inquiryModalProduct.presentation && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Presentación: {inquiryModalProduct.presentation}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre y Apellido / Razón Social *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Ej. Juan Pérez / Agropecuaria Don Pedro"
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
                      Localidad / Destino *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Ej. Pergamino (Bs As)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-campo-green"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    placeholder="contacto@ejemplo.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-campo-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Volumen estimado o requerimientos
                  </label>
                  <textarea
                    rows={2}
                    defaultValue={`Hola, quisiera solicitar cotización mayorista y plazo de entrega para ${inquiryModalProduct.name}${inquiryModalProduct.empresa ? ` de ${inquiryModalProduct.empresa}` : ""}.`}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-campo-green"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-campo-green hover:bg-campo-green-600 transition-colors shadow-md"
                  >
                    Enviar Solicitud
                  </button>

                  <a
                    href={getWhatsAppLink(inquiryModalProduct.empresa ? `${inquiryModalProduct.name} (${inquiryModalProduct.empresa})` : inquiryModalProduct.name)}
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
