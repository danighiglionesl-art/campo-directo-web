import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  className?: string;
  variant?: "standard" | "3d" | "flat";
  priority?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = "h-12 w-auto",
  variant = "standard",
  priority = false,
}) => {
  // Selección del archivo de logotipo oficial provisto por el usuario
  const logoSrc =
    variant === "3d"
      ? "/images/logo-3d.png"
      : "/images/logo-transparent.png";

  return (
    <Link
      href="#inicio"
      className="inline-flex items-center group focus:outline-none focus:ring-2 focus:ring-campo-green focus:ring-offset-2 rounded-lg transition-transform hover:scale-105"
      aria-label="Campo Directo - Inicio"
    >
      <div className={`relative flex items-center justify-center ${className}`}>
        <Image
          src={logoSrc}
          alt="Campo Directo"
          width={400}
          height={250}
          priority={priority}
          className="h-full w-auto object-contain select-none"
        />
      </div>
    </Link>
  );
};
