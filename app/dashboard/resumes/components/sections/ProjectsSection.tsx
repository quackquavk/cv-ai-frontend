"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useResumeStore } from "../../store/resumeStore";
import { ProjectItem } from "../../services/resumeApi";
import { FolderKanban, Plus, Trash2, Link, X } from "lucide-react";
import { useState } from "react";
import { AIRewriteButton } from "../AIRewriteButton";

export function ProjectsSection() {
  const resume = useResumeStore((state) => state.resume);
  const addItem = useResumeStore((state) => state.addItem);
  const updateItem = useResumeStore((state) => state.updateItem);
  const removeItem = useResumeStore((state) => state.removeItem);
  const toggleItemVisibility = useResumeStore(
    (state) => state.toggleItemVisibility
  );

  const [newKeyword, setNewKeyword] = useState<{ [key: string]: string }>({});

  if (!resume) return null;

  const { projects } = resume.data.sections;

  const handleAdd = () => {
    const newItem: ProjectItem = {
      id: crypto.randomUUID(),
      visible: true,
      name: "",
      description: "",
      date: "",
      summary: "",
      keywords: [],
      url: { label: "", href: "" },
    };
    addItem("projects", newItem);
  };

  const addKeyword = (projectId: string) => {
    const keyword = newKeyword[projectId]?.trim();
    if (!keyword) return;

    const project = projects.items.find((p) => p.id === projectId);
    if (!project) return;

    updateItem("projects", projectId, {
      keywords: [...project.keywords, keyword],
    });
    setNewKeyword({ ...newKeyword, [projectId]: "" });
  };

  const removeKeyword = (projectId: string, keyword: string) => {
    const project = projects.items.find((p) => p.id === projectId);
    if (!project) return;

    updateItem("projects", projectId, {
      keywords: project.keywords.filter((k) => k !== keyword),
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FolderKanban className="h-5 w-5" />
            {projects.name}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {projects.items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No projects added yet
          </p>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {projects.items.map((item, index) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className={`border rounded-lg px-4 ${
                  !item.visible ? "opacity-50" : ""
                }`}
              >
                <AccordionTrigger className="hover:no-underline">
                  <span className="font-medium text-left">
                    {item.name || `Project ${index + 1}`}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Project Name</Label>
                      <Input
                        placeholder="Project Name"
                        value={item.name}
                        onChange={(e) =>
                          updateItem("projects", item.id, {
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        placeholder="2023 - Present"
                        value={item.date}
                        onChange={(e) =>
                          updateItem("projects", item.id, {
                            date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="Brief description"
                      value={item.description}
                      onChange={(e) =>
                        updateItem("projects", item.id, {
                          description: e.target.value,
                        })
                      }
                    />
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
                          updateItem("projects", item.id, {
                            url: { ...item.url, label: e.target.value },
                          })
                        }
                      />
                      <Input
                        placeholder="https://..."
                        value={item.url.href}
                        onChange={(e) =>
                          updateItem("projects", item.id, {
                            url: { ...item.url, href: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Keywords / Technologies</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add technology..."
                        value={newKeyword[item.id] || ""}
                        onChange={(e) =>
                          setNewKeyword({
                            ...newKeyword,
                            [item.id]: e.target.value,
                          })
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && addKeyword(item.id)
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addKeyword(item.id)}
                      >
                        Add
                      </Button>
                    </div>
                    {item.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.keywords.map((keyword) => (
                          <Badge
                            key={keyword}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeKeyword(item.id, keyword)}
                          >
                            {keyword}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Summary</Label>
                      <AIRewriteButton
                        content={item.summary}
                        contentType="project"
                        onRewrite={(newContent) =>
                          updateItem("projects", item.id, {
                            summary: newContent,
                          })
                        }
                      />
                    </div>
                    <Textarea
                      placeholder="Describe the project, your role, and key achievements..."
                      value={item.summary}
                      onChange={(e) =>
                        updateItem("projects", item.id, {
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
                          toggleItemVisibility("projects", item.id)
                        }
                      />
                      <Label className="text-sm">
                        {item.visible ? "Visible" : "Hidden"}
                      </Label>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem("projects", item.id)}
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
