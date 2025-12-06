"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useResumeStore } from "../../store/resumeStore";
import { SkillItem } from "../../services/resumeApi";
import { Wrench, Plus, X, Trash2 } from "lucide-react";
import { useState } from "react";

export function SkillsSection() {
  const resume = useResumeStore((state) => state.resume);
  const addItem = useResumeStore((state) => state.addItem);
  const updateItem = useResumeStore((state) => state.updateItem);
  const removeItem = useResumeStore((state) => state.removeItem);

  const [newKeyword, setNewKeyword] = useState<{ [key: string]: string }>({});

  if (!resume) return null;

  const { skills } = resume.data.sections;

  const handleAdd = () => {
    const newItem: SkillItem = {
      id: crypto.randomUUID(),
      visible: true,
      name: "",
      description: "",
      level: 3,
      keywords: [],
    };
    addItem("skills", newItem);
  };

  const addKeyword = (skillId: string) => {
    const keyword = newKeyword[skillId]?.trim();
    if (!keyword) return;

    const skill = skills.items.find((s) => s.id === skillId);
    if (!skill) return;

    updateItem("skills", skillId, {
      keywords: [...skill.keywords, keyword],
    });
    setNewKeyword({ ...newKeyword, [skillId]: "" });
  };

  const removeKeyword = (skillId: string, keyword: string) => {
    const skill = skills.items.find((s) => s.id === skillId);
    if (!skill) return;

    updateItem("skills", skillId, {
      keywords: skill.keywords.filter((k) => k !== keyword),
    });
  };

  const levelLabels = [
    "Beginner",
    "Basic",
    "Intermediate",
    "Advanced",
    "Expert",
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wrench className="h-5 w-5" />
            {skills.name}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {skills.items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No skills added yet
          </p>
        ) : (
          <div className="space-y-4">
            {skills.items.map((item) => (
              <div
                key={item.id}
                className={`p-4 border rounded-lg space-y-4 ${
                  !item.visible ? "opacity-50" : ""
                }`}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Skill Name</Label>
                    <Input
                      placeholder="e.g., JavaScript"
                      value={item.name}
                      onChange={(e) =>
                        updateItem("skills", item.id, { name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="Brief description"
                      value={item.description}
                      onChange={(e) =>
                        updateItem("skills", item.id, {
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Level: {levelLabels[item.level]}</Label>
                    <span className="text-sm text-muted-foreground">
                      {item.level}/5
                    </span>
                  </div>
                  <Slider
                    value={[item.level]}
                    min={0}
                    max={4}
                    step={1}
                    onValueChange={([value]) =>
                      updateItem("skills", item.id, { level: value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add keyword..."
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

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={item.visible}
                      onCheckedChange={() =>
                        updateItem("skills", item.id, {
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
                    onClick={() => removeItem("skills", item.id)}
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
