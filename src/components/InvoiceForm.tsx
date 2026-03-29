"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { Plus, Trash2, Loader2, FileText, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface InvoiceItem {
  id: string;
  itemName: string;
  qty: number;
  price: number;
  discountType: "percentage" | "nominal";
  discountValue: number;
}

interface InvoiceFormProps {
  initialData?: any;
}

export function InvoiceForm({ initialData }: InvoiceFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  
  // Form State
  const [clientId, setClientId] = useState(initialData?.clientId || "");
  const [invoiceNumber, setInvoiceNumber] = useState(
    initialData?.invoiceNumber || `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 10000)}`
  );
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState(initialData?.customerName || "-");
  const [customerAddress, setCustomerAddress] = useState(initialData?.customerAddress || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [usePpn, setUsePpn] = useState(initialData?.usePpn || false);
  
  const [items, setItems] = useState<InvoiceItem[]>(
    initialData?.items || [
      { id: Date.now().toString(), itemName: "", qty: 1, price: 0, discountType: "nominal", discountValue: 0 }
    ]
  );

  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user]);

  const loadClients = async () => {
    try {
      const q = query(collection(db, "clients"), where("userId", "==", user?.uid));
      const querySnapshot = await getDocs(q);
      setClients(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error loading clients", error);
    }
  };

  // Calculations
  const calcItemSubtotal = (qty: number, price: number) => qty * price;
  const calcItemTotal = (item: InvoiceItem) => {
    const sub = calcItemSubtotal(item.qty, item.price);
    const disc = item.discountType === 'percentage' 
      ? sub * (item.discountValue / 100) 
      : item.discountValue;
    return Math.max(0, sub - disc);
  };

  const subtotal = items.reduce((acc, item) => acc + calcItemTotal(item), 0);
  const ppnAmount = usePpn ? subtotal * 0.11 : 0; // Assuming 11% PPN for Indonesia
  const grandTotal = subtotal + ppnAmount;

  const handleAddItem = () => {
    setItems([...items, { 
      id: Date.now().toString(), 
      itemName: "", 
      qty: 1, 
      price: 0, 
      discountType: "nominal", 
      discountValue: 0 
    }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !clientId) {
      alert("Please select a client.");
      return;
    }
    
    // Quick validation
    if (items.some(i => !i.itemName.trim())) {
      alert("All items must have a name.");
      return;
    }

    setLoading(true);
    
    const invoiceData = {
      userId: user.uid,
      clientId,
      invoiceNumber,
      date,
      customerName,
      customerAddress,
      notes,
      usePpn,
      items,
      subtotal,
      ppnAmount,
      grandTotal,
      status: initialData?.status || 'draft',
    };

    try {
      if (initialData?.id) {
        await updateDoc(doc(db, "invoices", initialData.id), {
          ...invoiceData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "invoices"), {
          ...invoiceData,
          createdAt: serverTimestamp(),
        });
      }
      
      router.push('/dashboard/invoices');
      router.refresh();
    } catch (error) {
      console.error("Error saving invoice", error);
      alert("Failed to save invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-10">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg"><FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Detail Tagihan</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pilih Klien (Pengirim) *</label>
            <select required value={clientId} onChange={(e) => setClientId(e.target.value)} className="block w-full border border-gray-300 dark:border-gray-600 rounded-xl py-2.5 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm transition-colors">
              <option value="" disabled>-- Pilih Klien --</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor Tagihan *</label>
            <input required type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="block w-full border border-gray-300 dark:border-gray-600 rounded-xl py-2.5 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal *</label>
            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="block w-full border border-gray-300 dark:border-gray-600 rounded-xl py-2.5 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Pelanggan (Penerima)</label>
            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="block w-full border border-gray-300 dark:border-gray-600 rounded-xl py-2.5 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-colors" placeholder="Misal: Rina atau - " />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat Pelanggan (Opsional)</label>
            <textarea value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} rows={2} className="block w-full border border-gray-300 dark:border-gray-600 rounded-xl py-2.5 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-colors" placeholder="Alamat penagihan..." />
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-lg"><Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Daftar Barang/Jasa</h2>
          </div>
          <button type="button" onClick={handleAddItem} className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Tambah Baris
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-1/3">Deskripsi Barang</th>
                <th className="py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-24">Qty</th>
                <th className="py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-32">Harga</th>
                <th className="py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300 w-40">Diskon</th>
                <th className="py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">Total</th>
                <th className="py-3 px-2 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {items.map((item, index) => (
                <tr key={item.id} className="group transition-colors">
                  <td className="py-3 px-2">
                    <input type="text" required value={item.itemName} onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)} placeholder="Nama barang" className="w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors" />
                  </td>
                  <td className="py-3 px-2">
                    <input type="number" required min="1" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', Number(e.target.value))} className="w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" />
                  </td>
                  <td className="py-3 px-2">
                    <input type="number" required min="0" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', Number(e.target.value))} className="w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" />
                  </td>
                  <td className="py-3 px-2 flex gap-1 items-center">
                    <select value={item.discountType} onChange={(e) => handleItemChange(item.id, 'discountType', e.target.value)} className="border-gray-300 dark:border-gray-600 rounded-l-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-2 border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white max-w-[65px] transition-colors">
                      <option value="nominal">Rp</option>
                      <option value="percentage">%</option>
                    </select>
                    <input type="number" min="0" value={item.discountValue} onChange={(e) => handleItemChange(item.id, 'discountValue', Number(e.target.value))} className="w-full border-gray-300 dark:border-gray-600 rounded-r-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-2 border -ml-px bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" />
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-gray-900 dark:text-white text-sm">
                    {formatCurrency(calcItemTotal(item))}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button type="button" onClick={() => handleRemoveItem(item.id)} disabled={items.length === 1} className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-30 transition-colors p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Totals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Catatan / Syarat Ketentuan</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="block w-full border border-gray-300 dark:border-gray-600 rounded-xl py-2.5 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-colors" placeholder="Akan dicetak di tagihan..."></textarea>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
          <div className="space-y-3 font-medium text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-y border-gray-100 dark:border-gray-700">
              <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={usePpn} onChange={(e) => setUsePpn(e.target.checked)} className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 h-4 w-4 bg-white dark:bg-gray-700" />
                Termasuk PPN (11%)
              </label>
              <span className="text-gray-600 dark:text-gray-400">{formatCurrency(ppnAmount)}</span>
            </div>
            
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2">
              <span>Total Akhir</span>
              <span className="text-blue-600 dark:text-blue-400">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Batal
        </button>
        <button type="submit" disabled={loading} className="inline-flex justify-center items-center px-8 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-sm shadow-blue-500/30 text-white bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 transition-all font-semibold">
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {initialData ? "Perbarui Tagihan" : "Buat Tagihan"}
        </button>
      </div>
    </form>
  );
}
