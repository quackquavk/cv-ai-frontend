"use client";

import { useResumeStore } from "../../store/resumeStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileJson, FileText, Loader2 } from "lucide-react";
import { useState } from "react";

export function ExportSection() {
  const resume = useResumeStore((state) => state.resume);
  const [isPdfExporting, setIsPdfExporting] = useState(false);

  if (!resume) return null;

  const handleJsonExport = () => {
    const filename = `resume-${resume.resume_id}.json`;
    const resumeJSON = JSON.stringify(resume.data, null, 2);
    const blob = new Blob([resumeJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePdfExport = async () => {
    setIsPdfExporting(true);

    try {
      // Open print dialog for the preview
      const printContent = document.getElementById("resume-preview");
      if (!printContent) {
        setIsPdfExporting(false);
        return;
      }

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        setIsPdfExporting(false);
        return;
      }

      // Get the current font family
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
      const currentFont =
        resume.data.metadata?.typography?.font?.family || "Inter";
      const theme = resume.data.metadata?.theme || {};

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
        setIsPdfExporting(false);
      }, 500);
    } catch (error) {
      setIsPdfExporting(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Download className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Export</h3>
      </div>

      <div className="space-y-3">
        {/* JSON Export */}
        <button
          onClick={handleJsonExport}
          className="w-full flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left group"
        >
          <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20 transition-colors">
            <FileJson className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">JSON</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Download resume data for backup or import later
            </p>
          </div>
        </button>

        {/* PDF Export */}
        <button
          onClick={handlePdfExport}
          disabled={isPdfExporting}
          className="w-full flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="p-2 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 group-hover:bg-red-500/20 transition-colors">
            {isPdfExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">PDF</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Print or save as PDF for job applications
            </p>
          </div>
        </button>
      </div>
    </Card>
  );
}
