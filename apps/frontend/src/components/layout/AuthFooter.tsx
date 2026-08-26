import { BadgeCheck, Building2, Headphones, ShieldCheck } from 'lucide-react';
import React from 'react'

const AuthFooter = () => {
  const assurances = [
    {
      icon: ShieldCheck,
      title: "Bảo mật thông tin",
      description: "Thông tin của bạn được bảo mật tuyệt đối",
    },
    {
      icon: BadgeCheck,
      title: "Miễn phí 100%",
      description: "Tất cả tính năng đều hoàn toàn miễn phí",
    },
    {
      icon: Building2,
      title: "Kết nối uy tín",
      description: "Hợp tác cùng hàng ngàn doanh nghiệp",
    },
    {
      icon: Headphones,
      title: "Hỗ trợ tận tâm",
      description: "Đội ngũ hỗ trợ 24/7 sẵn sàng giúp bạn",
    },
  ] as const;

  return (
    <div
      className="mt-8 border-t border-border/60 bg-primary/5 py-8"
      aria-label="Thông tin về Job Platform"
    >
      <div className="container mx-auto grid gap-x-8 gap-y-6 px-4 sm:grid-cols-2 md:px-0 xl:grid-cols-4">
        {assurances.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-medium text-text">{title}</h2>
              <p className="mt-0.5 text-xs leading-5 text-muted">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AuthFooter