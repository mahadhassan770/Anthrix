import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET all projects
export async function GET(req: NextRequest) {
  // Protect route
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await db.project.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(projects);
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// POST create new project
export async function POST(req: NextRequest) {
  // Protect route
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Basic validation
    if (!data.title || !data.slug || !data.description) {
      return NextResponse.json(
        { error: "Title, slug, and description are required" },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await db.project.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A project with this slug already exists" },
        { status: 400 }
      );
    }

    const project = await db.project.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        content: data.content ?? null,
        coverImage: data.coverImage ?? null,
        tags: Array.isArray(data.tags) ? data.tags : [],
        liveUrl: data.liveUrl ?? null,
        githubUrl: data.githubUrl ?? null,
        featured: Boolean(data.featured),
        published: Boolean(data.published),
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project", details: error.message },
      { status: 500 }
    );
  }
}
