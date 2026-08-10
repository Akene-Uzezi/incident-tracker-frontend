"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { KeyRound, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden rounded-2xl py-0 shadow-xl">
          <CardHeader className="items-center gap-3 border-b bg-primary/5 py-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <KeyRound className="h-6 w-6" />
            </span>
            <CardTitle className="text-2xl font-extrabold tracking-tight">Forgot your password?</CardTitle>
            <CardDescription className="max-w-sm text-sm">
              IncidentTracker doesn&apos;t support automated password resets. The IT Department has to
              reset it for you.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 py-6">
            <div className="flex items-start gap-3 rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Reach out to Redeemers Health Village&apos;s IT department directly and ask for a
                password reset. Once it&apos;s reset, you can sign back in with the default password and
                change it to something only you know from your account menu.
              </p>
            </div>

            <Link href="/login" className="block">
              <Button variant="outline" className="w-full gap-2 rounded-xl">
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
