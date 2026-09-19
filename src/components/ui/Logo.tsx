import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  className?: string;
  variant?: "standard" | "3d" | "flat" | "light";
  priority?: boolean;
  width?: number;
  height?: number;
  size?: "sm" | "md" | "lg" | string;
}

export const Logo: React.FC<LogoProps> = ({
  className,
  variant = "standard",
  priority = false,
  width = 400,
  height = 250,
  size,
}) => {
  const sizeClass =
    size === "sm"
      ? "h-8 w-auto"
      : size === "lg"
      ? "h-16 w-auto"
      : size === "md"
      ? "h-10 w-auto"
      : "h-12 w-auto";
  const effectiveClass = className || sizeClass;

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
      <div className={`relative flex items-center justify-center ${effectiveClass}`}>
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
