import { LessThan } from "typeorm";
import { AppDataSource } from "../data-source";
import { Job } from "../database/entities/job.entity";
import { JOB_STATUS } from "../common/constants/job";

/**
 * Tự động đóng tất cả tin tuyển dụng OPEN đã quá hạn deadline.
 * Được gọi bởi scheduler mỗi đêm.
 */
export async function closeExpiredJobs(): Promise<void> {
  const jobRepo = AppDataSource.getRepository(Job);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await jobRepo.update(
    {
      status: JOB_STATUS.OPEN,
      deadline: LessThan(today),
    },
    {
      status: JOB_STATUS.CLOSED,
    },
  );

  const count = result.affected ?? 0;
  if (count > 0) {
    console.log(`[scheduler] Đã đóng ${count} tin tuyển dụng hết hạn.`);
  } else {
    console.log("[scheduler] Không có tin tuyển dụng nào cần đóng.");
  }
}
