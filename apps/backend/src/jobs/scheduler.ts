import cron from "node-cron";
import { closeExpiredJobs } from "./close-expired-jobs";
import { runSetAllAvatars } from "./run-set-all-avatars";

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

  // Mỗi giờ đúng phút 0 (ICT): sync avatar bulk 1 lần.
  cron.schedule(
    "0 * * * *",
    async () => {
      console.log("[scheduler] Bắt đầu set-all-avatars (hourly)...");
      try {
        await runSetAllAvatars();
        console.log("[scheduler] set-all-avatars xong.");
      } catch (error) {
        console.error("[scheduler] Lỗi set-all-avatars:", error);
      }
    },
    {
      timezone: "Asia/Ho_Chi_Minh",
    },
  );

  console.log(
    "[scheduler] Đã khởi động. Đóng tin hết hạn 00:05 ICT mỗi ngày; set-all-avatars mỗi giờ :00 ICT.",
  );
}
