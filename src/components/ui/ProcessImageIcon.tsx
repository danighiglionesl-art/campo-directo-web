import React from "react";

interface ProcessImageIconProps {
  className?: string;
}

/**
 * Ícono vectorial de "Imagen en Proceso" (Reloj con ciclo de flechas circulares)
 * Basado exactamente en la identidad gráfica requerida por Campo Directo.
 */
export const ProcessImageIcon: React.FC<ProcessImageIconProps> = ({
  className = "w-6 h-6 text-campo-green",
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="currentColor"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Imagen en proceso"
    >
      {/* Flecha circular superior (arco horario de las 9 a las 2) */}
      <path d="M 38 14 A 38 38 0 0 1 86 48" />
      <path d="M 74 44 L 86 48 L 90 36" />

      {/* Flecha circular inferior (arco horario de las 3 a las 8) */}
      <path d="M 62 86 A 38 38 0 0 1 14 52" />
      <path d="M 26 56 L 14 52 L 10 64" />

      {/* Esfera central del reloj */}
      <circle cx="50" cy="50" r="23" strokeWidth="6" />

      {/* Manecillas a las 12 y a las 3 */}
      <path d="M 50 35 V 50 H 63" strokeWidth="6" />
    </svg>
  );
};
