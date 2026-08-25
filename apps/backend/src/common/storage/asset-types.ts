import { AppError } from "../errors/app-error";

export const ASSET_TYPE = {
  USER_AVATAR: "user_avatar",
  COMPANY_LOGO: "company_logo",
  COMPANY_ICON: "company_icon",
  RESUME: "resume",
} as const;

export type AssetType = (typeof ASSET_TYPE)[keyof typeof ASSET_TYPE];

export type AssetVisibility = "public" | "private";

export type AssetSpec = {
  type: AssetType;
  folder: string;
  visibility: AssetVisibility;
  maxBytes: number;
  mimeTypes: readonly string[];
};

const MB = 1024 * 1024;

const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
const LOGO_MIME = [...IMAGE_MIME, "image/svg+xml"] as const;

const SPECS: Record<AssetType, AssetSpec> = {
  [ASSET_TYPE.USER_AVATAR]: {
    type: ASSET_TYPE.USER_AVATAR,
    folder: "avatars",
    visibility: "public",
    maxBytes: 5 * MB,
    mimeTypes: IMAGE_MIME,
  },
  [ASSET_TYPE.COMPANY_LOGO]: {
    type: ASSET_TYPE.COMPANY_LOGO,
    folder: "logos",
    visibility: "public",
    maxBytes: 2 * MB,
    mimeTypes: LOGO_MIME,
  },
  [ASSET_TYPE.COMPANY_ICON]: {
    type: ASSET_TYPE.COMPANY_ICON,
    folder: "icons",
    visibility: "public",
    maxBytes: 2 * MB,
    mimeTypes: LOGO_MIME,
  },
  [ASSET_TYPE.RESUME]: {
    type: ASSET_TYPE.RESUME,
    folder: "resumes",
    visibility: "private",
    maxBytes: 10 * MB,
    mimeTypes: ["application/pdf"],
  },
};

export const ABSOLUTE_MAX_UPLOAD_BYTES = 10 * MB;
export const DEFAULT_SIGNED_URL_EXPIRES_IN = 3600;

export const isAssetType = (value: string): value is AssetType =>
  Object.values(ASSET_TYPE).includes(value as AssetType);

export const getAssetSpec = (assetType: string): AssetSpec => {
  if (!isAssetType(assetType)) {
    throw new AppError(
      400,
      "INVALID_ASSET_TYPE",
      `assetType must be one of: ${Object.values(ASSET_TYPE).join(", ")}`,
    );
  }
  return SPECS[assetType];
};

const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "application/pdf": ".pdf",
};

export const extensionFor = (fileName: string, mimeType: string) => {
  const fromName = fileName.match(/(\.[a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (fromName && fromName.length <= 8) {
    return fromName;
  }
  return MIME_EXT[mimeType] || "";
};

export const validateUpload = (input: {
  assetType: string;
  mimeType: string;
  size: number;
}) => {
  const spec = getAssetSpec(input.assetType);
  if (!spec.mimeTypes.includes(input.mimeType)) {
    throw new AppError(
      400,
      "UNSUPPORTED_MIME",
      `mimeType ${input.mimeType} is not allowed for ${spec.type}`,
      { allowed: spec.mimeTypes },
    );
  }
  if (input.size <= 0) {
    throw new AppError(400, "INVALID_FILE", "File is empty");
  }
  if (input.size > spec.maxBytes) {
    throw new AppError(
      400,
      "FILE_TOO_LARGE",
      `File exceeds ${spec.maxBytes} bytes for ${spec.type}`,
      { maxBytes: spec.maxBytes },
    );
  }
  return spec;
};
