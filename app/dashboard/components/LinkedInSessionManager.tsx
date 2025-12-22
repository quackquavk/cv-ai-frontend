"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  LoaderCircle,
  Play,
  Square,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosConfig";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// Live pulse indicator for running sessions
const StatusPulse = ({ status }: { status: string }) => {
  if (status === "running") {
    return (
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
    );
  }
  if (status === "verification_required") {
    return (
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="relative flex h-3 w-3">
        <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
      </span>
    );
  }
  return null;
};

// Countdown timer for verification expiry
const VerificationTimer = ({ expiresAt }: { expiresAt: string }) => {
  const [timeLeft, setTimeLeft] = React.useState<number>(0);

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      return Math.max(0, diff);
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  if (timeLeft <= 0) {
    return <span className="text-red-500 font-medium">Expired</span>;
  }

  return (
    <span
      className={`font-mono ${
        timeLeft < 60000 ? "text-red-500" : "text-orange-500"
      }`}
    >
      {minutes}:{seconds.toString().padStart(2, "0")}
    </span>
  );
};

// Get adaptive polling interval based on session status
const getPollingInterval = (status: string): number => {
  switch (status) {
    case "running":
      return 3000; // 3 seconds - active monitoring
    case "verification_required":
      return 2000; // 2 seconds - urgent, waiting for user action
    case "pending":
      return 5000; // 5 seconds - still starting up
    default:
      return 10000; // 10 seconds for completed/failed/other
  }
};

interface BotSession {
  session_id: string;
  user_id: string;
  status: string;
  verification_required: boolean;
  verification_expires_at?: string;
  total_jobs_processed: number;
  total_applications_sent: number;
  total_applications_failed: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  positions: string[];
  locations: string[];
  error_message?: string;
}

interface LinkedInSessionManagerProps {
  className?: string;
  onSessionChange?: () => void;
}

