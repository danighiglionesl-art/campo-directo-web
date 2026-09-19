"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Send,
  Search,
  Plus,
  FileSpreadsheet,
  FileText,
  Paperclip,
  Eye,
  Trash2,
  Calendar,
  DollarSign,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Building2,
  Upload,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import {
  AdminQuotationSent,
  CommercialProposalItem,
  CommercialAttachment,
  AdminQuotationReceived,
} from "@/types/admin";
import { Logo } from "@/components/ui/Logo";
import { generateProposalPdf } from "@/utils/quotationPdfGenerator";

export const AdminQuotationsSentTab: React.FC<{
  initialReplyingQuote?: AdminQuotationReceived | null;
  isOpenCreateModal?: boolean;
  onCloseCreateModal?: () => void;
}> = ({ initialReplyingQuote, isOpenCreateModal, onCloseCreateModal }) => {
  const {
    quotationsSent,
    addQuotationSent,
    updateQuotationSent,
    deleteQuotationSent,
    exportQuotationsSentExcel,
    clients,
    updateQuotationReceivedStatus,
    searchQuery,
  } = useAdmin();

  const [localSearch, setLocalSearch] = useState("");
  const [selectedProposal, setSelectedProposal] = useState<AdminQuotationSent | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(
    isOpenCreateModal || !!initialReplyingQuote
  );
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Formulario de Nueva Cotización Comercial
  const [formClientId, setFormClientId] = useState(
    initialReplyingQuote?.clienteId || (clients[0] ? clients[0].id : "")
  );
  const [formNumero, setFormNumero] = useState(
    `PROP-${Math.floor(9000 + Math.random() * 900)}`
  );
  const [formAsunto, setFormAsunto] = useState(
    initialReplyingQuote
      ? `Cotización en respuesta a ${initialReplyingQuote.numero}`
      : "Propuesta Comercial de Insumos - Campaña 2026/27"
  );
  const [formVencimiento, setFormVencimiento] = useState("30/09/2026");
  const [formCondicionPago, setFormCondicionPago] = useState(
    initialReplyingQuote?.formaPagoSolicitada || "Canje Cereal o e-Cheq 180 días Tasa 0%"
  );
  const [formPlazoEntrega, setFormPlazoEntrega] = useState(
    "Entrega inmediata en campo dentro de los 5 días de confirmación"
  );
  const [formObservaciones, setFormObservaciones] = useState(
    "Precios directos de fábrica sin intermediarios. Flete bonificado puesto en campo."
  );

  // Renglones de productos a cotizar
  const [items, setItems] = useState<CommercialProposalItem[]>(
    initialReplyingQuote && initialReplyingQuote.items?.length > 0
      ? initialReplyingQuote.items.map((it, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          descripcion: `${it.nombre} (${it.categoriaOVariedad}) - ${it.empresa}`,
          cantidad: `${it.cantidad} ${it.unidad}`,
          precioUnitarioUsd: 35.0,
          subtotalUsd: (it.cantidad || 1) * 35.0,
        }))
      : [
          {
            id: "item-1",
            descripcion: "Arsonex Herbicida (Imazamox) - AGROSUMA",
            cantidad: "120 Lts",
            precioUnitarioUsd: 32.5,
            subtotalUsd: 3900,
          },
          {
            id: "item-2",
            descripcion: "DM 46E26 SE Semilla Soja Don Mario Enlist",
            cantidad: "40 Bolsas",
            precioUnitarioUsd: 55.0,
            subtotalUsd: 2200,
          },
        ]
  );

  // Archivo Adjunto (documento PDF / Excel)
  const [attachment, setAttachment] = useState<CommercialAttachment | null>({
    nombre: `Cotizacion_Oficial_CD_${formNumero}.pdf`,
    tamanoKb: 310,
    tipo: "pdf",
    fechaSubida: "19/09/2026 10:00",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Calcular total acumulado en USD
  const totalUsdCalculated = useMemo(() => {
    return items.reduce((acc, it) => acc + (Number(it.subtotalUsd) || 0), 0);
  }, [items]);

  const queryEffective = (localSearch || searchQuery).toLowerCase().trim();

  const filteredProposals = useMemo(() => {
    if (!queryEffective) return quotationsSent;
    return quotationsSent.filter((p) => {
      const text = `${p.numero} ${p.clienteNombre} ${p.clienteCuit} ${p.asunto} ${p.condicionPago}`.toLowerCase();
      const itemsText = p.items.map((i) => i.descripcion).join(" ").toLowerCase();
      return text.includes(queryEffective) || itemsText.includes(queryEffective);
    });
  }, [quotationsSent, queryEffective]);

  // Manejar cambio en renglones
  const handleItemChange = (
    index: number,
    field: keyof CommercialProposalItem,
    value: string | number
  ) => {
    const updated = [...items];
    const current = { ...updated[index] };

    if (field === "descripcion") {
      current.descripcion = String(value);
    } else if (field === "cantidad") {
      current.cantidad = String(value);
    } else if (field === "precioUnitarioUsd") {
      const num = parseFloat(String(value)) || 0;
      current.precioUnitarioUsd = num;
      // Tratar de parsear cantidad numérica si es posible
      const qtyNumber = parseFloat(current.cantidad) || 1;
      current.subtotalUsd = Math.round(qtyNumber * num * 100) / 100;
    } else if (field === "subtotalUsd") {
      current.subtotalUsd = parseFloat(String(value)) || 0;
    }

    updated[index] = current;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        descripcion: "",
        cantidad: "100 Lts",
        precioUnitarioUsd: 10.0,
        subtotalUsd: 1000.0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Adjuntar archivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const tipoNormalized: CommercialAttachment["tipo"] =
        ext === "xlsx" || ext === "xls"
          ? "xlsx"
          : ext === "doc" || ext === "docx"
          ? "doc"
          : ext === "png" || ext === "jpg"
          ? "img"
          : "pdf";

      setAttachment({
        nombre: file.name,
        tamanoKb: Math.round(file.size / 1024) || 150,
        tipo: tipoNormalized,
        fechaSubida: new Date().toLocaleString("es-AR"),
      });
    }
  };

  const handleSaveProposal = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCli = clients.find((c) => c.id === formClientId) || clients[0];
    if (!selectedCli) {
      alert("Por favor seleccioná un cliente destinatario.");
      return;
    }

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now.getFullYear()}`;

    addQuotationSent({
      numero: formNumero,
      fechaEmision: formattedDate,
      fechaVencimiento: formVencimiento,
      clienteId: selectedCli.id,
      clienteNombre: selectedCli.razonSocial,
      clienteCuit: selectedCli.cuit,
      clienteEmail: selectedCli.email,
      asunto: formAsunto,
      estado: "VIGENTE",
      totalUsd: totalUsdCalculated,
      condicionPago: formCondicionPago,
      plazoEntrega: formPlazoEntrega,
      items,
      observaciones: formObservaciones,
      archivoAdjunto: attachment || undefined,
      cotizacionRecibidaRelacionadaId: initialReplyingQuote?.id,
    });

    // Si respondía a una cotización recibida, actualizar su estado a COTIZADA
    if (initialReplyingQuote) {
      updateQuotationReceivedStatus(initialReplyingQuote.id, "COTIZADA");
    }

    alert(`¡Cotización ${formNumero} generada, adjuntada y enviada con éxito! Ya se encuentra visible para el cliente.`);
    setIsCreateOpen(false);
    if (onCloseCreateModal) onCloseCreateModal();
  };

  const handleDelete = (id: string, numero: string) => {
    if (confirm(`¿Eliminar la cotización comercial enviada ${numero}?`)) {
      deleteQuotationSent(id);
      if (selectedProposal?.id === id) setSelectedProposal(null);
    }
  };

  const handlePrint = () => {
    if (selectedProposal) {
      generateProposalPdf(selectedProposal);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Send className="w-6 h-6 text-campo-green-600" />
            <h1 className="text-xl font-bold text-slate-900">
              3. Cotizaciones Enviadas & Adjuntos ({quotationsSent.length})
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Propuestas comerciales emitidas por Campo Directo para los productores, con cálculo en USD, plazos y documentos PDF/Excel adjuntos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={exportQuotationsSentExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFormNumero(`PROP-${Math.floor(9000 + Math.random() * 900)}`);
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-campo-green-600 hover:bg-campo-green-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Generar y Adjuntar Cotización</span>
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
            placeholder="Buscar por N° propuesta, cliente, CUIT..."
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

        <span className="text-xs text-slate-500">
          Mostrando <strong>{filteredProposals.length}</strong> propuestas comerciales
        </span>
      </div>

      {/* Tabla de Cotizaciones Enviadas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">N° Propuesta & Fecha</th>
                <th className="py-3 px-4">Cliente / CUIT</th>
                <th className="py-3 px-4">Asunto Comercial</th>
                <th className="py-3 px-4">Monto Total USD</th>
                <th className="py-3 px-4">Condición de Pago</th>
                <th className="py-3 px-4">Adjunto</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    {quotationsSent.length === 0 ? (
                      <div className="space-y-2">
                        <p className="font-semibold text-slate-700">Aún no se han emitido propuestas comerciales.</p>
                        <p className="text-xs text-slate-400">Podés crear una cotización formal con el botón &ldquo;+ Nueva Cotización Comercial&rdquo;.</p>
                      </div>
                    ) : (
                      "No se encontraron propuestas comerciales emitidas que coincidan con la búsqueda."
                    )}
                  </td>
                </tr>
              ) : (
                filteredProposals.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 bg-campo-green-50 text-campo-green-800 border border-campo-green-200 px-2 py-0.5 rounded block w-fit">
                        {p.numero}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Emisión: {p.fechaEmision}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{p.clienteNombre}</div>
                      <div className="text-[11px] text-slate-500">CUIT: {p.clienteCuit}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 truncate">{p.asunto}</div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {p.items?.length} renglones cotizados
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-sm font-extrabold text-slate-900">
                        USD ${p.totalUsd.toLocaleString("es-AR")}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        Vence: {p.fechaVencimiento}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-[160px] truncate text-slate-700">
                      {p.condicionPago}
                    </td>

                    <td className="py-3.5 px-4">
                      {p.archivoAdjunto ? (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
                          <Paperclip className="w-3 h-3 text-amber-700" />
                          <span className="truncate max-w-[90px]">{p.archivoAdjunto.nombre}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Sin adjunto</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.estado === "VIGENTE"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.estado === "ACEPTADA"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {p.estado}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedProposal(p)}
                          title="Ver Ficha y Comprobante"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProposal(p);
                            generateProposalPdf(p);
                          }}
                          title="Descargar PDF Oficial"
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.numero)}
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

      {/* MODAL 1: FORMULARIO GENERADOR Y ADJUNTADOR DE COTIZACIÓN */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-campo-green-900 to-slate-900 text-white rounded-t-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                  Generador de Cotización Oficial
                </span>
                <h2 className="text-lg font-bold text-white mt-1">
                  Emitir y Adjuntar Cotización Comercial
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProposal} className="p-6 space-y-5 text-xs">
              {/* Bloque Destinatario & Datos Generales */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Cliente Productor Destinatario *
                  </label>
                  <select
                    value={formClientId}
                    onChange={(e) => setFormClientId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-800"
                  >
                    {clients.length === 0 ? (
                      <option value="">(No hay productores registrados aún - creá uno primero)</option>
                    ) : (
                      clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.razonSocial} (CUIT: {c.cuit}) &bull; {c.localidad}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">N° de Cotización *</label>
                  <input
                    type="text"
                    required
                    value={formNumero}
                    onChange={(e) => setFormNumero(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Asunto / Descripción Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    value={formAsunto}
                    onChange={(e) => setFormAsunto(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Fecha de Vencimiento de la Oferta *
                  </label>
                  <input
                    type="text"
                    required
                    value={formVencimiento}
                    onChange={(e) => setFormVencimiento(e.target.value)}
                    placeholder="DD/MM/AAAA"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {/* Renglones de Productos / Insumos Valorizados */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Renglones de Insumos / Semillas / Granos Valorizados
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1 rounded bg-campo-green-600 hover:bg-campo-green-500 text-white font-bold text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Agregar Renglón</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {items.map((it, idx) => (
                    <div
                      key={it.id}
                      className="p-3 bg-white rounded-lg border border-slate-200 grid grid-cols-12 gap-2 items-center"
                    >
                      <div className="col-span-5">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          Descripción Producto / Marca
                        </label>
                        <input
                          type="text"
                          required
                          value={it.descripcion}
                          onChange={(e) => handleItemChange(idx, "descripcion", e.target.value)}
                          placeholder="Ej: Glifosato 66% x 200 Lts"
                          className="w-full p-1.5 rounded border border-slate-300 text-xs"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          Cantidad & Unidad
                        </label>
                        <input
                          type="text"
                          required
                          value={it.cantidad}
                          onChange={(e) => handleItemChange(idx, "cantidad", e.target.value)}
                          placeholder="100 Lts / Tn"
                          className="w-full p-1.5 rounded border border-slate-300 text-xs"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          Unitario USD
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={it.precioUnitarioUsd}
                          onChange={(e) =>
                            handleItemChange(idx, "precioUnitarioUsd", e.target.value)
                          }
                          className="w-full p-1.5 rounded border border-slate-300 text-xs font-mono"
                        />
                      </div>

                      <div className="col-span-2 text-right">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          Subtotal USD
                        </label>
                        <span className="font-mono font-bold text-slate-900 block py-1.5">
                          ${it.subtotalUsd.toLocaleString("es-AR")}
                        </span>
                      </div>

                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length <= 1}
                          title="Eliminar renglón"
                          className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total de la Cotización */}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center px-2">
                  <span className="font-bold text-slate-700 text-sm">
                    VALOR TOTAL DE LA OFERTA:
                  </span>
                  <span className="text-xl font-extrabold text-campo-green-800 font-mono">
                    USD ${totalUsdCalculated.toLocaleString("es-AR")}
                  </span>
                </div>
              </div>

              {/* Condiciones comerciales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Condición de Pago Pactada
                  </label>
                  <input
                    type="text"
                    value={formCondicionPago}
                    onChange={(e) => setFormCondicionPago(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Plazo y Modalidad de Entrega
                  </label>
                  <input
                    type="text"
                    value={formPlazoEntrega}
                    onChange={(e) => setFormPlazoEntrega(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {/* SECCIÓN ADJUNTAR ARCHIVO (PDF / EXCEL / ORDEN) */}
              <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-amber-950 flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-amber-700" />
                    Adjuntar Archivo de Cotización (PDF / Planilla Excel / Orden)
                  </h4>
                  <span className="text-[10px] text-amber-800 font-semibold">
                    Visible para descarga por el cliente
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.xlsx,.xls,.doc,.docx,.png,.jpg"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Seleccionar Archivo Local</span>
                  </button>

                  {attachment ? (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-amber-200 text-slate-800">
                      <FileText className="w-4 h-4 text-amber-600" />
                      <span className="font-bold">{attachment.nombre}</span>
                      <span className="text-[10px] text-slate-500">
                        ({attachment.tamanoKb} KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => setAttachment(null)}
                        className="text-red-500 hover:text-red-700 ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-500 text-[11px] italic">
                      Ningún archivo adjunto seleccionado aún.
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Observaciones Comerciales / Legales
                </label>
                <textarea
                  rows={2}
                  value={formObservaciones}
                  onChange={(e) => setFormObservaciones(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-campo-green-600 hover:bg-campo-green-500 text-white font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Guardar y Enviar al Portal del Cliente</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VISTA DETALLADA / COMPROBANTE OFICIAL IMPRIMIBLE */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            {/* Barra superior de control */}
            <div className="p-4 bg-slate-900 text-white rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-campo-yellow" />
                <span className="font-bold text-sm">
                  Comprobante Oficial: {selectedProposal.numero}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProposal(null)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Plantilla Membretada Oficial Imprimible */}
            <div className="p-8 space-y-6 text-slate-900 print:p-0">
              {/* Membrete Oficial */}
              <div className="border-b-2 border-campo-green-600 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <Logo width={160} height={40} />
                  <p className="text-xs text-slate-500 mt-1">
                    Soluciones Directas para el Agro Argentino
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Río Cuarto, Córdoba &bull; campodirecto.ar
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-mono text-xl font-black text-slate-900">
                    {selectedProposal.numero}
                  </div>
                  <div className="text-xs text-slate-600">
                    Emisión: <strong>{selectedProposal.fechaEmision}</strong>
                  </div>
                  <div className="text-xs text-red-600 font-semibold">
                    Validez hasta: <strong>{selectedProposal.fechaVencimiento}</strong>
                  </div>
                </div>
              </div>

              {/* Datos del Cliente Destinatario */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-bold">
                    Cliente / Destinatario
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedProposal.clienteNombre}
                  </span>
                  <p className="text-slate-600 mt-0.5">CUIT: {selectedProposal.clienteCuit}</p>
                </div>

                <div>
                  <span className="text-slate-400 block uppercase text-[10px] font-bold">
                    Asunto Comercial
                  </span>
                  <span className="font-semibold text-slate-800">{selectedProposal.asunto}</span>
                  <p className="text-slate-500 mt-0.5">
                    Condición: {selectedProposal.condicionPago}
                  </p>
                </div>
              </div>

              {/* Tabla de Renglones Cotizados */}
              <div>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Descripción Producto / Insumo</th>
                      <th className="py-2.5 px-3 text-center">Cantidad</th>
                      <th className="py-2.5 px-3 text-right">Precio Unit. (USD)</th>
                      <th className="py-2.5 px-3 text-right">Subtotal (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedProposal.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {it.descripcion}
                        </td>
                        <td className="py-2.5 px-3 text-center">{it.cantidad}</td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          ${it.precioUnitarioUsd.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          ${it.subtotalUsd.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold text-slate-900">
                    <tr>
                      <td colSpan={4} className="py-3 px-3 text-right text-sm">
                        TOTAL PRESUPUESTO COMERCIAL (USD):
                      </td>
                      <td className="py-3 px-3 text-right text-base text-campo-green-800 font-mono font-black">
                        ${selectedProposal.totalUsd.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Condiciones y Archivo Adjunto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <h4 className="font-bold text-slate-900 uppercase text-[10px] text-slate-500">
                    Pautas Comerciales
                  </h4>
                  <p>
                    <strong>Forma de Pago:</strong> {selectedProposal.condicionPago}
                  </p>
                  <p>
                    <strong>Plazo de Entrega:</strong> {selectedProposal.plazoEntrega}
                  </p>
                  {selectedProposal.observaciones && (
                    <p className="text-slate-600 mt-1 italic">
                      &ldquo;{selectedProposal.observaciones}&rdquo;
                    </p>
                  )}
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <h4 className="font-bold text-slate-900 uppercase text-[10px] text-slate-500">
                    Documento Oficial Adjunto
                  </h4>
                  {selectedProposal.archivoAdjunto ? (
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-700" />
                        <div>
                          <p className="font-bold text-slate-900 text-xs truncate max-w-[180px]">
                            {selectedProposal.archivoAdjunto.nombre}
                          </p>
                          <span className="text-[10px] text-slate-500">
                            {selectedProposal.archivoAdjunto.tamanoKb} KB &bull; Adjuntado el{" "}
                            {selectedProposal.archivoAdjunto.fechaSubida}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          alert(`Descargando comprobante adjunto: ${selectedProposal.archivoAdjunto?.nombre}`)
                        }
                        className="p-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold"
                        title="Descargar archivo adjunto"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No se adjuntó archivo adicional.</p>
                  )}
                </div>
              </div>

              {/* Pie con firmas */}
              <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
                <div>
                  <p className="font-bold text-slate-800">Campo Directo SRL</p>
                  <p>Departamento de Comercialización Agropecuaria</p>
                </div>
                <div className="text-right">
                  <div className="w-36 border-b border-slate-400 mb-1" />
                  <p className="font-semibold text-slate-700">Firma Comercial Autorizada</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-b-2xl border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedProposal(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
