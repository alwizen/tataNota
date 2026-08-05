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

  const wrapText = (text: string, w: number) => {
    const words = text.split(/\s+/);
    const out: string[] = [];
    let line = '';
    words.forEach((word) => {
      if ((line + (line ? ' ' : '') + word).length <= w) {
        line = line ? line + ' ' + word : word;
      } else {
        if (line) out.push(line);
        if (word.length > w) {
          // hard-break long word
          for (let i = 0; i < word.length; i += w) {
            out.push(word.slice(i, i + w));
          }
          line = '';
        } else {
          line = word;
        }
      }
    });
    if (line) out.push(line);
    return out;
  };

  const lines: string[] = [];

  if (client?.name) lines.push(client.name);
  if (client?.address) lines.push(client.address);
  if (client?.phone) lines.push(`Tel: ${client.phone}`);
  lines.push('-'.repeat(lineWidth));
  lines.push(`No: ${invoice?.invoiceNumber || ''}`);
  lines.push(`Tanggal: ${invoice?.date || ''}`);
  if (invoice?.customerName) lines.push(`Kepada: ${invoice.customerName}`);
  if (invoice?.customerAddress) lines.push(invoice.customerAddress);
  lines.push('-'.repeat(lineWidth));

  // Items
  const nameW = lineWidth; // we'll print name as wrapped block
  const qtyPriceW = lineWidth; // qty and prices will be right-aligned on their own line

  (invoice.items || []).forEach((it: any) => {
    const name = (it.itemName || it.name || '').replace(/\s+/g, ' ').trim() || '-';
    const wrapped = wrapText(name, nameW);
    wrapped.forEach((l) => lines.push(l));

    const qty = String(it.qty || '');
    const price = formatCurrency(it.price || 0);
    const total = formatCurrency((it.qty || 0) * (it.price || 0) - (it.discountType === 'percentage' ? ((it.qty || 0) * (it.price || 0) * (it.discountValue || 0) / 100) : (it.discountValue || 0)));
    const summary = `${qty} x ${price} = ${total}`;
    lines.push(padLeft(summary, qtyPriceW));
    lines.push('');
  });

  lines.push('-'.repeat(lineWidth));
  if (typeof invoice.subtotal !== 'undefined') {
    lines.push(padLeft(`Subtotal: ${formatCurrency(invoice.subtotal || 0)}`, lineWidth));
  }
  if (invoice.usePpn) {
    lines.push(padLeft(`PPN (11%): ${formatCurrency(invoice.ppnAmount || 0)}`, lineWidth));
  }
  lines.push(padLeft(`Total: ${formatCurrency(invoice.grandTotal || invoice.total || 0)}`, lineWidth));

  lines.push('');
  if (invoice.notes) {
    lines.push('Catatan:');
    const noteLines = wrapText(invoice.notes, lineWidth);
    noteLines.forEach((n) => lines.push(n));
    lines.push('');
  }
  // Place LUNAS stamp before the farewell if invoice is paid
  if (invoice?.status === 'paid' || invoice?.isPaid) {
    const stamp = '*** LUNAS ***';
    const leftPad = Math.max(0, Math.floor((lineWidth - stamp.length) / 2));
    lines.push('');
    lines.push(' '.repeat(leftPad) + stamp);
    lines.push('');
  }

  lines.push('Terima kasih!');

  return lines.join('\n');
}
