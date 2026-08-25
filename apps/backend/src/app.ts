import cookieParser from "cookie-parser";
import express from "express";
import apiRouter from "./routes";
import { corsMiddleware } from "./common/middlewares/cors.middleware";
import { errorMiddleware } from "./common/middlewares/error.middleware";
import { notFoundMiddleware } from "./common/middlewares/not-found.middleware";

/**
 * Khong cau hinh dung thi sau reverse proxy req.ip se la IP cua proxy
 * -> moi user dung chung mot han muc rate limit.
 * Nhan: "true"/"false", so hop (vd. 1), hoac gia tri Express ho tro ("loopback", CIDR...).
 */
const resolveTrustProxy = () => {
  const value = process.env.TRUST_PROXY;

  if (!value || value === "false") {
    return false;
  }

  if (value === "true") {
    return true;
  }

  const hops = Number(value);
  return Number.isInteger(hops) && hops >= 0 ? hops : value;
};

const app = express();

app.set("trust proxy", resolveTrustProxy());

app.use(corsMiddleware());
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

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
