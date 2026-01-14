"use client";
import { useState, useContext, useEffect, ChangeEvent, DragEvent } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  FolderOpen,
  FolderLock,
  X,
  Files,
} from "lucide-react";
import axiosInstance from "@/utils/axiosConfig";
import { toast } from "sonner";
import {
  folderSelectStore,
  publicFolderStore,
  privateFolderStore,
} from "../store";
import type { IFolderData } from "@/interfaces/FolderData";

interface BulkUploadJob {
  job_id: string;
  status: "pending" | "processing" | "completed";
  total_files: number;
  processed_count: number;
  success_count: number;
  failure_count: number;
  failed_tasks?: { filename: string; error: string }[];
}

interface BulkUploadModalProps {
  folderListData: IFolderData[];
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  folderListData,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentJob, setCurrentJob] = useState<BulkUploadJob | null>(null);

  const { hasPrivateFolder, privateSubfolders } = privateFolderStore();

  // Poll job status
  useEffect(() => {
    if (!currentJob || currentJob.status === "completed") return;

    const interval = setInterval(async () => {
      try {
        const response = await axiosInstance.get(
          `/document/bulk_upload_status/${currentJob.job_id}`
        );
        setCurrentJob(response.data);

        if (response.data.status === "completed") {
          clearInterval(interval);
          toast.success(
            `Bulk upload complete: ${response.data.success_count} succeeded, ${response.data.failure_count} failed`
          );
        }
      } catch (error) {
        console.error("Error polling job status:", error);
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [currentJob]);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === "application/pdf"
    );
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    } else {
      toast.error("Only PDF files are allowed");
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(
        (f) => f.type === "application/pdf"
      );
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartUpload = async () => {
    if (!selectedFolderId) {
      toast.error("Please select a folder");
      return;
    }
    if (selectedFiles.length === 0) {
      toast.error("Please add files to upload");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("folder_id", selectedFolderId);
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await axiosInstance.post(
        "/document/async_bulk_upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setCurrentJob({
        job_id: response.data.job_id,
        status: "pending",
        total_files: response.data.total_files,
        processed_count: 0,
        success_count: 0,
        failure_count: 0,
      });

      toast.success("Bulk upload started");
      setSelectedFiles([]);
    } catch (error: any) {
      console.error("Error starting bulk upload:", error);
      if (error.response?.status === 403) {
        toast.error("This feature requires a premium subscription");
      } else {
        toast.error(error.response?.data?.detail || "Failed to start upload");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const resetModal = () => {
    setSelectedFiles([]);
    setCurrentJob(null);
    setIsOpen(false);
  };

  const progressPercentage = currentJob
    ? Math.round((currentJob.processed_count / currentJob.total_files) * 100)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center gap-2"
        >
          <Files className="h-4 w-4" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Upload Resumes</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Folder Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Folder
            </label>
            <Select
              value={selectedFolderId || ""}
              onValueChange={setSelectedFolderId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a folder..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {folderListData.map((item) => (
                    <SelectItem key={item.folder_id} value={item.folder_id}>
                      <div className="flex items-center space-x-2">
                        <FolderOpen className="h-4 w-4 text-gray-600" />
                        <span>{item.folder_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                  {hasPrivateFolder &&
                    privateSubfolders.map((pf) => (
                      <SelectItem key={pf.folder_id} value={pf.folder_id}>
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

          {/* File Drop Zone */}
          {!currentJob && (
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() =>
                document.getElementById("bulk-file-input")?.click()
              }
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-700 hover:border-gray-400"
              }`}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drop PDF files here or click to browse
              </p>
              <input
                id="bulk-file-input"
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          )}

          {/* Selected Files List */}
          {selectedFiles.length > 0 && !currentJob && (
            <div className="max-h-40 overflow-y-auto space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <p className="text-xs text-gray-500">
                {selectedFiles.length} file(s) selected
              </p>
            </div>
          )}

          {/* Job Progress */}
          {currentJob && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {currentJob.status === "completed"
                    ? "Completed"
                    : "Processing..."}
                </span>
                <span className="text-sm text-gray-500">
                  {currentJob.processed_count} / {currentJob.total_files}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  {currentJob.success_count} succeeded
                </span>
                {currentJob.failure_count > 0 && (
                  <span className="flex items-center gap-1 text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    {currentJob.failure_count} failed
                  </span>
                )}
              </div>

              {/* Failed Tasks */}
              {currentJob.failed_tasks &&
                currentJob.failed_tasks.length > 0 && (
                  <div className="text-xs text-red-500 max-h-20 overflow-y-auto">
                    {currentJob.failed_tasks.map((task, i) => (
                      <p key={i}>
                        {task.filename}: {task.error}
                      </p>
                    ))}
                  </div>
                )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            {currentJob?.status === "completed" ? (
              <Button onClick={resetModal}>Done</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleStartUpload}
                  disabled={
                    isUploading ||
                    selectedFiles.length === 0 ||
                    !selectedFolderId
                  }
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    `Upload ${selectedFiles.length} Files`
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadModal;
