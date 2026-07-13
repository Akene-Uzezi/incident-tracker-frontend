"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_apiurl}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );
      const data = await response.json();
      if (response.ok) {
        const token = data.token;
        const user = data.user;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        document.cookie = `user_role=${user.role}; path=/; max-age=86400; sameSite=Strict; Secure`
        router.replace("/dashboard");
      } else {
        setError(`${data.error}`);
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (e) {
      setError("An error occurred. Please try again.");
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Explicitly typed as Variants with 'as const' to ensure strict cubic-bezier tuple evaluation
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
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      {/* Top anchor badge detailing systemic security status */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-3 text-xs font-bold tracking-widest text-blue-600/70 dark:text-blue-400/70 uppercase flex items-center gap-1.5"
      >
        <ShieldAlert className="h-3.5 w-3.5" />
        Secure Portal Authentication
      </motion.div>

      {/* Main Container Card Animation Wrapper */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card className="border-blue-100 dark:border-blue-950/40 shadow-xl shadow-blue-900/[0.03] bg-white dark:bg-slate-900 overflow-hidden rounded-2xl">
          <CardHeader className="space-y-2 text-center pt-8 pb-4 bg-gradient-to-b from-blue-50/40 to-transparent dark:from-blue-950/10">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Welcome Back
              </CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto text-sm">
                Enter your security credentials to access the internal system
              </CardDescription>
            </motion.div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 pt-2">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-lg overflow-hidden"
                >
                  <Alert variant="destructive" className="py-3">
                    <AlertDescription className="text-xs font-medium">
                      {error}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Email Input Field Box */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 pl-0.5"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="username@domain.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-11 px-4 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-blue-600 focus-visible:border-blue-600 transition-all"
                />
              </motion.div>

              {/* Password Input Field Box */}
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-center justify-between pl-0.5">
                  <Label
                    htmlFor="password"
                    className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                  >
                    Password
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="h-11 px-4 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-blue-600 focus-visible:border-blue-600 transition-all"
                />
              </motion.div>
            </CardContent>

            {/* Action Footer Containers */}
            <CardFooter className="flex flex-col space-y-4 pt-2 pb-6">
              <motion.div variants={itemVariants} className="w-full">
                {/* Action button utilizing high-stiffness spring mechanics during interaction events */}
                <motion.div
                  whileTap={{ scale: 0.96 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 18,
                  }}
                  className="w-full"
                >
                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/10 transition-colors duration-200 disabled:opacity-70 text-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying Profile..." : "Sign In"}
                  </Button>
                </motion.div>
              </motion.div>

              {/* Report Redirection Anchor Field */}
              <motion.div
                variants={itemVariants}
                className="text-center w-full"
              >
                <Link
                  href="/"
                  className="inline-block text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors mt-2"
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
