"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Settings, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosConfig";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
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

const JOB_TYPES = [
  { value: "remote", label: "Remote" },
  { value: "on_site", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
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

interface LinkedInJobPreferencesProps {
  className?: string;
  onPreferencesSaved?: () => void;
}

const LinkedInJobPreferences: React.FC<LinkedInJobPreferencesProps> = ({
  className = "",
  onPreferencesSaved,
}) => {
  const [preferences, setPreferences] = useState<JobPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPosition, setNewPosition] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newBlacklistCompany, setNewBlacklistCompany] = useState("");
  const [newBlacklistTitle, setNewBlacklistTitle] = useState("");

  useEffect(() => {
    fetchPreferences();
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
      // Set defaults if not found
      setPreferences({
        positions: ["Software Engineer"],
        locations: ["Remote"],
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
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      await axiosInstance.put("/linkedin_bot/preferences", preferences, {
        withCredentials: true,
      });
      toast.success("Job preferences saved successfully!");
      onPreferencesSaved?.();
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast.error(error.response?.data?.detail || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const addTag = (
    field: keyof JobPreferences,
    value: string,
    setter: (val: string) => void
  ) => {
    if (!value.trim() || !preferences) return;
    const currentArray = preferences[field] as string[];
    if (!currentArray.includes(value.trim())) {
      setPreferences({
        ...preferences,
        [field]: [...currentArray, value.trim()],
      });
    }
    setter("");
  };

  const removeTag = (field: keyof JobPreferences, value: string) => {
    if (!preferences) return;
    const currentArray = preferences[field] as string[];
    setPreferences({
      ...preferences,
      [field]: currentArray.filter((item) => item !== value),
    });
  };

  const toggleExperience = (level: number) => {
    if (!preferences) return;
    const current = preferences.experience_level;
    const updated = current.includes(level)
      ? current.filter((l) => l !== level)
      : [...current, level];
    setPreferences({ ...preferences, experience_level: updated });
  };

  const toggleJobType = (type: string) => {
    if (!preferences) return;
    const current = preferences.job_type;
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setPreferences({ ...preferences, job_type: updated });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoaderCircle className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!preferences) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Job Preferences</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPreferences}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button size="sm" onClick={savePreferences} disabled={saving}>
            {saving ? (
              <LoaderCircle className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Positions */}
      <div className="space-y-2">
        <Label>Job Positions</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {preferences.positions.map((pos) => (
            <Badge key={pos} variant="secondary" className="pr-1">
              {pos}
              <button
                onClick={() => removeTag("positions", pos)}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add position (e.g., Frontend Developer)"
            value={newPosition}
            onChange={(e) => setNewPosition(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" &&
              addTag("positions", newPosition, setNewPosition)
            }
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => addTag("positions", newPosition, setNewPosition)}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Locations */}
      <div className="space-y-2">
        <Label>Locations</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {preferences.locations.map((loc) => (
            <Badge key={loc} variant="secondary" className="pr-1">
              {loc}
              <button
                onClick={() => removeTag("locations", loc)}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add location (e.g., New York, Remote)"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" &&
              addTag("locations", newLocation, setNewLocation)
            }
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => addTag("locations", newLocation, setNewLocation)}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Experience Level */}
      <div className="space-y-2">
        <Label>Experience Level</Label>
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE_LEVELS.map((level) => (
            <Badge
              key={level.value}
              variant={
                preferences.experience_level.includes(level.value)
                  ? "default"
                  : "outline"
              }
              className="cursor-pointer"
              onClick={() => toggleExperience(level.value)}
            >
              {level.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div className="space-y-2">
        <Label>Job Type</Label>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map((type) => (
            <Badge
              key={type.value}
              variant={
                preferences.job_type.includes(type.value)
                  ? "default"
                  : "outline"
              }
              className="cursor-pointer"
              onClick={() => toggleJobType(type.value)}
            >
              {type.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Date Posted */}
      <div className="space-y-2">
        <Label>Date Posted</Label>
        <Select
          value={preferences.date_posted}
          onValueChange={(value) =>
            setPreferences({ ...preferences, date_posted: value })
          }
        >
          <SelectTrigger>
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

      {/* Max Applications */}
      <div className="space-y-2">
        <Label>Max Applications (per day, capped at 10)</Label>
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
        />
      </div>

      {/* Time to Start */}
      <div className="space-y-2">
        <Label>Preferred Time to Apply</Label>
        <Select
          value={preferences.time_to_start}
          onValueChange={(value) =>
            setPreferences({ ...preferences, time_to_start: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
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

      {/* Apply Interval */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Apply From (Hour)</Label>
          <Input
            type="number"
            min={0}
            max={23}
            placeholder="e.g., 9"
            value={preferences.apply_interval_from ?? ""}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                apply_interval_from: e.target.value
                  ? parseInt(e.target.value)
                  : null,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Apply To (Hour)</Label>
          <Input
            type="number"
            min={0}
            max={23}
            placeholder="e.g., 17"
            value={preferences.apply_interval_to ?? ""}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                apply_interval_to: e.target.value
                  ? parseInt(e.target.value)
                  : null,
              })
            }
          />
        </div>
      </div>

      {/* Language */}
      <div className="space-y-2">
        <Label>Job Listing Language (optional)</Label>
        <Input
          placeholder="e.g., English"
          value={preferences.language || ""}
          onChange={(e) =>
            setPreferences({
              ...preferences,
              language: e.target.value || null,
            })
          }
        />
      </div>

      {/* Salary & Rate */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Salary Expectation</Label>
          <Input
            placeholder="e.g., $100,000"
            value={preferences.salary_expectation || ""}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                salary_expectation: e.target.value || null,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Hourly Rate</Label>
          <Input
            placeholder="e.g., $50/hr"
            value={preferences.hourly_rate || ""}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                hourly_rate: e.target.value || null,
              })
            }
          />
        </div>
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label>Phone Number</Label>
        <Input
          placeholder="e.g., +1 555 123 4567"
          value={preferences.phone_number || ""}
          onChange={(e) =>
            setPreferences({
              ...preferences,
              phone_number: e.target.value || null,
            })
          }
        />
      </div>

      {/* Blacklist Companies */}
      <div className="space-y-2">
        <Label>Blacklist Companies</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {preferences.blacklist_companies.map((company) => (
            <Badge key={company} variant="destructive" className="pr-1">
              {company}
              <button
                onClick={() => removeTag("blacklist_companies", company)}
                className="ml-1 hover:bg-red-700 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add company to avoid"
            value={newBlacklistCompany}
            onChange={(e) => setNewBlacklistCompany(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" &&
              addTag(
                "blacklist_companies",
                newBlacklistCompany,
                setNewBlacklistCompany
              )
            }
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              addTag(
                "blacklist_companies",
                newBlacklistCompany,
                setNewBlacklistCompany
              )
            }
          >
            Add
          </Button>
        </div>
      </div>

      {/* Blacklist Titles */}
      <div className="space-y-2">
        <Label>Blacklist Job Titles</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {preferences.blacklist_titles.map((title) => (
            <Badge key={title} variant="destructive" className="pr-1">
              {title}
              <button
                onClick={() => removeTag("blacklist_titles", title)}
                className="ml-1 hover:bg-red-700 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add title to avoid (e.g., Manager)"
            value={newBlacklistTitle}
            onChange={(e) => setNewBlacklistTitle(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" &&
              addTag(
                "blacklist_titles",
                newBlacklistTitle,
                setNewBlacklistTitle
              )
            }
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              addTag(
                "blacklist_titles",
                newBlacklistTitle,
                setNewBlacklistTitle
              )
            }
          >
            Add
          </Button>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">AI-Powered Form Filling</Label>
            <p className="text-sm text-gray-500">
              Use AI to intelligently answer application questions
            </p>
          </div>
          <Switch
            checked={preferences.llm_enabled}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, llm_enabled: checked })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default LinkedInJobPreferences;
