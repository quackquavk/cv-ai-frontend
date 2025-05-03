"use client";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/UserContext";

export default function Home() {
  const userContext = useContext(UserContext);
  const router = useRouter();

  // Safely handle potentially null context
  const { isAuthenticated, loading } = userContext || {
    isAuthenticated: false,
    loading: true,
  };

  useEffect(() => {
    // Only redirect after loading is complete
    if (!loading) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    }
  }, [isAuthenticated, loading, router]);

  // Show a simple loading state while checking authentication
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        <div className="loader border-t-4 border-white border-solid rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  // This should never actually render due to the redirects in useEffect
  return null;
}
