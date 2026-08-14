import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH update project
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Protect route
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await req.json();

    // If slug is changing, verify it's unique
    if (data.slug) {
      const existing = await db.project.findUnique({
        where: { slug: data.slug },
      });
      if (existing && existing.id !== id) {
        return NextResponse.json(
          { error: "A project with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const project = await db.project.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
        ...(data.tags !== undefined && { tags: Array.isArray(data.tags) ? data.tags : [] }),
        ...(data.liveUrl !== undefined && { liveUrl: data.liveUrl }),
        ...(data.githubUrl !== undefined && { githubUrl: data.githubUrl }),
        ...(data.featured !== undefined && { featured: Boolean(data.featured) }),
        ...(data.published !== undefined && { published: Boolean(data.published) }),
      },
    });

    return NextResponse.json(project);
  } catch (error: any) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE project
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Protect route
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await db.project.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project", details: error.message },
      { status: 500 }
    );
  }
}
