import { Request, Response } from "express";
import { authService } from "./auth.service";

export const authController = {
  health: (_req: Request, res: Response) => {
    res.status(200).json(authService.health());
  },
};
