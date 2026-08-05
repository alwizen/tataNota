"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowRight, Sparkles, ShieldCheck, LogIn } from "lucide-react";

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (loading || user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_45%),linear-gradient(135deg,_#f8fbff_0%,_#eef5ff_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_45%),linear-gradient(135deg,_#0f172a_0%,_#111827_100%)] transition-colors">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/60 bg-white/80 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-gray-700/70 dark:bg-gray-900/80">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 px-8 py-10 text-white sm:px-10 lg:px-12">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Kelola tagihan lebih cepat
              </div>
              <div className="mt-6 flex justify-start">
                <img src="/dark.svg" alt="TataNota" className="h-24 w-auto object-contain drop-shadow-lg" />
              </div>
             
              <p className="mt-3 max-w-md text-sm leading-6 text-blue-50 sm:text-base">
                Buat, kirim, dan pantau tagihan Anda dengan antarmuka yang modern dan nyaman untuk bisnis Anda.
              </p>
              <div className="mt-8 space-y-3 text-sm text-blue-50">
                <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                  <ShieldCheck className="h-5 w-5" />
                  <span>Aman dan cepat untuk tim Anda</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                  <ShieldCheck className="h-5 w-5" />
                  <span>Kelola klien dan tagihan dalam satu tempat</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-400">
                  Masuk
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                  Lanjutkan ke akun Anda
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  Pilih akun Google Anda untuk mulai mengelola invoice dan klien.
                </p>
              </div>

              <button
                onClick={signInWithGoogle}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <LogIn className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Lanjutkan dengan Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
