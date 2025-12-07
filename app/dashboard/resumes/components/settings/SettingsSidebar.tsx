"use client";

import { useResumeStore } from "../../store/resumeStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette, Type, Layout, Eye, Layers } from "lucide-react";

import { ExportSection } from "./ExportSection";

const FONTS = [
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Poppins", label: "Poppins" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Georgia", label: "Georgia" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Merriweather", label: "Merriweather" },
  { value: "Playfair Display", label: "Playfair Display" },
];

const PAPER_FORMATS = [
  { value: "a4", label: "A4", width: 210, height: 297 },
  { value: "letter", label: "US Letter", width: 216, height: 279 },
  { value: "legal", label: "US Legal", width: 216, height: 356 },
];

const SECTIONS = [
  { id: "summary", name: "Summary" },
  { id: "profiles", name: "Profiles" },
  { id: "experience", name: "Experience" },
  { id: "education", name: "Education" },
  { id: "skills", name: "Skills" },
  { id: "projects", name: "Projects" },
  { id: "certifications", name: "Certifications" },
  { id: "awards", name: "Awards" },
  { id: "languages", name: "Languages" },
  { id: "interests", name: "Interests" },
  { id: "publications", name: "Publications" },
  { id: "references", name: "References" },
  { id: "volunteer", name: "Volunteer" },
];

export function SettingsSidebar() {
  const resume = useResumeStore((state) => state.resume);
  const updateTheme = useResumeStore((state) => state.updateTheme);
  const toggleSectionVisibility = useResumeStore(
    (state) => state.toggleSectionVisibility
  );

  if (!resume) return null;

  const { metadata, sections } = resume.data;

  const updateMetadata = (
    path: "typography" | "page",
    updates: Record<string, unknown>
  ) => {
    useResumeStore.setState({
      resume: {
        ...resume,
        data: {
          ...resume.data,
          metadata: {
            ...metadata,
            [path]: { ...metadata[path], ...updates },
          },
        },
      },
      hasUnsavedChanges: true,
    });
  };

  const updateTypographyFont = (updates: Record<string, unknown>) => {
    useResumeStore.setState({
      resume: {
        ...resume,
        data: {
          ...resume.data,
          metadata: {
            ...metadata,
            typography: {
              ...metadata.typography,
              font: { ...metadata.typography.font, ...updates },
            },
          },
        },
      },
      hasUnsavedChanges: true,
    });
  };

  return (
    <div className="space-y-4">
      {/* Template Picker */}

      {/* Theme Colors */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Primary</Label>
              <div className="relative">
                <Input
                  type="color"
                  value={metadata.theme.primary}
                  onChange={(e) => updateTheme({ primary: e.target.value })}
                  className="h-10 w-full p-1 cursor-pointer"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Background</Label>
              <Input
                type="color"
                value={metadata.theme.background}
                onChange={(e) => updateTheme({ background: e.target.value })}
                className="h-10 w-full p-1 cursor-pointer"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Text</Label>
              <Input
                type="color"
                value={metadata.theme.text}
                onChange={(e) => updateTheme({ text: e.target.value })}
                className="h-10 w-full p-1 cursor-pointer"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Type className="h-4 w-4" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Font Family</Label>
            <Select
              value={metadata.typography.font.family}
              onValueChange={(value) => updateTypographyFont({ family: value })}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Font Size</Label>
              <span className="text-xs text-muted-foreground">
                {metadata.typography.font.size}px
              </span>
            </div>
            <Slider
              value={[metadata.typography.font.size]}
              min={10}
              max={18}
              step={1}
              onValueChange={([value]) => updateTypographyFont({ size: value })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Line Height</Label>
              <span className="text-xs text-muted-foreground">
                {metadata.typography.lineHeight.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[metadata.typography.lineHeight * 10]}
              min={10}
              max={25}
              step={1}
              onValueChange={([value]) =>
                updateMetadata("typography", { lineHeight: value / 10 })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Hide Icons</Label>
            <Switch
              checked={metadata.typography.hideIcons}
              onCheckedChange={(checked) =>
                updateMetadata("typography", { hideIcons: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Underline Links</Label>
            <Switch
              checked={metadata.typography.underlineLinks}
              onCheckedChange={(checked) =>
                updateMetadata("typography", { underlineLinks: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Page Layout */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Page
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Paper Format</Label>
            <Select
              value={metadata.page.format}
              onValueChange={(value) =>
                updateMetadata("page", { format: value })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAPER_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Margins</Label>
              <span className="text-xs text-muted-foreground">
                {metadata.page.margin}mm
              </span>
            </div>
            <Slider
              value={[metadata.page.margin]}
              min={10}
              max={30}
              step={1}
              onValueChange={([value]) =>
                updateMetadata("page", { margin: value })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Section Order (Drag & Drop) */}

      {/* Section Visibility */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Sections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {SECTIONS.map((section) => {
              const sectionData = sections[section.id as keyof typeof sections];
              const isVisible =
                "visible" in sectionData ? sectionData.visible : true;

              return (
                <div
                  key={section.id}
                  className="flex items-center justify-between py-1"
                >
                  <Label className="text-xs font-normal">{section.name}</Label>
                  <Switch
                    checked={isVisible}
                    onCheckedChange={() =>
                      toggleSectionVisibility(
                        section.id as keyof typeof sections
                      )
                    }
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Export Section */}
      <ExportSection />
    </div>
  );
}
