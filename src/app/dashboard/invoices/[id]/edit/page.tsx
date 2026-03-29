"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { InvoiceForm } from "@/components/InvoiceForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditInvoicePage() {
  const params = useParams();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user && params.id) {
      loadInvoice();
    }
  }, [user, params.id]);

  const loadInvoice = async () => {
    try {
      const docRef = doc(db, "invoices", params.id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().userId === user?.uid) {
        setInvoice({ id: docSnap.id, ...docSnap.data() });
      } else {
        alert("Invoice not found or access denied.");
        router.push("/dashboard/invoices");
      }
    } catch (error) {
      console.error("Error loading invoice", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/invoices"
          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Invoice</h1>
          <p className="mt-1 text-sm text-gray-500">
            {invoice?.invoiceNumber}
          </p>
        </div>
      </div>
      
      {invoice && <InvoiceForm initialData={invoice} />}
    </div>
  );
}
