"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axiosInstance from "../../../utils/axiosConfig";
import { UserContext } from "@/context/UserContext";
import { privateFolderStore } from "../store";

interface PrivateFile {
  document_id: string;
  document_name: string;
  created_at?: string;
  updated_at?: string;
  file_size?: number;
  file_type?: string;
}

interface PrivateFolderContextType {
  privateFiles: PrivateFile[];
  isLoading: boolean;
  hasPrivateFolder: boolean;
  refreshPrivateFiles: () => Promise<void>;
  checkPrivateFolder: () => Promise<boolean>;
  createPrivateFolder: () => Promise<boolean>;
  copyFileToPrivate: (documentId: string) => Promise<boolean>;
  moveFileToPrivate: (documentId: string) => Promise<boolean>;
  deleteFileFromPrivate: (documentId: string) => Promise<boolean>;
  deleteMultipleFilesFromPrivate: (documentIds: string[]) => Promise<boolean>;
}

const PrivateFolderContext = createContext<
  PrivateFolderContextType | undefined
>(undefined);

interface PrivateFolderProviderProps {
  children: ReactNode;
}

export const PrivateFolderProvider: React.FC<PrivateFolderProviderProps> = ({
  children,
}) => {
  const userContext = useContext(UserContext);
  const { isAuthenticated } = userContext;
  const { hasPrivateFolder, setHasPrivateFolder } = privateFolderStore();

  const [privateFiles, setPrivateFiles] = useState<PrivateFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has private folder
  const checkPrivateFolder = async (): Promise<boolean> => {
    if (!isAuthenticated) return false;
    try {
      const response = await axiosInstance.get("/folder/private/root");
      const hasFolder = !!response.data?.folder_id;
      setHasPrivateFolder(hasFolder);
      return hasFolder;
    } catch (error) {
      setHasPrivateFolder(false);
      return false;
    }
  };

  // Refresh private files
  const refreshPrivateFiles = async (): Promise<void> => {
    if (!isAuthenticated || !hasPrivateFolder) {
      setPrivateFiles([]);
      return;
    }

    setIsLoading(true);
    try {
      // Not used in new architecture (private files by subfolder); keeping empty
      setPrivateFiles([]);
    } catch (error) {
      console.error("Error fetching private files:", error);
      setPrivateFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Create private folder
  const createPrivateFolder = async (): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      const response = await axiosInstance.get("/folder/private/root");
      const hasRoot = !!response.data?.folder_id;
      setHasPrivateFolder(hasRoot);
      return hasRoot;
    } catch (error) {
      console.error("Error creating private folder:", error);
    }
    return false;
  };

  // Copy file to private folder
  const copyFileToPrivate = async (documentId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      // Prefer UI-specific action components now
      return false;
    } catch (error) {
      console.error("Error copying file to private folder:", error);
    }
    return false;
  };

  // Move file to private folder
  const moveFileToPrivate = async (documentId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      return false;
    } catch (error) {
      console.error("Error moving file to private folder:", error);
    }
    return false;
  };

  // Delete file from private folder
  const deleteFileFromPrivate = async (
    documentId: string
  ): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      return false;
    } catch (error) {
      console.error("Error deleting file from private folder:", error);
    }
    return false;
  };

  // Delete multiple files from private folder
  const deleteMultipleFilesFromPrivate = async (
    documentIds: string[]
  ): Promise<boolean> => {
    if (!isAuthenticated || documentIds.length === 0) return false;

    try {
      return false;
    } catch (error) {
      console.error("Error deleting files from private folder:", error);
    }
    return false;
  };

  // Check private folder status on authentication change
  useEffect(() => {
    checkPrivateFolder();
  }, [isAuthenticated]);

  // Refresh private files when private folder status changes
  useEffect(() => {
    if (hasPrivateFolder) {
      refreshPrivateFiles();
    } else {
      setPrivateFiles([]);
    }
  }, [hasPrivateFolder, isAuthenticated]);

  const contextValue: PrivateFolderContextType = {
    privateFiles,
    isLoading,
    hasPrivateFolder,
    refreshPrivateFiles,
    checkPrivateFolder,
    createPrivateFolder,
    copyFileToPrivate,
    moveFileToPrivate,
    deleteFileFromPrivate,
    deleteMultipleFilesFromPrivate,
  };

  return (
    <PrivateFolderContext.Provider value={contextValue}>
      {children}
    </PrivateFolderContext.Provider>
  );
};

// Custom hook to use the private folder context
export const usePrivateFolder = (): PrivateFolderContextType => {
  const context = useContext(PrivateFolderContext);
  if (context === undefined) {
    throw new Error(
      "usePrivateFolder must be used within a PrivateFolderProvider"
    );
  }
  return context;
};

export default PrivateFolderContext;
