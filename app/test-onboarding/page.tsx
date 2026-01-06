"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
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
  RotateCcw,
  Sparkles,
  Mail,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type UserRole = "recruiter" | "candidate";

interface OnboardingData {
  userRole: UserRole | null;
  referralSource: string;
}

const TestOnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    userRole: null,
    referralSource: "",
  });
  const [file, setFile] = useState<File | null>(null);
  
  // Test mode: simulate claimable CV
  const [simulateClaimableCV, setSimulateClaimableCV] = useState(true);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  
  const mockClaimableCV = {
    _id: "mock-cv-123",
    parsed_cv: {
      name: "John Doe",
      email: "john@example.com",
      position: "Senior Software Engineer"
    }
  };

  const totalSteps = 3;

  const handleRoleSelect = (role: UserRole) => {
    setOnboardingData((prev) => ({ ...prev, userRole: role }));
  };

  const handleNext = () => {
    if (currentStep === 0 && !onboardingData.userRole) {
      toast.error("Please select how you'll use Resume AI");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Welcome to Resume AI!");
    setIsSubmitting(false);
    setCurrentStep(3); // Completion
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const handleMockClaim = async () => {
    setIsClaiming(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsClaiming(false);
    setHasClaimed(true);
    toast.success("Resume claimed successfully!");
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setOnboardingData({ userRole: null, referralSource: "" });
    setFile(null);
    setHasClaimed(false);
    setIsClaiming(false);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Test Mode Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900 px-4 py-2">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-amber-700 dark:text-amber-400 text-sm font-medium">Test Mode</span>
            </div>
            <button
              onClick={() => setSimulateClaimableCV(!simulateClaimableCV)}
              className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 hover:opacity-80"
            >
              {simulateClaimableCV ? (
                <ToggleRight className="h-4 w-4" />
              ) : (
                <ToggleLeft className="h-4 w-4" />
              )}
              Claimable CV
            </button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetDemo}
            className="text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 h-7 text-xs"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>
        </div>
      </div>

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
            <span className="text-xl font-semibold text-foreground">Resume AI</span>
          </div>
        </div>

        {/* Progress */}
        {currentStep < 3 && (
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
                    {step < currentStep ? <Check className="h-4 w-4" /> : step + 1}
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
        )}

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
            {currentStep === 0 && (
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
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        onboardingData.userRole === "recruiter" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        <Users className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">I'm a Recruiter</h3>
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
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        onboardingData.userRole === "candidate" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        <User className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">I'm a Candidate</h3>
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

                <Button 
                  onClick={handleNext} 
                  className="w-full"
                  disabled={!onboardingData.userRole}
                >
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Role-specific */}
            {currentStep === 1 && (
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
                          <h3 className="font-semibold text-foreground">Free</h3>
                          <span className="text-2xl font-bold text-foreground">$0</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Try Resume AI with basic features
                        </p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" /> 1 CV upload
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" /> Basic search
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" /> Email support
                          </li>
                        </ul>
                      </Card>

                      {/* Premium Plan */}
                      <Card className="p-5 border-2 border-primary bg-primary/5 relative">
                        <div className="absolute -top-3 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded">
                          Recommended
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-foreground">Premium</h3>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-foreground">$99</span>
                            <span className="text-muted-foreground text-sm">/year</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Everything you need to hire efficiently
                        </p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" /> Unlimited uploads
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" /> Advanced AI search
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" /> Team collaboration
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" /> Priority support
                          </li>
                        </ul>
                      </Card>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                      You can always change your plan later
                    </p>
                  </>
                ) : (
                  // Candidate: Check for claimable CV or Upload
                  <>
                    {simulateClaimableCV && !hasClaimed ? (
                      // Found a claimable CV (simulated)
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
                            A recruiter has already uploaded your resume. Claim it to get started instantly!
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
                                {mockClaimableCV.parsed_cv.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {mockClaimableCV.parsed_cv.position}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {mockClaimableCV.parsed_cv.email}
                              </p>
                            </div>
                          </div>
                          <Button 
                            onClick={handleMockClaim}
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
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    className="flex-1"
                    disabled={isClaiming}
                  >
                    {onboardingData.userRole === "candidate" && !file && !hasClaimed ? "Skip" : "Continue"}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Referral Source */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-semibold text-foreground">
                    One last thing
                  </h1>
                  <p className="text-muted-foreground">
                    How did you hear about us?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {referralSources.map((source) => (
                    <button
                      key={source}
                      onClick={() => setOnboardingData(prev => ({ ...prev, referralSource: source }))}
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
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleComplete} 
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        Get Started
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Or{" "}
                  <button 
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="text-primary hover:underline"
                  >
                    skip this step
                  </button>
                </p>
              </div>
            )}

            {/* Completion */}
            {currentStep === 3 && (
              <div className="text-center space-y-6 py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold text-foreground">
                    You're all set!
                  </h1>
                  <p className="text-muted-foreground">
                    Welcome to Resume AI. Let's get started.
                  </p>
                </div>

                <Card className="p-4 text-left">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Summary</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-foreground">
                      Role: <span className="font-medium capitalize">{onboardingData.userRole}</span>
                    </p>
                    {onboardingData.userRole === "candidate" && (
                      <p className="text-foreground">
                        Resume: <span className="font-medium">
                          {hasClaimed ? "Claimed existing CV" : file ? file.name : "Skipped"}
                        </span>
                      </p>
                    )}
                    {onboardingData.referralSource && (
                      <p className="text-foreground">
                        Referral: <span className="font-medium">{onboardingData.referralSource}</span>
                      </p>
                    )}
                  </div>
                </Card>

                <Button onClick={resetDemo} className="w-full">
                  Go to Dashboard
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TestOnboardingPage;
