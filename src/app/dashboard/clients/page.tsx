"use client";

import { useState, useEffect } from "react";
import { Plus, Search, MoreVertical, Edit2, Trash2, Printer, Users } from "lucide-react";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { ClientFormModal } from "@/components/ClientFormModal";

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "clients"), where("userId", "==", user?.uid));
      const querySnapshot = await getDocs(q);
      const clientsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClients(clientsData);
    } catch (error) {
      console.error("Error loading clients", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      try {
        await deleteDoc(doc(db, "clients", id));
        setClients(clients.filter(c => c.id !== id));
      } catch (error) {
        console.error("Error deleting client", error);
      }
    }
  };

  const openAddModal = () => {
    setClientToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (client: any) => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Klien</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Kelola direktori klien Anda
          </p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/30"
        >
          <Plus className="w-4 h-4" />
          Tambah Klien
        </button>
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
              placeholder="Cari nama klien..."
            />
          </div>
        </div>
        
        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">Memuat klien...</div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-full mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Belum ada klien</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Mulai dengan membuat klien baru. Anda dapat menambahkan detail dan logo mereka untuk digunakan dalam pembuatan tagihan.
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/80">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Info Klien
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kontak
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Template Default
                  </th>
                  <th scope="col" className="relative px-6 py-3 text-right">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {client.logoUrl ? (
                            <img className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-600" src={client.logoUrl} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
                              {client.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{client.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{client.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-200">{client.phone}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{client.email || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                        {client.defaultLayoutId ? "Template Kustom" : "Default Sistem"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3 text-gray-400 dark:text-gray-500">
                        <button onClick={() => openEditModal(client)} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(client.id)} className="hover:text-red-600 dark:hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientToEdit={clientToEdit}
        onSuccess={loadClients}
      />
    </div>
  );
}
