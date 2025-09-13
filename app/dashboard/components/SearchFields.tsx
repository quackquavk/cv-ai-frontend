"use client";
import React, { useState, useContext, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { IFormInputData } from "@/interfaces/FormInputData";
import { SearchContext } from "../context/SearchContext";
import { ViewContext } from "../context/ViewContext";
import LinearTagsInput from "./SearchInput/LinearTagsInput";
import { Search, SearchX, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { folderSelectStore, publicFolderStore, privateFolderStore, multiFolderSelectStore } from "../store";
import ToogleView from "./ToogleView";
import { IoMdHelpCircleOutline } from "react-icons/io";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/utils/axiosConfig";
import { UserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";

const SearchFields = () => {
  const searchContext = useContext(SearchContext);
  const { setSearchData } = searchContext;
  const viewContext = useContext(ViewContext);
  const [tags, setTags] = useState<string[]>([]);
  const { user } = useContext(UserContext);
  const router = useRouter();
  // const inputRefs = useRef(null);
  // const addressRef = useRef(null);
  const [formData, setFormData] = useState<IFormInputData>({
    address: "",
    attribute: [""],
    prompt: "",
    foldersToSearch: [""],
    sort_order: "",
    availability: "",
    time_of_day: "",
    star_rating: 0,
    current_salary: [],
    estimated_salary: [],
    paid_by: "",
  });

  const { selectFolderId } = folderSelectStore();
  const { isPublicSectionOpen, isPrivateSectionOpen, isFolderListOpen } = publicFolderStore();
  const { privateSubfolders } = privateFolderStore();
  const { selectedFolderIds } = multiFolderSelectStore();
  if (!searchContext) {
    throw new Error(
      "SearchContext must be used within a SearchContext.Provider"
    );
  }

  if (!viewContext) {
    throw new Error("ViewContext must be used within a ViewProvider");
  }

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      attribute: tags,
    }));
  }, [tags]);

  // SideEffect to update the folderToSearch
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      foldersToSearch: selectFolderId ? [selectFolderId] : [""],
    }));
    // Reset other search fields when switching folders (but not when multi-selecting)
    if (selectFolderId) {
      handleClear();
    }
  }, [selectFolderId]);

  // Automatically re-run search when folder selection changes (only if there's active search data)
  useEffect(() => {
    // Only trigger new search if there's already search data (user has performed a search)
    const hasActiveSearch = formData.prompt || 
                           formData.attribute?.some(attr => attr && attr !== "") || 
                           formData.address ||
                           formData.availability ||
                           formData.time_of_day ||
                           formData.star_rating > 0 ||
                           formData.current_salary?.length > 0 ||
                           formData.estimated_salary?.length > 0;
                           
    if (hasActiveSearch && selectedFolderIds.length > 0) {
      performSearch();
    }
  }, [selectedFolderIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClear = () => {
    setFormData({
      address: "",
      attribute: [""],
      prompt: "",
      sort_order: formData.sort_order,
      foldersToSearch: selectFolderId ? [selectFolderId] : [""],
      availability: "",
      time_of_day: "",
      star_rating: 0,
      current_salary: [],
      estimated_salary: [],
      paid_by: "",
    });
    setTags([]);
  };

  // Function to validate inputs salary
  const validateInput = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: "current_salary" | "estimated_salary",
    setFormData: React.Dispatch<React.SetStateAction<IFormInputData>>
  ) => {
    let value = event.target.value;

    // Remove any characters that aren't numbers or hyphens
    value = value.replace(/[^\d-]/g, "");

    // Prevent multiple hyphens
    const hyphenCount = (value.match(/-/g) || []).length;
    if (hyphenCount > 1) {
      value = value.substring(0, value.lastIndexOf("-"));
    }

    // Always update the input value
    setFormData((prev) => ({
      ...prev,
      [field]: value ? [value] : [],
    }));

    // If there's no hyphen yet, just keep updating the input
    if (!value.includes("-")) {
      return;
    }

    // Split on hyphen and clean up the values
    const [min, max] = value.split("-").map((v) => v.trim());

    // If we have both values and they're valid numbers
    if (min && max && !isNaN(Number(min)) && !isNaN(Number(max))) {
      const minNum = parseInt(min);
      const maxNum = parseInt(max);

      // Only update if max is greater than min
      if (maxNum > minNum) {
        setFormData((prev) => ({
          ...prev,
          [field]: [min, max],
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await performSearch();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Disable Enter key for input fields to prevent submission
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    // if (e.key === "Enter") {
    //   e.preventDefault();
    //   if (e.currentTarget.name === "prompt" && addressRef.current) {
    //     addressRef.current.focus(); // Move focus to address field
    //   }
    // }
    if (e.shiftKey && e.key === "Enter") {
      e.preventDefault();
      await performSearch();
    }
  };

  // Compute which folders to search based on selection and section visibility
  const computeFoldersScope = async (): Promise<string[]> => {
    // 1) Priority: If specific folders are selected for search, use those
    if (selectedFolderIds.length > 0) {
      return selectedFolderIds;
    }

    // 2) Fallback: If a specific folder is selected (for upload context), search only that folder
    if (selectFolderId) {
      return [selectFolderId];
    }

    // 3) If both public and private sections are active/open, search all (no restriction)
    if (isPublicSectionOpen && isPrivateSectionOpen) {
      return [];
    }

    // 4) Public-only (either explicitly only public is active OR
    // the folder list is collapsed and private is not active)
    if ((isPublicSectionOpen && !isPrivateSectionOpen) || (!isFolderListOpen && !isPrivateSectionOpen)) {
      try {
        const res = await axiosInstance.get("/folder/getAllFolders");
        const publicFolderIds: string[] = (res.data || []).map(
          (f: any) => f.folder_id
        );
        return publicFolderIds;
      } catch (err) {
        console.error("Failed to fetch public folders:", err);
        return [];
      }
    }

    // 5) Private-only
    if (!isPublicSectionOpen && isPrivateSectionOpen) {
      const privateIds = (privateSubfolders || []).map((pf) => pf.folder_id);
      return privateIds;
    }

    // 6) Default: no restriction
    return [];
  };

  // Build and submit the search payload with the computed scope
  const performSearch = async (overrides: Partial<IFormInputData> = {}) => {
    const foldersScope = await computeFoldersScope();
    const nextPayload: IFormInputData = {
      ...formData,
      ...overrides,
      foldersToSearch: foldersScope.length > 0 ? foldersScope : [""],
    };
    setSearchData(nextPayload);
  };
  const handleUpgradeToPro = () => {
    router.push("/user/setting");
  };

  return (
    <div className="w-full mt-3 flex flex-col gap-4 justify-center">
      {/* Selected folders indicator - subtle version */}
      {selectedFolderIds.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-md p-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Searching in {selectedFolderIds.length} folder{selectedFolderIds.length !== 1 ? 's' : ''}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => multiFolderSelectStore.getState().clearFolderSelection()}
              className="h-5 px-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Clear selection
            </Button>
          </div>
        </div>
      )}

      {/* Top search fields */}
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col w-full">
          <div className="justify-start flex py-2 mb-5">
            <div className="flex w-full max-w-full justify-start">
              <LinearTagsInput
                isPremium={user?.premium}
                tags={tags}
                setTags={setTags}
                onShiftEnter={handleSubmit}
                onUpgradeToPro={handleUpgradeToPro}
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row w-full justify-between items-start text-center gap-4">
            <div className="w-full md:w-3/6 flex items-center gap-1">
              <div className="w-full">
                <Input
                  className="placeholder:text-gray-400 w-full py-2 px-2 h-10 rounded-lg items-center gap-2 focus:outline-none focus:ring-black focus:ring-opacity-75"
                  type="string"
                  name="prompt"
                  value={formData.prompt}
                  onChange={handleChange}
                  placeholder="Enter Prompt (Job Descriptions...)"
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div>
                <IoMdHelpCircleOutline size={22} />
              </div>
            </div>

            <div className="flex items-center border-1 rounded-lg w-full md:w-auto">
              <Input
                className="w-full md:w-[12rem]"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Location"
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-normal">
              {/* Search Field */}
              <div>
                <Button
                  type="submit"
                  className="group bg-[#4caf50] dark:bg-[#4caf50] dark:hover:bg-[#56b85a] hover:bg-[#56b85a] dark:text-white"
                >
                  <Search
                    size={30}
                    className="text-md transform transition-transform text-white duration-300 ease-in-out group-hover:translate-y-[-3px]"
                  />
                  <span className="">Shift + Enter</span>
                </Button>
              </div>

              {/* Clear Field */}
              <div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="group bg-red-600 hover:bg-red-500">
                      <div className="p-1 duration-300 ease-in-out group-hover:translate-y-[-3px] ">
                        <SearchX
                          size={56}
                          className="text-white transform transition-transform"
                        />
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[90%] max-w-md mx-auto">
                    <div className="px-4 py-5 space-y-5">
                      <h1 className="text-xl md:text-2xl font-semibold">
                        Are you sure you want to clear all search fields?
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        The action will clear all the search fields.
                      </p>
                      <section className="w-full flex space-x-7 justify-end">
                        <DialogClose asChild>
                          <button className="hover:opacity-70">Cancel</button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button className="" onClick={() => handleClear()}>
                            Clear
                          </Button>
                        </DialogClose>
                      </section>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </form>
      {/* sorting search */}
      <div className="flex flex-wrap items-center justify-between gap-3 md:gap-1">
        {/* Availability */}
        <div className="w-[calc(50%-0.375rem)] md:w-auto">
          <Select
            value={formData.availability || ""}
            onValueChange={(value) => {
              const updatedValue = value === "all" ? "" : value;
              setFormData({ ...formData, availability: updatedValue });
            }}
          >
            <SelectTrigger className="w-full md:w-[120px]">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>

            <SelectContent className="md:w-[120px] w-full">
              <SelectGroup>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="onsite">Onsite</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Time of the day */}
        <div className="w-[calc(50%-0.375rem)] md:w-auto">
          <Select
            value={formData.time_of_day || ""}
            onValueChange={(value) => {
              const updatedValue = value === "all" ? "" : value;
              setFormData({ ...formData, time_of_day: updatedValue });
            }}
          >
            <SelectTrigger className="w-full md:w-[120px]">
              <SelectValue placeholder="Time" />
            </SelectTrigger>

            <SelectContent className="md:w-[120px] w-full">
              <SelectGroup>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="night">Night</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Salary By */}
        <div className="w-[calc(50%-0.375rem)] md:w-auto">
          <Select
            value={formData.paid_by}
            onValueChange={(value) => {
              const updatedValue = value === "all" ? "" : value;
              setFormData({ ...formData, paid_by: updatedValue });
            }}
          >
            <SelectTrigger className="w-full md:w-[120px]">
              <SelectValue placeholder="Salary By" />
            </SelectTrigger>

            <SelectContent className="md:w-[120px] w-full">
              <SelectGroup>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Estimated Salary */}
        <div className="w-[calc(50%-0.375rem)] md:w-[184px] relative">
          <Label
            htmlFor="estimatedSalary"
            className="absolute truncate left-6 px-1 text-center text-xs font-medium text-gray-700 -top-2 bg-white rounded-md dark:bg-black dark:text-white"
          >
            Expected Salary(USD)
          </Label>
          <Input
            type="text"
            id="estimatedSalary"
            className="peer block h-10 w-full placeholder:text-gray-400 rounded-md border py-2 px-3 text-sm gap-2 focus:outline-none focus:ring-black focus:ring-opacity-75"
            value={formData.estimated_salary.join(" - ")}
            onChange={(event) =>
              validateInput(event, "estimated_salary", setFormData)
            }
            placeholder="Example: 10 - 20"
          />
        </div>

        {/* Current Salary */}
        <div className="w-[calc(50%-0.375rem)] md:w-[11rem] relative">
          <Label
            htmlFor="currentSalary"
            className="absolute left-6 px-1 text-xs font-medium text-gray-700 -top-2 bg-white rounded-md dark:bg-black dark:text-white"
          >
            Current Salary(USD)
          </Label>
          <Input
            type="text"
            id="currentSalary"
            className="peer block w-full h-10 placeholder:text-gray-400 rounded-md  py-2 px-3 text-sm gap-2 focus:outline-none focus:ring-black focus:ring-opacity-75"
            value={formData.current_salary.join(" - ")}
            onChange={(event) =>
              validateInput(event, "current_salary", setFormData)
            }
            placeholder="Example: 10 - 20"
          />
        </div>

        {/* Rating */}
        <div className="w-[calc(50%-0.375rem)] md:w-[90px]">
          <Select
            value={String(formData.star_rating || "")}
            onValueChange={(value) => {
              const updatedValue = value === "all" ? 0 : value;
              setFormData({ ...formData, star_rating: Number(updatedValue) });
            }}
          >
            <SelectTrigger className="w-full md:w-[90px]">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>

            <SelectContent className="md:w-[90px] w-full">
              <SelectGroup>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="1">
                  <span className="flex gap-2 items-center">
                    <span>1</span>
                    <span>
                      <Star size={12} />
                    </span>
                  </span>
                </SelectItem>
                <SelectItem value="2">
                  <span className="flex gap-2 items-center">
                    <span>2</span>
                    <span>
                      <Star size={12} />
                    </span>
                  </span>
                </SelectItem>
                <SelectItem value="3">
                  <span className="flex gap-2 items-center">
                    <span>3</span>
                    <span>
                      <Star size={12} />
                    </span>
                  </span>
                </SelectItem>
                <SelectItem value="4">
                  <span className="flex gap-2 items-center">
                    <span>4</span>
                    <span>
                      <Star size={12} />
                    </span>
                  </span>
                </SelectItem>
                <SelectItem value="5">
                  <span className="flex gap-2 items-center">
                    <span>5</span>
                    <span>
                      <Star size={12} />
                    </span>
                  </span>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Sorting */}
        <div className="w-[calc(50%-0.375rem)] md:w-auto">
          <Select
            value={formData.sort_order || ""}
            onValueChange={(value) => {
              setFormData({
                ...formData,
                sort_order: value,
              });
              performSearch({ sort_order: value });
            }}
          >
            <SelectTrigger className="w-full md:w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>

            <SelectContent className="md:w-[120px] w-full">
              <SelectGroup>
                <SelectItem value="a">Ascending</SelectItem>
                <SelectItem value="d">Descending</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Toogle View */}
        <div className="w-full md:w-auto flex justify-center md:justify-start">
          <ToogleView />
        </div>
      </div>
    </div>
  );
};

export default SearchFields;
