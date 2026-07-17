"use client";

import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <motion.div
      key="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
      className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-8 bg-background px-6"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex items-center justify-center"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute size-28 rounded-full bg-primary/20 blur-2xl"
        />
        <img
          src="/images/rhv logo.png"
          alt="RHV Logo"
          className="relative h-16 w-auto drop-shadow-sm"
        />
      </motion.div>

      <div className="flex flex-col items-center gap-2 text-center">
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
          className="font-heading text-2xl font-bold tracking-tight text-foreground"
        >
          Incident Tracker
        </motion.h1>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.38, duration: 0.5, ease: "easeOut" }}
          className="max-w-xs text-sm text-muted-foreground"
        >
          Structured reporting for workplace incidents, injuries and near-misses — logged accurately, the moment they happen.
        </motion.p>
      </div>

      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.55, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="h-1 w-44 origin-left overflow-hidden rounded-full bg-muted"
      >
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ delay: 0.55, duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-1/2 rounded-full bg-gradient-to-r from-primary/30 via-primary to-primary/30"
        />
      </motion.div>
    </motion.div>
  );
}
