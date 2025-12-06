"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "../../store/resumeStore";
import { User, Link, Plus, Trash2 } from "lucide-react";

export function BasicsSection() {
  const resume = useResumeStore((state) => state.resume);
  const updateBasics = useResumeStore((state) => state.updateBasics);

  if (!resume) return null;

  const { basics } = resume.data;

  const addCustomField = () => {
    updateBasics({
      customFields: [
        ...basics.customFields,
        { id: crypto.randomUUID(), icon: "", name: "", value: "" },
      ],
    });
  };

  const updateCustomField = (
    id: string,
    field: Partial<(typeof basics.customFields)[0]>
  ) => {
    updateBasics({
      customFields: basics.customFields.map((f) =>
        f.id === id ? { ...f, ...field } : f
      ),
    });
  };

  const removeCustomField = (id: string) => {
    updateBasics({
      customFields: basics.customFields.filter((f) => f.id !== id),
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={basics.name}
              onChange={(e) => updateBasics({ name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              placeholder="Software Engineer"
              value={basics.headline}
              onChange={(e) => updateBasics({ headline: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={basics.email}
              onChange={(e) => updateBasics({ email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="+1 (555) 123-4567"
              value={basics.phone}
              onChange={(e) => updateBasics({ phone: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="San Francisco, CA"
            value={basics.location}
            onChange={(e) => updateBasics({ location: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Website
          </Label>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="Label (e.g., Portfolio)"
              value={basics.url.label}
              onChange={(e) =>
                updateBasics({ url: { ...basics.url, label: e.target.value } })
              }
            />
            <Input
              placeholder="https://example.com"
              value={basics.url.href}
              onChange={(e) =>
                updateBasics({ url: { ...basics.url, href: e.target.value } })
              }
            />
          </div>
        </div>

        {/* Custom Fields */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Custom Fields</Label>
            <Button variant="outline" size="sm" onClick={addCustomField}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          {basics.customFields.length > 0 && (
            <div className="space-y-2">
              {basics.customFields.map((field) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <Input
                    placeholder="Icon"
                    value={field.icon}
                    onChange={(e) =>
                      updateCustomField(field.id, { icon: e.target.value })
                    }
                    className="w-20"
                  />
                  <Input
                    placeholder="Name"
                    value={field.name}
                    onChange={(e) =>
                      updateCustomField(field.id, { name: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={field.value}
                    onChange={(e) =>
                      updateCustomField(field.id, { value: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCustomField(field.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
