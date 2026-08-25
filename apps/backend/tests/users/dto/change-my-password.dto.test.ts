import { describe, expect, it } from "vitest";
import { AppError } from "../../../src/common/errors/app-error";
import { parseChangeMyPasswordDto } from "../../../src/modules/users/dto/change-my-password.dto";

describe("ChangeMyPasswordDto", () => {
  it("accepts a strong new password", () => {
    expect(parseChangeMyPasswordDto({
      currentPassword: "Current@123",
      newPassword: "NewPassword@123",
    })).toEqual({ currentPassword: "Current@123", newPassword: "NewPassword@123" });
  });

  it.each([
    [{ currentPassword: "", newPassword: "NewPassword@123" }, "missing current password"],
    [{ currentPassword: "Current@123", newPassword: "weak" }, "weak password"],
    [{ currentPassword: "SamePassword@123", newPassword: "SamePassword@123" }, "same password"],
    [{ currentPassword: "Current@123", newPassword: "NewPassword@123", confirmPassword: "x" }, "unknown field"],
  ])("rejects %s (%s)", (body, _caseName) => {
    expect(() => parseChangeMyPasswordDto(body)).toThrow(AppError);
  });
});
