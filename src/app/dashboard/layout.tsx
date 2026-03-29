"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors">
        <Sidebar />
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1 py-8 px-8 sm:px-10">{children}</div>
          <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Dibuat dengan <span className="text-red-500">❤️</span> Alwizen
          </footer>
        </main>
      </div>
    </ProtectedRoute>
  );
}
