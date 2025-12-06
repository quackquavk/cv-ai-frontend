"use client";

import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResumeStore } from "../../store/resumeStore";
import { FileText } from "lucide-react";

export function SummarySection() {
  const resume = useResumeStore((state) => state.resume);
  const updateSummary = useResumeStore((state) => state.updateSummary);

  if (!resume) return null;

  const { summary } = resume.data.sections;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          {summary.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="A brief overview of your professional background, skills, and career objectives..."
          value={summary.content}
          onChange={(e) => updateSummary(e.target.value)}
          rows={5}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Write a compelling summary that highlights your key achievements and
          goals.
        </p>
      </CardContent>
    </Card>
  );
}
