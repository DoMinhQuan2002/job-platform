import cors, { type CorsOptions } from "cors";

/**
 * Allowlist doc tu CORS_ORIGINS (phan tach bang dau phay).
 * Vi dung cookie nen bat buoc credentials: true, keo theo khong duoc dung origin "*".
 */
const parseAllowedOrigins = () =>
  (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

const buildOptions = (): CorsOptions => {
  const allowedOrigins = parseAllowedOrigins();

  return {
    origin: (origin, callback) => {
      // Khong co header Origin: curl, server-to-server, health check -> cho qua.
      if (!origin) {
        callback(null, true);
        return;
      }

      // Origin la -> khong set header CORS, de browser tu chan.
      // Khong tra loi de request van chay binh thuong voi cac client khong phai browser.
      callback(null, allowedOrigins.includes(origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
};

export const corsMiddleware = () => cors(buildOptions());
