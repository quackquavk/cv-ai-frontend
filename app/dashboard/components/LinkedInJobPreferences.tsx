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

// Keep the full interface intact so the backend PUT round-trip doesn't lose any stored data.
// We only expose the extension-relevant fields in the UI.
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
  // Extension-synced settings
  max_years_required: number;
  visa_sponsorship: string;
  legally_authorized: string;
  willing_to_relocate: string;
  drivers_license: string;
  auto_next_page: boolean;
}

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
      // Defaults — only extension-relevant defaults matter here
      setPreferences({
        positions: [],
        locations: [],
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
        max_years_required: 3,
        visa_sponsorship: "no",
        legally_authorized: "yes",
        willing_to_relocate: "yes",
        drivers_license: "yes",
        auto_next_page: true,
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
      toast.success(
        "Preferences saved — the extension will pick these up on next sync.",
      );
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
    setter: (val: string) => void,
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
          <div>
            <h3 className="text-lg font-semibold">Extension Preferences</h3>
            <p className="text-xs text-gray-500">
              Synced automatically to your Chrome extension.
            </p>
          </div>
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

      {/* Phone & Salary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <p className="text-xs text-gray-500">
            Used to fill phone fields in applications
          </p>
        </div>
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
          <p className="text-xs text-gray-500">
            Used to fill salary fields in applications
          </p>
        </div>
      </div>

      {/* Blacklist Companies */}
      <div className="space-y-2">
        <Label>Skip These Companies</Label>
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
            placeholder="Company name to skip"
            value={newBlacklistCompany}
            onChange={(e) => setNewBlacklistCompany(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" &&
              addTag(
                "blacklist_companies",
                newBlacklistCompany,
                setNewBlacklistCompany,
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
                setNewBlacklistCompany,
              )
            }
          >
            Add
          </Button>
        </div>
      </div>

      {/* Blacklist Titles */}
      <div className="space-y-2">
        <Label>Skip These Job Titles</Label>
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
            placeholder="Job title to skip (e.g., Manager)"
            value={newBlacklistTitle}
            onChange={(e) => setNewBlacklistTitle(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" &&
              addTag(
                "blacklist_titles",
                newBlacklistTitle,
                setNewBlacklistTitle,
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
                setNewBlacklistTitle,
              )
            }
          >
            Add
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          The extension skips any job whose title or company matches these
          keywords
        </p>
      </div>

      {/* Extension Behaviour */}
      <div className="space-y-4 pt-4 border-t">
        <div>
          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
            Extension Behaviour
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Controls how the extension navigates and filters jobs on the page
          </p>
        </div>

        <div className="space-y-2">
          <Label>Max Experience Required (years)</Label>
          <Input
            type="number"
            min={0}
            max={20}
            value={preferences.max_years_required}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                max_years_required: Math.min(
                  20,
                  Math.max(0, parseInt(e.target.value) || 3),
                ),
              })
            }
          />
          <p className="text-xs text-gray-500">
            Skip jobs that require more years than this
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Auto Next Page</Label>
            <p className="text-sm text-gray-500">
              Automatically go to the next page when all jobs on this page are
              processed
            </p>
          </div>
          <Switch
            checked={preferences.auto_next_page}
            onCheckedChange={(checked) =>
              setPreferences({ ...preferences, auto_next_page: checked })
            }
          />
        </div>
      </div>

      {/* Common Application Questions */}
      <div className="space-y-4 pt-4 border-t">
        <div>
          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
            Common Application Questions
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Default answers the extension uses when LinkedIn asks these standard
            questions
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Visa Sponsorship Required?</Label>
            <Select
              value={preferences.visa_sponsorship}
              onValueChange={(value) =>
                setPreferences({ ...preferences, visa_sponsorship: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Legally Authorized to Work?</Label>
            <Select
              value={preferences.legally_authorized}
              onValueChange={(value) =>
                setPreferences({ ...preferences, legally_authorized: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Willing to Relocate?</Label>
            <Select
              value={preferences.willing_to_relocate}
              onValueChange={(value) =>
                setPreferences({ ...preferences, willing_to_relocate: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Have Driver&apos;s License?</Label>
            <Select
              value={preferences.drivers_license}
              onValueChange={(value) =>
                setPreferences({ ...preferences, drivers_license: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInJobPreferences;
