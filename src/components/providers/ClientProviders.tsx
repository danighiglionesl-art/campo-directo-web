"use client";

import React from "react";
import { ClientAuthProvider } from "@/context/ClientAuthContext";
import { ClientPortalModal } from "@/components/portal/ClientPortalModal";
import { PwaRegistrar } from "@/components/pwa/PwaRegistrar";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";

export const ClientProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ClientAuthProvider>
      {children}
      <ClientPortalModal />
      <PwaRegistrar />
      <PwaInstallPrompt />
    </ClientAuthProvider>
  );
};
