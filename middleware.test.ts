import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

function requestFor(path: string, role?: string) {
  const req = new NextRequest(new URL(`http://localhost:3000${path}`));
  if (role) {
    req.cookies.set("user_role", role);
  }
  return req;
}

describe("middleware superadmin route guard", () => {
  const protectedPaths = ["/dashboard/register", "/dashboard/users", "/dashboard/resetpassword"];

  it.each(protectedPaths)("redirects a non-superadmin away from %s", (path) => {
    const res = middleware(requestFor(path, "reporter"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it.each(protectedPaths)("redirects an unauthenticated request away from %s", (path) => {
    const res = middleware(requestFor(path));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it.each(protectedPaths)("lets a superadmin through to %s", (path) => {
    const res = middleware(requestFor(path, "superadmin"));
    expect(res.status).toBe(200);
  });

  it("is case-insensitive about the role cookie", () => {
    const res = middleware(requestFor("/dashboard/users", "SuperAdmin"));
    expect(res.status).toBe(200);
  });

  it("does not touch unrelated dashboard routes", () => {
    const res = middleware(requestFor("/dashboard", "reporter"));
    expect(res.status).toBe(200);
  });
});
