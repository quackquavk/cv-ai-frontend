"use client";
import React, { useContext } from "react";
import ListView from "@/components/ListView";
import GridView from "@/components/GridView";
import { ViewContext } from "../context/ViewContext";
import { ApiDataContext } from "../context/ApiDataContext";
import { SearchContext } from "../context/SearchContext";

function DashboardClient() {
  const apiContext = useContext(ApiDataContext);
  const apiData = apiContext?.apiData ?? [];

  const searchContext = useContext(SearchContext);

  if (!apiContext) {
    throw new Error("Error occured");
  }

  if (!searchContext) {
    throw new Error("Error occured");
  }

  const { searchData } = searchContext;

  const context = useContext(ViewContext);
  if (!context) {
    throw new Error("Dashboard must be used within a ViewProvider");
  }

  const { view } = context;

  return (
    <div className="h-full w-full overflow-auto">
      {view === "grid" ? (
        <GridView searchData={searchData} data={apiData} />
      ) : (
        <ListView searchData={searchData} data={apiData} />
      )}
    </div>
  );
}

export default DashboardClient;
