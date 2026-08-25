import { describe, expect, it } from "vitest";
import { AppError } from "../../../src/common/errors/app-error";
import { parseUpdateMyProfileDto } from "../../../src/modules/users/dto/update-my-profile.dto";

describe("UpdateMyProfileDto", () => {
  it("accepts a valid partial profile", () => {
    expect(parseUpdateMyProfileDto({ fullName: "  Nguyen Van A  ", phone: null })).toEqual({
      fullName: "Nguyen Van A",
      phone: null,
    });
  });

  it.each([
    [{}, "empty body"],
    [{ email: "new@test.com" }, "unknown field"],
    [{ fullName: "A" }, "short fullName"],
    [{ phone: "123" }, "invalid phone"],
    [{ dateOfBirth: "2026-02-30" }, "invalid date"],
    [{ dateOfBirth: "2999-01-01" }, "future date"],
  ])("rejects %s (%s)", (body, _caseName) => {
    expect(() => parseUpdateMyProfileDto(body)).toThrow(AppError);
  });

  it("allows nullable profile fields to be cleared", () => {
    expect(parseUpdateMyProfileDto({
      phone: null, dateOfBirth: null, addressDetail: null, wardCode: null,
    })).toEqual({ phone: null, dateOfBirth: null, addressDetail: null, wardCode: null });
  });
});
