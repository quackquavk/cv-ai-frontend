import React, { useState, useEffect, useRef, useMemo } from "react";
import { FaChevronDown } from "react-icons/fa";
import { RxHamburgerMenu } from "react-icons/rx";
import axiosInstance from "@/utils/axiosConfig";
import { Check, ExternalLink, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";
import DialogueComponent from "./DialogueComponent";
import { BsThreeDots } from "react-icons/bs";
import { BsThreeDotsVertical } from "react-icons/bs";
import { folderSelectStore, multiFolderSelectStore } from "../store";
import { FaRegFolder, FaRegFolderOpen } from "react-icons/fa";
import { publicFolderStore } from "../store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDocumentStore } from "../store";
import PrivateFolderActions from "./PrivateFolderActions";
import { privateFolderStore } from "../store";
import { CirclePlus, FolderLock, FolderOpen, Plus } from "lucide-react";
import { useQueryClient, useQuery, useQueries } from "@tanstack/react-query";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Skeleton loader component for private files
const PrivateFilesSkeleton = () => {
  return (
    <div className="mt-2 ml-8 border-l border-blue-300 pl-4 max-w-full">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="flex items-center justify-between p-1 mb-2">
          <div className="flex items-center space-x-[1px] w-full">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1 ml-2 animate-pulse"></div>
          </div>
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );
};



// Logic part of FolderList component with fixes
const FolderList = ({ updateFolderList, setUpdateFolderList }) => {
  const [folders, setFolders] = useState([]);
  const [folderContents, setFolderContents] = useState({});
  const [editingFolder, setEditingFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [draggedFile, setDraggedFile] = useState(null);
  const [dialogOpen, setDialogueOpen] = useState(false);
  const [dialogAlert, setDialogueAlert] = useState(false);
  const [draggedOverFolder, setDraggedOverFolder] = useState(null);
  const [selectedFile, setSelectedFile] = useState({
    folder_id: "",
    file_id: "",
  });
  const [value, setValue] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");
  const [name, setName] = useState("");
  const [dialogAlertFile, setDialogueAlertFile] = useState(false);
  const [folderId, setFolderId] = useState("");
  const { selectFolderId, setSelectFolderId } = folderSelectStore();
  const { selectedFolderIds, toggleFolderSelection } = multiFolderSelectStore();
  const { isFolderListOpen, isPrivateSectionOpen, togglePrivateSection, isPublicSectionOpen, togglePublicSection } = publicFolderStore();
  const {
    hasPrivateFolder,
    setHasPrivateFolder,
    privateRootId,
    setPrivateRootId,
    privateSubfolders,
    setPrivateSubfolders,
    lastUpdatedFolderId,
  } = privateFolderStore();
  const [isCreatingPrivateFolder, setIsCreatingPrivateFolder] = useState(false);
  const [isCreatePrivateSubfolderOpen, setIsCreatePrivateSubfolderOpen] = useState(false);
  const [newPrivateSubfolderName, setNewPrivateSubfolderName] = useState("");
  const inputRefs = useRef({});
  
  // New state for folder positioning
  const [folderOrder, setFolderOrder] = useState({
    public: [],
    private: []
  });
  const [draggedFolder, setDraggedFolder] = useState(null);
  const [folderDragOver, setFolderDragOver] = useState(null);
  const [dropPosition, setDropPosition] = useState(null);
  
  // State to track the changes (archive files)
  const setShouldRefetchDocuments = useDocumentStore((state) => state.setShouldRefetchDocuments);
  const queryClient = useQueryClient();

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

  // Save folder order to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('folderOrder', JSON.stringify(folderOrder));
  }, [folderOrder]);

  useEffect(() => {
    if (editingFolder && inputRefs.current[editingFolder]) {
      inputRefs.current[editingFolder].focus();
    }
  }, [editingFolder]);

  useEffect(() => {
    setSelectFolderId("");
  }, [isFolderListOpen]);

  // Ensure/get private root, then list private subfolders
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
            .filter((f) => f.visibility === "private")
            .map((f) => ({
              folder_id: f.folder_id,
              name: f.name || f.folder_name,
            }));
          setPrivateSubfolders(subs);
        } else {
          setHasPrivateFolder(false);
        }
      } catch (error) {
        // 401/403 implies unauthenticated/non-premium
        setHasPrivateFolder(false);
        setPrivateRootId(null);
        setPrivateSubfolders([]);
      }
    };
    initPrivate();
  }, [setHasPrivateFolder, setPrivateRootId, setPrivateSubfolders]);

  // When a private subfolder was just updated by copy/move elsewhere, refetch its contents
  useEffect(() => {
    if (lastUpdatedFolderId) {
      refetchFolderFiles(lastUpdatedFolderId);
    }
  }, [lastUpdatedFolderId]);

  // Fetch public folders using TanStack Query
  const {
    data: fetchedFolders = [],
    isLoading: foldersLoading,
  } = useQuery({
    queryKey: ["folders", "public"],
    queryFn: async () => {
      const response = await axiosInstance.get("/folder/getAllFolders");
      let folders = response.data;
      
      // Apply saved order if available
      if (folderOrder.public.length > 0) {
        folders = [...folders].sort((a, b) => {
          const aIndex = folderOrder.public.indexOf(a.folder_id);
          const bIndex = folderOrder.public.indexOf(b.folder_id);
          
          // If both folders have a defined position, sort by that
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          // If only one has a position, it comes first
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          // Otherwise maintain original order
          return 0;
        });
      }
      
      return folders;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Update local folders state when query data changes (only if different)
  useEffect(() => {
    if (fetchedFolders && fetchedFolders.length > 0) {
      setFolders(prevFolders => {
        // Only update if the data has actually changed
        if (JSON.stringify(prevFolders) !== JSON.stringify(fetchedFolders)) {
          return fetchedFolders;
        }
        return prevFolders;
      });
    }
  }, [fetchedFolders]);

  // Fetch folder contents using TanStack Query for each folder
  const folderContentQueries = useQueries({
    queries: fetchedFolders.map((folder) => ({
      queryKey: ["folderFiles", folder.folder_id],
      queryFn: async () => {
        const response = await axiosInstance.get(`/folder/getFiles/${folder.folder_id}`);
        return response.data || [];
      },
      staleTime: 1000 * 60 * 2, // Cache for 2 minutes
      enabled: !!folder.folder_id,
    })),
  });

  // Update folderContents when query results change (with stable dependencies)
  useEffect(() => {
    const allContents: Record<string, any[]> = {};
    let hasChanges = false;
    
    folderContentQueries.forEach((query, index) => {
      if (query.data && fetchedFolders[index]) {
        const folderId = fetchedFolders[index].folder_id;
        const data = Array.isArray(query.data) ? query.data : [];
        allContents[folderId] = data;
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      setFolderContents((prevContents) => {
        // Only update if there are actual changes
        const hasRealChanges = Object.keys(allContents).some(folderId => {
          const prevData = prevContents[folderId] || [];
          const newData = allContents[folderId] || [];
          return JSON.stringify(prevData) !== JSON.stringify(newData);
        });
        
        if (hasRealChanges) {
          return {
            ...prevContents,
            ...allContents,
          };
        }
        return prevContents;
      });
    }
  }, [
    folderContentQueries.map(q => q.isSuccess && q.data ? JSON.stringify(q.data) : '').join('|'),
    fetchedFolders.map(f => f.folder_id).join(',')
  ]);

  // Fetch private folder contents using TanStack Query
  const privateContentQueries = useQueries({
    queries: privateSubfolders.map((subfolder) => ({
      queryKey: ["folderFiles", subfolder.folder_id],
      queryFn: async () => {
        const response = await axiosInstance.get(`/folder/getFiles/${subfolder.folder_id}`);
        return response.data || [];
      },
      staleTime: 1000 * 60 * 2, // Cache for 2 minutes
      enabled: !!subfolder.folder_id && hasPrivateFolder,
    })),
  });

  // Update private folder contents when query results change (with stable dependencies)
  useEffect(() => {
    const privateContents: Record<string, any[]> = {};
    let hasChanges = false;
    
    privateContentQueries.forEach((query, index) => {
      if (query.data && privateSubfolders[index]) {
        const folderId = privateSubfolders[index].folder_id;
        const data = Array.isArray(query.data) ? query.data : [];
        privateContents[folderId] = data;
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      setFolderContents((prevContents) => {
        // Only update if there are actual changes
        const hasRealChanges = Object.keys(privateContents).some(folderId => {
          const prevData = prevContents[folderId] || [];
          const newData = privateContents[folderId] || [];
          return JSON.stringify(prevData) !== JSON.stringify(newData);
        });
        
        if (hasRealChanges) {
          return {
            ...prevContents,
            ...privateContents,
          };
        }
        return prevContents;
      });
    }
  }, [
    privateContentQueries.map(q => q.isSuccess && q.data ? JSON.stringify(q.data) : '').join('|'),
    privateSubfolders.map(f => f.folder_id).join(',')
  ]);

  // Apply saved order to private folders when they're loaded (render-time sorting to avoid state loops)
  const displayPrivateSubfolders = useMemo(() => {
    if (privateSubfolders.length > 0 && folderOrder.private.length > 0) {
      return [...privateSubfolders].sort((a, b) => {
        const aIndex = folderOrder.private.indexOf(a.folder_id);
        const bIndex = folderOrder.private.indexOf(b.folder_id);
        
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return 0;
      });
    }
    return privateSubfolders;
  }, [privateSubfolders, folderOrder.private]);

  const handleDialogue = (state: boolean) => {
    setDialogueOpen(state);
  };

  const handleAlert = (state: boolean) => {
    setDialogueAlert(state);
  };

  const handleAlertFile = (state: boolean) => {
    setDialogueAlertFile(state);
  };

  // Helper: fetch content for a folder and merge into state
  const refetchFolderFiles = async (targetFolderId: string) => {
    try {
      const res = await axiosInstance.get(`/folder/getFiles/${targetFolderId}`);
      const files = res.data || [];
      setFolderContents((prev) => ({ ...prev, [targetFolderId]: files }));
    } catch (e) {
      // noop
    }
  };

  const handlePrivateFolderActionSuccess = async (
    file,
    fromFolderId,
    actionType: "copy" | "move",
    toFolderId?: string
  ) => {
    // Use TanStack Query cache updates for instant UI updates
    if (actionType === "move") {
      // Remove file from source folder cache
      queryClient.setQueryData(
        ["folderFiles", fromFolderId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.filter((f: any) => f.doc_id !== file.doc_id);
        }
      );
    }
    
    // Add file to target folder cache (for both copy and move)
    if (toFolderId) {
      queryClient.setQueryData(
        ["folderFiles", toFolderId],
        (oldData: any) => {
          if (!oldData) return [file];
          // Check if file already exists to avoid duplicates
          const fileExists = oldData.some((f: any) => f.doc_id === file.doc_id);
          if (fileExists) return oldData;
          return [...oldData, file];
        }
      );
    }
    
    // Invalidate document queries for ListView/GridView updates
    queryClient.invalidateQueries({
      queryKey: ["documents"],
    });
    
    // Trigger document refetch flag for components that still use it
    setShouldRefetchDocuments(true);
  };

  const toggleDropDown = async (folderId: string) => {
    const newValue = selectFolderId === folderId ? null : folderId;
    setSelectFolderId(newValue);
  };

  const handleRename = async (folderId: string) => {
    if (newFolderName.trim() === "") {
      toast.error("Folder name is required");
      return;
    }
    try {
      await axiosInstance.put(`/folderrenameFolder/${folderId}`, {
        folder_id: folderId,
        new_name: newFolderName,
      });
      setFolders((prevFolders) =>
        prevFolders.map((folder) =>
          folder.folder_id === folderId
            ? { ...folder, folder_name: newFolderName }
            : folder
        )
      );
      // Reset editing state
      setEditingFolder(null);
      setNewFolderName("");
      toast("Successfully edited the folder", {
        description: "Folder has been renamed successfully",
        style: {
          color: "white",
          background: "black",
        },
      });
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast("Failed to edit", {
        description: error.response.data.detail,
        style: {
          background: "black",
          color: "white",
        },
      });
    }
  };

  const handleDragStart = (file, fromFolderId) => {
    setDraggedFile({ file, fromFolderId });
  };

  const handleDragEnd = () => {
    setDraggedFile(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragLeave = () => {
    setDraggedOverFolder(null);
  };

  const handleDrop = async (toFolderId) => {
    if (!draggedFile) return;
    const { file, fromFolderId } = draggedFile;
    if (fromFolderId === toFolderId) {
      toast.error("File already in same folder");
      return;
    }
    
    // Optimistic update - update cache immediately
    queryClient.setQueryData(
      ["folderFiles", fromFolderId],
      (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.filter((f: any) => f.doc_id !== file.doc_id);
      }
    );
    
    queryClient.setQueryData(
      ["folderFiles", toFolderId],
      (oldData: any) => {
        if (!oldData) return [file];
        return [...oldData, file];
      }
    );
    
    try {
      await axiosInstance.post(`/document/move?to_folder_id=${toFolderId}`, {
        document_ids: [file.doc_id],
      });
      
      // Invalidate document queries for ListView/GridView updates
      queryClient.invalidateQueries({
        queryKey: ["documents"],
      });
      
      setShouldRefetchDocuments(true);
      toast.success("File moved successfully!");
    } catch (error) {
      console.error("Error moving file:", error);
      toast.error("Failed to move the file. Please try again.");
      
      // Revert optimistic update on error
      queryClient.setQueryData(
        ["folderFiles", fromFolderId],
        (oldData: any) => {
          if (!oldData) return [file];
          return [...oldData, file];
        }
      );
      
      queryClient.setQueryData(
        ["folderFiles", toFolderId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.filter((f: any) => f.doc_id !== file.doc_id);
        }
      );
    } finally {
      setDraggedFile(null);
    }
  };

  const handleMove = async (file) => {
    // Optimistic update - update cache immediately
    queryClient.setQueryData(
      ["folderFiles", selectFolderId],
      (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.filter((f: any) => f.doc_id !== file.doc_id);
      }
    );
    
    queryClient.setQueryData(
      ["folderFiles", folderId],
      (oldData: any) => {
        if (!oldData) return [file];
        return [...oldData, file];
      }
    );
    
    try {
      await axiosInstance.post(`/document/move?to_folder_id=${folderId}`, {
        document_ids: [file.doc_id],
      });
      
      // Invalidate document queries for ListView/GridView updates
      queryClient.invalidateQueries({
        queryKey: ["documents"],
      });
      
      setShouldRefetchDocuments(true);
      toast.success("File moved successfully!");
    } catch (error) {
      console.error("Error !!", error);
      toast.error("Failed to move the file. Please try again.");
      
      // Revert optimistic update on error
      queryClient.setQueryData(
        ["folderFiles", selectFolderId],
        (oldData: any) => {
          if (!oldData) return [file];
          return [...oldData, file];
        }
      );
      
      queryClient.setQueryData(
        ["folderFiles", folderId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.filter((f: any) => f.doc_id !== file.doc_id);
        }
      );
    }
  };

  // Helper function to reorder an array
  const reorderArray = (array, sourceId, targetId, position) => {
   
    const newArray = [...array];
    const sourceIndex = newArray.findIndex(item => item.folder_id === sourceId);
    const targetIndex = newArray.findIndex(item => item.folder_id === targetId);
    
    if (sourceIndex === -1) return newArray;
    
    const [sourceItem] = newArray.splice(sourceIndex, 1);
    
    let insertIndex = targetIndex;
    if (position === 'below') {
      insertIndex = targetIndex + 1;
    }
    
    if (targetIndex === -1) {
      newArray.push(sourceItem);
    } else {
      // Adjust insertIndex if the source was before the target and we are moving below
      if (sourceIndex < targetIndex && position === 'below') {
        insertIndex = targetIndex;
      }
      newArray.splice(insertIndex, 0, sourceItem);
    }
    
    return newArray;
  };

  // New functions for folder drag and drop
  const handleFolderDragStart = (e, folderId, type) => {
    setDraggedFolder({ folderId, type });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.innerHTML);
  };

  const handleFolderDragOver = (e, folderId, type) => {
    e.preventDefault();
    if (draggedFolder && draggedFolder.type === type) {
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const height = rect.height;
      
      // Determine if we're in the top or bottom half of the folder
      const position = y < height / 2 ? 'above' : 'below';
      
      setFolderDragOver({ folderId, type, position });
    }
  };

  const handleFolderDragLeave = () => {
    setFolderDragOver(null);
  };

  const handleFolderDrop = (e, targetFolderId, type) => {
    e.preventDefault();
    if (!draggedFolder || draggedFolder.type !== type) return;
    
    const sourceFolderId = draggedFolder.folderId;
    if (sourceFolderId === targetFolderId) {
      setFolderDragOver(null);
      return;
    }
    
    // Update folder order state
    setFolderOrder(prev => {
      const newOrder = { ...prev };
      const section = type;
      const sourceIndex = newOrder[section].indexOf(sourceFolderId);
      const targetIndex = newOrder[section].indexOf(targetFolderId);
      
      // Remove source from its current position
      if (sourceIndex !== -1) {
        newOrder[section].splice(sourceIndex, 1);
      } else {
        // If source wasn't in the order array, add it
        newOrder[section].push(sourceFolderId);
      }
      
      // Determine insert position based on drop position
      let insertIndex = targetIndex !== -1 ? targetIndex : newOrder[section].length;
      
      if (folderDragOver && folderDragOver.position === 'below') {
        insertIndex = targetIndex !== -1 ? targetIndex + 1 : newOrder[section].length;
      }
      
      // Insert source at the calculated position
      newOrder[section].splice(insertIndex, 0, sourceFolderId);
      
      return newOrder;
    });
    
    // Update the local arrays immediately for UI responsiveness
    if (type === 'public') {
      setFolders(prevFolders => 
        reorderArray(prevFolders, sourceFolderId, targetFolderId, folderDragOver.position)
      ) ;
    } else if (type === 'private') {
      setPrivateSubfolders(
        reorderArray(privateSubfolders, sourceFolderId, targetFolderId, folderDragOver.position) 
      );
    }
    
    setDraggedFolder(null);
    setFolderDragOver(null);
  };

  // Handle checkbox click separately from folder click
  const handleCheckboxClick = (e, folderId) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFolderSelection(folderId);
  };

  const fetchDocumentsByIds = async (docIds: string[]) => {
    const promises = docIds.map((docId) =>
      axiosInstance.get(`/document/cv/${docId}`).then((res) => res.data)
    );
    return Promise.all(promises);
  };

  const formatName = (name: string | undefined): string => {
    if (!name) return "undefined";
    return name.trim().replace(/\s+/g, "-").toLowerCase();
  };

  const formatLanguages = (languages: string[] | undefined): string => {
    if (!languages || languages.length === 0) return "undefined";
    return languages
      .map((item) => {
        const match = item.match(/\b[a-zA-Z#]+\b/);
        return match ? match[0] : "";
      })
      .filter((lang) => lang !== "")
      .slice(0, 3)
      .join("-");
  };

  const handleCardClick = async (docId: string) => {
    try {
      const [documentData] = await fetchDocumentsByIds([docId]);
      const url = `/cv-detail/${docId}/${formatName(
        documentData?.parsed_cv?.name
      )}/${formatLanguages(documentData?.parsed_cv?.programming_languages)}`;
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error fetching document data:", error);
    }
  };

  // Helper to render drop indicator
  const renderDropIndicator = (folderId, type, position) => {
    if (!folderDragOver || folderDragOver.type !== type || folderDragOver.folderId !== folderId) {
      return null;
    }
    
    return (
      <div 
        className={`absolute left-0 right-0 h-0.5 bg-blue-500 transition-all duration-200 ${
          position === 'above' ? 'top-0' : 'bottom-0'
        }`}
      />
    );
  };

  return (
    <div className="w-full">
      {/* Dailogue on clikcing Select */}
      {dialogOpen && (
        <DialogueComponent
          folders={folders}
          id={selectedFolder}
          variant="selectMultiple"
          handleDialogue={handleDialogue}
          setArchieveFiles={setFolderContents}
          name={name}
        />
      )}
      {/* Folder Dialogue */}
      {dialogAlert && (
        <DialogueComponent
          variant="alert"
          handleDialogue={handleAlert}
          id={selectedFolder}
          setFolders={setFolders}
          setUpdateFolderList={setUpdateFolderList}
        />
      )}
      {/* Daiologue on clicking three dot icon of individual file */}
      {dialogAlertFile && (
        <DialogueComponent
          variant="alertFile"
          handleDialogue={handleAlertFile}
          id={selectedFile}
          setArchieveFiles={setFolderContents}
        />
      )}
      {/* Private Subfolders Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center justify-between w-full cursor-pointer" onClick={togglePrivateSection}>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold  text-gray-700 dark:text-gray-300">
                Private Folders
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {hasPrivateFolder && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCreatePrivateSubfolderOpen(true);
                  }}
                  disabled={isCreatingPrivateFolder}
                >
                  <CirclePlus className="h-3 w-3 mr-1" /> 
                </Button>
              )}
              <span className={`transform transition-transform duration-300 hover:cursor-pointer ${isPrivateSectionOpen ? "rotate-180" : "rotate-0"}`}>
                <FaChevronDown className="hover:cursor-pointer" />
              </span>
            </div>
          </div>
              <Dialog
                open={isCreatePrivateSubfolderOpen}
                onOpenChange={setIsCreatePrivateSubfolderOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create private</DialogTitle>
                  </DialogHeader>
                  <div className="mt-2">
                    <Input
                      placeholder="Enter subfolder name"
                      value={newPrivateSubfolderName}
                      onChange={(e) =>
                        setNewPrivateSubfolderName(e.target.value)
                      }
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreatePrivateSubfolderOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!newPrivateSubfolderName.trim() || !privateRootId)
                          return;
                        setIsCreatingPrivateFolder(true);
                        try {
                          const res = await axiosInstance.post(
                            `/folder/create`,
                            {
                              name: newPrivateSubfolderName.trim(),
                              parent_id: privateRootId,
                              visibility: "private",
                            }
                          );
                          const newFolder = {
                            folder_id: res.data?.folder_id,
                            name:
                              res.data?.folder_name ||
                              newPrivateSubfolderName.trim(),
                          };
                          setPrivateSubfolders([
                            ...privateSubfolders,
                            newFolder,
                          ]);
                          setFolderContents((prev) => ({
                            ...prev,
                            [newFolder.folder_id]: [],
                          }));
                          setNewPrivateSubfolderName("");
                          setIsCreatePrivateSubfolderOpen(false);
                          toast.success("Private subfolder created");
                        } catch (e) {
                          toast.error("Failed to create subfolder");
                        } finally {
                          setIsCreatingPrivateFolder(false);
                        }
                      }}
                      disabled={
                        isCreatingPrivateFolder ||
                        !newPrivateSubfolderName.trim()
                      }
                    >
                      {isCreatingPrivateFolder ? "Creating..." : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            
        </div>
        {isPrivateSectionOpen && (
          <>
            {!hasPrivateFolder && (
          <div className="text-xs text-gray-600 dark:text-gray-400 px-1 flex items-center gap-1">
            Upgrade to access private folders.{" "}
            <Link
              href="/user/setting"
              target="_blank"
              className="text-blue-600 underline underline-offset-2"
            >
              <ExternalLink size={14} />
            </Link>
          </div>
        )}
        {hasPrivateFolder && privateSubfolders.length === 0 && (
          <div className="text-xs text-gray-600 dark:text-gray-400 px-1 flex items-center gap-2">
            No private subfolders yet.
          </div>
        )}
        {hasPrivateFolder &&
          displayPrivateSubfolders.map((pf) => (
            <div
              key={pf.folder_id}
              className={`mb-4 transition-all duration-200 relative ${
                draggedOverFolder === pf.folder_id
                  ? "opacity-50 bg-gray-700/30"
                  : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(pf.folder_id)}
            >
              {/* Drop indicator above */}
              {renderDropIndicator(pf.folder_id, 'private', 'above')}
              
              <div 
                className="flex items-center flex-1 rounded"
                draggable
                onDragStart={(e) => handleFolderDragStart(e, pf.folder_id, 'private')}
                onDragOver={(e) => handleFolderDragOver(e, pf.folder_id, 'private')}
                onDragLeave={handleFolderDragLeave}
                onDrop={(e) => handleFolderDrop(e, pf.folder_id, 'private')}
              >
                {editingFolder === pf.folder_id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRename(pf.folder_id);
                    }}
                    className="flex-1 ml-12"
                  >
                    <Input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value.trim())}
                      onBlur={() => setEditingFolder(null)}
                      className="w-full rounded p-1"
                      ref={(el) => {
                        if (el) inputRefs.current[pf.folder_id] = el;
                      }}
                    />
                    <button type="submit" className="hidden"></button>
                  </form>
                ) : (
                  <div className="flex items-center w-full gap-2">
                    {/* Checkbox for multi-folder selection */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center bg-white dark:bg-gray-800 cursor-pointer hover:border-blue-500"
                            onClick={(e) => handleCheckboxClick(e, pf.folder_id)}
                          >
                            {selectedFolderIds.includes(pf.folder_id) && (
                              <Check className="h-3 w-3 text-blue-600" />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={5}>
                          <p className="text-xs">
                            {selectedFolderIds.includes(pf.folder_id) 
                              ? "Remove from search selection" 
                              : "Include in search across multiple folders"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {/* Folder name and icon - clickable to expand/collapse */}
                    <div
                      className="flex items-center flex-1 gap-2 hover:cursor-move hover:opacity-50"
                      onClick={() => toggleDropDown(pf.folder_id)}
                    >
                      <span className="hover:cursor-move">
                        {selectFolderId === pf.folder_id ? (
                          <FaRegFolderOpen className="hover:cursor-move" />
                        ) : (
                          <FaRegFolder className="hover:cursor-move" />
                        )}
                      </span>
                      <span className="ml-3 flex items-center gap-2 hover:cursor-move">
                        {pf.name}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex  items-center gap-4 ">
                  <div
                    className="flex gap-4 cursor-pointer"
                    onClick={() => toggleDropDown(pf.folder_id)}
                  >
                    <span
                      className={`ml-auto hover:opacity-50 hover:cursor-pointer items-center justify-center  flex transform transition-transform duration-300 ${
                        selectFolderId === pf.folder_id
                          ? "rotate-180"
                          : "rotate-0"
                      }`}
                    >
                      <FaChevronDown className="hover:cursor-pointer" />
                    </span>
                  </div>
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          onClick={() => {
                            setSelectedFolder(pf.folder_id);
                          }}
                        >
                          <BsThreeDotsVertical />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-32 p-1 px-6 cursor-pointer ml-36">
                        <p
                          className="py-1 w-full hover:opacity-50"
                          onClick={() => {
                            setEditingFolder(pf.folder_id);
                            setNewFolderName(pf.name);
                          }}
                        >
                          Rename
                        </p>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              
              {/* Drop indicator below */}
              {renderDropIndicator(pf.folder_id, 'private', 'below')}
              
              {selectFolderId === pf.folder_id && (
                <div className="mt-2 ml-6 border-l  border-gray-600 pl-4 max-w-full truncate">
                  {folderContents[pf.folder_id]?.length ? (
                    folderContents[pf.folder_id]
                      .sort((a, b) => {
                        const nameA = (a.doc_name || '').toLowerCase();
                        const nameB = (b.doc_name || '').toLowerCase();
                        return nameA.localeCompare(nameB);
                      })
                      .map((file) => (
                      <div
                        key={file.doc_id}
                        className="relative flex items-center justify-between p-1 text-gray-800 dark:text-gray-400 ease-in-out duration-150 delay-75 rounded w-full "
                      >
                        <div
                          key={file.doc_id}
                          onClick={() => handleCardClick(file.doc_id)}
                          className="w-full hover:opacity-60 truncate flex items-center space-x-[1px] cursor-pointer"
                          draggable
                          onDragStart={() =>
                            handleDragStart(file, pf.folder_id)
                          }
                          onDragEnd={handleDragEnd}
                        >
                          <span>
                            <RxHamburgerMenu />
                          </span>
                          <span className="px-2  py-1 text-sm truncate">
                            {file.doc_name?.replace(".pdf", "")}
                          </span>
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button>
                              <BsThreeDots
                                className="text-gray-800 dark:text-gray-400 hover:opacity-60 hover:cursor-pointer"
                                size={"15px"}
                              />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-28 p-1 ml-32">
                            <p
                              className="flex items-center py-1 hover:cursor-pointer hover:opacity-50 justify-center"
                              onClick={() => {
                                handleAlertFile(true);
                                setSelectedFile({
                                  folder_id: pf.folder_id,
                                  file_id: file.doc_id || file._id,
                                });
                              }}
                            >
                              Archive
                            </p>
                          </PopoverContent>
                        </Popover>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-800 dark:text-gray-400 italic">
                      {`No PDF's uploaded.`}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          </>
        )}
      </div>
      {/* Public Folders Section */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1 mb-">
          <div className="flex items-center justify-between w-full cursor-pointer" onClick={togglePublicSection}>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold   text-gray-700 dark:text-gray-300">
                Public Folders
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={`transform transition-transform duration-300 hover:cursor-pointer ${isPublicSectionOpen ? "rotate-180" : "rotate-0"}`}>
                <FaChevronDown className="hover:cursor-pointer" />
              </span>
            </div>
          </div>
        </div>
        {isPublicSectionOpen && folders.map((folder) => (
          <div
            key={folder.folder_id}
            className={`mb-4 transition-all duration-200 relative ${
              draggedOverFolder === folder.folder_id
                ? "opacity-50 bg-gray-700/30"
                : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(folder.folder_id)}
          >
            {/* Drop indicator above */}
            {renderDropIndicator(folder.folder_id, 'public', 'above')}
            
            <div 
              className="flex items-center flex-1 rounded"
              draggable
              onDragStart={(e) => handleFolderDragStart(e, folder.folder_id, 'public')}
              onDragOver={(e) => handleFolderDragOver(e, folder.folder_id, 'public')}
              onDragLeave={handleFolderDragLeave}
              onDrop={(e) => handleFolderDrop(e, folder.folder_id, 'public')}
            >
              {editingFolder === folder.folder_id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRename(folder.folder_id);
                  }}
                  className="flex-1 ml-12"
                >
                  <Input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value.trim())}
                    onBlur={() => setEditingFolder(null)}
                    className="w-full rounded p-1"
                    ref={(el) => {
                      if (el) inputRefs.current[folder.folder_id] = el;
                    }}
                  />
                  <button type="submit" className="hidden"></button>
                </form>
              ) : (
                <div className="flex items-center w-full gap-2">
                  {/* Checkbox for multi-folder selection */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center bg-white dark:bg-gray-800 cursor-pointer hover:border-blue-500"
                          onClick={(e) => handleCheckboxClick(e, folder.folder_id)}
                        >
                          {selectedFolderIds.includes(folder.folder_id) && (
                            <Check className="h-3 w-3 text-blue-600" />
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={5}>
                        <p className="text-xs">
                          {selectedFolderIds.includes(folder.folder_id) 
                            ? "Remove from search selection" 
                            : "Include in search across multiple folders"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {/* Folder name and icon - clickable to expand/collapse */}
                  <div
                    className="flex items-center flex-1 gap-2 hover:cursor-move hover:opacity-50"
                    onClick={() => toggleDropDown(folder.folder_id)}
                  >
                    <span className="hover:cursor-move">
                      {selectFolderId === folder.folder_id ? (
                        <FaRegFolderOpen className="hover:cursor-move" />
                      ) : (
                        <FaRegFolder className="hover:cursor-move" />
                      )}
                    </span>
                    <span className="ml-3 hover:cursor-move">{folder.folder_name}</span>
                  </div>
                </div>
              )}
              <div className="flex  items-center gap-4 ">
                <div
                  className="flex gap-4 cursor-pointer"
                  onClick={() => toggleDropDown(folder.folder_id)}
                >
                  <span
                    className={`ml-auto hover:opacity-50 hover:cursor-pointer items-center justify-center  flex transform transition-transform duration-300 ${
                      selectFolderId === folder.folder_id
                        ? "rotate-180"
                        : "rotate-0"
                    }`}
                  >
                    <FaChevronDown className="hover:cursor-pointer" />
                  </span>
                </div>
                <div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        onClick={() => {
                          setSelectedFolder(folder.folder_id);
                        }}
                      >
                        <BsThreeDotsVertical />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-32 p-1 px-6 cursor-pointer ml-36">
                      <p
                        className="py-1 w-full hover:opacity-50"
                        onClick={() => {
                          setEditingFolder(folder.folder_id);
                          setNewFolderName(folder.folder_name);
                        }}
                      >
                        Rename
                      </p>
                      <hr className=" bg-gray-300 h-[1px] border-0" />
                      <p
                        onClick={() => {
                          handleDialogue(true);
                          // setEditingFolder(folder.folder_id);
                          setName(folder.folder_name);
                        }}
                        className="py-1 w-full hover:opacity-50"
                      >
                        Select
                      </p>
                      <hr className=" bg-gray-300 h-[1px] border-0" />
                      <p
                        onClick={() => {
                          handleAlert(true);
                        }}
                        className="py-1 w-full hover:opacity-50"
                      >
                        Archive
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            {/* Drop indicator below */}
            {renderDropIndicator(folder.folder_id, 'public', 'below')}
            
            {selectFolderId === folder.folder_id && (
              <div className="mt-2 ml-6 border-l  border-gray-600 pl-4 max-w-full truncate">
                {folderContents[folder.folder_id]?.length ? (
                  folderContents[folder.folder_id]
                    .sort((a, b) => {
                      const nameA = (a.doc_name || '').toLowerCase();
                      const nameB = (b.doc_name || '').toLowerCase();
                      return nameA.localeCompare(nameB);
                    })
                    .map((file) => (
                    <div
                      key={file.doc_id}
                      className="relative flex items-center justify-between p-1 text-gray-800 dark:text-gray-400 ease-in-out duration-150 delay-75 rounded w-full "
                    >
                      <div
                        key={file.doc_id}
                        onClick={() => handleCardClick(file.doc_id)}
                        className="w-full hover:opacity-60 truncate flex items-center space-x-[1px] cursor-pointer"
                        draggable
                        onDragStart={() =>
                          handleDragStart(file, folder.folder_id)
                        }
                        onDragEnd={handleDragEnd}
                      >
                        <span>
                          <RxHamburgerMenu />
                        </span>
                        <span className="px-2  py-1 text-sm truncate">
                          {file.doc_name.replace(".pdf", "")}
                        </span>
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button>
                            <BsThreeDots
                              className="text-gray-800 dark:text-gray-400 hover:opacity-60 hover:cursor-pointer"
                              size={"15px"}
                            />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-28 p-1 ml-32">
                          <p
                            className="flex items-center py-1 hover:cursor-pointer hover:opacity-50 justify-center"
                            onClick={() => {
                              handleAlertFile(true);
                              setSelectedFile({
                                folder_id: folder.folder_id,
                                file_id: file.doc_id || file._id,
                              });
                            }}
                          >
                            Archive
                          </p>
                          <hr />
                          {/* Private Folder Actions */}
                          <div className="flex items-center justify-center py-1">
                            <PrivateFolderActions
                              documentId={file.doc_id}
                              documentName={file.doc_name}
                              currentFolderId={folder.folder_id}
                              variant="button"
                              className="w-full h-6 text-xs border-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                              onSuccess={(actionType, toFolderId) => {
                                handlePrivateFolderActionSuccess(
                                  file,
                                  folder.folder_id,
                                  actionType,
                                  toFolderId
                                );
                              }}
                            />
                          </div>
                          <hr />
                          <Popover>
                            <PopoverTrigger asChild>
                              <p className="flex items-center py-1 hover:cursor-pointer hover:opacity-50 justify-center">
                                Move to
                              </p>
                            </PopoverTrigger>
                            <PopoverContent
                              className="p-2 w-[200px]"
                              side="right"
                              align="start"
                            >
                              <Command>
                                <CommandInput
                                  placeholder="Search folder..."
                                  className="h-4"
                                />
                                <CommandList className="max-h-48">
                                  <CommandGroup>
                                    {folders?.map((folder) => (
                                      <CommandItem
                                        key={folder.folder_id}
                                        value={folder.folder_name}
                                        onSelect={(currentValue) => {
                                          setValue(
                                            currentValue === value
                                              ? ""
                                              : currentValue
                                          );
                                          setFolderId(folder.folder_id);
                                        }}
                                      >
                                        {folder.folder_name}
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            value === folder.folder_name
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                              <div className="w-full flex justify-end mt-2">
                                <Button
                                  className="text-sm h-8 w-12 rounded-lg px-4 py-1"
                                  onClick={() => {
                                    handleMove(file);
                                  }}
                                >
                                  Move
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </PopoverContent>
                      </Popover>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-800 dark:text-gray-400 italic">
                    {`No PDF's uploaded.`}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FolderList;