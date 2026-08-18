import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { AppDataSource } from "../../data-source";
import { MediaAssetEntity } from "../../database/entities/media-asset.entity";
import { AppError } from "../../common/errors/app-error";

type SaveIconInput = {
  fileName: string;
  mimeType: string;
  size: number;
  contentBase64: string;
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseStorageBucket = process.env.SUPABASE_STORAGE_BUCKET || "job-platform-assets";

const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new AppError(
      500,
      "SUPABASE_CONFIG_MISSING",
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey);
};

export const mediaService = {
  async saveIconAsset(input: SaveIconInput) {
    const supabase = getSupabaseClient();
    const cleanName = input.fileName.replace(/\s+/g, "-").toLowerCase();
    const storagePath = `icons/${Date.now()}-${randomUUID()}-${cleanName}`;

    const fileBuffer = Buffer.from(input.contentBase64, "base64");

    const uploadResult = await supabase.storage
      .from(supabaseStorageBucket)
      .upload(storagePath, fileBuffer, {
        contentType: input.mimeType,
        upsert: false,
      });

    if (uploadResult.error) {
      throw new AppError(502, "SUPABASE_UPLOAD_FAILED", "Supabase upload failed", {
        cause: uploadResult.error.message,
      });
    }

    const publicUrlResult = supabase.storage
      .from(supabaseStorageBucket)
      .getPublicUrl(storagePath);

    const mediaRepo = AppDataSource.getRepository(MediaAssetEntity);
    const mediaAsset = mediaRepo.create({
      fileName: input.fileName,
      mimeType: input.mimeType,
      size: input.size,
      assetType: "company_icon",
      storagePath,
      publicUrl: publicUrlResult.data.publicUrl,
    });

    return mediaRepo.save(mediaAsset);
  },
};
