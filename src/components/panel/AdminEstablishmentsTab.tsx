"use client";

import React, { useState, useMemo } from "react";
import {
  MapPin,
  Search,
  Plus,
  FileSpreadsheet,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  Building2,
  X,
  Compass,
  Layers,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminEstablishment } from "@/types/admin";
import { ARGENTINE_PROVINCES } from "@/data/quotationHelper";

export const AdminEstablishmentsTab: React.FC = () => {
  const {
    establishments,
    addEstablishment,
    updateEstablishment,
    deleteEstablishment,
    exportEstablishmentsExcel,
    clients,
    searchQuery,
  } = useAdmin();

  const [localSearch, setLocalSearch] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("TODAS");
  const [activityFilter, setActivityFilter] = useState("TODAS");
  const [selectedEst, setSelectedEst] = useState<AdminEstablishment | null>(null);
  const [estToEdit, setEstToEdit] = useState<AdminEstablishment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulario
  const [formData, setFormData] = useState<Partial<AdminEstablishment>>({
    clienteId: clients[0]?.id || "",
    clienteNombre: clients[0]?.razonSocial || "",
    clienteCuit: clients[0]?.cuit || "",
    nombre: "",
    provincia: "Córdoba",
    localidad: "",
    hectareas: 350,
    actividad: "Agrícola",
    referenciaAcceso: "",
    coordenadasGps: "",
    tipoDescarga: "Tranquera de campo / Tolva / Silobolsa",
    esPrincipal: false,
  });

  const queryEffective = (localSearch || searchQuery).toLowerCase().trim();

  const filteredEstablishments = useMemo(() => {
    return establishments.filter((e) => {
      if (queryEffective) {
        const text = `${e.nombre} ${e.clienteNombre} ${e.localidad} ${e.provincia} ${e.referenciaAcceso}`.toLowerCase();
        if (!text.includes(queryEffective)) return false;
      }
      if (provinceFilter !== "TODAS" && e.provincia !== provinceFilter) {
        return false;
      }
      if (activityFilter !== "TODAS" && e.actividad !== activityFilter) {
        return false;
      }
      return true;
    });
  }, [establishments, queryEffective, provinceFilter, activityFilter]);

  const handleOpenNew = () => {
    const firstClient = clients[0];
    setFormData({
      clienteId: firstClient?.id || "",
      clienteNombre: firstClient?.razonSocial || "",
      clienteCuit: firstClient?.cuit || "",
      nombre: "",
      provincia: "Córdoba",
      localidad: "",
      hectareas: 300,
      actividad: "Agrícola",
      referenciaAcceso: "",
      coordenadasGps: "",
      tipoDescarga: "Tranquera de campo / Tolva / Silobolsa",
      esPrincipal: false,
    });
    setEstToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (est: AdminEstablishment) => {
    setEstToEdit(est);
    setFormData(est);
    setIsModalOpen(true);
  };

  const handleSaveEstablishment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre?.trim() || !formData.localidad?.trim()) {
      alert("Por favor completá el Nombre del campo y la Localidad.");
      return;
    }

    const clientMatch = clients.find((c) => c.id === formData.clienteId);
    const resolvedName = clientMatch ? clientMatch.razonSocial : formData.clienteNombre || "Productor Directo";
    const resolvedCuit = clientMatch ? clientMatch.cuit : formData.clienteCuit || "";

    const payload = {
      ...formData,
      clienteNombre: resolvedName,
      clienteCuit: resolvedCuit,
    } as Omit<AdminEstablishment, "id">;

    if (estToEdit) {
      updateEstablishment(estToEdit.id, payload);
    } else {
      addEstablishment(payload);
    }

    setIsModalOpen(false);
    setEstToEdit(null);
  };

  const handleDelete = (id: string, nombre: string) => {
    if (confirm(`¿Eliminar el establecimiento "${nombre}"?`)) {
      deleteEstablishment(id);
      if (selectedEst?.id === id) setSelectedEst(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-campo-green-600" />
            <h1 className="text-xl font-bold text-slate-900">
              4. Establecimientos Registrados ({establishments.length})
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Campos, estancias y lotes de descarga georreferenciados con satélite GPS y puntos de acceso para transporte pesado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={exportEstablishmentsExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-campo-green-600 hover:bg-campo-green-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Establecimiento</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Buscar por campo, titular, localidad..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-campo-green-500"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            className="p-2 text-xs rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
          >
            <option value="TODAS">Todas las Provincias</option>
            {ARGENTINE_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="p-2 text-xs rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
          >
            <option value="TODAS">Todas las Actividades</option>
            <option value="Agrícola">Agrícola</option>
            <option value="Ganadero">Ganadero</option>
            <option value="Mixto">Mixto</option>
            <option value="Servicios Agropecuarios">Servicios Agropecuarios</option>
          </select>
        </div>

        <span className="text-xs text-slate-500">
          Mostrando <strong>{filteredEstablishments.length}</strong> establecimientos
        </span>
      </div>

      {/* Tabla de Establecimientos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Establecimiento & Titular</th>
                <th className="py-3 px-4">Ubicación</th>
                <th className="py-3 px-4">Superficie</th>
                <th className="py-3 px-4">Actividad</th>
                <th className="py-3 px-4">Tipo de Descarga</th>
                <th className="py-3 px-4">GPS Satelital</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEstablishments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    {establishments.length === 0 ? (
                      <div className="space-y-2">
                        <p className="font-semibold text-slate-700">Aún no hay establecimientos registrados en el sistema.</p>
                        <p className="text-xs text-slate-400">Podés dar de alta un campo con el botón &ldquo;+ Nuevo Establecimiento&rdquo; o esperar que los productores los asocien.</p>
                      </div>
                    ) : (
                      "No se encontraron establecimientos registrados con esos filtros."
                    )}
                  </td>
                </tr>
              ) : (
                filteredEstablishments.map((est) => (
                  <tr key={est.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <span>{est.nombre}</span>
                        {est.esPrincipal && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-campo-green-100 text-campo-green-800 font-semibold">
                            Principal
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Titular: <strong>{est.clienteNombre}</strong>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">
                        {est.localidad}, {est.provincia}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {est.referenciaAcceso}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">
                        {est.hectareas.toLocaleString("es-AR")}
                      </span>{" "}
                      <span className="text-slate-500">Has.</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                        {est.actividad}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-[170px] truncate">
                      {est.tipoDescarga || "Tranquera de campo"}
                    </td>

                    <td className="py-3.5 px-4">
                      {est.coordenadasGps ? (
                        <a
                          href={
                            est.linkMaps ||
                            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              est.coordenadasGps
                            )}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition-colors"
                          title="Abrir ubicación en Google Maps"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Ver Mapa</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Sin GPS</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedEst(est)}
                          title="Ver Ficha Detallada"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(est)}
                          title="Editar"
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(est.id, est.nombre)}
                          title="Eliminar"
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: FICHA COMPLETA DEL ESTABLECIMIENTO */}
      {selectedEst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-purple-900 to-slate-900 text-white rounded-t-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                  Ficha de Establecimiento
                </span>
                <h2 className="text-lg font-bold text-white mt-1">{selectedEst.nombre}</h2>
                <p className="text-xs text-purple-200">
                  Titular: {selectedEst.clienteNombre}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEst(null)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Superficie Productiva
                  </span>
                  <span className="font-extrabold text-base text-slate-900">
                    {selectedEst.hectareas.toLocaleString("es-AR")} Hectáreas
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Actividad
                  </span>
                  <span className="font-bold text-purple-800">{selectedEst.actividad}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Ubicación Geográfica
                </span>
                <p className="font-semibold text-slate-800 text-sm">
                  {selectedEst.localidad}, Provincia de {selectedEst.provincia}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Referencias de Acceso para Camiones y Tolvas
                </span>
                <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-950 font-medium">
                  {selectedEst.referenciaAcceso || "Sin referencias adicionales registradas."}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Tipo de Descarga
                  </span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {selectedEst.tipoDescarga || "Tranquera de campo / Tolva / Silobolsa"}
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Coordenadas GPS
                  </span>
                  <p className="font-mono font-bold text-slate-800 mt-0.5">
                    {selectedEst.coordenadasGps || "No informadas"}
                  </p>
                </div>
              </div>

              {selectedEst.coordenadasGps && (
                <div className="pt-2">
                  <a
                    href={
                      selectedEst.linkMaps ||
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        selectedEst.coordenadasGps
                      )}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Abrir Ruta Satelital en Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-b-2xl border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedEst(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FORMULARIO DE ALTA O EDICIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <h2 className="text-base font-bold text-slate-900">
                {estToEdit ? "Editar Establecimiento" : "Registrar Nuevo Establecimiento"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEstablishment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Productor / Titular Asignado *
                </label>
                <select
                  value={formData.clienteId}
                  onChange={(e) => {
                    const sel = clients.find((c) => c.id === e.target.value);
                    setFormData({
                      ...formData,
                      clienteId: e.target.value,
                      clienteNombre: sel?.razonSocial || "",
                      clienteCuit: sel?.cuit || "",
                    });
                  }}
                  className="w-full p-2 rounded-lg border border-slate-300 font-semibold text-slate-800"
                >
                  {clients.length === 0 ? (
                    <option value="">(No hay productores registrados aún - creá uno primero)</option>
                  ) : (
                    clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.razonSocial} (CUIT: {c.cuit})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nombre del Campo / Lote *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre || ""}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: La Rinconada"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Superficie (Hectáreas) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.hectareas || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, hectareas: Number(e.target.value) || 0 })
                    }
                    placeholder="Ej: 500"
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Provincia</label>
                  <select
                    value={formData.provincia || "Córdoba"}
                    onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  >
                    {ARGENTINE_PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Localidad Cercana *</label>
                  <input
                    type="text"
                    required
                    value={formData.localidad || ""}
                    onChange={(e) => setFormData({ ...formData, localidad: e.target.value })}
                    placeholder="Ej: Río Cuarto"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Actividad Productiva</label>
                  <select
                    value={formData.actividad}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        actividad: e.target.value as AdminEstablishment["actividad"],
                      })
                    }
                    className="w-full p-2 rounded-lg border border-slate-300"
                  >
                    <option value="Agrícola">Agrícola</option>
                    <option value="Ganadero">Ganadero</option>
                    <option value="Mixto">Mixto</option>
                    <option value="Servicios Agropecuarios">Servicios Agropecuarios</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Descarga</label>
                  <input
                    type="text"
                    value={formData.tipoDescarga || ""}
                    onChange={(e) => setFormData({ ...formData, tipoDescarga: e.target.value })}
                    placeholder="Tranquera / Tolva / Silos / Galpón"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Coordenadas GPS (Latitud, Longitud)
                </label>
                <input
                  type="text"
                  value={formData.coordenadasGps || ""}
                  onChange={(e) => setFormData({ ...formData, coordenadasGps: e.target.value })}
                  placeholder="-33.128450, -64.382100"
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Instrucciones de Acceso para Camiones
                </label>
                <textarea
                  rows={2}
                  value={formData.referenciaAcceso || ""}
                  onChange={(e) => setFormData({ ...formData, referenciaAcceso: e.target.value })}
                  placeholder="Ruta, km, bajada a camino de tierra, tranquera..."
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-campo-green-600 hover:bg-campo-green-500 text-white font-bold shadow-md"
                >
                  {estToEdit ? "Guardar Cambios" : "Crear Establecimiento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
