import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatInvoiceToTxt(invoice: any, client: any, lineWidth = 40) {
  const padRight = (s: string, w: number) => (s.length >= w ? s.slice(0, w) : s + ' '.repeat(w - s.length));
  const padLeft = (s: string, w: number) => (s.length >= w ? s.slice(0, w) : ' '.repeat(w - s.length) + s);

  const lines: string[] = [];
  lines.push(client?.name || '');
  if (client?.address) lines.push(client.address);
  if (client?.phone) lines.push(`Tel: ${client.phone}`);
  lines.push('-'.repeat(lineWidth));
  lines.push(`No: ${invoice?.invoiceNumber || ''}`);
  lines.push(`Tanggal: ${invoice?.date || ''}`);
  if (invoice?.customerName) lines.push(`Kepada: ${invoice.customerName}`);
  if (invoice?.customerAddress) lines.push(invoice.customerAddress);
  lines.push('-'.repeat(lineWidth));

  // Items header
  const nameW = Math.max(12, Math.floor(lineWidth * 0.5));
  const qtyW = 6;
  const priceW = lineWidth - nameW - qtyW - 1;
  lines.push(padRight('Item', nameW) + ' ' + padRight('Qty', qtyW) + padLeft('Harga', priceW));
  lines.push('-'.repeat(lineWidth));

  const calcItemTotal = (item: any) => {
    const sub = (item.qty || 0) * (item.price || 0);
    const disc = item.discountType === 'percentage'
      ? sub * ((item.discountValue || 0) / 100)
      : (item.discountValue || 0);
    return Math.max(0, sub - disc);
  };

  (invoice.items || []).forEach((it: any) => {
    const name = (it.itemName || it.name || '').replace(/\s+/g, ' ');
    const line1 = padRight(name, nameW) + ' ' + padRight(String(it.qty || ''), qtyW) + padLeft(formatCurrency(calcItemTotal(it)), priceW);
    lines.push(line1);
  });

  lines.push('-'.repeat(lineWidth));
  if (typeof invoice.subtotal !== 'undefined') {
    lines.push(padRight('Subtotal', lineWidth - 12) + padLeft(formatCurrency(invoice.subtotal || 0), 12));
  }
  if (invoice.usePpn) {
    lines.push(padRight('PPN (11%)', lineWidth - 12) + padLeft(formatCurrency(invoice.ppnAmount || 0), 12));
  }
  lines.push(padRight('Total', lineWidth - 12) + padLeft(formatCurrency(invoice.grandTotal || invoice.total || 0), 12));

  lines.push('');
  if (invoice.notes) {
    lines.push('Catatan:');
    lines.push(invoice.notes);
  }
  lines.push('');
  lines.push('Terima kasih!');

  return lines.join('\n');
}
