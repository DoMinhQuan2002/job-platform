import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { AppError } from "../errors/app-error";
import { ABSOLUTE_MAX_UPLOAD_BYTES } from "../storage/asset-types";

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: ABSOLUTE_MAX_UPLOAD_BYTES,
    files: 1,
  },
});

export const acceptOptionalUpload = (req: Request, res: Response, next: NextFunction) => {
  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("multipart/form-data")) {
    next();
    return;
  }

  multerUpload.single("file")(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      next(
        new AppError(
          400,
          "FILE_TOO_LARGE",
          `File exceeds ${ABSOLUTE_MAX_UPLOAD_BYTES} bytes`,
        ),
      );
      return;
    }

    const message = err instanceof Error ? err.message : "Upload failed";
    next(new AppError(400, "UPLOAD_FAILED", message));
  });
};
