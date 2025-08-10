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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PrivateFolderActionsProps {
  documentId: string;
  documentName?: string;
  currentFolderId?: string;
  onSuccess?: (actionType: 'copy' | 'move', toFolderId?: string) => void | Promise<void>;
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
  const { hasPrivateFolder, setHasPrivateFolder, privateSubfolders, setLastUpdatedFolderId } = privateFolderStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [selectedPrivateFolderId, setSelectedPrivateFolderId] = useState<string | "">("");

  const queryClient = useQueryClient();

  // Check if user has private folder
  const checkPrivateFolder = async () => {
    try {
      const response = await axiosInstance.get("/folder/private/root");
      const hasFolder = !!response.data?.folder_id;
      setHasPrivateFolder(hasFolder);
      return hasFolder;
    } catch (error) {
      console.error("Error checking private folder:", error);
      return false;
    }
  };

  // Copy file to a selected private subfolder
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
        toast("Private folders are premium", {
          description: "Upgrade to use private folders.",
        });
        return;
      }

      const targetFolderId = selectedPrivateFolderId || privateSubfolders?.[0]?.folder_id;
      if (!targetFolderId) {
        toast("No private subfolders", { description: "Create a private subfolder first." });
        return;
      }

      const response = await axiosInstance.post(`/document/copy?to_folder_id=${targetFolderId}`, {
        document_ids: [documentId],
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
        
        setLastUpdatedFolderId(targetFolderId);
        onSuccess?.('copy', targetFolderId);
        setShowCopyDialog(false);
      }
    } catch (error) {
      console.error("Error copying file:", error);
      toast("Failed to copy file", {
        description: error.response?.data?.detail || "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Move file to a selected private subfolder
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
        toast("Private folders are premium", {
          description: "Upgrade to use private folders.",
        });
        return;
      }

      const targetFolderId = selectedPrivateFolderId || privateSubfolders?.[0]?.folder_id;
      if (!targetFolderId) {
        toast("No private subfolders", { description: "Create a private subfolder first." });
        return;
      }

      const response = await axiosInstance.post(`/document/move?to_folder_id=${targetFolderId}`,
        { document_ids: [documentId] });

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
        
        setLastUpdatedFolderId(targetFolderId);
        onSuccess?.('move', targetFolderId);
        setShowMoveDialog(false);
      }
    } catch (error) {
      console.error("Error moving file:", error);
      toast("Failed to move file", {
        description: error.response?.data?.detail || "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (privateSubfolders?.length && !selectedPrivateFolderId) {
      setSelectedPrivateFolderId(privateSubfolders[0].folder_id);
    }
  }, [privateSubfolders, selectedPrivateFolderId]);

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
     <div className="flex-col items-center gap-2">
     <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCopyDialog(true)}
          disabled={isLoading}
          className={className}
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Copy className="h-3 w-3 mr-1" />
          )}
          Copy to Private
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMoveDialog(true)}
          disabled={isLoading}
          className={className}
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Move className="h-3 w-3 mr-1" />
          )}
          Move to Private
        </Button>
     </div>

        {/* Copy Dialog */}
        <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Copy to Private Folder</DialogTitle>
            </DialogHeader>
            <div className="mb-3">
              <Select value={selectedPrivateFolderId} onValueChange={(v) => setSelectedPrivateFolderId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select private subfolder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {privateSubfolders.map((pf) => (
                      <SelectItem key={pf.folder_id} value={pf.folder_id}>{pf.name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to copy "{documentName}" to your private folder?
            </p>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={copyToPrivateFolder}
                disabled={isLoading || !selectedPrivateFolderId}
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
        <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Move to Private Folder</DialogTitle>
            </DialogHeader>
            <div className="mb-3">
              <Select value={selectedPrivateFolderId} onValueChange={(v) => setSelectedPrivateFolderId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select private subfolder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {privateSubfolders.map((pf) => (
                      <SelectItem key={pf.folder_id} value={pf.folder_id}>{pf.name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to move "{documentName}" to your private folder?
            </p>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={moveToPrivateFolder}
                disabled={isLoading || !selectedPrivateFolderId}
                className="bg-blue-600 hover:bg-blue-700"
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

      {/* Copy Dialog */}
      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy to Private Folder</DialogTitle>
          </DialogHeader>
          <div className="mb-3">
            <Select value={selectedPrivateFolderId} onValueChange={(v) => setSelectedPrivateFolderId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select private subfolder" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {privateSubfolders.map((pf) => (
                    <SelectItem key={pf.folder_id} value={pf.folder_id}>{pf.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
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
              disabled={isLoading || !selectedPrivateFolderId}
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
          <div className="mb-3">
            <Select value={selectedPrivateFolderId} onValueChange={(v) => setSelectedPrivateFolderId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select private subfolder" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {privateSubfolders.map((pf) => (
                    <SelectItem key={pf.folder_id} value={pf.folder_id}>{pf.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
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
              disabled={isLoading || !selectedPrivateFolderId}
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