import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "../common/errors/app-error";

let client: SupabaseClient | null = null;

const required = (key: string) => {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new AppError(
      500,
      "SUPABASE_CONFIG_MISSING",
      `Missing ${key}. Set it in apps/backend/.env`,
    );
  }
  return value;
};

export const getSupabaseConfig = () => ({
  url: required("SUPABASE_URL"),
  serviceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  publicBucket: process.env.SUPABASE_STORAGE_BUCKET?.trim() || "job-platform-assets",
  privateBucket: process.env.SUPABASE_STORAGE_PRIVATE_BUCKET?.trim() || "",
});

export const getSupabaseClient = () => {
  if (client) {
    return client;
  }

  const { url, serviceRoleKey } = getSupabaseConfig();
  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
};
