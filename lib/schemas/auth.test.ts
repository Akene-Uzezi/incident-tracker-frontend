import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "./auth";

describe("loginSchema", () => {
  it("requires a valid email and a non-empty password", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "user@example.com", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "user@example.com", password: "x" }).success).toBe(true);
  });
});

describe("registerSchema", () => {
  const base = {
    name: "Jane Doe",
    email: "jane@example.com",
    role: "reporter" as const,
    department: "IT",
  };

  it("requires the same minimum password length (8) as every other password-setting flow", () => {
    expect(registerSchema.safeParse({ ...base, password: "short7c" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: "exactly8" }).success).toBe(true);
  });

  it("rejects an invalid role", () => {
    const result = registerSchema.safeParse({ ...base, password: "password1", role: "ceo" });
    expect(result.success).toBe(false);
  });
});
