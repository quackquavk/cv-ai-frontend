"use client";
import { useState, useContext } from "react";
import SideNavBar from "./components/SideNavBar";
import SearchFields from "./components/SearchFields";
import NavigationTabs from "./components/NavigationTabs";
import { ViewProvider } from "./context/ViewContext";
import { ApiDataProvider } from "./context/ApiDataContext";
import { SearchProvider } from "./context/SearchContext";
import { SpinnerProvider } from "./context/SpinnerContext";
import { TabProvider, TabContext } from "./context/TabContext";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const tabContext = useContext(TabContext);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!tabContext) {
    throw new Error("DashboardContent must be used within TabProvider");
  }

  const { activeTab, setActiveTab } = tabContext;

  // Check if we're in the resume editor (editing a specific resume)
  const isResumeEditor = pathname.match(
    /^\/dashboard\/resumes(?:\/[^\/]+)?\/?$/
  );

  // Check if we're on a LinkedIn automation page (candidate-specific)
  const isLinkedInPage =
    pathname === "/dashboard/job-preferences" ||
    pathname === "/dashboard/job-applications" ||
    pathname === "/dashboard/ats-optimizer";

  const handleCollapsedChange = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Full-screen mode for resume editor - no sidebar, tabs, or padding
  if (isResumeEditor) {
    return <div className="h-screen w-full overflow-hidden">{children}</div>;
  }

  return (
    <div className="h-screen flex w-full overflow-hidden relative">
      {/* Desktop Sidebar */}
      <div
        className={`transition-all ease-in-out duration-300 flex-shrink-0 hidden lg:block ${
          isCollapsed ? "w-16" : "w-1/5"
        }`}
      >
        <SideNavBar
          isCollapsed={isCollapsed}
          onCollapsedChange={handleCollapsedChange}
          isMobile={false}
        />
      </div>

      {/* Mobile Hamburger - Floating Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-50 lg:hidden bg-[#ECEBE2] dark:bg-[#3A3A3A] hover:bg-orange-100"
        onClick={toggleMobileSidebar}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMobileSidebar}
      ></div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out transform lg:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "70%" }}
      >
        <SideNavBar
          isCollapsed={false}
          onCollapsedChange={() => {}}
          isMobile={true}
          onMobileClose={toggleMobileSidebar}
        />
      </div>

      <SidebarInset className="flex-grow overflow-hidden">
        <div className="h-full overflow-auto">
          {" "}
          {/* 👈 This makes everything scroll together */}
          <div className="px-6 flex flex-col w-full h-full min-h-full">
            {/* Navigation Tabs at the very top */}
            <NavigationTabs />

            {/* Search Fields - Only show for Recruiter tab (not on candidate pages) */}
            {activeTab === "recruiter" &&
              pathname !== "/dashboard/resumes" &&
              !isLinkedInPage && (
                <div className="pb-4">
                  <SearchFields />
                </div>
              )}

            {/* Main Content */}
            <div className="flex-grow w-full">{children}</div>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <TabProvider>
          <ViewProvider>
            <SearchProvider>
              <ApiDataProvider>
                <SpinnerProvider>
                  <DashboardContent>{children}</DashboardContent>
                </SpinnerProvider>
              </ApiDataProvider>
            </SearchProvider>
          </ViewProvider>
        </TabProvider>
      </SidebarProvider>
    </QueryClientProvider>
  );
}
