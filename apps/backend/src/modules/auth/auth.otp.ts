import { getRedis } from "../../config/redis";
import { generateOtpCode, safeEqual, sha256 } from "../../common/security/token";
import {
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_TTL_SECONDS,
  type OtpPurpose,
  otpCooldownKey,
  otpKey,
} from "./auth.constants";

type OtpRecord = {
  codeHash: string;
  attempts: number;
};

export type OtpVerifyResult = "OK" | "NOT_FOUND" | "MISMATCH";

// Upstash tu deserialize JSON, nhung tuy phien ban co the tra ve string -> parse phong thu.
const parseRecord = (raw: unknown): OtpRecord | null => {
  if (!raw) {
    return null;
  }

  const value = typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;

  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Partial<OtpRecord>;
  return typeof record.codeHash === "string"
    ? { codeHash: record.codeHash, attempts: Number(record.attempts ?? 0) }
    : null;
};

/** Con trong thoi gian cho giua 2 lan gui thi tra ve so giay con lai, nguoc lai tra ve 0. */
export const getResendCooldown = async (purpose: OtpPurpose, email: string) => {
  const ttl = await getRedis().ttl(otpCooldownKey(purpose, email));
  return ttl > 0 ? ttl : 0;
};

export const hasPendingOtp = async (purpose: OtpPurpose, email: string) => {
  const ttl = await getRedis().ttl(otpKey(purpose, email));
  return ttl > 0;
};

/** Sinh OTP moi, ghi de OTP cu va bat cooldown. Tra ve ma goc de gui email. */
export const issueOtp = async (purpose: OtpPurpose, email: string) => {
  const redis = getRedis();
  const code = generateOtpCode();
  const record: OtpRecord = { codeHash: sha256(code), attempts: 0 };

  await redis.set(otpKey(purpose, email), JSON.stringify(record), { ex: OTP_TTL_SECONDS });
  await redis.set(otpCooldownKey(purpose, email), "1", { ex: OTP_RESEND_COOLDOWN_SECONDS });

  return code;
};

/** OTP dung 1 lan: dung thi xoa key, sai qua OTP_MAX_ATTEMPTS lan cung xoa key. */
export const verifyOtp = async (
  purpose: OtpPurpose,
  email: string,
  code: string,
): Promise<OtpVerifyResult> => {
  const redis = getRedis();
  const key = otpKey(purpose, email);
  const record = parseRecord(await redis.get(key));

  if (!record) {
    return "NOT_FOUND";
  }

  if (!safeEqual(record.codeHash, sha256(code))) {
    const attempts = record.attempts + 1;

    if (attempts >= OTP_MAX_ATTEMPTS) {
      await redis.del(key);
    } else {
      const ttl = await redis.ttl(key);
      await redis.set(key, JSON.stringify({ ...record, attempts }), {
        ex: ttl > 0 ? ttl : OTP_TTL_SECONDS,
      });
    }

    return "MISMATCH";
  }

  await redis.del(key);
  await redis.del(otpCooldownKey(purpose, email));
  return "OK";
};

export const clearOtp = async (purpose: OtpPurpose, email: string) => {
  const redis = getRedis();
  await redis.del(otpKey(purpose, email));
  await redis.del(otpCooldownKey(purpose, email));
};
