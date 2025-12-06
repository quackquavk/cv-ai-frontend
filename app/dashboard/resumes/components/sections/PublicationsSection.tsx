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
import { PublicationItem } from "../../services/resumeApi";
import { BookOpen, Plus, Trash2, Link } from "lucide-react";

export function PublicationsSection() {
  const resume = useResumeStore((state) => state.resume);
  const addItem = useResumeStore((state) => state.addItem);
  const updateItem = useResumeStore((state) => state.updateItem);
  const removeItem = useResumeStore((state) => state.removeItem);
  const toggleItemVisibility = useResumeStore(
    (state) => state.toggleItemVisibility
  );

  if (!resume) return null;

  const { publications } = resume.data.sections;

  const handleAdd = () => {
    const newItem: PublicationItem = {
      id: crypto.randomUUID(),
      visible: true,
      name: "",
      publisher: "",
      date: "",
      summary: "",
      url: { label: "", href: "" },
    };
    addItem("publications", newItem);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5" />
            {publications.name}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {publications.items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No publications added yet
          </p>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {publications.items.map((item, index) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className={`border rounded-lg px-4 ${
                  !item.visible ? "opacity-50" : ""
                }`}
              >
                <AccordionTrigger className="hover:no-underline">
                  <span className="font-medium text-left">
                    {item.name || `Publication ${index + 1}`}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Publication Name</Label>
                      <Input
                        placeholder="Article or Paper Title"
                        value={item.name}
                        onChange={(e) =>
                          updateItem("publications", item.id, {
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Publisher</Label>
                      <Input
                        placeholder="Journal, Magazine, etc."
                        value={item.publisher}
                        onChange={(e) =>
                          updateItem("publications", item.id, {
                            publisher: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      placeholder="Jan 2023"
                      value={item.date}
                      onChange={(e) =>
                        updateItem("publications", item.id, {
                          date: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      URL
                    </Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="Label"
                        value={item.url.label}
                        onChange={(e) =>
                          updateItem("publications", item.id, {
                            url: { ...item.url, label: e.target.value },
                          })
                        }
                      />
                      <Input
                        placeholder="https://..."
                        value={item.url.href}
                        onChange={(e) =>
                          updateItem("publications", item.id, {
                            url: { ...item.url, href: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Summary</Label>
                    <Textarea
                      placeholder="Brief description..."
                      value={item.summary}
                      onChange={(e) =>
                        updateItem("publications", item.id, {
                          summary: e.target.value,
                        })
                      }
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={item.visible}
                        onCheckedChange={() =>
                          toggleItemVisibility("publications", item.id)
                        }
                      />
                      <Label className="text-sm">
                        {item.visible ? "Visible" : "Hidden"}
                      </Label>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem("publications", item.id)}
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
