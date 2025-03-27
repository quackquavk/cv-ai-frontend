import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { PiPlusCircleDuotone } from "react-icons/pi";
import { CirclePlus } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaChevronDown } from "react-icons/fa";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import axiosInstance from "@/utils/axiosConfig";
import DialogueComponent from "./DialogueComponent";
import { publicFolderStore } from "../store";

function FolderCreation({ onFolderCreated, setUpdateFolderList }) {
  const [folderName, setFolderName] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogueOpen] = useState(false);

  const { isFolderListOpen, toogleFolderList } = publicFolderStore();

  const handleDialogue = (state: boolean) => {
    setDialogueOpen(state);
  };

  const handleFolderCreate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (folderName.trim() === "") {
      setError("Folder name cannot be empty.");
      return;
    }
    setError("");

    try {
      const response = await axiosInstance.post(
        `/folder/makeFolder?folder_name=${folderName}`
      );

      if (response.status === 200) {
        toast("Folder created", {
          description: "Folder created successfully",
        });

        onFolderCreated();
      } else {
        toast.error("failed to create a file");
      }
    } catch (error) {
      console.error("Error creating folder", error);
      toast(error.response.data.detail, {
        style: {
          background: "black",
          color: "white",
        },
      });
    }
    setFolderName("");
    setOpen(false);
  };

  return (
    <div className="flex justify-between items-center">
      <div className="text-lg font-medium flex-1">Public Folder</div>
      {dialogOpen && (
        <DialogueComponent
          variant="selectMultipleFolders"
          handleDialogue={handleDialogue}
          setUpdateFolderList={setUpdateFolderList}
        />
      )}

      <div className="flex items-center gap-4 mr-2">
        {/* folder creation icon */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button aria-label="Add Folder" className=" relative">
              <CirclePlus
                size={20}
                // className="text-[#ECEBE3] border-black"
              />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[16rem]  absolute">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold leading-none">Create Folder</h4>
              </div>
              <div>
                <form
                  onSubmit={handleFolderCreate}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center gap-4">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      className="h-8"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                    />
                  </div>
                  <div className="flex">
                    <Button type="submit" className="ml-auto">
                      Submit
                    </Button>
                  </div>
                  {error && (
                    <p className="text-red-500 flex text-sm mt-1 ml-auto">
                      {error}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Open / Close */}
        {/* Toggle Folder List Button */}
        <button onClick={toogleFolderList} aria-label="Toggle Folder List">
          <FaChevronDown
            className={`transform transition-transform duration-300 ${
              isFolderListOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {/* three dot icons */}
        <Popover>
          <PopoverTrigger asChild>
            <button aria-label="options" className="">
              <BsThreeDotsVertical />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 flex flex-col gap-3 ">
            <button
              onClick={() => {
                handleDialogue(true);
              }}
            >
              <span className="hover:opacity-50 ">Select</span>
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export default FolderCreation;
