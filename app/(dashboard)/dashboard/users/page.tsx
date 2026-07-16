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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FieldError } from "@/components/ui/field";
import { Loader2, Search, UserCheck, UserX, Shield, Mail, Building } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchUserSchema, type SearchUserValues } from "@/lib/schemas/users";
import {
  useSearchUserMutation,
  useEnableUserMutation,
  useDisableUserMutation,
} from "@/lib/api/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { notify } from "@/lib/toast";
import type { AuthUser } from "@/lib/types";

export default function SuperAdminUsersPage() {
  const [foundUser, setFoundUser] = useState<AuthUser | null>(null);
  const router = useRouter();

  const searchMutation = useSearchUserMutation();
  const enableMutation = useEnableUserMutation();
  const disableMutation = useDisableUserMutation();
  const isMutating = enableMutation.isPending || disableMutation.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchUserValues>({
    resolver: zodResolver(searchUserSchema),
    defaultValues: { email: "" },
  });

  const handleAuthOrForbidden = (err: unknown) => {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        notify.error("Session expired", "Please log in again.");
        router.replace("/login");
        return true;
      }
      if (err.status === 403) {
        notify.error("Access forbidden", "Superadmin permissions required.");
        return true;
      }
      if (err.status === 404) {
        notify.error("No account found", "No user is registered with that email address.");
        return true;
      }
    }
    return false;
  };

  const onSearch = (values: SearchUserValues) => {
    setFoundUser(null);
    searchMutation.mutate(values.email, {
      onSuccess: (data) => {
        setFoundUser(data);
        notify.success("Account located", data.name);
      },
      onError: (err) => {
        if (!handleAuthOrForbidden(err)) notify.apiError("Search failed", err);
      },
    });
  };

  const toggleUserStatus = (action: "enable" | "disable") => {
    if (!foundUser) return;
    const mutation = action === "enable" ? enableMutation : disableMutation;
    mutation.mutate(foundUser.email, {
      onSuccess: (data) => {
        setFoundUser(data);
        notify.success(`Account ${action}d`, data.name);
      },
      onError: (err) => {
        if (!handleAuthOrForbidden(err)) notify.apiError(`Couldn't ${action} account`, err);
      },
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Access Management</h1>
        <p className="text-muted-foreground">
          Administrative terminal restricted to superadmins. Query accounts globally to switch live
          access constraints.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Status Filter Search</CardTitle>
          <CardDescription>Locate staff profiles using their unique workspace email identification.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSearch)} noValidate className="flex gap-3 items-start">
            <Field data-invalid={!!errors.email} className="flex-1">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="colleague@hospital.org"
                  className="pl-9"
                  disabled={searchMutation.isPending || isMutating}
                  {...register("email")}
                />
              </div>
              <FieldError errors={[errors.email]} />
            </Field>
            <Button type="submit" disabled={searchMutation.isPending || isMutating}>
              {searchMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Querying...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search User
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searchMutation.isPending && (
        <Card>
          <CardContent className="space-y-3 py-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      )}

      {foundUser && !searchMutation.isPending && (
        <Card className="border-t-4 border-t-primary animate-in fade-in-50 duration-200">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-bold">{foundUser.name}</CardTitle>
                <CardDescription>System Reference Account #{foundUser.id}</CardDescription>
              </div>
              <Badge
                variant="outline"
                className={
                  foundUser.disabled
                    ? "border-destructive/20 bg-destructive/10 text-destructive"
                    : "border-emerald-500/20 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400"
                }
              >
                {foundUser.disabled ? "Account Disabled" : "Active Access Authorized"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Email</span>
                  <span className="text-sm font-medium break-all">{foundUser.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Department</span>
                  <span className="text-sm font-medium uppercase">{foundUser.department || "N/A"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Role Tier</span>
                  <span className="text-sm font-medium capitalize">{foundUser.role}</span>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-muted/10 flex justify-end gap-3 border-t">
            {foundUser.disabled ? (
              <Button
                variant="default"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                onClick={() => toggleUserStatus("enable")}
                disabled={isMutating}
              >
                {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                Authorize & Enable Account
              </Button>
            ) : (
              <Button variant="destructive" className="gap-2" onClick={() => toggleUserStatus("disable")} disabled={isMutating}>
                {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />}
                Revoke & Disable Account
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
