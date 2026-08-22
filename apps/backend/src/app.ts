import express from "express";
import apiRouter from "./routes";
import { errorMiddleware } from "./common/middlewares/error.middleware";
import { notFoundMiddleware } from "./common/middlewares/not-found.middleware";

const app = express();

app.use(express.json({ limit: "5mb" }));

app.use("/api/v1", apiRouter);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "backend",
  });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
