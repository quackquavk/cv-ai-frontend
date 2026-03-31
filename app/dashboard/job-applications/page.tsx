"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import LinkedInApplicationsTable from "@/app/dashboard/components/LinkedInApplicationsTable";
import {
  LoaderCircle,
  AlertCircle,
  TrendingUp,
  Target,
} from "lucide-react";
import axiosInstance from "@/utils/axiosConfig";

interface UsageStats {
  application_count: number;
  applications_remaining: number | string;
  max_applications_per_day: number;
  is_premium: boolean;
}

export default function JobApplicationsPage() {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await fetchUsageStats();
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
            Monitor your job search progress. Track all automated applications
            sent on your behalf, check daily limits, and view real-time status
            updates.
          </p>
        </div>
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
      </div>

      {/* Active Session Banner */}
      {remaining <= 0 && (
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
        <LinkedInApplicationsTable />
      </Card>
    </div>
  );
}
