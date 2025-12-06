"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useResumeStore } from "../../store/resumeStore";
import { LanguageItem } from "../../services/resumeApi";
import { Languages, Plus, Trash2 } from "lucide-react";

export function LanguagesSection() {
  const resume = useResumeStore((state) => state.resume);
  const addItem = useResumeStore((state) => state.addItem);
  const updateItem = useResumeStore((state) => state.updateItem);
  const removeItem = useResumeStore((state) => state.removeItem);

  if (!resume) return null;

  const { languages } = resume.data.sections;

  const handleAdd = () => {
    const newItem: LanguageItem = {
      id: crypto.randomUUID(),
      visible: true,
      name: "",
      description: "",
      level: 3,
    };
    addItem("languages", newItem);
  };

  const levelLabels = [
    "Basic",
    "Elementary",
    "Intermediate",
    "Upper Intermediate",
    "Fluent",
    "Native",
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Languages className="h-5 w-5" />
            {languages.name}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {languages.items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No languages added yet
          </p>
        ) : (
          <div className="space-y-4">
            {languages.items.map((item) => (
              <div
                key={item.id}
                className={`p-4 border rounded-lg space-y-3 ${
                  !item.visible ? "opacity-50" : ""
                }`}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Input
                      placeholder="e.g., English"
                      value={item.name}
                      onChange={(e) =>
                        updateItem("languages", item.id, {
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="e.g., Professional working proficiency"
                      value={item.description}
                      onChange={(e) =>
                        updateItem("languages", item.id, {
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Level: {levelLabels[item.level]}</Label>
                  </div>
                  <Slider
                    value={[item.level]}
                    min={0}
                    max={5}
                    step={1}
                    onValueChange={([value]) =>
                      updateItem("languages", item.id, { level: value })
                    }
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={item.visible}
                      onCheckedChange={() =>
                        updateItem("languages", item.id, {
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
                    onClick={() => removeItem("languages", item.id)}
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
