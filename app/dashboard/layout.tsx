"use client";
import { useState } from "react";
import SideNavBar from "./components/SideNavBar";
import SearchFields from "./components/SearchFields";
import { ViewProvider } from "./context/ViewContext";
import { ApiDataProvider } from "./context/ApiDataContext";
import { SearchProvider } from "./context/SearchContext";
import { SpinnerProvider } from "./context/SpinnerContext";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Spinner from "@/components/ui/Spinner/Spinner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleCollapsedChange = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <ViewProvider>
          <SearchProvider>
            <ApiDataProvider>
              <SpinnerProvider>
                <Spinner />
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
                      isMobileOpen
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
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

                  <SidebarInset className="transition-[width] ease-out duration-200 transform-gpu flex-grow overflow-auto w-full">
                    <div className="px-6 flex flex-col gap-8 w-full h-full">
                      <div className="pt-4">
                        <SearchFields />
                      </div>
                      <div className="flex-grow w-full">{children}</div>
                    </div>
                  </SidebarInset>
                </div>
              </SpinnerProvider>
            </ApiDataProvider>
          </SearchProvider>
        </ViewProvider>
      </SidebarProvider>
    </QueryClientProvider>
  );
}
