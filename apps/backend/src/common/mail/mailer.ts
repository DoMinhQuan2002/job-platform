import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

const isSmtpConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_HOST.trim().length > 0);

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const port = Number(process.env.SMTP_PORT || 587);

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASSWORD
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
  });

  return transporter;
};

export const sendMail = async (input: {
  to: string;
  subject: string;
  text: string;
}) => {
  // Chua cau hinh SMTP (moi truong dev) -> in ra console de con test duoc luong OTP.
  if (!isSmtpConfigured()) {
    console.info(`[mailer:dev] to=${input.to} subject="${input.subject}"\n${input.text}`);
    return;
  }

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || "no-reply@job-platform.local",
    to: input.to,
    subject: input.subject,
    text: input.text,
  });
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
