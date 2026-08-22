import { ReactNode } from "react";

type PageSectionProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageSection({ title, description, children }: PageSectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
