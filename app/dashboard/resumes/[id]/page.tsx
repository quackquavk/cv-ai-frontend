"use client";

import { useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Check,
  Settings,
  FileText,
  ChevronRight,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import { useResumeStore } from "../store/resumeStore";
import { resumeApi, getEmptyResumeData } from "../services/resumeApi";
import { BasicsSection } from "../components/sections/BasicsSection";
import { SummarySection } from "../components/sections/SummarySection";
import { ExperienceSection } from "../components/sections/ExperienceSection";
import { EducationSection } from "../components/sections/EducationSection";
import { SkillsSection } from "../components/sections/SkillsSection";
import { ProjectsSection } from "../components/sections/ProjectsSection";
import { CertificationsSection } from "../components/sections/CertificationsSection";
import { AwardsSection } from "../components/sections/AwardsSection";
import { LanguagesSection } from "../components/sections/LanguagesSection";
import { InterestsSection } from "../components/sections/InterestsSection";
import { ProfilesSection } from "../components/sections/ProfilesSection";
import { PublicationsSection } from "../components/sections/PublicationsSection";
import { ReferencesSection } from "../components/sections/ReferencesSection";
import { VolunteerSection } from "../components/sections/VolunteerSection";
import { ResumePreview } from "../components/preview/ResumePreview";
import { SettingsSidebar } from "../components/settings/SettingsSidebar";

export default function ResumeEditorPage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params.id as string;

  const resume = useResumeStore((state) => state.resume);
  const isLoading = useResumeStore((state) => state.isLoading);
  const isSaving = useResumeStore((state) => state.isSaving);
  const hasUnsavedChanges = useResumeStore((state) => state.hasUnsavedChanges);
  const setResume = useResumeStore((state) => state.setResume);
  const setLoading = useResumeStore((state) => state.setLoading);
  const setSaving = useResumeStore((state) => state.setSaving);
  const resetStore = useResumeStore((state) => state.resetStore);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch resume on mount
  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);
        const data = await resumeApi.get(resumeId);

        // Ensure data has required structure by merging with defaults
        const emptyData = getEmptyResumeData();
        const mergedData = {
          ...data,
          data: {
            basics: { ...emptyData.basics, ...(data.data?.basics || {}) },
            sections: {
              ...emptyData.sections,
              ...(data.data?.sections || {}),
            },
            metadata: {
              ...emptyData.metadata,
              ...(data.data?.metadata || {}),
            },
          },
        };

        setResume(mergedData);
      } catch (error) {
        toast.error("Failed to load resume");
        router.push("/dashboard/resumes");
      } finally {
        setLoading(false);
      }
    };

    fetchResume();

    return () => {
      resetStore();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [resumeId]);

  // Auto-save with debounce
  const saveResume = useCallback(async () => {
    if (!resume || !hasUnsavedChanges) return;

    try {
      setSaving(true);
      await resumeApi.update(resumeId, {
        title: resume.title,
        data: resume.data,
      });
      useResumeStore.setState({ hasUnsavedChanges: false });
    } catch (error) {
      toast.error("Failed to save resume");
    } finally {
      setSaving(false);
    }
  }, [resume, resumeId, hasUnsavedChanges]);

  // Debounced auto-save
  useEffect(() => {
    if (hasUnsavedChanges) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveResume();
      }, 2000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, resume?.data]);

  // Manual save
  const handleManualSave = async () => {
    await saveResume();
    toast.success("Resume saved");
  };

  // Update title
  const handleTitleChange = (title: string) => {
    if (!resume) return;
    useResumeStore.setState({
      resume: { ...resume, title },
      hasUnsavedChanges: true,
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="h-16 border-b flex items-center px-4 gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex-1 grid grid-cols-2 gap-4 p-4">
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-full" />
        </div>
      </div>
    );
  }

  if (!resume) return null;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Breadcrumb */}
      <nav className="h-8 px-4 flex items-center gap-1 text-xs text-muted-foreground border-b bg-muted/30">
        <Link
          href="/dashboard"
          className="hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Home className="h-3 w-3" />
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href="/dashboard/resumes"
          className="hover:text-foreground transition-colors"
        >
          Resumes
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium truncate max-w-[200px]">
          {resume.title}
        </span>
      </nav>

      {/* Header */}
      <header className="h-14 border-b flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/resumes")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Resume AI Branding */}
          <div className="flex items-center gap-2 pr-4 border-r">
            <Image
              src="/assets/logo.png"
              alt="Resume AI"
              width={28}
              height={28}
              className="rounded"
            />
            <span className="text-sm font-semibold hidden sm:inline">
              Resume AI
            </span>
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-white rounded-full"
            >
              <FileText className="h-2.5 w-2.5" />
            </span>
          </div>

          <Input
            value={resume.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-lg font-semibold border-none bg-transparent focus-visible:ring-0 w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {isSaving ? (
              "Saving..."
            ) : hasUnsavedChanges ? (
              "Unsaved changes"
            ) : (
              <span className="flex items-center gap-1 text-green-600">
                <Check className="h-4 w-4" />
                Saved
              </span>
            )}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSave}
            disabled={isSaving || !hasUnsavedChanges}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </header>

      {/* Editor Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
        {/* Left Panel - Form */}
        <div className="h-[calc(100vh-64px)] border-r flex flex-col">
          <Tabs defaultValue="content" className="flex-1 flex flex-col">
            <div className="border-b px-4">
              <TabsList className="h-12">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="additional">Additional</TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="content" className="flex-1 m-0">
              <ScrollArea className="h-[calc(100vh-128px)]">
                <div className="p-6 space-y-6">
                  <BasicsSection />
                  <SummarySection />
                  <ProfilesSection />
                  <ExperienceSection />
                  <EducationSection />
                  <SkillsSection />
                  <ProjectsSection />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="additional" className="flex-1 m-0">
              <ScrollArea className="h-[calc(100vh-128px)]">
                <div className="p-6 space-y-6">
                  <CertificationsSection />
                  <AwardsSection />
                  <LanguagesSection />
                  <InterestsSection />
                  <PublicationsSection />
                  <ReferencesSection />
                  <VolunteerSection />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 m-0">
              <ScrollArea className="h-[calc(100vh-128px)]">
                <div className="p-6">
                  <SettingsSidebar />
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Preview */}
        <div className="h-[calc(100vh-64px)] hidden lg:block">
          <ResumePreview />
        </div>
      </div>
    </div>
  );
}
