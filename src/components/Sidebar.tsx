import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  FileText,
  LayoutTemplate,
  LogOut,
  Settings,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useState } from "react";

const navigation = [
  { name: "Beranda", href: "/dashboard", icon: LayoutDashboard },
  { name: "Klien", href: "/dashboard/clients", icon: Users },
  { name: "Tagihan", href: "/dashboard/invoices", icon: FileText },
  { name: "Template", href: "/dashboard/layouts", icon: LayoutTemplate },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);
    const savedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(savedTheme);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      const confirmed = window.confirm("Yakin ingin keluar dari akun?");
      if (!confirmed) {
        return;
      }
    }

    setIsMenuOpen(false);
    signOut();
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className="hidden h-screen w-64 flex-col border-r border-gray-200 bg-white transition-colors dark:border-gray-800 dark:bg-gray-900 md:flex">
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-100 px-4 dark:border-gray-800">
          <img src="/logo.svg" alt="TataNota" className="h-80 w-80 object-contain" />
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto pb-4 pt-5">
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
                      ? "bg-blue-50 font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
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
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profil" className="h-full w-full object-cover" />
              ) : (
                <span>{user?.displayName?.[0] || "U"}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.displayName || "Pengguna"}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            <ThemeToggle />
          </div>
          <button
            onClick={signOut}
            className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-red-50 hover:text-red-700 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
          >
            <LogOut className="mr-3 h-5 w-5" aria-hidden="true" />
            Keluar
          </button>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-gray-800 dark:bg-gray-900/95 md:hidden">
        <nav className="flex items-center justify-around gap-1 px-2 py-2">
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
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                  "flex flex-1 flex-col items-center justify-center rounded-xl px-2 py-2 text-[10px] font-semibold transition-all"
                )}
              >
                <item.icon className="mb-1 h-5 w-5" aria-hidden="true" />
                <span className="leading-none">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2 md:hidden">
        {isMenuOpen && mounted ? (
          <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white/95 p-2 shadow-xl backdrop-blur dark:border-gray-700 dark:bg-gray-800/95">
            <button
              onClick={handleToggleTheme}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Mode terang" : "Mode gelap"}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </div>
        ) : null}

        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          aria-label="Open settings"
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </>
  );
}
