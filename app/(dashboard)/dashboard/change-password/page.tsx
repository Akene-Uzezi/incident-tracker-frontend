"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { KeyRound, ShieldCheck, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { changePasswordSchema, type ChangePasswordValues } from "@/lib/schemas/users";
import { useChangePasswordMutation } from "@/lib/api/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { notify } from "@/lib/toast";
import { useAuthUser } from "@/lib/store/auth-store";
import { cn } from "@/lib/utils";

function PasswordField({
  id,
  label,
  placeholder,
  disabled,
  error,
  register,
}: {
  id: "currentPassword" | "newPassword" | "confirmPassword";
  label: string;
  placeholder: string;
  disabled: boolean;
  error?: { message?: string };
  register: ReturnType<typeof useForm<ChangePasswordValues>>["register"];
}) {
  const [visible, setVisible] = useState(false);

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id} className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
        {label}
      </FieldLabel>
      <div className="relative">
        <Lock className="absolute top-3.5 left-3 h-4 w-4 text-muted-foreground" />
        <Input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={id === "currentPassword" ? "current-password" : "new-password"}
          disabled={disabled}
          aria-invalid={!!error}
          className="h-11 rounded-xl pr-10 pl-9"
          {...register(id)}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <FieldError errors={[error]} />
    </Field>
  );
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const user = useAuthUser();
  const changePasswordMutation = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = (values: ChangePasswordValues) => {
    changePasswordMutation.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          notify.success("Password updated", "Your password has been changed.");
          reset();
        },
        onError: (err) => {
          if (err instanceof ApiError) {
            if (err.status === 401) {
              notify.error("Session expired", "Please log in again.");
              router.replace("/login");
              return;
            }
            if (err.status === 400 || err.status === 403) {
              notify.error("Couldn't update password", "Your current password may be incorrect.");
              return;
            }
          }
          notify.apiError("Couldn't update password", err);
        },
      }
    );
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Change Password</h1>
        <p className="text-muted-foreground">
          Update the password for your own account, {user?.name?.split(" ")[0] || "there"}.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <Card className="overflow-hidden rounded-2xl py-0 shadow-sm">
          <CardHeader className="gap-1.5 border-b bg-primary/5 py-6">
            <div className="flex items-center gap-2 text-primary">
              <KeyRound className="h-5 w-5" />
              <CardTitle>Account Security</CardTitle>
            </div>
            <CardDescription>
              Confirm your current password, then choose a new one to sign in with next time.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <CardContent className="space-y-4 pt-6">
              <PasswordField
                id="currentPassword"
                label="Current Password"
                placeholder="Enter your current password"
                disabled={changePasswordMutation.isPending}
                error={errors.currentPassword}
                register={register}
              />
              <PasswordField
                id="newPassword"
                label="New Password"
                placeholder="Minimum 8 characters"
                disabled={changePasswordMutation.isPending}
                error={errors.newPassword}
                register={register}
              />
              <PasswordField
                id="confirmPassword"
                label="Confirm New Password"
                placeholder="Re-enter your new password"
                disabled={changePasswordMutation.isPending}
                error={errors.confirmPassword}
                register={register}
              />
              <FieldDescription className="flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-xs">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                Use a password you don&apos;t use anywhere else. You&apos;ll stay signed in on this device
                after changing it.
              </FieldDescription>
            </CardContent>
            <CardFooter className="border-t bg-muted/10 py-4">
              <motion.div
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className={cn("w-full sm:w-auto sm:ml-auto")}
              >
                <Button
                  type="submit"
                  className="w-full gap-2 rounded-xl sm:w-auto"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </motion.div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
