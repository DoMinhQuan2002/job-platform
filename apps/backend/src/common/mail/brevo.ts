import { AppError } from "../errors/app-error";
import type { MailConfig } from "../../config/mail";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const TIMEOUT_MS = 10_000;

type BrevoConfig = Extract<MailConfig, { provider: "brevo" }>;

/**
 * Gui mail qua HTTPS (port 443) thay vi SMTP.
 * Free tier cua Render/Vercel chan outbound port 25/465/587 -> nodemailer treo roi timeout,
 * con port 443 thi luon mo.
 */
export const sendViaBrevo = async (
  config: BrevoConfig,
  input: { to: string; subject: string; text: string },
) => {
  let response: Response;

  try {
    response = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": config.apiKey,
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: config.from,
        to: [{ email: input.to }],
        subject: input.subject,
        textContent: input.text,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    // Timeout / mat mang -> khong de request HTTP cua user treo theo.
    throw new AppError(
      502,
      "MAIL_SEND_FAILED",
      `Khong goi duoc Brevo API: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new AppError(
      502,
      "MAIL_SEND_FAILED",
      `Brevo API tra ve ${response.status}: ${body || "(empty body)"}`,
    );
  }
};
