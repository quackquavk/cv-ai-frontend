"use client";

import {
  type ChangeEvent,
  type DragEvent,
  useState,
  useContext,
  useEffect,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { SpinnerContext, type UploadFile } from "../context/SpinnerContext";
import { UserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/utils/axiosConfig";
import {
  Upload,
  RefreshCw,
  FileText,
  CheckCircle,
  FolderOpen,
  FolderLock,
  Home,
  User,
  ChevronRight,
  AlertCircle,
  Loader2,
  Trash2,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LoaderCircle } from "lucide-react";
import type { IFolderData } from "@/interfaces/FolderData";
import { privateFolderStore } from "../store";
import UploadQueue from "../components/UploadQueue";

export default function MyResumePage() {
  const router = useRouter();
  const spinnerContext = useContext(SpinnerContext);
  const userContext = useContext(UserContext);
  const { isAuthenticated, loading: authLoading } = userContext || {
    isAuthenticated: false,
    loading: true,
  };

  const uploadFiles = spinnerContext?.uploadFiles || [];
  const addUploadFile = spinnerContext?.addUploadFile;
  const updateUploadFile = spinnerContext?.updateUploadFile;
  const clearCompletedFiles = spinnerContext?.clearCompletedFiles;
  const retryUpload = spinnerContext?.retryUpload;
  const cancelUpload = spinnerContext?.cancelUpload;
  const removeUploadFile = spinnerContext?.removeUploadFile;

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [cvUploadLoader, setCvUploadLoader] = useState<boolean>(false);
  const [hasClaimedAnyCV, setHasClaimedAnyCV] = useState<boolean>(false);
  const [currentCVData, setCurrentCVData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Folder selection for first-time upload
  const [folderListData, setFolderListData] = useState<IFolderData[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const { hasPrivateFolder, setHasPrivateFolder, privateSubfolders } =
    privateFolderStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Check if user has claimed a CV
  useEffect(() => {
    const checkHasClaimedCV = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await axiosInstance.get("/cv-claim/has_claimed_cv", {
          withCredentials: true,
        });
        setHasClaimedAnyCV(response.data === true);
      } catch (error: any) {
        console.error("Error checking claimed CV status:", error);
        setHasClaimedAnyCV(false);
      }
    };
    checkHasClaimedCV();
  }, [isAuthenticated]);

  // Fetch current CV data if claimed
  useEffect(() => {
    const fetchCurrentCV = async () => {
      if (!isAuthenticated) return;
      try {
        setIsLoading(true);
        const response = await axiosInstance.get("/cv-claim/get_cv", {
          withCredentials: true,
        });
        if (response.data && response.data.parsed_cv) {
          setCurrentCVData(response.data.parsed_cv);
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.error("Error fetching CV:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrentCV();
  }, [isAuthenticated, hasClaimedAnyCV]);

  // Fetch folder list for first-time upload
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await axiosInstance.get("/folder/getAllFolders");
        setFolderListData(response.data);
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    };
    fetchFolders();
  }, []);

  // Check private folder
  useEffect(() => {
    const checkPrivateFolder = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await axiosInstance.get("/folder/private/root");
        setHasPrivateFolder(!!response.data?.folder_id);
      } catch (error) {
        setHasPrivateFolder(false);
      }
    };
    checkPrivateFolder();
  }, [isAuthenticated, setHasPrivateFolder]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const displayedFolderName = () => {
    if (!selectedFolderId) return "Select a folder...";
    const publicName = folderListData.find(
      (item: any) => item.folder_id === selectedFolderId,
    )?.folder_name;
    if (publicName) return publicName;
    const privateName = privateSubfolders.find(
      (pf) => pf.folder_id === selectedFolderId,
    )?.name;
    return privateName || "Unknown Folder";
  };

  const handleCandidateCVUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const file = files[0];
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file only");
      return;
    }

    // Check if folder is selected for initial upload
    if (!hasClaimedAnyCV && !selectedFolderId) {
      toast.error("Please select a folder to upload your CV");
      return;
    }

    const fileId = `cv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      setCvUploadLoader(true);

      if (hasClaimedAnyCV) {
        // Replace existing CV
        addUploadFile?.({
          id: fileId,
          name: file.name,
          progress: 0,
          status: "uploading",
          size: file.size,
          type: file.type,
        });

        const formData = new FormData();
        formData.append("new_cv_file", file);

        const response = await axiosInstance.post(
          "/cv-claim/async_replace_cv",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          },
        );

        const jobId = response.data.job_id;
        toast.success("CV replacement started! Processing in background...");

        updateUploadFile?.(fileId, {
          status: "processing",
          progress: 30,
          processingStage: "Replacing CV with AI...",
        });

        // Poll for job status
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await axiosInstance.get(
              `/document/bulk_upload_status/${jobId}`,
            );
            const job = statusResponse.data;
            const progress = Math.round(
              (job.processed_count / job.total_files) * 100,
            );

            updateUploadFile?.(fileId, {
              progress: Math.max(30, progress),
              processingStage: `${job.processed_count}/${job.total_files} processed`,
            });

            if (job.status === "completed") {
              clearInterval(pollInterval);
              updateUploadFile?.(fileId, {
                status: "completed",
                progress: 100,
              });

              if (job.success_count > 0) {
                toast.success("CV replaced successfully!");
                // Refresh CV data
                const cvResponse = await axiosInstance.get("/cv-claim/get_cv", {
                  withCredentials: true,
                });
                if (cvResponse.data && cvResponse.data.parsed_cv) {
                  setCurrentCVData(cvResponse.data.parsed_cv);
                }
              } else {
                toast.error("CV replacement failed. Please try again.");
              }

              setCvUploadLoader(false);
              setTimeout(() => clearCompletedFiles?.(), 5000);
            }
          } catch (error) {
            console.error("Error polling CV replacement status:", error);
          }
        }, 3000);
      } else {
        // Upload new CV
        addUploadFile?.({
          id: fileId,
          name: file.name,
          progress: 0,
          status: "uploading",
          size: file.size,
          type: file.type,
        });

        const formData = new FormData();
        formData.append("folder_id", selectedFolderId!);
        formData.append("files", file);
        formData.append("is_claiming", "true");

        const response = await axiosInstance.post(
          "/document/async_cv_upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          },
        );

        const jobId = response.data.job_id;
        toast.success("CV upload started! Processing in background...");

        updateUploadFile?.(fileId, {
          status: "processing",
          progress: 30,
          processingStage: "Processing with AI...",
        });

        // Poll for job status
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await axiosInstance.get(
              `/document/bulk_upload_status/${jobId}`,
            );
            const job = statusResponse.data;
            const progress = Math.round(
              (job.processed_count / job.total_files) * 100,
            );

            updateUploadFile?.(fileId, {
              progress: Math.max(30, progress),
              processingStage: `${job.processed_count}/${job.total_files} processed`,
            });

            if (job.status === "completed") {
              clearInterval(pollInterval);
              updateUploadFile?.(fileId, {
                status: "completed",
                progress: 100,
              });

              if (job.success_count > 0) {
                toast.success("CV uploaded and claimed successfully!");
                setHasClaimedAnyCV(true);
                // Fetch the new CV data
                const cvResponse = await axiosInstance.get("/cv-claim/get_cv", {
                  withCredentials: true,
                });
                if (cvResponse.data && cvResponse.data.parsed_cv) {
                  setCurrentCVData(cvResponse.data.parsed_cv);
                }
              } else {
                toast.error("CV processing failed. Please try again.");
              }

              setCvUploadLoader(false);
              setTimeout(() => clearCompletedFiles?.(), 5000);
            }
          } catch (error) {
            console.error("Error polling CV upload status:", error);
          }
        }, 3000);
      }
    } catch (error: any) {
      console.error("Error uploading CV:", error);
      updateUploadFile?.(fileId, {
        status: "error",
        error: error.response?.data?.detail || "Upload failed",
      });

      if (error.response?.status === 429) {
        toast.error(
          "Upload limit reached! Please upgrade to premium for unlimited uploads.",
        );
      } else {
        toast.error(error.response?.data?.detail || "Failed to upload CV");
      }
      setCvUploadLoader(false);
    }
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleCandidateCVUpload(event.target.files);
    }
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
      handleCandidateCVUpload(event.dataTransfer.files);
    }
  };

  const handleDeleteCV = async () => {
    try {
      setIsDeleting(true);
      await axiosInstance.delete("/cv-claim/", {
        withCredentials: true,
      });

      toast.success("CV deleted successfully");
      setHasClaimedAnyCV(false);
      setCurrentCVData(null);
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting CV:", error);
      toast.error(error.response?.data?.detail || "Failed to delete CV");
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">My Resume</h1>
        <p className="text-muted-foreground">
          Manage your master resume. Upload or replace your current CV here to
          keep your profile up-to-date for manual and automated applications.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {hasClaimedAnyCV ? (
                <>
                  <RefreshCw className="h-5 w-5" />
                  Replace Your CV
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Upload Your CV
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Folder Selection - Only show for first-time upload */}
            {!hasClaimedAnyCV && (
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">
                  Select a folder for your CV
                </label>
                <Select
                  value={selectedFolderId || ""}
                  onValueChange={(value) => setSelectedFolderId(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a folder...">
                      {displayedFolderName()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {folderListData.map((item, index) => (
                        <SelectItem key={`pub-${index}`} value={item.folder_id}>
                          <div className="flex items-center space-x-2">
                            <FolderOpen className="h-4 w-4 text-gray-600" />
                            <span>{item.folder_name}</span>
                          </div>
                        </SelectItem>
                      ))}
                      {hasPrivateFolder &&
                        privateSubfolders.map((pf, index) => (
                          <SelectItem key={`pri-${index}`} value={pf.folder_id}>
                            <div className="flex items-center space-x-2">
                              <FolderLock className="h-4 w-4 text-gray-600" />
                              <span>{pf.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 transition-all duration-300 ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 dark:border-gray-600 hover:border-primary/50"
              } ${cvUploadLoader ? "pointer-events-none" : "cursor-pointer"}`}
              onClick={() =>
                !cvUploadLoader &&
                document.getElementById("cv-file-input")?.click()
              }
            >
              {cvUploadLoader ? (
                // Loading state
                <div className="flex flex-col items-center text-center">
                  <LoaderCircle className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="font-medium mb-1">
                    {hasClaimedAnyCV
                      ? "Replacing your CV..."
                      : "Uploading your resume..."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your resume is being processed by AI. Please wait...
                  </p>
                </div>
              ) : (
                // Default state
                <>
                  {hasClaimedAnyCV ? (
                    <RefreshCw className="h-12 w-12 text-muted-foreground mb-4" />
                  ) : (
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  )}
                  <p className="text-center font-medium mb-1">
                    {hasClaimedAnyCV
                      ? "Drop your new CV here to replace"
                      : "Drop your resume here"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse (PDF only)
                  </p>
                </>
              )}
            </div>

            <input
              id="cv-file-input"
              className="hidden"
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              disabled={cvUploadLoader}
            />

            {/* Upload Queue */}
            {uploadFiles.length > 0 && (
              <div className="mt-4">
                <UploadQueue
                  uploadFiles={uploadFiles}
                  clearCompletedFiles={clearCompletedFiles}
                  retryUpload={retryUpload}
                  cancelUpload={cancelUpload}
                  removeUploadFile={removeUploadFile}
                  formatFileSize={formatFileSize}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current CV Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Current CV Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasClaimedAnyCV && currentCVData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">CV Active</span>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium capitalize">
                      {currentCVData.name || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Position</p>
                    <p className="font-medium capitalize">
                      {currentCVData.position || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">
                      {currentCVData.email || "N/A"}
                    </p>
                  </div>

                  {currentCVData.skills && currentCVData.skills.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Top Skills
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {currentCVData.skills
                          .slice(0, 5)
                          .map((skill: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-muted text-xs rounded capitalize"
                            >
                              {skill}
                            </span>
                          ))}
                        {currentCVData.skills.length > 5 && (
                          <span className="px-2 py-1 text-xs text-muted-foreground">
                            +{currentCVData.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push("/dashboard/candidate")}
                  >
                    View Full Profile
                  </Button>

                  <AlertDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                  >
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete your CV?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Your CV will be
                          permanently deleted from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteCV}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="font-medium mb-1">No CV uploaded yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your CV to start applying for jobs
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    document.getElementById("cv-file-input")?.click()
                  }
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CV
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {hasClaimedAnyCV && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => router.push("/dashboard/candidate")}
              >
                <User className="h-5 w-5" />
                <span>View Profile</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => router.push("/dashboard/resumes")}
              >
                <FileText className="h-5 w-5" />
                <span>Build Resume</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => router.push("/dashboard/job-preferences")}
              >
                <FolderOpen className="h-5 w-5" />
                <span>Job Preferences</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => router.push("/dashboard/ats-optimizer")}
              >
                <CheckCircle className="h-5 w-5" />
                <span>ATS Optimizer</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
