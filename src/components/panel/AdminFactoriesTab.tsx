"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  Search,
  Plus,
  FileSpreadsheet,
  KeyRound,
  Eye,
  EyeOff,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  ShieldCheck,
  Phone,
  Mail,
  Package,
  Layers,
  ArrowRight,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { FactoryAccount } from "@/types/admin";
import { formatCuit, validateCuitModulo11 } from "@/data/quotationHelper";

export const AdminFactoriesTab: React.FC = () => {
  const {
    factories,
    addFactory,
    updateFactory,
    deleteFactory,
    exportFactoriesExcel,
    viewAsFactory,
    factoryProducts,
    factoryQuotations,
    factorySales,
    searchQuery,
  } = useAdmin();

  const [localSearch, setLocalSearch] = useState("");
  const [rubroFilter, setRubroFilter] = useState<string>("TODOS");
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFactory, setEditingFactory] = useState<FactoryAccount | null>(null);

  // Form State
  const [formEmpresa, setFormEmpresa] = useState("");
  const [formRazonSocial, setFormRazonSocial] = useState("");
  const [formCuit, setFormCuit] = useState("");
  const [formContacto, setFormContacto] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formUsuario, setFormUsuario] = useState("");
  const [formClaveActiva, setFormClaveActiva] = useState("");
  const [formRubro, setFormRubro] = useState<"Insumos" | "Semillas" | "Ambos">("Insumos");
  const [formEstado, setFormEstado] = useState<"ACTIVO" | "INACTIVO">("ACTIVO");
  const [formLocalidad, setFormLocalidad] = useState("");
  const [formProvincia, setFormProvincia] = useState("BUENOS AIRES");
  const [cuitError, setCuitError] = useState("");

  const queryEffective = (localSearch || searchQuery).toLowerCase().trim();

  const filteredFactories = useMemo(() => {
    return factories.filter((f) => {
      if (queryEffective) {
        const text = `${f.empresa} ${f.razonSocial} ${f.cuit} ${f.contactoComercial} ${f.usuario} ${f.email}`.toLowerCase();
        if (!text.includes(queryEffective)) return false;
      }
      if (rubroFilter !== "TODOS" && f.rubroPrincipal !== rubroFilter && f.rubroPrincipal !== "Ambos") {
        return false;
      }
      return true;
    });
  }, [factories, queryEffective, rubroFilter]);

  const togglePasswordVisibility = (id: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenCreate = () => {
    setEditingFactory(null);
    setFormEmpresa("");
    setFormRazonSocial("");
    setFormCuit("");
    setFormContacto("");
    setFormWhatsapp("");
    setFormEmail("");
    setFormUsuario("");
    setFormClaveActiva("");
    setFormRubro("Insumos");
    setFormEstado("ACTIVO");
    setFormLocalidad("");
    setFormProvincia("BUENOS AIRES");
    setCuitError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: FactoryAccount) => {
    setEditingFactory(f);
    setFormEmpresa(f.empresa);
    setFormRazonSocial(f.razonSocial);
    setFormCuit(f.cuit);
    setFormContacto(f.contactoComercial);
    setFormWhatsapp(f.whatsapp);
    setFormEmail(f.email);
    setFormUsuario(f.usuario);
    setFormClaveActiva(f.claveActiva);
    setFormRubro(f.rubroPrincipal || "Insumos");
    setFormEstado(f.estado);
    setFormLocalidad(f.localidad || "");
    setFormProvincia(f.provincia || "BUENOS AIRES");
    setCuitError("");
    setIsModalOpen(true);
  };

  const handleEmpresaChange = (val: string) => {
    setFormEmpresa(val);
    if (!editingFactory) {
      const clean = val.toLowerCase().replace(/[^a-z0-9]/g, "");
      setFormUsuario(`fab.${clean}`);
      setFormClaveActiva(`${clean}.2026`);
    }
  };

  const handleCuitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCuit(e.target.value);
    setFormCuit(formatted);
    if (formatted.length === 13) {
      if (!validateCuitModulo11(formatted)) {
        setCuitError("CUIT inválido (falló validación AFIP dígito verificador)");
      } else {
        setCuitError("");
      }
    } else {
      setCuitError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formEmpresa.trim()) return alert("Por favor ingresá el nombre de la empresa");
    if (!formUsuario.trim()) return alert("El usuario es requerido");
    if (!formClaveActiva.trim()) return alert("La clave activa es requerida");

    if (editingFactory) {
      updateFactory(editingFactory.id, {
        empresa: formEmpresa.toUpperCase().trim(),
        razonSocial: formRazonSocial.trim(),
        cuit: formCuit.trim(),
        contactoComercial: formContacto.trim(),
        whatsapp: formWhatsapp.trim(),
        email: formEmail.trim(),
        usuario: formUsuario.toLowerCase().trim(),
        claveActiva: formClaveActiva.trim(),
        rubroPrincipal: formRubro,
        estado: formEstado,
        localidad: formLocalidad.trim(),
        provincia: formProvincia,
      });
    } else {
      addFactory({
        empresa: formEmpresa.toUpperCase().trim(),
        razonSocial: formRazonSocial.trim(),
        cuit: formCuit.trim(),
        contactoComercial: formContacto.trim(),
        whatsapp: formWhatsapp.trim(),
        email: formEmail.trim(),
        usuario: formUsuario.toLowerCase().trim(),
        claveActiva: formClaveActiva.trim(),
        rubroPrincipal: formRubro,
        estado: formEstado,
        localidad: formLocalidad.trim(),
        provincia: formProvincia,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de dar de baja la cuenta de fábrica de "${name}"?`)) {
      deleteFactory(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-campo-green-50 text-campo-green-700">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                6. Fábricas & Empresas Aliadas ({factories.length})
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Gestión de cuentas proveedoras, credenciales <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">fab.empresa</code>, claves activas y mirada del otro lado del mostrador.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportFactoriesExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-campo-green-600 hover:bg-campo-green-500 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Fábrica</span>
          </button>
        </div>
      </div>

      {/* Métricas rápidas del ecosistema de fábricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Fábricas Activas</span>
            <Building2 className="w-4 h-4 text-campo-green-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {factories.filter((f) => f.estado === "ACTIVO").length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">de {factories.length} registradas</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Productos en Portal</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {factoryProducts.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">catálogo sincronizado</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Cotizaciones Derivadas</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {factoryQuotations.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {factoryQuotations.filter((q) => q.estado === "COTIZADA_POR_FABRICA").length} respondidas
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Ventas en Tránsito</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {factorySales.filter((s) => s.estado === "EN_TRANSITO").length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">con remito y factura</div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtro */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Buscar fábrica, CUIT, contacto, usuario..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-campo-green-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Rubro:</span>
          <select
            value={rubroFilter}
            onChange={(e) => setRubroFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-campo-green-500"
          >
            <option value="TODOS">Todos los rubros</option>
            <option value="Insumos">Insumos</option>
            <option value="Semillas">Semillas</option>
            <option value="Ambos">Ambos</option>
          </select>
        </div>
      </div>

      {/* Tabla de Fábricas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Empresa / Razón Social</th>
                <th className="py-3 px-4">CUIT & Ubicación</th>
                <th className="py-3 px-4">Contacto Comercial</th>
                <th className="py-3 px-4">Usuario de Acceso</th>
                <th className="py-3 px-4">Clave Activa</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredFactories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No se encontraron fábricas con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredFactories.map((fab) => {
                  const isPassVisible = !!showPasswordMap[fab.id];

                  return (
                    <tr key={fab.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Empresa */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                          <span>{fab.empresa}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {fab.rubroPrincipal || "Insumos"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{fab.razonSocial}</div>
                      </td>

                      {/* CUIT & Localidad */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-semibold text-slate-800">{fab.cuit}</div>
                        <div className="text-[11px] text-slate-500">
                          {fab.localidad ? `${fab.localidad}, ` : ""}{fab.provincia || "Argentina"}
                        </div>
                      </td>

                      {/* Contacto */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{fab.contactoComercial || "-"}</div>
                        <div className="flex items-center gap-3 mt-1 text-slate-500 text-[11px]">
                          {fab.whatsapp && (
                            <span className="flex items-center gap-1 text-emerald-700">
                              <Phone className="w-3 h-3" />
                              {fab.whatsapp}
                            </span>
                          )}
                          {fab.email && (
                            <span className="flex items-center gap-1 text-slate-600">
                              <Mail className="w-3 h-3" />
                              {fab.email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Usuario */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-campo-green-800 bg-campo-green-50 px-2 py-1 rounded-md border border-campo-green-200">
                          {fab.usuario}
                        </span>
                      </td>

                      {/* Clave Activa (Visible y Editable) */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-2 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-mono font-bold text-slate-900">
                            {isPassVisible ? fab.claveActiva : "••••••••"}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(fab.id)}
                            className="text-slate-400 hover:text-slate-600 p-0.5"
                            title={isPassVisible ? "Ocultar clave" : "Ver clave activa"}
                          >
                            {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            fab.estado === "ACTIVO"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              fab.estado === "ACTIVO" ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />
                          {fab.estado}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Botón: Ingresar como Fábrica (Mirada del otro lado del mostrador) */}
                          <button
                            type="button"
                            onClick={() => viewAsFactory(fab.empresa)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow-xs cursor-pointer"
                            title={`Ingresar al Panel como ${fab.empresa} (mirada del otro lado del mostrador)`}
                          >
                            <span>Ver Fábrica</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(fab)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                            title="Editar Datos y Clave"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(fab.id, fab.empresa)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                            title="Dar de Baja Fábrica"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar Fábrica */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header Modal */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-campo-green-400" />
                <h3 className="text-lg font-bold">
                  {editingFactory ? `Editar Fábrica: ${editingFactory.empresa}` : "Alta de Nueva Fábrica Aliada"}
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

            {/* Contenido Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre Comercial Empresa */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre Empresa (Fijo) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formEmpresa}
                    onChange={(e) => handleEmpresaChange(e.target.value)}
                    placeholder="Ej: ADAMA, INSUAGRO, BAYER..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-campo-green-500 font-bold uppercase"
                  />
                  <span className="text-[10px] text-slate-400">
                    Quedará fijo e inmutable en el panel de la empresa.
                  </span>
                </div>

                {/* Rubro */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rubro Principal *
                  </label>
                  <select
                    value={formRubro}
                    onChange={(e) => setFormRubro(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-campo-green-500"
                  >
                    <option value="Insumos">Insumos Agrícolas</option>
                    <option value="Semillas">Semillas</option>
                    <option value="Ambos">Ambos (Insumos & Semillas)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1a. Razón Social */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    1a. Razón Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={formRazonSocial}
                    onChange={(e) => setFormRazonSocial(e.target.value)}
                    placeholder="Ej: ADAMA ARGENTINA S.A."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-campo-green-500"
                  />
                </div>

                {/* 1b. CUIT */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    1b. CUIT Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCuit}
                    onChange={handleCuitChange}
                    placeholder="30-XXXXXXXX-X"
                    maxLength={13}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-campo-green-500"
                  />
                  {cuitError && <p className="text-[11px] text-red-500 mt-0.5">{cuitError}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1c. Contacto Comercial */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    1c. Contacto Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    value={formContacto}
                    onChange={(e) => setFormContacto(e.target.value)}
                    placeholder="Apellidos y Nombres"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-campo-green-500"
                  />
                </div>

                {/* 1d. WhatsApp */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    1d. WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formWhatsapp}
                    onChange={(e) => setFormWhatsapp(e.target.value)}
                    placeholder="+54 9 11..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-campo-green-500"
                  />
                </div>

                {/* 1e. Correo Electrónico */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    1e. Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="comercial@empresa.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-campo-green-500"
                  />
                </div>
              </div>

              {/* Credenciales de Acceso */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-campo-green-600" />
                  <span>Credenciales del Panel Fábrica (Formato Oficial)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      2a. Usuario Fábrica (fab.empresa) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formUsuario}
                      onChange={(e) => setFormUsuario(e.target.value)}
                      placeholder="fab.nombre"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-campo-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      2b y 2c. Clave Activa (empresa.2026) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formClaveActiva}
                      onChange={(e) => setFormClaveActiva(e.target.value)}
                      placeholder="nombre.2026"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-campo-green-500"
                    />
                    <span className="text-[10px] text-slate-400">
                      Clave visible y editable directamente por Campo Directo.
                    </span>
                  </div>
                </div>
              </div>

              {/* Estado y Ubicación */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Localidad
                  </label>
                  <input
                    type="text"
                    value={formLocalidad}
                    onChange={(e) => setFormLocalidad(e.target.value)}
                    placeholder="Ej: Vicente López"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-campo-green-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Provincia
                  </label>
                  <input
                    type="text"
                    value={formProvincia}
                    onChange={(e) => setFormProvincia(e.target.value)}
                    placeholder="Ej: BUENOS AIRES"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-campo-green-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado de la Cuenta
                  </label>
                  <select
                    value={formEstado}
                    onChange={(e) => setFormEstado(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-campo-green-500"
                  >
                    <option value="ACTIVO">ACTIVO (Permitir Ingreso)</option>
                    <option value="INACTIVO">INACTIVO (Bloquear)</option>
                  </select>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-campo-green-600 hover:bg-campo-green-500 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
                >
                  {editingFactory ? "Guardar Cambios" : "Crear Fábrica"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
