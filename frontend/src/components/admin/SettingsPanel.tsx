import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings, useUpdateSetting } from "@/hooks/use-admin";

export function SettingsPanel() {
  const { data: settings, isLoading } = useSettings();
  const updateSetting = useUpdateSetting();
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading settings...</p>;
  }

  if (!settings || settings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p className="text-sm">No settings configured yet.</p>
          <p className="text-xs mt-1">
            Settings will appear here after initial database setup.
          </p>
        </CardContent>
      </Card>
    );
  }

  const categories = [...new Set(settings.map((s) => s.category))];

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-base capitalize">{category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings
              .filter((s) => s.category === category)
              .map((setting) => (
                <div key={setting.key} className="flex items-end gap-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs font-mono">{setting.key}</Label>
                    {setting.description && (
                      <p className="text-xs text-muted-foreground">
                        {setting.description}
                      </p>
                    )}
                    <Input
                      value={
                        editValues[setting.key] !== undefined
                          ? editValues[setting.key]
                          : setting.value
                      }
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev,
                          [setting.key]: e.target.value,
                        }))
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={
                      editValues[setting.key] === undefined ||
                      editValues[setting.key] === setting.value
                    }
                    onClick={() => {
                      updateSetting.mutate({
                        key: setting.key,
                        value: editValues[setting.key],
                      });
                      setEditValues((prev) => {
                        const next = { ...prev };
                        delete next[setting.key];
                        return next;
                      });
                    }}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
