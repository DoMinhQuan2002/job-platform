import { Ratelimit } from "@upstash/ratelimit";
import type { NextFunction, Request, Response } from "express";
import { getRedis } from "../../config/redis";
import { AppError } from "../errors/app-error";

export type RateLimitOptions = {
  /** Dinh danh limiter, dung lam prefix key trong Redis. */
  name: string;
  /** So request toi da trong mot cua so. */
  limit: number;
  /** Do dai cua so, tinh bang giay. */
  windowSeconds: number;
  /** Mac dinh dung req.ip. Tra ve chuoi rong de bo qua limiter cho request do. */
  keyFn?: (req: Request) => string;
};

const limiters = new Map<string, Ratelimit>();

// Ratelimit tao lazy: getRedis() nem loi neu thieu env, khong nen nem ngay luc import module.
const getLimiter = (options: RateLimitOptions) => {
  const cached = limiters.get(options.name);

  if (cached) {
    return cached;
  }

  const limiter = new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(options.limit, `${options.windowSeconds} s`),
    prefix: `rl:${options.name}`,
    analytics: false,
  });

  limiters.set(options.name, limiter);
  return limiter;
};

const setHeaders = (
  res: Response,
  result: { limit: number; remaining: number; reset: number },
) => {
  res.setHeader("RateLimit-Limit", String(result.limit));
  res.setHeader("RateLimit-Remaining", String(Math.max(result.remaining, 0)));
  res.setHeader("RateLimit-Reset", String(Math.ceil(result.reset / 1000)));
};

/**
 * Gioi han tan suat theo IP, luu tren Upstash Redis (sliding window).
 * Dat TRUOC validateBody de chan flood truoc khi ton cong parse body.
 */
export const rateLimit = (options: RateLimitOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = options.keyFn ? options.keyFn(req) : req.ip || "unknown";

    if (key.length === 0) {
      next();
      return;
    }

    let result: Awaited<ReturnType<Ratelimit["limit"]>>;

    try {
      result = await getLimiter(options).limit(key);
    } catch (error) {
      // Fail-open: Redis chet khong duoc keo sap toan bo auth.
      console.error(`Rate limit "${options.name}" unavailable:`, error);
      next();
      return;
    }

    setHeaders(res, result);

    if (result.success) {
      next();
      return;
    }

    const retryAfterSeconds = Math.max(Math.ceil((result.reset - Date.now()) / 1000), 1);
    res.setHeader("Retry-After", String(retryAfterSeconds));

    next(
      new AppError(
        429,
        "TOO_MANY_REQUESTS",
        `Bạn thao tác quá nhiều lần, vui lòng thử lại sau ${retryAfterSeconds} giây`,
      ),
    );
  };
};
