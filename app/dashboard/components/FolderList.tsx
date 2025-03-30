import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown } from "react-icons/fa";
import { RxHamburgerMenu } from "react-icons/rx";
import axiosInstance from "@/utils/axiosConfig";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
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

const FolderList = ({ updateFolderList, setUpdateFolderList }) => {
  const [folders, setFolders] = useState([]);
  // const [openFolder, setOpenFolder] = useState("");
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
  const { isFolderListOpen } = publicFolderStore();

  const inputRefs = useRef({});
  useEffect(() => {
    if (editingFolder && inputRefs.current[editingFolder]) {
      inputRefs.current[editingFolder].focus();
    }
  }, [editingFolder]);

  useEffect(() => {
    setSelectFolderId("");
  }, [isFolderListOpen]);

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

        setFolderContents(contentsObject);
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
  const toggleDropDown = async (folderId: string) => {
    // setOpenFolder((prevOpenFolder) =>
    //   prevOpenFolder === folderId ? "" : folderId
    // );
    setSelectFolderId(selectFolderId === folderId ? null : folderId);
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
      await axiosInstance.post(`/folder/moveFiles`, {
        from_folder: fromFolderId,
        to_folder: toFolderId,
        document_id: [file.doc_id],
      });

      // Update folderContents state
      setFolderContents((prevFolderContents) => {
        // Remove file from the source folder
        const updatedFromFolder = prevFolderContents[fromFolderId].filter(
          (f) => f.doc_id !== file.doc_id
        );

        // Add file to the target folder
        const updatedToFolder = [...prevFolderContents[toFolderId], file];

        return {
          ...prevFolderContents,
          [fromFolderId]: updatedFromFolder,
          [toFolderId]: updatedToFolder,
        };
      });
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
      await axiosInstance.post(`/folder/moveFiles`, {
        from_folder: selectFolderId,
        to_folder: folderId,
        document_id: [file.doc_id],
      });
      setFolderContents((prevFolderContents) => {
        const updatedFromFolder = prevFolderContents[selectFolderId].filter(
          (f) => f.doc_id !== file.doc_id
        );

        const updatedToFolder = [...prevFolderContents[folderId], file];

        return {
          ...prevFolderContents,
          [selectFolderId]: updatedFromFolder,
          [folderId]: updatedToFolder,
        };
      });
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
      .slice(0, 3)
      .map((lang) => lang.toLowerCase())
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

      {folders.map((folder) => (
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
                className="flex items-center w-full gap-2 cursor-pointer hover:opacity-50 "
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

            <div className="flex items-center gap-4 ">
              <div
                className="flex gap-4 cursor-pointer"
                onClick={() => toggleDropDown(folder.folder_id)}
              >
                <span
                  className={`ml-auto w-6 h-6 hover:bg-gray-700 rounded-full items-center justify-center  flex transform transition-transform duration-300 ${
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
                              file_id: file.doc_id,
                            });
                          }}
                        >
                          Archive
                        </p>
                        <hr />
                        {/* Nested Popover for "Move to" */}
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
                                <CommandEmpty>No folders found.</CommandEmpty>
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
  );
};

export default FolderList;
