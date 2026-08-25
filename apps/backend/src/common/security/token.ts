import crypto from "node:crypto";

/** Token ngau nhien dang hex (refresh token, reset token). */
export const generateOpaqueToken = (bytes = 48) =>
  crypto.randomBytes(bytes).toString("hex");

/**
 * SHA-256 hex (64 ky tu) - khop voi sessions.refresh_token_hash varchar(64).
 * Refresh token goc chi ton tai phia client, server chi luu ban hash.
 */
export const sha256 = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");

/** So sanh khong phu thuoc thoi gian, tranh timing attack khi doi chieu OTP/token. */
export const safeEqual = (a: string, b: string) => {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
};

/** OTP 6 chu so, chi chua so (theo Cau hinh chung trong contract). */
export const generateOtpCode = () =>
  String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
