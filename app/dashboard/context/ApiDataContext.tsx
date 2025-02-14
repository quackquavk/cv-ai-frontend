"use client";
import { createContext, useState, useEffect, ReactNode } from "react";
import { IDocumentData } from "@/interfaces/DocumentData";
import axiosInstance from "@/utils/axiosConfig";

// Define the context value structure
interface ApiDataContextType {
  apiData: IDocumentData[] | null;
  setApiData: React.Dispatch<React.SetStateAction<IDocumentData[] | null>>;
}

// Create the context
export const ApiDataContext = createContext<ApiDataContextType | null>(null);

export const initialData = {
  address: "",
  attribute: [""],
  prompt: "",
  foldersToSearch: [""],
  sort_order: "",
  availability: "",
  time_of_day: "",
  star_rating: 0,
  current_salary: [],
  estimated_salary: [],
  paid_by: "",
};

// Context Provider to fetch and provide the data
export const ApiDataProvider = ({ children }: { children: ReactNode }) => {
  const [apiData, setApiData] = useState<IDocumentData[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.post(
          "document/search_by_query",
          initialData
        );
        setApiData(response.data);
      } catch (error) {
        console.error("Error fetching API data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <ApiDataContext.Provider value={{ apiData, setApiData }}>
      {children}
    </ApiDataContext.Provider>
  );
};
