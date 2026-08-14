import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH update client
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

    const client = await db.client.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.company !== undefined && { company: data.company }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.logo !== undefined && { logo: data.logo }),
      },
    });

    return NextResponse.json(client);
  } catch (error: any) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Failed to update client", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE client
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
    await db.client.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Failed to delete client", details: error.message },
      { status: 500 }
    );
  }
}
