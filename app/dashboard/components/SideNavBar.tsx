"use client";
import React, {
  ChangeEvent,
  DragEvent,
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
import { IFolderData } from "@/interfaces/FolderData";
import { fetchUpdatedApiData } from "../utils/updatedInitialData";
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
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import DialogueComponent from "./DialogueComponent";
import { MdFolderZip } from "react-icons/md";
import { folderSelectStore, publicFolderStore } from "../store";

const SideNavBar = () => {
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

  // useEffect(() => {});

  const handleValueChange = (value: string) => {
    setLocalFolderId(value);
    setSelectedFolderId(value); // Update the local state to reflect manual selection
    // setSelectFolderId(value); // Update the external state
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
        toast("No files selected", {
          description: "Please select a file first and then upload files",
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

  return (
    <Sidebar className="h-[100vh] w-1/5">
      <Card className="border border-black h-[100vh] overflow-y-auto scrollbar-thin rounded-none flex flex-col items-center bg-black space-y-2 pt-2 pb-6">
        {dialogOpen && (
          <DialogueComponent
            variant="archive"
            handleDialogue={handleDialogue}
            setUpdateFolderList={setUpdateFolderList}
          />
        )}
        <SidebarHeader>
          <h1 className="text-2xl text-center w-full px-4 text-white">CV_AI</h1>
        </SidebarHeader>
        <SidebarContent className="space-y-4 w-full flex flex-col">
          <div className="w-full px-4">
            <div
              onDrop={handleDrop}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById("file-input").click()}
              className={`relative flex flex-col  cursor-pointer items-center justify-center h-22 border-2 border-dashed border-gray-400 p-4 rounded-md  bg-black text-white transition-all duration-300 ease-in-out ${
                isDragging ? "opacity-50 backdrop-blur-sm" : "opacity-100"
              }`}
            >
              <div className="flex flex-col items-center h-full w-full justify-center">
                <IoIosCloudUpload size={40} className="text-gray-400" />
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

          <div className="w-full px-4">
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
                  {folderListData.map((item: any, index) => (
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

          <div className="w-full px-4 overflow-y-auto scrollbar-thinSide ">
            <FolderCreation
              onFolderCreated={handleFolderCreated}
              setUpdateFolderList={setUpdateFolderList}
            />
          </div>

          <div className="w-full px-4 flex-1 overflow-y-auto scrollbar-thinSide">
            {isFolderListOpen && displayFolder && (
              <div>
                <FolderList
                  updateFolderList={updateFolderList}
                  setUpdateFolderList={setUpdateFolderList}
                />

                <button
                  className="bg-inherit px-0 items-center py-1 flex justify-start hover:opacity-60 w-full text-white"
                  onClick={() => {
                    handleDialogue(true);
                  }}
                >
                  <MdFolderZip className="text-gray-300 opacity-70" />
                  <h1 className="ml-6 ">Archive</h1>
                </button>
              </div>
            )}
          </div>
        </SidebarContent>
      </Card>
    </Sidebar>
  );
};

export default SideNavBar;
