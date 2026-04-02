"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  LoaderCircle,
  Check,
  Puzzle,
  Shield,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosConfig";
import { useSearchParams } from "next/navigation";

export default function ExtensionPage() {
  const [authorizing, setAuthorizing] = useState(false);
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const isConnectFlow = searchParams.get("connect") === "true";

  // Automatically trigger authorization if URL has ?autoConnect=true
  useEffect(() => {
    if (searchParams.get("autoConnect") === "true") {
      authorizeExtension();
    }
  }, [searchParams]);

  const authorizeExtension = async () => {
    try {
      setAuthorizing(true);
      const response = await axiosInstance.post(
        "/extension/oauth/code",
        {},
        { withCredentials: true }
      );
      
      const code = response.data.code;

      // Send the authorization code to the extension's content script
      window.postMessage(
        { 
          type: "RESUMEAI_AUTH_CODE", 
          code: code 
        },
        "*"
      );

      setSuccess(true);
      toast.success("Extension authorized successfully!");
      
      // Auto-close tab if opened by the extension
      if (isConnectFlow) {
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    } catch (error: any) {
      console.error("Error authorizing extension:", error);
      toast.error(
        error.response?.data?.detail || "Failed to authorize extension"
      );
    } finally {
      setAuthorizing(false);
    }
  };

  return (
    <div className="h-full w-full pt-4 overflow-auto max-w-2xl">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-primary/10 rounded-lg mt-0.5">
            <Puzzle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Chrome Extension</h2>
            <p className="text-base text-muted-foreground">
              Connect the AutoApply extension to auto-fill LinkedIn applications
              with your resume data.
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {/* Step 1: Install Extension */}
        <div className="p-4 rounded-xl border bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold mb-1">
                Install the Extension
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Install the ResumeAI Chrome extension from the Chrome Web
                Store or load it manually.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open("https://chrome.google.com/webstore", "_blank")
                }
                className="text-sm"
              >
                <ExternalLink className="h-3 w-3 mr-1.5" />
                Chrome Web Store
              </Button>
            </div>
          </div>
        </div>

        {/* Step 2: Authorize */}
        <div className="p-4 rounded-xl border bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold mb-1">
                Authorize Extension
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Securely link the extension to your account. This allows the extension to sync your resume and job preferences.
              </p>

              {!success ? (
                <Button
                  size="sm"
                  onClick={authorizeExtension}
                  disabled={authorizing}
                  className="text-sm"
                >
                  {authorizing && (
                    <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  <Shield className="h-4 w-4 mr-2" />
                  Authorize Extension
                </Button>
              ) : (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  <div>
                    <p className="font-medium text-sm">Authorization Successful!</p>
                    {isConnectFlow && (
                      <p className="text-xs mt-0.5 opacity-90">You can now close this tab and return to the extension.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold text-foreground mb-2">
            What gets synced?
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 flex-shrink-0" /> Name, email, and phone
              from your profile
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 flex-shrink-0" /> City from your parsed
              resume
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 flex-shrink-0" /> Salary expectations
              and blacklist keywords
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 flex-shrink-0" /> Your resume PDF
              (auto-uploaded to LinkedIn)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

