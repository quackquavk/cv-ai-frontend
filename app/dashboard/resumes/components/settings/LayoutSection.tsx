"use client";

import { useResumeStore } from "../../store/resumeStore";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Layers, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface SectionItem {
  id: string;
  name: string;
  visible: boolean;
}

const DEFAULT_SECTION_ORDER = [
  "summary",
  "profiles",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "awards",
  "languages",
  "interests",
  "publications",
  "references",
  "volunteer",
];

const SECTION_DISPLAY_NAMES: Record<string, string> = {
  summary: "Summary",
  profiles: "Profiles",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  awards: "Awards",
  languages: "Languages",
  interests: "Interests",
  publications: "Publications",
  references: "References",
  volunteer: "Volunteer",
};

export function LayoutSection() {
  const resume = useResumeStore((state) => state.resume);
  const toggleSectionVisibility = useResumeStore(
    (state) => state.toggleSectionVisibility
  );
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  // Get section order from metadata or use default
  const getSectionOrder = useCallback((): string[] => {
    if (!resume) return DEFAULT_SECTION_ORDER;
    const layout = resume.data.metadata?.layout;
    if (Array.isArray(layout) && layout.length > 0) {
      return layout;
    }
    return DEFAULT_SECTION_ORDER;
  }, [resume]);

  const [sectionOrder, setSectionOrder] = useState<string[]>(getSectionOrder);

  if (!resume) return null;

  const { sections } = resume.data;

  // Update layout in store
  const updateLayout = (newOrder: string[]) => {
    useResumeStore.setState({
      resume: {
        ...resume,
        data: {
          ...resume.data,
          metadata: {
            ...resume.data.metadata,
            layout: newOrder,
          },
        },
      },
      hasUnsavedChanges: true,
    });
  };

  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedItem(sectionId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", sectionId);
  };

  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (sectionId !== draggedItem) {
      setDragOverItem(sectionId);
    }
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain");

    if (sourceId && sourceId !== targetId) {
      const newOrder = [...sectionOrder];
      const sourceIndex = newOrder.indexOf(sourceId);
      const targetIndex = newOrder.indexOf(targetId);

      if (sourceIndex !== -1 && targetIndex !== -1) {
        // Remove source and insert at target position
        newOrder.splice(sourceIndex, 1);
        newOrder.splice(targetIndex, 0, sourceId);

        setSectionOrder(newOrder);
        updateLayout(newOrder);
      }
    }

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleResetOrder = () => {
    setSectionOrder(DEFAULT_SECTION_ORDER);
    updateLayout(DEFAULT_SECTION_ORDER);
  };

  // Build section items with visibility status
  const sectionItems: SectionItem[] = sectionOrder
    .filter((id) => id in sections)
    .map((id) => {
      const section = sections[id as keyof typeof sections];
      return {
        id,
        name: SECTION_DISPLAY_NAMES[id] || id,
        visible: "visible" in section ? section.visible : true,
      };
    });

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Section Order</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetOrder}
          className="h-7 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        Drag sections to reorder them in your resume
      </p>

      <div className="space-y-1">
        {sectionItems.map((section) => (
          <div
            key={section.id}
            draggable
            onDragStart={(e) => handleDragStart(e, section.id)}
            onDragOver={(e) => handleDragOver(e, section.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, section.id)}
            onDragEnd={handleDragEnd}
            className={cn(
              "flex items-center gap-2 p-2 rounded-md border transition-all cursor-grab active:cursor-grabbing",
              draggedItem === section.id && "opacity-50 scale-95",
              dragOverItem === section.id &&
                "border-primary bg-primary/5 scale-[1.02]",
              !section.visible && "opacity-60",
              draggedItem !== section.id &&
                dragOverItem !== section.id &&
                "border-border hover:border-muted-foreground/50 hover:bg-muted/30"
            )}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span
              className={cn(
                "text-sm flex-1",
                !section.visible && "text-muted-foreground line-through"
              )}
            >
              {section.name}
            </span>
            <Switch
              checked={section.visible}
              onCheckedChange={() =>
                toggleSectionVisibility(section.id as keyof typeof sections)
              }
              className="scale-75"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
