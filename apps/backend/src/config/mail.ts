import { AppError } from "../common/errors/app-error";

export type MailSender = {
  name: string;
  email: string;
};

export type MailConfig =
  | { provider: "brevo"; apiKey: string; from: MailSender }
  | {
      provider: "smtp";
      host: string;
      port: number;
      user?: string;
      pass?: string;
      from: MailSender;
    }
  | { provider: "console" };

const DEFAULT_FROM = "JobPlatform <no-reply@job-platform.local>";

// .trim() vi copy-paste vao .env rat hay dinh space thua: "xkeysib-abc " != "xkeysib-abc".
const env = (key: string) => process.env[key]?.trim() || "";

const missing = (key: string, why: string): never => {
  throw new AppError(500, "MAIL_CONFIG_MISSING", `Missing ${key}. ${why}`);
};

/**
 * Tach "JobPlatform <no-reply@abc.com>" thanh { name, email }.
 * Brevo API can 2 field rieng, khong nhan chuoi gop nhu SMTP.
 */
export const parseFrom = (raw: string): MailSender => {
  const value = raw.trim() || DEFAULT_FROM;
  const match = value.match(/^\s*"?([^"<]*)"?\s*<([^>]+)>\s*$/);

  if (!match) {
    return { name: "JobPlatform", email: value.replace(/^<|>$/g, "").trim() };
  }

  return {
    name: match[1].trim() || "JobPlatform",
    email: match[2].trim(),
  };
};

/** Gop nguoc lai thanh "Ten <email>" cho nodemailer. */
export const formatSender = (sender: MailSender) => `${sender.name} <${sender.email}>`;

const brevoConfig = (): MailConfig => {
  const apiKey =
    env("BREVO_API_KEY") ||
    missing("BREVO_API_KEY", "Lay trong Brevo console > SMTP & API > API Keys.");

  return {
    provider: "brevo",
    apiKey,
    from: parseFrom(env("MAIL_FROM") || env("SMTP_FROM")),
  };
};

const smtpConfig = (): MailConfig => {
  const host =
    env("SMTP_HOST") || missing("SMTP_HOST", "Set no trong apps/backend/.env de dung SMTP.");
  const port = Number(env("SMTP_PORT") || 587);

  return {
    provider: "smtp",
    host,
    port: Number.isFinite(port) && port > 0 ? port : 587,
    user: env("SMTP_USER") || undefined,
    pass: env("SMTP_PASSWORD") || undefined,
    from: parseFrom(env("SMTP_FROM") || env("MAIL_FROM")),
  };
};

/**
 * Chon transport gui mail. Doc process.env luc goi (khong phai top-level)
 * vi dotenv.config() chi chay trong server.ts.
 *
 * Uu tien: MAIL_PROVIDER khai bao ro -> co BREVO_API_KEY -> co SMTP_HOST -> console.
 */
export const getMailConfig = (): MailConfig => {
  const provider = env("MAIL_PROVIDER").toLowerCase();

  if (provider === "brevo") {
    return brevoConfig();
  }

  if (provider === "smtp") {
    return smtpConfig();
  }

  if (provider === "console") {
    return { provider: "console" };
  }

  // Gõ sai chinh ta (vd "brevoo") -> bao loi ngay, thay vi am tham roi ve console
  // roi ngoi thac mac sao OTP khong bao gio gui.
  if (provider) {
    throw new AppError(
      500,
      "MAIL_CONFIG_MISSING",
      `MAIL_PROVIDER khong hop le: "${provider}". Chi nhan brevo | smtp | console.`,
    );
  }

  if (env("BREVO_API_KEY")) {
    return brevoConfig();
  }

  if (env("SMTP_HOST")) {
    return smtpConfig();
  }

  return { provider: "console" };
};
