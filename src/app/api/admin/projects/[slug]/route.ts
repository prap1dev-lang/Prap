import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import { revalidatePath, revalidateTag } from "next/cache";
import { ProjectBody, buildProjectRow } from "@/lib/project-payload";

type Params = { params: { slug: string } };

// Update an existing project by slug. The slug itself is not changed so that
// existing links and SEO stay stable.
export async function PUT(req: Request, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const parsed = ProjectBody.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("projects")
    .update(buildProjectRow(parsed.data))
    .eq("slug", params.slug)
    .select("slug")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  revalidateTag("projects");
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${params.slug}`);
  revalidatePath(`/projects/${params.slug}`);
  revalidatePath("/projects");
  revalidatePath("/");

  return NextResponse.json({ ok: true, slug: data.slug });
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const sb = supabaseAdmin();
  const { error } = await sb.from("projects").delete().eq("slug", params.slug);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  revalidateTag("projects");
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
