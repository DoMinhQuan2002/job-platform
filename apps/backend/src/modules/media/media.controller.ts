import { Request, Response } from "express";
import { mediaService } from "./media.service";

type SaveIconBody = {
  fileName: string;
  mimeType: string;
  size: number;
  contentBase64: string;
};

export const mediaController = {
  saveIcon: async (req: Request, res: Response) => {
    const body = req.body as SaveIconBody;

    const savedAsset = await mediaService.saveIconAsset({
      fileName: body.fileName,
      mimeType: body.mimeType,
      size: body.size,
      contentBase64: body.contentBase64,
    });

    res.status(201).json({
      message: "Saved icon successfully",
      data: savedAsset,
    });
  },
};
