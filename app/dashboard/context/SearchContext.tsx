"use client";
import React, { createContext, useContext, useState } from "react";
import { IFormInputData } from "@/interfaces/FormInputData";
// import { folderSelectStore } from "../store";

export const SearchContext = createContext<{
  searchData: IFormInputData | null;
  setSearchData: React.Dispatch<React.SetStateAction<IFormInputData | null>>;
  // searchResults: any[];
  // setSearchResults: React.Dispatch<React.SetStateAction<any[]>>;
  // resetSearch: () => void;
} | null>(null);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [searchData, setSearchData] = useState<IFormInputData | null>(null);

  // const [previousSortOrder, setPreviousSortOrder] = useState(
  //   searchData?.sort_order
  // );

  // const { selectFolderId } = folderSelectStore();

  // Reset search data and results when folder changes
  // useEffect(() => {
  //   setSearchData(null);
  //   sessionStorage.removeItem("searchData");
  // }, [selectFolderId]);

  // useEffect(() => {
  //   // Check if sort_order has changed
  //   if (searchData?.sort_order !== previousSortOrder) {
  //     sessionStorage.removeItem("allData");
  //     sessionStorage.removeItem("searchData");
  //     setPreviousSortOrder(searchData?.sort_order);
  //   }
  // }, [searchData?.sort_order, previousSortOrder]);

  return (
    <SearchContext.Provider
      value={{
        searchData,
        setSearchData,
        // resetSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
};
