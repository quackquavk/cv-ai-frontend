"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/UserContext";
import axiosInstance from "@/utils/axiosConfig";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  LogIn,
  FileText,
  Upload,
  Loader2,
} from "lucide-react";
import Image from "next/image";

interface AuthGuardProps {
  children: React.ReactNode;
  /**
   * If true, the guard also checks whether the user has a claimed CV.
   * If false, only authentication is checked.
   * Defaults to true.
   */
  requireCV?: boolean;
  /**
   * Custom fallback UI rendered when auth passes but CV check fails.
   * If not provided, a default "upload CV" prompt is shown.
   */
  fallback?: React.ReactNode;
}

export default function AuthGuard({
  children,
  requireCV = true,
  fallback,
}: AuthGuardProps) {
  const router = useRouter();
  const userContext = useContext(UserContext);
  const { isAuthenticated, loading: authLoading } = userContext || {
    isAuthenticated: false,
    loading: true,
  };

  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [hasClaimedCV, setHasClaimedCV] = useState<boolean | null>(null);
  const [cvLoading, setCvLoading] = useState(false);

  // Show login dialog when auth loads and user is not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setShowLoginDialog(true);
    } else {
      setShowLoginDialog(false);
    }
  }, [authLoading, isAuthenticated]);

  // Check CV claim status when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setHasClaimedCV(false);
      return;
    }

    if (!requireCV) {
      setHasClaimedCV(true);
      return;
    }

    const checkClaimedCV = async () => {
      try {
        setCvLoading(true);
        const response = await axiosInstance.get("/cv-claim/has_claimed_cv", {
          withCredentials: true,
        });
        setHasClaimedCV(response.data === true);
      } catch {
        setHasClaimedCV(false);
      } finally {
        setCvLoading(false);
      }
    };

    checkClaimedCV();
  }, [isAuthenticated, requireCV]);

  const handleGoogleLogin = () => {
    const googleLogin =
      process.env.NEXT_PUBLIC_API_BASE_URL + "/user/google/login";
    window.location.href = googleLogin;
  };

  // Not yet determined — show nothing while checking
  if (authLoading || (requireCV && cvLoading) || hasClaimedCV === null) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not authenticated — show login dialog
  if (!isAuthenticated) {
    return (
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-muted-foreground" />
              Login Required
            </DialogTitle>
            <DialogDescription>
              Please log in to access this feature.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <Image
                src="/assets/logo.webp"
                alt="Resume AI Logo"
                width={48}
                height={48}
                className="rounded-lg"
              />
              <div>
                <p className="font-medium">Resume AI</p>
                <p className="text-sm text-muted-foreground">
                  Build your career profile
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleGoogleLogin} className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Login with Google
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Authenticated but no CV claimed (and CV is required)
  if (requireCV && !hasClaimedCV) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="container mx-auto py-6 px-4">
        <Card className="border-dashed max-w-xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Upload your resume first
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              You need to upload and claim your master CV before using this
              feature. Your CV powers the job search tools.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/candidate")}
              >
                View Profile
              </Button>
              <Button onClick={() => router.push("/dashboard/my-resume")}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Resume
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All checks passed — render children
  return <>{children}</>;
}
