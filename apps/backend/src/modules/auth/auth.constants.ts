/** Cau hinh chung - khop bang "Cau hinh chung" trong docs/api-contract/group1/auth.md */

export const OTP_LENGTH = 6;
export const OTP_TTL_SECONDS = 300; // 5 phut
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const OTP_MAX_ATTEMPTS = 5;

export const RESET_TOKEN_TTL_SECONDS = 900; // 15 phut
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 ngay

export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const COOKIE_PATH = "/api/v1";

export type OtpPurpose = "register" | "forgot_password";

export const otpKey = (purpose: OtpPurpose, email: string) => `otp:${purpose}:${email}`;
export const otpCooldownKey = (purpose: OtpPurpose, email: string) =>
  `otp:${purpose}:cooldown:${email}`;
export const resetTokenKey = (token: string) => `reset_token:${token}`;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
