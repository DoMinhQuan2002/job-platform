import { ArrowRight, CheckCircle2, UserPlus, Users } from "lucide-react";

const jobs = [
  ["Chuyên viên Digital Marketing", "Đang tuyển", "18", "30/06/2024", "text-success bg-success/10"],
  ["Nhân viên Kinh doanh", "Đã duyệt", "25", "15/07/2024", "text-primary bg-primary/10"],
  ["Lập trình viên Backend", "Chờ duyệt", "5", "10/06/2024", "text-warning bg-warning/10"],
  ["Nhân viên Telesales", "Đã đóng", "12", "31/05/2024", "text-muted bg-background"],
];

export function RecentJobs() {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <h2 className="border-b border-border p-5 font-bold">Tin đăng gần đây</h2>
      <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-background text-xs uppercase text-muted"><tr><th className="p-4">Vị trí tuyển dụng</th><th>Trạng thái</th><th>Ứng viên</th><th>Hạn nộp</th></tr></thead><tbody className="divide-y divide-border">{jobs.map(([name, status, count, date, color]) => <tr key={name} className="hover:bg-background/70"><td className="p-4 font-medium">{name}</td><td><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>{status}</span></td><td>{count}</td><td className="text-muted">{date}</td></tr>)}</tbody></table></div>
      <button className="flex w-full items-center justify-between border-t border-border p-4 text-sm font-medium text-primary">Xem tất cả tin đăng <ArrowRight className="size-4" /></button>
    </section>
  );
}

export function RecentActivity() {
  const items = [
    { icon: UserPlus, text: "Nguyễn Văn A đã ứng tuyển vào Digital Marketing.", time: "2 phút trước", color: "text-primary bg-primary/10" },
    { icon: CheckCircle2, text: "Tin Nhân viên Kinh doanh đã được duyệt.", time: "15 phút trước", color: "text-success bg-success/10" },
    { icon: Users, text: "Công ty của bạn đã được xác thực.", time: "2 giờ trước", color: "text-purple bg-purple/10" },
  ];
  return <section className="flex rounded-lg border border-border bg-surface shadow-sm"><div className="flex w-full flex-col"><h2 className="border-b border-border p-5 font-bold">Hoạt động gần đây</h2><div className="flex-1 space-y-5 p-5">{items.map(({ icon: Icon, text, time, color }) => <div key={text} className="flex gap-3"><span className={`grid size-8 shrink-0 place-items-center rounded-full ${color}`}><Icon className="size-4" /></span><div><p className="text-sm leading-relaxed">{text}</p><span className="text-xs text-muted">{time}</span></div></div>)}</div><button type="button" className="flex w-full items-center justify-between border-t border-border p-4 text-sm font-medium text-primary">Xem tất cả hoạt động <ArrowRight className="size-4" /></button></div></section>;
}
