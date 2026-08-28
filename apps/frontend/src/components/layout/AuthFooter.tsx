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
      className="mt-6 border-t border-border/60 bg-primary/5 py-6 md:mt-4 md:py-5 lg:mt-8 lg:py-8  "
      aria-label="Thông tin về Job Platform"
    >
      <div className=" container mx-auto grid gap-x-8 gap-y-6 px-4 sm:grid-cols-2 sm:px-6 md:grid-cols-4 md:gap-4 md:px-8 lg:gap-6 xl:px-6">
        {assurances.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex min-w-0 items-start gap-3 md:gap-2.5 lg:gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary md:size-9 lg:size-10">
              <Icon className="size-5 md:size-4.5 lg:size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-medium leading-5 text-text">{title}</h2>
              <p className="mt-0.5 text-xs leading-5 text-muted md:leading-[18px] lg:leading-5">
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
