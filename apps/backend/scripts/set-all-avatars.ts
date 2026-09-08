/**
 * Upload 1 avatar chung lên Supabase rồi gán cho mọi user
 * role CANDIDATE | RECRUITER | ADMIN (chưa soft-delete).
 *
 * Lưu FULL public URL (https://...) thay vì storage path.
 * Lý do: users.service remove(oldAvatar) khi đổi/xóa avatar — nếu mọi
 * user cùng path `avatars/xxx.png` thì 1 người đổi ảnh là xóa file chung
 * → cả hệ thống mất avatar.
 *
 * Usage (từ apps/backend):
 *   npx tsx scripts/set-all-avatars.ts
 *   npx tsx scripts/set-all-avatars.ts --dry-run
 *   npx tsx scripts/set-all-avatars.ts path/to/avatar.png
 */
import { randomUUID } from "crypto";
import { readFileSync, existsSync } from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { Client } from "pg";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const ROLES = ["CANDIDATE", "RECRUITER", "ADMIN"] as const;
const DEFAULT_IMAGE = path.resolve(__dirname, "_bulk-avatar.png");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const imageArg = args.find((a) => !a.startsWith("--"));
const imagePath = path.resolve(imageArg || DEFAULT_IMAGE);

const required = (key: string) => {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`Missing ${key} in apps/backend/.env`);
  return value;
};

async function assertPublicUrlOk(url: string): Promise<void> {
  // Đợi storage propagate ngắn
  await new Promise((r) => setTimeout(r, 800));
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Public avatar URL not reachable (HTTP ${res.status}): ${url}${body ? ` — ${body.slice(0, 200)}` : ""}`,
    );
  }
  const ctype = res.headers.get("content-type") || "";
  if (!ctype.startsWith("image/")) {
    throw new Error(`Public avatar URL did not return image/* (got ${ctype}): ${url}`);
  }
}

async function main() {
  if (!existsSync(imagePath)) {
    throw new Error(`Image not found: ${imagePath}`);
  }

  const buffer = readFileSync(imagePath);
  if (buffer.length < 100) {
    throw new Error(`Image too small (${buffer.length} bytes) — refuse upload`);
  }

  const supabaseUrl = required("SUPABASE_URL");
  const serviceKey = required("SUPABASE_SERVICE_ROLE_KEY");
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "job-platform-assets";

  const sslEnabled = process.env.DB_SSL === "true" || process.env.DB_SSL === "1";
  const db = new Client({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME || process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "job_platform",
    ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
  });

  const storagePath = `avatars/bulk-${randomUUID()}.png`;

  console.log("DB host:", process.env.DB_HOST);
  console.log("DB name:", process.env.DB_NAME);
  console.log("Image:", imagePath, `(${buffer.length} bytes)`);
  console.log("Storage path:", storagePath);
  console.log("Roles:", ROLES.join(", "));
  console.log("Dry run:", dryRun);

  await db.connect();

  const countRes = await db.query<{ role: string; cnt: string }>(
    `SELECT r.name AS role, COUNT(u.id)::text AS cnt
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.deleted_at IS NULL AND r.name = ANY($1::text[])
     GROUP BY r.name
     ORDER BY r.name`,
    [ROLES as unknown as string[]],
  );

  console.log("Users to update by role:");
  for (const row of countRes.rows) {
    console.log(`  ${row.role}: ${row.cnt}`);
  }

  const totalRes = await db.query<{ total: string }>(
    `SELECT COUNT(u.id)::text AS total
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.deleted_at IS NULL AND r.name = ANY($1::text[])`,
    [ROLES as unknown as string[]],
  );
  const total = Number(totalRes.rows[0]?.total ?? 0);
  if (total === 0) {
    console.log("No users matched. Exit.");
    await db.end();
    return;
  }

  if (dryRun) {
    console.log(`[dry-run] Would upload ${bucket}/${storagePath} and UPDATE ${total} users with public URL.`);
    await db.end();
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType: "image/png",
      upsert: false,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(`Supabase upload failed: ${uploadError.message}`);
  }

  const publicUrl = supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
  console.log("Uploaded:", storagePath);
  console.log("Public URL:", publicUrl);

  await assertPublicUrlOk(publicUrl);
  console.log("Public URL verified OK");

  // Lưu https URL — tránh storageService.remove(sharedPath) khi 1 user đổi avatar.
  const updateRes = await db.query(
    `UPDATE users u
     SET avatar = $1, updated_at = NOW()
     FROM roles r
     WHERE u.role_id = r.id
       AND u.deleted_at IS NULL
       AND r.name = ANY($2::text[])`,
    [publicUrl, ROLES as unknown as string[]],
  );

  console.log(`Updated ${updateRes.rowCount ?? 0} users.avatar → ${publicUrl}`);
  await db.end();
}

main().catch(async (err) => {
  console.error(err);
  process.exitCode = 1;
});
