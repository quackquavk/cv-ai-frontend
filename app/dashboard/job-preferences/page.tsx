"use client";

import AuthGuard from "../components/AuthGuard";
import LinkedInJobPreferences from "@/app/dashboard/components/LinkedInJobPreferences";

export default function JobPreferencesPage() {
  return (
    <AuthGuard requireCV>
      <div className="h-full w-full pt-4 overflow-auto">
        <LinkedInJobPreferences />
      </div>
    </AuthGuard>
  );
}
