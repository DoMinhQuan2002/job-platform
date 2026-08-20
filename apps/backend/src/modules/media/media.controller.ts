import type { Request, Response } from "express";
import { AppError } from "../../common/errors/app-error";
import { DEFAULT_SIGNED_URL_EXPIRES_IN } from "../../common/storage";
import { mediaService } from "./media.service";

type JsonUploadBody = {
  assetType?: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  contentBase64?: string;
  storagePath?: string;
};

const readQueryString = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }
  return "";
};

const parseExpiresIn = (value: unknown) => {
  if (value === undefined) {
    return DEFAULT_SIGNED_URL_EXPIRES_IN;
  }
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isFinite(parsed) || parsed < 30 || parsed > 60 * 60 * 24) {
    throw new AppError(400, "INVALID_EXPIRES_IN", "expiresIn must be between 30 and 86400 seconds");
  }
  return parsed;
};

const resolveUpload = (req: Request) => {
  const file = req.file;
  const body = req.body as JsonUploadBody;

  if (file) {
    return {
      assetType: String(body.assetType || ""),
      fileName: file.originalname || body.fileName || "upload",
      mimeType: file.mimetype || body.mimeType || "",
      buffer: file.buffer,
    };
  }

  if (body?.contentBase64) {
    if (!body.fileName || !body.mimeType || !body.assetType) {
      throw new AppError(
        400,
        "INVALID_REQUEST",
        "assetType, fileName, mimeType, contentBase64 are required",
      );
    }
    return {
      assetType: body.assetType,
      fileName: body.fileName,
      mimeType: body.mimeType,
      buffer: Buffer.from(body.contentBase64, "base64"),
    };
  }

  throw new AppError(
    400,
    "INVALID_REQUEST",
    "Send multipart field 'file' or JSON contentBase64",
  );
};

export const mediaController = {
  upload: async (req: Request, res: Response) => {
    const input = resolveUpload(req);
    if (!input.assetType) {
      throw new AppError(400, "INVALID_REQUEST", "assetType is required");
    }

    const data = await mediaService.upload(input);
    res.status(201).json({
      message: "Uploaded successfully",
      data,
    });
  },

  saveIcon: async (req: Request, res: Response) => {
    const body = req.body as JsonUploadBody;
    if (!body?.fileName || !body?.mimeType || !body?.contentBase64) {
      throw new AppError(
        400,
        "INVALID_REQUEST",
        "fileName, mimeType, contentBase64 are required",
      );
    }

    const data = await mediaService.saveIconAsset({
      fileName: body.fileName,
      mimeType: body.mimeType,
      contentBase64: body.contentBase64,
    });

    res.status(201).json({
      message: "Saved icon successfully",
      data,
    });
  },

  getAccessUrl: async (req: Request, res: Response) => {
    const data = await mediaService.getAccessUrl(
      readQueryString(req.query.storagePath),
      readQueryString(req.query.assetType),
      parseExpiresIn(req.query.expiresIn),
    );
    res.status(200).json({ data });
  },

  remove: async (req: Request, res: Response) => {
    const body = req.body as JsonUploadBody;
    await mediaService.remove(body.storagePath || "", body.assetType || "");
    res.status(204).send();
  },
};
