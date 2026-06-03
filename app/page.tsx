// src/app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  // This performs a fast, server-side redirect before any client code loads
  redirect("/login");
}
