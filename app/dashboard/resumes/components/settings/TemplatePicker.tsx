"use client";

import { useResumeStore } from "../../store/resumeStore";
import { Card } from "@/components/ui/card";
import { Check, Layout } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Template list matching Reactive-Resume exactly
export const templatesList = [
  "azurill",
  "bronzor",
  "chikorita",
  "ditto",
  "gengar",
  "glalie",
  "kakuna",
  "leafish",
  "nosepass",
  "onyx",
  "pikachu",
  "rhyhorn",
] as const;

export type Template = (typeof templatesList)[number];

export function TemplatePicker() {
  const resume = useResumeStore((state) => state.resume);
  const updateTemplate = useResumeStore((state) => state.updateTemplate);

  if (!resume) return null;

  const currentTemplate = resume.data.metadata?.template || "azurill";

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Layout className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Template</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {templatesList.map((template, index) => (
          <button
            key={template}
            onClick={() => updateTemplate(template)}
            className={cn(
              "relative group rounded-lg overflow-hidden transition-all duration-200 focus:outline-none",
              "ring-2",
              currentTemplate === template
                ? "ring-primary shadow-lg scale-[1.02]"
                : "ring-transparent hover:ring-primary/50"
            )}
            style={{
              aspectRatio: "1 / 1.4142", // A4 aspect ratio
            }}
          >
            {/* Template Preview Image */}
            <Image
              src={`/templates/jpg/${template}.jpg`}
              alt={template}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 33vw"
            />

            {/* Gradient Overlay with Name */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <p className="absolute inset-x-0 bottom-2 text-center text-sm font-bold capitalize text-white">
                {template}
              </p>
            </div>

            {/* Selected Indicator */}
            {currentTemplate === template && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            )}

            {/* Hover Effect */}
            <div
              className={cn(
                "absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity",
                currentTemplate === template &&
                  "opacity-0 group-hover:opacity-0"
              )}
            />
          </button>
        ))}
      </div>
    </Card>
  );
}
