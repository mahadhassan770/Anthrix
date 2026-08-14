import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { offerings: true }
        }
      }
    });
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const service = await prisma.service.create({
      data: {
        title: body.title,
        slug: body.slug,
        tagline: body.tagline,
        description: body.description,
        icon: body.icon,
        order: body.order ? parseInt(body.order) : 0,
        published: body.published ?? true,
      },
    });
    return NextResponse.json(service);
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
