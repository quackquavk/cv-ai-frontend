"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  LoaderCircle,
  Sparkles,
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosConfig";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ATSScoreResult {
  overall_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  recommendations: string[];
}

interface ImprovementSuggestion {
  section: string;
  priority: string;
  issue: string;
  suggestion: string;
  example?: string;
  keywords_to_add?: string[];
}

interface SuggestionsResult {
  current_score: number;
  target_score: number;
  suggestions: ImprovementSuggestion[];
  quick_wins?: string[];
}

interface OptimizeResult {
  resume_id: string;
  job_title: string;
  original_score: number;
  optimized_score_estimate: number;
  improvements_made: string[];
}

export default function ATSOptimizerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasClaimedCV, setHasClaimedCV] = useState(false);

  // Simplified: single textarea for entire job posting
  const [jobPosting, setJobPosting] = useState("");

  // Score state
  const [scoreResult, setScoreResult] = useState<ATSScoreResult | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionsResult | null>(
    null
  );
  const [scoring, setScoring] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    checkClaimedCV();
  }, []);

  const checkClaimedCV = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/cv-claim/has_claimed_cv", {
        withCredentials: true,
      });
      setHasClaimedCV(response.data === true);
    } catch (error) {
      console.error("Error checking claimed CV:", error);
      setHasClaimedCV(false);
    } finally {
      setLoading(false);
    }
  };

  // Extract job title from posting (first line or reasonable guess)
  const extractJobTitle = (posting: string): string => {
    const lines = posting.trim().split("\n");
    const firstLine = lines[0]?.trim() || "";
    // If first line is short enough, use it as title
    if (firstLine.length > 0 && firstLine.length < 100) {
      return firstLine;
    }
    return "Target Position";
  };

  const handleCalculateScore = async () => {
    if (!jobPosting.trim() || jobPosting.trim().length < 50) {
      toast.error(
        "Please paste a complete job posting (at least 50 characters)"
      );
      return;
    }

    try {
      setScoring(true);
      setScoreResult(null);
      setSuggestions(null);

      const response = await axiosInstance.post(
        "/ats/my-score",
        {
          job: {
            title: extractJobTitle(jobPosting),
            description: jobPosting,
          },
        },
        { withCredentials: true }
      );

      setScoreResult(response.data);
      toast.success(`ATS Score: ${response.data.overall_score}/100`);
    } catch (error: any) {
      console.error("Error calculating score:", error);
      toast.error(
        error.response?.data?.detail || "Failed to calculate ATS score"
      );
    } finally {
      setScoring(false);
    }
  };

  const handleGetSuggestions = async () => {
    if (!scoreResult) {
      toast.error("Please calculate your score first");
      return;
    }

    try {
      setLoadingSuggestions(true);

      const response = await axiosInstance.post(
        "/ats/improve-suggestions",
        {
          job: {
            title: extractJobTitle(jobPosting),
            description: jobPosting,
          },
          target_score: 80,
        },
        { withCredentials: true }
      );

      setSuggestions(response.data);
      toast.success("AI suggestions generated!");
    } catch (error: any) {
      console.error("Error getting suggestions:", error);
      toast.error(error.response?.data?.detail || "Failed to get suggestions");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleOptimizeResume = async () => {
    try {
      setOptimizing(true);

      const response = await axiosInstance.post(
        "/ats/optimize-resume",
        {
          job: {
            title: extractJobTitle(jobPosting),
            description: jobPosting,
          },
          target_score: 80,
        },
        { withCredentials: true }
      );

      const result: OptimizeResult = response.data;
      toast.success(
        `Resume optimized! Score: ${result.original_score} → ${result.optimized_score_estimate}`
      );

      // Redirect to the resume builder
      router.push(`/dashboard/resumes/${result.resume_id}`);
    } catch (error: any) {
      console.error("Error optimizing resume:", error);
      if (error.response?.status === 429) {
        toast.error(
          "Resume limit reached. Please upgrade or delete an existing resume."
        );
      } else {
        toast.error(
          error.response?.data?.detail || "Failed to optimize resume"
        );
      }
    } finally {
      setOptimizing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 70) return "from-green-500 to-emerald-500";
    if (score >= 50) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-rose-500";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasClaimedCV) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Resume Found</h2>
          <p className="text-muted-foreground mb-4">
            Please upload and claim your CV first to use the ATS optimizer.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full w-full pt-4 pb-6 overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            ATS Resume Optimizer
          </h2>
          <p className="text-sm text-muted-foreground">
            Check your resume score and get AI-powered optimization
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Job Input */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Target Job Description
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Paste the entire job posting</Label>
                <Textarea
                  placeholder="Copy and paste the complete job description from LinkedIn, Indeed, or any job board..."
                  value={jobPosting}
                  onChange={(e) => setJobPosting(e.target.value)}
                  className="bg-gray-100 dark:bg-gray-800 border-0 min-h-[200px]"
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Include the full job description, requirements, and
                  qualifications for best results
                </p>
              </div>

              <Button
                onClick={handleCalculateScore}
                disabled={scoring || jobPosting.trim().length < 50}
                className="w-full"
              >
                {scoring ? (
                  <>
                    <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Calculate ATS Score
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="space-y-4">
          {/* Score Display */}
          {scoreResult && (
            <Card className="p-4">
              <h3 className="font-medium mb-4">Your ATS Score</h3>

              {/* Score Circle */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div
                    className={`w-32 h-32 rounded-full flex items-center justify-center bg-gradient-to-br ${getScoreGradient(
                      scoreResult.overall_score
                    )} text-white shadow-lg`}
                  >
                    <div className="text-center">
                      <span className="text-4xl font-bold">
                        {scoreResult.overall_score}
                      </span>
                      <span className="text-xl">/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Keywords */}
              <div className="space-y-4">
                {/* Matched Keywords */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">
                      Matched Keywords ({scoreResult.matched_keywords.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {scoreResult.matched_keywords
                      .slice(0, 10)
                      .map((kw, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded"
                        >
                          {kw}
                        </span>
                      ))}
                    {scoreResult.matched_keywords.length > 10 && (
                      <span className="px-2 py-1 text-xs text-muted-foreground">
                        +{scoreResult.matched_keywords.length - 10} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Missing Keywords */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">
                      Missing Keywords ({scoreResult.missing_keywords.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {scoreResult.missing_keywords
                      .slice(0, 10)
                      .map((kw, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded"
                        >
                          {kw}
                        </span>
                      ))}
                    {scoreResult.missing_keywords.length > 10 && (
                      <span className="px-2 py-1 text-xs text-muted-foreground">
                        +{scoreResult.missing_keywords.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={handleGetSuggestions}
                  disabled={loadingSuggestions}
                  className="flex-1"
                >
                  {loadingSuggestions ? (
                    <>
                      <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Get Suggestions
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleOptimizeResume}
                  disabled={optimizing}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {optimizing ? (
                    <>
                      <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Optimize Resume
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Suggestions */}
          {suggestions && (
            <Card className="p-4">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                AI Improvement Suggestions
              </h3>

              {/* Quick Wins */}
              {suggestions.quick_wins && suggestions.quick_wins.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">
                    Quick Wins
                  </p>
                  <ul className="text-sm space-y-1">
                    {suggestions.quick_wins.map((win, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <span>{win}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detailed Suggestions */}
              <Accordion type="multiple" className="space-y-2">
                {suggestions.suggestions.map((sugg, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`item-${idx}`}
                    className="border rounded-lg px-3"
                  >
                    <AccordionTrigger className="py-3 hover:no-underline">
                      <div className="flex items-center gap-2 text-left">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(
                            sugg.priority
                          )}`}
                        >
                          {sugg.priority}
                        </span>
                        <span className="text-sm font-medium capitalize">
                          {sugg.section}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          - {sugg.issue}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3">
                      <p className="text-sm mb-2">{sugg.suggestion}</p>
                      {sugg.example && (
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm italic">
                          "{sugg.example}"
                        </div>
                      )}
                      {sugg.keywords_to_add &&
                        sugg.keywords_to_add.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {sugg.keywords_to_add.map((kw, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded"
                              >
                                +{kw}
                              </span>
                            ))}
                          </div>
                        )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          )}

          {/* Placeholder when no results */}
          {!scoreResult && (
            <Card className="p-8 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Enter a Job Description</h3>
              <p className="text-sm text-muted-foreground">
                Paste the job posting you want to apply for and we'll analyze
                how well your resume matches.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
