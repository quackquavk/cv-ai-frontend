"use client";
import { useState, useContext, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosConfig";
import {
  Users,
  User,
  ChevronRight,
  ChevronLeft,
  Check,
  Upload,
  FileText,
  Search,
  Briefcase,
  Target,
  X,
  LoaderCircle,
  FolderOpen,
  Sparkles,
  Mail,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { freeFeatures, premiumFeatures } from "@/app/user/setting/constants";

export type UserRole = "recruiter" | "candidate";

interface OnboardingData {
  userRole: UserRole | null;
  referralSource: string;
}

interface FolderData {
  folder_id: string;
  folder_name: string;
}

interface ClaimableCV {
  _id: string;
  parsed_cv?: {
    name?: string;
    email?: string;
    position?: string;
  };
}

const OnboardingPage = () => {
  const router = useRouter();
  const userContext = useContext(UserContext);
  const { user, loading, isAuthenticated, refreshUser } = userContext || {};

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    userRole: null,
    referralSource: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);

  // Claimable CV state
  const [claimableCV, setClaimableCV] = useState<ClaimableCV | null>(null);
  const [isCheckingClaimable, setIsCheckingClaimable] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  const totalSteps = 3;

  // Redirect if not authenticated or already onboarded
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
    } else if (!loading && user?.onboarding_completed) {
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, user, router]);

  // Fetch folders for candidate upload
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await axiosInstance.get("/folder/getAllFolders");
        setFolders(response.data);
        if (response.data.length > 0) {
          setSelectedFolderId(response.data[0].folder_id);
        }
      } catch (error) {
        console.error("Error fetching folders:", error);
      } finally {
        setIsLoadingFolders(false);
      }
    };
    if (isAuthenticated) {
      fetchFolders();
    }
  }, [isAuthenticated]);

  // Check for claimable CV when user selects candidate and moves to step 1
  useEffect(() => {
    const checkClaimableCV = async () => {
      if (
        currentStep === 1 &&
        onboardingData.userRole === "candidate" &&
        isAuthenticated
      ) {
        setIsCheckingClaimable(true);
        try {
          const response = await axiosInstance.get(
            "/cv-claim/get_claimable_cv",
            {
              withCredentials: true,
            }
          );
          if (response.data && response.data._id) {
            setClaimableCV(response.data);
          }
        } catch (error: any) {
          // 404 means no claimable CV found - that's fine
          if (error.response?.status !== 404) {
            console.error("Error checking claimable CV:", error);
          }
          setClaimableCV(null);
        } finally {
          setIsCheckingClaimable(false);
        }
      }
    };
    checkClaimableCV();
  }, [currentStep, onboardingData.userRole, isAuthenticated]);

  const handleRoleSelect = (role: UserRole) => {
    setOnboardingData((prev) => ({ ...prev, userRole: role }));
  };

  const handlePurchase = async () => {
    if (!onboardingData.userRole) return;

    try {
      // Save onboarding data first
      await axiosInstance.post(
        "/user/onboarding",
        {
          user_role: onboardingData.userRole,
          referral_source: onboardingData.referralSource || null,
        },
        { withCredentials: true }
      );

      const response = await axiosInstance.post(
        "/payment/create-checkout-session",
        {
          plan_id: "annual",
          tier: "premium",
          success_url: window.location.origin + "/dashboard",
          cancel_url: window.location.origin + "/onboarding",
        },
        { withCredentials: true }
      );

      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(
        error.response?.data?.detail || "Failed to initiate purchase"
      );
    }
  };

  const handleNext = () => {
    // Step 2 (Index 1): Role Selection
    if (currentStep === 1 && !onboardingData.userRole) {
      toast.error("Please select how you'll use Resume AI");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const uploadFile = async () => {
    if (!file || !selectedFolderId) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("is_claiming", "true");

      await axiosInstance.post(
        `/document/document?folder_id=${selectedFolderId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      toast.success("Resume uploaded successfully!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.detail || "Failed to upload resume");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClaimCV = async () => {
    if (!claimableCV?._id) return;

    setIsClaiming(true);
    try {
      await axiosInstance.post(
        `/cv-claim/claim?document_id=${claimableCV._id}`,
        {},
        { withCredentials: true }
      );
      setHasClaimed(true);
      toast.success("Resume claimed successfully!");
    } catch (error: any) {
      console.error("Claim error:", error);
      toast.error(error.response?.data?.detail || "Failed to claim resume");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleComplete = async () => {
    if (!onboardingData.userRole) {
      toast.error("Please select a role");
      setCurrentStep(0);
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload file if candidate has one and hasn't claimed
      if (
        onboardingData.userRole === "candidate" &&
        file &&
        selectedFolderId &&
        !hasClaimed
      ) {
        await uploadFile();
      }

      // Complete onboarding
      await axiosInstance.post(
        "/user/onboarding",
        {
          user_role: onboardingData.userRole,
          referral_source: onboardingData.referralSource || null,
        },
        { withCredentials: true }
      );

      if (refreshUser) {
        await refreshUser();
      }

      toast.success("Welcome to Resume AI!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error completing onboarding:", error);
      toast.error(error.response?.data?.detail || "Failed to complete setup");
    } finally {
      setIsSubmitting(false);
    }
  };

  const referralSources = [
    "Google Search",
    "Friend or Colleague",
    "LinkedIn",
    "Twitter / X",
    "YouTube",
    "Blog / Article",
    "Other",
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden">
              <Image
                src="/assets/logo.png"
                alt="Resume AI"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <span className="text-xl font-semibold text-foreground">
              Resume AI
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[0, 1, 2].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step < currentStep
                      ? "bg-primary text-primary-foreground"
                      : step === currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step + 1
                  )}
                </div>
                {step < 2 && (
                  <div
                    className={`w-12 h-0.5 mx-1 ${
                      step < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 1: Role Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-semibold text-foreground">
                    How will you use Resume AI?
                  </h1>
                  <p className="text-muted-foreground">
                    We'll personalize your experience based on your selection
                  </p>
                </div>

                <div className="grid gap-4">
                  {/* Recruiter Option */}
                  <button
                    onClick={() => handleRoleSelect("recruiter")}
                    className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                      onboardingData.userRole === "recruiter"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          onboardingData.userRole === "recruiter"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Users className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">
                            I'm a Recruiter
                          </h3>
                          {onboardingData.userRole === "recruiter" && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Find and manage candidates with AI-powered tools
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                            <Search className="h-3 w-3" /> AI Search
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                            <FileText className="h-3 w-3" /> Bulk Processing
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                            <Target className="h-3 w-3" /> Skill Matching
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Candidate Option */}
                  <button
                    onClick={() => handleRoleSelect("candidate")}
                    className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                      onboardingData.userRole === "candidate"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          onboardingData.userRole === "candidate"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <User className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">
                            I'm a Candidate
                          </h3>
                          {onboardingData.userRole === "candidate" && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Optimize your resume and find your dream job
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                            <FileText className="h-3 w-3" /> ATS Optimizer
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                            <Target className="h-3 w-3" /> Job Matching
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                            <Briefcase className="h-3 w-3" /> Auto Apply
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="flex-1"
                    disabled={!onboardingData.userRole}
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Role-specific */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {onboardingData.userRole === "recruiter" ? (
                  // Recruiter: Show plans
                  <>
                    <div className="text-center space-y-2">
                      <h1 className="text-2xl font-semibold text-foreground">
                        Choose your plan
                      </h1>
                      <p className="text-muted-foreground">
                        Start free, upgrade when you need more
                      </p>
                    </div>

                    <div className="grid gap-4">
                      {/* Free Plan */}
                      <Card className="p-5 border-2 hover:border-muted-foreground/50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-foreground">
                            Free
                          </h3>
                          <span className="text-2xl font-bold text-foreground">
                            $0
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Try Resume AI with basic features
                        </p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {freeFeatures.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />{" "}
                              {feature.text}
                            </li>
                          ))}
                        </ul>
                      </Card>

                      {/* Premium Plan */}
                      <Card className="p-5 border-2 border-primary bg-primary/5 relative">
                        <div className="absolute -top-3 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded">
                          Recommended
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-foreground">
                            Premium
                          </h3>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-foreground">
                              $99
                            </span>
                            <span className="text-muted-foreground text-sm">
                              /year
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Everything you need to hire efficiently
                        </p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {premiumFeatures.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />{" "}
                              {feature.text}
                            </li>
                          ))}
                        </ul>
                        <Button
                          onClick={handlePurchase}
                          className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Purchase Plan
                        </Button>
                      </Card>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                      You can always change your plan later in settings
                    </p>
                  </>
                ) : (
                  // Candidate: Check for claimable CV or Upload
                  <>
                    {isCheckingClaimable ? (
                      // Loading state while checking for claimable CV
                      <div className="space-y-6">
                        <div className="text-center space-y-2">
                          <h1 className="text-2xl font-semibold text-foreground">
                            Checking for your resume...
                          </h1>
                          <p className="text-muted-foreground">
                            We're looking to see if your resume is already in
                            our system
                          </p>
                        </div>
                        <div className="flex justify-center py-8">
                          <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      </div>
                    ) : claimableCV && !hasClaimed ? (
                      // Found a claimable CV
                      <div className="space-y-6">
                        <div className="text-center space-y-2">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium mb-2">
                            <Sparkles className="h-4 w-4" />
                            Resume Found!
                          </div>
                          <h1 className="text-2xl font-semibold text-foreground">
                            We found your resume
                          </h1>
                          <p className="text-muted-foreground">
                            A recruiter has already uploaded your resume. Claim
                            it to get started instantly!
                          </p>
                        </div>

                        {/* Claimable CV Card */}
                        <Card className="p-5 border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <FileText className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground">
                                {claimableCV.parsed_cv?.name || "Your Resume"}
                              </h3>
                              {claimableCV.parsed_cv?.position && (
                                <p className="text-sm text-muted-foreground">
                                  {claimableCV.parsed_cv.position}
                                </p>
                              )}
                              {claimableCV.parsed_cv?.email && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {claimableCV.parsed_cv.email}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={handleClaimCV}
                            disabled={isClaiming}
                            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                          >
                            {isClaiming ? (
                              <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                Claiming...
                              </>
                            ) : (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Claim This Resume
                              </>
                            )}
                          </Button>
                        </Card>

                        {/* Divider */}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                              or upload a different resume
                            </span>
                          </div>
                        </div>

                        {/* Upload option */}
                        <Card className="p-6">
                          <label className="flex flex-col items-center justify-center cursor-pointer">
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                            <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Upload a different resume
                            </p>
                          </label>
                        </Card>
                      </div>
                    ) : hasClaimed ? (
                      // Successfully claimed
                      <div className="space-y-6">
                        <div className="text-center space-y-2">
                          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                            <Check className="h-8 w-8 text-green-600" />
                          </div>
                          <h1 className="text-2xl font-semibold text-foreground">
                            Resume claimed!
                          </h1>
                          <p className="text-muted-foreground">
                            Your resume is now linked to your account
                          </p>
                        </div>
                      </div>
                    ) : (
                      // No claimable CV - show upload
                      <div className="space-y-6">
                        <div className="text-center space-y-2">
                          <h1 className="text-2xl font-semibold text-foreground">
                            Upload your resume
                          </h1>
                          <p className="text-muted-foreground">
                            Our AI will analyze it and help you improve
                          </p>
                        </div>

                        {/* Folder Selection */}
                        {!isLoadingFolders && folders.length > 0 && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                              Save to folder
                            </label>
                            <Select
                              value={selectedFolderId || ""}
                              onValueChange={setSelectedFolderId}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a folder" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {folders.map((folder) => (
                                    <SelectItem
                                      key={folder.folder_id}
                                      value={folder.folder_id}
                                    >
                                      <div className="flex items-center gap-2">
                                        <FolderOpen className="h-4 w-4" />
                                        <span>{folder.folder_name}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <Card className="p-8">
                          {!file ? (
                            <label className="flex flex-col items-center justify-center cursor-pointer">
                              <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileSelect}
                                className="hidden"
                              />
                              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <p className="font-medium text-foreground mb-1">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-sm text-muted-foreground">
                                PDF only, max 10MB
                              </p>
                            </label>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-foreground truncate max-w-[200px]">
                                    {file.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => setFile(null)}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                              >
                                <X className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </div>
                          )}
                        </Card>

                        <p className="text-center text-sm text-muted-foreground">
                          You can skip this and upload later
                        </p>
                      </div>
                    )}
                  </>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    className="flex-1"
                    disabled={
                      isCheckingClaimable ||
                      isClaiming ||
                      isSubmitting ||
                      isUploading
                    }
                  >
                    {isSubmitting || isUploading ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        {isUploading ? "Uploading..." : "Setting up..."}
                      </>
                    ) : (
                      <>
                        Get Started
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Referral Source */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-semibold text-foreground">
                    Let's get started
                  </h1>
                  <p className="text-muted-foreground">
                    How did you hear about us?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {referralSources.map((source) => (
                    <button
                      key={source}
                      onClick={() =>
                        setOnboardingData((prev) => ({
                          ...prev,
                          referralSource: source,
                        }))
                      }
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        onboardingData.referralSource === source
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border text-muted-foreground hover:border-muted-foreground/50 hover:bg-muted/50"
                      }`}
                    >
                      {source}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleNext} className="w-full">
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Or{" "}
                  <button
                    onClick={handleNext}
                    className="text-primary hover:underline"
                  >
                    skip this step
                  </button>
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingPage;
