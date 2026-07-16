import { z } from "zod";

export const searchUserSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

export type SearchUserValues = z.infer<typeof searchUserSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
