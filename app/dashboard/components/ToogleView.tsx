"use client";
import React, { useContext, useState, useEffect } from "react";
import { BsFillGridFill } from "react-icons/bs";
import { FaListUl } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ViewContext } from "../context/ViewContext";

const ToogleView = () => {
  const context = useContext(ViewContext);

  if (!context) {
    throw new Error("ToogleView must be used within a ViewProvider");
  }

  const { view, setView } = context;
  const [loadedView, setLoadedView] = useState<string | null>(null);

  // Ensure we wait until the view is correctly set before rendering
  useEffect(() => {
    setLoadedView(view);
  }, [view]);

  // Prevent rendering until the view state is loaded
  if (!loadedView) {
    return null;
  }

  return (
    <div className="flex justify-end items-center gap-1">
      <div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setView("list")}
                className={`p-2 rounded-md ${
                  loadedView === "list"
                    ? "bg-gray-200 dark:bg-[#333332]"
                    : "hover:bg-gray-100 dark:hover:bg-[#242323]"
                }`}
              >
                <FaListUl />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>List View</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-md ${
                  loadedView === "grid"
                    ? "bg-gray-200 dark:bg-[#333332]"
                    : "hover:bg-gray-100 dark:hover:bg-[#242323]"
                }`}
              >
                <BsFillGridFill />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Grid View</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ToogleView;
