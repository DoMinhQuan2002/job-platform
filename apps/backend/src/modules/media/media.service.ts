import { AppError } from "../../common/errors/app-error";
import {
  DEFAULT_SIGNED_URL_EXPIRES_IN,
  storageService,
  type StoredObject,
} from "../../common/storage";

export type MediaUploadInput = {
  assetType: string;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
};

export type MediaAssetResponse = {
  fileName: string;
  mimeType: string;
  size: number;
  assetType: string;
  storagePath: string;
  isPublic: boolean;
  url: string | null;
  expiresIn: number | null;
};

const toResponse = (
  stored: StoredObject,
  access: { url: string; isPublic: boolean; expiresIn: number | null },
): MediaAssetResponse => ({
  fileName: stored.fileName,
  mimeType: stored.mimeType,
  size: stored.size,
  assetType: stored.assetType,
  storagePath: stored.storagePath,
  isPublic: access.isPublic,
  url: access.url,
  expiresIn: access.expiresIn,
});

export const mediaService = {
  async upload(input: MediaUploadInput): Promise<MediaAssetResponse> {
    const stored = await storageService.upload(input);
    const access = stored.isPublic
      ? { url: stored.publicUrl as string, isPublic: true, expiresIn: null }
      : await storageService.getAccessUrl(stored.storagePath, stored.assetType);

    return toResponse(stored, access);
  },

  async saveIconAsset(input: {
    fileName: string;
    mimeType: string;
    contentBase64: string;
  }) {
    return this.upload({
      assetType: "company_icon",
      fileName: input.fileName,
      mimeType: input.mimeType,
      buffer: Buffer.from(input.contentBase64, "base64"),
    });
  },

  async getAccessUrl(
    storagePath: string,
    assetType: string,
    expiresIn = DEFAULT_SIGNED_URL_EXPIRES_IN,
  ) {
    if (!storagePath || !assetType) {
      throw new AppError(400, "INVALID_REQUEST", "storagePath and assetType are required");
    }
    const access = await storageService.getAccessUrl(storagePath, assetType, expiresIn);
    return {
      storagePath,
      assetType,
      ...access,
    };
  },

  async remove(storagePath: string, assetType: string) {
    if (!storagePath || !assetType) {
      throw new AppError(400, "INVALID_REQUEST", "storagePath and assetType are required");
    }
    await storageService.remove(storagePath, assetType);
  },
};
