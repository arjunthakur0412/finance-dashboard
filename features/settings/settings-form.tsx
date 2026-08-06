"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateSettings } from "@/features/shared/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export function SettingsForm({
  settings,
}: {
  settings: {
    currency: string;
    theme: "dark" | "light" | "system";
    notificationsEnabled: boolean;
  };
}) {
  const [pending, start] = useTransition();
  const [theme, setTheme] = useState(settings.theme);
  const [currency, setCurrency] = useState(settings.currency);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 sm:grid-cols-2"
          action={(fd) => {
            fd.set("theme", theme);
            fd.set("currency", currency);
            start(async () => {
              await updateSettings(fd);
              toast.success("Settings saved");
            });
          }}
        >
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v as typeof theme)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              name="notificationsEnabled"
              defaultChecked={settings.notificationsEnabled}
              className="rounded"
            />
            Enable notifications / reminders
          </label>
          <Button type="submit" disabled={pending} className="sm:col-span-2 sm:w-fit">
            Save preferences
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
