"use client";
import React, { useState, useContext, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { FaSearch } from "react-icons/fa";
import { IFormInputData } from "@/interfaces/FormInputData";
import { SearchContext } from "../context/SearchContext";
import { ViewContext } from "../context/ViewContext";
import LinearTagsInput from "./SearchInput/LinearTagsInput";
import { RxCrossCircled } from "react-icons/rx";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { folderSelectStore } from "../store";
import ToogleView from "./ToogleView";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SearchFields = () => {
  const searchContext = useContext(SearchContext);
  const { setSearchData } = searchContext;
  const viewContext = useContext(ViewContext);
  const [tags, setTags] = useState<string[]>([]);
  // const inputRefs = useRef(null);
  const addressRef = useRef(null);
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
    // Reset other search fields when switching folders
    handleClear();
  }, [selectFolderId]);

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
    setSearchData(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Disable Enter key for input fields to prevent submission
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.currentTarget.name === "prompt" && addressRef.current) {
        addressRef.current.focus(); // Move focus to address field
      }
    }
  };

  return (
    <div className="w-full mt-3 flex flex-col gap-4 justify-center">
      {/* Top search fields */}
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col w-full">
          <div className=" justify-start flex py-2 mb-5">
            <div className="flex w-full max-w-full justify-start">
              <LinearTagsInput
                // handleClear={handleClear}
                tags={tags}
                setTags={setTags}
              />
            </div>
          </div>
          <div className="flex justify-between items-center  text-center">
            <div className="w-[60%] flex justify-start">
              <input
                className="placeholder:text-gray-400 border-2 w-full py-2 px-2  rounded-md "
                type="string"
                name="prompt"
                value={formData.prompt}
                onChange={handleChange}
                placeholder="Enter Prompt (skills)"
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* <div className="flex items-center w-[35%]  justify-around flex-shrink-0 "> */}
            <div className="flex items-center border-2 rounded-lg">
              <Input
                className="w-[12rem] border-none"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Location"
                onKeyDown={handleKeyDown}
                ref={addressRef} // Assign the ref to the Input component
              />
            </div>
            <div className="flex items-center gap-4">
              {/* Clear Field */}
              <div>
                <RxCrossCircled
                  color="red"
                  size="28px"
                  className="hover:cursor-pointer hover:opacity-50"
                  onClick={() => handleClear()}
                />
              </div>
              {/* Search Field */}
              <Button
                type="submit"
                className=" bg-white rounded-3xl group hover:bg-inherit"
              >
                <span className="transform transition-transform duration-300 ease-in-out group-hover:translate-y-[-3px]">
                  <FaSearch size="24px" className="text-black" />
                </span>
              </Button>
            </div>
          </div>
          {/* </div> */}
        </div>
      </form>
      {/* sorting search */}
      <div className="flex items-center justify-between ">
        {/* Availability */}
        <div>
          <Select
            value={formData.availability || ""}
            onValueChange={(value) => {
              const updatedValue = value === "all" ? "" : value;
              setFormData({ ...formData, availability: updatedValue });
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>

            <SelectContent className="w-[120px]">
              <SelectGroup>
                {/* <SelectLabel>Availability</SelectLabel> */}
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="onsite">Onsite</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Time of the day */}
        <div>
          <Select
            value={formData.time_of_day || ""}
            onValueChange={(value) => {
              const updatedValue = value === "all" ? "" : value;
              setFormData({ ...formData, time_of_day: updatedValue });
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time" />
            </SelectTrigger>

            <SelectContent className="w-[120px]">
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
        <div>
          <Select
            value={formData.paid_by}
            onValueChange={(value) => {
              const updatedValue = value === "all" ? "" : value;
              setFormData({ ...formData, paid_by: updatedValue });
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Salary By" />
            </SelectTrigger>

            <SelectContent className="w-[120px]">
              <SelectGroup>
                {/* <SelectLabel>Salary Based</SelectLabel> */}
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Estimsated Salary */}
        <div className="w-[11rem] relative">
          <label
            htmlFor="estimatedSalary"
            className="absolute truncate left-1 px-1 text-xs font-medium  text-gray-700 -top-2 bg-white"
          >
            Estimated Salary(USD) Range
          </label>
          <input
            type="text"
            id="estimatedSalary"
            className="peer block w-full rounded-md border border-gray-300 transition-all duration-100 bg-white py-2 px-3 text-xs shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black "
            value={formData.estimated_salary.join(" - ")}
            onChange={(event) =>
              validateInput(event, "estimated_salary", setFormData)
            }
            placeholder="Example: 10 - 20"
          />
        </div>

        {/* Current Salary */}
        <div className="w-[11rem] relative">
          <label
            htmlFor="currentSalary"
            className="absolute left-2 px-1 text-xs font-medium text-gray-700 -top-2 bg-white"
          >
            Current Salary(USD) Range
          </label>
          <input
            type="text"
            id="currentSalary"
            className="peer block w-full rounded-md border border-gray-300 transition-all duration-100 bg-white py-2 px-3 text-xs shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black "
            value={formData.current_salary.join(" - ")}
            onChange={(event) =>
              validateInput(event, "current_salary", setFormData)
            }
            placeholder="Example: 10 - 20"
          />
        </div>

        {/* Rating */}
        <div className="w-[90px]">
          <Select
            value={String(formData.star_rating || "")}
            onValueChange={(value) => {
              const updatedValue = value === "all" ? 0 : value;
              setFormData({ ...formData, star_rating: Number(updatedValue) });
            }}
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>

            <SelectContent className="w-[90px]">
              <SelectGroup>
                {/* <SelectLabel>Salary Based</SelectLabel> */}
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
        <div className="">
          <Select
            value={formData.sort_order || ""}
            onValueChange={(value) => {
              setFormData({
                ...formData,
                sort_order: value,
              });
              setSearchData({
                ...formData,
                sort_order: value,
              });
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>

            <SelectContent className="w-[120px]">
              <SelectGroup>
                <SelectItem value="a">Ascending</SelectItem>
                <SelectItem value="d">Descending</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Toogle View */}
        <div>
          <ToogleView />
        </div>
      </div>
    </div>
  );
};

export default SearchFields;
