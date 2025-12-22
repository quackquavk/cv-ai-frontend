"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LinkedInApplicationsTable from "@/app/dashboard/components/LinkedInApplicationsTable";
import {
  Briefcase,
  Play,
  LoaderCircle,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Calendar,
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
        <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-full w-full p-6 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Apply Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Job Applications</h1>
              <p className="text-gray-500 text-sm">
                Track your automated LinkedIn job applications
              </p>
            </div>
          </div>

          <Button
            onClick={handleApplyJobs}
            disabled={starting || isSessionActive || remaining <= 0}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
          >
            {starting ? (
              <>
                <LoaderCircle className="h-5 w-5 mr-2 animate-spin" />
                Starting...
              </>
            ) : isSessionActive ? (
              <>
                <LoaderCircle className="h-5 w-5 mr-2 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Apply to Jobs
              </>
            )}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Today's Applications */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Today's Applications
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {applicationsToday}
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    / {maxApplications}
                  </span>
                </p>
              </div>
            </div>
          </Card>

          {/* Remaining */}
          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Remaining Today
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {remaining}
                </p>
              </div>
            </div>
          </Card>

          {/* Status */}
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 border-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Status
                </p>
                {isSessionActive ? (
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      Active
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500 font-medium">Ready</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Active Session Banner */}
        {isSessionActive && activeSession && (
          <Card className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LoaderCircle className="h-5 w-5 animate-spin" />
                <div>
                  <p className="font-medium">
                    Bot is actively applying to jobs...
                  </p>
                  <p className="text-sm text-green-100">
                    {activeSession.total_applications_sent} applications sent •{" "}
                    {activeSession.total_jobs_processed} jobs processed
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {activeSession.status}
              </Badge>
            </div>
          </Card>
        )}

        {/* Limit Reached Banner */}
        {remaining <= 0 && !isSessionActive && (
          <Card className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Daily limit reached</p>
                <p className="text-sm text-amber-100">
                  You've used all {maxApplications} applications for today. Try
                  again tomorrow!
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Applications Table */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Applications</h2>
          <LinkedInApplicationsTable key={refreshKey} />
        </Card>
      </div>
    </div>
  );
}
