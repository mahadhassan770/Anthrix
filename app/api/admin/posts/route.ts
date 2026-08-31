import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET all posts (Admin only)
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const posts = await db.post.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(posts);
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST create new post (Admin only)
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.title || !data.slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    const cleanSlug = String(data.slug)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check slug uniqueness
    const existing = await db.post.findUnique({
      where: { slug: cleanSlug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A post with this slug already exists" },
        { status: 400 }
      );
    }

    const post = await db.post.create({
      data: {
        title: data.title.trim(),
        slug: cleanSlug,
        excerpt: data.excerpt ? data.excerpt.trim() : null,
        content: data.content ? data.content.trim() : null,
        coverImage: null, // Strictly no images in blogs
        tags: Array.isArray(data.tags) ? data.tags.map((t: string) => t.trim()).filter(Boolean) : [],
        published: Boolean(data.published),
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post", details: error.message },
      { status: 500 }
    );
  }
}
