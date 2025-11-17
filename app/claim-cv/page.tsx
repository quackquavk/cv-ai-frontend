"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserContext } from "@/context/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosConfig";
import {
  FileText,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface ClaimResponse {
  message: string;
  cv_id: string;
  cv: {
    _id: string;
    parsed_cv: {
      name?: string;
      email?: string;
      phone?: string;
      summary?: string;
      experience?: Array<{
        company: string;
        position: string;
        duration: string;
      }>;
      education?: Array<{
        institution: string;
        degree: string;
        year?: string;
      }>;
      skills?: string[];
    };
    created_at: string;
  };
}

interface TokenInfo {
  valid: boolean;
  error?: string;
}

export default function ClaimCVPage() {
  const { user, loading: userLoading } = useContext(UserContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [claiming, setClaiming] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [cvData, setCvData] = useState<ClaimResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokenValidated, setTokenValidated] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError("No claim token provided. Please use the link from your email.");
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      // First, let's check if the token is valid by calling a validation endpoint if it exists
      // For now, we'll proceed to the claim endpoint and let it handle validation
      setTokenValidated(true);
    } catch (error: any) {
      console.error("Error validating token:", error);
      setError(error.response?.data?.detail || "Invalid token");
      setTokenValidated(false);
    }
  };

  const handleClaimCV = async () => {
    if (!user) {
      toast.error("Please log in to claim your CV");
      router.push("/auth/login");
      return;
    }

    if (!token || !tokenValidated) {
      toast.error("Invalid or missing claim token");
      return;
    }

    try {
      setClaiming(true);
      setError(null);

      const response = await axiosInstance.post(`/cv-claim/claim-with-token?token=${encodeURIComponent(token)}`);
      const data: ClaimResponse = response.data;

      setCvData(data);
      toast.success("CV claimed successfully!");

      // Redirect to the claimed CV page after a short delay
      setTimeout(() => {
        router.push(`/dashboard/candidate`);
      }, 2000);
    } catch (error: any) {
      console.error("Error claiming CV:", error);
      setError(error.response?.data?.detail || "Failed to claim CV");

      // Specific error handling
      if (error.response?.data?.detail) {
        const errorMessage = error.response.data.detail;
        if (errorMessage.includes("email does not match")) {
          toast.error("The email on your account doesn't match the email this CV was sent to. Please log in with the correct email address.");
        } else if (errorMessage.includes("already claimed a CV")) {
          toast.error("You have already claimed a CV. Each user can only claim one CV.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Failed to claim CV. Please try again or contact support.");
      }
    } finally {
      setClaiming(false);
    }
  };

  const handleLogin = () => {
    // Store the token in sessionStorage so we can come back after login
    if (token) {
      sessionStorage.setItem('claimToken', token);
    }
    router.push('/auth/login');
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.get("/user/logout");
      // UserContext will handle the logout state update
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out");
    }
  };

  // Check if we came from login with a stored token
  useEffect(() => {
    const storedToken = sessionStorage.getItem('claimToken');
    if (storedToken && !token && user) {
      // We have a user and a stored token but no token in URL - this shouldn't happen, but handle it
      sessionStorage.removeItem('claimToken');
    }
  }, [token, user]);

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">No Token Provided</CardTitle>
            <CardDescription className="text-muted-foreground">
              Please use the claim link from your email or make sure you have the complete URL.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm-muted-foreground">
              The link should look like:
              <br />
              <code className="text-xs bg-muted p-2 rounded">
                {typeof window !== 'undefined' ? window.location.origin : ''}/claim-cv?token=your-token-here
              </code>
            </div>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Login Required</CardTitle>
            <CardDescription className="text-muted-foreground">
              You need to be logged in to claim your CV using the token from your email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm-muted-foreground text-center">
              The email containing your claim link is associated with: <strong>{user?.email || 'your email address'}</strong>
            </p>
            <Button onClick={handleLogin} className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Log In to Claim CV
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cvData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-border">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 dark:bg-green-500/20">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-xl text-green-800 dark:text-green-400">CV Claimed Successfully!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your CV has been successfully claimed and added to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">CV Details:</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Name:</span>{cvData.cv.parsed_cv.name || 'No name provided'}
                </div>
                {cvData.cv.parsed_cv.email && (
                  <div>
                    <span className="font-medium">Email:</span>{cvData.cv.parsed_cv.email}
                  </div>
                )}
                <div>
                  <span className="font-medium">CV ID:</span>
                  <code className="text-xs bg-background border border-border p-1 rounded">{cvData.cv_id}</code>
                </div>
                {cvData.cv.parsed_cv.summary && (
                  <div>
                    <span className="font-medium">Summary:</span>
                    <p className="mt-1">{cvData.cv.parsed_cv.summary}</p>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm-muted-foreground text-center">
              Redirecting you to your CV in a moment...
            </p>
            <Button
              onClick={() => router.push(`/dashboard/candidate`)}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Your CV
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-border">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Claim Your CV</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter the claim token from your email to claim ownership of your CV.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium">Error</span>
              </div>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">Claim Token:</h4>
            </div>
            <div className="font-mono text-sm bg-background border border-border p-2 rounded break-all">
              {token}
            </div>
            <div className="text-xs-muted-foreground mt-2">
              This token is valid for 7 days and can only be used once.
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="flex items-center gap-2 text-sm-muted-foreground justify-center">
              <User className="h-4 w-4" />
              <span>
                Claiming as: <strong>{user.email}</strong>
              </span>
            </div>
           
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleClaimCV}
              disabled={claiming || !tokenValidated}
              className="flex-1"
              size="lg"
            >
              {claiming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Claiming...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Claim My CV
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              disabled={claiming}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

          
        </CardContent>
      </Card>
    </div>
  );
}