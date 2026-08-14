import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH update transaction
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

    const transaction = await db.transaction.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: parseFloat(data.amount) }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.date !== undefined && { date: new Date(data.date) }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.clientId !== undefined && { clientId: data.clientId }),
      },
    });

    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE transaction
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
    await db.transaction.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction", details: error.message },
      { status: 500 }
    );
  }
}
