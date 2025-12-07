"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkles, Loader2, ChevronDown } from "lucide-react";
import { resumeApi } from "../services/resumeApi";
import { toast } from "sonner";

interface AIRewriteButtonProps {
  content: string;
  contentType:
    | "summary"
    | "experience"
    | "project"
    | "education"
    | "certification"
    | "award"
    | "volunteer";
  onRewrite: (newContent: string) => void;
  disabled?: boolean;
}

const styleOptions = [
  {
    value: "professional",
    label: "✨ Professional",
    description: "Formal, corporate-ready language",
  },
  { value: "concise", label: "📝 Concise", description: "Brief and impactful" },
  {
    value: "detailed",
    label: "📖 Detailed",
    description: "Expanded with examples",
  },
  {
    value: "ats-optimized",
    label: "🎯 ATS Optimized",
    description: "Keyword-rich for recruiters",
  },
];

export function AIRewriteButton({
  content,
  contentType,
  onRewrite,
  disabled = false,
}: AIRewriteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStyle, setLoadingStyle] = useState<string | null>(null);

  const handleRewrite = async (style: string) => {
    if (!content.trim()) {
      toast.error("Please enter some content first");
      return;
    }

    try {
      setIsLoading(true);
      setLoadingStyle(style);

      const result = await resumeApi.rewriteContent(
        content,
        contentType,
        style
      );
      onRewrite(result.rewritten_content);
      toast.success("Content rewritten successfully!");
    } catch (error: any) {
      console.error("Error rewriting content:", error);
      toast.error(error.response?.data?.detail || "Failed to rewrite content");
    } finally {
      setIsLoading(false);
      setLoadingStyle(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled || isLoading || !content.trim()}
          className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-primary"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Rewriting...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              AI Rewrite
              <ChevronDown className="h-3 w-3" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {styleOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleRewrite(option.value)}
            disabled={isLoading}
            className="flex flex-col items-start gap-0.5 cursor-pointer"
          >
            <span className="font-medium">
              {loadingStyle === option.value ? (
                <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
              ) : null}
              {option.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {option.description}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
