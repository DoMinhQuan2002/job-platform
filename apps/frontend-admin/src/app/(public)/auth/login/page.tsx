"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const { login, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Nếu đã đăng nhập thì tự động chuyển hướng về trang admin
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/admin");
    }
  }, [isAuthenticated, router]);

  // Nếu đang kiểm tra phiên làm việc hoặc đã xác thực, không hiển thị form đăng nhập tránh chớp màn hình
  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="size-9 rounded-full border-2 border-[#00288E]/20 border-t-[#00288E] animate-spin" />
          <p className="text-xs font-medium text-slate-400">Đang kiểm tra phiên làm việc...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await login({
        email: email.trim(),
        password,
      });

      if (res.success) {
        router.replace("/admin");
      } else {
        setError(res.message || "Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-xl p-7 lg:p-9 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="size-12 rounded-xl bg-[#00288E] text-white flex items-center justify-center mx-auto shadow-md shadow-[#00288E]/20">
          <ShieldCheck className="size-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Admin Portal
        </h1>
        <p className="text-sm text-slate-500">
          Đăng nhập vào bảng điều khiển quản trị hệ thống
        </p>
      </div>

      {/* Session Expired / Notice Banner */}
      {reason === "session_expired" && (
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200/80 p-3.5 text-xs text-amber-900 animate-fade-in">
          <AlertCircle className="size-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="leading-relaxed">
            Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục quản trị.
          </p>
        </div>
      )}

      {reason === "unauthorized" && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200/80 p-3.5 text-xs text-red-900 animate-fade-in">
          <AlertCircle className="size-4 text-red-600 mt-0.5 shrink-0" />
          <p className="leading-relaxed">
            Tài khoản không có quyền quản trị viên (Admin). Vui lòng đăng nhập bằng tài khoản phù hợp.
          </p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200/80 p-3.5 text-xs text-red-700 animate-fade-in">
          <AlertCircle className="size-4 text-red-600 mt-0.5 shrink-0" />
          <p className="leading-relaxed">{error}</p>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Email đăng nhập
          </label>
          <div className="relative">
            <Mail className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@jobplatform.vn"
              className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00288E] focus:ring-1 focus:ring-[#00288E] transition-colors"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Mật khẩu
          </label>
          <div className="relative">
            <Lock className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00288E] focus:ring-1 focus:ring-[#00288E] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-[#00288E] hover:bg-[#00288E]/90 active:bg-[#001D6E] text-white font-medium text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-[#00288E]/20 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="size-4 animate-spin" />
              Đang xác thực...
            </>
          ) : (
            "Đăng nhập quản trị"
          )}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-dvh w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/40">
      <Suspense
        fallback={
          <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-8 text-center animate-pulse">
            <div className="size-12 rounded-xl bg-slate-200 mx-auto mb-4" />
            <div className="h-6 w-32 bg-slate-200 rounded mx-auto mb-2" />
            <div className="h-4 w-48 bg-slate-200 rounded mx-auto" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
