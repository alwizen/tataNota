"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { X, Loader2 } from "lucide-react";

interface LayoutFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  layoutToEdit?: any;
  onSuccess: () => void;
}

export function LayoutFormModal({ isOpen, onClose, layoutToEdit, onSuccess }: LayoutFormModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [cssContent, setCssContent] = useState("");
  
  useEffect(() => {
    if (layoutToEdit) {
      setHtmlContent(layoutToEdit.templateHtml || "");
      setCssContent(layoutToEdit.templateCss || "");
    } else {
      setHtmlContent(`<div className="invoice-container">\n  <h1>Invoice</h1>\n  <p>Client: {{clientName}}</p>\n</div>`);
      setCssContent(`.invoice-container {\n  font-family: sans-serif;\n  padding: 20px;\n}`);
    }
  }, [layoutToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      templateHtml: htmlContent,
      templateCss: cssContent,
    };

    try {
      if (layoutToEdit) {
        await updateDoc(doc(db, "layouts", layoutToEdit.id), {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "layouts"), {
          ...data,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving layout:", error);
      alert("Failed to save layout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {layoutToEdit ? "Edit Template" : "Buat Template"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Template *</label>
                <input required type="text" name="name" defaultValue={layoutToEdit?.name} className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipe Format *</label>
                <select name="type" required defaultValue={layoutToEdit?.type || "A4_half_page"} className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors">
                  <option value="A4_half_page">A4 Standar (Setengah Halaman)</option>
                  <option value="thermal_58mm">Resi Thermal (58mm)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
                  <span>Template HTML</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">Gunakan sintaks Handlebars untuk variabel</span>
                </label>
                <textarea 
                  required 
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  rows={8} 
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" 
                />
              </div>
            </div>
            
            <div className="space-y-5 h-full flex flex-col">
              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gaya CSS</label>
                <textarea 
                  value={cssContent}
                  onChange={(e) => setCssContent(e.target.value)}
                  className="block w-full flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono text-xs min-h-[200px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors" 
                />
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-lg p-4 transition-colors">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Variabel Tersedia:</h4>
                <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 grid grid-cols-2">
                  <li><code>{'{{invoiceNumber}}'}</code></li>
                  <li><code>{'{{date}}'}</code></li>
                  <li><code>{'{{clientName}}'}</code></li>
                  <li><code>{'{{customerName}}'}</code></li>
                  <li><code>{'{{grandTotal}}'}</code></li>
                  <li><code>{'{{#each items}}'}</code></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80 flex justify-end gap-3 transition-colors">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={loading} className="inline-flex justify-center items-center px-6 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-50 transition-all">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
