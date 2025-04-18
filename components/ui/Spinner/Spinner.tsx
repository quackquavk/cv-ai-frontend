"use client";
import React, { useContext, useEffect, useState } from "react";
import { SpinnerContext } from "@/app/dashboard/context/SpinnerContext";
import { Progress } from "@/components/ui/progress";

function Spinner() {
  const context = useContext(SpinnerContext);
  const uploading = context?.uploading;
  const [progress, setProgress] = useState(0);

  // Reset progress when upload starts or completes
  useEffect(() => {
    if (uploading) {
      // Reset progress when upload starts
      setProgress(0);

      // Simulate progress with a timer
      const timer = setInterval(() => {
        setProgress((prevProgress) => {
          // Progress goes up to 95% during simulation
          if (prevProgress >= 95) {
            clearInterval(timer);
            return 95;
          }
          return prevProgress + 5;
        });
      }, 500);

      return () => {
        clearInterval(timer);
      };
    } else {
      // When not uploading, either it never started or just finished
      // If we were showing progress before, set to 100% briefly
      if (progress > 0) {
        setProgress(100);
        // Optional: could add a timeout here to reset progress to 0 after a delay
      }
    }
  }, [uploading]);

  if (!uploading) return null;

  return (
    <div>
      <div
        className="fixed inset-0 z-[9999] 
        flex flex-col items-center justify-center gap-6
        bg-black/50 backdrop-blur-sm"
      >
        <div className="w-64 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col gap-2 items-center">
          <Progress value={progress} className="h-2 mb-4" />
          <span className="text-xl text-black dark:text-white">
            Uploading... {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default Spinner;
