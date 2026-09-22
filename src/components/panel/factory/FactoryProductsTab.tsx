"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Package,
  Plus,
  Search,
  UploadCloud,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  ExternalLink,
  Sprout,
  FlaskConical,
  Filter,
  Eye,
  AlertCircle,
  Tag,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { FactoryProduct } from "@/types/admin";
import { insumoCultivos } from "@/data/quotationHelper";
import { ProcessImageIcon } from "@/components/ui/ProcessImageIcon";

const CATEGORIAS_INSUMOS = [
  "HERBICIDA",
  "FUNGICIDA",
  "INSECTICIDA",
  "COADYUVANTE",
  "BIOESTIMULANTE",
  "FERTILIZANTE FOLIAR",
  "INOCULANTE",
  "CURASEMILLAS",
  "CORRECTOR DE AGUA",
  "ACARICIDA",
  "NUTRICIÓN VEGETAL",
];

const CATEGORIAS_SEMILLAS = [
  "SEMILLA SOJA",
  "SEMILLA MAÍZ",
  "SEMILLA TRIGO",
  "SEMILLA GIRASOL",
  "SEMILLA SORGO",
  "SEMILLA CEBADA",
  "SEMILLA FORRAJERAS",
  "SEMILLA PASTURAS",
];

export const FactoryProductsTab: React.FC = () => {
  const { session, factoryProducts, addFactoryProduct, updateFactoryProduct, deleteFactoryProduct } =
    useAdmin();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentEmpresa = session.empresa || "ADAMA";

  // Productos de la fábrica actual
  const myProducts = useMemo(() => {
    return factoryProducts.filter(
      (p) => p.empresa.toUpperCase() === currentEmpresa.toUpperCase()
    );
  }, [factoryProducts, currentEmpresa]);

  const [search, setSearch] = useState("");
  const [rubroFilter, setRubroFilter] = useState<string>("TODOS");

  // Modal ABM
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FactoryProduct | null>(null);

  // Estados del Formulario ABM
  const [rubro, setRubro] = useState<"Insumos" | "Semillas">("Insumos");
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS_INSUMOS[0]);
  const [categoriaCustom, setCategoriaCustom] = useState("");
  const [principioActivo, setPrincipioActivo] = useState("");
  const [selectedCultivos, setSelectedCultivos] = useState<string[]>(["SOJA"]);
  const [presentacion, setPresentacion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [imagenFormato, setImagenFormato] = useState("JPG / PNG (800x800 px)");
  const [activoEnPortal, setActivoEnPortal] = useState(true);
  const [imageError, setImageError] = useState("");

  const filteredProducts = useMemo(() => {
    return myProducts.filter((p) => {
      if (search) {
        const query = search.toLowerCase();
        const text = `${p.nombre} ${p.categoria} ${p.principioActivo} ${p.cultivos.join(" ")}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
      if (rubroFilter !== "TODOS" && p.rubro !== rubroFilter) {
        return false;
      }
      return true;
    });
  }, [myProducts, search, rubroFilter]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setRubro("Insumos");
    setNombre("");
    setCategoria(CATEGORIAS_INSUMOS[0]);
    setCategoriaCustom("");
    setPrincipioActivo("");
    setSelectedCultivos(["SOJA", "MAÍZ"]);
    setPresentacion("");
    setDescripcion("");
    setImagenUrl("");
    setImagenFormato("");
    setActivoEnPortal(true);
    setImageError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: FactoryProduct) => {
    setEditingProduct(prod);
    setRubro(prod.rubro);
    setNombre(prod.nombre);
    setCategoria(prod.categoria);
    setCategoriaCustom("");
    setPrincipioActivo(prod.principioActivo);
    setSelectedCultivos(prod.cultivos || []);
    setPresentacion(prod.presentacion || "");
    setDescripcion(prod.descripcion || "");
    const cleanImg = prod.imagenUrl && !prod.imagenUrl.includes("unsplash.com") ? prod.imagenUrl : "";
    setImagenUrl(cleanImg);
    setImagenFormato(cleanImg ? (prod.imagenFormato || "JPG / PNG (800x800 px)") : "");
    setActivoEnPortal(prod.activoEnPortal);
    setImageError("");
    setIsModalOpen(true);
  };

  const handleToggleCultivo = (cultivo: string) => {
    setSelectedCultivos((prev) =>
      prev.includes(cultivo) ? prev.filter((c) => c !== cultivo) : [...prev, cultivo]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError("");
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de formato: JPG, PNG, WEBP
    const validFormats = ["image/jpeg", "image/png", "image/webp"];
    if (!validFormats.includes(file.type)) {
      setImageError("Formato no válido. Usá imágenes en formato JPG, PNG o WEBP.");
      return;
    }

    // Validación de tamaño: Máx 2.5 MB
    if (file.size > 2.5 * 1024 * 1024) {
      setImageError("El archivo supera el tamaño máximo de 2.5 MB. Reducí su peso para optimizar la web.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const rawDataUrl = readerEvent.target?.result;
      if (typeof rawDataUrl !== "string") return;

      const img = new window.Image();
      img.onload = () => {
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setImagenUrl(compressedDataUrl);
          const approxKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);
          setImagenFormato(`JPG optimizado (${approxKb} KB)`);
        } else {
          setImagenUrl(rawDataUrl);
          setImagenFormato(`${file.type.split("/")[1].toUpperCase()} (${Math.round(file.size / 1024)} KB)`);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return alert("Por favor ingresá el nombre comercial del producto.");
    if (!principioActivo.trim()) return alert("Por favor especificá el principio activo o tecnología.");
    if (selectedCultivos.length === 0) return alert("Por favor preseleccioná al menos un cultivo principal.");

    const finalCategoria = categoriaCustom.trim() || categoria;

    if (editingProduct) {
      updateFactoryProduct(editingProduct.id, {
        rubro,
        nombre: nombre.toUpperCase().trim(),
        categoria: finalCategoria.toUpperCase().trim(),
        principioActivo: principioActivo.toUpperCase().trim(),
        cultivos: selectedCultivos,
        presentacion: presentacion.trim(),
        descripcion: descripcion.trim(),
        imagenUrl: imagenUrl && !imagenUrl.includes("unsplash.com") ? imagenUrl : "",
        imagenFormato,
        activoEnPortal,
      });
    } else {
      addFactoryProduct({
        empresa: currentEmpresa.toUpperCase(),
        rubro,
        nombre: nombre.toUpperCase().trim(),
        categoria: finalCategoria.toUpperCase().trim(),
        principioActivo: principioActivo.toUpperCase().trim(),
        cultivos: selectedCultivos,
        presentacion: presentacion.trim(),
        descripcion: descripcion.trim(),
        imagenUrl: imagenUrl && !imagenUrl.includes("unsplash.com") ? imagenUrl : "",
        imagenFormato,
        activoEnPortal,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, prodNombre: string) => {
    if (confirm(`¿Dar de baja el producto "${prodNombre}" del catálogo y del portal web?`)) {
      deleteFactoryProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Mis Productos ({myProducts.length})
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cada alta, baja y modificación queda <strong>vinculada directamente con el Portal Web Público</strong> para mantenerlo siempre actualizado.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-campo-green-600 hover:bg-campo-green-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por producto, activo, cultivo..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-campo-green-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Rubro:</span>
          <select
            value={rubroFilter}
            onChange={(e) => setRubroFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-campo-green-500"
          >
            <option value="TODOS">Todos los rubros</option>
            <option value="Insumos">Insumos</option>
            <option value="Semillas">Semillas</option>
          </select>
        </div>
      </div>

      {/* Grilla / Listado de Productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No tenés productos cargados</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Hacé clic en &quot;Nuevo Producto&quot; para dar de alta tus líneas comerciales y publicarlas en el portal de Campo Directo.
            </p>
          </div>
        ) : (
          filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Imagen del Producto */}
                <div className="relative w-full h-28 bg-white overflow-hidden group flex items-center justify-center border-b border-slate-100">
                  {prod.imagenUrl && !prod.imagenUrl.includes("unsplash.com") ? (
                    <Image
                      src={prod.imagenUrl}
                      alt={prod.nombre}
                      fill
                      className="object-contain p-2.5 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-emerald-50/30 p-3 select-none">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-emerald-100/80 flex items-center justify-center text-campo-green mb-1.5 group-hover:scale-105 transition-transform">
                        <ProcessImageIcon className="w-6 h-6 text-campo-green" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                        IMAGEN EN PROCESO
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-campo-green/90 mt-0.5">
                        CAMPO DIRECTO
                      </span>
                    </div>
                  )}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900/80 text-white backdrop-blur-md">
                      {prod.rubro}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-campo-green-600/90 text-white backdrop-blur-md">
                      {prod.categoria}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        prod.activoEnPortal
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-400 text-white"
                      }`}
                    >
                      {prod.activoEnPortal ? "Publicado en Portal" : "Oculto"}
                    </span>
                  </div>
                </div>

                {/* Datos del Producto */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-snug">
                      {prod.nombre}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                      <FlaskConical className="w-3 h-3 text-campo-green-600 shrink-0" />
                      <span>{prod.principioActivo}</span>
                    </p>
                  </div>

                  {prod.presentacion && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg inline-block border border-slate-200">
                      <strong>Presentación:</strong> {prod.presentacion}
                    </div>
                  )}

                  {/* 2e: Principales Cultivos (Preseleccionables) */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Cultivos Principales:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {prod.cultivos?.map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones ABM */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">
                  Act: {prod.fechaActualizacion}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(prod)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-200 font-semibold transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Modificar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(prod.id, prod.nombre)}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal ABM (Alta / Modificación) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header Modal */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-campo-green-400" />
                <h3 className="text-lg font-bold">
                  {editingProduct ? `Modificar: ${editingProduct.nombre}` : `Alta de Producto - ${currentEmpresa}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Rubro */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Rubro Comercial *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRubro("Insumos");
                      setCategoria(CATEGORIAS_INSUMOS[0]);
                    }}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      rubro === "Insumos"
                        ? "bg-campo-green text-white border-campo-green shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <FlaskConical className="w-4 h-4" />
                    <span>Insumos Agrícolas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRubro("Semillas");
                      setCategoria(CATEGORIAS_SEMILLAS[0]);
                    }}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      rubro === "Semillas"
                        ? "bg-campo-green text-white border-campo-green shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Sprout className="w-4 h-4" />
                    <span>Semillas</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre Comercial */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nombre Comercial / Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: ARSONEX, BENDER, DM 46E23..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold uppercase focus:outline-none focus:ring-2 focus:ring-campo-green-500"
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-campo-green-500 bg-white"
                  >
                    {(rubro === "Insumos" ? CATEGORIAS_INSUMOS : CATEGORIAS_SEMILLAS).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Principio Activo */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Principio Activo o Tecnología *
                  </label>
                  <input
                    type="text"
                    required
                    value={principioActivo}
                    onChange={(e) => setPrincipioActivo(e.target.value)}
                    placeholder="Ej: IMAZAMOX 70% + IMAZAPIR 30%"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-campo-green-500"
                  />
                </div>

                {/* Presentación */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Presentación Comercial
                  </label>
                  <input
                    type="text"
                    value={presentacion}
                    onChange={(e) => setPresentacion(e.target.value)}
                    placeholder="Ej: Bidón x 20 Lts / Caja 4x5 Lts"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-campo-green-500"
                  />
                </div>
              </div>

              {/* Principales Cultivos (Lista Preseleccionable) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                    Principales Cultivos (Seleccioná los aplicables) *
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {selectedCultivos.length} seleccionados
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {insumoCultivos.map((cultivo) => {
                    const isSelected = selectedCultivos.includes(cultivo);
                    return (
                      <button
                        key={cultivo}
                        type="button"
                        onClick={() => handleToggleCultivo(cultivo)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                          isSelected
                            ? "bg-campo-green text-white border-campo-green shadow-2xs"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        {cultivo}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Imagen del Producto con Especificaciones de Tamaño y Formato */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                    Imagen del Producto (Vinculada al Portal Web y Tu Cotizador)
                  </label>
                  {/* Especificaciones requeridas */}
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    <strong>Tamaño y formato recomendado:</strong> Proporción cuadrada <strong>1:1</strong> (mínimo <strong>600 x 600 px</strong>, óptimo <strong>800 x 800 px</strong>) o vertical, con el envase centrado sobre fondo blanco o transparente (PNG, JPG o WEBP). El sistema la muestra completa y la optimiza automáticamente.
                  </p>
                </div>

                {imageError && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{imageError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Preview de la Imagen */}
                  <div className="sm:col-span-4 flex flex-col items-center">
                    <div className="relative w-28 h-28 rounded-2xl border border-slate-300 overflow-hidden bg-white shadow-xs flex items-center justify-center">
                      {imagenUrl && !imagenUrl.includes("unsplash.com") ? (
                        <Image
                          src={imagenUrl}
                          alt="Vista previa"
                          fill
                          className="object-contain p-1.5"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-emerald-50/30 p-2 text-center select-none">
                          <ProcessImageIcon className="w-5 h-5 text-campo-green mb-0.5" />
                          <span className="text-[8px] font-black text-slate-500 uppercase leading-none">
                            EN PROCESO
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-mono">
                      {imagenFormato}
                    </span>
                  </div>

                  {/* Selector y Botón de Subida */}
                  <div className="sm:col-span-8 space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <UploadCloud className="w-4 h-4 text-campo-green-600" />
                      <span>Subir Fotografía del Producto</span>
                    </button>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                        O ingresar URL externa de la fotografía:
                      </label>
                      <input
                        type="url"
                        value={imagenUrl}
                        onChange={(e) => setImagenUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-campo-green-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Publicación en Portal */}
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <input
                  type="checkbox"
                  id="activo-portal"
                  checked={activoEnPortal}
                  onChange={(e) => setActivoEnPortal(e.target.checked)}
                  className="w-4 h-4 text-campo-green rounded border-slate-300 focus:ring-campo-green cursor-pointer"
                />
                <label htmlFor="activo-portal" className="text-xs font-bold text-emerald-900 cursor-pointer">
                  Publicar y sincronizar inmediatamente con el catálogo y cotizador del portal web
                </label>
              </div>

              {/* Footer Modal */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-campo-green-600 hover:bg-campo-green-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {editingProduct ? "Guardar Cambios" : "Dar de Alta en Portal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
