import { useState, useEffect } from "react";
import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosConfig";
import { privateFolderStore } from "../store";

interface FolderData {
  folder_id: string;
  folder_name: string;
  [key: string]: any;
}

interface PrivateSubfolder {
  folder_id: string;
  name: string;
}

export const useFolderData = () => {
  const [folderContents, setFolderContents] = useState<Record<string, any[]>>({});
  const queryClient = useQueryClient();
  
  const { 
    hasPrivateFolder, 
    setHasPrivateFolder, 
    privateRootId, 
    setPrivateRootId, 
    privateSubfolders, 
    setPrivateSubfolders 
  } = privateFolderStore();

  // Get saved folder order from localStorage
  const [folderOrder, setFolderOrder] = useState({
    public: [],
    private: []
  });

  useEffect(() => {
    const savedOrder = localStorage.getItem('folderOrder');
    if (savedOrder) {
      try {
        setFolderOrder(JSON.parse(savedOrder));
      } catch (e) {
        console.error('Error parsing folder order from localStorage', e);
      }
    }
  }, []);

  // Fetch public folders using TanStack Query
  const {
    data: fetchedFolders = [],
    isLoading: foldersLoading,
    refetch: refetchFolders,
  } = useQuery({
    queryKey: ["folders", "public"],
    queryFn: async () => {
      const response = await axiosInstance.get("/folder/getAllFolders");
      let folders = response.data;
      
      // Apply saved order if available
      if (folderOrder.public.length > 0) {
        folders = [...folders].sort((a: FolderData, b: FolderData) => {
          const aIndex = folderOrder.public.indexOf(a.folder_id);
          const bIndex = folderOrder.public.indexOf(b.folder_id);
          
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return 0;
        });
      }
      
      return folders;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Fetch folder contents using TanStack Query for each folder
  const folderContentQueries = useQueries({
    queries: fetchedFolders.map((folder: FolderData) => ({
      queryKey: ["folderFiles", folder.folder_id],
      queryFn: async () => {
        const response = await axiosInstance.get(`/folder/getFiles/${folder.folder_id}`);
        return response.data || [];
      },
      staleTime: 1000 * 60 * 2, // Cache for 2 minutes
      enabled: !!folder.folder_id,
    })),
  });

  // Fetch private folder contents using TanStack Query
  const privateContentQueries = useQueries({
    queries: privateSubfolders.map((subfolder: PrivateSubfolder) => ({
      queryKey: ["folderFiles", subfolder.folder_id],
      queryFn: async () => {
        const response = await axiosInstance.get(`/folder/getFiles/${subfolder.folder_id}`);
        return response.data || [];
      },
      staleTime: 1000 * 60 * 2, // Cache for 2 minutes
      enabled: !!subfolder.folder_id && hasPrivateFolder,
    })),
  });

  // Update folderContents when query results change
  useEffect(() => {
    const allContents: Record<string, any[]> = {};
    
    // Process public folder contents
    folderContentQueries.forEach((query, index) => {
      if (query.data && fetchedFolders[index]) {
        allContents[fetchedFolders[index].folder_id] = Array.isArray(query.data) ? query.data : [];
      }
    });

    // Process private folder contents
    privateContentQueries.forEach((query, index) => {
      if (query.data && privateSubfolders[index]) {
        allContents[privateSubfolders[index].folder_id] = Array.isArray(query.data) ? query.data : [];
      }
    });
    
    if (Object.keys(allContents).length > 0) {
      setFolderContents((prevContents) => ({
        ...prevContents,
        ...allContents,
      }));
    }
  }, [folderContentQueries, privateContentQueries, fetchedFolders, privateSubfolders]);

  // Initialize private folders
  useEffect(() => {
    const initPrivate = async () => {
      try {
        const rootRes = await axiosInstance.get("/folder/private/root");
        const rootId = rootRes.data?.folder_id;
        if (rootId) {
          setPrivateRootId(rootId);
          setHasPrivateFolder(true);
          // fetch subfolders under private root
          const childrenRes = await axiosInstance.get(
            `/folder/children?parent_id=${rootId}&include_private=true`
          );
          const subs = (childrenRes.data || [])
            .filter((f: any) => f.visibility === "private")
            .map((f: any) => ({
              folder_id: f.folder_id,
              name: f.name || f.folder_name,
            }));
          setPrivateSubfolders(subs);
        } else {
          setHasPrivateFolder(false);
        }
      } catch (error) {
        setHasPrivateFolder(false);
        setPrivateRootId(null);
        setPrivateSubfolders([]);
      }
    };
    initPrivate();
  }, [setHasPrivateFolder, setPrivateRootId, setPrivateSubfolders]);

  // Helper functions for cache updates
  const updateFolderCache = (folderId: string, updateFn: (oldData: any[]) => any[]) => {
    queryClient.setQueryData(["folderFiles", folderId], updateFn);
  };

  const invalidateDocuments = (folderId?: string) => {
    if (folderId) {
      queryClient.invalidateQueries({
        queryKey: ["documents", folderId],
      });
    } else {
      queryClient.invalidateQueries({
        queryKey: ["documents"],
      });
    }
  };

  const addFileToFolder = (folderId: string, file: any) => {
    updateFolderCache(folderId, (oldData) => {
      if (!oldData) return [file];
      const fileExists = oldData.some((f: any) => f.doc_id === file.doc_id);
      if (fileExists) return oldData;
      return [...oldData, file];
    });
  };

  const removeFileFromFolder = (folderId: string, fileId: string) => {
    updateFolderCache(folderId, (oldData) => {
      if (!oldData) return oldData;
      return oldData.filter((f: any) => f.doc_id !== fileId);
    });
  };

  const moveFile = (fromFolderId: string, toFolderId: string, file: any) => {
    removeFileFromFolder(fromFolderId, file.doc_id);
    addFileToFolder(toFolderId, file);
    invalidateDocuments();
  };

  return {
    // Data
    folders: fetchedFolders,
    folderContents,
    privateSubfolders,
    hasPrivateFolder,
    privateRootId,
    
    // Loading states
    foldersLoading,
    
    // Actions
    refetchFolders,
    updateFolderCache,
    invalidateDocuments,
    addFileToFolder,
    removeFileFromFolder,
    moveFile,
    
    // Folder order
    folderOrder,
    setFolderOrder,
  };
};
