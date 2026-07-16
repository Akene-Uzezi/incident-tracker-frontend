"use client";

import React from "react";
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
import { Loader2 } from "lucide-react";
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
    <div className="flex justify-center items-center py-6">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Create User Account</CardTitle>
          <CardDescription>
            Register a new personnel member to assign system access levels and departments.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input id="name" placeholder="John Doe" disabled={registerMutation.isPending} {...register("name")} />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <Input id="email" type="email" placeholder="johndoe@company.com" disabled={registerMutation.isPending} {...register("email")} />
                <FieldError errors={[errors.email]} />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" type="password" placeholder="••••••••" disabled={registerMutation.isPending} {...register("password")} />
                <FieldError errors={[errors.password]} />
              </Field>

              <Field data-invalid={!!errors.department}>
                <FieldLabel htmlFor="department">Department</FieldLabel>
                <Input id="department" placeholder="Engineering, IT, HR..." disabled={registerMutation.isPending} {...register("department")} />
                <FieldError errors={[errors.department]} />
              </Field>
            </div>

            <Field data-invalid={!!errors.role}>
              <FieldLabel htmlFor="role">System Access Role</FieldLabel>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={registerMutation.isPending}>
                    <SelectTrigger id="role" className="w-full">
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
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" disabled={registerMutation.isPending} onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
            <Button type="submit" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Registering...
                </>
              ) : (
                "Register User"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
