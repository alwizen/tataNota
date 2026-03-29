"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { X, Loader2 } from "lucide-react";

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: any;
  onSuccess: () => void;
}

export function ClientFormModal({ isOpen, onClose, clientToEdit, onSuccess }: ClientFormModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      logoUrl: formData.get("logoUrl") as string || null,
      defaultLayoutId: formData.get("defaultLayoutId") as string || null,
    };

    try {
      if (clientToEdit) {
        // Edit existing
        await updateDoc(doc(db, "clients", clientToEdit.id), {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new
        await addDoc(collection(db, "clients"), {
          ...data,
          userId: user.uid,
          ...data,
          createdAt: serverTimestamp(),
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving client:", error);
      alert("Failed to save client.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {clientToEdit ? "Edit Klien" : "Tambah Klien Baru"}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Klien *</label>
                <input required type="text" name="name" id="name" defaultValue={clientToEdit?.name} className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors" />
              </div>

              <div>
                <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL Gambar Logo (Opsional)</label>
                <input type="url" name="logoUrl" id="logoUrl" defaultValue={clientToEdit?.logoUrl} placeholder="https://example.com/logo.png" className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-gray-400 dark:placeholder-gray-500 transition-colors" />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Tempel tautan gambar langsung dari internet.</p>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat *</label>
                <textarea required rows={3} name="address" id="address" defaultValue={clientToEdit?.address} className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telepon *</label>
                  <input required type="tel" name="phone" id="phone" defaultValue={clientToEdit?.phone} className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Opsional)</label>
                  <input type="email" name="email" id="email" defaultValue={clientToEdit?.email} className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80 flex justify-end gap-3 transition-colors">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={loading} className="inline-flex justify-center items-center px-6 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm shadow-blue-500/30 dark:shadow-blue-500/20 text-white bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {clientToEdit ? "Simpan Perubahan" : "Buat Klien"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
