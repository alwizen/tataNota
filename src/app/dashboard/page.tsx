"use client";

import { useAuth } from "@/context/AuthContext";
import { Users, FileText, LayoutTemplate, Activity, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  
  const [statsData, setStatsData] = useState({
    clients: 0,
    invoices: 0,
    layouts: 0
  });
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [clientsMap, setClientsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load total clients
      const clientsQ = query(collection(db, "clients"), where("userId", "==", user?.uid));
      const clientsSnap = await getDocs(clientsQ);
      const clientsCount = clientsSnap.docs.length;
      
      const cMap: Record<string, string> = {};
      clientsSnap.docs.forEach(doc => {
        cMap[doc.id] = doc.data().name;
      });
      setClientsMap(cMap);

      // Load total invoices
      const invoicesQ = query(collection(db, "invoices"), where("userId", "==", user?.uid), orderBy("createdAt", "desc"));
      const invoicesSnap = await getDocs(invoicesQ);
      const invoicesCount = invoicesSnap.docs.length;
      
      // Get recent 5 invoices
      const recent = invoicesSnap.docs.slice(0, 5).map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentInvoices(recent);

      // Load total layouts
      const layoutsQ = query(collection(db, "layouts"), where("userId", "==", user?.uid));
      const layoutsSnap = await getDocs(layoutsQ);
      const layoutsCount = layoutsSnap.docs.length;

      setStatsData({
        clients: clientsCount,
        invoices: invoicesCount,
        layouts: layoutsCount
      });
      
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { name: "Total Klien", value: loading ? "..." : statsData.clients.toString(), icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/40" },
    { name: "Tagihan Dibuat", value: loading ? "..." : statsData.invoices.toString(), icon: FileText, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
    { name: "Template Cetak", value: loading ? "..." : statsData.layouts.toString(), icon: LayoutTemplate, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/40" },
    { name: "Aktivitas Terbaru", value: "Aktif", icon: Activity, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/40" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Selamat datang kembali, {user?.displayName}!</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kelola klien Anda dan buat tagihan profesional dengan mudah.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-xl bg-white dark:bg-gray-800 px-4 py-5 shadow-sm border border-gray-100 dark:border-gray-700 sm:p-6 transition-all hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/50"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</dt>
                  <dd>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Tagihan Terbaru</h2>
          <Link href="/dashboard/invoices" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            Lihat Semua
          </Link>
        </div>
        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400 text-sm">Memuat data...</div>
          ) : recentInvoices.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400 text-sm">
              Belum ada tagihan yang dibuat. Mulai dengan menambahkan klien baru pada menu Klien.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/80">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tagihan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Klien
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
                {recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{invoice.invoiceNumber || "Draft"}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{invoice.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{clientsMap[invoice.clientId] || "Klien Tidak Diketahui"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(invoice.grandTotal)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {invoice.status === 'paid' ? 'Lunas' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/invoices/${invoice.id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex justify-end gap-1 items-center">
                        <Eye className="w-4 h-4" /> Detail
                      </Link>
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
