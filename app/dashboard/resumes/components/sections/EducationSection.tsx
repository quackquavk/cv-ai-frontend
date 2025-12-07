"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { useResumeStore } from "../../store/resumeStore";
import { EducationItem } from "../../services/resumeApi";
import { GraduationCap, Plus, Trash2, Link } from "lucide-react";
import { AIRewriteButton } from "../AIRewriteButton";

export function EducationSection() {
  const resume = useResumeStore((state) => state.resume);
  const addItem = useResumeStore((state) => state.addItem);
  const updateItem = useResumeStore((state) => state.updateItem);
  const removeItem = useResumeStore((state) => state.removeItem);
  const toggleItemVisibility = useResumeStore(
    (state) => state.toggleItemVisibility
  );

  if (!resume) return null;

  const { education } = resume.data.sections;

  const handleAdd = () => {
    const newItem: EducationItem = {
      id: crypto.randomUUID(),
      visible: true,
      institution: "",
      studyType: "",
      area: "",
      score: "",
      date: "",
      summary: "",
      url: { label: "", href: "" },
    };
    addItem("education", newItem);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5" />
            {education.name}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {education.items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No education added yet
          </p>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {education.items.map((item, index) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className={`border rounded-lg px-4 ${
                  !item.visible ? "opacity-50" : ""
                }`}
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2 text-left flex-1">
                    <span className="font-medium">
                      {item.studyType ||
                        item.institution ||
                        `Education ${index + 1}`}
                    </span>
                    {item.institution && item.studyType && (
                      <span className="text-muted-foreground">
                        at {item.institution}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Institution</Label>
                    <Input
                      placeholder="University/School Name"
                      value={item.institution}
                      onChange={(e) =>
                        updateItem("education", item.id, {
                          institution: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Degree / Study Type</Label>
                      <Input
                        placeholder="Bachelor's, Master's, etc."
                        value={item.studyType}
                        onChange={(e) =>
                          updateItem("education", item.id, {
                            studyType: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Field of Study</Label>
                      <Input
                        placeholder="Computer Science"
                        value={item.area}
                        onChange={(e) =>
                          updateItem("education", item.id, {
                            area: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Score / GPA</Label>
                      <Input
                        placeholder="3.8/4.0"
                        value={item.score}
                        onChange={(e) =>
                          updateItem("education", item.id, {
                            score: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        placeholder="2016 - 2020"
                        value={item.date}
                        onChange={(e) =>
                          updateItem("education", item.id, {
                            date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      Website
                    </Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="Label"
                        value={item.url.label}
                        onChange={(e) =>
                          updateItem("education", item.id, {
                            url: { ...item.url, label: e.target.value },
                          })
                        }
                      />
                      <Input
                        placeholder="https://..."
                        value={item.url.href}
                        onChange={(e) =>
                          updateItem("education", item.id, {
                            url: { ...item.url, href: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Summary</Label>
                      <AIRewriteButton
                        content={item.summary}
                        contentType="education"
                        onRewrite={(newContent) =>
                          updateItem("education", item.id, {
                            summary: newContent,
                          })
                        }
                      />
                    </div>
                    <Textarea
                      placeholder="Relevant coursework, honors, activities..."
                      value={item.summary}
                      onChange={(e) =>
                        updateItem("education", item.id, {
                          summary: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={item.visible}
                        onCheckedChange={() =>
                          toggleItemVisibility("education", item.id)
                        }
                      />
                      <Label className="text-sm">
                        {item.visible ? "Visible" : "Hidden"}
                      </Label>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem("education", item.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
