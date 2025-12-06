"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useResumeStore } from "../../store/resumeStore";
import { ProfileItem } from "../../services/resumeApi";
import { Share2, Plus, Trash2, Link } from "lucide-react";

export function ProfilesSection() {
  const resume = useResumeStore((state) => state.resume);
  const addItem = useResumeStore((state) => state.addItem);
  const updateItem = useResumeStore((state) => state.updateItem);
  const removeItem = useResumeStore((state) => state.removeItem);

  if (!resume) return null;

  const { profiles } = resume.data.sections;

  const handleAdd = () => {
    const newItem: ProfileItem = {
      id: crypto.randomUUID(),
      visible: true,
      network: "",
      username: "",
      icon: "",
      url: { label: "", href: "" },
    };
    addItem("profiles", newItem);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-5 w-5" />
            {profiles.name}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {profiles.items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No profiles added yet
          </p>
        ) : (
          <div className="space-y-4">
            {profiles.items.map((item) => (
              <div
                key={item.id}
                className={`p-4 border rounded-lg space-y-3 ${
                  !item.visible ? "opacity-50" : ""
                }`}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Network</Label>
                    <Input
                      placeholder="e.g., LinkedIn, GitHub, Twitter"
                      value={item.network}
                      onChange={(e) =>
                        updateItem("profiles", item.id, {
                          network: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                      placeholder="@johndoe"
                      value={item.username}
                      onChange={(e) =>
                        updateItem("profiles", item.id, {
                          username: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Input
                      placeholder="fa-brands:linkedin"
                      value={item.icon}
                      onChange={(e) =>
                        updateItem("profiles", item.id, {
                          icon: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      URL
                    </Label>
                    <Input
                      placeholder="https://linkedin.com/in/johndoe"
                      value={item.url.href}
                      onChange={(e) =>
                        updateItem("profiles", item.id, {
                          url: { ...item.url, href: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={item.visible}
                      onCheckedChange={() =>
                        updateItem("profiles", item.id, {
                          visible: !item.visible,
                        })
                      }
                    />
                    <Label className="text-sm">
                      {item.visible ? "Visible" : "Hidden"}
                    </Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem("profiles", item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
