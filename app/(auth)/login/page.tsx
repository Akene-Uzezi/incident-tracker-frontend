"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ShieldAlert, Eye, EyeOff, Loader2 } from "lucide-react";
import { loginSchema, type LoginValues } from "@/lib/schemas/auth";
import { useLoginMutation } from "@/lib/api/hooks/use-auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { notify } from "@/lib/toast";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginValues) => {
    loginMutation.mutate(values, {
      onSuccess: (data) => {
        setSession(data.token, data.user);
        notify.success("Welcome back", `Signed in as ${data.user.name}`);
        router.replace("/dashboard");
      },
      onError: (err) => {
        notify.apiError("Sign-in failed", err);
      },
    });
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.215, 0.61, 0.355, 1] as const,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="relative min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-3 text-xs font-bold tracking-widest text-primary/70 uppercase flex items-center gap-1.5"
      >
        <ShieldAlert className="h-3.5 w-3.5" />
        Secure Portal Authentication
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card className="border-primary/10 shadow-xl shadow-primary/4 overflow-hidden rounded-2xl py-0">
          <CardHeader className="space-y-2 text-center pt-8 pb-4 bg-linear-to-b from-primary/6 to-transparent">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Welcome Back
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="max-w-70 mx-auto text-sm">
                Enter your security credentials to access the internal system
              </CardDescription>
            </motion.div>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <CardContent className="space-y-5 pt-2">
              <motion.div variants={itemVariants}>
                <Field data-invalid={!!errors.email}>
                  <FieldLabel
                    htmlFor="email"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Email Address
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="username@domain.com"
                    autoComplete="email"
                    disabled={loginMutation.isPending}
                    aria-invalid={!!errors.email}
                    className="h-11 px-4 rounded-xl focus-visible:ring-primary/50 focus-visible:border-primary"
                    {...register("email")}
                  />
                  <FieldError errors={[errors.email]} />
                </Field>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Field data-invalid={!!errors.password}>
                  <FieldLabel
                    htmlFor="password"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Password
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      disabled={loginMutation.isPending}
                      aria-invalid={!!errors.password}
                      className="h-11 px-4 pr-10 rounded-xl focus-visible:ring-primary/50 focus-visible:border-primary"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <FieldError errors={[errors.password]} />
                </Field>
              </motion.div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2 pb-8">
              <motion.div variants={itemVariants} className="w-full">
                <motion.div
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="w-full"
                >
                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl font-semibold text-sm"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center w-full">
                <Link
                  href="/"
                  className="inline-block text-xs font-bold uppercase tracking-wider text-primary hover:underline transition-colors mt-2"
                >
                  Report an Incident
                </Link>
              </motion.div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
