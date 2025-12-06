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
import { ExperienceItem } from "../../services/resumeApi";
import { Briefcase, Plus, Trash2, Eye, EyeOff, Link } from "lucide-react";

export function ExperienceSection() {
  const resume = useResumeStore((state) => state.resume);
  const addItem = useResumeStore((state) => state.addItem);
  const updateItem = useResumeStore((state) => state.updateItem);
  const removeItem = useResumeStore((state) => state.removeItem);
  const toggleItemVisibility = useResumeStore(
    (state) => state.toggleItemVisibility
  );

  if (!resume) return null;

  const { experience } = resume.data.sections;

  const handleAdd = () => {
    const newItem: ExperienceItem = {
      id: crypto.randomUUID(),
      visible: true,
      company: "",
      position: "",
      location: "",
      date: "",
      summary: "",
      url: { label: "", href: "" },
    };
    addItem("experience", newItem);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5" />
            {experience.name}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {experience.items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No work experience added yet
          </p>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {experience.items.map((item, index) => (
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
                      {item.position ||
                        item.company ||
                        `Experience ${index + 1}`}
                    </span>
                    {item.company && item.position && (
                      <span className="text-muted-foreground">
                        at {item.company}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        placeholder="Company Name"
                        value={item.company}
                        onChange={(e) =>
                          updateItem("experience", item.id, {
                            company: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Input
                        placeholder="Job Title"
                        value={item.position}
                        onChange={(e) =>
                          updateItem("experience", item.id, {
                            position: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        placeholder="City, Country"
                        value={item.location}
                        onChange={(e) =>
                          updateItem("experience", item.id, {
                            location: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        placeholder="Jan 2020 - Present"
                        value={item.date}
                        onChange={(e) =>
                          updateItem("experience", item.id, {
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
                          updateItem("experience", item.id, {
                            url: { ...item.url, label: e.target.value },
                          })
                        }
                      />
                      <Input
                        placeholder="https://..."
                        value={item.url.href}
                        onChange={(e) =>
                          updateItem("experience", item.id, {
                            url: { ...item.url, href: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Summary</Label>
                    <Textarea
                      placeholder="Describe your responsibilities and achievements..."
                      value={item.summary}
                      onChange={(e) =>
                        updateItem("experience", item.id, {
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
                          toggleItemVisibility("experience", item.id)
                        }
                      />
                      <Label className="text-sm">
                        {item.visible ? "Visible" : "Hidden"}
                      </Label>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem("experience", item.id)}
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
