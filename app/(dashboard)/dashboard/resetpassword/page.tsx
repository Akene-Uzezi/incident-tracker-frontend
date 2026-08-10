"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Mail, KeyRound, AlertTriangle, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/schemas/users";
import { useResetPasswordMutation } from "@/lib/api/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { notify } from "@/lib/toast";
import type { AuthUser } from "@/lib/types";

export default function ResetPasswordPage() {
  const [modifiedUser, setModifiedUser] = useState<AuthUser | null>(null);
  const [pendingValues, setPendingValues] = useState<ResetPasswordValues | null>(null);
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

  const performOverride = () => {
    if (!pendingValues) return;
    const values = pendingValues;
    setPendingValues(null);
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

  const requestConfirm = (values: ResetPasswordValues) => {
    setPendingValues(values);
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <KeyRound className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Password Override</h1>
          <p className="text-muted-foreground">Manually assign a new password to any staff account.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <Card className="overflow-hidden rounded-2xl border-destructive/20 py-0 shadow-sm">
          <CardHeader className="gap-1.5 border-b border-destructive/10 bg-destructive/5 py-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle>Account Override</CardTitle>
            </div>
            <CardDescription>
              Target an account by email and set an explicit new password below. This bypasses the
              account holder entirely — use with care.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(requestConfirm)} noValidate className="space-y-4">
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email" className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Target User Email
                </FieldLabel>
                <div className="relative">
                  <Mail className="absolute top-3.5 left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="employee@company.org"
                    className="h-11 rounded-xl pl-9"
                    disabled={resetMutation.isPending}
                    {...register("email")}
                  />
                </div>
                <FieldError errors={[errors.email]} />
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password" className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  New Assigned Password
                </FieldLabel>
                <div className="relative">
                  <KeyRound className="absolute top-3.5 left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    className="h-11 rounded-xl pl-9"
                    disabled={resetMutation.isPending}
                    {...register("password")}
                  />
                </div>
                <FieldError errors={[errors.password]} />
              </Field>

              <motion.div whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
                <Button
                  type="submit"
                  className="mt-2 w-full gap-2 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={resetMutation.isPending}
                >
                  {resetMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Overriding Password...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      Apply Password Override
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {modifiedUser && (
          <motion.div
            key={modifiedUser.email}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Card className="overflow-hidden rounded-2xl border-emerald-500/20 py-0 shadow-sm">
              <CardHeader className="gap-1.5 border-b border-emerald-500/10 bg-emerald-500/5 py-5">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <UserCheck className="h-5 w-5" />
                  <CardTitle className="text-lg">Override Successful</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-5 text-sm text-muted-foreground">
                <p>
                  The password for <strong className="text-foreground">{modifiedUser.name}</strong> (
                  {modifiedUser.email}) was updated.
                </p>
                <div className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/30 p-4 text-xs sm:grid-cols-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold tracking-wider text-muted-foreground/80 uppercase">Role</span>
                    <span className="font-medium text-foreground capitalize">{modifiedUser.role}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold tracking-wider text-muted-foreground/80 uppercase">Department</span>
                    <span className="font-medium text-foreground uppercase">{modifiedUser.department || "N/A"}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold tracking-wider text-muted-foreground/80 uppercase">Status</span>
                    <span className="font-medium text-foreground">{modifiedUser.disabled ? "Disabled" : "Active"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialog open={!!pendingValues} onOpenChange={(open) => !open && setPendingValues(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Override the password for {pendingValues?.email}?</AlertDialogTitle>
            <AlertDialogDescription>
              This immediately replaces their current password with the one you just entered. The
              account holder is not notified from here — let them know the new password separately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={performOverride}>
              Apply Override
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
