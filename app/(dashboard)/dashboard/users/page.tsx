"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Search,
  Users as UsersIcon,
  MoreVertical,
  Eye,
  Pencil,
  UserCheck,
  UserX,
  Building,
  Shield,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import {
  useUsersQuery,
  useSearchUsersQuery,
  useUpdateUserMutation,
  useEnableUserMutation,
  useDisableUserMutation,
} from "@/lib/api/hooks/use-auth";
import { editUserSchema, type EditUserValues } from "@/lib/schemas/users";
import { ROLE_OPTIONS } from "@/lib/schemas/auth";
import { ApiError } from "@/lib/api/client";
import { notify } from "@/lib/toast";
import type { AuthUser } from "@/lib/types";
import { cn } from "@/lib/utils";

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const ROLE_BADGE_STYLES: Record<string, string> = {
  superadmin: "border-primary/20 bg-primary/10 text-primary",
  admin: "border-violet-500/20 bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  manager: "border-amber-500/20 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  supervisor: "border-sky-500/20 bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400"
};

function RoleBadge({ role }: { role: string }) {
  const key = role?.toLowerCase();
  return (
    <Badge variant="outline" className={cn("capitalize", ROLE_BADGE_STYLES[key] || ROLE_BADGE_STYLES.null)}>
      {role}
    </Badge>
  );
}

function StatusBadge({ disabled }: { disabled: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        disabled
          ? "border-destructive/20 bg-destructive/10 text-destructive"
          : "border-emerald-500/20 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400"
      }
    >
      {disabled ? "Disabled" : "Active"}
    </Badge>
  );
}

