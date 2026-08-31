import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET single post (Admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const post = await db.post.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

// PATCH update post (Admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await req.json();

    let cleanSlug = undefined;
    if (data.slug) {
      cleanSlug = String(data.slug)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const existing = await db.post.findUnique({
        where: { slug: cleanSlug },
      });
      if (existing && existing.id !== id) {
        return NextResponse.json(
          { error: "A post with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const post = await db.post.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title.trim() }),
        ...(cleanSlug !== undefined && { slug: cleanSlug }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt ? data.excerpt.trim() : null }),
        ...(data.content !== undefined && { content: data.content ? data.content.trim() : null }),
        coverImage: null, // Strictly no images in blogs
        ...(data.tags !== undefined && { tags: Array.isArray(data.tags) ? data.tags.map((t: string) => t.trim()).filter(Boolean) : [] }),
        ...(data.published !== undefined && { published: Boolean(data.published) }),
      },
    });

    return NextResponse.json(post);
  } catch (error: any) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE post (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await db.post.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post", details: error.message },
      { status: 500 }
    );
  }
}
