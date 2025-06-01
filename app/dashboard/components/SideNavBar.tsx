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
// import { ApiDataContext } from "../context/ApiDataContext";
import { SpinnerContext } from "../context/SpinnerContext";
import { IoIosCloudUpload } from "react-icons/io";
import FolderCreation from "./FolderCreation";
import FolderList from "./FolderList";
import Link from "next/link";
import type { IFolderData } from "@/interfaces/FolderData";
// import { fetchUpdatedApiData } from "../utils/updatedInitialData";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  LogIn,
  // User,
  X,
  Settings,
  // Moon,
  // Sun,
} from "lucide-react";
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
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import DialogueComponent from "./DialogueComponent";
import { MdFolderZip } from "react-icons/md";
import { folderSelectStore, publicFolderStore } from "../store";
// import { useTheme } from "next-themes";
// import { cn } from "@/lib/utils";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { UserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";

const SideNavBar = ({
  isCollapsed,
  onCollapsedChange,
  isMobile = false,
  onMobileClose = () => {},
}) => {
  // const context = useContext(ApiDataContext);
  const spinnerContext = useContext(SpinnerContext);
  const userContext = useContext(UserContext);
  const { user, loading, isAuthenticated, setIsAuthenticated } = userContext;
  // const setApiData = context?.setApiData;
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
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);

  const [dropdownOpen, setDropdownOpen] = useState(false); //Close the dropdown menu when necessary

  const queryClient = useQueryClient();
  const router = useRouter();

  // For Theme Change
  // const { theme, setTheme, systemTheme } = useTheme();

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

        // Invalidate and refetch ListView data
        // queryClient.refetchQueries({
        //   queryKey: ["documents", selectedFolderId],
        // });
        queryClient.invalidateQueries({
          queryKey: ["documents", selectedFolderId],
        });
        queryClient.invalidateQueries({
          queryKey: ["folderFiles", selectedFolderId],
        });

        // Refectiing the initialRenderData API
        // if (setApiData) {
        //   await fetchUpdatedApiData(setApiData);
        // } else {
        //   console.warn("API Data context is not available");
        // }
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

  // console.log("ImageURL", user.picture);

  const handleLogOut = async (e) => {
    e.preventDefault();
    await axiosInstance.get("/user/logout");
    setDropdownOpen(false); // Close the dropdown menu
    setIsAuthenticated(false);
    setIsPageLoading(true);
    router.push("../../auth/login");
  };

  // const isDarkMode =
  //   theme === "dark" || (theme === "system" && systemTheme === "dark");

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
            <div className="flex items-center px-4  justify-center w-full gap-3">
              <div className="w-14 rounded-full overflow-hidden">
                <Image
                  src="/assets/logo.png"
                  alt="logo"
                  width={600}
                  height={800}
                />
              </div>
              <h1 className="text-2xl text-black dark:text-white font-semibold font-sans">
                Resume AI
              </h1>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-2 items-center justify-center">
              <div className="w-14 rounded-full overflow-hidden">
                <Image
                  src="/assets/logo.png"
                  alt="logo"
                  width={600}
                  height={800}
                />
              </div>
              <div className="text-xl text-center text-black dark:text-white font-sans font-semibold">
                <h1>CV</h1>
                <h1>AI</h1>
              </div>
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
          className={`sticky bottom-0 z-10 pb-6 pt-2 px-4 p-3 w-full`}
        >
          <Card
            className={`w-[100%] flex items-center px-2 justify-between ${
              isCollapsed && " border-none"
            }`}
          >
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <div
                  className={`flex items-center w-[80%] ${
                    isCollapsed ? "justify-center" : "space-x-3 md:rounded-md"
                  } cursor-pointer p-2 transition-colors`}
                >
                  <Avatar>
                    {loading ? (
                      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                    ) : isAuthenticated ? (
                      <AvatarImage src={user?.picture} alt="User" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-red-600 overflow-hidden"></div>
                    )}
                  </Avatar>

                  {loading ? (
                    <div className="flex flex-col gap-1">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                      <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ) : !isCollapsed && isAuthenticated ? (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user?.full_name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-red-600 font-medium truncate">
                        User Not Login
                      </p>
                    </div>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent matchWidth={true} align="end" forceMount>
                <DropdownMenuGroup className="flex flex-col w-full">
                  {/* Profile */}
                  {/* {isAuthenticated && (
                    <div>
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </div>
                  )}
                  {/* {isAuthenticated && <DropdownMenuSeparator />} */}
                  {/* Theme */}
                  {/* <div className="flex items-center justify-between gap-4 px-2 py-2">
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
                  </div> */}
                  {/* <DropdownMenuSeparator /> */}
                  {/* Log Out */}
                  {isAuthenticated && (
                    <div className="cursor-pointer">
                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={(e) => {
                              // Prevent the dropdown from closing when clicking this item
                              e.preventDefault();
                            }}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Are you sure want to sign out ?
                            </DialogTitle>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button onClick={() => setDropdownOpen(false)}>
                                Cancel
                              </Button>
                            </DialogClose>
                            <DialogClose>
                              <Button
                                className="bg-red-600 hover:bg-red-500 text-white"
                                onClick={(e) => handleLogOut(e)}
                              >
                                Log Out
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                  {!isAuthenticated && (
                    <Link
                      href={"../../auth/login"}
                      onClick={() => setIsPageLoading(true)}
                    >
                      <DropdownMenuItem className="cursor-pointer">
                        <LogIn className="mr-2 h-4 w-4" />
                        <span>Log in</span>
                      </DropdownMenuItem>
                    </Link>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {!isCollapsed && (
              <div className="cursor-pointer group p-2 rounded-md transition-colors duration-500 hover:bg-gray-200 dark:hover:bg-gray-700">
                <Link
                  onClick={() => setIsPageLoading(true)}
                  href={"../../user/setting"}
                >
                  <Settings className="transition-transform duration-700 ease-in-out group-hover:rotate-180" />
                </Link>
              </div>
            )}
          </Card>
        </SidebarFooter>
      </Card>

      {/* Loader (shown when isLoading is true) */}
      {isPageLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="loader border-t-4 border-white border-solid rounded-full w-12 h-12 animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default SideNavBar;
