"use client";
import { useState, useRef, useMemo } from "react";
import SideNavBar from "./components/SideNavBar";
import SearchFields from "./components/SearchFields";
import { ViewProvider } from "./context/ViewContext";
import { ApiDataProvider } from "./context/ApiDataContext";
import { SearchProvider } from "./context/SearchContext";
import { SpinnerProvider } from "./context/SpinnerContext";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Spinner from "@/components/ui/Spinner/Spinner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  // const isCollapsedRef = useRef(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCollapsedChange = (collapsed: boolean) => {
    // isCollapsedRef.current = collapsed;
    setIsCollapsed(collapsed);
  };

  // const layoutContent = useMemo( () => ())

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <ViewProvider>
          <SearchProvider>
            <ApiDataProvider>
              <SpinnerProvider>
                <Spinner />
                <div className="h-screen flex w-full overflow-hidden">
                  <div
                    className={`transition-all ease-in-out duration-300 flex-shrink-0 ${
                      isCollapsed ? "w-16" : "w-1/5"
                    }`}
                  >
                    <SideNavBar
                      isCollapsed={isCollapsed}
                      onCollapsedChange={handleCollapsedChange}
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
