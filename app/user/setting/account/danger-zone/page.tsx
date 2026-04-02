"use client";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axiosInstance from "@/utils/axiosConfig";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ViewState =
  | "idle"           // No pending deletion — show request form
  | "pending"        // Deletion pending (has valid token) — show confirm form
  | "loading"        // Loading status
  | "email_sent"     // Request submitted — check inbox
  | "confirmed"      // Deletion confirmed
  | "cancelled"      // Deletion cancelled
  | "error";         // Something went wrong

function DangerZoneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [viewState, setViewState] = useState<ViewState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check deletion status on mount — token in URL means we're confirming
  useEffect(() => {
    if (token) {
      confirmWithToken(token);
    } else {
      checkStatus();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkStatus = async () => {
    setViewState("loading");
    try {
      const res = await axiosInstance.get("/user/account/deletion-status");
      if (res.data.deletion_pending) {
        setViewState("pending");
      } else {
        setViewState("idle");
      }
    } catch {
      // Not authenticated or other error — show request form
      setViewState("idle");
    }
  };

  const requestDeletion = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await axiosInstance.post("/user/account/request-deletion");
      setViewState("email_sent");
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Failed to send deletion email";
      setErrorMessage(detail);
      toast.error(detail);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmWithToken = async (deletionToken: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      // Verify token is still valid
      const res = await axiosInstance.get("/user/account/deletion-status");
      if (!res.data.deletion_pending) {
        setErrorMessage("This deletion link has expired or was already used. Please request a new one.");
        setViewState("error");
        setIsProcessing(false);
        return;
      }
      setViewState("pending");
    } catch {
      setErrorMessage("Unable to verify deletion token. It may have expired.");
      setViewState("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDeletion = async () => {
    if (!token) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await axiosInstance.post("/user/account/confirm-deletion", { token });
      setViewState("confirmed");
      toast.success("Account deletion scheduled. We're sorry to see you go.");
      setTimeout(() => router.push("/"), 3000);
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Failed to confirm deletion";
      setErrorMessage(detail);
      toast.error(detail);
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelDeletion = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await axiosInstance.delete("/user/account/cancel-deletion");
      setViewState("cancelled");
      toast.success("Deletion request cancelled. Your account is safe.");
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Failed to cancel deletion";
      setErrorMessage(detail);
      toast.error(detail);
    } finally {
      setIsProcessing(false);
    }
  };

  if (viewState === "loading") {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // Email sent — confirmation pending
  if (viewState === "email_sent") {
    return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col gap-2 mb-8">
          <h2 className="text-2xl font-bold text-black dark:text-white">Check Your Inbox</h2>
          <p className="text-gray-600 dark:text-gray-400">
            We sent a confirmation link to your email address.
          </p>
        </div>
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 max-w-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <Mail className="h-10 w-10 text-blue-500" />
              <div>
                <p className="font-medium text-black dark:text-white">
                  Click the link in your email to confirm deletion
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  The confirmation link expires in 60 minutes. If you don&apos;t see the email, check your spam folder.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-100 dark:border-gray-800 pt-4">
            <Button
              variant="outline"
              onClick={() => setViewState("idle")}
              className="border-gray-300 dark:border-gray-700"
            >
              I didn&apos;t receive the email — try again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Deletion confirmed after token click
  if (viewState === "confirmed") {
    return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col gap-2 mb-8">
          <h2 className="text-2xl font-bold text-black dark:text-white">Account Deletion Scheduled</h2>
        </div>
        <Card className="bg-white dark:bg-gray-900 border border-green-200 dark:border-green-900 max-w-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <div>
                <p className="font-medium text-black dark:text-white">
                  Your account has entered a 14-day grace period
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  You are being logged out. Contact support within 14 days to recover your account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Deletion cancelled
  if (viewState === "cancelled") {
    return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col gap-2 mb-8">
          <h2 className="text-2xl font-bold text-black dark:text-white">Deletion Cancelled</h2>
        </div>
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 max-w-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <XCircle className="h-10 w-10 text-gray-400" />
              <div>
                <p className="font-medium text-black dark:text-white">
                  Your account deletion has been cancelled
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Your account remains active. You can request deletion again at any time.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-100 dark:border-gray-800 pt-4">
            <Button
              variant="outline"
              onClick={() => setViewState("idle")}
              className="border-gray-300 dark:border-gray-700"
            >
              Back to account settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Error state
  if (viewState === "error") {
    return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col gap-2 mb-8">
          <h2 className="text-2xl font-bold text-black dark:text-white">Unable to Proceed</h2>
        </div>
        <Card className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900 max-w-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <XCircle className="h-10 w-10 text-red-500" />
              <div>
                <p className="font-medium text-black dark:text-white">{errorMessage}</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Please request a new deletion or contact support.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setViewState("idle");
                setErrorMessage(null);
              }}
              className="border-gray-300 dark:border-gray-700"
            >
              Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Pending deletion — token was valid, show confirm form
  if (viewState === "pending" && token) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col gap-2 mb-8">
          <h2 className="text-2xl font-bold text-black dark:text-white">Confirm Account Deletion</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You are about to delete your account. This action cannot be undone.
          </p>
        </div>
        <Card className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900 max-w-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <CardTitle className="text-lg text-red-700 dark:text-red-400">
                Delete your account
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Once you confirm, your account enters a <strong>14-day grace period</strong>. During this time, you can contact support to recover your account. After 14 days, all data is permanently deleted and cannot be recovered.
            </p>
            <div className="rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 p-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>This will:</strong> Permanently delete your profile, resumes, subscriptions, and all account data.
              </p>
            </div>
            {errorMessage && (
              <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
            )}
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button
              variant="destructive"
              onClick={confirmDeletion}
              disabled={isProcessing}
              className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isProcessing ? "Deleting..." : "Yes, delete my account"}
            </Button>
            <Button
              variant="outline"
              onClick={cancelDeletion}
              disabled={isProcessing}
              className="border-gray-300 dark:border-gray-700"
            >
              Cancel deletion request
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Idle — show request form
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Danger Zone
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Irreversible actions for your account.
        </p>
      </div>

      <Card className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900 max-w-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <CardTitle className="text-lg text-red-700 dark:text-red-400">
              Delete Account
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This will permanently delete your account and all associated data.
            After confirmation, you have a <strong>14-day grace period</strong> before
            permanent deletion. You can contact support to recover your account during this period.
          </p>
          {errorMessage && (
            <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="destructive"
            onClick={requestDeletion}
            disabled={isProcessing}
            className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isProcessing ? "Sending..." : "Request account deletion"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function DangerZonePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    }>
      <DangerZoneContent />
    </Suspense>
  );
}
