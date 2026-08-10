import { z } from "zod";

export const editUserSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  role: z.enum(["reporter", "supervisor", "admin", "manager", "superadmin"], {
    message: "Select a role",
  }),
  department: z.string().min(1, "Department is required"),
});

export type EditUserValues = z.infer<typeof editUserSchema>;

export const searchUserSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

export type SearchUserValues = z.infer<typeof searchUserSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
