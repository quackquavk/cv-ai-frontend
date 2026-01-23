"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { AlertCircle } from "lucide-react"; // Assuming lucide-react is available, otherwise I'll use SVG

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-6 p-8 text-center animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
          <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-500" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Something went wrong!
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
          We encountered an error while loading this segment.
        </p>
      </div>

      <div className="w-full max-w-sm rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
        <p className="font-mono break-all line-clamp-2">
          {error.message || "Unknown error"}
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-8 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 dark:focus-visible:ring-zinc-300"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
