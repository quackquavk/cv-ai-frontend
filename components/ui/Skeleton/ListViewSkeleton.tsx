// "use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
// import { useEffect, useState } from "react";

export default function ListViewSkeleton() {
  // Optional animation for the carousel
  // const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const skillCount = 10;

  // Simple animation for the skills carousel
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentSkillIndex((prev) => (prev + 1) % skillCount);
  //   }, 1500);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div className="transform mb-3 w-full overflow-hidden">
      <Card className="relative gap-2 max-w-full px-3 py-4 sm:px-5 sm:py-8 pb-16 sm:pb-20">
        <div className="flex justify-between">
          <div className="flex flex-col lg:flex-row z-0 lg:justify-between w-full gap-4">
            {/* Basic Information Skeleton */}
            <div className="flex flex-col gap-1 w-full lg:w-[25%] overflow-clip">
              <div className="flex mb-0 flex-col">
                <Skeleton className="bg-gray-300 dark:bg-gray-800 h-5 w-32 mb-2 sm:mb-3" />
                <div className="flex items-center gap-2">
                  <Skeleton className="bg-gray-300 dark:bg-gray-800 h-4 w-4 rounded-full" />
                  <Skeleton className="bg-gray-300 dark:bg-gray-800 h-4 w-24" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mt-0">
                  <Skeleton className="bg-gray-300 dark:bg-gray-800 h-4 w-4 rounded-full" />
                  <Skeleton className="bg-gray-300 dark:bg-gray-800 h-4 w-28" />
                </div>
              </div>

              {/* Contact Information Skeleton */}
              {/* <div className="flex items-center gap-2">
                <Skeleton className="bg-gray-300 dark:bg-gray-800 h-4 w-4 rounded-full" />
                <Skeleton className="bg-gray-300 dark:bg-gray-800 h-4 w-32" />
              </div> */}

              <div className="flex items-center gap-2">
                <Skeleton className="bg-gray-300 dark:bg-gray-800 h-4 w-4 rounded-full" />
                <Skeleton className="bg-gray-300 dark:bg-gray-800 h-4 w-40" />
              </div>

              {/* Social Links Skeleton */}
              {/* <div className="flex items-center gap-2">
                <Skeleton className="bg-gray-300 dark:bg-gray-800 h-4 w-4 rounded-full" />
                <Skeleton className="bg-gray-300 dark:bg-gray-800 h-4 w-36" />
              </div> */}

              <div className="flex items-center gap-2">
                <Skeleton className="bg-gray-300 dark:bg-gray-800 h-4 w-4 rounded-full" />
                <Skeleton className="bg-gray-300 dark:bg-gray-800 h-4 w-32" />
              </div>
            </div>

            {/* Experience Section Skeleton */}
            <div className="flex flex-col gap-4 sm:gap-6 w-full lg:w-[30%] overflow-clip">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="bg-gray-300 dark:bg-gray-800 h-5 w-24" />
                  <Skeleton className="bg-gray-300 dark:bg-gray-800 h-4 w-16" />
                </div>
                <div>
                  <Skeleton className="bg-gray-300 dark:bg-gray-800 h-5 w-32 mt-1" />
                  <Skeleton className="bg-gray-300 dark:bg-gray-800 h-4 w-40 mt-1" />
                </div>
              </div>

              <div>
                <Skeleton className="bg-gray-300 dark:bg-gray-800 h-5 w-24 mb-1" />
                <Skeleton className="bg-gray-300 dark:bg-gray-800 h-4 w-36" />
              </div>
            </div>

            {/* Availability Section Skeleton */}
            <div className="flex flex-col gap-4 sm:gap-6 w-full lg:w-[30%]">
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col">
                    <Skeleton className="bg-gray-300 dark:bg-gray-800 h-5 w-28 mb-1" />
                    <Skeleton className="bg-gray-300 dark:bg-gray-800 h-4 w-24" />
                  </div>
                  <Skeleton className="bg-gray-300 dark:bg-gray-800 h-6 w-24 rounded-md" />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-col">
                    <Skeleton className="bg-gray-300 dark:bg-gray-800 h-5 w-32 mb-1" />
                    <Skeleton className="bg-gray-300 dark:bg-gray-800 h-4 w-28" />
                  </div>
                  <Skeleton className="bg-gray-300 dark:bg-gray-800 h-6 w-20 rounded-md" />
                </div>
              </div>

              {/* Notes Section Skeleton */}
              <div className="flex flex-col gap-1">
                <Skeleton className="bg-gray-300 dark:bg-gray-800 h-5 w-16" />
                <Skeleton className="bg-gray-300 dark:bg-gray-800 h-4 w-full" />
                <Skeleton className="bg-gray-300 dark:bg-gray-800 h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>

        {/* Skills Carousel Skeleton */}
        <div className="absolute inset-x-0 z-50 overflow-hidden bottom-1 sm:bottom-3 w-full px-2 sm:px-5">
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: skillCount }).map((_, index) => (
              <Skeleton
                key={index}
                className={`bg-gray-300 dark:bg-gray-800 h-8 w-20 rounded-md
                `}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
