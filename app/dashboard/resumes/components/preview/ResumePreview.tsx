"use client";

import { useResumeStore } from "../../store/resumeStore";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { ProfessionalTemplate } from "./templates/ProfessionalTemplate";
import { CreativeTemplate } from "./templates/CreativeTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Palette, ZoomIn, ZoomOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const templates = [
  { id: "classic", name: "Classic", component: ClassicTemplate },
  { id: "modern", name: "Modern", component: ModernTemplate },
  { id: "minimal", name: "Minimal", component: MinimalTemplate },
  { id: "professional", name: "Professional", component: ProfessionalTemplate },
  { id: "creative", name: "Creative", component: CreativeTemplate },
];

// Google Fonts that need to be loaded
const GOOGLE_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Poppins",
  "Montserrat",
  "Merriweather",
  "Playfair Display",
];

export function ResumePreview() {
  const resume = useResumeStore((state) => state.resume);
  const updateTemplate = useResumeStore((state) => state.updateTemplate);
  const [zoom, setZoom] = useState(0.6);
  const [fontLoaded, setFontLoaded] = useState(0); // Counter to trigger re-renders
  const previewRef = useRef<HTMLDivElement>(null);

  // Load Google Font dynamically
  const fontFamily = resume?.data?.metadata?.typography?.font?.family;

  useEffect(() => {
    if (!fontFamily || !GOOGLE_FONTS.includes(fontFamily)) return;

    const linkId = `google-font-${fontFamily.replace(/\s+/g, "-")}`;

    // Check if already loaded
    if (document.getElementById(linkId)) {
      // Font link exists, just trigger re-render
      setFontLoaded((prev) => prev + 1);
      return;
    }

    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      fontFamily
    )}:wght@300;400;500;600;700&display=swap`;

    // Trigger re-render when font loads
    link.onload = () => {
      setFontLoaded((prev) => prev + 1);
    };

    document.head.appendChild(link);
  }, [fontFamily]);

  if (!resume) return null;

  const currentTemplate =
    templates.find((t) => t.id === resume.data.metadata?.template) ||
    templates[0];
  const TemplateComponent = currentTemplate.component;

  const handleDownload = () => {
    // Open print dialog for the preview
    const printContent = document.getElementById("resume-preview");
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Get the current font family
    const currentFont =
      resume.data.metadata?.typography?.font?.family || "Inter";
    const fontLink = GOOGLE_FONTS.includes(currentFont)
      ? `<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(
          currentFont
        )}:wght@300;400;500;600;700&display=swap" rel="stylesheet">`
      : "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resume.title}</title>
          ${fontLink}
          <style>
            @page {
              margin: 0;
              size: auto;
            }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { 
              margin: 0; 
              padding: 0;
              font-family: '${currentFont}', system-ui, -apple-system, sans-serif; 
            }
            @media print {
              html, body {
                margin: 0;
                padding: 0;
                print-color-adjust: exact; 
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5" />
            Preview
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={resume.data.metadata?.template || "classic"}
              onValueChange={(value) => updateTemplate(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="px-2 text-sm w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setZoom((z) => Math.min(1, z + 0.1))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleDownload} size="sm">
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto bg-muted/50 p-4">
        <div
          ref={previewRef}
          className="mx-auto shadow-lg"
          style={{
            width: `${8.5 * 96}px`,
            minHeight: `${11 * 96}px`,
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
          }}
        >
          {/* Force font-family with style tag for higher specificity */}
          {fontFamily && (
            <style
              dangerouslySetInnerHTML={{
                __html: `
                #resume-preview, #resume-preview * {
                  font-family: '${fontFamily}', system-ui, sans-serif !important;
                }
              `,
              }}
            />
          )}
          <TemplateComponent data={resume.data} key={fontLoaded} />
        </div>
      </CardContent>
    </Card>
  );
}
