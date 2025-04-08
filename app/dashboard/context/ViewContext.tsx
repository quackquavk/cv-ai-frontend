"use client";
import React, { createContext, ReactNode, useState, useEffect } from "react";

type ViewType = "grid" | "list";

// Define the type for the context value
interface ViewContextType {
  view: string;
  setView: (value: ViewType) => void;
}

// Create the context
export const ViewContext = createContext<ViewContextType | null>(null);

// Create a provider component to wrap around the layout
export const ViewProvider = ({ children }: { children: ReactNode }) => {
  // const [view, setView] = useState<ViewType>(() => {
  //   if (typeof window !== "undefined") {
  //     const savedView = localStorage.getItem("view");
  //     if (savedView === "grid" || savedView === "list") {
  //       return savedView;
  //     }
  //     return "grid";
  //   }
  // });

  const [view, setView] = useState<ViewType>("list");

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     localStorage.setItem("view", view);
  //   }
  // }, [view]);

  return (
    <ViewContext.Provider value={{ view, setView }}>
      {children}
    </ViewContext.Provider>
  );
};
