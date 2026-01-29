"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  FileText,
  Download,
  Loader2,
  ChevronRight,
  Home,
  User,
  AlertCircle,
  Crown,
  LogIn,
} from "lucide-react";
import { UserContext } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ResumeCard } from "./components/ResumeCard";
import {
  resumeApi,
  ResumeListItem,
  getEmptyResumeData,
} from "./services/resumeApi";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosConfig";

export default function ResumesPage() {
  const router = useRouter();
  const userContext = useContext(UserContext);
  const { isAuthenticated, loading: authLoading } = userContext || {
    isAuthenticated: false,
    loading: true,
  };

  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [hasClaimedCV, setHasClaimedCV] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [resumeLimit, setResumeLimit] = useState<{
    allowed: boolean;
    isPremium: boolean;
    current: number;
    max: number;
  } | null>(null);

  // Show login dialog if user is not authenticated after loading
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setShowLoginDialog(true);
    } else {
      setShowLoginDialog(false);
    }
  }, [authLoading, isAuthenticated]);

  const fetchResumes = async () => {
    try {
      setIsLoading(true);
      const data = await resumeApi.list();
      setResumes(data);
    } catch (error) {
      toast.error("Failed to load resumes");
    } finally {
      setIsLoading(false);
    }
  };

  const checkClaimedCV = async () => {
    try {
      const response = await axiosInstance.get("/cv-claim/has_claimed_cv", {
        withCredentials: true,
      });
      setHasClaimedCV(response.data === true);
    } catch (error) {
      setHasClaimedCV(false);
    }
  };

  const checkResumeLimit = async () => {
    try {
      const response = await axiosInstance.get("/resume/limit", {
        withCredentials: true,
      });
      setResumeLimit({
        allowed: response.data.allowed,
        isPremium: response.data.is_premium,
        current: response.data.current_resumes || 0,
        max: response.data.max_resumes || 5,
      });
    } catch (error) {
      setResumeLimit({ allowed: true, isPremium: false, current: 0, max: 5 });
    }
  };

  useEffect(() => {
    fetchResumes();
    checkClaimedCV();
    checkResumeLimit();
  }, []);

  const handleCreateResume = async () => {
    if (!newResumeTitle.trim()) {
      toast.error("Please enter a resume title");
      return;
    }

    try {
      setIsCreating(true);
      const resume = await resumeApi.create(newResumeTitle.trim());
      toast.success("Resume created successfully");
      setShowCreateDialog(false);
      setNewResumeTitle("");
      router.push(`/dashboard/resumes/${resume.resume_id}`);
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error(error.response?.data?.detail || "Resume limit reached");
        checkResumeLimit(); // Refresh limit status
      } else {
        toast.error("Failed to create resume");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportFromCV = async () => {
    try {
      setIsImporting(true);

      // Fetch the claimed CV
      const response = await axiosInstance.get("/cv-claim/get_cv", {
        withCredentials: true,
      });

      if (!response.data?.parsed_cv) {
        toast.error("No claimed CV found");
        return;
      }

      const cv = response.data.parsed_cv;

      // Create resume with pre-filled data from CV
      const resumeData = getEmptyResumeData();

      // Map CV fields to resume basics
      resumeData.basics.name = cv.name || "";
      resumeData.basics.headline = cv.position || "";
      resumeData.basics.email = cv.email || "";
      resumeData.basics.phone = cv.phone_number || "";
      resumeData.basics.location = cv.address || "";

      // Map URL if available
      if (cv.website) {
        resumeData.basics.url = { label: "Website", href: cv.website };
      }

      // Map summary
      if (cv.summary) {
        resumeData.sections.summary.content = cv.summary;
      }

      // Map profiles
      const profiles = [];
      if (cv.linkedin_url) {
        profiles.push({
          id: crypto.randomUUID(),
          visible: true,
          network: "LinkedIn",
          username: cv.linkedin_url.split("/").pop() || "",
          icon: "linkedin",
          url: { label: "LinkedIn", href: cv.linkedin_url },
        });
      }
      if (cv.git_url) {
        profiles.push({
          id: crypto.randomUUID(),
          visible: true,
          network: "GitHub",
          username: cv.git_url.split("/").pop() || "",
          icon: "github",
          url: { label: "GitHub", href: cv.git_url },
        });
      }
      if (profiles.length > 0) {
        resumeData.sections.profiles.items = profiles;
      }

      // Map skills
      if (cv.skills && Array.isArray(cv.skills)) {
        resumeData.sections.skills.items = cv.skills
          .slice(0, 20)
          .map((skill: string) => ({
            id: crypto.randomUUID(),
            visible: true,
            name: skill,
            description: "",
            level: 3,
            keywords: [],
          }));
      }

      // Map work experience (field is work_experience, not experience)
      if (cv.work_experience && Array.isArray(cv.work_experience)) {
        resumeData.sections.experience.items = cv.work_experience.map(
          (exp: any) => ({
            id: crypto.randomUUID(),
            visible: true,
            company: exp.company_name || exp.company || "",
            position: exp.job_title || exp.position || "",
            location: exp.location || "",
            date: `${exp.start_date || ""} - ${exp.end_date || ""}`.trim(),
            summary: Array.isArray(exp.responsibilities)
              ? exp.responsibilities.join("\n• ")
              : exp.description || exp.summary || "",
            url: { label: "", href: "" },
          })
        );
      }

      // Map education
      if (cv.education && Array.isArray(cv.education)) {
        resumeData.sections.education.items = cv.education.map((edu: any) => ({
          id: crypto.randomUUID(),
          visible: true,
          institution: edu.institution || edu.school || "",
          studyType: edu.degree || edu.study_type || "",
          area: edu.field || edu.area || "",
          score: edu.grade || edu.gpa || edu.score || "",
          date: `${edu.start_date || ""} - ${edu.end_date || ""}`.trim(),
          summary: edu.description || "",
          url: { label: "", href: "" },
        }));
      }

      // Map certifications (field uses certification_name)
      if (cv.certifications && Array.isArray(cv.certifications)) {
        resumeData.sections.certifications.items = cv.certifications.map(
          (cert: any) => ({
            id: crypto.randomUUID(),
            visible: true,
            name:
              typeof cert === "string"
                ? cert
                : cert.certification_name || cert.name || cert.title || "",
            issuer:
              typeof cert === "string"
                ? ""
                : cert.issuer || cert.organization || "",
            date: typeof cert === "string" ? "" : cert.date || "",
            summary: "",
            url: { label: "", href: "" },
          })
        );
      }

      // Map projects (field is technical_projects, not projects)
      if (cv.technical_projects && Array.isArray(cv.technical_projects)) {
        resumeData.sections.projects.items = cv.technical_projects.map(
          (proj: any) => ({
            id: crypto.randomUUID(),
            visible: true,
            name: proj.project_name || proj.name || proj.title || "",
            description: proj.description || "",
            date: proj.date || "",
            summary: "",
            keywords:
              proj.programming_language ||
              proj.technologies ||
              proj.keywords ||
              [],
            url: {
              label: proj.project_name || "",
              href: proj.project_link
                ? proj.project_link.startsWith("http")
                  ? proj.project_link
                  : `https://${proj.project_link}`
                : "",
            },
          })
        );
      }

      // Map languages
      if (cv.languages && Array.isArray(cv.languages)) {
        resumeData.sections.languages.items = cv.languages.map((lang: any) => ({
          id: crypto.randomUUID(),
          visible: true,
          name:
            typeof lang === "string" ? lang : lang.name || lang.language || "",
          description:
            typeof lang === "string"
              ? ""
              : lang.proficiency || lang.level || "",
          level: 3,
        }));
      }

      // Create the resume with mapped data
      const createResponse = await axiosInstance.post(
        "/resume",
        {
          title: `${cv.name || "Imported"}'s Resume`,
          data: resumeData,
          status: "draft",
        },
        { withCredentials: true }
      );

      toast.success("Resume imported from CV successfully!");
      router.push(`/dashboard/resumes/${createResponse.data.resume_id}`);
    } catch (error: any) {
      console.error("Error importing CV:", error);
      toast.error(error.response?.data?.detail || "Failed to import from CV");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">My Resumes</h2>
            {resumeLimit && !resumeLimit.isPremium && (
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  resumeLimit.current >= resumeLimit.max
                    ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : resumeLimit.current >= resumeLimit.max - 1
                    ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {resumeLimit.current}/{resumeLimit.max} used
              </span>
            )}
            {resumeLimit?.isPremium && (
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-muted text-foreground flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Premium
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            {resumeLimit &&
            !resumeLimit.isPremium &&
            resumeLimit.current >= resumeLimit.max
              ? "Upgrade to premium for unlimited resumes"
              : "Create and manage your professional resumes"}
          </p>
        </div>
        <div className="flex gap-2">
          {hasClaimedCV && (
            <Button
              variant="outline"
              onClick={handleImportFromCV}
              disabled={
                isImporting ||
                (resumeLimit &&
                  !resumeLimit.isPremium &&
                  resumeLimit.current >= resumeLimit.max)
              }
            >
              {isImporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Import from CV
            </Button>
          )}
          <Button
            onClick={() => setShowCreateDialog(true)}
            disabled={
              resumeLimit &&
              !resumeLimit.isPremium &&
              resumeLimit.current >= resumeLimit.max
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            New Resume
          </Button>
        </div>
      </div>

      {/* Limit Warning Banner */}
      {resumeLimit &&
        !resumeLimit.isPremium &&
        resumeLimit.current >= resumeLimit.max && (
          <div className="mb-4 p-3 rounded-md bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Resume limit reached
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">
                You've created {resumeLimit.max} resumes. Delete an existing
                resume or upgrade to premium for unlimited resumes.
              </p>
            </div>
          </div>
        )}

      {/* Resume Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              {hasClaimedCV
                ? "Import from your claimed CV or create a new one"
                : "Create your first resume to get started"}
            </p>
            <div className="flex gap-2">
              {hasClaimedCV && (
                <Button
                  variant="outline"
                  onClick={handleImportFromCV}
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Import from CV
                </Button>
              )}
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Resume
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.resume_id}
              resume={resume}
              onDelete={fetchResumes}
              onDuplicate={fetchResumes}
            />
          ))}
        </div>
      )}

      {/* Create Resume Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Resume</DialogTitle>
            <DialogDescription>
              Give your resume a name to get started
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="title">Resume Title</Label>
            <Input
              id="title"
              placeholder="e.g., Software Engineer Resume"
              value={newResumeTitle}
              onChange={(e) => setNewResumeTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateResume()}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateResume} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login Required Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-muted-foreground" />
              Login Required
            </DialogTitle>
            <DialogDescription>
              Please log in to access the Resume Builder and create your
              professional resumes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <Image
                src="/assets/logo.png"
                alt="Resume AI Logo"
                width={48}
                height={48}
                className="rounded-lg"
              />
              <div>
                <p className="font-medium">Resume AI Builder</p>
                <p className="text-sm text-muted-foreground">
                  Create ATS-optimized resumes in minutes
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Create unlimited professional resumes
              </li>
              <li className="flex items-center gap-2">
                <Download className="h-4 w-4 text-muted-foreground" />
                Export to PDF with one click
              </li>
              <li className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-muted-foreground" />
                Access premium templates
              </li>
            </ul>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto"
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={() => {
                const googleLogin =
                  process.env.NEXT_PUBLIC_API_BASE_URL + "/user/google/login";
                window.location.href = googleLogin;
              }}
              className="w-full sm:w-auto"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login with Google
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
