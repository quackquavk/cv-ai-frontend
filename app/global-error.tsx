"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50`}
      >
        <div className="flex flex-col items-center justify-center max-w-md p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter">
              Something went wrong!
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              A critical error occurred. Please try refreshing the page.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 w-full overflow-hidden">
            <p className="text-sm font-mono text-red-600 dark:text-red-400 break-words text-left">
              {error.message || "Unknown error occurred"}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-red-400 dark:text-red-500/70 mt-2 text-left">
                Digest: {error.digest}
              </p>
            )}
          </div>

          <button
            onClick={() => reset()}
            className="w-full inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-8 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 dark:focus-visible:ring-zinc-300"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
