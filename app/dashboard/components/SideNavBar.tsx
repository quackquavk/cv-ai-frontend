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
  LogIn,
  X,
  Settings,
  FolderOpen,
  FolderLock,
  Plus,
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

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import DialogueComponent from "./DialogueComponent";
import { MdFolderZip } from "react-icons/md";
import {
  folderSelectStore,
  publicFolderStore,
  privateFolderStore,
} from "../store";
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
  const { hasPrivateFolder, setHasPrivateFolder, privateSubfolders } = privateFolderStore();
  const [localFolderId, setLocalFolderId] = useState<string | null>(
    selectFolderId
  );
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);

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

  const displayedFolderName = () => {
    if (!localFolderId) return "Uploading to....";
    const publicName = folderListData.find((item: any) => item.folder_id === localFolderId)?.folder_name;
    if (publicName) return publicName;
    const privateName = privateSubfolders.find((pf) => pf.folder_id === localFolderId)?.name;
    return privateName || "Unknown Folder";
  };

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

  // Check if user has private folder on component mount
  useEffect(() => {
    const checkPrivateFolder = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await axiosInstance.get("/folder/private/root");
        setHasPrivateFolder(!!response.data?.folder_id);
      } catch (error) {
        console.error("Error checking private folder:", error);
        setHasPrivateFolder(false);
      }
    };
    checkPrivateFolder();
  }, [isAuthenticated, setHasPrivateFolder]);

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    if (!isAuthenticated) {
      router.push("../../auth/login");
      return;
    }
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
        toast("Uploaded successfully", {
          description: "The file has been uploaded successfully",
        });

        // Invalidate and refetch ListView data
        queryClient.invalidateQueries({
          queryKey: ["documents", selectedFolderId],
        });
        queryClient.invalidateQueries({
          queryKey: ["folderFiles", selectedFolderId],
        });

        // update lists after upload
        setUpdateFolderList((prev) => !prev);
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

  // // Private folder functions
  // const handleCreatePrivateFolder = async () => {
  //   if (!isAuthenticated) {
  //     toast("Authentication required", {
  //       description: "Please log in to create a private folder",
  //     });
  //     return;
  //   }

  //   setIsCreatingPrivateFolder(true);
  //   try {
  //     const response = await axiosInstance.post("/private_folder/createPrivateFolder");
  //     if (response.status === 200) {
  //       setHasPrivateFolder(true);
  //       setUpdateFolderList((prev) => !prev); // Refresh folder list to show private folder
  //       toast("Private folder created", {
  //         description: "Your private folder has been created successfully",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error creating private folder:", error);
  //     toast("Failed to create private folder", {
  //       description: error.response?.data?.detail || "An error occurred",
  //     });
  //   } finally {
  //     setIsCreatingPrivateFolder(false);
  //   }
  // };

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
                <p className="text-center">Drop your files here (PDF only)</p>
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
                  {displayedFolderName()}
                </SelectValue>
              </SelectTrigger>
               <SelectContent>
                 <SelectGroup>
                   {/* Public Folders */}
                   {folderListData.map((item, index) => (
                     <div key={`pub-${index}`} className="">
                       <SelectItem value={item.folder_id}>
                         <div className="flex items-center space-x-2">
                           <FolderOpen className="h-4 w-4 text-gray-600" />
                           <span>{item.folder_name}</span>
                         </div>
                       </SelectItem>
                     </div>
                   ))}
                   {/* Private Subfolders */}
                   {hasPrivateFolder && privateSubfolders.map((pf, index) => (
                     <div key={`pri-${index}`} className="">
                       <SelectItem value={pf.folder_id}>
                         <div className="flex items-center space-x-2">
                           <FolderLock className="h-4 w-4 text-gray-600" />
                           <span>{pf.name}</span>
                         </div>
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
            {/* Profile Section - Click to go to settings */}
            {isAuthenticated ? (
              <Link
                href="../../user/setting"
                onClick={() => setIsPageLoading(true)}
                className={`flex items-center w-[80%] ${
                  isCollapsed ? "justify-center" : "space-x-3 md:rounded-md"
                } cursor-pointer p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md`}
              >
                <Avatar>
                  {loading ? (
                    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                  ) : (
                    <AvatarImage src={user?.picture} alt="User" />
                  )}
                </Avatar>

                {loading ? (
                  <div className="flex flex-col gap-1">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                  </div>
                ) : !isCollapsed ? (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user?.full_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                ) : null}
              </Link>
            ) : (
              <div className="flex items-center w-[80%] justify-center">
                <Link
                  href="../../auth/login"
                  onClick={() => setIsPageLoading(true)}
                  className="flex items-center space-x-2 cursor-pointer p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                >
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                    <LogIn className="h-5 w-5 text-white" />
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-red-600 font-medium truncate">
                        Click to Login
                      </p>
                    </div>
                  )}
                </Link>
              </div>
            )}

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
