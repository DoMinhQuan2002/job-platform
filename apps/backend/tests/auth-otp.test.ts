import { beforeEach, describe, expect, it, vi } from "vitest";

/** Redis giả lập trong bộ nhớ, đủ các lệnh mà auth.otp dùng (set/get/del/ttl + EX). */
const store = new Map<string, { value: string; expiresAt: number }>();

const fakeRedis = {
  set: async (key: string, value: string, opts?: { ex?: number }) => {
    store.set(key, { value, expiresAt: Date.now() + (opts?.ex ?? 60) * 1000 });
    return "OK";
  },
  get: async (key: string) => {
    const entry = store.get(key);
    if (!entry || entry.expiresAt <= Date.now()) {
      store.delete(key);
      return null;
    }
    return entry.value;
  },
  del: async (key: string) => (store.delete(key) ? 1 : 0),
  ttl: async (key: string) => {
    const entry = store.get(key);
    if (!entry) {
      return -2;
    }
    const remaining = Math.ceil((entry.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  },
};

vi.mock("../src/config/redis", () => ({ getRedis: () => fakeRedis }));

import { OTP_MAX_ATTEMPTS } from "../src/modules/auth/auth.constants";
import { getResendCooldown, hasPendingOtp, issueOtp, verifyOtp } from "../src/modules/auth/auth.otp";

const email = "a@example.com";

beforeEach(() => {
  store.clear();
});

describe("OTP store", () => {
  it("sinh mã 6 chữ số và bật cooldown 60 giây", async () => {
    const code = await issueOtp("register", email);

    expect(code).toMatch(/^\d{6}$/);
    expect(await hasPendingOtp("register", email)).toBe(true);
    expect(await getResendCooldown("register", email)).toBeGreaterThan(0);
  });

  it("không lưu mã gốc trong Redis", async () => {
    const code = await issueOtp("register", email);
    const raw = JSON.stringify([...store.values()]);

    expect(raw).not.toContain(code);
  });

  it("mã đúng chỉ dùng được một lần", async () => {
    const code = await issueOtp("register", email);

    expect(await verifyOtp("register", email, code)).toBe("OK");
    expect(await verifyOtp("register", email, code)).toBe("NOT_FOUND");
  });

  it("mã sai trả MISMATCH và bị huỷ sau số lần thử tối đa", async () => {
    const code = await issueOtp("register", email);
    const wrong = code === "000000" ? "111111" : "000000";

    for (let i = 0; i < OTP_MAX_ATTEMPTS - 1; i += 1) {
      expect(await verifyOtp("register", email, wrong)).toBe("MISMATCH");
    }

    expect(await verifyOtp("register", email, wrong)).toBe("MISMATCH");
    // Het luot -> key bi xoa, ma dung cung khong con dung duoc
    expect(await verifyOtp("register", email, code)).toBe("NOT_FOUND");
  });

  it("OTP của register và forgot_password độc lập nhau", async () => {
    const registerCode = await issueOtp("register", email);
    await issueOtp("forgot_password", email);

    expect(await verifyOtp("forgot_password", email, registerCode)).toBe("MISMATCH");
    expect(await verifyOtp("register", email, registerCode)).toBe("OK");
  });
});
