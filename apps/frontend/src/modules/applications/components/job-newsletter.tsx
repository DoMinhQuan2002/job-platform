"use client";

import { useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function JobNewsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
    }, 600);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Left: Icon & Text */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-primary">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              Nhận việc làm phù hợp qua email
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Đăng ký để nhận việc làm mới nhất phù hợp với bạn
            </p>
          </div>
        </div>

        {/* Right: Form */}
        {subscribed ? (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700">
            <Check className="h-4 w-4" />
            <span>Đã đăng ký nhận tin tuyển dụng thành công!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className="w-full min-w-[260px] rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-primary-hover shadow-xs shrink-0"
            >
              {loading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              <span>Đăng ký ngay</span>
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
