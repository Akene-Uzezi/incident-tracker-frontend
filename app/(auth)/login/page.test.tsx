import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mutate = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));

vi.mock("@/lib/api/hooks/use-auth", () => ({
  useLoginMutation: () => ({ mutate, isPending: false }),
}));

vi.mock("@/lib/store/auth-store", () => ({
  useAuthStore: (selector: (s: { setSession: () => void }) => unknown) =>
    selector({ setSession: vi.fn() }),
}));

vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => null,
}));

import LoginPage from "./page";

describe("LoginPage", () => {
  beforeEach(() => {
    mutate.mockClear();
    replace.mockClear();
  });

  it("renders the email and password fields", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it("shows validation errors instead of submitting when the form is empty", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
    expect(mutate).not.toHaveBeenCalled();
  });

  it("submits valid credentials to the login mutation", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email address/i), "user@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        { email: "user@example.com", password: "password1" },
        expect.anything()
      );
    });
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
    expect(passwordInput.type).toBe("password");

    await user.click(screen.getByRole("button", { name: /show password/i }));
    expect(passwordInput.type).toBe("text");
  });
});
