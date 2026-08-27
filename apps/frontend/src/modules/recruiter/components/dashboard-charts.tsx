const points = "0,170 30,170 60,150 90,150 120,120 150,125 180,115 210,125 240,135 270,115 300,115 330,80 360,85 390,115 420,125 450,140 480,125 510,125 540,115 570,135 600,145";

export function CandidateTrendChart() {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm lg:col-span-2">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-text">Thống kê ứng viên mới</h2>
        <div className="flex gap-4 text-xs text-muted"><span className="flex items-center gap-2"><i className="h-1 w-3 rounded bg-primary" />Kỳ này</span><span className="flex items-center gap-2"><i className="h-1 w-3 rounded bg-primary/25" />Kỳ trước</span></div>
      </div>
      <div className="h-72 w-full overflow-hidden">
        <svg className="h-full w-full" viewBox="0 0 600 210" preserveAspectRatio="none" role="img" aria-label="Biểu đồ số ứng viên mới">
          {[10, 50, 90, 130, 170, 200].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="currentColor" className="text-border" strokeDasharray="4 4" />)}
          <polyline fill="none" points="0,180 60,165 120,165 180,165 240,165 300,135 360,140 420,150 480,145 540,148 600,145" stroke="currentColor" className="text-primary/25" strokeDasharray="5 5" strokeWidth="2" />
          <polygon points={`${points} 600,200 0,200`} fill="currentColor" className="text-primary/5" />
          <polyline fill="none" points={points} stroke="currentColor" className="text-primary" strokeWidth="3" />
        </svg>
      </div>
      <div className="flex justify-between text-[11px] text-muted"><span>24/05</span><span>01/06</span><span>09/06</span><span>17/06</span><span>24/06</span></div>
    </section>
  );
}

const statuses = [
  ["Đã nộp", "78", "50.0%", "bg-primary"],
  ["HR đã xem", "32", "20.5%", "bg-success"],
  ["Mời phỏng vấn", "18", "11.5%", "bg-warning"],
  ["Trúng tuyển", "12", "7.7%", "bg-lime-500"],
  ["Không đạt", "16", "10.3%", "bg-danger"],
];

export function CandidateStatusChart() {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <h2 className="mb-6 font-bold text-text">Ứng viên theo trạng thái</h2>
      <div className="mx-auto mb-6 grid size-44 place-items-center rounded-full" style={{ background: "conic-gradient(var(--primary) 0 50%, var(--color-success) 50% 70.5%, var(--color-warning) 70.5% 82%, #84cc16 82% 89.7%, var(--destructive) 89.7%)" }}>
        <div className="grid size-28 place-items-center rounded-full bg-surface text-center"><div><strong className="block text-2xl">156</strong><span className="text-xs text-muted">Tổng ứng viên</span></div></div>
      </div>
      <div className="space-y-2 text-sm">{statuses.map(([label, value, percent, color]) => <div key={label} className="flex items-center"><i className={`mr-2 size-2.5 rounded-full ${color}`} /><span className="flex-1 text-muted">{label}</span><strong className="mr-1">{value}</strong><span className="text-xs text-muted">({percent})</span></div>)}</div>
      <button type="button" className="mt-5 w-full rounded-md border border-border py-2 text-xs font-medium text-primary hover:bg-primary/5">Xem chi tiết</button>
    </section>
  );
}
