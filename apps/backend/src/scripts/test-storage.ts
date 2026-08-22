import "reflect-metadata";
import dotenv from "dotenv";
import { getSupabaseClient, getSupabaseConfig } from "../config/supabase";

dotenv.config();

const transparentPngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X3gAAAABJRU5ErkJggg==";

async function main() {
  const { publicBucket } = getSupabaseConfig();
  const supabase = getSupabaseClient();
  const filePath = `test-storage/${Date.now()}/test.png`;
  const contentBuffer = Buffer.from(transparentPngBase64, "base64");

  console.log("Storage test:");
  console.log("  public bucket:", publicBucket);
  console.log("  private bucket:", process.env.SUPABASE_STORAGE_PRIVATE_BUCKET || "(not set)");

  const uploadResult = await supabase.storage.from(publicBucket).upload(filePath, contentBuffer, {
    contentType: "image/png",
    upsert: false,
  });

  if (uploadResult.error) {
    throw new Error(`Upload failed: ${uploadResult.error.message}`);
  }

  const publicUrl = supabase.storage.from(publicBucket).getPublicUrl(filePath).data.publicUrl;
  console.log("Upload OK");
  console.log("  publicUrl:", publicUrl);

  const resp = await fetch(publicUrl, { method: "GET" });
  console.log("  publicUrl GET status:", resp.status);

  if (!resp.ok) {
    throw new Error(
      `Public URL not accessible (HTTP ${resp.status}). Check bucket visibility or policies.`,
    );
  }

  await supabase.storage.from(publicBucket).remove([filePath]);
  console.log("Storage connection + upload test passed");
}

void main();
