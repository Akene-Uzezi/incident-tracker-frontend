import React from "react";
import "@/app/globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "Incident Tracker",
  description: "Production-ready incident management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}

        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
