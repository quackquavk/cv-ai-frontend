"use client";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabContext } from "../context/TabContext";
import { useContext, useEffect, useRef } from "react";
import { UserContext } from "@/context/UserContext";

export default function NavigationTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const tabContext = useContext(TabContext);
  const userContext = useContext(UserContext);

  if (!tabContext) {
    throw new Error("NavigationTabs must be used within TabProvider");
  }

  const { activeTab, setActiveTab } = tabContext;
  const { user, loading } = userContext || {};

  // Use a ref to track if we've already handled the initial "default role" routing
  const hasHandledDefaultRole = useRef(false);

  // 1. Always keep the active tab in sync with the current URL path
  useEffect(() => {
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      setActiveTab("recruiter");
    } else {
      // Any other path under /dashboard (like /dashboard/candidate, /dashboard/my-resume)
      setActiveTab("candidate");
    }
  }, [pathname, setActiveTab]);

  // 2. Handle the initial "auto-route" based on user role when landing on the root dashboard
  useEffect(() => {
    if (loading || !user || hasHandledDefaultRole.current) return;

    // Default candidates to the candidate dashboard, but only on the first visit to /dashboard
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      if (user.user_role === "candidate") {
        router.replace("/dashboard/candidate");
      }
    }

    // Capture that we've checked the default role so we don't override manual navigation
    hasHandledDefaultRole.current = true;
  }, [loading, user, pathname, router]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "candidate") {
      router.push("/dashboard/candidate");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="py-2 bg-background/80 backdrop-blur-sm">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="recruiter" className="text-sm font-semibold">
            Recruiter
          </TabsTrigger>
          <TabsTrigger value="candidate" className="text-sm font-semibold">
            Candidate
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
