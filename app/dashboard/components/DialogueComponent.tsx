import React, { useContext, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchUpdatedApiData } from "../utils/updatedInitialData";
import { ApiDataContext } from "../context/ApiDataContext";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import axiosInstance from "@/utils/axiosConfig";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { FaTrashAlt } from "react-icons/fa";
import { BsFolderSymlink } from "react-icons/bs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MdOutlineFolder } from "react-icons/md";
import { useDocumentStore } from "../store";

function DialogueComponent({
  variant,
  handleDialogue,
  id,
  folders,
  name,
  setArchieveFiles,
  setFolders,
  setUpdateFolderList,
}: {
  variant: string;
  handleDialogue?: any;
  id?: any;
  folders?: any;
  name?: any;
  openSpinner?: any;
  setArchieveFiles?: any;
  setFolders?: any;
  setUpdateFolderList?: any;
}) {
  const [files, setFiles] = useState([]);
  const [filesArchieved, setFilesArchieved] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [defaultselectedFiles, setDefaultSelectedFiles] = useState([]); // list of files in archieve folder
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [folderId, setFolderId] = useState("");
  const [folderFiles, setFolderFiles] = useState([]);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [archieveFolderContents, setArchieveFolderContents] = useState({});
  const [searchTerm, setSearchTerm] = useState(""); //State to store search query
  const context = useContext(ApiDataContext);
  const setApiData = context?.setApiData;

  // State to track the changes (archieve files)
  const setShouldRefetchDocuments = useDocumentStore(
    (state) => state.setShouldRefetchDocuments
  );

  // API's Call
  useEffect(() => {
    if (variant === "selectMultiple") {
      const fetchFiles = async () => {
        try {
          const response = await axiosInstance.get(`/folder/getFiles/${id}`);
          setFiles(response.data);
        } catch (e) {
          console.error("Error fetching data", e);
        }
      };
      fetchFiles();
    } else if (variant === "selectMultipleFolders") {
      const fetchFolders = async () => {
        try {
          const response = await axiosInstance.get("/folder/getAllFolders");
          setFiles(response.data);
        } catch (error) {
          toast.error(error);
        }
      };
      fetchFolders();
    } else if (variant === "archive") {
      const fetchArchive = async () => {
        try {
          const response = await axiosInstance.get(
            "/folder/getArchivedFolders"
          );
          const fetchedFolders = response.data;
          setFiles(fetchedFolders);

          const contentsPromises = fetchedFolders.map((folder) =>
            axiosInstance
              .get(
                `/document/getArchivedDocumentsOfFolders/${folder.folder_id}`
              )
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
          setArchieveFolderContents(contentsObject);
        } catch (error) {
          console.error("Failed to fetched Archive details", error);
        }
      };
      const fetchArchiveFiles = async () => {
        try {
          const response = await axiosInstance.get(
            "/document/getArchivedDefaultDocuments"
          );
          setFilesArchieved(response.data);
        } catch (error) {
          console.error("Error occured !!", error);
        }
      };
      fetchArchiveFiles();
      fetchArchive();
    }
  }, [id]);

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles((prevSelectedFiles) => {
      if (prevSelectedFiles.includes(fileId)) {
        return prevSelectedFiles.filter((id) => id !== fileId);
      } else {
        return [...prevSelectedFiles, fileId];
      }
    });
  };

  const handleMultipleFolderArchive = async () => {
    try {
      const response = await axiosInstance.post(`/folder/archiveFolder/`, {
        folder_ids: selectedFiles,
      });
      if (response.status == 200) {
        setUpdateFolderList((prev) => !prev);
        toast.success("Successfully archived folders");
        if (setApiData) {
          await fetchUpdatedApiData(setApiData);
        } else {
          console.warn("API Data context is not available.");
        }
      }
    } catch (error) {
      toast.error(error);
      console.error("Error archieving folder", error);
    }
  };

  // Function to handle multiple selection document archieve
  const handleDocumentArchive = async () => {
    if (selectedFiles.length === 0) {
      toast.error("No File selected !!");
      return;
    }

    try {
      const response = await axiosInstance.post("/document/archive_document", {
        document_ids: selectedFiles,
      });
      setArchieveFiles((prevFolderContents) => {
        const updatedFolderContents = { ...prevFolderContents };

        selectedFiles.forEach((file_id) => {
          const folderId = id;

          const folderFiles = updatedFolderContents[folderId] || [];

          const updatedFiles = folderFiles.filter(
            (file) => file.doc_id !== file_id
          );

          updatedFolderContents[folderId] = updatedFiles;
        });

        return updatedFolderContents;
      });
      toast.success(response.data.message);

      // Refetch the updated data
      setShouldRefetchDocuments(true);

      // if (setApiData) {
      //   await fetchUpdatedApiData(setApiData);
      // } else {
      //   console.warn("API Data context is not available.");
      // }
    } catch (error) {

      toast.error(error);
    }
  };

  const handleCheckBoxUnarchieveFile = (docId, isChecked) => {
    setDefaultSelectedFiles((prevSelected) => {
      if (isChecked) {
        return [...prevSelected, docId];
      } else {
        return prevSelected.filter((item) => item.id !== docId);
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map((file) => file.folder_id));
    }
  };
  const handleSelectAllFiles = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map((file) => file.doc_id));
    }
  };

  // Unarchieve Both Files and Folders:
  const handleUnarchive = async () => {
    if (selectedFiles.length === 0 && defaultselectedFiles.length === 0) {
      toast.error("File / Folder is not selected");
      return;
    }

    try {
      let isFolderUnarchiveSuccess = false;
      let isDocumentUnarchiveSuccess = false;
      if (selectedFiles.length > 0) {
        const response = await axiosInstance.post(`/folder/unarchiveFolder/`, {
          folder_ids: selectedFiles,
        });
        if (response.status === 200) {
          isFolderUnarchiveSuccess = true;
        }
      }

      if (defaultselectedFiles.length > 0) {
        const response = await axiosInstance.post(
          `/document/unarchive_document`,
          {
            document_ids: defaultselectedFiles,
          }
        );
        if (response.status === 200) {
          isDocumentUnarchiveSuccess = true;
        }
      }

      if (isFolderUnarchiveSuccess || isDocumentUnarchiveSuccess) {
        handleDialogue(false);
        setUpdateFolderList((prev) => !prev);

        // if (setApiData) {
        //   await fetchUpdatedApiData(setApiData);
        // } else {
        //   console.warn("API Data context is not available.");
        // }

        setShouldRefetchDocuments(true);
        toast.success("Successfully unarchived the files");
      } else {
        if (!isFolderUnarchiveSuccess) {
          toast.error("Failed to unarchive folder.");
        }
        if (!isDocumentUnarchiveSuccess) {
          toast.error("Failed to unarchive document.");
        }
      }
    } catch (error) {
      // toast(error, {
      //   style: {
      //     backgroundColor: "black",
      //     color: "white",
      //   },
      // });
      console.log(error);
      toast.error(error.response.data.detail);

    }
  };

  const archiveFolder = async () => {
    try {
      const response = await axiosInstance.post(`/folder/archiveFolder/`, {
        folder_ids: [id],
      });

      if (response.status === 200) {
        setFolders((prevFolder) => {
          const newFolders = prevFolder.filter(
            (folder) => folder.folder_id !== id
          );
          return newFolders;
        });
        setUpdateFolderList((prev) => !prev);
        // if (setApiData) {
        //   await fetchUpdatedApiData(setApiData);
        // } else {
        //   console.warn("API Data context is not available.");
        // }
        setShouldRefetchDocuments(true);
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error("Error Archiving Folder");

    }
  };
  // Move multiple files to another folder
  const handleMove = async () => {
    if (selectedFiles.length > 0) {
      if (folderId !== null) {
        try {
          await axiosInstance.post(
            `/document/move?to_folder_id=${folderId}`,
            {
              document_ids: selectedFiles,
            }
          );

          setArchieveFiles((prevFolderContents) => {
            const updatedFromFolder = prevFolderContents[id].filter(
              (file) => !selectedFiles.includes(file.doc_id)
            );

            const updatedToFolder = [
              ...prevFolderContents[folderId],
              ...prevFolderContents[id].filter((file) =>
                selectedFiles.includes(file.doc_id)
              ),
            ];

            return {
              ...prevFolderContents,
              [id]: updatedFromFolder,
              [folderId]: updatedToFolder,
            };
          });

          setShouldRefetchDocuments(true);

          toast("successfully moved files", {
            style: {
              backgroundColor: "black",
              color: "white",
            },
          });
          handleDialogue(false);
        } catch (error) {
          toast("Failed to move files");

        }
      } else {
        toast("Select a folder first", {
          style: {
            background: "black",
            color: "white",
          },
        });
      }
    } else {
      toast("Select a file first ", {
        style: {
          backgroundColor: "black",
          color: "white",
        },
      });
    }
  };

  const archiveFile = async () => {
    try {
      const response = await axiosInstance.post(`/document/archive_document`, {
        document_ids: [id.file_id],
      });

      if (response.status === 200) {
        setArchieveFiles((prevFolderContents) => {
          const updatedFolder = prevFolderContents[id.folder_id].filter(
            (file) => file.doc_id !== id.file_id
          );

          return {
            ...prevFolderContents,
            [id.folder_id]: updatedFolder,
          };
        });

        // if (setApiData) {
        //   await fetchUpdatedApiData(setApiData);
        // } else {
        //   console.warn("API Data context is not available.");
        // }

        setShouldRefetchDocuments(true);
      }

      toast.success("File Archieve Successfully");
    } catch (error) {
      toast.error("Error Archiving File  !!!");
    }
  };

  //For opening the files from archive folder
  const handleDropDown = async (folderId: string) => {
    if (openAccordion === folderId) {
      setOpenAccordion(null); // Close the accordion if it's already open
    } else {
      setOpenAccordion(folderId); // Open the new accordion
    }

    // Set the files for specified folder:
    setFolderFiles(archieveFolderContents[folderId]);
  };

  //Opening Dailog on selecting select on folder
  if (variant === "selectMultiple") {
    return (
      <Dialog
        defaultOpen
        onOpenChange={() => {
          handleDialogue(false);
        }}
      >
        <DialogContent className="py-4 max-h-[90%] overflow-y-scroll scrollbar-thin">
          <DialogHeader>
            <DialogTitle className="text-xl">{name}</DialogTitle>
            <div className=" flex flex-col w-full space-y-6  mb-8 mt-4">
              <section className="flex  items-center justify-between ">
                <Input
                  type="text"
                  className="rounded-md h-8 w-52  px-2 py-1"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <article className="space-x-2 flex">
                  <AlertDialog>
                    <AlertDialogTrigger className="p-0 mt-[1px]" asChild>
                      <Card className="border px-4 py-[0.67rem] hover:backdrop-brightness-95 rounded-md items-center hover:cursor-pointer">
                        <FaTrashAlt />
                      </Card>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          The file you selected will be archived.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-none hover:bg-black hover:">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            handleDocumentArchive();
                            handleDialogue(false);
                          }}
                          className="dark:text-black "
                        >
                          Archive
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Popover open={open} onOpenChange={setOpen} modal={true}>
                    <PopoverTrigger asChild>
                      <Card
                        // variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="items-center border px-4 py-[0.67rem] hover:backdrop-brightness-95 rounded-md cursor-pointer"
                      >
                        <BsFolderSymlink />
                      </Card>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[200px] p-2 max-h-[400px]"
                      side="bottom"
                      align="start"
                    >
                      <Command>
                        <CommandInput
                          placeholder="Search folder..."
                          className="h-9"
                        />
                        <CommandList className="max-h-[200px]">
                          <CommandEmpty>No folders found.</CommandEmpty>
                       
                          <CommandGroup>
                            {folders?.map((folder) => (
                              <CommandItem
                                key={folder.folder_id}
                                value={folder.folder_name}
                                onSelect={(currentValue) => {
                                  setValue(
                                    currentValue === value ? "" : currentValue
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
                      <div className="w-full px-2 mt-2 flex justify-end">
                        <Button
                          className="text-sm w-12 h-8 rounded-lg px-4 py-1 "
                          onClick={() => {
                            handleMove();
                          }}
                        >
                          Move
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </article>
              </section>
            </div>
            <div className="space-y-5 ">
              {files.length > 0 ? (
                <section className="w-full  flex-col">
                  <div className="flex flex-row-reverse justify-between border-#CCCC  pb-4">
                    <article className="flex items-center">
                      <button className="text-sm">Select All</button>
                      <Checkbox
                        onCheckedChange={() => {
                          handleSelectAllFiles();
                        }}
                        className="ml-2 cursor-pointer"
                      />
                    </article>

                    <h1 className="text-sm">Folders</h1>
                  </div>
                  <div>
                    {/* Filtering and displaying folder files */}
                    {files
                      .filter((file) =>
                        file.doc_name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      )
                      .map((file) => (
                        <section
                          key={file.doc_id}
                          className="flex pb-4 border-b border-#CCCC mt-4 items-center "
                        >
                          <Checkbox
                            checked={selectedFiles.includes(file.doc_id)}
                            onCheckedChange={() =>
                              handleFileSelect(file.doc_id)
                            }
                            id={`file-${file.doc_id}`}
                            className="cursor-pointer mr-4"
                          />
                          <h1 className="text-sm font-light">
                            {file.doc_name}
                          </h1>
                        </section>
                      ))}
                  </div>
                </section>
              ) : (
                <p className="text-center font-semibold">No PDFs is uploaded</p>
              )}
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }
  if (variant === "selectMultipleFolders") {
    return (
      <Dialog
        defaultOpen
        onOpenChange={() => {
          handleDialogue(false);
        }}
      >
        <DialogContent className=" py-4 max-h-[90%] overflow-y-scroll scrollbar-thin ">
          <DialogHeader>
            <DialogTitle className="text-lg">Select Folders</DialogTitle>
            <div className=" flex w-full justify-between items-center mb-8 mt-4">
              <section className="flex-col space-y-6">
                <section className="flex  items-center space-x-2">
                  <Input
                    type="text"
                    className="rounded-md h-8 w-52 px-2 py-1"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </section>
              </section>
            </div>
            <div className="space-y-5">
              {files && (
                <section className="w-full  flex-col">
                  <div className="flex flex-row-reverse justify-between border-#CCCC pb-4">
                    <article className="flex  items-center">
                      <button className="text-sm">Select All</button>
                      <Checkbox
                        onCheckedChange={() => {
                          handleSelectAll();
                        }}
                        className="ml-2 cursor-pointer"
                      />
                    </article>

                    <h1 className="text-sm ">Folders</h1>
                  </div>
                  {/* Filtering and displaying folder files */}
                  {files
                    .filter((file) =>
                      file.folder_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((file) => (
                      <div key={file.folder_id} className="flex items-start">
                        <Checkbox
                          checked={selectedFiles.includes(file.folder_id)}
                          onCheckedChange={() =>
                            handleFileSelect(file.folder_id)
                          }
                          id={`file-${file.folder_id}`}
                          className="cursor-pointer mr-4 mt-4"
                        />
                        <Accordion
                          type="single"
                          collapsible
                          className="w-full"
                          value={
                            openAccordion === file.folder_id
                              ? `item-${file.folder_id}`
                              : ""
                          }
                          onClick={() => handleDropDown(file.folder_id)}
                        >
                          <AccordionItem value={`item-${file.folder_id}`}>
                            <AccordionTrigger>
                              <h1 className="text-md">{file.folder_name}</h1>
                            </AccordionTrigger>
                            <AccordionContent>
                              {folderFiles &&
                                folderFiles.map((doc) => (
                                  <p
                                    key={doc.doc_id}
                                    className="text-sm text-gray-700 pl-9"
                                  >
                                    {doc.doc_name}
                                  </p>
                                ))}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    ))}
                </section>
              )}
              <div className="flex justify-end">
                <AlertDialog>
                  <AlertDialogTrigger className="p-0 mt-[1px]" asChild>
                    <Button className="px-5 py-2 mt-10 rounded-lg">
                      Archive
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        The folder(s) you selected will be archieved.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-none dark:bg-black">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          handleMultipleFolderArchive();
                          handleDialogue(false);
                        }}
                        className="dark:text-black"
                      >
                        Archive
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  // Dialog on clicking Archieve Folder

  if (variant === "archive") {
    return (
      <Dialog
        defaultOpen
        onOpenChange={() => {
          handleDialogue(false);
        }}
      >
        <DialogContent className=" py-4 max-h-[90%] overflow-y-scroll scrollbar-thin">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Archive</DialogTitle>
          </DialogHeader>
          <div className=" flex flex-col w-full space-y-6 mb-5 mt-4">
            <section className="flex  items-center space-x-2">
              <Input
                type="text"
                className="rounded-md h-8 w-52 px-2 py-1"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </section>
          </div>

          {files && (
            <section className="w-full px-0 flex-col">
              <div className="flex justify-between border-#CCCC pb-4">
                <h1 className="text-sm">Folders</h1>
                {files.length > 0 && (
                  <div className="flex  items-center">
                    <button className="text-sm">Select All</button>
                    <Checkbox
                      onCheckedChange={() => {
                        handleSelectAll();
                      }}
                      className="ml-2 cursor-pointer"
                    />
                  </div>
                )}
              </div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="hover:no-underline flex justify-between text-gray-400 text-sm">
                    <section className="flex items-center">
                      <MdOutlineFolder size={"20px"} />
                      <h1 className="text-sm ml-3 mt-1">Archieve Folder</h1>
                    </section>
                  </AccordionTrigger>
                  <AccordionContent className="ml-5">
                    {filesArchieved.map((doc) => (
                      <div key={doc.id} className="flex space-x-3 items-center">
                        <Checkbox
                          onCheckedChange={(isChecked) =>
                            handleCheckBoxUnarchieveFile(doc.id, isChecked)
                          }
                        />
                        <div>{doc.document_name}</div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              {/* Filtering and displaying folder files */}
              {files
                .filter((file) =>
                  file.folder_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                )
                .map((file) => (
                  <div key={file.folder_id} className="flex items-start">
                    <Checkbox
                      checked={selectedFiles.includes(file.folder_id)}
                      onCheckedChange={() =>
                        handleFileSelect(file.folder_id)
                      }
                      id={`file-${file.folder_id}`}
                      className="cursor-pointer mr-4 mt-4"
                    />
                    <Accordion
                      type="single"
                      collapsible
                      className="w-full"
                      value={
                        openAccordion === file.folder_id
                          ? `item-${file.folder_id}`
                          : ""
                      }
                      onClick={() => handleDropDown(file.folder_id)}
                    >
                      <AccordionItem value={`item-${file.folder_id}`}>
                        <AccordionTrigger>
                          <h1 className="text-md">{file.folder_name}</h1>
                        </AccordionTrigger>
                        <AccordionContent>
                          {folderFiles &&
                            folderFiles.map((doc) => (
                              <p
                                key={doc.doc_id}
                                className="text-sm text-gray-700 pl-9"
                              >
                                {doc.doc_name}
                              </p>
                            ))}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                ))}
              <div className="flex justify-end">
                <Button
                  className="px-5 py-2 border mt-10 rounded-lg"
                  onClick={() => {
                    handleUnarchive();
                  }}
                >
                  Unarchive
                </Button>
              </div>
            </section>
          )}
        </DialogContent>
      </Dialog>
    );
  } else if (variant === "alert") {
    return (
      <Dialog
        defaultOpen
        onOpenChange={() => {
          handleDialogue(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              Are you sure you want to archive?
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 py-5 space-y-5 ">
            <p className="text-gray-600 dark:text-gray-400">
              The folder you selected will not be visible.
            </p>
            <section className="w-full  flex space-x-7  justify-end  ">
              <button
                className="hover:opacity-70"
                onClick={() => {
                  handleDialogue(false);
                }}
              >
                Cancel
              </button>
              <Button
                className="px-5 py-2 rounded-lg hover:opacity-70 "
                onClick={() => {
                  handleDialogue(false);
                  archiveFolder();
                }}
              >
                Archive
              </Button>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Archieve Alert
  if (variant === "alertFile") {
    return (
      <Dialog
        defaultOpen
        onOpenChange={() => {
          handleDialogue(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              Are you sure you want to archive?
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 py-5 space-y-5 ">
            <p className="text-gray-600 dark:text-gray-400 ">
              The file you selected will not be visible.
            </p>
            <section className="w-full flex space-x-7  justify-end  ">
              <button
                className="hover:opacity-70"
                onClick={() => {
                  handleDialogue(false);
                }}
              >
                Cancel
              </button>
              <Button
                className="px-5 py-2 rounded-lg hover:opacity-70 "
                onClick={() => {
                  handleDialogue(false);
                  archiveFile();
                }}
              >
                Archive
              </Button>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
}

export default DialogueComponent;
