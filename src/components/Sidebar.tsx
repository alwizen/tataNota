import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  FileText,
  LayoutTemplate,
  LogOut,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const navigation = [
  { name: "Beranda", href: "/dashboard", icon: LayoutDashboard },
  { name: "Klien", href: "/dashboard/clients", icon: Users },
  { name: "Tagihan", href: "/dashboard/invoices", icon: FileText },
  { name: "Template Cetak", href: "/dashboard/layouts", icon: LayoutTemplate },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  return (
      <div className="flex h-screen w-64 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors">
      <div className="flex h-16 shrink-0 items-center px-6 gap-2 border-b border-gray-100 dark:border-gray-800">
        <Receipt className="h-8 w-8 text-blue-600 dark:text-blue-500" />
        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          TataNota
        </span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="mt-2 flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
                  "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                )}
              >
                <item.icon
                  className={cn(
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300",
                    "mr-3 h-5 w-5 flex-shrink-0"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-200 font-bold overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              <span>{user?.displayName?.[0] || 'U'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.displayName || "Pengguna"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
          <ThemeToggle />
        </div>
        <button
          onClick={signOut}
          className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-all"
        >
          <LogOut className="mr-3 h-5 w-5" aria-hidden="true" />
          Keluar
        </button>
      </div>
    </div>
  );
}
