"use client";

import React, { useState } from "react";
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
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  KeyRound,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  disabled: boolean;
}

export default function resetpassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState(""); // State for typed password
  const [isMutating, setIsMutating] = useState(false);
  const [modifiedUser, setModifiedUser] = useState<UserProfile | null>(null);
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please provide a valid email address.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("The override password must be at least 8 characters long.");
      return;
    }

    setIsMutating(true);
    setModifiedUser(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_apiurl}/auth/resetpassword`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            email: email.trim(),
            password: newPassword, // Sending typed custom password
          }),
        },
      );

      if (res.status === 401) {
        toast.error("Session expired. Please log in again.");
        router.replace("/login");
        return;
      }

      if (res.status === 403) {
        toast.error(
          "Access Forbidden: Only superadmins are allowed to reset passwords.",
        );
        return;
      }

      if (res.status === 404) {
        toast.error("No account found registered with that email address.");
        return;
      }

      if (!res.ok) {
        throw new Error("Server error processing password override.");
      }

      const data: UserProfile = await res.json();
      setModifiedUser(data);
      toast.success(`Password successfully updated for ${data.name}.`);

      // Reset inputs
      setEmail("");
      setNewPassword("");
    } catch (err) {
      toast.error("Failed to execute password override routine.");
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          System Password Override
        </h1>
        <p className="text-muted-foreground">
          Administrative control panel to manually assign new passwords to staff
          accounts.
        </p>
      </div>

      <Card className="border-destructive/20 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle>Account Override Terminal</CardTitle>
          </div>
          <CardDescription>
            Target an account by email and assign their explicit new login
            credential details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none"
              >
                Target User Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="employee@company.org"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isMutating}
                  required
                />
              </div>
            </div>

            {/* Custom Typed Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none"
              >
                New Assigned Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="pl-9"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isMutating}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2 mt-2"
              disabled={isMutating}
            >
              {isMutating ? (
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

      {/* Confirmation Block */}
      {modifiedUser && (
        <Card className="border-t-4 border-t-emerald-500 animate-in fade-in-50 duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-5 w-5" />
              <CardTitle className="text-lg">
                Override Executed Successfully
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p>
              The password field for account{" "}
              <strong className="text-foreground">{modifiedUser.name}</strong> (
              {modifiedUser.email}) was updated.
            </p>
            <div className="p-3 bg-muted rounded-md text-xs font-mono border">
              <div>USER_ID: {modifiedUser.id}</div>
              <div>ROLE_TIER: {modifiedUser.role}</div>
              <div>DEPARTMENT: {modifiedUser.department || "N/A"}</div>
              <div>STATUS: {modifiedUser.disabled ? "DISABLED" : "ACTIVE"}</div>
            </div>
          </CardContent>
          <CardFooter className="bg-emerald-500/5 px-6 py-3 border-t border-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-400">
            The database was successfully updated with the custom password you
            typed.
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
