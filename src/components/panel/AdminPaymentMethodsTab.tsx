"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Plus,
  FileSpreadsheet,
  Edit2,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Percent,
  Calendar,
  X,
  Wheat,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminPaymentMethod } from "@/types/admin";

export const AdminPaymentMethodsTab: React.FC = () => {
  const {
    paymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    togglePaymentMethod,
    exportPaymentMethodsExcel,
  } = useAdmin();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [methodToEdit, setMethodToEdit] = useState<AdminPaymentMethod | null>(null);

  const [formData, setFormData] = useState<Partial<AdminPaymentMethod>>({
    codigo: "",
    nombre: "",
    categoria: "BANCARIO",
    descripcion: "",
    requisitos: "",
    tasaOInteres: "Tasa preferencial convenio",
    plazoDias: "30 a 90 días",
    activo: true,
    orden: paymentMethods.length + 1,
  });

  const handleOpenNew = () => {
    setFormData({
      codigo: "",
      nombre: "",
      categoria: "BANCARIO",
      descripcion: "",
      requisitos: "",
      tasaOInteres: "Tasa 0%",
      plazoDias: "Contado / 30 días",
      activo: true,
      orden: paymentMethods.length + 1,
    });
    setMethodToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (method: AdminPaymentMethod) => {
    setMethodToEdit(method);
    setFormData(method);
    setIsModalOpen(true);
  };

  const handleSaveMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre?.trim()) {
      alert("Por favor completá el nombre de la forma de pago.");
      return;
    }

    const codigoResolved =
      formData.codigo?.trim() ||
      formData.nombre.trim().toUpperCase().replace(/\s+/g, "_");

    const payload = {
      ...formData,
      codigo: codigoResolved,
    } as Omit<AdminPaymentMethod, "id">;

    if (methodToEdit) {
      updatePaymentMethod(methodToEdit.id, payload);
    } else {
      addPaymentMethod(payload);
    }

    setIsModalOpen(false);
    setMethodToEdit(null);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-campo-green-600" />
            <h1 className="text-xl font-bold text-slate-900">
              5. Formas de Pago ({paymentMethods.length})
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Administración de condiciones de cobro, canje de granos, e-Cheqs, convenios bancarios y diferimientos para el mostrador.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={exportPaymentMethodsExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-campo-green-600 hover:bg-campo-green-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nueva Modalidad de Pago</span>
          </button>
        </div>
      </div>

      {/* Listado de Tarjetas de Formas de Pago */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
              method.activo
                ? "bg-white border-slate-200 shadow-sm hover:shadow-md"
                : "bg-slate-50 border-slate-200 opacity-60"
            }`}
          >
            <div className="space-y-3">
              {/* Top card */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        method.categoria === "GRANOS"
                          ? "bg-amber-100 text-amber-900"
                          : method.categoria === "CHEQUES"
                          ? "bg-blue-100 text-blue-900"
                          : method.categoria === "BANCARIO"
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-purple-100 text-purple-900"
                      }`}
                    >
                      {method.categoria}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {method.codigo}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mt-1">
                    {method.nombre}
                  </h3>
                </div>

                {/* Switch Activo/Inactivo */}
                <button
                  type="button"
                  onClick={() => togglePaymentMethod(method.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    method.activo
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
                  title={method.activo ? "Haga clic para pausar" : "Haga clic para activar"}
                >
                  {method.activo ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-emerald-600" />
                      <span>Activa</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-slate-400" />
                      <span>Pausada</span>
                    </>
                  )}
                </button>
              </div>

              {/* Descripción */}
              <p className="text-xs text-slate-600 leading-relaxed">
                {method.descripcion}
              </p>

              {/* Parámetros comerciales */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block flex items-center gap-1">
                    <Percent className="w-3 h-3 text-campo-green-600" />
                    Tasa / Bonificación
                  </span>
                  <span className="font-semibold text-slate-800 text-[11px] block mt-0.5">
                    {method.tasaOInteres}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-50">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-600" />
                    Plazo Habitual
                  </span>
                  <span className="font-semibold text-slate-800 text-[11px] block mt-0.5">
                    {method.plazoDias}
                  </span>
                </div>
              </div>

              {/* Requisitos */}
              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-950 text-[11px]">
                <strong className="block font-bold text-amber-900 mb-0.5">
                  Requisitos de Calificación:
                </strong>
                {method.requisitos}
              </div>
            </div>

            {/* Footer con acciones */}
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Orden comercial: #{method.orden}</span>
              <button
                type="button"
                onClick={() => handleOpenEdit(method)}
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar Condiciones</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ALTA O EDICIÓN DE FORMA DE PAGO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <h2 className="text-base font-bold text-slate-900">
                {methodToEdit ? "Editar Forma de Pago" : "Nueva Forma de Pago"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMethod} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre de la Modalidad *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre || ""}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Canje Cereal Foward Mayo"
                  className="w-full p-2 rounded-lg border border-slate-300 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        categoria: e.target.value as AdminPaymentMethod["categoria"],
                      })
                    }
                    className="w-full p-2 rounded-lg border border-slate-300"
                  >
                    <option value="GRANOS">GRANOS (Canje)</option>
                    <option value="CHEQUES">CHEQUES (e-Cheq)</option>
                    <option value="BANCARIO">BANCARIO (Transferencia)</option>
                    <option value="TARJETA">TARJETA (Agro)</option>
                    <option value="OTRO">OTRO</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Código Único</label>
                  <input
                    type="text"
                    value={formData.codigo || ""}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="CANJE_MAYO"
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tasa o Interés Comercial
                  </label>
                  <input
                    type="text"
                    value={formData.tasaOInteres || ""}
                    onChange={(e) => setFormData({ ...formData, tasaOInteres: e.target.value })}
                    placeholder="Tasa 0% o bonificación 5%"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plazo Habitual</label>
                  <input
                    type="text"
                    value={formData.plazoDias || ""}
                    onChange={(e) => setFormData({ ...formData, plazoDias: e.target.value })}
                    placeholder="30 / 60 / 180 días"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Descripción Comercial para el Cliente
                </label>
                <textarea
                  rows={2}
                  value={formData.descripcion || ""}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Detalle los beneficios fiscales, modalidades de entrega o convenios."
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Requisitos de Calificación Crediticia
                </label>
                <textarea
                  rows={2}
                  value={formData.requisitos || ""}
                  onChange={(e) => setFormData({ ...formData, requisitos: e.target.value })}
                  placeholder="Constancia de CUIT, cuenta comitente, aval bancario..."
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activo-check"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-campo-green-600 rounded"
                />
                <label htmlFor="activo-check" className="font-bold text-slate-700">
                  Habilitar esta forma de pago en el sistema
                </label>
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
                  {methodToEdit ? "Guardar Cambios" : "Crear Forma de Pago"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
