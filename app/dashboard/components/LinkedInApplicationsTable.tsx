"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  LoaderCircle,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  Building2,
  Briefcase,
} from "lucide-react";
import axiosInstance from "@/utils/axiosConfig";
import { Badge } from "@/components/ui/badge";

interface JobApplication {
  application_id: string;
  session_id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  job_url?: string;
  status: string;
  result: boolean;
  applied_at: string;
}

interface BotSession {
  session_id: string;
  status: string;
  created_at: string;
  total_applications_sent: number;
}

interface LinkedInApplicationsTableProps {
  className?: string;
}

const LinkedInApplicationsTable: React.FC<LinkedInApplicationsTableProps> = ({
  className = "",
}) => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchAllApplications();
  }, []);

  const fetchAllApplications = async () => {
    try {
      setLoading(true);

      // First get sessions
      const sessionsResponse = await axiosInstance.get(
        "/linkedin_bot/sessions",
        {
          params: { page_size: 10 },
          withCredentials: true,
        }
      );
      const sessions = sessionsResponse.data.sessions || [];

      const allApps: JobApplication[] = [];

      // Fetch from sessions
      for (const session of sessions.slice(0, 5)) {
        try {
          const response = await axiosInstance.get(
            `/linkedin_bot/sessions/${session.session_id}/applications`,
            {
              params: { page: 1, page_size: 20 },
              withCredentials: true,
            }
          );
          allApps.push(...(response.data.applications || []));
        } catch (error) {
          // Ignore individual session errors
        }
      }

      // Sort by applied_at descending
      allApps.sort(
        (a, b) =>
          new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
      );

      // Filter to only show successful applications
      const successfulApps = allApps.filter((app) => app.result === true);
      setApplications(successfulApps.slice(0, 50));
      setTotal(successfulApps.length);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoaderCircle className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center p-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Briefcase className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">No applications yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Click "Apply to Jobs" to start applying automatically
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {applications.length} successful applications
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAllApplications}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Applications List - Card Style */}
      <div className="space-y-3">
        {applications.map((app) => (
          <div
            key={app.application_id}
            className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg shrink-0">
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {app.job_title}
                  </h4>
                  <p className="text-sm text-gray-500 truncate">
                    {app.company_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Applied
                </Badge>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDate(app.applied_at)}
                </span>
                <a
                  href={
                    app.job_url ||
                    `https://www.linkedin.com/jobs/view/${app.job_id}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-gray-400 hover:text-blue-600" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LinkedInApplicationsTable;
