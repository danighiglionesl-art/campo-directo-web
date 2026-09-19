"use client";

import React, { useState } from "react";
import { AdminProvider, useAdmin } from "@/context/AdminContext";
import { AdminLoginView } from "@/components/panel/AdminLoginView";
import { AdminNavigation } from "@/components/panel/AdminNavigation";
import { AdminDashboardView } from "@/components/panel/AdminDashboardView";
import { AdminUsersTab } from "@/components/panel/AdminUsersTab";
import { AdminQuotationsReceivedTab } from "@/components/panel/AdminQuotationsReceivedTab";
import { AdminQuotationsSentTab } from "@/components/panel/AdminQuotationsSentTab";
import { AdminEstablishmentsTab } from "@/components/panel/AdminEstablishmentsTab";
import { AdminPaymentMethodsTab } from "@/components/panel/AdminPaymentMethodsTab";
import { AdminFactoriesTab } from "@/components/panel/AdminFactoriesTab";
import { FactoryDashboardView } from "@/components/panel/factory/FactoryDashboardView";
import { AdminQuotationReceived } from "@/types/admin";

function AdminPanelContent() {
  const { session, activeTab, setActiveTab } = useAdmin();

  // Estado para cuando desde "Cotizaciones Recibidas" o "Dashboard" se hace clic en "Responder con Cotización"
  const [replyingQuote, setReplyingQuote] = useState<AdminQuotationReceived | null>(null);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isNewProposalModalOpen, setIsNewProposalModalOpen] = useState(false);

  // Si no está autenticado, renderizar la pantalla de Login
  if (!session.isAuthenticated) {
    return <AdminLoginView />;
  }

  // Si el usuario autenticado tiene rol de Fábrica, renderizar directamente su Panel de Fábrica
  if (session.role === "fabrica") {
    return <FactoryDashboardView />;
  }

  const handleAnswerWithProposal = (quote: AdminQuotationReceived) => {
    setReplyingQuote(quote);
    setActiveTab("cotizaciones-enviadas");
  };

  const handleDashboardOpenNewProposal = () => {
    setReplyingQuote(null);
    setIsNewProposalModalOpen(true);
    setActiveTab("cotizaciones-enviadas");
  };

  const handleDashboardOpenNewClient = () => {
    setIsNewUserModalOpen(true);
    setActiveTab("usuarios");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Barra de navegación superior con buscador y pestañas */}
      <AdminNavigation />

      {/* Contenedor principal de contenidos */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === "dashboard" && (
          <AdminDashboardView
            onOpenNewProposal={handleDashboardOpenNewProposal}
            onOpenNewClient={handleDashboardOpenNewClient}
          />
        )}

        {activeTab === "usuarios" && (
          <AdminUsersTab
            isOpenCreateModal={isNewUserModalOpen}
            onCloseCreateModal={() => setIsNewUserModalOpen(false)}
          />
        )}

        {activeTab === "cotizaciones-recibidas" && (
          <AdminQuotationsReceivedTab
            onAnswerWithProposal={handleAnswerWithProposal}
          />
        )}

        {activeTab === "cotizaciones-enviadas" && (
          <AdminQuotationsSentTab
            initialReplyingQuote={replyingQuote}
            isOpenCreateModal={isNewProposalModalOpen}
            onCloseCreateModal={() => {
              setIsNewProposalModalOpen(false);
              setReplyingQuote(null);
            }}
          />
        )}

        {activeTab === "establecimientos" && <AdminEstablishmentsTab />}

        {activeTab === "formas-pago" && <AdminPaymentMethodsTab />}

        {activeTab === "fabricas" && <AdminFactoriesTab />}
      </main>

      {/* Footer administrativo sobrio */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Campo Directo SRL &bull; Panel de Control Operativo
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            https://campodirecto.ar/panel &bull; v1.0
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function AdminPanelPage() {
  return (
    <AdminProvider>
      <AdminPanelContent />
    </AdminProvider>
  );
}
