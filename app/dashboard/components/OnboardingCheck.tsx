"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserContext } from "@/context/UserContext";
import { LoaderCircle } from "lucide-react";

interface OnboardingCheckProps {
  children: React.ReactNode;
}

const OnboardingCheck = ({ children }: OnboardingCheckProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const userContext = useContext(UserContext);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!userContext) {
      setIsChecking(false);
      return;
    }

    const { loading, isAuthenticated, user } = userContext;

    // Wait for user data to load
    if (loading) {
      return;
    }

    // If authenticated and onboarding not completed, redirect to onboarding
    if (isAuthenticated && user && !user.onboarding_completed) {
      router.replace("/onboarding");
      return;
    }

    // Done checking
    setIsChecking(false);
  }, [userContext, router, pathname]);

  // Show loading while checking
  if (isChecking || userContext?.loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="h-8 w-8 animate-spin text-slate-400" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default OnboardingCheck;


