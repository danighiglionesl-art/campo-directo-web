import React from "react";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { WhatWeDoSection } from "@/components/sections/WhatWeDoSection";
import { WhyUsSection } from "@/components/sections/WhyUsSection";
import { CoverageSection } from "@/components/sections/CoverageSection";
import { QuotationSection } from "@/components/sections/QuotationSection";
import { ContactSection } from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <div className="w-full">
      {/* 1. HERO PRINCIPAL (Etapa 2) */}
      <HeroSection />

      {/* 2. QUIÉNES SOMOS (Etapa 2) */}
      <AboutSection />

      {/* 3. QUÉ HACEMOS (Etapa 3) */}
      <WhatWeDoSection />

      {/* 5. POR QUÉ CAMPO DIRECTO (Etapa 4) */}
      <WhyUsSection />

      {/* 6. COBERTURA GEOGRÁFICA (Etapa 4) */}
      <CoverageSection />

      {/* 7. TU COTIZACIÓN / MARKETPLACE DIRECTO */}
      <QuotationSection />

      {/* 8. CONTACTO & REDES (Etapa 5) */}
      <ContactSection />
    </div>
  );
}
