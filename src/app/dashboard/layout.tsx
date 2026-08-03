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
      <div className="flex h-screen w-full overflow-hidden bg-gray-50 transition-colors dark:bg-gray-900">
        <Sidebar />

        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto pb-24 md:pb-0">
          <div className="flex-1 w-full min-w-0 overflow-x-hidden px-4 py-6 sm:px-8 md:py-8 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
