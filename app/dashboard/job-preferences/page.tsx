"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosConfig";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobPreferences {
  positions: string[];
  locations: string[];
  experience_level: number[];
  job_type: string[];
  date_posted: string;
  language: string | null;
  blacklist_companies: string[];
  blacklist_titles: string[];
  max_applications_per_session: number;
  phone_number: string | null;
  email: string | null;
  password: string | null;
  salary_expectation: string | null;
  hourly_rate: string | null;
  llm_enabled: boolean;
  auto_start_enabled: boolean;
  apply_interval_from: number | null;
  apply_interval_to: number | null;
  time_to_start: string;
}

const EXPERIENCE_LEVELS = [
  { value: 1, label: "Entry Level" },
  { value: 2, label: "Associate" },
  { value: 3, label: "Mid-Senior" },
  { value: 4, label: "Director" },
  { value: 5, label: "Executive" },
  { value: 6, label: "Internship" },
];

const WORK_TYPES = [
  { value: "remote", label: "Remote" },
  { value: "on_site", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
];

const JOB_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

const DEFAULT_PREFERENCES: JobPreferences = {
  positions: [""],
  locations: [""],
  experience_level: [],
  job_type: [],
  date_posted: "any",
  language: "English",
  blacklist_companies: [],
  blacklist_titles: [],
  max_applications_per_session: 10,
  phone_number: null,
  email: null,
  password: null,
  salary_expectation: null,
  hourly_rate: null,
  llm_enabled: true,
  auto_start_enabled: false,
  apply_interval_from: null,
  apply_interval_to: null,
  time_to_start: "immediate",
};

export default function JobPreferencesPage() {
  const [preferences, setPreferences] = useState<JobPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/linkedin_bot/preferences", {
        withCredentials: true,
      });

      const data = response.data || {};

      // Merge with defaults and ensure arrays are valid arrays (handle nulls from backend)
      const sanitizedPreferences: JobPreferences = {
        ...DEFAULT_PREFERENCES,
        ...data,
        positions: Array.isArray(data.positions)
          ? data.positions
          : DEFAULT_PREFERENCES.positions,
        locations: Array.isArray(data.locations)
          ? data.locations
          : DEFAULT_PREFERENCES.locations,
        experience_level: Array.isArray(data.experience_level)
          ? data.experience_level
          : DEFAULT_PREFERENCES.experience_level,
        job_type: Array.isArray(data.job_type)
          ? data.job_type
          : DEFAULT_PREFERENCES.job_type,
        blacklist_companies: Array.isArray(data.blacklist_companies)
          ? data.blacklist_companies
          : DEFAULT_PREFERENCES.blacklist_companies,
        blacklist_titles: Array.isArray(data.blacklist_titles)
          ? data.blacklist_titles
          : DEFAULT_PREFERENCES.blacklist_titles,
      };

      // If positions or locations came back empty array, ensure at least one empty string for inputs
      if (sanitizedPreferences.positions.length === 0)
        sanitizedPreferences.positions = [""];
      if (sanitizedPreferences.locations.length === 0)
        sanitizedPreferences.locations = [""];

      setPreferences(sanitizedPreferences);
    } catch (error: any) {
      console.error("Error fetching preferences:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to load job preferences");
      }
      // Set defaults on error
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      // Save preferences without touching LinkedIn credentials (extension-driven flow)
      const { email, password, ...payload } = preferences;
      await axiosInstance.put("/linkedin_bot/preferences", payload, {
        withCredentials: true,
      });
      toast.success("Job preferences saved!");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.response?.data?.detail || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleClearAll = () => {
    setPreferences({
      positions: [""],
      locations: [""],
      experience_level: [],
      job_type: [],
      date_posted: "any",
      language: null,
      blacklist_companies: [],
      blacklist_titles: [],
      max_applications_per_session: 10,
      phone_number: null,
      email: null,
      password: null,
      salary_expectation: null,
      hourly_rate: null,
      llm_enabled: true,
      auto_start_enabled: false,
      apply_interval_from: null,
      apply_interval_to: null,
      time_to_start: "immediate",
    });
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!preferences) return null;

  return (
    <div className="h-full w-full pt-4 overflow-auto">
      {/* Compact Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold">Job Preferences</h2>
          <p className="text-sm text-muted-foreground">
            Define your career goals. Customize your job search criteria,
            including positions, locations, and salary expectations, to guide
            our AI-powered automation.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleClearAll}>
            Clear All
          </Button>
          <Button onClick={handleApply} disabled={saving}>
            {saving && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
            Save Preferences
          </Button>
        </div>
      </div>

      {/* LinkedIn Credentials */}
      {/* <div className="mb-4 p-3 bg-muted rounded-md">
        <LinkedInBot />
      </div> */}

      {/* Form Grid */}
      <div className="space-y-6">
        {/* Row 1: Job Title, Location, Selected CV */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Job Title
            </Label>
            <Input
              placeholder="Flutter Developer"
              value={preferences.positions?.[0] || ""}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  positions: [
                    e.target.value,
                    ...(preferences.positions?.slice(1) || []),
                  ],
                })
              }
              className="bg-gray-100 dark:bg-gray-800 border-0"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Location
            </Label>
            <Input
              placeholder="Nepal"
              value={preferences.locations?.[0] || ""}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  locations: [
                    e.target.value,
                    ...(preferences.locations?.slice(1) || []),
                  ],
                })
              }
              className="bg-gray-100 dark:bg-gray-800 border-0"
            />
          </div>
          {/* <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Selected CV
            </Label>
            <Select value={selectedCv} onValueChange={setSelectedCv}>
              <SelectTrigger className="bg-muted border-0">
                <SelectValue placeholder="Select CV" />
              </SelectTrigger>
              <SelectContent>
                {cvList.map((cv) => (
                  <SelectItem key={cv.id} value={cv.id}>
                    Resume: {cv.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
        </div>

        {/* Row 2: Experience, Work Type, Job Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Experience
            </Label>
            <Select
              value={preferences.experience_level?.[0]?.toString() || ""}
              onValueChange={(value) =>
                setPreferences({
                  ...preferences,
                  experience_level: value ? [parseInt(value)] : [],
                })
              }
            >
              <SelectTrigger className="bg-gray-100 dark:bg-gray-800 border-0">
                <SelectValue placeholder="Select Experience" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value.toString()}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Work Type
            </Label>
            <Select
              value={preferences.job_type?.[0] || ""}
              onValueChange={(value) =>
                setPreferences({
                  ...preferences,
                  job_type: value ? [value] : [],
                })
              }
            >
              <SelectTrigger className="bg-gray-100 dark:bg-gray-800 border-0">
                <SelectValue placeholder="Select Work Type" />
              </SelectTrigger>
              <SelectContent>
                {WORK_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Job Type
            </Label>
            <Select>
              <SelectTrigger className="bg-gray-100 dark:bg-gray-800 border-0">
                <SelectValue placeholder="Select Job Type" />
              </SelectTrigger>
              <SelectContent>
                {JOB_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* LinkedIn credentials removed (extension-driven flow) */}
      </div>
    </div>
  );
}
