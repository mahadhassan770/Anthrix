import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET all clients
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const clients = await db.client.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(clients);
  } catch (error: any) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

// POST create new client
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.name) {
      return NextResponse.json(
        { error: "Client name is required" },
        { status: 400 }
      );
    }

    const client = await db.client.create({
      data: {
        name: data.name,
        company: data.company ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        status: data.status ?? "active",
        notes: data.notes ?? null,
        logo: data.logo ?? null,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client", details: error.message },
      { status: 500 }
    );
  }
}
