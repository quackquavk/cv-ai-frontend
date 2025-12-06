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
import { ReferenceItem } from "../../services/resumeApi";
import { Users, Plus, Trash2, Link } from "lucide-react";

export function ReferencesSection() {
  const resume = useResumeStore((state) => state.resume);
  const addItem = useResumeStore((state) => state.addItem);
  const updateItem = useResumeStore((state) => state.updateItem);
  const removeItem = useResumeStore((state) => state.removeItem);
  const toggleItemVisibility = useResumeStore(
    (state) => state.toggleItemVisibility
  );

  if (!resume) return null;

  const { references } = resume.data.sections;

  const handleAdd = () => {
    const newItem: ReferenceItem = {
      id: crypto.randomUUID(),
      visible: true,
      name: "",
      description: "",
      summary: "",
      url: { label: "", href: "" },
    };
    addItem("references", newItem);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            {references.name}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {references.items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No references added yet
          </p>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {references.items.map((item, index) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className={`border rounded-lg px-4 ${
                  !item.visible ? "opacity-50" : ""
                }`}
              >
                <AccordionTrigger className="hover:no-underline">
                  <span className="font-medium text-left">
                    {item.name || `Reference ${index + 1}`}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        placeholder="Reference Name"
                        value={item.name}
                        onChange={(e) =>
                          updateItem("references", item.id, {
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description / Title</Label>
                      <Input
                        placeholder="CEO at Company"
                        value={item.description}
                        onChange={(e) =>
                          updateItem("references", item.id, {
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      Contact / URL
                    </Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="Email or Phone"
                        value={item.url.label}
                        onChange={(e) =>
                          updateItem("references", item.id, {
                            url: { ...item.url, label: e.target.value },
                          })
                        }
                      />
                      <Input
                        placeholder="mailto: or tel:"
                        value={item.url.href}
                        onChange={(e) =>
                          updateItem("references", item.id, {
                            url: { ...item.url, href: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Summary / Recommendation</Label>
                    <Textarea
                      placeholder="Brief recommendation or description..."
                      value={item.summary}
                      onChange={(e) =>
                        updateItem("references", item.id, {
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
                          toggleItemVisibility("references", item.id)
                        }
                      />
                      <Label className="text-sm">
                        {item.visible ? "Visible" : "Hidden"}
                      </Label>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem("references", item.id)}
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
