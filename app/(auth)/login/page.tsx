"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  ClipboardList,
  Users,
  Activity,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { loginSchema, type LoginValues } from "@/lib/schemas/auth";
import { useLoginMutation } from "@/lib/api/hooks/use-auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { useLoadingStore } from "@/lib/store/loading-store";
import { notify } from "@/lib/toast";
import { ThemeToggle } from "@/components/theme-toggle";

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Guided incident reporting",
    description: "A structured, multi-step form captures every detail — from reporter to root cause — in minutes.",
  },
  {
    icon: Activity,
    title: "Live status tracking",
    description: "Follow every report from unresolved through in-progress to fully resolved.",
  },
  {
    icon: Users,
    title: "Role-based access",
    description: "Reporters, admins and super admins each see exactly the tools their role needs.",
  },
  {
    icon: ShieldCheck,
    title: "Management oversight",
    description: "Risk assessment, follow-up actions and lessons learned, all attached to the original report.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.215, 0.61, 0.355, 1] as const,
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const showLoading = useLoadingStore((s) => s.show);
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
        showLoading(`Signing you in, ${data.user.name.split(" ")[0]}...`);
        router.replace("/dashboard");
      },
      onError: (err) => {
        notify.apiError("Sign-in failed", err);
      },
    });
  };

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      {/* Info panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex xl:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-20 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-white/10 blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex items-center gap-2.5"
        >
          <img src="/images/rhv logo.png" alt="RHV Logo" className="h-8 w-auto rounded-md bg-white/95 p-1" />
          <span className="text-lg font-bold tracking-tight">IncidentTracker</span>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-md space-y-10"
        >
          <motion.div variants={itemVariants} className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
              <ShieldAlert className="h-3.5 w-3.5" />
              Workplace Safety Platform
            </span>
            <h1 className="font-heading text-3xl leading-tight font-extrabold tracking-tight xl:text-4xl">
              Every incident, tracked from the first report to the final sign-off.
            </h1>
            <p className="text-sm leading-relaxed text-primary-foreground/80">
              RHV Hospital&apos;s internal system for logging, triaging and resolving workplace safety
              incidents, injuries and near-misses.
            </p>
          </motion.div>

          <div className="space-y-5">
            {FEATURES.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants} className="flex items-start gap-3.5">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <feature.icon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{feature.title}</p>
                  <p className="text-sm leading-snug text-primary-foreground/75">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="relative z-10 text-xs text-primary-foreground/60"
        >
          Access is restricted to authorized RHV Hospital personnel.
        </motion.p>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-col items-center justify-center bg-background p-4 sm:p-8">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <img src="/images/rhv logo.png" alt="RHV Logo" className="h-7 w-auto" />
          <span className="text-lg font-bold tracking-tight">IncidentTracker</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 space-y-1.5 text-center">
            <h2 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your security credentials to access the internal system
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <Field data-invalid={!!errors.email}>
              <FieldLabel
                htmlFor="email"
                className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
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
                className="h-11 rounded-xl px-4 focus-visible:border-primary focus-visible:ring-primary/50"
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={!!errors.password}>
              <div className="flex items-center justify-between">
                <FieldLabel
                  htmlFor="password"
                  className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
                >
                  Password
                </FieldLabel>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary transition-colors hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={loginMutation.isPending}
                  aria-invalid={!!errors.password}
                  className="h-11 rounded-xl px-4 pr-10 focus-visible:border-primary focus-visible:ring-primary/50"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldError errors={[errors.password]} />
            </Field>

            <motion.div whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
              <Button
                type="submit"
                className="h-11 w-full gap-1.5 rounded-xl text-sm font-semibold"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-block text-xs font-bold tracking-wider text-primary uppercase transition-colors hover:underline"
            >
              Report an Incident
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
