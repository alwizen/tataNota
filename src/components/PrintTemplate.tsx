"use client";

import React, { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";

interface PrintTemplateProps {
  invoice: any;
  client: any;
  layout: any;
  mode: "A4_half_page" | "thermal_58mm";
}

// These are base default templates if no custom layout is defined
const DEFAULT_A4_HTML = `
<div class="a4-container">
  <div class="header">
    {{#if isPaid}}<div class="stamp-lunas">LUNAS</div>{{/if}}
    {{#if logo}}
      <img src="{{logo}}" class="logo" />
    {{/if}}
    <div class="company-info">
      <h1>{{clientName}}</h1>
      <p>{{clientAddress}}</p>
      <p>{{clientPhone}} | {{clientEmail}}</p>
    </div>
  </div>
  
  <div class="divider"></div>
  
  <div class="invoice-meta">
    <div class="meta-col">
      <h2>TAGIHAN</h2>
      <p><strong>No:</strong> {{invoiceNumber}}</p>
      <p><strong>Bulan/Tgl:</strong> {{date}}</p>
    </div>
    <div class="meta-col text-right">
      <h3>Kepada:</h3>
      <p><strong>{{customerName}}</strong></p>
      <p>{{customerAddress}}</p>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Deskripsi</th>
        <th class="text-center">Qty</th>
        <th class="text-right">Harga</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      {{items_html}}
    </tbody>
  </table>

  <div class="totals-section">
    <div class="notes-box">
      <strong>Catatan:</strong><br/>
      {{notes}}
    </div>
    <div class="totals-box">
      <div class="totals-row">
        <span>Subtotal:</span>
        <span>{{subtotal}}</span>
      </div>
      {{#if usePpn}}
      <div class="totals-row">
        <span>PPN (11%):</span>
        <span>{{ppnAmount}}</span>
      </div>
      {{/if}}
      <div class="totals-row grand-total">
        <span>Total Akhir:</span>
        <span>{{grandTotal}}</span>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <p>Terima kasih atas kepercayaan Anda!</p>
  </div>
</div>
`;

const DEFAULT_A4_CSS = `
.a4-container {
  position: relative;
  font-family: Arial, sans-serif;
  color: #1f2937;
  padding: 40px;
  width: 100%;
  box-sizing: border-box;
}
.stamp-lunas { 
  position: absolute; 
  top: 50%; left: 50%; 
  transform: translate(-50%, -50%) rotate(-30deg); 
  font-size: 100px; 
  color: rgba(34, 197, 94, 0.25); 
  border: 10px solid rgba(34, 197, 94, 0.25); 
  padding: 10px 40px; 
  border-radius: 24px; 
  font-weight: 900; 
  letter-spacing: 15px; 
  z-index: 10; 
  pointer-events: none; 
}
.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}
.logo {
  max-width: 120px;
  max-height: 80px;
  object-fit: contain;
}
.company-info h1 {
  margin: 0 0 5px 0;
  font-size: 24px;
  color: #111827;
}
.company-info p {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
}
.divider {
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 20px;
}
.invoice-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}
.meta-col h2 { margin: 0 0 10px 0; font-size: 20px; letter-spacing: 2px; }
.meta-col h3 { margin: 0 0 5px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; }
.meta-col p { margin: 3px 0; font-size: 14px; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
}
.items-table th {
  background-color: #f9fafb;
  padding: 12px 8px;
  text-align: left;
  font-size: 14px;
  border-bottom: 2px solid #e5e7eb;
}
.items-table th.text-right { text-align: right; }
.items-table th.text-center { text-align: center; }
.items-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
}
.totals-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
}
.notes-box {
  width: 50%;
  font-size: 13px;
  color: #6b7280;
  white-space: pre-wrap;
}
.totals-box {
  width: 40%;
}
.totals-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}
.grand-total {
  font-weight: bold;
  font-size: 18px;
  border-top: 2px solid #e5e7eb;
  margin-top: 8px;
  padding-top: 12px;
}
.footer {
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 40px;
}
`;

const DEFAULT_THERMAL_HTML = `
<div class="thermal-container">
  <div class="center">
    {{#if logo}}
      <img src="{{logo}}" class="logo" />
    {{/if}}
    <h2>{{clientName}}</h2>
    <p>{{clientAddress}}</p>
    <p>{{clientPhone}}</p>
  </div>
  
  <div class="divider">================================</div>
  
  <p>Tagihan : {{invoiceNumber}}</p>
  <p>Tanggal : {{date}}</p>
  <p>Cust    : {{customerName}}</p>
  
  <div class="divider">================================</div>
  {{#if isPaid}}<div class="stamp-lunas-thermal">*** LUNAS ***</div>{{/if}}
  
  <table class="items">
    {{items_html}}
  </table>
  
  <div class="divider">--------------------------------</div>
  
  <table class="totals">
    <tr>
      <td>Subtotal</td>
      <td class="right">{{subtotal}}</td>
    </tr>
    {{#if usePpn}}
    <tr>
      <td>PPN(11%)</td>
      <td class="right">{{ppnAmount}}</td>
    </tr>
    {{/if}}
    <tr class="bold">
      <td>Total</td>
      <td class="right">{{grandTotal}}</td>
    </tr>
  </table>
  
  <div class="divider">================================</div>
  <div class="center">
    <p>{{notes}}</p>
    <p>Terima Kasih!</p>
  </div>
</div>
`;

const DEFAULT_THERMAL_CSS = `
.thermal-container {
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  width: 58mm;
  padding: 5mm;
  box-sizing: border-box;
  color: #000;
  line-height: 1.2;
}
.center { text-align: center; }
.logo { max-width: 40mm; max-height: 20mm; margin-bottom: 5px; filter: grayscale(100%); }
h2 { margin: 5px 0; font-size: 14px; text-transform: uppercase; }
p { margin: 2px 0; }
.divider { margin: 5px 0; font-size: 10px; overflow: hidden; white-space: nowrap; }
.items { width: 100%; font-size: 12px; border-spacing: 0; }
.items td { padding: 2px 0; vertical-align: top; }
.right { text-align: right; }
.totals { width: 100%; border-spacing: 0; margin-top: 5px; }
.totals td { padding: 2px 0; }
.bold { font-weight: bold; }
.stamp-lunas-thermal { text-align: center; font-size: 16px; font-weight: bold; border-top: 2px dashed #000; border-bottom: 2px dashed #000; margin: 5px 0; padding: 5px 0; }
`;

export function PrintTemplate({ invoice, client, layout, mode }: PrintTemplateProps) {
  const finalHtmlTemplate = layout?.templateHtml || (mode === 'thermal_58mm' ? DEFAULT_THERMAL_HTML : DEFAULT_A4_HTML);
  const finalCssTemplate = layout?.templateCss || (mode === 'thermal_58mm' ? DEFAULT_THERMAL_CSS : DEFAULT_A4_CSS);

  const compiledHtml = useMemo(() => {
    if (!invoice || !client) return "";

    // Parse simple handlebars-like syntax
    let html = finalHtmlTemplate;

    // Helper to calculate total for single item
    const calcItemTotal = (item: any) => {
      const sub = item.qty * item.price;
      const disc = item.discountType === 'percentage' 
        ? sub * (item.discountValue / 100) 
        : item.discountValue;
      return Math.max(0, sub - disc);
    };

    // Generate Items HTML
    let itemsHtml = "";
    if (mode === 'thermal_58mm') {
      invoice.items.forEach((item: any) => {
        itemsHtml += `
          <tr><td colspan="2">${item.itemName}</td></tr>
          <tr>
            <td>${item.qty} x ${formatCurrency(item.price)}</td>
            <td class="right">${formatCurrency(calcItemTotal(item))}</td>
          </tr>
        `;
      });
    } else {
      invoice.items.forEach((item: any) => {
        itemsHtml += `
          <tr>
            <td>
              ${item.itemName}
              ${item.discountValue > 0 ? `<br><small style="color:#6b7280; font-size:11px;">Discount: ${item.discountType === 'percentage' ? item.discountValue+'%' : formatCurrency(item.discountValue)}</small>` : ''}
            </td>
            <td class="text-center">${item.qty}</td>
            <td class="text-right">${formatCurrency(item.price)}</td>
            <td class="text-right">${formatCurrency(calcItemTotal(item))}</td>
          </tr>
        `;
      });
    }

    // Replace items first
    html = html.replace(/{{items_html}}/g, itemsHtml);

    // Replace simple conditions
    if (client.logoUrl) {
      html = html.replace(/{{#if logo}}([\s\S]*?){{\/if}}/g, `$1`.replace(/{{logo}}/g, client.logoUrl));
    } else {
      html = html.replace(/{{#if logo}}([\s\S]*?){{\/if}}/g, '');
    }

    if (invoice.usePpn) {
      html = html.replace(/{{#if usePpn}}([\s\S]*?){{\/if}}/g, `$1`);
    } else {
      html = html.replace(/{{#if usePpn}}([\s\S]*?){{\/if}}/g, '');
    }

    if (invoice.status === 'paid') {
      html = html.replace(/{{#if isPaid}}([\s\S]*?){{\/if}}/g, `$1`);
    } else {
      html = html.replace(/{{#if isPaid}}([\s\S]*?){{\/if}}/g, '');
    }

    // Replace variables
    const variables: Record<string, string> = {
      clientName: client.name || "",
      clientAddress: client.address || "",
      clientPhone: client.phone || "",
      clientEmail: client.email || "",
      invoiceNumber: invoice.invoiceNumber || "",
      date: invoice.date || "",
      customerName: invoice.customerName || "-",
      customerAddress: invoice.customerAddress || "",
      notes: invoice.notes || "",
      subtotal: formatCurrency(invoice.subtotal),
      ppnAmount: formatCurrency(invoice.ppnAmount),
      grandTotal: formatCurrency(invoice.grandTotal),
    };

    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, variables[key] || "");
    });

    return html;
  }, [invoice, client, finalHtmlTemplate, mode]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: finalCssTemplate }} />
      <div 
        dangerouslySetInnerHTML={{ __html: compiledHtml }} 
        className={mode === 'A4_half_page' ? 'print-a4-half' : 'print-thermal'}
      />
    </>
  );
}