const LinkedInSessionManager: React.FC<LinkedInSessionManagerProps> = ({
  className = "",
  onSessionChange,
}) => {
  const [currentSession, setCurrentSession] = useState<BotSession | null>(null);
  const [sessions, setSessions] = useState<BotSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [polling, setPolling] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [submittingCode, setSubmittingCode] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/linkedin_bot/sessions", {
        withCredentials: true,
      });
      setSessions(response.data.sessions || []);

      // Find active session
      const active = response.data.sessions?.find(
        (s: BotSession) =>
          s.status === "running" ||
          s.status === "pending" ||
          s.status === "verification_required"
      );
      setCurrentSession(active || null);

      // Check if verification is needed
      if (active?.verification_required) {
        setShowVerificationDialog(true);
      }
    } catch (error: any) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Polling for active session status
  useEffect(() => {
    if (
      !currentSession ||
      currentSession.status === "completed" ||
      currentSession.status === "failed"
    ) {
      return;
    }

    setPolling(true);

    // Use adaptive polling interval based on status
    const pollInterval = getPollingInterval(currentSession.status);

    const interval = setInterval(async () => {
      try {
        const response = await axiosInstance.get(
          `/linkedin_bot/session/${currentSession.session_id}/status`,
          { withCredentials: true }
        );
        setCurrentSession(response.data);

        if (response.data.verification_required) {
          setShowVerificationDialog(true);
        }

        if (
          response.data.status === "completed" ||
          response.data.status === "failed" ||
          response.data.status === "stopped"
        ) {
          setPolling(false);
          onSessionChange?.();
          fetchSessions();
        }
      } catch (error) {
        console.error("Error polling session status:", error);
      }
    }, pollInterval);

    return () => {
      clearInterval(interval);
      setPolling(false);
    };
  }, [currentSession, fetchSessions, onSessionChange]);

  const startSession = async () => {
    try {
      setStarting(true);
      const response = await axiosInstance.post(
        "/linkedin_bot/session/start",
        {},
        { withCredentials: true }
      );
      setCurrentSession(response.data);
      toast.success("Bot session started!");
      onSessionChange?.();
    } catch (error: any) {
      console.error("Error starting session:", error);
      toast.error(error.response?.data?.detail || "Failed to start session");
    } finally {
      setStarting(false);
    }
  };

  const stopSession = async () => {
    if (!currentSession) return;

    try {
      setStopping(true);
      await axiosInstance.post(
        `/linkedin_bot/session/${currentSession.session_id}/stop`,
        {},
        { withCredentials: true }
      );
      toast.success("Bot session stopped!");
      fetchSessions();
      onSessionChange?.();
    } catch (error: any) {
      console.error("Error stopping session:", error);
      toast.error(error.response?.data?.detail || "Failed to stop session");
    } finally {
      setStopping(false);
    }
  };

  const submitVerificationCode = async () => {
    if (!currentSession || !verificationCode) return;

    try {
      setSubmittingCode(true);
      await axiosInstance.post(
        `/linkedin_bot/session/${currentSession.session_id}/verify`,
        { verification_code: verificationCode },
        { withCredentials: true }
      );
      toast.success("Verification code submitted!");
      setShowVerificationDialog(false);
      setVerificationCode("");
      fetchSessions();
    } catch (error: any) {
      console.error("Error submitting verification:", error);
      toast.error(error.response?.data?.detail || "Invalid verification code");
    } finally {
      setSubmittingCode(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return (
          <Badge className="bg-green-500">
            <Play className="h-3 w-3 mr-1" />
            Running
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "verification_required":
        return (
          <Badge className="bg-orange-500">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Verification Required
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case "stopped":
        return (
          <Badge variant="secondary">
            <Square className="h-3 w-3 mr-1" />
            Stopped
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoaderCircle className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Session Status */}
      {currentSession && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <StatusPulse status={currentSession.status} />
              <h4 className="font-semibold">Current Session</h4>
              {getStatusBadge(currentSession.status)}
              {polling && (
                <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
              )}
              {currentSession.verification_expires_at &&
                currentSession.status === "verification_required" && (
                  <span className="text-sm text-gray-500">
                    Expires in:{" "}
                    <VerificationTimer
                      expiresAt={currentSession.verification_expires_at}
                    />
                  </span>
                )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-2 bg-white dark:bg-gray-700 rounded">
              <p className="text-2xl font-bold text-blue-600">
                {currentSession.total_jobs_processed}
              </p>
              <p className="text-xs text-gray-500">Jobs Processed</p>
            </div>
            <div className="text-center p-2 bg-white dark:bg-gray-700 rounded">
              <p className="text-2xl font-bold text-green-600">
                {currentSession.total_applications_sent}
              </p>
              <p className="text-xs text-gray-500">Applications Sent</p>
            </div>
            <div className="text-center p-2 bg-white dark:bg-gray-700 rounded">
              <p className="text-2xl font-bold text-red-600">
                {currentSession.total_applications_failed}
              </p>
              <p className="text-xs text-gray-500">Failed</p>
            </div>
          </div>

          {/* Error message */}
          {currentSession.error_message && (
            <p className="text-sm text-red-500 mb-3">
              Error: {currentSession.error_message}
            </p>
          )}

          {/* Stop button */}
          {(currentSession.status === "running" ||
            currentSession.status === "pending") && (
            <Button
              variant="destructive"
              onClick={stopSession}
              disabled={stopping}
              className="w-full"
            >
              {stopping ? (
                <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Square className="h-4 w-4 mr-2" />
              )}
              Stop Session
            </Button>
          )}
        </div>
      )}

      {/* Start Session Button */}
      {(!currentSession ||
        ["completed", "failed", "stopped"].includes(currentSession.status)) && (
        <Button onClick={startSession} disabled={starting} className="w-full">
          {starting ? (
            <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Start Job Application Session
        </Button>
      )}

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-gray-600">
            Recent Sessions
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sessions.slice(0, 5).map((session) => (
              <div
                key={session.session_id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm"
              >
                <div className="flex items-center gap-2">
                  {getStatusBadge(session.status)}
                  <span className="text-gray-500">
                    {new Date(session.created_at).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-gray-600">
                  {session.total_applications_sent} applied
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification Dialog */}
      <Dialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>LinkedIn Verification Required</DialogTitle>
            <DialogDescription>
              LinkedIn is requesting a verification code. Please check your
              email and enter the 6-digit code below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowVerificationDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={submitVerificationCode}
              disabled={submittingCode || verificationCode.length !== 6}
            >
              {submittingCode ? (
                <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Submit Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LinkedInSessionManager;
