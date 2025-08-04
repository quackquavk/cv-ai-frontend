"use client";

import React, { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import axiosInstance from "../../../utils/axiosConfig";
import { UserContext } from "@/context/UserContext";
import { privateFolderStore } from "../store";
import { 
  FolderLock, 
  Copy, 
  Move, 
  MoreVertical,
  Loader2 
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface PrivateFolderActionsProps {
  documentId: string;
  documentName?: string;
  currentFolderId?: string;
  onSuccess?: () => void;
  variant?: "button" | "dropdown" | "icon";
  className?: string;
}

const PrivateFolderActions: React.FC<PrivateFolderActionsProps> = ({
  documentId,
  documentName = "document",
  currentFolderId,
  onSuccess,
  variant = "dropdown",
  className = "",
}) => {
  const userContext = useContext(UserContext);
  const { isAuthenticated } = userContext;
  const { hasPrivateFolder, setHasPrivateFolder } = privateFolderStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const queryClient = useQueryClient();

  // Check if user has private folder
  const checkPrivateFolder = async () => {
    try {
      const response = await axiosInstance.get("/private_folder/hasPrivateFolder");
      const hasFolder = response.data.has_private_folder;
      setHasPrivateFolder(hasFolder);
      return hasFolder;
    } catch (error) {
      console.error("Error checking private folder:", error);
      return false;
    }
  };

  // Create private folder
  const createPrivateFolder = async () => {
    setIsCreatingFolder(true);
    try {
      const response = await axiosInstance.post("/private_folder/createPrivateFolder");
      if (response.status === 200) {
        setHasPrivateFolder(true);
        toast("Private folder created", {
          description: "Your private folder has been created successfully",
        });
        setShowCreateDialog(false);
        return true;
      }
    } catch (error) {
      console.error("Error creating private folder:", error);
      toast("Failed to create private folder", {
        description: error.response?.data?.detail || "An error occurred",
      });
    } finally {
      setIsCreatingFolder(false);
    }
    return false;
  };

  // Copy file to private folder
  const copyToPrivateFolder = async () => {
    if (!isAuthenticated) {
      toast("Authentication required", {
        description: "Please log in to use private folders",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check if user has private folder first
      const hasFolder = await checkPrivateFolder();
      if (!hasFolder) {
        setShowCreateDialog(true);
        return;
      }

      const response = await axiosInstance.post("/private_folder/copyFilesToPrivateFolder", {
        document_id: documentId,
      });

      if (response.status === 200) {
        toast("File copied successfully", {
          description: `${documentName} has been copied to your private folder`,
        });
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ["privateFiles"] });
        if (currentFolderId) {
          queryClient.invalidateQueries({ 
            queryKey: ["documents", currentFolderId] 
          });
        }
        
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error copying file:", error);
      toast("Failed to copy file", {
        description: error.response?.data?.detail || "An error occurred",
      });
    } finally {
      setIsLoading(false);
      setShowCopyDialog(false);
    }
  };

  // Move file to private folder
  const moveToPrivateFolder = async () => {
    if (!isAuthenticated) {
      toast("Authentication required", {
        description: "Please log in to use private folders",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check if user has private folder first
      const hasFolder = await checkPrivateFolder();
      if (!hasFolder) {
        setShowCreateDialog(true);
        return;
      }

      const response = await axiosInstance.post("/private_folder/moveFilesToPrivateFolder", {
        document_id: documentId,
      });

      if (response.status === 200) {
        toast("File moved successfully", {
          description: `${documentName} has been moved to your private folder`,
        });
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ["privateFiles"] });
        if (currentFolderId) {
          queryClient.invalidateQueries({ 
            queryKey: ["documents", currentFolderId] 
          });
          queryClient.invalidateQueries({ 
            queryKey: ["folderFiles", currentFolderId] 
          });
        }
        
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error moving file:", error);
      toast("Failed to move file", {
        description: error.response?.data?.detail || "An error occurred",
      });
    } finally {
      setIsLoading(false);
      setShowMoveDialog(false);
    }
  };

  const handleCreateAndProceed = async (action: "copy" | "move") => {
    const created = await createPrivateFolder();
    if (created) {
      if (action === "copy") {
        await copyToPrivateFolder();
      } else {
        await moveToPrivateFolder();
      }
    }
  };

  if (!isAuthenticated) {
    // Show login prompt instead of hiding completely
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          toast("Please log in", {
            description: "You need to be logged in to use private folders",
          });
        }}
        className={className}
      >
        <FolderLock className="h-4 w-4 mr-2" />
        To Private (Login Required)
      </Button>
    );
  }

  // Button variant - shows a simple button
  if (variant === "button") {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCopyDialog(true)}
          disabled={isLoading}
          className={className}
        >
          Copy to Private
        </Button>

        {/* Copy Dialog */}
        <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Copy to Private Folder</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to copy "{documentName}" to your private folder?
            </p>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={copyToPrivateFolder}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Icon variant - shows just an icon button
  if (variant === "icon") {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowCopyDialog(true)}
          disabled={isLoading}
          className={className}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FolderLock className="h-4 w-4" />
          )}
        </Button>

        {/* Copy Dialog */}
        <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Copy to Private Folder</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to copy "{documentName}" to your private folder?
            </p>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={copyToPrivateFolder}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Dropdown variant - shows a dropdown menu with copy and move options
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isLoading}
            className={className}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => setShowCopyDialog(true)}
            className="cursor-pointer"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy to Private
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowMoveDialog(true)}
            className="cursor-pointer"
          >
            <Move className="h-4 w-4 mr-2" />
            Move to Private
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Private Folder Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Private Folder</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You don't have a private folder yet. Would you like to create one and then proceed with the action?
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={() => handleCreateAndProceed("copy")}
              disabled={isCreatingFolder}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreatingFolder ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <FolderLock className="h-4 w-4 mr-2" />
              )}
              Create & Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Copy Dialog */}
      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy to Private Folder</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to copy "{documentName}" to your private folder? 
            The file will remain in the current folder and a copy will be created in your private folder.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={copyToPrivateFolder}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to Private Folder</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to move "{documentName}" to your private folder? 
            The file will be removed from the current folder and moved to your private folder.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={moveToPrivateFolder}
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Move className="h-4 w-4 mr-2" />
              )}
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrivateFolderActions;