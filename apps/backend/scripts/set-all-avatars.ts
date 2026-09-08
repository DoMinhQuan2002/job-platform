/**
 * Upload 1 avatar chung lên Supabase rồi gán cho mọi user
 * role CANDIDATE | RECRUITER | ADMIN (chưa soft-delete).
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

async function main() {
  if (!existsSync(imagePath)) {
    throw new Error(`Image not found: ${imagePath}`);
  }

  const buffer = readFileSync(imagePath);
  const ext = path.extname(imagePath).toLowerCase() || ".png";
  const mime =
    ext === ".jpg" || ext === ".jpeg"
      ? "image/jpeg"
      : ext === ".webp"
        ? "image/webp"
        : "image/png";

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

  console.log("DB host:", process.env.DB_HOST);
  console.log("DB name:", process.env.DB_NAME);
  console.log("Image:", imagePath, `(${buffer.length} bytes)`);
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
    console.log(`[dry-run] Would upload to ${bucket}/avatars/* and UPDATE ${total} users.`);
    await db.end();
    return;
  }

  const storagePath = `avatars/bulk-${randomUUID()}${ext === ".jpeg" ? ".jpg" : ext}`;
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, buffer, { contentType: mime, upsert: false });

  if (uploadError) {
    throw new Error(`Supabase upload failed: ${uploadError.message}`);
  }

  const publicUrl = supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
  console.log("Uploaded:", storagePath);
  console.log("Public URL:", publicUrl);

  const updateRes = await db.query(
    `UPDATE users u
     SET avatar = $1, updated_at = NOW()
     FROM roles r
     WHERE u.role_id = r.id
       AND u.deleted_at IS NULL
       AND r.name = ANY($2::text[])`,
    [storagePath, ROLES as unknown as string[]],
  );

  console.log(`Updated ${updateRes.rowCount ?? 0} users.avatar → ${storagePath}`);
  await db.end();
}

main().catch(async (err) => {
  console.error(err);
  process.exitCode = 1;
});
