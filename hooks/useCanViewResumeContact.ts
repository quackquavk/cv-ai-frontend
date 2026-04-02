"use client";

import { useContext } from "react";
import { UserContext } from "@/context/UserContext";

/**
 * Resume PDFs, thumbnails, email, and phone are hidden from anonymous visitors.
 * While auth is loading, localStorage is used so returning users avoid a flash of redacted UI.
 */
export function useCanViewResumeContact(): boolean {
  const ctx = useContext(UserContext);
  if (!ctx) return false;
  if (ctx.loading && typeof window !== "undefined") {
    return localStorage.getItem("isAuthenticated") === "true";
  }
  return ctx.isAuthenticated;
}
