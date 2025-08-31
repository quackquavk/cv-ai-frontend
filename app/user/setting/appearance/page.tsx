"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export default function AppearancePage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
        Appearance
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Customize how the app looks.
      </p>
      <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <h3 className="font-medium text-black dark:text-white mb-4">Theme</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => setTheme("light")}
            variant={theme === "light" ? "default" : "outline"}
            className={`
              ${
                theme === "light"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-white"
              }
              transition-all duration-200
            `}
          >
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
              Light
            </div>
          </Button>
          <Button
            onClick={() => setTheme("dark")}
            variant={theme === "dark" ? "default" : "outline"}
            className={`
              ${
                theme === "dark"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-white"
              }
              transition-all duration-200
            `}
          >
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
              Dark
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
}
