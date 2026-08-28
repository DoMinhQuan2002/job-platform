import { describe, expect, it, vi, beforeEach } from "vitest";
import { sendMail } from "./mailer";
import { getMailConfig, parseFrom } from "../../config/mail";
import { AppError } from "../errors/app-error";

const MAIL_ENV_KEYS = [
  "MAIL_PROVIDER",
  "BREVO_API_KEY",
  "MAIL_FROM",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "SMTP_FROM",
];

const clearMailEnv = () => {
  // tests/setup.ts nap ca .env that cua may dev -> phai xoa het cho sach truoc moi test.
  for (const key of MAIL_ENV_KEYS) {
    vi.stubEnv(key, undefined as unknown as string);
  }
};

const input = { to: "user@example.com", subject: "Mã xác thực", text: "123456" };

describe("mailer", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    clearMailEnv();
  });

  describe("parseFrom", () => {
    it("tach duoc dang 'Name <email>'", () => {
      expect(parseFrom("JobPlatform <no-reply@abc.com>")).toEqual({
        name: "JobPlatform",
        email: "no-reply@abc.com",
      });
    });

    it("chuoi chi co email -> dung name mac dinh", () => {
      expect(parseFrom("no-reply@abc.com")).toEqual({
        name: "JobPlatform",
        email: "no-reply@abc.com",
      });
    });
  });

  it("khong co credential nao -> in OTP ra console, khong goi fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    expect(getMailConfig().provider).toBe("console");

    await sendMail(input);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith(expect.stringContaining("123456"));
  });

  it("co BREVO_API_KEY -> POST len Brevo API voi sender da tach name/email", async () => {
    vi.stubEnv("BREVO_API_KEY", "brevo-key");
    vi.stubEnv("MAIL_FROM", "JobPlatform <no-reply@abc.com>");

    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await sendMail(input);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    expect(init.method).toBe("POST");
    expect(init.headers["api-key"]).toBe("brevo-key");
    expect(JSON.parse(init.body)).toEqual({
      sender: { name: "JobPlatform", email: "no-reply@abc.com" },
      to: [{ email: "user@example.com" }],
      subject: "Mã xác thực",
      textContent: "123456",
    });
  });

  it("Brevo tra ve loi -> nem AppError MAIL_SEND_FAILED", async () => {
    vi.stubEnv("BREVO_API_KEY", "bad-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response('{"message":"Key not found"}', { status: 401 })),
    );

    await expect(sendMail(input)).rejects.toMatchObject({
      code: "MAIL_SEND_FAILED",
      statusCode: 502,
    });
  });

  it("MAIL_PROVIDER=brevo nhung thieu key -> nem AppError MAIL_CONFIG_MISSING", () => {
    vi.stubEnv("MAIL_PROVIDER", "brevo");

    expect(() => getMailConfig()).toThrowError(AppError);
    expect(() => getMailConfig()).toThrowError(/BREVO_API_KEY/);
  });
});
