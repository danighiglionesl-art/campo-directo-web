import React from "react";

interface WhatsAppIconProps {
  className?: string;
}

/**
 * Logotipo oficial de WhatsApp con su característico color verde (#25D366)
 * y teléfono blanco interior para máximo impacto visual y fidelidad de marca.
 */
export const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({
  className = "w-5 h-5",
}) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-xs ${className}`}
      aria-hidden="true"
    >
      {/* Fondo verde oficial de WhatsApp */}
      <circle cx="16" cy="16" r="16" fill="#25D366" />
      {/* Teléfono blanco oficial */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23.5 8.5C21.5 6.5 18.8 5.4 16 5.4C10.2 5.4 5.4 10.2 5.4 16C5.4 17.9 5.9 19.7 6.8 21.3L5.4 26.6L10.8 25.2C12.3 26 14.1 26.5 16 26.5C21.8 26.5 26.6 21.7 26.6 15.9C26.6 13.1 25.5 10.5 23.5 8.5ZM16 24.7C14.4 24.7 12.8 24.3 11.4 23.5L11.1 23.3L7.9 24.1L8.8 21L8.5 20.6C7.6 19.2 7.1 17.6 7.1 16C7.1 11.1 11.1 7.1 16 7.1C18.4 7.1 20.6 8 22.3 9.7C24 11.4 24.9 13.6 24.9 16C24.9 20.9 20.9 24.7 16 24.7ZM20.9 18.8C20.6 18.7 19.3 18.1 19.1 18C18.9 17.9 18.7 17.9 18.5 18.2C18.3 18.5 17.8 19.1 17.6 19.3C17.5 19.5 17.3 19.5 17 19.3C16.7 19.2 15.8 18.9 14.7 17.9C13.8 17.1 13.3 16.2 13.1 15.9C12.9 15.6 13.1 15.5 13.2 15.3C13.4 15.2 13.5 15 13.7 14.8C13.8 14.6 13.9 14.5 14 14.3C14.1 14.1 14 14 14 13.9C13.9 13.7 13.3 12.4 13.1 11.8C12.9 11.3 12.6 11.3 12.4 11.3H11.9C11.7 11.3 11.4 11.4 11.1 11.7C10.9 12 10.1 12.7 10.1 14.2C10.1 15.7 11.2 17.1 11.4 17.3C11.5 17.5 13.6 20.7 16.7 22C17.5 22.3 18 22.5 18.5 22.7C19.3 22.9 20 22.9 20.6 22.8C21.2 22.7 22.5 22 22.7 21.3C23 20.6 23 20 22.9 19.9C22.8 19.8 22.6 19.7 22.3 19.6L20.9 18.8Z"
        fill="white"
      />
    </svg>
  );
};
