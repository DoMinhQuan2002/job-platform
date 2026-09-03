import Link from "next/link";
import type { ReactNode } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminPageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

export function AdminPageHeader({
  title,
  breadcrumbs,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <span key={idx} className="flex items-center gap-1.5">
                  {idx > 0 && <span className="text-slate-400">&gt;</span>}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "font-medium text-slate-800" : ""}>
                      {crumb.label}
                    </span>
                  )}
                </span>
              );
            })}
          </nav>
        )}
      </div>

      {actions && <div className="mt-2 sm:mt-0">{actions}</div>}
    </div>
  );
}
