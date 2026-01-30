"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  LoaderCircle,
  Target,
  CheckCircle2,
  XCircle,
  FileText,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosConfig";
import { Textarea } from "@/components/ui/textarea";

interface ATSScoreResult {
  overall_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
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
  const [jobPosting, setJobPosting] = useState("");
  const [scoreResult, setScoreResult] = useState<ATSScoreResult | null>(null);
  const [scoring, setScoring] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedResumeId, setOptimizedResumeId] = useState<string | null>(
    null,
  );

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

  const extractJobTitle = (posting: string): string => {
    const lines = posting.trim().split("\n");
    const firstLine = lines[0]?.trim() || "";
    if (firstLine.length > 0 && firstLine.length < 100) {
      return firstLine;
    }
    return "Target Position";
  };

  const handleCalculateScore = async () => {
    if (!jobPosting.trim() || jobPosting.trim().length < 50) {
      toast.error(
        "Please paste a complete job posting (at least 50 characters)",
      );
      return;
    }

    try {
      setScoring(true);
      setScoreResult(null);

      const response = await axiosInstance.post(
        "/ats/my-score",
        {
          job: {
            title: extractJobTitle(jobPosting),
            description: jobPosting,
          },
        },
        { withCredentials: true },
      );

      setScoreResult(response.data);
      toast.success(`ATS Score: ${response.data.overall_score}/100`);
    } catch (error: any) {
      console.error("Error calculating score:", error);
      toast.error(
        error.response?.data?.detail || "Failed to calculate ATS score",
      );
    } finally {
      setScoring(false);
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
        { withCredentials: true },
      );

      const result: OptimizeResult = response.data;
      setOptimizedResumeId(result.resume_id);
      toast.success(
        `Resume optimized! Score: ${result.original_score} → ${result.optimized_score_estimate}`,
      );

      // Attempt to open in new tab
      window.open(`/dashboard/resumes/${result.resume_id}`, "_blank");
    } catch (error: any) {
      console.error("Error optimizing resume:", error);
      if (error.response?.status === 429) {
        toast.error(
          "Resume limit reached. Please upgrade or delete an existing resume.",
        );
      } else {
        toast.error(
          error.response?.data?.detail || "Failed to optimize resume",
        );
      }
    } finally {
      setOptimizing(false);
    }
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
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
    <div className="h-full w-full py-6 overflow-auto">
      <div className="max-w-3xl  space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            ATS Optimizer
          </h1>
          <p className="text-muted-foreground mt-1">
            Perfect your resume for any role. Paste a job description to analyze
            how well your resume matches and get AI-driven improvements to boost
            your ATS score.
          </p>
        </div>

        {/* Job Input */}
        <Card className="p-5">
          <Textarea
            placeholder="Paste the complete job description here..."
            value={jobPosting}
            onChange={(e) => setJobPosting(e.target.value)}
            className="min-h-[180px] resize-none border-0 bg-muted/50 focus-visible:ring-1 text-sm"
          />

          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleCalculateScore}
              disabled={scoring || jobPosting.trim().length < 50}
              variant="outline"
              className="flex-1"
            >
              {scoring ? (
                <>
                  <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Check Score
                </>
              )}
            </Button>

            <Button
              onClick={handleOptimizeResume}
              disabled={optimizing || jobPosting.trim().length < 50}
              className="flex-1"
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

        {/* Score Results */}
        {scoreResult && (
          <Card className="p-5">
            {/* Score Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold">Your ATS Score</h2>
              <div
                className={`${getScoreBg(
                  scoreResult.overall_score,
                )} text-white px-4 py-2 rounded-full font-bold`}
              >
                {scoreResult.overall_score}/100
              </div>
            </div>

            {/* Keywords Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Matched */}
              <div>
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Matched ({scoreResult.matched_keywords.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {scoreResult.matched_keywords.slice(0, 8).map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded"
                    >
                      {kw}
                    </span>
                  ))}
                  {scoreResult.matched_keywords.length > 8 && (
                    <span className="px-2 py-0.5 text-xs text-muted-foreground">
                      +{scoreResult.matched_keywords.length - 8}
                    </span>
                  )}
                </div>
              </div>

              {/* Missing */}
              <div>
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-red-600 dark:text-red-400">
                  <XCircle className="h-4 w-4" />
                  Missing ({scoreResult.missing_keywords.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {scoreResult.missing_keywords.slice(0, 8).map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded"
                    >
                      {kw}
                    </span>
                  ))}
                  {scoreResult.missing_keywords.length > 8 && (
                    <span className="px-2 py-0.5 text-xs text-muted-foreground">
                      +{scoreResult.missing_keywords.length - 8}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Optimize CTA */}
            <div className="mt-5 pt-4 border-t">
              <Button
                onClick={handleOptimizeResume}
                disabled={optimizing}
                className="w-full"
              >
                {optimizing ? (
                  <>
                    <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                    Creating Optimized Resume...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Re-optimize Resume
                  </>
                )}
              </Button>
              {optimizedResumeId && (
                <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md text-center">
                  <p className="text-sm font-medium mb-2">
                    Optimization complete!
                  </p>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-primary font-semibold"
                    onClick={() =>
                      window.open(
                        `/dashboard/resumes/${optimizedResumeId}`,
                        "_blank",
                      )
                    }
                  >
                    If it didn't redirect, click here to view your resume
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center mt-2">
                AI will add missing keywords and improve your content
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
