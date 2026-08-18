import "reflect-metadata";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const requiredEnv = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_STORAGE_BUCKET",
] as const;

for (const key of requiredEnv) {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing env: ${key}. Please set it in apps/backend/.env`);
  }
}

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const bucket = process.env.SUPABASE_STORAGE_BUCKET!;

console.log("Storage test:");
console.log("bucket:", bucket);
console.log("s3 endpoint:", process.env.SUPABASE_STORAGE_S3_ENDPOINT || "(not set)");

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const transparentPngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X3gAAAABJRU5ErkJggg==";

const filePath = `test-storage/${Date.now()}/test.png`;

const contentBuffer = Buffer.from(transparentPngBase64, "base64");

async function main() {
  const uploadResult = await supabase.storage
    .from(bucket)
    .upload(filePath, contentBuffer, {
      contentType: "image/png",
      upsert: false,
    });

  if (uploadResult.error) {
    throw new Error(`Upload failed: ${uploadResult.error.message}`);
  }

  const publicUrlResult = supabase.storage.from(bucket).getPublicUrl(filePath);
  const publicUrl = publicUrlResult.data.publicUrl;

  console.log("Upload OK");
  console.log("  publicUrl:", publicUrl);

  const resp = await fetch(publicUrl, { method: "GET" });
  console.log("  publicUrl GET status:", resp.status);

  if (!resp.ok) {
    throw new Error(
      `Public URL not accessible (HTTP ${resp.status}). Check bucket visibility or policies.`,
    );
  }

  console.log("✅ Storage connection + upload test passed");
}

void main();

