import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

export const getRedis = () => {
  if (redis) {
    return redis;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || url.trim().length === 0 || !token || token.trim().length === 0) {
    throw new Error(
      "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN. Set them in apps/backend/.env",
    );
  }

  redis = new Redis({ url, token });
  return redis;
};

export const pingRedis = async () => {
  const result = await getRedis().ping();

  if (result !== "PONG") {
    throw new Error(`Redis ping failed: ${String(result)}`);
  }

  return result;
};
