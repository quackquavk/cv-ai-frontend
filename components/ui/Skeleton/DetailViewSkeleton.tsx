"use client";

import { useState } from "react";
import { MenuIcon as RxHamburgerMenu } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DetailViewSkeleton() {
  const [closeParsedData, setCloseParsedData] = useState(false);

  return (
    <Card
      className={`px-3 ${
        closeParsedData ? "hidden translate-x-full" : "flex translate-x-0"
      } w-full transition-all duration-300 ease-in-out py-3 h-full flex-col gap-3 rounded-none`}
    >
      {/* Scrollable */}
      <div className="pb-3 overflow-y-auto scrollbar-thin flex flex-col gap-3">
        {/* First Part - Personal Info */}
        <div className="top-0">
          <div className="flex justify-between w-[100%] items-start">
            <div className="flex flex-col w-max-[60%] flex-wrap pr-3">
              {/* Name */}
              <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-2"></div>

              {/* Position */}
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-3"></div>

              {/* Social Links */}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex gap-2 items-center mb-2">
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mr-4">
          <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />
        </div>

        {/* Second Part - Content */}
        <div className="flex-grow flex-col space-y-3">
          {/* Programming Language */}
          <div>
            <div className="flex flex-col gap-1 pb-2">
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-2"></div>
              <div className="flex flex-wrap gap-3 text-sm max-w-3xl">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </div>

          <div className="mr-4">
            <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />
          </div>

          {/* Skills */}
          <div>
            <div className="flex flex-col gap-1 pb-2">
              <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-2"></div>
              <div className="flex flex-wrap gap-3 max-w-3xl">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex gap-1 items-center">
                    <div className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                    <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mr-4">
            <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />
          </div>

          {/* Experience */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            </div>
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="mb-3">
                  <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-1"></div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                  </div>
                  <div className="flex flex-col text-sm max-w-3xl mr-4 gap-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="flex gap-1">
                        <div className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mt-1"></div>
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mr-4">
            <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />
          </div>

          {/* Project */}
          <div>
            <div className="flex flex-col gap-1 max-w-3xl">
              <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-2"></div>
              <div className="flex gap-4 flex-col">
                {[1, 2].map((i) => (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                      <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mr-4"></div>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center text-sm mr-4 max-w-3xl mb-2">
                      {[1, 2, 3].map((j) => (
                        <div
                          key={j}
                          className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
                        ></div>
                      ))}
                    </div>
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mr-4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mr-4">
            <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />
          </div>

          {/* Education */}
          <div>
            <div className="flex flex-col gap-1">
              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-2"></div>
              <div className="flex gap-2 flex-col">
                {[1].map((i) => (
                  <div key={i}>
                    <div className="h-5 w-64 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-1"></div>
                    <div className="flex gap-1 items-center">
                      <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mr-4">
            <hr className="w-full h-[2px] opacity-20 bg-black dark:bg-white dark:opacity-50" />
          </div>

          {/* Certificate */}
          <div>
            <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-2"></div>
            <div className="flex flex-col space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Availability Section */}
      <div className="relative w-full">
        <div className="sticky z-10 border-t-2 border-slate-700 pt-3 flex flex-col gap-3">
          {/* Stars & Like / DisLike */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            {/* stars */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
                ></div>
              ))}
            </div>

            {/* Like / DisLike */}
            <div className="order-2 sm:order-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div className="w-full sm:w-auto">
              <Select disabled>
                <SelectTrigger className="w-full sm:w-[120px] h-[34px] text-xs bg-gray-200 dark:bg-gray-700 animate-pulse">
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="placeholder">Placeholder</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-auto">
              <Select disabled>
                <SelectTrigger className="w-full sm:w-[120px] text-xs h-[34px] bg-gray-200 dark:bg-gray-700 animate-pulse">
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="placeholder">Placeholder</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary */}
          <div className="flex flex-col sm:flex-row mt-1 justify-between md:gap-3 sm:gap-0">
            {/* Current Salary */}
            <div className="w-full md:w-40 relative">
              <Label
                htmlFor="currentSalary"
                className="absolute left-3 px-1 text-center text-xs font-medium text-gray-700 dark:text-gray-400 top-2.5"
              >
                Current Salary(USD)
              </Label>
              <div className="h-9 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            </div>

            {/* Estimated Salary */}
            <div className="w-full md:w-40 relative">
              <Label
                htmlFor="estimatedSalary"
                className="absolute left-3 px-1 text-xs font-medium text-gray-700 dark:text-gray-400 top-2.5"
              >
                Expected Salary(USD)
              </Label>
              <div className="h-9 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            </div>
          </div>

          {/* Salary Based & Save */}
          <div className="flex justify-between items-center">
            <div className="w-full sm:w-auto">
              <Select disabled>
                <SelectTrigger className="w-full sm:w-[120px] h-[34px] text-xs bg-gray-200 dark:bg-gray-700 animate-pulse">
                  <SelectValue placeholder="Salary Based" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="placeholder">Placeholder</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            </div>

            {/* Save Button */}
            <div className="w-full sm:w-auto">
              <div className="h-8 w-20 sm:w-22 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
