"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Calculator, User, Building2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { siteConfig } from "@/data/siteConfig";
import { useClientAuth } from "@/context/ClientAuthContext";

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, openPortal } = useClientAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cerrar menú móvil al hacer clic en un enlace
  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm py-2 border-b border-slate-100"
          : "bg-white/80 backdrop-blur-sm py-4 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Logo className="h-12 sm:h-14 lg:h-16 w-auto" priority />
          </div>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {siteConfig.navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3 py-2 text-sm lg:text-base font-medium text-slate-700 hover:text-campo-green transition-colors rounded-md hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Botones de Acción (Desktop): Tu Cotización + Acceso a Clientes + Contactanos */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* 1. Tu Cotización */}
            <Link
              href={siteConfig.clientAccess.href}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs lg:text-sm font-semibold text-slate-700 hover:text-campo-green bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300 transition-all duration-200 rounded-full border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-campo-green shadow-2xs hover:shadow-xs"
            >
              <Calculator className="w-4 h-4 text-campo-green" />
              <span>{siteConfig.clientAccess.label}</span>
            </Link>

            {/* 2. Acceso a Clientes */}
            <button
              type="button"
              onClick={() => openPortal()}
              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs lg:text-sm font-semibold transition-all duration-200 rounded-full border focus:outline-none focus:ring-2 focus:ring-campo-green shadow-2xs hover:shadow-xs ${
                isAuthenticated
                  ? "text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border-emerald-300"
                  : "text-slate-700 hover:text-campo-green bg-white hover:bg-slate-50 border-slate-300"
              }`}
            >
              {isAuthenticated ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <User className="w-4 h-4 text-campo-green shrink-0" />
                  <span className="max-w-[130px] truncate">{user?.razonSocial || "Mi Cuenta"}</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-campo-green shrink-0" />
                  <span>{siteConfig.clientPortal.label}</span>
                </>
              )}
            </button>

            {/* 3. Acceso a Fábrica */}
            <Link
              href="/panel"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs lg:text-sm font-semibold text-slate-700 hover:text-campo-green bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300 transition-all duration-200 rounded-full border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-campo-green shadow-2xs hover:shadow-xs"
              title="Acceso al Panel para Fábricas y Empresas Aliadas"
            >
              <Building2 className="w-4 h-4 text-campo-green shrink-0" />
              <span>Acceso a Fábrica</span>
            </Link>

            {/* 4. Contactanos */}
            <Link
              href={siteConfig.ctaNav.href}
              className="inline-flex items-center justify-center px-4 py-2 text-xs lg:text-sm font-semibold text-white bg-campo-green hover:bg-campo-green-600 active:bg-campo-green-700 transition-all duration-200 rounded-full shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-campo-green focus:ring-offset-2"
            >
              <span>{siteConfig.ctaNav.label}</span>
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Botón Menú Móvil (Hamburger) */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:text-campo-green hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-campo-green"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Cerrar menú principal" : "Abrir menú principal"}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xl transition-all duration-200">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {siteConfig.navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={handleNavClick}
                className="block px-3 py-2.5 rounded-md text-base font-medium text-slate-800 hover:text-campo-green hover:bg-campo-green-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-slate-100 space-y-2">
              <Link
                href={siteConfig.clientAccess.href}
                onClick={handleNavClick}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <Calculator className="w-4 h-4 text-campo-green" />
                <span>{siteConfig.clientAccess.label}</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  handleNavClick();
                  openPortal();
                }}
                className={`w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border transition-colors ${
                  isAuthenticated
                    ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                    : "bg-white text-slate-700 hover:bg-slate-50 border-slate-300"
                }`}
              >
                <User className="w-4 h-4 text-campo-green" />
                <span>
                  {isAuthenticated
                    ? `Mi Cuenta (${user?.razonSocial || "Cliente"})`
                    : siteConfig.clientPortal.label}
                </span>
              </button>

              <Link
                href="/panel"
                onClick={handleNavClick}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <Building2 className="w-4 h-4 text-campo-green" />
                <span>Acceso a Fábrica</span>
              </Link>

              <Link
                href={siteConfig.ctaNav.href}
                onClick={handleNavClick}
                className="w-full flex items-center justify-center px-5 py-3 text-base font-semibold text-white bg-campo-green hover:bg-campo-green-600 rounded-xl shadow-md transition-colors"
              >
                <span>{siteConfig.ctaNav.label}</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
