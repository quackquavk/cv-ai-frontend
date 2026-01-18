"use client";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabContext } from "../context/TabContext";
import { useContext, useEffect } from "react";
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

  // Update active tab based on current pathname and handle automatic routing
  useEffect(() => {
    if (loading) return;

    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      // If user is a candidate, automatically route to candidate tab
      if (user?.user_role === "candidate") {
        setActiveTab("candidate");
        router.replace("/dashboard/candidate");
      } else {
        setActiveTab("recruiter");
      }
    } else {
      // Any other path under /dashboard (like /dashboard/candidate, /dashboard/my-resume, etc.)
      setActiveTab("candidate");
    }
  }, [pathname, setActiveTab, user, router, loading]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "candidate") {
      router.push("/dashboard/candidate");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="pt-4 pb-2 sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
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
