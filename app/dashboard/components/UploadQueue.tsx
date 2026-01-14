"use client";
import { useState, useContext, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { SpinnerContext, type UploadFile } from "../context/SpinnerContext";
import axiosInstance from "@/utils/axiosConfig";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  RefreshCw,
} from "lucide-react";

interface UploadQueueProps {
  uploadFiles: UploadFile[];
  clearCompletedFiles?: () => void;
  retryUpload?: (fileId: string) => void;
  cancelUpload?: (fileId: string) => void;
  removeUploadFile?: (fileId: string) => void;
  formatFileSize: (bytes: number) => string;
  onRefreshFolder?: () => void;
}

const UploadQueue: React.FC<UploadQueueProps> = ({
  uploadFiles,
  clearCompletedFiles,
  retryUpload,
  cancelUpload,
  removeUploadFile,
  formatFileSize,
  onRefreshFolder,
}) => {
  const spinnerContext = useContext(SpinnerContext);
  const [isUploadQueueCollapsed, setIsUploadQueueCollapsed] =
    useState<boolean>(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch active jobs from backend on mount (persistence across refresh)
  useEffect(() => {
    if (hasFetched) return;

    const fetchActiveJobs = async () => {
      try {
        const response = await axiosInstance.get("/document/my_upload_jobs");
        const jobs = response.data?.jobs || [];
        if (jobs.length > 0 && spinnerContext?.hydrateFromBackend) {
          spinnerContext.hydrateFromBackend(jobs);
        }
      } catch (error) {
        console.error("Error fetching active upload jobs:", error);
      } finally {
        setHasFetched(true);
      }
    };

    fetchActiveJobs();
  }, [hasFetched, spinnerContext]);

  if (uploadFiles.length === 0) return null;

  return (
    <div className="w-full px-4 pb-2">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        {/* Collapsible Header */}
        <div
          className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          onClick={() => setIsUploadQueueCollapsed(!isUploadQueueCollapsed)}
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Upload Queue ({uploadFiles.length})
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {!isUploadQueueCollapsed && (
              <>
                {uploadFiles.some((f) => f.status === "completed") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearCompletedFiles?.();
                    }}
                    className="text-xs h-6 px-2"
                  >
                    Clear completed
                  </Button>
                )}
                {uploadFiles.some((f) => f.status === "error") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      uploadFiles
                        .filter((f) => f.status === "error")
                        .forEach((f) => retryUpload?.(f.id));
                    }}
                    className="text-xs h-6 px-2"
                  >
                    Retry all
                  </Button>
                )}
              </>
            )}

            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {isUploadQueueCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Collapsible Content */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isUploadQueueCollapsed ? "max-h-0" : "max-h-64"
          }`}
        >
          {/* File List */}
          <div className="p-2 space-y-2 overflow-y-auto max-h-48">
            {uploadFiles.map((file) => (
              <div
                key={file.id}
                className="flex flex-col p-2 rounded-md bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex items-center space-x-3">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {file.status === "queued" && (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
                    )}
                    {file.status === "uploading" && (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    )}
                    {file.status === "processing" && (
                      <div className="relative">
                        <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                        </div>
                      </div>
                    )}
                    {file.status === "completed" && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {file.status === "error" && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        {file.estimatedTimeRemaining !== undefined &&
                          file.status !== "completed" && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ~{file.estimatedTimeRemaining}s
                            </span>
                          )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {file.status === "error"
                            ? "Failed"
                            : `${file.progress}%`}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {file.status !== "error" && (
                      <div className="relative">
                        <Progress value={file.progress} className="h-1.5" />
                        {file.status === "processing" && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent animate-[shimmer_2s_infinite]"></div>
                        )}
                      </div>
                    )}

                    {/* Status Text */}
                    <div className="flex items-center justify-between mt-1">
                      {file.status === "queued" && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Waiting to upload...
                        </p>
                      )}
                      {file.status === "uploading" && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Uploading...
                        </p>
                      )}
                      {file.status === "processing" && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          {file.processingStage || "Processing with AI..."}
                        </p>
                      )}
                      {file.status === "completed" && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Completed
                        </p>
                      )}
                      {file.status === "error" && file.error && (
                        <p className="text-xs text-red-500 dark:text-red-400 truncate max-w-[70%]">
                          {file.error}
                        </p>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-1">
                        {file.status === "error" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => retryUpload?.(file.id)}
                            className="h-5 w-5 p-0"
                            title="Retry upload"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M1 4v6h6M23 20v-6h-6" />
                              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                            </svg>
                          </Button>
                        )}

                        {(file.status === "completed" ||
                          file.status === "error") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUploadFile?.(file.id)}
                            className="h-5 w-5 p-0"
                            title="Remove from list"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Size */}
                {file.size && (
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Overall Progress */}
          {uploadFiles.length > 1 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Overall Progress
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(
                    uploadFiles.reduce((sum, file) => sum + file.progress, 0) /
                      uploadFiles.length
                  )}
                  %
                </span>
              </div>
              <Progress
                value={
                  uploadFiles.reduce((sum, file) => sum + file.progress, 0) /
                  uploadFiles.length
                }
                className="h-1.5"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {
                    uploadFiles.filter(
                      (f) => f.status === "processing" || f.status === "queued"
                    ).length
                  }{" "}
                  of {uploadFiles.length} processing
                </span>
                {uploadFiles.some((f) => f.status === "error") && (
                  <span className="text-xs text-red-500 dark:text-red-400">
                    {uploadFiles.filter((f) => f.status === "error").length}{" "}
                    failed
                  </span>
                )}
              </div>
              {/* Background processing info */}
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
                💡 Uploads continue in the background. You can safely leave this
                page.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadQueue;
