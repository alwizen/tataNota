"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors w-full">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-in-out md:hidden shadow-xl ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar onMobileClose={() => setIsSidebarOpen(false)} />
        </div>

        <main className="flex-1 overflow-y-auto flex flex-col min-w-0 w-full">
          {/* Mobile Header Minimal */}
          <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-500 font-black tracking-tight">TataNota</span>
            </h1>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 py-6 px-4 sm:px-8 md:py-8 lg:px-10 overflow-x-hidden min-w-0 w-full">{children}</div>
          <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Dibuat dengan <span className="text-red-500">❤️</span> Alwizen
          </footer>
        </main>
      </div>
    </ProtectedRoute>
  );
}
