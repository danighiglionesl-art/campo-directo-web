import { AdminQuotationSent } from "@/types/admin";

/**
 * Generador y Exportador de Propuestas Comerciales Oficiales de Campo Directo
 * Produce un documento formal en formato A4 con membrete institucional,
 * tabla de ítems, totales en USD, condiciones de canje/pago y firma digital.
 */
export function generateProposalPdf(proposal: AdminQuotationSent) {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Por favor habilite las ventanas emergentes en su navegador para generar el PDF oficial.");
    return;
  }

  const itemsRows = proposal.items
    .map(
      (it, idx) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b;">${idx + 1}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${it.descripcion}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: 600;">${it.cantidad}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">$${it.precioUnitarioUsd.toFixed(2)}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: 800; color: #1b4d3e;">$${it.subtotalUsd.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
      </tr>
    `
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Propuesta Oficial - ${proposal.numero} - Campo Directo</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #0f172a;
      background: #ffffff;
      font-size: 12px;
      line-height: 1.4;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #339966;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .logo-box h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 900;
      color: #1b4d3e;
      letter-spacing: -0.5px;
    }
    .logo-box h1 span {
      color: #339966;
    }
    .logo-box p {
      margin: 3px 0 0 0;
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .company-details {
      text-align: right;
      font-size: 11px;
      color: #475569;
    }
    .doc-meta {
      display: flex;
      justify-content: space-between;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 18px;
      margin-bottom: 20px;
    }
    .doc-meta .code {
      font-size: 18px;
      font-weight: 900;
      color: #1b4d3e;
      font-family: monospace;
    }
    .client-card {
      background-color: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 20px;
    }
    .client-card h3 {
      margin: 0 0 8px 0;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #339966;
      letter-spacing: 0.5px;
    }
    .table-container {
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    th {
      background-color: #f1f5f9;
      padding: 10px 12px;
      border-bottom: 2px solid #cbd5e1;
      font-weight: 800;
      color: #334155;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
    }
    .total-row {
      background-color: #f0fdf4;
      border-top: 2px solid #339966;
    }
    .total-row td {
      padding: 14px 12px;
      font-size: 14px;
      font-weight: 900;
    }
    .conditions-box {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 25px;
      background-color: #fafafa;
    }
    .conditions-box h4 {
      margin: 0 0 6px 0;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748b;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #cbd5e1;
    }
    .signature-line {
      width: 200px;
      border-top: 1px dashed #64748b;
      margin-bottom: 6px;
    }
    @media print {
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <!-- Barra de control no imprimible -->
  <div class="no-print" style="background: #1b4d3e; color: #ffffff; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-radius: 8px;">
    <span style="font-weight: bold; font-size: 13px;">Vista Previa de Impresión Oficial - Campo Directo</span>
    <div>
      <button onclick="window.print()" style="background: #339966; color: white; border: none; padding: 8px 18px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px; margin-right: 8px;">
        IMPRIMIR / GUARDAR PDF
      </button>
      <button onclick="window.close()" style="background: #334155; color: white; border: none; padding: 8px 14px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px;">
        Cerrar
      </button>
    </div>
  </div>

  <div class="header">
    <div class="logo-box">
      <h1>CAMPO <span>DIRECTO</span></h1>
      <p>Comercialización Directa de Insumos & Granos</p>
    </div>
    <div class="company-details">
      <strong>Campo Directo S.R.L.</strong><br>
      CUIT: 30-71894231-8 &bull; IVA Responsable Inscripto<br>
      comercial@campodirecto.ar &bull; +54 9 358 5095475<br>
      campodirecto.ar &bull; República Argentina
    </div>
  </div>

  <div class="doc-meta">
    <div>
      <div style="font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase;">Propuesta Comercial N°</div>
      <div class="code">${proposal.numero}</div>
      <div style="font-size: 12px; font-weight: 700; color: #334155; margin-top: 3px;">${proposal.asunto}</div>
    </div>
    <div style="text-align: right;">
      <div><strong>Emisión:</strong> ${proposal.fechaEmision}</div>
      <div><strong>Vencimiento:</strong> <span style="color: #b91c1c; font-weight: bold;">${proposal.fechaVencimiento}</span></div>
      <div><strong>Estado:</strong> ${proposal.estado}</div>
    </div>
  </div>

  <div class="client-card">
    <h3>Destinatario / Datos del Titular</h3>
    <table style="width: 100%;">
      <tr>
        <td style="width: 50%;"><strong>Razón Social:</strong> ${proposal.clienteNombre}</td>
        <td style="width: 50%;"><strong>CUIT:</strong> ${proposal.clienteCuit}</td>
      </tr>
      ${proposal.clienteEmail ? `
      <tr>
        <td colspan="2" style="padding-top: 4px;"><strong>Email Oficial:</strong> ${proposal.clienteEmail}</td>
      </tr>` : ""}
    </table>
  </div>

  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th style="width: 30px; text-align: center;">#</th>
          <th>Descripción del Producto / Insumo</th>
          <th style="width: 90px; text-align: center;">Cantidad</th>
          <th style="width: 110px; text-align: right;">Precio Unit. (USD)</th>
          <th style="width: 120px; text-align: right;">Subtotal (USD)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="4" style="text-align: right; color: #0f172a;">TOTAL PRESUPUESTO COMERCIAL:</td>
          <td style="text-align: right; color: #1b4d3e; font-family: monospace;">$${proposal.totalUsd.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <div class="conditions-box">
    <h4>Pautas y Condiciones Comerciales</h4>
    <p style="margin: 4px 0;"><strong>Condición y Forma de Pago:</strong> ${proposal.condicionPago}</p>
    <p style="margin: 4px 0;"><strong>Plazo de Entrega:</strong> ${proposal.plazoEntrega}</p>
    ${proposal.observaciones ? `<p style="margin: 6px 0 0 0; color: #475569; font-style: italic;">&ldquo;${proposal.observaciones}&rdquo;</p>` : ""}
  </div>

  <div style="font-size: 10px; color: #64748b; line-height: 1.4; margin-top: 15px;">
    <strong>Condiciones Generales:</strong> Cotización expresada en Dólares Estadounidenses (USD). Los valores incluyen flete directo a tranquera de campo según destino pactado salvo indicación en contrario. Precios directos sin comisiones intermediarias garantizados hasta la fecha de vencimiento indicada.
  </div>

  <div class="signatures">
    <div>
      <div class="signature-line"></div>
      <div style="font-weight: bold; color: #1b4d3e;">Campo Directo S.R.L.</div>
      <div style="font-size: 10px; color: #64748b;">Departamento Comercial</div>
    </div>
    <div style="text-align: right;">
      <div class="signature-line" style="margin-left: auto;"></div>
      <div style="font-weight: bold; color: #0f172a;">Conformidad del Productor</div>
      <div style="font-size: 10px; color: #64748b;">Firma & Aclaración</div>
    </div>
  </div>

  <script>
    // Iniciar diálogo de impresión automáticamente tras cargar
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>
  `.trim();

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
