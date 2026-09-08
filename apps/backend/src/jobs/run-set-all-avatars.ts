import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

/**
 * Chạy 1 lần `npx tsx scripts/set-all-avatars.ts` từ root `apps/backend`.
 * Dùng bởi cron scheduler (mỗi giờ).
 */
export async function runSetAllAvatars(): Promise<void> {
  const backendRoot = path.resolve(__dirname, "../..");
  const npxBin = process.platform === "win32" ? "npx.cmd" : "npx";

  console.log(`[scheduler] set-all-avatars cwd=${backendRoot}`);

  const { stdout, stderr } = await execFileAsync(
    npxBin,
    ["tsx", "scripts/set-all-avatars.ts"],
    {
      cwd: backendRoot,
      env: process.env,
      timeout: 5 * 60 * 1000,
      windowsHide: true,
      maxBuffer: 2 * 1024 * 1024,
    },
  );

  if (stdout.trim()) {
    console.log(stdout.trimEnd());
  }
  if (stderr.trim()) {
    console.error(stderr.trimEnd());
  }
}
