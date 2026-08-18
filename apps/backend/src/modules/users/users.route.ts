import { Router } from "express";

const usersRouter = Router();

usersRouter.get("/", (_req, res) => {
  res.status(200).json({ module: "users", message: "TODO: users list" });
});

export default usersRouter;
