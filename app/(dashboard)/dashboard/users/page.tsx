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
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FieldError } from "@/components/ui/field";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Loader2,
  Search,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Building,
  Users as UsersIcon,
  UserSearch,
} from "lucide-react";
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

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function SuperAdminUsersPage() {
  const [foundUser, setFoundUser] = useState<AuthUser | null>(null);
  const [searched, setSearched] = useState(false);
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
    setSearched(true);
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
    <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <UsersIcon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Access Management</h1>
          <p className="text-muted-foreground">
            Look up a staff account by email to review its access and switch it on or off.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl py-0 shadow-sm">
        <CardHeader className="gap-1.5 border-b bg-muted/30 py-6">
          <CardTitle>Find an Account</CardTitle>
          <CardDescription>Search by the exact email address on file for the account.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSearch)} noValidate className="flex flex-col items-start gap-3 sm:flex-row">
            <Field data-invalid={!!errors.email} className="flex-1">
              <div className="relative">
                <Mail className="absolute top-3.5 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="colleague@hospital.org"
                  className="h-11 rounded-xl pl-9"
                  disabled={searchMutation.isPending || isMutating}
                  {...register("email")}
                />
              </div>
              <FieldError errors={[errors.email]} />
            </Field>
            <motion.div whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
              <Button
                type="submit"
                className="h-11 gap-2 rounded-xl"
                disabled={searchMutation.isPending || isMutating}
              >
                {searchMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Search User
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {searchMutation.isPending && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="rounded-2xl">
              <CardContent className="space-y-3 py-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full rounded-xl" />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!searchMutation.isPending && !foundUser && !searched && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-14 text-center text-muted-foreground"
          >
            <UserSearch className="h-8 w-8 opacity-60" />
            <p className="text-sm">Search for a user above to view and manage their account.</p>
          </motion.div>
        )}

        {foundUser && !searchMutation.isPending && (
          <motion.div
            key={foundUser.email}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Card className="overflow-hidden rounded-2xl py-0 shadow-sm">
              <CardHeader className="flex-row items-center justify-between gap-4 border-b bg-muted/30 py-6">
                <div className="flex items-center gap-3.5">
                  <Avatar size="lg">
                    <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                      {initialsOf(foundUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl font-bold">{foundUser.name}</CardTitle>
                    <CardDescription>Account #{foundUser.id}</CardDescription>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    foundUser.disabled
                      ? "border-destructive/20 bg-destructive/10 text-destructive"
                      : "border-emerald-500/20 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400"
                  }
                >
                  {foundUser.disabled ? "Disabled" : "Active"}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4 py-6">
                <div className="grid grid-cols-1 gap-4 rounded-xl border bg-muted/30 p-4 sm:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="flex min-w-0 flex-col">
                      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Email</span>
                      <span className="truncate text-sm font-medium">{foundUser.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Department</span>
                      <span className="text-sm font-medium uppercase">{foundUser.department || "N/A"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Role</span>
                      <span className="text-sm font-medium capitalize">{foundUser.role}</span>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-3 border-t bg-muted/10 py-4">
                <motion.div whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
                  {foundUser.disabled ? (
                    <Button
                      variant="default"
                      className="gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => toggleUserStatus("enable")}
                      disabled={isMutating}
                    >
                      {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                      Enable Account
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      className="gap-2 rounded-xl"
                      onClick={() => toggleUserStatus("disable")}
                      disabled={isMutating}
                    >
                      {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />}
                      Disable Account
                    </Button>
                  )}
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
