"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  FileSpreadsheet,
  MessageCircle,
  Eye,
  Edit2,
  Trash2,
  MapPin,
  Building2,
  Calendar,
  Phone,
  Mail,
  ShieldCheck,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminClient } from "@/types/admin";
import { ARGENTINE_PROVINCES } from "@/data/quotationHelper";

export const AdminUsersTab: React.FC<{
  isOpenCreateModal?: boolean;
  onCloseCreateModal?: () => void;
}> = ({ isOpenCreateModal, onCloseCreateModal }) => {
  const {
    clients,
    addClient,
    updateClient,
    deleteClient,
    exportClientsExcel,
    establishments,
    quotationsReceived,
    searchQuery,
  } = useAdmin();

  // Estados locales
  const [localSearch, setLocalSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<AdminClient | null>(null);
  const [clientToEdit, setClientToEdit] = useState<AdminClient | null>(null);
  const [isNewClientOpen, setIsNewClientOpen] = useState(isOpenCreateModal || false);

  // Formulario de alta / edición
  const [formData, setFormData] = useState<Partial<AdminClient>>({
    usuario: "",
    razonSocial: "",
    apellidos: "",
    nombres: "",
    cuit: "",
    condicionIva: "Responsable Inscripto",
    email: "",
    telefono: "",
    whatsapp: "",
    provincia: "Córdoba",
    localidad: "",
    codigoPostal: "",
    direccion: "",
    actividadPrincipal: "Producción Agrícola Extensiva",
    estado: "ACTIVO",
    notasInternas: "",
  });

  const queryEffective = (localSearch || searchQuery).toLowerCase().trim();

  const filteredClients = useMemo(() => {
    if (!queryEffective) return clients;
    return clients.filter((c) => {
      const fullText = `${c.razonSocial} ${c.nombres} ${c.apellidos} ${c.cuit} ${c.email} ${c.localidad} ${c.provincia} ${c.usuario}`.toLowerCase();
      return fullText.includes(queryEffective);
    });
  }, [clients, queryEffective]);

  const handleOpenNew = () => {
    setFormData({
      usuario: "",
      razonSocial: "",
      apellidos: "",
      nombres: "",
      cuit: "",
      condicionIva: "Responsable Inscripto",
      email: "",
      telefono: "",
      whatsapp: "",
      provincia: "Córdoba",
      localidad: "",
      codigoPostal: "",
      direccion: "",
      actividadPrincipal: "Producción Agrícola Extensiva",
      estado: "ACTIVO",
      notasInternas: "",
    });
    setClientToEdit(null);
    setIsNewClientOpen(true);
  };

  const handleOpenEdit = (client: AdminClient) => {
    setClientToEdit(client);
    setFormData(client);
    setIsNewClientOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.razonSocial?.trim() || !formData.cuit?.trim()) {
      alert("Por favor completá al menos la Razón Social y el CUIT.");
      return;
    }

    if (clientToEdit) {
      updateClient(clientToEdit.id, formData);
    } else {
      addClient(formData as Omit<AdminClient, "id" | "fechaAlta">);
    }

    setIsNewClientOpen(false);
    setClientToEdit(null);
    if (onCloseCreateModal) onCloseCreateModal();
  };

  const handleDelete = (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar el productor "${nombre}"?`)) {
      deleteClient(id);
      if (selectedClient?.id === id) setSelectedClient(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-campo-green-600" />
            <h1 className="text-xl font-bold text-slate-900">
              1. Usuarios Registrados ({clients.length})
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ficha completa de productores agropecuarios, datos fiscales, impositivos, contactos y establecimientos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={exportClientsExcel}
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
            <span>+ Registrar Nuevo Productor</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtro Rápido */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Filtrar por nombre, CUIT, localidad..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-campo-green-500"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="text-xs text-slate-500">
          Mostrando <strong>{filteredClients.length}</strong> de {clients.length} usuarios
        </span>
      </div>

      {/* Tabla de Usuarios Registrados */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Razón Social & CUIT</th>
                <th className="py-3 px-4">Titular / Contacto</th>
                <th className="py-3 px-4">Ubicación</th>
                <th className="py-3 px-4">Condición IVA</th>
                <th className="py-3 px-4">Actividad Principal</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No se encontraron productores que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const estCount = establishments.filter(
                    (e) => e.clienteId === client.id || e.clienteCuit === client.cuit
                  ).length;
                  const quotesCount = quotationsReceived.filter(
                    (q) => q.clienteCuit === client.cuit || q.clienteId === client.id
                  ).length;

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{client.razonSocial}</div>
                        <div className="font-mono text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>CUIT: {client.cuit}</span>
                          <span className="text-slate-300">&bull;</span>
                          <span className="text-slate-400">@{client.usuario}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {client.apellidos} {client.nombres}
                        </div>
                        <div className="text-slate-500 text-[11px] flex items-center gap-2 mt-0.5">
                          <span>{client.email}</span>
                          {client.telefono && <span>&bull; {client.telefono}</span>}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">
                          {client.localidad}, {client.provincia}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {estCount} campo{estCount === 1 ? "" : "s"} &bull; {quotesCount} pedido{quotesCount === 1 ? "" : "s"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {client.condicionIva}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {client.actividadPrincipal}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            client.estado === "ACTIVO"
                              ? "bg-emerald-100 text-emerald-800"
                              : client.estado === "VERIFICACIÓN PENDIENTE"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              client.estado === "ACTIVO"
                                ? "bg-emerald-600"
                                : client.estado === "VERIFICACIÓN PENDIENTE"
                                ? "bg-amber-600"
                                : "bg-slate-500"
                            }`}
                          />
                          {client.estado}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {client.whatsapp && (
                            <a
                              href={`https://wa.me/${client.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                                `Hola ${client.nombres}, te contactamos de Campo Directo sobre tu cuenta de productor.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Contactar por WhatsApp"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedClient(client)}
                            title="Ver Ficha Completa"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(client)}
                            title="Editar Datos"
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(client.id, client.razonSocial)}
                            title="Eliminar"
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700"
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

      {/* MODAL 1: FICHA COMPLETA DE USUARIO */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Cabecera Ficha */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-t-2xl flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-campo-green-600 text-white uppercase">
                    Ficha de Productor
                  </span>
                  <span className="text-xs text-slate-300">Alta: {selectedClient.fechaAlta}</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">
                  {selectedClient.razonSocial}
                </h2>
                <p className="text-xs text-slate-300">
                  Titular: {selectedClient.apellidos} {selectedClient.nombres} &bull; CUIT: {selectedClient.cuit}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido Ficha */}
            <div className="p-6 space-y-5 text-xs text-slate-700">
              {/* Bloque Fiscal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">
                    CUIT
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {selectedClient.cuit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">
                    Condición IVA
                  </span>
                  <span className="font-bold text-slate-900">{selectedClient.condicionIva}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">
                    Estado de Cuenta
                  </span>
                  <span className="font-bold text-emerald-700">{selectedClient.estado}</span>
                </div>
              </div>

              {/* Contacto Directo */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-campo-green-600" />
                  Vías de Contacto
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase">Email</span>
                    <span className="font-semibold text-slate-900 select-all">{selectedClient.email}</span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">WhatsApp</span>
                      <span className="font-semibold text-slate-900">{selectedClient.whatsapp}</span>
                    </div>
                    {selectedClient.whatsapp && (
                      <a
                        href={`https://wa.me/${selectedClient.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        Chatear
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Domicilio & Ubicación */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-campo-green-600" />
                  Domicilio Fiscal / Administración
                </h3>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p>
                    <strong>Dirección:</strong> {selectedClient.direccion || "Sin especificar"}
                  </p>
                  <p>
                    <strong>Localidad / Provincia:</strong> {selectedClient.localidad},{" "}
                    {selectedClient.provincia} {selectedClient.codigoPostal ? `(CP ${selectedClient.codigoPostal})` : ""}
                  </p>
                  <p>
                    <strong>Actividad Principal:</strong> {selectedClient.actividadPrincipal}
                  </p>
                </div>
              </div>

              {/* Establecimientos asociados */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-campo-green-600" />
                  Establecimientos Registrados
                </h3>
                {establishments.filter((e) => e.clienteId === selectedClient.id || e.clienteCuit === selectedClient.cuit).length === 0 ? (
                  <p className="text-slate-400 italic">No tiene establecimientos cargados todavía.</p>
                ) : (
                  <div className="space-y-2">
                    {establishments
                      .filter((e) => e.clienteId === selectedClient.id || e.clienteCuit === selectedClient.cuit)
                      .map((est) => (
                        <div key={est.id} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-800">{est.nombre}</span>
                            <p className="text-[11px] text-slate-500">
                              {est.hectareas} Has. &bull; {est.localidad}, {est.provincia} ({est.actividad})
                            </p>
                          </div>
                          {est.coordenadasGps && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(est.coordenadasGps)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-campo-green-700 hover:underline font-semibold"
                            >
                              Ver Mapa Satelital &rarr;
                            </a>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Notas Internas del Mostrador */}
              {selectedClient.notasInternas && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-800 mb-0.5">
                    Notas Internas del Mostrador
                  </span>
                  <p>{selectedClient.notasInternas}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-b-2xl border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  handleOpenEdit(selectedClient);
                  setSelectedClient(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
              >
                Editar Información
              </button>
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FORMULARIO DE ALTA O EDICIÓN */}
      {isNewClientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <h2 className="text-base font-bold text-slate-900">
                {clientToEdit ? "Editar Datos del Productor" : "Registrar Nuevo Productor"}
              </h2>
              <button
                type="button"
                onClick={() => setIsNewClientOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Razón Social *</label>
                  <input
                    type="text"
                    required
                    value={formData.razonSocial || ""}
                    onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                    placeholder="Ej: AGROPECUARIA PEREZ S.A."
                    className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-campo-green-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">CUIT *</label>
                  <input
                    type="text"
                    required
                    value={formData.cuit || ""}
                    onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
                    placeholder="Ej: 30-71234567-8"
                    className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-campo-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Apellidos</label>
                  <input
                    type="text"
                    value={formData.apellidos || ""}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    placeholder="Ej: PEREZ"
                    className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-campo-green-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombres</label>
                  <input
                    type="text"
                    value={formData.nombres || ""}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    placeholder="Ej: JUAN CARLOS"
                    className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-campo-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Condición IVA</label>
                  <select
                    value={formData.condicionIva}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        condicionIva: e.target.value as AdminClient["condicionIva"],
                      })
                    }
                    className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-campo-green-500"
                  >
                    <option value="Responsable Inscripto">Responsable Inscripto</option>
                    <option value="Monotributo">Monotributo</option>
                    <option value="Exento">Exento</option>
                    <option value="Consumidor Final">Consumidor Final</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Usuario Portal</label>
                  <input
                    type="text"
                    value={formData.usuario || ""}
                    onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                    placeholder="Ej: agroperez"
                    className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-campo-green-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estado: e.target.value as AdminClient["estado"],
                      })
                    }
                    className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-campo-green-500"
                  >
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="VERIFICACIÓN PENDIENTE">VERIFICACIÓN PENDIENTE</option>
                    <option value="INACTIVO">INACTIVO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-campo-green-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono || ""}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="+54 9 ..."
                    className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-campo-green-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp (con código)</label>
                  <input
                    type="text"
                    value={formData.whatsapp || ""}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="5493585095475"
                    className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-campo-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Provincia</label>
                  <select
                    value={formData.provincia || "Córdoba"}
                    onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-campo-green-500"
                  >
                    {ARGENTINE_PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Localidad</label>
                  <input
                    type="text"
                    value={formData.localidad || ""}
                    onChange={(e) => setFormData({ ...formData, localidad: e.target.value })}
                    placeholder="Ej: Río Cuarto"
                    className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-campo-green-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Código Postal</label>
                  <input
                    type="text"
                    value={formData.codigoPostal || ""}
                    onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                    placeholder="Ej: 5800"
                    className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-campo-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dirección / Ruta</label>
                <input
                  type="text"
                  value={formData.direccion || ""}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Ruta Nac. 8 Km 605"
                  className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-campo-green-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Actividad Principal</label>
                <input
                  type="text"
                  value={formData.actividadPrincipal || ""}
                  onChange={(e) => setFormData({ ...formData, actividadPrincipal: e.target.value })}
                  placeholder="Producción Agrícola Extensiva (Soja, Maíz, Trigo)"
                  className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-campo-green-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notas Internas (Solo visible para administración)</label>
                <textarea
                  rows={2}
                  value={formData.notasInternas || ""}
                  onChange={(e) => setFormData({ ...formData, notasInternas: e.target.value })}
                  placeholder="Observaciones de crédito, canjes convenidos, etc."
                  className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-campo-green-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewClientOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-campo-green-600 hover:bg-campo-green-500 text-white font-bold shadow-md"
                >
                  {clientToEdit ? "Guardar Cambios" : "Crear Productor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
