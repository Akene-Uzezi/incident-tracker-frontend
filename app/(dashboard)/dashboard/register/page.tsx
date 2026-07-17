"use client";

import React from "react";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Loader2, UserPlus, User, Mail, KeyRound, Building2, ShieldQuestion } from "lucide-react";
import { registerSchema, ROLE_OPTIONS, type RegisterValues } from "@/lib/schemas/auth";
import { useRegisterMutation } from "@/lib/api/hooks/use-auth";
import { notify } from "@/lib/toast";

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: undefined, department: "" },
  });

  const onSubmit = (values: RegisterValues) => {
    registerMutation.mutate(values, {
      onSuccess: () => {
        notify.success("User account created", `${values.name} can now sign in.`);
        reset();
      },
      onError: (err) => {
        if ((err as { status?: number })?.status === 401) {
          notify.error("Session expired", "Please log in again.");
          router.replace("/login");
          return;
        }
        notify.apiError("Couldn't register user", err);
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <UserPlus className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create User Account</h1>
          <p className="text-muted-foreground">Register a new team member and assign their access level.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <Card className="overflow-hidden rounded-2xl py-0 shadow-sm">
          <CardHeader className="gap-1.5 border-b bg-muted/30 py-6">
            <CardTitle>New Account Details</CardTitle>
            <CardDescription>All fields are required to provision system access.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor="name" className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    Full Name
                  </FieldLabel>
                  <div className="relative">
                    <User className="absolute top-3.5 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      disabled={registerMutation.isPending}
                      className="h-11 rounded-xl pl-9"
                      {...register("name")}
                    />
                  </div>
                  <FieldError errors={[errors.name]} />
                </Field>

                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="email" className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    Email Address
                  </FieldLabel>
                  <div className="relative">
                    <Mail className="absolute top-3.5 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="johndoe@company.com"
                      disabled={registerMutation.isPending}
                      className="h-11 rounded-xl pl-9"
                      {...register("email")}
                    />
                  </div>
                  <FieldError errors={[errors.email]} />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field data-invalid={!!errors.password}>
                  <FieldLabel htmlFor="password" className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    Password
                  </FieldLabel>
                  <div className="relative">
                    <KeyRound className="absolute top-3.5 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      disabled={registerMutation.isPending}
                      className="h-11 rounded-xl pl-9"
                      {...register("password")}
                    />
                  </div>
                  <FieldError errors={[errors.password]} />
                </Field>

                <Field data-invalid={!!errors.department}>
                  <FieldLabel htmlFor="department" className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    Department
                  </FieldLabel>
                  <div className="relative">
                    <Building2 className="absolute top-3.5 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="department"
                      placeholder="Engineering, IT, HR..."
                      disabled={registerMutation.isPending}
                      className="h-11 rounded-xl pl-9"
                      {...register("department")}
                    />
                  </div>
                  <FieldError errors={[errors.department]} />
                </Field>
              </div>

              <Field data-invalid={!!errors.role}>
                <FieldLabel htmlFor="role" className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  System Access Role
                </FieldLabel>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={registerMutation.isPending}>
                      <SelectTrigger id="role" className="h-11 w-full rounded-xl">
                        <ShieldQuestion className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Select an operational role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.role]} />
              </Field>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 border-t bg-muted/10 py-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                disabled={registerMutation.isPending}
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
              <motion.div whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
                <Button type="submit" className="gap-2 rounded-xl" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Registering...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Register User
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
