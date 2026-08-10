import { describe, it, expect } from "vitest";
import { searchUserSchema, resetPasswordSchema, changePasswordSchema, editUserSchema } from "./users";

describe("searchUserSchema", () => {
  it("requires a valid email", () => {
    expect(searchUserSchema.safeParse({ email: "" }).success).toBe(false);
    expect(searchUserSchema.safeParse({ email: "nope" }).success).toBe(false);
    expect(searchUserSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
  });
});

describe("resetPasswordSchema (superadmin override)", () => {
  it("requires an 8-character minimum password", () => {
    expect(resetPasswordSchema.safeParse({ email: "a@b.com", password: "short7c" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ email: "a@b.com", password: "exactly8" }).success).toBe(true);
  });
});

describe("changePasswordSchema (self-service)", () => {
  it("requires newPassword and confirmPassword to match", () => {
    const result = changePasswordSchema.safeParse({
      newPassword: "password1",
      confirmPassword: "password2",
    });
    expect(result.success).toBe(false);
  });

  it("accepts matching passwords of at least 8 characters", () => {
    const result = changePasswordSchema.safeParse({
      newPassword: "password1",
      confirmPassword: "password1",
    });
    expect(result.success).toBe(true);
  });
});

describe("editUserSchema", () => {
  it("requires name, a valid email, a known role, and a department", () => {
    const valid = { name: "Jane", email: "jane@example.com", role: "admin" as const, department: "IT" };
    expect(editUserSchema.safeParse(valid).success).toBe(true);
    expect(editUserSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
    expect(editUserSchema.safeParse({ ...valid, department: "" }).success).toBe(false);
  });
});
