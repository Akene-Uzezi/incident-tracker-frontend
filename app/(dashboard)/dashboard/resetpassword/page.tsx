"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Loader2, Mail, KeyRound, AlertTriangle, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/schemas/users";
import { useResetPasswordMutation } from "@/lib/api/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { notify } from "@/lib/toast";
import type { AuthUser } from "@/lib/types";

export default function ResetPasswordPage() {
  const [modifiedUser, setModifiedUser] = useState<AuthUser | null>(null);
  const router = useRouter();
  const resetMutation = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: ResetPasswordValues) => {
    setModifiedUser(null);
    resetMutation.mutate(values, {
      onSuccess: (data) => {
        setModifiedUser(data);
        notify.success("Password updated", `New password set for ${data.name}.`);
        reset();
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          if (err.status === 401) {
            notify.error("Session expired", "Please log in again.");
            router.replace("/login");
            return;
          }
          if (err.status === 403) {
            notify.error("Access forbidden", "Only superadmins may reset passwords.");
            return;
          }
          if (err.status === 404) {
            notify.error("No account found", "No user is registered with that email address.");
            return;
          }
        }
        notify.apiError("Password override failed", err);
      },
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Password Override</h1>
        <p className="text-muted-foreground">
          Administrative control panel to manually assign new passwords to staff accounts.
        </p>
      </div>

      <Card className="border-destructive/20 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle>Account Override Terminal</CardTitle>
          </div>
          <CardDescription>
            Target an account by email and assign their explicit new login credential details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Target User Email</FieldLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="employee@company.org"
                  className="pl-9"
                  disabled={resetMutation.isPending}
                  {...register("email")}
                />
              </div>
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">New Assigned Password</FieldLabel>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="pl-9"
                  disabled={resetMutation.isPending}
                  {...register("password")}
                />
              </div>
              <FieldError errors={[errors.password]} />
            </Field>

            <Button
              type="submit"
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2 mt-2"
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Overriding User Password...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Apply Custom Password Override
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {modifiedUser && (
        <Card className="border-t-4 border-t-emerald-500 animate-in fade-in-50 duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-5 w-5" />
              <CardTitle className="text-lg">Override Executed Successfully</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p>
              The password field for account{" "}
              <strong className="text-foreground">{modifiedUser.name}</strong> ({modifiedUser.email}) was updated.
            </p>
            <div className="p-3 bg-muted rounded-md text-xs font-mono border">
              <div>USER_ID: {modifiedUser.id}</div>
              <div>ROLE_TIER: {modifiedUser.role}</div>
              <div>DEPARTMENT: {modifiedUser.department || "N/A"}</div>
              <div>STATUS: {modifiedUser.disabled ? "DISABLED" : "ACTIVE"}</div>
            </div>
          </CardContent>
          <CardFooter className="bg-emerald-500/5 border-t border-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-400">
            The database was successfully updated with the custom password you typed.
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
