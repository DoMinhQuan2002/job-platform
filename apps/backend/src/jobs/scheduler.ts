import cron from "node-cron";
import { closeExpiredJobs } from "./close-expired-jobs";

/**
 * Khởi động tất cả cron job của hệ thống.
 * Gọi hàm này một lần duy nhất sau khi database đã kết nối.
 */
export function startScheduler(): void {
  // Chạy lúc 00:05 mỗi ngày (UTC+7) — đóng tin hết hạn qua đêm.
  // Biểu thức: phút giờ ngày tháng thứ
  cron.schedule(
    "5 17 * * *", // 00:05 ICT = 17:05 UTC hôm trước
    async () => {
      console.log("[scheduler] Bắt đầu kiểm tra tin tuyển dụng hết hạn...");
      try {
        await closeExpiredJobs();
      } catch (error) {
        console.error("[scheduler] Lỗi khi đóng tin hết hạn:", error);
      }
    },
    {
      timezone: "Asia/Ho_Chi_Minh",
    },
  );

  console.log("[scheduler] Đã khởi động. Cron job đóng tin hết hạn chạy lúc 00:05 ICT mỗi ngày.");
}
