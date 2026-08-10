import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const ROLE_OPTIONS = [
  { value: "supervisor", label: "Supervisor" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "superadmin", label: "Super Admin" },
] as const;

export const registerSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["reporter", "supervisor", "admin", "manager", "superadmin"], {
    message: "Select a role",
  }),
  department: z.string().min(1, "Department is required"),
});

export type RegisterValues = z.infer<typeof registerSchema>;
