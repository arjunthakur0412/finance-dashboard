import { NextResponse } from "next/server";
import { exportDataJson } from "@/features/shared/actions";

export async function GET() {
  const json = await exportDataJson();
  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="finance-os-export.json"`,
    },
  });
}
