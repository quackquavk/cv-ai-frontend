"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useResumeStore } from "../../store/resumeStore";
import { InterestItem } from "../../services/resumeApi";
import { Heart, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

export function InterestsSection() {
  const resume = useResumeStore((state) => state.resume);
  const addItem = useResumeStore((state) => state.addItem);
  const updateItem = useResumeStore((state) => state.updateItem);
  const removeItem = useResumeStore((state) => state.removeItem);

  const [newKeyword, setNewKeyword] = useState<{ [key: string]: string }>({});

  if (!resume) return null;

  const { interests } = resume.data.sections;

  const handleAdd = () => {
    const newItem: InterestItem = {
      id: crypto.randomUUID(),
      visible: true,
      name: "",
      keywords: [],
    };
    addItem("interests", newItem);
  };

  const addKeyword = (interestId: string) => {
    const keyword = newKeyword[interestId]?.trim();
    if (!keyword) return;

    const interest = interests.items.find((i) => i.id === interestId);
    if (!interest) return;

    updateItem("interests", interestId, {
      keywords: [...interest.keywords, keyword],
    });
    setNewKeyword({ ...newKeyword, [interestId]: "" });
  };

  const removeKeyword = (interestId: string, keyword: string) => {
    const interest = interests.items.find((i) => i.id === interestId);
    if (!interest) return;

    updateItem("interests", interestId, {
      keywords: interest.keywords.filter((k) => k !== keyword),
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5" />
            {interests.name}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {interests.items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No interests added yet
          </p>
        ) : (
          <div className="space-y-4">
            {interests.items.map((item) => (
              <div
                key={item.id}
                className={`p-4 border rounded-lg space-y-3 ${
                  !item.visible ? "opacity-50" : ""
                }`}
              >
                <div className="space-y-2">
                  <Label>Interest</Label>
                  <Input
                    placeholder="e.g., Photography"
                    value={item.name}
                    onChange={(e) =>
                      updateItem("interests", item.id, { name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add related keyword..."
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
                        updateItem("interests", item.id, {
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
                    onClick={() => removeItem("interests", item.id)}
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
