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
      {/* 1. HERO PRINCIPAL */}
      <HeroSection />

      {/* 2. TU COTIZACIÓN / MARKETPLACE DIRECTO */}
      <QuotationSection />

      {/* 3. QUIÉNES SOMOS */}
      <AboutSection />

      {/* 4. QUÉ HACEMOS */}
      <WhatWeDoSection />

      {/* 5. POR QUÉ CAMPO DIRECTO */}
      <WhyUsSection />

      {/* 6. COBERTURA GEOGRÁFICA */}
      <CoverageSection />

      {/* 7. CONTACTO & REDES */}
      <ContactSection />
    </div>
  );
}
