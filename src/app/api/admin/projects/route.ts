import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { revalidatePath, revalidateTag } from "next/cache";
import { ProjectBody, buildProjectRow, slugify } from "@/lib/project-payload";

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const parsed = ProjectBody.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  const slug = slugify(`${d.name}-${d.city}`);

  const sb = supabaseAdmin();
  const { error } = await sb.from("projects").insert({ slug, ...buildProjectRow(d) });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  revalidateTag("projects"); // refresh the cached project list immediately
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");

  return NextResponse.json({ ok: true, slug });
}
