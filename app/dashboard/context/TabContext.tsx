"use client";
import React, { createContext, useState, ReactNode } from "react";

interface TabContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TabContext = createContext<TabContextType | undefined>(undefined);

export const TabProvider = ({ children }: { children: ReactNode }) => {
  const [activeTab, setActiveTab] = useState("recruiter");

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  );
};


