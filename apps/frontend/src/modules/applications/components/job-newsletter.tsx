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
    <div className="rounded-xl border border-border/30 bg-white p-5 shadow-[0_4px_7.5px_rgba(0,0,0,0.04)] sm:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bell className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Nhận việc làm phù hợp qua email
            </h3>
            <p className="text-sm text-muted">
              Đăng ký để nhận việc làm mới nhất phù hợp với bạn
            </p>
          </div>
        </div>

        {subscribed ? (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            <Check className="size-4" />
            <span>Đã đăng ký nhận tin tuyển dụng thành công!</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className="box-border h-9 w-full min-w-[220px] rounded-lg border border-border bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:min-w-[260px]"
            />
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="h-9 w-full shrink-0 rounded-lg px-5 sm:w-auto"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              Đăng ký ngay
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
