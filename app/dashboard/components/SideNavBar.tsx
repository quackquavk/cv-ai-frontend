"use client";
import {
  type ChangeEvent,
  type DragEvent,
  useState,
  useContext,
  useEffect,
} from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ApiDataContext } from "../context/ApiDataContext";
import { SpinnerContext } from "../context/SpinnerContext";
import { IoIosCloudUpload } from "react-icons/io";
import FolderCreation from "./FolderCreation";
import FolderList from "./FolderList";
import type { IFolderData } from "@/interfaces/FolderData";
import { fetchUpdatedApiData } from "../utils/updatedInitialData";
import { ChevronLeft, ChevronRight, LogOut, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance from "../../../utils/axiosConfig";
import {
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DialogueComponent from "./DialogueComponent";
import { MdFolderZip } from "react-icons/md";
import { folderSelectStore, publicFolderStore } from "../store";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const SideNavBar = ({
  isCollapsed,
  onCollapsedChange,
  isMobile = false,
  onMobileClose = () => {},
}) => {
  const context = useContext(ApiDataContext);
  const spinnerContext = useContext(SpinnerContext);
  const setApiData = context?.setApiData;
  const setUploading = spinnerContext?.setUploading;
  const uploading = spinnerContext?.uploading;
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [updateFolderList, setUpdateFolderList] = useState(false);
  const [folderListData, setFolderListData] = useState<IFolderData[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [displayFolder, setDisplayFolder] = useState(false);
  const [dialogOpen, setDialogeOpen] = useState(false);
  const { selectFolderId } = folderSelectStore();
  const { isFolderListOpen } = publicFolderStore();
  const [localFolderId, setLocalFolderId] = useState<string | null>(
    selectFolderId
  );

  // For Theme Change
  const { theme, setTheme } = useTheme();

  const handleFolderCreated = () => {
    setUpdateFolderList((prev) => !prev);
  };
  const handleDialogue = (state) => {
    setDialogeOpen(state);
  };

  useEffect(() => {
    // Sync local state with external `selectFolderId` when it changes
    setLocalFolderId(selectFolderId);
    setSelectedFolderId(selectFolderId);
  }, [selectFolderId]);

  const handleValueChange = (value: string) => {
    setLocalFolderId(value);
    setSelectedFolderId(value); // Update the local state to reflect manual selection
  };

  useEffect(() => {
    setLocalFolderId(null);
  }, [isFolderListOpen]);

  const displayedFolderName =
    localFolderId &&
    folderListData.find((item: any) => item.folder_id === localFolderId)
      ?.folder_name;

  useEffect(() => {
    const folderList = async () => {
      try {
        const response = await axiosInstance.get("/folder/getAllFolders");
        setFolderListData(response.data);
        setDisplayFolder(false);
      } catch (error) {
        console.error("Error fetching Data:", error);
      } finally {
        setDisplayFolder(true);
      }
    };
    folderList();
  }, [updateFolderList]);

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      if (!selectedFolderId) {
        toast("No Folder selected", {
          description: "Please select a Folder first and then upload files",
        });
        return;
      }
      setUploading(true);

      const response = await axiosInstance.post(
        `/document/document?folder_id=${selectedFolderId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.status === 200) {
        setUpdateFolderList((prev) => !prev);
        toast("Uploaded successfully", {
          description: "The file has been uploaded successfully",
        });
        // Refectiing the initialRenderData API
        if (setApiData) {
          await fetchUpdatedApiData(setApiData);
        } else {
          console.warn("API Data context is not available");
        }
      } else {
        toast("Upload failed", {
          description: "Failed to upload files ",
        });
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast("Upload failed", {
        description: error.response.data.detail,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) handleFileUpload(event.target.files);
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files) {
      handleFileUpload(event.dataTransfer.files);
    }
  };

  const isDarkMode = theme === "dark";

  return (
    <div className={`h-full w-full ${isMobile ? "block" : ""}`}>
      <Card className="border h-full rounded-none flex flex-col relative">
        {/* Close button for mobile */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-2 z-50"
            onClick={onMobileClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}

        {/* Collapse Button - Only show on desktop */}
        {!isCollapsed && !isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-50 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-600 shadow-md text-center"
            onClick={() => onCollapsedChange(true)}
          >
            <ChevronLeft className="h-4 w-4 text-white" />
          </Button>
        )}

        {dialogOpen && !isCollapsed && (
          <DialogueComponent
            variant="archive"
            handleDialogue={handleDialogue}
            setUpdateFolderList={setUpdateFolderList}
          />
        )}

        {/* Fixed Header */}
        <SidebarHeader className="sticky top-0 z-10  pt-2">
          {!isCollapsed ? (
            <h1 className="text-2xl text-center w-full px-4 text-black dark:text-white font-bold">
              CV_AI
            </h1>
          ) : (
            <div className="text-xl text-center w-full text-black dark:text-white flex flex-col">
              <h1>CV</h1>
              <h1>AI</h1>
            </div>
          )}
        </SidebarHeader>

        <SidebarContent
          className={` ${
            isCollapsed && "hidden"
          } flex flex-col flex-1 overflow-hidden`}
        >
          {/* Fixed Drop Files Section - Only show when expanded */}

          <div
            className={`${
              isCollapsed && "hidden"
            } w-full px-4 pt-2 sticky top-0 z-10`}
          >
            <div
              onDrop={handleDrop}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById("file-input")?.click()}
              className={`relative flex flex-col cursor-pointer items-center justify-center h-22 border-2 border-dashed border-gray-800 dark:border-white p-4 rounded-md  transition-all duration-300 ease-in-out ${
                isDragging ? "opacity-50 backdrop-blur-sm" : "opacity-100"
              }`}
            >
              <div className="flex flex-col items-center h-full w-full justify-center">
                <IoIosCloudUpload
                  // color="black"
                  size={40}
                  className="text-black dark:text-white"
                />
                <p className="text-center">Drop your files here</p>
              </div>
            </div>
            <input
              id="file-input"
              className="hidden"
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              multiple
              disabled={uploading}
            />
          </div>

          {/* Fixed Folder Selection - Only show when expanded */}

          <div
            className={` ${isCollapsed && "hidden"}
        w-full px-4 py-4 sticky top-[120px] z-10`}
          >
            <Select
              value={localFolderId || ""}
              onValueChange={handleValueChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Uploading to ....">
                  {displayedFolderName || "Uploading to...."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {folderListData.map((item, index) => (
                    <div key={index} className="">
                      <SelectItem value={item.folder_id}>
                        {item.folder_name}
                      </SelectItem>
                    </div>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Fixed Folder Creation - Only show when expanded */}

          <div
            className={`${isCollapsed && "hidden"}
         w-full px-4 sticky top-[180px] z-10`}
          >
            <FolderCreation
              onFolderCreated={handleFolderCreated}
              setUpdateFolderList={setUpdateFolderList}
            />
          </div>

          {/* Scrollable Folder List - Only show when expanded */}

          <div
            className={`${
              isCollapsed && "hidden"
            } w-full px-4 flex-1 overflow-y-auto mt-4 scrollbar-thin`}
          >
            {isFolderListOpen && displayFolder && (
              <div className="flex flex-col">
                <FolderList
                  updateFolderList={updateFolderList}
                  setUpdateFolderList={setUpdateFolderList}
                />

                <button
                  className="bg-inherit px-0 items-center py-1 flex justify-start hover:opacity-60 w-full"
                  onClick={() => {
                    handleDialogue(true);
                  }}
                >
                  <MdFolderZip className="opacity-70" />
                  <h1 className="ml-6">Archive</h1>
                </button>
              </div>
            )}
          </div>
        </SidebarContent>

        {/* Expand button when collapsed - Only show on desktop */}
        {isCollapsed && !isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-50 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-600 shadow-md text-center"
            onClick={() => onCollapsedChange(false)}
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </Button>
        )}

        {/* Fixed Profile and Settings Section */}
        <SidebarFooter
          className={`sticky bottom-0 z-10 pb-6 pt-2 px-4 p-3 w-full ${
            !isCollapsed && ""
          }`}
        >
          <Card>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div
                  className={`flex items-center w-full ${
                    isCollapsed ? "justify-center" : "space-x-3 md:rounded-md"
                  } cursor-pointer p-2 transition-colors`}
                >
                  <Avatar>
                    <AvatarImage
                      src="/placeholder.svg?height=40&width=40"
                      alt="User"
                    />
                    <AvatarFallback>UN</AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">User Name</p>
                      <p className="text-xs text-gray-400 truncate">
                        user@example.com
                      </p>
                    </div>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent matchWidth={true} align="end" forceMount>
                <DropdownMenuGroup className="flex flex-col w-full">
                  {/* Profile */}
                  <div>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator />

                  {/* Theme */}
                  <div className="flex items-center justify-between gap-4 px-2 py-2">
                    <div
                      className={`flex items-center gap-2 cursor-pointer ${
                        !isDarkMode
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setTheme("light")}
                    >
                      <Sun
                        className={cn(
                          "h-5 w-5",
                          !isDarkMode
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-muted-foreground"
                        )}
                      />
                      <span>Light</span>
                    </div>

                    <button
                      onClick={() => setTheme(isDarkMode ? "light" : "dark")}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        isDarkMode ? "bg-blue-900" : "bg-yellow-400"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
                          isDarkMode ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>

                    <div
                      className={`flex items-center gap-2 cursor-pointer ${
                        isDarkMode
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setTheme("dark")}
                    >
                      <Moon
                        className={cn(
                          "h-5 w-5",
                          isDarkMode
                            ? "text-blue-400 fill-blue-900"
                            : "text-muted-foreground"
                        )}
                      />
                      <span>Dark</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />

                  {/* Log Out */}
                  <div>
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </Card>
        </SidebarFooter>
      </Card>
    </div>
  );
};

export default SideNavBar;
