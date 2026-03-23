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
import { SpinnerContext } from "../context/SpinnerContext";
import { IoIosCloudUpload } from "react-icons/io";
import FolderCreation from "./FolderCreation";
import FolderList from "./FolderList";
import UploadQueue from "./UploadQueue";
import Link from "next/link";
import type { IFolderData } from "@/interfaces/FolderData";
import {
  ChevronLeft,
  ChevronRight,
  LogIn,
  X,
  Settings,
  FolderOpen,
  FolderLock,
  FileText,
  Bot,
  Briefcase,
  Target,
  Upload,
  GripVertical,
  Puzzle,
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
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { UserContext } from "@/context/UserContext";
import { useRouter, usePathname } from "next/navigation";
import { TabContext } from "../context/TabContext";
import { RefreshCw } from "lucide-react";

const MAX_CONCURRENT_UPLOADS = 3; // Maximum number of concurrent uploads

interface SideNavBarProps {
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
  width?: number;
  onWidthChange?: (width: number) => void;
  onResizingChange?: (isResizing: boolean) => void;
}

const SideNavBar = ({
  isCollapsed,
  onCollapsedChange,
  isMobile = false,
  onMobileClose = () => {},
  width: externalWidth,
  onWidthChange,
  onResizingChange,
}: SideNavBarProps) => {
  const [internalWidth, setInternalWidth] = useState<number>(300);
  const [isResizing, setIsResizing] = useState(false);

  // Effective width uses prop if provided, otherwise internal state
  const sidebarWidth =
    externalWidth !== undefined ? externalWidth : internalWidth;

  // Initialize internal width from localStorage if prop not provided
  useEffect(() => {
    if (externalWidth === undefined) {
      const savedWidth = localStorage.getItem("sidebar-width");
      if (savedWidth) {
        const parsed = parseInt(savedWidth, 10);
        if (!isNaN(parsed)) setInternalWidth(parsed);
      }
    }
  }, [externalWidth]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    onResizingChange?.(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 600) {
        if (onWidthChange) {
          onWidthChange(newWidth);
        } else {
          setInternalWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        onResizingChange?.(false);
        localStorage.setItem("sidebar-width", sidebarWidth.toString());
      }
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, sidebarWidth, onWidthChange, internalWidth]);

  const spinnerContext = useContext(SpinnerContext);
  const userContext = useContext(UserContext);
  const tabContext = useContext(TabContext);
  const { user, loading, isAuthenticated, setIsAuthenticated } = userContext;

  if (!tabContext) {
    throw new Error("SideNavBar must be used within TabProvider");
  }

  const { activeTab } = tabContext;
  const pathname = usePathname();

  // Check if we're on a candidate page - should show candidate sidebar
  const isCandidatePage =
    pathname === "/dashboard/job-preferences" ||
    pathname === "/dashboard/job-applications" ||
    pathname === "/dashboard/ats-optimizer" ||
    pathname === "/dashboard/browser-extension" ||
    pathname === "/dashboard/my-resume" ||
    pathname === "/dashboard/resumes" ||
    pathname?.startsWith("/dashboard/resumes/");

  // Use effectiveTab to determine which sidebar section to show
  const effectiveTab = isCandidatePage ? "candidate" : activeTab;

  const setUploading = spinnerContext?.setUploading;
  const uploading = spinnerContext?.uploading;
  const uploadFiles = spinnerContext?.uploadFiles || [];
  const addUploadFile = spinnerContext?.addUploadFile;
  const updateUploadFile = spinnerContext?.updateUploadFile;
  const removeUploadFile = spinnerContext?.removeUploadFile;
  const clearCompletedFiles = spinnerContext?.clearCompletedFiles;
  const retryUpload = spinnerContext?.retryUpload;
  const cancelUpload = spinnerContext?.cancelUpload;

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [updateFolderList, setUpdateFolderList] = useState(false);
  const [folderListData, setFolderListData] = useState<IFolderData[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [displayFolder, setDisplayFolder] = useState(false);
  const [dialogOpen, setDialogeOpen] = useState(false);
  const { selectFolderId } = folderSelectStore();
  const { isFolderListOpen } = publicFolderStore();
  const { hasPrivateFolder, setHasPrivateFolder, privateSubfolders } =
    privateFolderStore();
  const [localFolderId, setLocalFolderId] = useState<string | null>(
    selectFolderId,
  );
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleFolderCreated = () => {
    setUpdateFolderList((prev) => !prev);
  };

  const handleDialogue = (state) => {
    setDialogeOpen(state);
  };

  useEffect(() => {
    setLocalFolderId(selectFolderId);
    setSelectedFolderId(selectFolderId);
  }, [selectFolderId]);

  const handleValueChange = (value: string) => {
    setLocalFolderId(value);
    setSelectedFolderId(value);
  };

  useEffect(() => {
    setLocalFolderId(null);
  }, [isFolderListOpen]);

  const displayedFolderName = () => {
    if (!localFolderId) return "Uploading to....";
    const publicName = folderListData.find(
      (item: any) => item.folder_id === localFolderId,
    )?.folder_name;
    if (publicName) return publicName;
    const privateName = privateSubfolders.find(
      (pf) => pf.folder_id === localFolderId,
    )?.name;
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

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle bulk upload for multiple files using async backend
  const handleBulkUpload = async (fileArray: File[]) => {
    setUploading?.(true);

    // Add all files to the queue with "queued" status
    const fileIds = fileArray.map((file) => {
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      addUploadFile?.({
        id: fileId,
        name: file.name,
        progress: 0,
        status: "queued",
        size: file.size,
        type: file.type,
      });
      return { file, fileId };
    });

    try {
      // Submit all files to async bulk upload endpoint
      const formData = new FormData();
      formData.append("folder_id", selectedFolderId!);
      fileArray.forEach((file) => {
        formData.append("files", file);
      });

      // Update all to uploading status
      fileIds.forEach(({ fileId }) => {
        updateUploadFile?.(fileId, { status: "uploading", progress: 10 });
      });

      const response = await axiosInstance.post(
        "/document/async_bulk_upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const jobId = response.data.job_id;
      toast.success(`Bulk upload started: ${fileArray.length} files queued`);

      // Update to processing status
      fileIds.forEach(({ fileId }) => {
        updateUploadFile?.(fileId, {
          status: "processing",
          progress: 30,
          processingStage: "Processing with AI...",
        });
      });

      // Poll for job status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await axiosInstance.get(
            `/document/bulk_upload_status/${jobId}`,
          );
          const job = statusResponse.data;

          // Calculate progress
          const progress = Math.round(
            (job.processed_count / job.total_files) * 100,
          );

          // Update progress on all files
          fileIds.forEach(({ fileId }) => {
            updateUploadFile?.(fileId, {
              progress: Math.max(30, progress),
              processingStage: `${job.processed_count}/${job.total_files} processed`,
            });
          });

          if (job.status === "completed") {
            clearInterval(pollInterval);

            // Mark all as completed
            fileIds.forEach(({ fileId }) => {
              updateUploadFile?.(fileId, {
                status: "completed",
                progress: 100,
              });
            });

            toast.success(
              `Bulk upload complete: ${job.success_count} succeeded, ${job.failure_count} failed`,
            );

            // Refresh folder contents
            queryClient.invalidateQueries({
              queryKey: ["documents", selectedFolderId],
            });
            queryClient.invalidateQueries({
              queryKey: ["folderFiles", selectedFolderId],
            });

            setUploading?.(false);

            // Auto-clear after delay
            setTimeout(() => {
              clearCompletedFiles?.();
            }, 5000);
          }
        } catch (error) {
          console.error("Error polling bulk upload status:", error);
        }
      }, 5000);
    } catch (error: any) {
      console.error("Error starting bulk upload:", error);

      // Mark all as failed
      fileIds.forEach(({ fileId }) => {
        updateUploadFile?.(fileId, {
          status: "error",
          error: error.response?.data?.detail || "Bulk upload failed",
        });
      });

      if (error.response?.status === 403) {
        toast.error(error.response?.data?.detail);
      } else {
        toast.error(
          error.response?.data?.detail || "Failed to start bulk upload",
        );
      }

      setUploading?.(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    if (!isAuthenticated) {
      router.push("../../auth/login");
      return;
    }
    if (!selectedFolderId) {
      toast("No Folder selected", {
        description: "Please select a Folder first and then upload files",
      });
      return;
    }

    const fileArray = Array.from(files);

    // Use async bulk upload for ALL uploads (single and multiple)
    await handleBulkUpload(fileArray);
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
    if (event.dataTransfer.files && effectiveTab === "recruiter") {
      handleFileUpload(event.dataTransfer.files);
    }
  };

  return (
    <div
      className={`h-full relative ${isMobile ? "w-full" : ""}`}
      style={!isMobile && !isCollapsed ? { width: `${sidebarWidth}px` } : {}}
    >
      <Card className="border h-full rounded-none flex flex-col relative overflow-visible shadow-none">
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
        <SidebarHeader className="sticky top-0 z-10 pt-4 pb-2">
          {!isCollapsed ? (
            <div className="flex items-center px-4 justify-center w-full">
              <div className="w-40">
                <Image
                  src="/assets/resumeai_logo_black.webp"
                  alt="logo"
                  width={600}
                  height={800}
                  className="block dark:hidden w-full h-auto"
                />
                <Image
                  src="/assets/resumeai_logo.webp"
                  alt="logo"
                  width={600}
                  height={800}
                  className="hidden dark:block w-full h-auto"
                />
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center pt-2">
              <div className="w-14">
                <Image
                  src="/assets/resumeai_logo_square.webp"
                  alt="logo"
                  width={600}
                  height={800}
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}
        </SidebarHeader>

        <SidebarContent
          className={` ${
            isCollapsed && effectiveTab === "recruiter" && "hidden"
          } flex flex-col flex-1 overflow-y-auto overflow-x-hidden scrollbar-custom`}
        >
          {/* Main Divider Top */}
          <div className="h-px bg-gray-200 dark:bg-gray-800 mt-1 mb-3 mx-4" />

          {/* Recruiter Section - Upload and Folder Management */}
          {effectiveTab === "recruiter" && (
            <>
              {/* Fixed Drop Files Section - Only show when expanded */}
              <div
                className={`${
                  isCollapsed && "hidden"
                } w-full px-4 pt-0 sticky top-0 z-10`}
              >
                <div
                  onDrop={handleDrop}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  className={`relative flex flex-col items-center justify-center border-2 border-dashed border-gray-800 dark:border-white p-4 pb-6 rounded-md transition-all duration-300 ease-in-out ${
                    isDragging ? "opacity-50 backdrop-blur-sm" : "opacity-100"
                  }`}
                >
                  <div
                    onClick={() =>
                      document.getElementById("file-input")?.click()
                    }
                    className="flex flex-col items-center w-full justify-center cursor-pointer"
                  >
                    <IoIosCloudUpload
                      size={40}
                      className="text-black dark:text-white"
                    />
                    <p className="text-center">
                      Drop your files here (PDF only)
                    </p>
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
            </>
          )}

          {effectiveTab === "recruiter" && (
            <>
              <UploadQueue
                uploadFiles={uploadFiles}
                clearCompletedFiles={clearCompletedFiles}
                retryUpload={retryUpload}
                cancelUpload={cancelUpload}
                removeUploadFile={removeUploadFile}
                formatFileSize={formatFileSize}
                onRefreshFolder={() => {
                  queryClient.invalidateQueries({
                    queryKey: ["documents", selectedFolderId],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["folderFiles", selectedFolderId],
                  });
                  toast.success("Folder refreshed");
                }}
              />

              <div
                className={` ${
                  isCollapsed && "hidden"
                } w-full px-4 py-4 sticky top-[120px] z-10 flex items-center gap-2`}
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
                      {hasPrivateFolder &&
                        privateSubfolders.map((pf, index) => (
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
                {/* Refresh Folder Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    queryClient.invalidateQueries({
                      queryKey: ["documents", selectedFolderId],
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["folderFiles", selectedFolderId],
                    });
                    toast.success("Folder refreshed");
                  }}
                  className="h-9 w-9 p-0 flex-shrink-0"
                  title="Refresh folder contents"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Fixed Folder Creation - Only show for recruiter when expanded */}
              <div
                className={`${
                  isCollapsed && "hidden"
                } w-full px-4 sticky top-[180px] z-10`}
              >
                <FolderCreation
                  onFolderCreated={handleFolderCreated}
                  setUpdateFolderList={setUpdateFolderList}
                />
              </div>

              {/* Scrollable Folder List - Only show for recruiter when expanded */}
              <div
                className={`${
                  isCollapsed && "hidden"
                } w-full px-4 flex-1 overflow-y-auto overflow-x-hidden mt-4 scrollbar-custom`}
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
            </>
          )}

          {/* Candidate section - Navigation Links */}
          {effectiveTab === "candidate" && !isCollapsed && (
            <div className="px-4 py-1 space-y-3">
              {/* Group 1: Resume Management */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider px-3 mb-1">
                  Resume Management
                </p>
                <div className="space-y-0.5">
                  <Link
                    href="/dashboard/my-resume"
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                      pathname === "/dashboard/my-resume"
                        ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    My Resume
                  </Link>
                  <Link
                    href="/dashboard/resumes"
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                      pathname === "/dashboard/resumes"
                        ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    Resume Builder
                  </Link>
                </div>
              </div>

              {/* Visible Divider */}
              <div className="mx-2 border-t border-gray-200 dark:border-gray-800 my-1" />

              {/* Group 2: LinkedIn Automation */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider px-3 mb-1">
                  LinkedIn Automation
                </p>
                <div className="space-y-0.5">
                  <Link
                    href="/dashboard/job-preferences"
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                      pathname === "/dashboard/job-preferences"
                        ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    <Briefcase className="h-4 w-4" />
                    Job Preferences
                  </Link>
                  <Link
                    href="/dashboard/job-applications"
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                      pathname === "/dashboard/job-applications"
                        ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    <Bot className="h-4 w-4" />
                    Job Applications
                  </Link>
                  <Link
                    href="/dashboard/ats-optimizer"
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                      pathname === "/dashboard/ats-optimizer"
                        ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    <Target className="h-4 w-4" />
                    ATS Optimizer
                  </Link>
                  <Link
                    href="/dashboard/browser-extension"
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                      pathname === "/dashboard/browser-extension"
                        ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    <Puzzle className="h-4 w-4" />
                    Chrome Extension
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Candidate section - Collapsed Icons Only */}
          {effectiveTab === "candidate" && isCollapsed && (
            <div className="flex flex-col items-center py-2 space-y-1">
              {/* Resume Management Icons */}
              <Link
                href="/dashboard/my-resume"
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  pathname === "/dashboard/my-resume"
                    ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white"
                }`}
                title="My Resume"
              >
                <Upload className="h-5 w-5" />
              </Link>
              <Link
                href="/dashboard/resumes"
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  pathname === "/dashboard/resumes"
                    ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white"
                }`}
                title="Resume Builder"
              >
                <FileText className="h-5 w-5" />
              </Link>

              {/* Divider */}
              <div className="w-6 border-t border-gray-200 dark:border-gray-700 my-1" />

              {/* LinkedIn Automation Icons */}
              <Link
                href="/dashboard/job-preferences"
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  pathname === "/dashboard/job-preferences"
                    ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white"
                }`}
                title="Job Preferences"
              >
                <Briefcase className="h-5 w-5" />
              </Link>
              <Link
                href="/dashboard/job-applications"
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  pathname === "/dashboard/job-applications"
                    ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white"
                }`}
                title="Job Applications"
              >
                <Bot className="h-5 w-5" />
              </Link>
              <Link
                href="/dashboard/ats-optimizer"
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  pathname === "/dashboard/ats-optimizer"
                    ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white"
                }`}
                title="ATS Optimizer"
              >
                <Target className="h-5 w-5" />
              </Link>
              <Link
                href="/dashboard/browser-extension"
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  pathname === "/dashboard/browser-extension"
                    ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white"
                }`}
                title="Chrome Extension"
              >
                <Puzzle className="h-5 w-5" />
              </Link>
            </div>
          )}
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
        <SidebarFooter className="sticky bottom-0 z-10 pb-6 pt-2 px-4 p-3 w-full">
          <Card
            className={`w-full flex items-center px-2 justify-between ${
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

      {/* Resize Handle - Moved outside Card to avoid overflow-hidden clipping */}
      {!isCollapsed && !isMobile && (
        <div
          onMouseDown={handleMouseDown}
          className={`absolute top-0 -right-0.5 w-1.5 h-full cursor-col-resize z-50 transition-all duration-300 ${
            isResizing
              ? "bg-primary/40"
              : "bg-transparent hover:bg-primary/20 hover:w-2"
          }`}
          title="Drag to resize"
        />
      )}

      {/* Resize Grip Icon - Bottom Right */}
      {!isCollapsed && !isMobile && (
        <div className="absolute bottom-1 right-1 pointer-events-none opacity-30 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-4 w-4 rotate-45 text-muted-foreground" />
        </div>
      )}

      {/* Loader (shown when isLoading is true) */}
      {isPageLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="loader border-t-4 border-white border-solid rounded-full w-12 h-12 animate-spin"></div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-custom::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #3a3a3a;
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #4a4a4a;
        }
        .dark .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #555;
        }
        .dark .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #666;
        }
      `}</style>
    </div>
  );
};

export default SideNavBar;
