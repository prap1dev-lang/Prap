import { NextResponse } from "next/server";
import { PROJECTS } from "@/lib/projects";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const q = (searchParams.get("q") || "").toLowerCase();

  let list = PROJECTS;
  if (city) list = list.filter((p) => p.city.toLowerCase() === city.toLowerCase());
  if (q) {
    list = list.filter((p) =>
      [p.name, p.builder, p.sector, p.city, p.description].join(" ").toLowerCase().includes(q),
    );
  }

  return NextResponse.json({ ok: true, count: list.length, projects: list });
}
