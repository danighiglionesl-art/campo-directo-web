"use client";

import React from "react";
import { ClientAuthProvider } from "@/context/ClientAuthContext";
import { ClientPortalModal } from "@/components/portal/ClientPortalModal";

export const ClientProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ClientAuthProvider>
      {children}
      <ClientPortalModal />
    </ClientAuthProvider>
  );
};
