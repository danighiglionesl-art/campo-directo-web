/**
 * Plantillas HTML Oficiales de Correo Electrónico para Campo Directo
 * Diseño responsivo, elegante, corporativo con verde institucional #339966.
 */

export interface RecoverUsernameTemplateParams {
  usuario: string;
  cuit: string;
  razonSocial: string;
  loginUrl: string;
}

export function renderRecoverUsernameEmail({
  usuario,
  cuit,
  razonSocial,
  loginUrl,
}: RecoverUsernameTemplateParams): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperación de Usuario - Campo Directo</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Contenedor Principal -->
        <table role="presentation" width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Encabezado Institucional -->
          <tr>
            <td style="background: linear-gradient(135deg, #1b4d3e 0%, #339966 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                CAMPO <span style="color: #a7f3d0;">DIRECTO</span>
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #e2e8f0; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                Portal de Productores & Empresas Agropecuarias
              </p>
            </td>
          </tr>

          <!-- Cuerpo -->
          <tr>
            <td style="padding: 35px 30px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 800; color: #0f172a;">
                Recordatorio de Nombre de Usuario
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Estimado/a <strong>${razonSocial || "Productor"}</strong>, recibimos una solicitud para recordar los datos de acceso asociados a su cuenta en <strong>Campo Directo</strong>.
              </p>

              <!-- Tarjeta de Datos -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 14px; border: 1px solid #e2e8f0; margin: 25px 0; overflow: hidden;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                      Tu Nombre de Usuario Oficial
                    </div>
                    <div style="font-size: 22px; font-weight: 900; color: #1b4d3e; letter-spacing: 0.5px;">
                      ${usuario}
                    </div>
                    ${cuit ? `
                    <div style="margin-top: 12px; font-size: 13px; color: #475569;">
                      <strong>CUIT Vinculado:</strong> ${cuit}
                    </div>` : ""}
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 25px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Podés utilizar este nombre de usuario, o directamente tu CUIT o correo electrónico, para ingresar al portal de autogestión.
              </p>

              <!-- Botón de Acción -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 10px 0 25px 0;">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; background-color: #339966; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 14px 32px; border-radius: 12px; box-shadow: 0 3px 10px rgba(51, 153, 102, 0.3);">
                      Ingresar a mi Cuenta
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Nota de Seguridad -->
              <div style="padding: 14px 18px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; font-size: 12px; line-height: 1.5; color: #1e40af;">
                <strong>Aviso de seguridad:</strong> Si no solicitaste este recordatorio, podés desestimar este correo con tranquilidad. Tu contraseña no ha sido modificada.
              </div>
            </td>
          </tr>

          <!-- Pie de Página -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 30px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #64748b;">
                Campo Directo Argentina · campodirecto.ar
              </p>
              <p style="margin: 0;">
                Este es un mensaje automático del sistema de autenticación de Campo Directo.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export interface RecoverPasswordTemplateParams {
  codigoOtp: string;
  minutosExpiracion: number;
  usuario?: string;
  razonSocial?: string;
}

export function renderRecoverPasswordOtpEmail({
  codigoOtp,
  minutosExpiracion,
  usuario,
  razonSocial,
}: RecoverPasswordTemplateParams): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Recuperación de Contraseña - Campo Directo</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Contenedor Principal -->
        <table role="presentation" width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Encabezado Institucional -->
          <tr>
            <td style="background: linear-gradient(135deg, #1b4d3e 0%, #339966 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                CAMPO <span style="color: #a7f3d0;">DIRECTO</span>
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #e2e8f0; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                Seguridad & Autenticación de Cuentas
              </p>
            </td>
          </tr>

          <!-- Cuerpo -->
          <tr>
            <td style="padding: 35px 30px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 800; color: #0f172a;">
                Código para Restablecer tu Contraseña
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Hola${razonSocial ? ` <strong>${razonSocial}</strong>` : ""}, recibimos una solicitud para restablecer la contraseña de tu cuenta${usuario ? ` (usuario: <strong>${usuario}</strong>)` : ""}.
              </p>

              <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Ingresá el siguiente código de seguridad en el formulario de la página web para crear tu nueva contraseña:
              </p>

              <!-- Caja del Código OTP -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; border-radius: 14px; border: 2px dashed #339966; margin: 25px 0;">
                <tr>
                  <td align="center" style="padding: 24px;">
                    <div style="font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                      Tu Código de Verificación Temporal
                    </div>
                    <div style="font-size: 38px; font-weight: 900; color: #15803d; letter-spacing: 8px; font-family: monospace;">
                      ${codigoOtp}
                    </div>
                    <div style="margin-top: 10px; font-size: 12px; color: #166534; font-weight: 600;">
                      Válido por los próximos ${minutosExpiracion} minutos
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 25px 0; font-size: 13px; line-height: 1.6; color: #64748b;">
                Por motivos de seguridad, nunca compartas este código con ninguna persona. El equipo de Campo Directo nunca te solicitará este código por teléfono ni por WhatsApp.
              </p>

              <!-- Nota de Seguridad -->
              <div style="padding: 14px 18px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; font-size: 12px; line-height: 1.5; color: #991b1b;">
                <strong>¿No solicitaste este cambio?</strong> Si no fuiste vos, podés ignorar este correo. Tu contraseña actual seguirá siendo válida y segura.
              </div>
            </td>
          </tr>

          <!-- Pie de Página -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 30px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #64748b;">
                Campo Directo Argentina · campodirecto.ar
              </p>
              <p style="margin: 0;">
                Centro de Seguridad y Protección de Cuentas Agropecuarias.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
