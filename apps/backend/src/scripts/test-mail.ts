import dotenv from "dotenv";
import { formatSender, getMailConfig } from "../config/mail";
import { sendOtpMail } from "../common/mail/mailer";

dotenv.config();

const run = async () => {
  const to = process.argv[2];

  if (!to) {
    throw new Error("Thieu email dich. Cach dung: npm run test:mail -- ban@example.com");
  }

  const config = getMailConfig();
  console.log("Mail test:");
  console.log("  provider:", config.provider);

  if (config.provider !== "console") {
    console.log("  from:", formatSender(config.from));
  }
  if (config.provider === "smtp") {
    console.log("  host:", `${config.host}:${config.port}`);
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await sendOtpMail(to, code, "register");

  console.log("  to:", to);
  console.log("  code:", code);
  console.log("Mail test passed");
};

void run().catch((error) => {
  console.error("Mail test failed:", error);
  process.exit(1);
});
