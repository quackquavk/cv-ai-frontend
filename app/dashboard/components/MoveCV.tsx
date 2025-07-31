import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, Dot } from "lucide-react";
import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosConfig";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const MoveCV = ({ handleCarouselClick, item, folders }) => {
  const [newFolder, setNewFolder] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

  // ✨ 1. Add state for both popovers
  const [isOuterPopoverOpen, setIsOuterPopoverOpen] = useState(false);
  const [isInnerPopoverOpen, setIsInnerPopoverOpen] = useState(false);

  const queryClient = useQueryClient();
  const archiveMutation = useMutation({
    mutationFn: (documentId) => {
      return axiosInstance.post("/document/archive_document", {
        document_ids: [documentId],
      });
    },
    onMutate: async (documentId) => {
      // Optimistically update the UI
      await queryClient.cancelQueries({ queryKey: ["documents"] });
      const previousData = queryClient.getQueryData(["documents"]);
      
      queryClient.setQueryData(["documents","",null], (oldData: any) => {
        if (!oldData) return;
        const newPages = oldData.pages.map((page) => ({
          ...page,
          documents: page.documents.filter((doc) => doc._id !== documentId),
        }));
        return { ...oldData, pages: newPages };
      });

      return { previousData };
    },
    onSuccess: () => {
        toast.success("File archived successfully!");
        setIsArchiveDialogOpen(false);
        setIsOuterPopoverOpen(false);
    },
    onError: (err, documentId, context) => {
      // Roll back on failure
      toast.error("Failed to archive file.");
      if (context?.previousData) {
        queryClient.setQueryData(["documents"], context.previousData);
      }
    },
    onSettled: () => {
      // Invalidate to ensure consistency with the server
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const handleArchive = async () => {
    try {
      archiveMutation.mutate(item._id);
    } catch (error) {
      console.log(error);
      toast.error("Failed to archive file.");
    }
  };

  const handleMove = async (folderId) => {
    // Prevent moving if no new folder is selected or it's the same folder
    if (!folderId || folderId === currentFolder) {
      // Optionally close the popover without doing anything
      setIsInnerPopoverOpen(false);
      setIsOuterPopoverOpen(false);
      return;
    }
    try {
      const response = await axiosInstance.post("/folder/moveFiles", {
        from_folder: currentFolder,
        to_folder: folderId,
        document_id: [item._id],
      });
      if (response.status === 200) {
        toast.success("File moved successfully!");
        setNewFolder(null);
        // ✨ 3. Close both popovers on success
        setIsInnerPopoverOpen(false);
        setIsOuterPopoverOpen(false);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to move file.");
    }
  };

  useEffect(() => {

    const fetchCurrentFolderId = async () => {
      if(!isInnerPopoverOpen) return;
      const response = await axiosInstance.get(
        `/folder/getFolderByDocumentId/${item._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setCurrentFolder(response.data);
      setNewFolder(response.data);
    };
    fetchCurrentFolderId();
  }, [item._id, isInnerPopoverOpen]); // ✨ Added dependency to re-fetch if item changes

  return (
    <div className="relative mr-4 block">
      <div onClick={handleCarouselClick}>
        {/* ✨ 2. Control the outer popover */}
        <Popover open={isOuterPopoverOpen} onOpenChange={setIsOuterPopoverOpen}>
          <PopoverTrigger asChild>
            <button className="text-gray-800 absolute inset-x-0 h-[20px] w-[20px] z-50 dark:text-gray-400 hover:opacity-60 hover:cursor-pointer">
              <BsThreeDotsVertical size={"15px"} />
            </button>
          </PopoverTrigger>

          <PopoverContent className="p-1 z-50 w-32 px-6 cursor-pointer ">
            <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
              <DialogTrigger asChild>
                <div
                  className="flex items-center py-1 hover:cursor-pointer hover:opacity-50 justify-center"
                >
                  Archive
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Archive File</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to archive this file?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button onClick={handleArchive}>Archive</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <hr className="my-1" />

            {/* ✨ 2. Control the nested popover */}
            <Popover
              open={isInnerPopoverOpen}
              onOpenChange={setIsInnerPopoverOpen}
            >
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
                    <CommandEmpty>No folders found.</CommandEmpty>
                    <CommandGroup>
                      {folders?.map((folder) => (
                        <CommandItem
                          key={folder.folder_id}
                          value={folder.folder_name}
                          onSelect={() => {
                            // ✨ Use an arrow function here
                            setNewFolder(folder.folder_id);
                          }}
                        >
                          {folder.folder_name}
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4", // ✨ Added size for better consistency
                              newFolder === folder.folder_id
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
                      handleMove(newFolder);
                    }}
                    disabled={!newFolder || newFolder === currentFolder} // ✨ Disable button if no new folder is selected
                  >
                    Move
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </PopoverContent>
        </Popover>
      </div>
      <div>
        {!item?.parsed_cv?.edited && (
          <div className="absolute">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute  h-8 w-8 top-[-17px]">
                    <Dot color="red" size={48} />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="p-1  translate-y-7 translate-x-4 mr-16 text-xs z-50">
                  <p>Not Edited</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoveCV;
