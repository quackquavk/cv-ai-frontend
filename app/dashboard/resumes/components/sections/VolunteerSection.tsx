"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useResumeStore } from "../../store/resumeStore";
import { VolunteerItem } from "../../services/resumeApi";
import { HeartHandshake, Plus, Trash2, Link } from "lucide-react";
import { AIRewriteButton } from "../AIRewriteButton";

export function VolunteerSection() {
  const resume = useResumeStore((state) => state.resume);
  const addItem = useResumeStore((state) => state.addItem);
  const updateItem = useResumeStore((state) => state.updateItem);
  const removeItem = useResumeStore((state) => state.removeItem);
  const toggleItemVisibility = useResumeStore(
    (state) => state.toggleItemVisibility
  );

  if (!resume) return null;

  const { volunteer } = resume.data.sections;

  const handleAdd = () => {
    const newItem: VolunteerItem = {
      id: crypto.randomUUID(),
      visible: true,
      organization: "",
      position: "",
      location: "",
      date: "",
      summary: "",
      url: { label: "", href: "" },
    };
    addItem("volunteer", newItem);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <HeartHandshake className="h-5 w-5" />
            {volunteer.name}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {volunteer.items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No volunteer experience added yet
          </p>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {volunteer.items.map((item, index) => (
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
                        item.organization ||
                        `Volunteer ${index + 1}`}
                    </span>
                    {item.organization && item.position && (
                      <span className="text-muted-foreground">
                        at {item.organization}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Organization</Label>
                      <Input
                        placeholder="Organization Name"
                        value={item.organization}
                        onChange={(e) =>
                          updateItem("volunteer", item.id, {
                            organization: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Input
                        placeholder="Volunteer Role"
                        value={item.position}
                        onChange={(e) =>
                          updateItem("volunteer", item.id, {
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
                          updateItem("volunteer", item.id, {
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
                          updateItem("volunteer", item.id, {
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
                          updateItem("volunteer", item.id, {
                            url: { ...item.url, label: e.target.value },
                          })
                        }
                      />
                      <Input
                        placeholder="https://..."
                        value={item.url.href}
                        onChange={(e) =>
                          updateItem("volunteer", item.id, {
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
                        contentType="volunteer"
                        onRewrite={(newContent) =>
                          updateItem("volunteer", item.id, {
                            summary: newContent,
                          })
                        }
                      />
                    </div>
                    <Textarea
                      placeholder="Describe your volunteer work..."
                      value={item.summary}
                      onChange={(e) =>
                        updateItem("volunteer", item.id, {
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
                          toggleItemVisibility("volunteer", item.id)
                        }
                      />
                      <Label className="text-sm">
                        {item.visible ? "Visible" : "Hidden"}
                      </Label>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem("volunteer", item.id)}
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
