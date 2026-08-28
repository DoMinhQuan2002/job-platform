import nodemailer, { type Transporter } from "nodemailer";
import { formatSender, getMailConfig, type MailConfig } from "../../config/mail";
import { sendViaBrevo } from "./brevo";

type SmtpConfig = Extract<MailConfig, { provider: "smtp" }>;

let transporter: Transporter | null = null;

const getTransporter = (config: SmtpConfig) => {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: config.user && config.pass ? { user: config.user, pass: config.pass } : undefined,
    // Host chan outbound SMTP -> fail nhanh thay vi treo request cua user.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
  });

  return transporter;
};

export const sendMail = async (input: {
  to: string;
  subject: string;
  text: string;
}) => {
  const config = getMailConfig();

  switch (config.provider) {
    // Chua cau hinh gi (moi truong dev) -> in ra console de con test duoc luong OTP.
    case "console":
      console.info(`[mailer:dev] to=${input.to} subject="${input.subject}"\n${input.text}`);
      return;

    case "brevo":
      await sendViaBrevo(config, input);
      return;

    case "smtp":
      await getTransporter(config).sendMail({
        from: formatSender(config.from),
        to: input.to,
        subject: input.subject,
        text: input.text,
      });
      return;
  }
};

export const sendOtpMail = (to: string, code: string, purpose: "register" | "forgot_password") => {
  const subject =
    purpose === "register" ? "Mã xác thực đăng ký tài khoản" : "Mã xác thực đặt lại mật khẩu";

  return sendMail({
    to,
    subject,
    text: `Mã xác thực của bạn là: ${code}\nMã có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho người khác.`,
  });
};
