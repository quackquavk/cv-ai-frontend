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
import { CertificationItem } from "../../services/resumeApi";
import { Award, Plus, Trash2, Link } from "lucide-react";

export function CertificationsSection() {
  const resume = useResumeStore((state) => state.resume);
  const addItem = useResumeStore((state) => state.addItem);
  const updateItem = useResumeStore((state) => state.updateItem);
  const removeItem = useResumeStore((state) => state.removeItem);
  const toggleItemVisibility = useResumeStore(
    (state) => state.toggleItemVisibility
  );

  if (!resume) return null;

  const { certifications } = resume.data.sections;

  const handleAdd = () => {
    const newItem: CertificationItem = {
      id: crypto.randomUUID(),
      visible: true,
      name: "",
      issuer: "",
      date: "",
      summary: "",
      url: { label: "", href: "" },
    };
    addItem("certifications", newItem);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5" />
            {certifications.name}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {certifications.items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No certifications added yet
          </p>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {certifications.items.map((item, index) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className={`border rounded-lg px-4 ${
                  !item.visible ? "opacity-50" : ""
                }`}
              >
                <AccordionTrigger className="hover:no-underline">
                  <span className="font-medium text-left">
                    {item.name || `Certification ${index + 1}`}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Certification Name</Label>
                      <Input
                        placeholder="AWS Solutions Architect"
                        value={item.name}
                        onChange={(e) =>
                          updateItem("certifications", item.id, {
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Issuer</Label>
                      <Input
                        placeholder="Amazon Web Services"
                        value={item.issuer}
                        onChange={(e) =>
                          updateItem("certifications", item.id, {
                            issuer: e.target.value,
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
                        updateItem("certifications", item.id, {
                          date: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      Credential URL
                    </Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="Label"
                        value={item.url.label}
                        onChange={(e) =>
                          updateItem("certifications", item.id, {
                            url: { ...item.url, label: e.target.value },
                          })
                        }
                      />
                      <Input
                        placeholder="https://..."
                        value={item.url.href}
                        onChange={(e) =>
                          updateItem("certifications", item.id, {
                            url: { ...item.url, href: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Summary</Label>
                    <Textarea
                      placeholder="Additional details..."
                      value={item.summary}
                      onChange={(e) =>
                        updateItem("certifications", item.id, {
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
                          toggleItemVisibility("certifications", item.id)
                        }
                      />
                      <Label className="text-sm">
                        {item.visible ? "Visible" : "Hidden"}
                      </Label>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem("certifications", item.id)}
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
