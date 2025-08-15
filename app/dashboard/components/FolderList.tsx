import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown } from "react-icons/fa";
import { RxHamburgerMenu } from "react-icons/rx";
import axiosInstance from "@/utils/axiosConfig";
import { Check, ExternalLink, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";
import DialogueComponent from "./DialogueComponent";
import { BsThreeDots } from "react-icons/bs";
import { BsThreeDotsVertical } from "react-icons/bs";
import { folderSelectStore } from "../store";
import { FaRegFolder, FaRegFolderOpen } from "react-icons/fa";
import { publicFolderStore } from "../store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDocumentStore } from "../store";
import PrivateFolderActions from "./PrivateFolderActions";
import { privateFolderStore } from "../store";
import { CirclePlus, FolderLock, FolderOpen, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

// Skeleton loader component for private files
const PrivateFilesSkeleton = () => {
  return (
    <div className="mt-2 ml-8 border-l border-blue-300 pl-4 max-w-full">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="flex items-center justify-between p-1 mb-2">
          <div className="flex items-center space-x-[1px] w-full">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1 ml-2 animate-pulse"></div>
          </div>
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );
};

// Logic part of FolderList component with fixes
const FolderList = ({ updateFolderList, setUpdateFolderList }) => {
  const [folders, setFolders] = useState([]);
  const [folderContents, setFolderContents] = useState({});
  const [editingFolder, setEditingFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [draggedFile, setDraggedFile] = useState(null);
  const [dialogOpen, setDialogueOpen] = useState(false);
  const [dialogAlert, setDialogueAlert] = useState(false);
  const [draggedOverFolder, setDraggedOverFolder] = useState(null);
  const [selectedFile, setSelectedFile] = useState({
    folder_id: "",
    file_id: "",
  });
  const [value, setValue] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");
  const [name, setName] = useState("");
  const [dialogAlertFile, setDialogueAlertFile] = useState(false);
  const [folderId, setFolderId] = useState("");
  const { selectFolderId, setSelectFolderId } = folderSelectStore();
  const { isFolderListOpen, isPrivateSectionOpen, togglePrivateSection, isPublicSectionOpen, togglePublicSection } = publicFolderStore();
  const {
    hasPrivateFolder,
    setHasPrivateFolder,
    privateRootId,
    setPrivateRootId,
    privateSubfolders,
    setPrivateSubfolders,
    lastUpdatedFolderId,
  } = privateFolderStore();
  const [isCreatingPrivateFolder, setIsCreatingPrivateFolder] = useState(false);
  const [isCreatePrivateSubfolderOpen, setIsCreatePrivateSubfolderOpen] =
    useState(false);
  const [newPrivateSubfolderName, setNewPrivateSubfolderName] = useState("");
  const inputRefs = useRef({});
  // State to track the changes (archive files)
  const setShouldRefetchDocuments = useDocumentStore(
    (state) => state.setShouldRefetchDocuments
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    if (editingFolder && inputRefs.current[editingFolder]) {
      inputRefs.current[editingFolder].focus();
    }
  }, [editingFolder]);

  useEffect(() => {
    setSelectFolderId("");
  }, [isFolderListOpen]);

  // Ensure/get private root, then list private subfolders
  useEffect(() => {
    const initPrivate = async () => {
      try {
        const rootRes = await axiosInstance.get("/folder/private/root");
        const rootId = rootRes.data?.folder_id;
        if (rootId) {
          setPrivateRootId(rootId);
          setHasPrivateFolder(true);
          // fetch subfolders under private root
          const childrenRes = await axiosInstance.get(
            `/folder/children?parent_id=${rootId}&include_private=true`
          );
          const subs = (childrenRes.data || [])
            .filter((f) => f.visibility === "private")
            .map((f) => ({
              folder_id: f.folder_id,
              name: f.name || f.folder_name,
            }));
          setPrivateSubfolders(subs);
          // fetch contents for each private subfolder
          const privateContentsPromises = subs.map((sf) =>
            axiosInstance
              .get(`/folder/getFiles/${sf.folder_id}`)
              .then((res) => ({ [sf.folder_id]: res.data || [] }))
              .catch(() => ({ [sf.folder_id]: [] }))
          );
          const privateContents = await Promise.all(privateContentsPromises);
          const privateContentsObject = privateContents.reduce(
            (acc, content) => ({ ...acc, ...content }),
            {}
          );
          setFolderContents((prev) => ({ ...prev, ...privateContentsObject }));
        } else {
          setHasPrivateFolder(false);
        }
      } catch (error) {
        // 401/403 implies unauthenticated/non-premium
        setHasPrivateFolder(false);
        setPrivateRootId(null);
        setPrivateSubfolders([]);
      }
    };
    initPrivate();
  }, [setHasPrivateFolder, setPrivateRootId, setPrivateSubfolders]);

  // When a private subfolder was just updated by copy/move elsewhere, refetch its contents
  useEffect(() => {
    if (lastUpdatedFolderId) {
      refetchFolderFiles(lastUpdatedFolderId);
    }
  }, [lastUpdatedFolderId]);

  // Fetch public folders and their contents
  useEffect(() => {
    const fetchFoldersAndContents = async () => {
      try {
        const foldersResponse = await axiosInstance.get(
          "/folder/getAllFolders"
        );
        const fetchedFolders = foldersResponse.data;
        setFolders(fetchedFolders);
        const contentsPromises = fetchedFolders.map((folder) =>
          axiosInstance
            .get(`/folder/getFiles/${folder.folder_id}`)
            .then((response) => ({
              [folder.folder_id]: response.data || [],
            }))
            .catch((error) => {
              console.error(
                `Error fetching contents for folder ${folder.folder_id}:`,
                error
              );
              return { [folder.folder_id]: [] };
            })
        );
        const allContents = await Promise.all(contentsPromises);
        const contentsObject = allContents.reduce(
          (acc, content) => ({ ...acc, ...content }),
          {}
        );
        setFolderContents((prevContents) => ({
          ...prevContents,
          ...contentsObject,
          // preserve any previously loaded private subfolder contents
        }));
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    };
    fetchFoldersAndContents();
  }, [updateFolderList]);

  const handleDialogue = (state: boolean) => {
    setDialogueOpen(state);
  };

  const handleAlert = (state: boolean) => {
    setDialogueAlert(state);
  };

  const handleAlertFile = (state: boolean) => {
    setDialogueAlertFile(state);
  };

  // Helper: fetch content for a folder and merge into state
  const refetchFolderFiles = async (targetFolderId: string) => {
    try {
      const res = await axiosInstance.get(`/folder/getFiles/${targetFolderId}`);
      const files = res.data || [];
      setFolderContents((prev) => ({ ...prev, [targetFolderId]: files }));
    } catch (e) {
      // noop
    }
  };

  const handlePrivateFolderActionSuccess = async (
    file,
    fromFolderId,
    actionType: "copy" | "move",
    toFolderId?: string
  ) => {
    // Only remove the file from current folder if it was moved (not copied)
    if (actionType === "move") {
      setFolderContents((prevFolderContents) => {
        const updatedFromFolder =
          prevFolderContents[fromFolderId]?.filter(
            (f) => f.doc_id !== file.doc_id
          ) || [];
        return {
          ...prevFolderContents,
          [fromFolderId]: updatedFromFolder,
        };
      });
    }
    // Refresh target private subfolder contents (if provided)
    if (toFolderId) {
      await refetchFolderFiles(toFolderId);
    }
    // Trigger document refetch to ensure consistency across views
    setShouldRefetchDocuments(true);
    // For move operations from public folders, trigger folder list update
    if (actionType === "move") {
      setUpdateFolderList((prev) => !prev);
    }
  };

  const toggleDropDown = async (folderId: string) => {
    const newValue = selectFolderId === folderId ? null : folderId;
    setSelectFolderId(newValue);
  };

  const handleRename = async (folderId: string) => {
    if (newFolderName.trim() === "") {
      toast.error("Folder name is required");
      return;
    }
    try {
      await axiosInstance.put(`/folderrenameFolder/${folderId}`, {
        folder_id: folderId,
        new_name: newFolderName,
      });
      setFolders((prevFolders) =>
        prevFolders.map((folder) =>
          folder.folder_id === folderId
            ? { ...folder, folder_name: newFolderName }
            : folder
        )
      );
      // Reset editing state
      setEditingFolder(null);
      setNewFolderName("");
      toast("Successfully edited the folder", {
        description: "Folder has been renamed successfully",
        style: {
          color: "white",
          background: "black",
        },
      });
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast("Failed to edit", {
        description: error.response.data.detail,
        style: {
          background: "black",
          color: "white",
        },
      });
    }
  };

  const handleDragStart = (file, fromFolderId) => {
    setDraggedFile({ file, fromFolderId });
  };

  const handleDragEnd = () => {
    setDraggedFile(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragLeave = () => {
    setDraggedOverFolder(null);
  };

  const handleDrop = async (toFolderId) => {
    if (!draggedFile) return;
    const { file, fromFolderId } = draggedFile;
    if (fromFolderId === toFolderId) {
      toast.error("File already in same folder");
      return;
    }
    try {
      await axiosInstance.post(`/document/move?to_folder_id=${toFolderId}`, {
        document_ids: [file.doc_id],
      });
      // Update folderContents state
      setFolderContents((prevFolderContents) => {
        // Remove file from the source folder
        const updatedFromFolder = (
          prevFolderContents[fromFolderId] || []
        ).filter((f) => f.doc_id !== file.doc_id);
        // Add file to the target folder
        const updatedToFolder = [
          ...(prevFolderContents[toFolderId] || []),
          file,
        ];
        return {
          ...prevFolderContents,
          [fromFolderId]: updatedFromFolder,
          [toFolderId]: updatedToFolder,
        };
      });
      setShouldRefetchDocuments(true);
      toast.success("File moved successfully!");
    } catch (error) {
      console.error("Error moving file:", error);
      toast.error("Failed to move the file. Please try again.");
    } finally {
      setDraggedFile(null);
    }
  };

  const handleMove = async (file) => {
    try {
      await axiosInstance.post(`/document/move?to_folder_id=${folderId}`, {
        document_ids: [file.doc_id],
      });
      setFolderContents((prevFolderContents) => {
        const updatedFromFolder = (
          prevFolderContents[selectFolderId] || []
        ).filter((f) => f.doc_id !== file.doc_id);
        const updatedToFolder = [...(prevFolderContents[folderId] || []), file];
        return {
          ...prevFolderContents,
          [selectFolderId]: updatedFromFolder,
          [folderId]: updatedToFolder,
        };
      });
      setShouldRefetchDocuments(true);
      toast.success("File moved successfully!");
    } catch (error) {
      console.error("Error !!", error);
      toast.error("Failed to move the file. Please try again.");
    }
  };

  const fetchDocumentsByIds = async (docIds: string[]) => {
    const promises = docIds.map((docId) =>
      axiosInstance.get(`/document/cv/${docId}`).then((res) => res.data)
    );
    return Promise.all(promises);
  };

  const formatName = (name: string | undefined): string => {
    if (!name) return "undefined";
    return name.trim().replace(/\s+/g, "-").toLowerCase();
  };

  const formatLanguages = (languages: string[] | undefined): string => {
    if (!languages || languages.length === 0) return "undefined";
    return languages
      .map((item) => {
        const match = item.match(/\b[a-zA-Z#]+\b/);
        return match ? match[0] : "";
      })
      .filter((lang) => lang !== "")
      .slice(0, 3)
      .join("-");
  };

  const handleCardClick = async (docId: string) => {
    try {
      const [documentData] = await fetchDocumentsByIds([docId]);
      const url = `/cv-detail/${docId}/${formatName(
        documentData?.parsed_cv?.name
      )}/${formatLanguages(documentData?.parsed_cv?.programming_languages)}`;
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error fetching document data:", error);
    }
  };
  return (
    <div className="w-full">
      {/* Dailogue on clikcing Select */}
      {dialogOpen && (
        <DialogueComponent
          folders={folders}
          id={selectedFolder}
          variant="selectMultiple"
          handleDialogue={handleDialogue}
          setArchieveFiles={setFolderContents}
          name={name}
        />
      )}
      {/* Folder Dialogue */}
      {dialogAlert && (
        <DialogueComponent
          variant="alert"
          handleDialogue={handleAlert}
          id={selectedFolder}
          setFolders={setFolders}
          setUpdateFolderList={setUpdateFolderList}
        />
      )}
      {/* Daiologue on clicking three dot icon of individual file */}
      {dialogAlertFile && (
        <DialogueComponent
          variant="alertFile"
          handleDialogue={handleAlertFile}
          id={selectedFile}
          setArchieveFiles={setFolderContents}
        />
      )}
      {/* Private Subfolders Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center justify-between w-full cursor-pointer" onClick={togglePrivateSection}>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold  text-gray-700 dark:text-gray-300">
                Private Folders
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {hasPrivateFolder && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCreatePrivateSubfolderOpen(true);
                  }}
                  disabled={isCreatingPrivateFolder}
                >
                  <CirclePlus className="h-3 w-3 mr-1" /> 
                </Button>
              )}
              <span className={`transform transition-transform duration-300 ${isPrivateSectionOpen ? "rotate-180" : "rotate-0"}`}>
                <FaChevronDown />
              </span>
            </div>
          </div>
              <Dialog
                open={isCreatePrivateSubfolderOpen}
                onOpenChange={setIsCreatePrivateSubfolderOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create private</DialogTitle>
                  </DialogHeader>
                  <div className="mt-2">
                    <Input
                      placeholder="Enter subfolder name"
                      value={newPrivateSubfolderName}
                      onChange={(e) =>
                        setNewPrivateSubfolderName(e.target.value)
                      }
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreatePrivateSubfolderOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!newPrivateSubfolderName.trim() || !privateRootId)
                          return;
                        setIsCreatingPrivateFolder(true);
                        try {
                          const res = await axiosInstance.post(
                            `/folder/create`,
                            {
                              name: newPrivateSubfolderName.trim(),
                              parent_id: privateRootId,
                              visibility: "private",
                            }
                          );
                          const newFolder = {
                            folder_id: res.data?.folder_id,
                            name:
                              res.data?.folder_name ||
                              newPrivateSubfolderName.trim(),
                          };
                          setPrivateSubfolders([
                            ...privateSubfolders,
                            newFolder,
                          ]);
                          setFolderContents((prev) => ({
                            ...prev,
                            [newFolder.folder_id]: [],
                          }));
                          setNewPrivateSubfolderName("");
                          setIsCreatePrivateSubfolderOpen(false);
                          toast.success("Private subfolder created");
                        } catch (e) {
                          toast.error("Failed to create subfolder");
                        } finally {
                          setIsCreatingPrivateFolder(false);
                        }
                      }}
                      disabled={
                        isCreatingPrivateFolder ||
                        !newPrivateSubfolderName.trim()
                      }
                    >
                      {isCreatingPrivateFolder ? "Creating..." : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            
        </div>
        {isPrivateSectionOpen && (
          <>
            {!hasPrivateFolder && (
          <div className="text-xs text-gray-600 dark:text-gray-400 px-1 flex items-center gap-1">
            Upgrade to access private folders.{" "}
            <Link
              href="/user/setting"
              target="_blank"
              className="text-blue-600 underline underline-offset-2"
            >
              <ExternalLink size={14} />
            </Link>
          </div>
        )}
        {hasPrivateFolder && privateSubfolders.length === 0 && (
          <div className="text-xs text-gray-600 dark:text-gray-400 px-1 flex items-center gap-2">
            No private subfolders yet.
          </div>
        )}
        {hasPrivateFolder &&
          privateSubfolders.map((pf) => (
            <div
              key={pf.folder_id}
              className={`mb-4 transition-all duration-200 ${
                draggedOverFolder === pf.folder_id
                  ? "opacity-50 bg-gray-700/30"
                  : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(pf.folder_id)}
            >
              <div className="flex items-center flex-1 rounded">
                {editingFolder === pf.folder_id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRename(pf.folder_id);
                    }}
                    className="flex-1 ml-12"
                  >
                    <Input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value.trim())}
                      onBlur={() => setEditingFolder(null)}
                      className="w-full rounded p-1"
                      ref={(el) => {
                        if (el) inputRefs.current[pf.folder_id] = el;
                      }}
                    />
                    <button type="submit" className="hidden"></button>
                  </form>
                ) : (
                  <div
                    className="flex items-center w-full gap-2 cursor-pointer hover:opacity-50"
                    onClick={() => toggleDropDown(pf.folder_id)}
                  >
                    <span>
                      {selectFolderId === pf.folder_id ? (
                        <FaRegFolderOpen />
                      ) : (
                        <FaRegFolder />
                      )}
                    </span>
                    <span className="ml-5 flex items-center gap-2">
                      {pf.name}
                    </span>
                  </div>
                )}
                <div className="flex  items-center gap-4 ">
                  <div
                    className="flex gap-4 cursor-pointer"
                    onClick={() => toggleDropDown(pf.folder_id)}
                  >
                    <span
                      className={`ml-auto hover:opacity-50 items-center justify-center  flex transform transition-transform duration-300 ${
                        selectFolderId === pf.folder_id
                          ? "rotate-180"
                          : "rotate-0"
                      }`}
                    >
                      <FaChevronDown />
                    </span>
                  </div>
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          onClick={() => {
                            setSelectedFolder(pf.folder_id);
                          }}
                        >
                          <BsThreeDotsVertical />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-32 p-1 px-6 cursor-pointer ml-36">
                        <p
                          className="py-1 w-full hover:opacity-50"
                          onClick={() => {
                            setEditingFolder(pf.folder_id);
                            setNewFolderName(pf.name);
                          }}
                        >
                          Rename
                        </p>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              {selectFolderId === pf.folder_id && (
                <div className="mt-2 ml-6 border-l  border-gray-600 pl-4 max-w-full truncate">
                  {folderContents[pf.folder_id]?.length ? (
                    folderContents[pf.folder_id].map((file) => (
                      <div
                        key={file.doc_id}
                        className="relative flex items-center justify-between p-1 text-gray-800 dark:text-gray-400 ease-in-out duration-150 delay-75 rounded w-full "
                      >
                        <div
                          key={file.doc_id}
                          onClick={() => handleCardClick(file.doc_id)}
                          className="w-full hover:opacity-60 truncate flex items-center space-x-[1px] cursor-pointer"
                          draggable
                          onDragStart={() =>
                            handleDragStart(file, pf.folder_id)
                          }
                          onDragEnd={handleDragEnd}
                        >
                          <span>
                            <RxHamburgerMenu />
                          </span>
                          <span className="px-2  py-1 text-sm truncate">
                            {file.doc_name?.replace(".pdf", "")}
                          </span>
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button>
                              <BsThreeDots
                                className="text-gray-800 dark:text-gray-400 hover:opacity-60 hover:cursor-pointer"
                                size={"15px"}
                              />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-28 p-1 ml-32">
                            <p
                              className="flex items-center py-1 hover:cursor-pointer hover:opacity-50 justify-center"
                              onClick={() => {
                                handleAlertFile(true);
                                setSelectedFile({
                                  folder_id: pf.folder_id,
                                  file_id: file.doc_id || file._id,
                                });
                              }}
                            >
                              Archive
                            </p>
                          </PopoverContent>
                        </Popover>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-800 dark:text-gray-400 italic">
                      {`No PDF's uploaded.`}
                    </div>
                  )}
                </div>
              )}
                      </div>
        ))}
          </>
        )}
      </div>
      {/* Public Folders Section */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1 mb-">
          <div className="flex items-center justify-between w-full cursor-pointer" onClick={togglePublicSection}>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold   text-gray-700 dark:text-gray-300">
                Public Folders
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {/* 
                size="sm"
                variant="ghost"
                className="h-7 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <CirclePlus className="h-3 w-3 mr-1" /> 
              </> */}
              <span className={`transform transition-transform duration-300 ${isPublicSectionOpen ? "rotate-180" : "rotate-0"}`}>
                <FaChevronDown />
              </span>
            </div>
          </div>
        </div>
        {isPublicSectionOpen && folders.map((folder) => (
          <div
            key={folder.folder_id}
            className={`mb-4 transition-all duration-200 ${
              draggedOverFolder === folder.folder_id
                ? "opacity-50 bg-gray-700/30"
                : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(folder.folder_id)}
          >
            <div className="flex items-center flex-1 rounded">
              {editingFolder === folder.folder_id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRename(folder.folder_id);
                  }}
                  className="flex-1 ml-12"
                >
                  <Input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value.trim())}
                    onBlur={() => setEditingFolder(null)}
                    className="w-full rounded p-1"
                    ref={(el) => {
                      if (el) inputRefs.current[folder.folder_id] = el;
                    }}
                  />
                  <button type="submit" className="hidden"></button>
                </form>
              ) : (
                <div
                  className="flex items-center w-full gap-2 cursor-pointer hover:opacity-50"
                  onClick={() => toggleDropDown(folder.folder_id)}
                >
                  <span>
                    {selectFolderId === folder.folder_id ? (
                      <FaRegFolderOpen />
                    ) : (
                      <FaRegFolder />
                    )}
                  </span>
                  <span className="ml-5">{folder.folder_name}</span>
                </div>
              )}
              <div className="flex  items-center gap-4 ">
                <div
                  className="flex gap-4 cursor-pointer"
                  onClick={() => toggleDropDown(folder.folder_id)}
                >
                  <span
                    className={`ml-auto hover:opacity-50 items-center justify-center  flex transform transition-transform duration-300 ${
                      selectFolderId === folder.folder_id
                        ? "rotate-180"
                        : "rotate-0"
                    }`}
                  >
                    <FaChevronDown />
                  </span>
                </div>
                <div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        onClick={() => {
                          setSelectedFolder(folder.folder_id);
                        }}
                      >
                        <BsThreeDotsVertical />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-32 p-1 px-6 cursor-pointer ml-36">
                      <p
                        className="py-1 w-full hover:opacity-50"
                        onClick={() => {
                          setEditingFolder(folder.folder_id);
                          setNewFolderName(folder.folder_name);
                        }}
                      >
                        Rename
                      </p>
                      <hr className=" bg-gray-300 h-[1px] border-0" />
                      <p
                        onClick={() => {
                          handleDialogue(true);
                          // setEditingFolder(folder.folder_id);
                          setName(folder.folder_name);
                        }}
                        className="py-1 w-full hover:opacity-50"
                      >
                        Select
                      </p>
                      <hr className=" bg-gray-300 h-[1px] border-0" />
                      <p
                        onClick={() => {
                          handleAlert(true);
                        }}
                        className="py-1 w-full hover:opacity-50"
                      >
                        Archive
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            {selectFolderId === folder.folder_id && (
              <div className="mt-2 ml-6 border-l  border-gray-600 pl-4 max-w-full truncate">
                {folderContents[folder.folder_id]?.length ? (
                  folderContents[folder.folder_id].map((file) => (
                    <div
                      key={file.doc_id}
                      className="relative flex items-center justify-between p-1 text-gray-800 dark:text-gray-400 ease-in-out duration-150 delay-75 rounded w-full "
                    >
                      <div
                        key={file.doc_id}
                        onClick={() => handleCardClick(file.doc_id)}
                        className="w-full hover:opacity-60 truncate flex items-center space-x-[1px] cursor-pointer"
                        draggable
                        onDragStart={() =>
                          handleDragStart(file, folder.folder_id)
                        }
                        onDragEnd={handleDragEnd}
                      >
                        <span>
                          <RxHamburgerMenu />
                        </span>
                        <span className="px-2  py-1 text-sm truncate">
                          {file.doc_name.replace(".pdf", "")}
                        </span>
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button>
                            <BsThreeDots
                              className="text-gray-800 dark:text-gray-400 hover:opacity-60 hover:cursor-pointer"
                              size={"15px"}
                            />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-28 p-1 ml-32">
                          <p
                            className="flex items-center py-1 hover:cursor-pointer hover:opacity-50 justify-center"
                            onClick={() => {
                              handleAlertFile(true);
                              setSelectedFile({
                                folder_id: folder.folder_id,
                                file_id: file.doc_id || file._id,
                              });
                            }}
                          >
                            Archive
                          </p>
                          <hr />
                          {/* Private Folder Actions */}
                          <div className="flex items-center justify-center py-1">
                            <PrivateFolderActions
                              documentId={file.doc_id}
                              documentName={file.doc_name}
                              currentFolderId={folder.folder_id}
                              variant="button"
                              className="w-full h-6 text-xs border-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                              onSuccess={(actionType, toFolderId) => {
                                handlePrivateFolderActionSuccess(
                                  file,
                                  folder.folder_id,
                                  actionType,
                                  toFolderId
                                );
                              }}
                            />
                          </div>
                          <hr />
                          <Popover>
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
                                  <CommandGroup>
                                    {folders?.map((folder) => (
                                      <CommandItem
                                        key={folder.folder_id}
                                        value={folder.folder_name}
                                        onSelect={(currentValue) => {
                                          setValue(
                                            currentValue === value
                                              ? ""
                                              : currentValue
                                          );
                                          setFolderId(folder.folder_id);
                                        }}
                                      >
                                        {folder.folder_name}
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            value === folder.folder_name
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
                                    handleMove(file);
                                  }}
                                >
                                  Move
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </PopoverContent>
                      </Popover>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-800 dark:text-gray-400 italic">
                    {`No PDF's uploaded.`}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FolderList;
