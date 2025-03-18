import React, { useState, useEffect, KeyboardEvent, useRef } from "react";
import { X } from "lucide-react";
import { PiPlusCircleThin } from "react-icons/pi";

const LinearTagsInput = ({ tags, setTags, onShiftEnter }) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sample suggestions list - replace with your own data source
  const allSuggestions = [
    "nextjs",
    "node",
    "react",
    "typescript",
    "javascript",
    "python",
    "angular",
    "vuejs",
    "java",
    "nestjs",
    "aws",
    "kafka",
    "devops",
    "digital marketing",
    "seo",
    "wordpress",
    "graphics designing",
    "c#",
    "dotnet",
    "machine learning",
    "golang",
    "email marketing",
    "express",
    "spring boot",
    "ci/cd",
    "kubernetes",
    "php",
    "mongodb",
    "postgres",
    "git",
    "docker",
    "android",
    "flutter",
    "c++",
    "spark",
    "hive",
    "jira",
    "machine learning",
  ];

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = allSuggestions.filter(
        (suggestion) =>
          suggestion.toLowerCase().startsWith(inputValue.toLowerCase()) &&
          !tags.includes(suggestion)
      );
      setSuggestions(filtered);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, tags]);

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Handle suggestions for ArrowUp, ArrowDown, and Enter keys
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleAddTag(suggestions[selectedIndex]);
        } else if (inputValue) {
          handleAddTag(inputValue);
        }
      }
    } else if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }

    // Handling Shift + Enter combination
    if (e.shiftKey && e.key === "Enter") {
      e.preventDefault();
      if (onShiftEnter) {
        onShiftEnter(e); // Call the handleSubmit (onShiftEnter) passed from the parent
      }
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="w-full relative ">
      <div
        className="min-h-100 w-full p-[0.4rem] border-2 border-#CCCC rounded-lg flex flex-wrap items-center gap-2 focus-within:ring-1 focus-within:ring-gray-900 cursor-text"
        onClick={handleClick}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddTag(inputValue);
            handleClick();
          }}
          className=" hover:opacity-75 flex justify-center items-center focus:outline-none"
        >
          <PiPlusCircleThin
            size={"30px"}
            className="font-bold hover:cursor-pointer"
          />
        </button>
        {tags.map((tag, index) => (
          <span
            key={index}
            className="bg-white border-2 border-#CCCC min-w-28 justify-between  text-black  pl-3 pr-1 py-1  rounded-md flex items-center gap-1 text-sm"
          >
            {tag}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              className=" rounded-full border-gray-400 flex text-gray-400 justify-center items-center p-[1px] border focus:outline-none"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <div className="flex flex-col gap-2">
          <div>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 outline-none bg-transparent w-[20rem]"
              placeholder={
                tags.length === 0
                  ? "Tags to search... e.g.nodejs nextjs python "
                  : ""
              }
            />
          </div>
          {suggestions.length > 0 && (
            <div className="absolute w-fit top-0 mt-12 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto z-10 scrollbar-thin dark:bg-gray-500">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 cursor-pointer ${
                    index === selectedIndex
                      ? "bg-gray-100 dark:bg-gray-600"
                      : "hover:bg-gray-50 dark:bg-gray-500"
                  }`}
                  onClick={() => handleAddTag(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinearTagsInput;
