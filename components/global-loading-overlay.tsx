"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { LoadingScreen } from "@/components/loading-screen";
import { useLoadingStore } from "@/lib/store/loading-store";

// If a navigation never actually completes (a failed redirect, a dead network),
// don't leave the whole app stuck behind a full-screen loader forever.
const FAILSAFE_MS = 15_000;

export function GlobalLoadingOverlay() {
  const message = useLoadingStore((s) => s.message);
  const hide = useLoadingStore((s) => s.hide);
  const pathname = usePathname();

  // The route that triggered a message has finished mounting — clear it.
  useEffect(() => {
    hide();
  }, [pathname, hide]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(hide, FAILSAFE_MS);
    return () => clearTimeout(t);
  }, [message, hide]);

  return <AnimatePresence>{message && <LoadingScreen description={message} />}</AnimatePresence>;
}
