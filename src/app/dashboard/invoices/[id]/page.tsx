"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, Printer, Loader2, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
import { PrintTemplate } from "@/components/PrintTemplate";

export default function InvoicePrintPreview() {
  const params = useParams();
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [layout, setLayout] = useState<any>(null);
  const [printConfig, setPrintConfig] = useState<"A4_half_page" | "thermal_58mm">("A4_half_page");
  
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice_${invoice?.invoiceNumber || 'Document'}`,
  });

  useEffect(() => {
    if (user && params.id) {
      loadData();
    }
  }, [user, params.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load Invoice
      const invRef = doc(db, "invoices", params.id as string);
      const invSnap = await getDoc(invRef);
      if (!invSnap.exists() || invSnap.data().userId !== user?.uid) {
        alert("Invoice not found or access denied.");
        router.push("/dashboard/invoices");
        return;
      }
      const invData: any = { id: invSnap.id, ...invSnap.data() };
      setInvoice(invData);

      // Load Client
      const cliRef = doc(db, "clients", invData.clientId);
      const cliSnap = await getDoc(cliRef);
      let cliData: any = null;
      if (cliSnap.exists()) {
        cliData = { id: cliSnap.id, ...cliSnap.data() };
        setClient(cliData);
      }

      // Load Layout (Custom or System Default handled inside PrintTemplate)
      if (cliData?.defaultLayoutId) {
        const layRef = doc(db, "layouts", cliData.defaultLayoutId);
        const laySnap = await getDoc(layRef);
        if (laySnap.exists()) {
          const lData: any = { id: laySnap.id, ...laySnap.data() };
          setLayout(lData);
          setPrintConfig(lData.type || "A4_half_page");
        }
      }
      
    } catch (error) {
      console.error("Error loading preview data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !invoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/invoices"
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pratinjau Cetak</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{invoice.invoiceNumber}</p>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
              <p className="text-sm text-gray-500 dark:text-gray-400">{client?.name}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={printConfig}
            onChange={(e) => setPrintConfig(e.target.value as any)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm"
          >
            <option value="A4_half_page">A4 Standar (Setengah Halaman)</option>
            <option value="thermal_58mm">Resi Thermal (58mm)</option>
          </select>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/30"
          >
            <Printer className="w-4 h-4" />
            Cetak Dokumen
          </button>
        </div>
      </div>

      {layout && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 rounded-xl flex items-start gap-3">
          <LayoutTemplate className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-amber-900 dark:text-amber-200">Template Kustom Digunakan</h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">Menggunakan template "{layout.name}" yang diatur pada klien ini.</p>
          </div>
        </div>
      )}

      {/* Print Viewport Container */}
      <div className="bg-gray-200/50 dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-x-auto flex justify-center custom-scrollbar">
        <div 
          className={`bg-white shadow-xl ${
            printConfig === 'thermal_58mm' ? 'w-[58mm] min-h-[100mm]' : 'w-[210mm] min-h-[297mm]'
          }`}
          style={{ padding: printConfig === 'thermal_58mm' ? '0' : '0' }} // Padding is typically handled inside template
        >
          {/* We pass a ref to a wrapper div inside the paper constraints */}
          <div ref={printRef} className="w-full h-full bg-white print:m-0 print:p-0">
            <PrintTemplate 
              invoice={invoice} 
              client={client} 
              layout={layout} 
              mode={printConfig} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
