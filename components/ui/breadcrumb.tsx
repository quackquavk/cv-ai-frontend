import React from "react";
import { ChevronRight, Home, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbProps {
  folderName?: string;
  className?: string;
  showHome?: boolean;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  folderName, 
  className,
  showHome = true 
}) => {
  if (!folderName) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 mb-2",
        className
      )}
    >
      {showHome && (
        <>
          <div className="flex items-center">
            <Home className="h-3.5 w-3.5" />
            <span className="ml-1 font-medium">Dashboard</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
        </>
      )}
      
      <div className="flex items-center">
        <Folder className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
        <span className="ml-1 font-medium text-gray-900 dark:text-gray-100 capitalize truncate max-w-[200px]">
          {folderName}
        </span>
      </div>
    </nav>
  );
};

export default Breadcrumb;