function UserViewDialog({
  user,
  onClose,
  onEdit,
  onToggleStatus,
  isMutating,
}: {
  user: AuthUser | null;
  onClose: () => void;
  onEdit: (user: AuthUser) => void;
  onToggleStatus: (user: AuthUser) => void;
  isMutating: boolean;
}) {
  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {user && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <Avatar size="lg">
                  <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                    {initialsOf(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <DialogTitle className="truncate text-lg">{user.name}</DialogTitle>
                  <DialogDescription className="truncate">{user.email}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 rounded-xl border bg-muted/30 p-4 text-sm">
              <div className="flex items-center gap-2.5">
                <Building className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex min-w-0 flex-col">
                  <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Department
                  </span>
                  <span className="truncate font-medium uppercase">{user.department || "N/A"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Shield className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Role
                  </span>
                  <span className="font-medium capitalize">{user.role}</span>
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-2.5 border-t pt-3">
                {user.disabled ? (
                  <UserX className="h-4 w-4 shrink-0 text-destructive" />
                ) : (
                  <UserCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                )}
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Account Status
                  </span>
                  <span className="font-medium">{user.disabled ? "Disabled" : "Active"}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="sm:justify-between">
              <Button variant="outline" onClick={() => onEdit(user)} className="gap-2 rounded-xl">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              {user.disabled ? (
                <Button
                  className="gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => onToggleStatus(user)}
                  disabled={isMutating}
                >
                  {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                  Enable Account
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  className="gap-2 rounded-xl"
                  onClick={() => onToggleStatus(user)}
                  disabled={isMutating}
                >
                  {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />}
                  Disable Account
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function UserEditDialog({ user, onClose }: { user: AuthUser | null; onClose: () => void }) {
  const updateMutation = useUpdateUserMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditUserValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: { name: "", email: "", role: "supervisor", department: "" },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role as EditUserValues["role"],
        department: user.department,
      });
    }
  }, [user, reset]);

  const onSubmit = (values: EditUserValues) => {
    updateMutation.mutate(values, {
      onSuccess: () => {
        notify.success("User updated", `${values.name}'s details were saved.`);
        onClose();
      },
      onError: (err) => notify.apiError("Couldn't update user", err),
    });
  };

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update this account&apos;s profile and access role.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="edit-name" className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Full Name
            </FieldLabel>
            <Input id="edit-name" className="h-10 rounded-xl" disabled={updateMutation.isPending} {...register("name")} />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="edit-email" className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Email Address
            </FieldLabel>
            <Input
              id="edit-email"
              type="email"
              className="h-10 rounded-xl"
              disabled={updateMutation.isPending}
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={!!errors.department}>
            <FieldLabel htmlFor="edit-department" className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Department
            </FieldLabel>
            <Input
              id="edit-department"
              className="h-10 rounded-xl"
              disabled={updateMutation.isPending}
              {...register("department")}
            />
            <FieldError errors={[errors.department]} />
          </Field>

          <Field data-invalid={!!errors.role}>
            <FieldLabel htmlFor="edit-role" className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Role
            </FieldLabel>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={updateMutation.isPending}>
                  <SelectTrigger id="edit-role" className="h-10 w-full rounded-xl">
                    <SelectValue placeholder="Select a role" />
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={updateMutation.isPending} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending} className="gap-2 rounded-xl">
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function SuperAdminUsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const isSearching = debouncedSearch.trim().length > 0;

  const usersQuery = useUsersQuery(page, 10);
  const searchResults = useSearchUsersQuery(debouncedSearch);

  const enableMutation = useEnableUserMutation();
  const disableMutation = useDisableUserMutation();
  const isMutatingStatus = enableMutation.isPending || disableMutation.isPending;

  const [viewingUser, setViewingUser] = useState<AuthUser | null>(null);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [confirmingUser, setConfirmingUser] = useState<AuthUser | null>(null);

  const users = isSearching ? (searchResults.data?.users ?? []) : (usersQuery.data?.data ?? []);
  const pagination = usersQuery.data?.pagination ?? null;
  const loading = isSearching ? searchResults.isLoading : usersQuery.isLoading;

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
    }
    return false;
  };

  const toggleStatus = (user: AuthUser) => {
    const action = user.disabled ? "enable" : "disable";
    const mutation = action === "enable" ? enableMutation : disableMutation;
    mutation.mutate(user.email, {
      onSuccess: (data) => {
        notify.success(`Account ${action}d`, data.name);
        setViewingUser((current) => (current?.email === user.email ? data : current));
      },
      onError: (err) => {
        if (!handleAuthOrForbidden(err)) notify.apiError(`Couldn't ${action} account`, err);
      },
    });
  };

  // Enabling is low-risk and fires immediately; disabling locks someone out of
  // the system, so it goes through a confirmation step first.
  const requestToggleStatus = (user: AuthUser) => {
    if (user.disabled) {
      toggleStatus(user);
    } else {
      setViewingUser(null);
      setConfirmingUser(user);
    }
  };

  const confirmDisable = () => {
    if (confirmingUser) toggleStatus(confirmingUser);
    setConfirmingUser(null);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <UsersIcon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Access Management</h1>
          <p className="text-muted-foreground">Browse every account, or search by name and email.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <Card className="overflow-hidden rounded-2xl py-0 shadow-sm">
          <CardHeader className="gap-0 border-b bg-muted/30 py-5">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name or email..."
                className="h-11 rounded-xl pr-9 pl-9"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow>
                    <TableHead className="py-3 pl-4">User</TableHead>
                    <TableHead className="py-3">Department</TableHead>
                    <TableHead className="py-3">Role</TableHead>
                    <TableHead className="py-3">Status</TableHead>
                    <TableHead className="py-3 pr-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="py-3.5 pl-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="size-9 rounded-full" />
                            <div className="space-y-1.5">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-40" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </TableCell>
                        <TableCell className="pr-4 text-right">
                          <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-14 text-center text-sm text-muted-foreground">
                        {isSearching ? "No accounts match your search." : "No user accounts found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u.email} className="group">
                        <TableCell className="py-3 pl-4">
                          <button
                            type="button"
                            onClick={() => setViewingUser(u)}
                            className="flex cursor-pointer items-center gap-3 text-left"
                          >
                            <Avatar size="sm">
                              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                {initialsOf(u.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                                {u.name}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                            </div>
                          </button>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground uppercase">
                          {u.department || "N/A"}
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={u.role} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge disabled={u.disabled} />
                        </TableCell>
                        <TableCell className="pr-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => setViewingUser(u)} className="gap-2">
                                <Eye className="h-4 w-4" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditingUser(u)} className="gap-2">
                                <Pencil className="h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {u.disabled ? (
                                <DropdownMenuItem onClick={() => requestToggleStatus(u)} className="gap-2">
                                  <UserCheck className="h-4 w-4" /> Enable
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => requestToggleStatus(u)} variant="destructive" className="gap-2">
                                  <UserX className="h-4 w-4" /> Disable
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {!isSearching && !loading && pagination && (
              <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
                <span className="text-sm text-muted-foreground">{pagination.total_items} accounts found</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page <= 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-1 text-sm">
                    Page {pagination.current_page} of {pagination.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= pagination.total_pages}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <UserViewDialog
        user={viewingUser}
        onClose={() => setViewingUser(null)}
        onEdit={(u) => {
          setViewingUser(null);
          setEditingUser(u);
        }}
        onToggleStatus={requestToggleStatus}
        isMutating={isMutatingStatus}
      />
      <UserEditDialog user={editingUser} onClose={() => setEditingUser(null)} />

      <AlertDialog open={!!confirmingUser} onOpenChange={(open) => !open && setConfirmingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable {confirmingUser?.name}&apos;s account?</AlertDialogTitle>
            <AlertDialogDescription>
              They will immediately lose the ability to sign in. You can re-enable the account at any
              time from this page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDisable}>
              Disable Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
