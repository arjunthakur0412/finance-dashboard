"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { exportDataJson, importDataJson } from "@/features/shared/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ExportImport() {
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Export / Import</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => {
            start(async () => {
              const json = await exportDataJson();
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `finance-os-export-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success("Exported");
            });
          }}
        >
          Export JSON
        </Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={pending}>
          Import JSON
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            start(async () => {
              const text = await file.text();
              await importDataJson(text);
              toast.success("Imported — refreshing");
              window.location.reload();
            });
          }}
        />
      </CardContent>
    </Card>
  );
}
