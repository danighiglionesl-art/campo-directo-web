"use client";

import React from "react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { getWhatsAppLink } from "@/data/siteConfig";

interface WhatsAppButtonProps {
  productName?: string;
  className?: string;
  variant?: "floating" | "button" | "secondary";
  children?: React.ReactNode;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  productName,
  className = "",
  variant = "button",
  children,
}) => {
  const href = getWhatsAppLink(productName);

  if (variant === "floating") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp a Campo Directo"
        className={`fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.45)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.7)] hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40 group ${className}`}
      >
        <WhatsAppIcon className="w-full h-full transform group-hover:scale-105 transition-transform" />
      </a>
    );
  }

  if (variant === "secondary") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center gap-2.5 px-4 py-2 text-sm font-semibold text-slate-800 bg-white hover:bg-emerald-50 rounded-xl transition-all border border-slate-200 hover:border-[#25D366] shadow-xs ${className}`}
      >
        <WhatsAppIcon className="w-5 h-5" />
        <span>{children || "WhatsApp"}</span>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2.5 px-5 py-3 text-sm font-bold text-slate-900 bg-white hover:bg-emerald-50 active:bg-emerald-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-2 border-[#25D366] ${className}`}
    >
      <WhatsAppIcon className="w-5 h-5" />
      <span>{children || "Consultar por WhatsApp"}</span>
    </a>
  );
};
