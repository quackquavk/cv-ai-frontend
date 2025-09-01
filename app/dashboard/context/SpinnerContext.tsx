"use client";
import React, { useState, createContext } from "react";

export interface UploadFile {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error' | 'queued';
  error?: string;
  size?: number;
  type?: string;
  processingStage?: string; // To show AI processing steps
  estimatedTimeRemaining?: number; // Estimated time for completion
}

interface ISpinner {
  uploading: boolean;
  setUploading: (value: boolean) => void;
  uploadFiles: UploadFile[];
  setUploadFiles: React.Dispatch<React.SetStateAction<UploadFile[]>>;
  addUploadFile: (file: UploadFile) => void;
  updateUploadFile: (id: string, updates: Partial<UploadFile>) => void;
  removeUploadFile: (id: string) => void;
  clearCompletedFiles: () => void;
  retryUpload: (id: string) => void; // New function to retry failed uploads
  cancelUpload: (id: string) => void; // New function to cancel uploads
}

export const SpinnerContext = createContext<ISpinner | undefined>(undefined);

export const SpinnerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);

  const addUploadFile = (file: UploadFile) => {
    setUploadFiles(prev => [...prev, file]);
  };

  const updateUploadFile = (id: string, updates: Partial<UploadFile>) => {
    setUploadFiles(prev => 
      prev.map(file => 
        file.id === id ? { ...file, ...updates } : file
      )
    );
  };

  const removeUploadFile = (id: string) => {
    setUploadFiles(prev => prev.filter(file => file.id !== id));
  };

  const clearCompletedFiles = () => {
    setUploadFiles(prev => prev.filter(file => file.status !== 'completed'));
  };

  // New function to retry failed uploads
  const retryUpload = (id: string) => {
    setUploadFiles(prev => 
      prev.map(file => 
        file.id === id ? { ...file, status: 'queued', progress: 0, error: undefined } : file
      )
    );
  };

  // New function to cancel uploads
  const cancelUpload = (id: string) => {
    setUploadFiles(prev => 
      prev.map(file => 
        file.id === id ? { ...file, status: 'error', error: 'Upload cancelled' } : file
      )
    );
  };

  return (
    <SpinnerContext.Provider value={{ 
      uploading, 
      setUploading,
      uploadFiles,
      setUploadFiles,
      addUploadFile,
      updateUploadFile,
      removeUploadFile,
      clearCompletedFiles,
      retryUpload,
      cancelUpload
    }}>
      {children}
    </SpinnerContext.Provider>
  );
};