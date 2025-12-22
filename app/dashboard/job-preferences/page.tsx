"use client";
import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Save, RefreshCw, Info } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import LinkedInBot from "@/app/dashboard/components/LinkedInBot";

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

const DATE_POSTED_OPTIONS = [
  { value: "any", label: "Any time" },
  { value: "past_day", label: "Past 24 hours" },
  { value: "past_week", label: "Past week" },
  { value: "past_month", label: "Past month" },
];

const TIME_TO_START_OPTIONS = [
  { value: "immediate", label: "Immediately" },
  { value: "morning", label: "Morning (6am-12pm)" },
  { value: "afternoon", label: "Afternoon (12pm-6pm)" },
  { value: "evening", label: "Evening (6pm-12am)" },
];

export default function JobPreferencesPage() {
  const [preferences, setPreferences] = useState<JobPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cvList, setCvList] = useState<{ id: string; name: string }[]>([]);
  const [selectedCv, setSelectedCv] = useState<string>("");

  useEffect(() => {
    fetchPreferences();
    fetchUserCVs();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/linkedin_bot/preferences", {
        withCredentials: true,
      });
      setPreferences(response.data);
    } catch (error: any) {
      console.error("Error fetching preferences:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to load job preferences");
      }
      // Set defaults
      setPreferences({
        positions: [""],
        locations: [""],
        experience_level: [],
        job_type: [],
        date_posted: "past_day",
        language: "English",
        blacklist_companies: [],
        blacklist_titles: [],
        max_applications_per_session: 10,
        phone_number: null,
        salary_expectation: null,
        hourly_rate: null,
        llm_enabled: true,
        auto_start_enabled: false,
        apply_interval_from: null,
        apply_interval_to: null,
        time_to_start: "immediate",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCVs = async () => {
    try {
      const response = await axiosInstance.get("/cv-claim/my_cv", {
        withCredentials: true,
      });
      if (response.data) {
        setCvList([
          {
            id: response.data.doc_id,
            name: response.data.doc_name || "My Resume",
          },
        ]);
        setSelectedCv(response.data.doc_id);
      }
    } catch (error) {
      console.error("Error fetching CVs:", error);
    }
  };

  const handleApply = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      // Save preferences first
      await axiosInstance.put("/linkedin_bot/preferences", preferences, {
        withCredentials: true,
      });

      // Start the bot session
      await axiosInstance.post(
        "/linkedin_bot/session/start",
        {},
        {
          withCredentials: true,
        }
      );

      toast.success("Job application session started!");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.response?.data?.detail || "Failed to start session");
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
        <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!preferences) return null;

  return (
    <div className="h-full w-full p-6 overflow-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Linked-In Bot</h1>
          <p className="text-gray-500">
            Apply to jobs in linkedin automatically. Fill the options below and
            our bot will start applying for jobs on your behalf while you can
            focus on your own thing.
          </p>
        </div>

        {/* LinkedIn Credentials (Collapsible or inline) */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <LinkedInBot />
        </div>

        {/* Form Grid */}
        <div className="space-y-8">
          {/* Row 1: Job Title, Location, Selected CV */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Job Title
              </Label>
              <Input
                placeholder="Flutter Developer"
                value={preferences.positions[0] || ""}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    positions: [
                      e.target.value,
                      ...preferences.positions.slice(1),
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
                value={preferences.locations[0] || ""}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    locations: [
                      e.target.value,
                      ...preferences.locations.slice(1),
                    ],
                  })
                }
                className="bg-gray-100 dark:bg-gray-800 border-0"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Selected CV
              </Label>
              <Select value={selectedCv} onValueChange={setSelectedCv}>
                <SelectTrigger className="bg-blue-100 dark:bg-blue-900 border-0">
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
            </div>
          </div>

          {/* Row 2: Experience, Work Type, Job Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Experience
              </Label>
              <Select
                value={preferences.experience_level[0]?.toString() || ""}
                onValueChange={(value) =>
                  setPreferences({
                    ...preferences,
                    experience_level: value ? [parseInt(value)] : [],
                  })
                }
              >
                <SelectTrigger className="bg-gray-100 dark:bg-gray-800 border-0">
                  <SelectValue placeholder="check below" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem
                      key={level.value}
                      value={level.value.toString()}
                    >
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
                value={preferences.job_type[0] || ""}
                onValueChange={(value) =>
                  setPreferences({
                    ...preferences,
                    job_type: value ? [value] : [],
                  })
                }
              >
                <SelectTrigger className="bg-gray-100 dark:bg-gray-800 border-0">
                  <SelectValue placeholder="Select..." />
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
                  <SelectValue placeholder="Select..." />
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

          {/* Row 3: Time to Start, Apply Interval, No of Apply */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Time to Start
              </Label>
              <Select
                value={preferences.time_to_start}
                onValueChange={(value) =>
                  setPreferences({ ...preferences, time_to_start: value })
                }
              >
                <SelectTrigger className="bg-gray-100 dark:bg-gray-800 border-0">
                  <SelectValue placeholder="Start Time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_TO_START_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Apply Interval
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Time range (hours) when bot should apply</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="From"
                  type="number"
                  min={0}
                  max={23}
                  value={preferences.apply_interval_from ?? ""}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      apply_interval_from: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  className="bg-gray-100 dark:bg-gray-800 border-0"
                />
                <Input
                  placeholder="To"
                  type="number"
                  min={0}
                  max={23}
                  value={preferences.apply_interval_to ?? ""}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      apply_interval_to: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  className="bg-gray-100 dark:bg-gray-800 border-0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Applications per Session
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Max 10 applications per day (free tier limit)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                type="number"
                min={1}
                max={10}
                value={preferences.max_applications_per_session}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    max_applications_per_session: Math.min(
                      10,
                      Math.max(1, parseInt(e.target.value) || 1)
                    ),
                  })
                }
                className="bg-gray-100 dark:bg-gray-800 border-0"
              />
              <p className="text-xs text-gray-500">Free: 10/day max</p>
            </div>
          </div>

          {/* Row 4: Date Posted, Language */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Date Posted
              </Label>
              <Select
                value={preferences.date_posted}
                onValueChange={(value) =>
                  setPreferences({ ...preferences, date_posted: value })
                }
              >
                <SelectTrigger className="bg-gray-100 dark:bg-gray-800 border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_POSTED_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Language
              </Label>
              <Input
                placeholder="English"
                value={preferences.language || ""}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    language: e.target.value || null,
                  })
                }
                className="bg-gray-100 dark:bg-gray-800 border-0"
              />
            </div>
            <div></div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              onClick={handleApply}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              {saving ? (
                <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Apply
            </Button>
            <button
              onClick={handleClearAll}
              className="text-red-500 hover:text-red-600 font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
