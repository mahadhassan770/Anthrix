import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET all messages with filtering and stats
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim().toLowerCase();
    const filter = searchParams.get("filter") || "all";

    // Fetch all messages
    const allMessages = await db.message.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Compute stats
    const total = allMessages.length;
    const unread = allMessages.filter((m) => !m.read).length;
    const leads = allMessages.filter((m) => m.subject?.includes("[AI Assistant Lead]") || m.subject?.includes("[Copilot Lead]")).length;
    const contact = allMessages.filter((m) => !m.subject?.includes("[AI Assistant Lead]") && !m.subject?.includes("[Copilot Lead]")).length;

    // Apply filtering
    let filtered = allMessages;

    if (filter === "unread") {
      filtered = filtered.filter((m) => !m.read);
    } else if (filter === "read") {
      filtered = filtered.filter((m) => m.read);
    } else if (filter === "leads") {
      filtered = filtered.filter((m) => m.subject?.includes("[AI Assistant Lead]") || m.subject?.includes("[Copilot Lead]"));
    } else if (filter === "contact") {
      filtered = filtered.filter((m) => !m.subject?.includes("[AI Assistant Lead]") && !m.subject?.includes("[Copilot Lead]"));
    }

    // Apply search
    if (query) {
      filtered = filtered.filter((m) =>
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        (m.subject && m.subject.toLowerCase().includes(query)) ||
        m.body.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      messages: filtered,
      counts: {
        total,
        unread,
        leads,
        contact,
      },
    });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// PATCH bulk update (mark read/unread)
export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ids, read } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0 || typeof read !== "boolean") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await db.message.updateMany({
      where: { id: { in: ids } },
      data: { read },
    });

    return NextResponse.json({ success: true, count: ids.length });
  } catch (error: any) {
    console.error("Error bulk updating messages:", error);
    return NextResponse.json({ error: "Failed to update messages" }, { status: 500 });
  }
}

// DELETE bulk delete
export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await db.message.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true, count: ids.length });
  } catch (error: any) {
    console.error("Error bulk deleting messages:", error);
    return NextResponse.json({ error: "Failed to delete messages" }, { status: 500 });
  }
}
