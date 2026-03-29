"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, MoreVertical, Edit2, Trash2, Printer, Copy, CheckCircle, XCircle } from "lucide-react";
import { collection, query, where, getDocs, deleteDoc, doc, orderBy, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load clients for mapping
      const clientsQ = query(collection(db, "clients"), where("userId", "==", user?.uid));
      const clientsSnapshot = await getDocs(clientsQ);
      const clientsMap: Record<string, any> = {};
      clientsSnapshot.docs.forEach(doc => {
        clientsMap[doc.id] = doc.data();
      });
      setClients(clientsMap);

      // Load invoices
      const q = query(
        collection(db, "invoices"), 
        where("userId", "==", user?.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const invoicesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvoices(invoicesData);
    } catch (error) {
      console.error("Error loading invoices", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteDoc(doc(db, "invoices", id));
        setInvoices(invoices.filter(inv => inv.id !== id));
      } catch (error) {
        console.error("Error deleting invoice", error);
      }
    }
  };

  const handleDuplicate = async (invoice: any) => {
    if (confirm("Duplicate this invoice?")) {
      try {
        const { id, ...data } = invoice;
        const dupData = {
          ...data,
          invoiceNumber: `${data.invoiceNumber}-COPY`,
          createdAt: serverTimestamp(),
          status: 'draft',
        };
        await addDoc(collection(db, "invoices"), dupData);
        loadData();
      } catch (error) {
        console.error("Error duplicating invoice", error);
      }
    }
  };

  const handleToggleStatus = async (invoice: any) => {
    try {
      const newStatus = invoice.status === 'paid' ? 'draft' : 'paid';
      await updateDoc(doc(db, "invoices", invoice.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      setInvoices(invoices.map(inv => inv.id === invoice.id ? { ...inv, status: newStatus } : inv));
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tagihan</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Buat dan pantau semua tagihan klien Anda
          </p>
        </div>
        <Link 
          href="/dashboard/invoices/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/30"
        >
          <Plus className="w-4 h-4" />
          Buat Tagihan
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              placeholder="Cari nomor tagihan atau pelanggan..."
            />
          </div>
        </div>
        
        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">Memuat tagihan...</div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full mb-4">
                <Plus className="h-8 w-8 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Belum ada tagihan</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Mulai buat tagihan pertama Anda. Pastikan Anda sudah membuat minimal satu Klien sebelumnya.
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/80">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tagihan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Klien & Pelanggan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3 text-right">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{invoice.invoiceNumber || "Draft"}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{invoice.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{clients[invoice.clientId]?.name || "Klien Tidak Diketahui"}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{invoice.customerName || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(invoice.grandTotal)}</div>
                      {invoice.usePpn && <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Termasuk PPN</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {invoice.status === 'paid' ? 'Lunas' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 text-gray-400 dark:text-gray-500">
                        <button onClick={() => handleToggleStatus(invoice)} className={`p-1.5 rounded transition-colors ${invoice.status === 'paid' ? 'hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30' : 'hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'}`} title={invoice.status === 'paid' ? "Tandai Draft" : "Tandai Lunas"}>
                          {invoice.status === 'paid' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <Link href={`/dashboard/invoices/${invoice.id}`} className="p-1.5 hover:text-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30" title="Cetak/Pratinjau"><Printer className="w-4 h-4" /></Link>
                        <Link href={`/dashboard/invoices/${invoice.id}/edit`} className="p-1.5 hover:text-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30" title="Edit"><Edit2 className="w-4 h-4" /></Link>
                        <button onClick={() => handleDuplicate(invoice)} className="p-1.5 hover:text-emerald-600 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/30" title="Duplikasi"><Copy className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(invoice.id)} className="p-1.5 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/30" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
