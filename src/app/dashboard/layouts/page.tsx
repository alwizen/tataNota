"use client";

import { useState, useEffect } from "react";
import { Plus, LayoutTemplate, Edit2, Trash2 } from "lucide-react";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { LayoutFormModal } from "@/components/LayoutFormModal";

export default function LayoutsPage() {
  const { user } = useAuth();
  const [layouts, setLayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [layoutToEdit, setLayoutToEdit] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      loadLayouts();
    }
  }, [user]);

  const loadLayouts = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "layouts"), where("userId", "==", user?.uid));
      const querySnapshot = await getDocs(q);
      const layoutsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLayouts(layoutsData);
    } catch (error) {
      console.error("Error loading layouts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this layout template?")) {
      try {
        await deleteDoc(doc(db, "layouts", id));
        setLayouts(layouts.filter(l => l.id !== id));
      } catch (error) {
        console.error("Error deleting layout", error);
      }
    }
  };

  const openAddModal = () => {
    setLayoutToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (layout: any) => {
    setLayoutToEdit(layout);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Template Cetak</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Buat template tagihan HTML/CSS khusus untuk klien Anda
          </p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/30"
        >
          <Plus className="w-4 h-4" />
          Buat Template
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* System Defaults placeholders */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col opacity-80">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-lg"><LayoutTemplate className="w-5 h-5 text-gray-600 dark:text-gray-300" /></div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Standar A4 (Setengah)</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Default Sistem</p>
            </div>
          </div>
          <div className="p-4 flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">Template standar untuk kertas A4, dibagi menjadi dua salinan horizontal per halaman.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col opacity-80">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-lg"><LayoutTemplate className="w-5 h-5 text-gray-600 dark:text-gray-300" /></div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Resi Thermal (58mm)</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Default Sistem</p>
            </div>
          </div>
          <div className="p-4 flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">Template ringkas yang dirancang khusus untuk printer kasir thermal portabel 58mm.</p>
          </div>
        </div>

        {/* Custom Layouts */}
        {!loading && layouts.map((layout) => (
          <div key={layout.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/50 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg"><LayoutTemplate className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{layout.name}</h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400">{layout.type === 'A4_half_page' ? 'A4 Standar' : 'Thermal 58mm'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEditModal(layout)} className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(layout.id)} className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">Kustomisasi HTML/CSS template override.</p>
              <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                Dibuat: {layout.createdAt?.toDate().toLocaleDateString() || "Baru saja"}
              </div>
            </div>
          </div>
        ))}
      </div>

      <LayoutFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        layoutToEdit={layoutToEdit}
        onSuccess={loadLayouts}
      />
    </div>
  );
}
