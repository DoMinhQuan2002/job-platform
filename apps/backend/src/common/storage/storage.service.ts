import { randomUUID } from "crypto";
import { AppError } from "../errors/app-error";
import { getSupabaseClient, getSupabaseConfig } from "../../config/supabase";
import {
  ASSET_TYPE,
  DEFAULT_SIGNED_URL_EXPIRES_IN,
  extensionFor,
  getAssetSpec,
  type AssetSpec,
  type AssetType,
  validateUpload,
} from "./asset-types";

export type UploadBufferInput = {
  assetType: AssetType | string;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
};

export type StoredObject = {
  assetType: AssetType;
  bucket: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  size: number;
  isPublic: boolean;
  publicUrl: string | null;
};

export type AccessUrl = {
  url: string;
  expiresIn: number | null;
  isPublic: boolean;
};

const bucketFor = (spec: AssetSpec) => {
  const { publicBucket, privateBucket } = getSupabaseConfig();
  if (spec.visibility === "public") {
    return publicBucket;
  }
  if (!privateBucket) {
    throw new AppError(
      500,
      "SUPABASE_PRIVATE_BUCKET_MISSING",
      "Missing SUPABASE_STORAGE_PRIVATE_BUCKET. Private files (resumes) must not use the public bucket.",
    );
  }
  return privateBucket;
};

const throwStorage = (code: string, message: string, cause: string): never => {
  throw new AppError(502, code, message, { cause });
};

const buildPath = (spec: AssetSpec, fileName: string, mimeType: string) => {
  const ext = extensionFor(fileName, mimeType);
  return `${spec.folder}/${randomUUID()}${ext}`;
};

export const storageService = {
  async upload(input: UploadBufferInput): Promise<StoredObject> {
    const spec = validateUpload({
      assetType: input.assetType,
      mimeType: input.mimeType,
      size: input.buffer.byteLength,
    });

    const bucket = bucketFor(spec);
    const storagePath = buildPath(spec, input.fileName, input.mimeType);
    const supabase = getSupabaseClient();

    const { error } = await supabase.storage.from(bucket).upload(storagePath, input.buffer, {
      contentType: input.mimeType,
      upsert: false,
    });

    if (error) {
      throwStorage("SUPABASE_UPLOAD_FAILED", "Supabase upload failed", error.message);
    }

    const isPublic = spec.visibility === "public";
    const publicUrl = isPublic
      ? supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl
      : null;

    return {
      assetType: spec.type,
      bucket,
      storagePath,
      fileName: input.fileName,
      mimeType: input.mimeType,
      size: input.buffer.byteLength,
      isPublic,
      publicUrl,
    };
  },

  async getAccessUrl(
    storagePath: string,
    assetType: AssetType | string,
    expiresIn = DEFAULT_SIGNED_URL_EXPIRES_IN,
  ): Promise<AccessUrl> {
    const spec = getAssetSpec(assetType);
    const bucket = bucketFor(spec);
    const supabase = getSupabaseClient();

    if (spec.visibility === "public") {
      return {
        url: supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl,
        expiresIn: null,
        isPublic: true,
      };
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, expiresIn);

    const signedUrl = data?.signedUrl;
    if (error || !signedUrl) {
      throw new AppError(502, "SUPABASE_SIGNED_URL_FAILED", "Could not create signed URL", {
        cause: error?.message || "empty signed url",
      });
    }

    return { url: signedUrl, expiresIn, isPublic: false };
  },

  resolvePublicUrl(storagePath?: string | null, assetType: AssetType | string = ASSET_TYPE.COMPANY_LOGO): string | null {
    if (!storagePath) return null;
    if (/^https?:\/\//i.test(storagePath) || storagePath.startsWith("data:image/")) {
      return storagePath;
    }
    try {
      const spec = getAssetSpec(assetType);
      const bucket = bucketFor(spec);
      return getSupabaseClient().storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
    } catch {
      return storagePath;
    }
  },

  async remove(storagePath: string, assetType: AssetType | string) {
    const spec = getAssetSpec(assetType);
    const bucket = bucketFor(spec);
    const { error } = await getSupabaseClient().storage.from(bucket).remove([storagePath]);
    if (error) {
      throwStorage("SUPABASE_DELETE_FAILED", "Supabase delete failed", error.message);
    }
  },
};
