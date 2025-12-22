"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LinkedInApplicationsTable from "@/app/dashboard/components/LinkedInApplicationsTable";
import {
  Play,
  LoaderCircle,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosConfig";
import { Badge } from "@/components/ui/badge";

interface UsageStats {
  application_count: number;
  applications_remaining: number | string;
  max_applications_per_day: number;
  is_premium: boolean;
}

interface ActiveSession {
  session_id: string;
  status: string;
  total_applications_sent: number;
  total_jobs_processed: number;
}

export default function JobApplicationsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [starting, setStarting] = useState(false);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  // Poll for active session status
  useEffect(() => {
    if (
      !activeSession ||
      activeSession.status === "completed" ||
      activeSession.status === "failed"
    ) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await axiosInstance.get(
          `/linkedin_bot/session/${activeSession.session_id}/status`,
          { withCredentials: true }
        );
        setActiveSession(response.data);

        if (["completed", "failed", "stopped"].includes(response.data.status)) {
          setRefreshKey((prev) => prev + 1);
          fetchUsageStats();
        }
      } catch (error) {
        console.error("Error polling session:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchUsageStats(), fetchActiveSession()]);
    setLoading(false);
  };

  const fetchUsageStats = async () => {
    try {
      const response = await axiosInstance.get("/usage/stats", {
        withCredentials: true,
      });
      setUsageStats(response.data);
    } catch (error) {
      console.error("Error fetching usage stats:", error);
    }
  };

  const fetchActiveSession = async () => {
    try {
      const response = await axiosInstance.get("/linkedin_bot/sessions", {
        params: { page_size: 1 },
        withCredentials: true,
      });
      const sessions = response.data.sessions || [];
      const active = sessions.find(
        (s: ActiveSession) => s.status === "running" || s.status === "pending"
      );
      setActiveSession(active || null);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const handleApplyJobs = async () => {
    try {
      setStarting(true);
      const response = await axiosInstance.post(
        "/linkedin_bot/session/start",
        {},
        { withCredentials: true }
      );
      setActiveSession(response.data);
      toast.success("Job application session started!");
    } catch (error: any) {
      console.error("Error starting session:", error);
      toast.error(error.response?.data?.detail || "Failed to start session");
    } finally {
      setStarting(false);
    }
  };

  const isSessionActive =
    activeSession && ["running", "pending"].includes(activeSession.status);
  const applicationsToday = usageStats?.application_count || 0;
  const maxApplications = usageStats?.max_applications_per_day || 10;
  const remaining =
    typeof usageStats?.applications_remaining === "number"
      ? usageStats.applications_remaining
      : maxApplications;

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full w-full pt-4 overflow-auto">
      {/* Compact Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold">Job Applications</h2>
          <p className="text-sm text-muted-foreground">
            Track your automated LinkedIn applications
          </p>
        </div>

        <Button
          onClick={handleApplyJobs}
          disabled={starting || isSessionActive || remaining <= 0}
        >
          {starting ? (
            <>
              <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
              Starting...
            </>
          ) : isSessionActive ? (
            <>
              <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
              Applying...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Apply to Jobs
            </>
          )}
        </Button>
      </div>

      {/* Compact Inline Stats */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span>
            Today: <span className="font-semibold">{applicationsToday}</span>
            <span className="text-muted-foreground">/{maxApplications}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span>
            Remaining: <span className="font-semibold">{remaining}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
          {isSessionActive ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-green-600 dark:text-green-400 font-medium">
                Active
              </span>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Ready</span>
            </>
          )}
        </div>
      </div>

      {/* Active Session Banner */}
      {isSessionActive && activeSession && (
        <div className="flex items-center justify-between p-3 mb-4 bg-muted border-l-4 border-green-500 rounded-r-md">
          <div className="flex items-center gap-3">
            <LoaderCircle className="h-4 w-4 animate-spin text-green-600" />
            <div>
              <p className="text-sm font-medium">
                Bot is actively applying to jobs...
              </p>
              <p className="text-xs text-muted-foreground">
                {activeSession.total_applications_sent} applications sent •{" "}
                {activeSession.total_jobs_processed} jobs processed
              </p>
            </div>
          </div>
          <Badge variant="secondary">{activeSession.status}</Badge>
        </div>
      )}

      {/* Limit Reached Banner */}
      {remaining <= 0 && !isSessionActive && (
        <div className="flex items-center gap-3 p-3 mb-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Daily limit reached
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              You've used all {maxApplications} applications for today.
            </p>
          </div>
        </div>
      )}

      {/* Applications Table */}
      <Card className="p-4">
        <h3 className="text-sm font-medium mb-3">Recent Applications</h3>
        <LinkedInApplicationsTable key={refreshKey} />
      </Card>
    </div>
  );
}
