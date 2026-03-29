"use client";

import { InvoiceForm } from "@/components/InvoiceForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewInvoicePage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Create New Invoice</h1>
          <p className="mt-1 text-sm text-gray-500">
            Fill out the details to generate a new invoice
          </p>
        </div>
      </div>
      
      <InvoiceForm />
    </div>
  );
}
