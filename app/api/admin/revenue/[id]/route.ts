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
    const DEFAULT_RATE = 280.0;
    const rate = parseFloat(data.exchangeRate) || DEFAULT_RATE;
    const currency = data.currency ? data.currency.toUpperCase() : undefined;

    let updateData: any = {
      ...(data.description !== undefined && { description: data.description }),
      ...(data.date !== undefined && { date: new Date(data.date) }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.clientId !== undefined && { clientId: data.clientId }),
      ...(currency !== undefined && { currency }),
    };

    if (data.amount !== undefined) {
      const rawAmount = parseFloat(data.amount);
      const curr = currency || "USD";
      if (curr === "PKR") {
        updateData.amount = rawAmount / rate;
        updateData.amountPKR = rawAmount;
      } else {
        updateData.amount = rawAmount;
        updateData.amountPKR = rawAmount * rate;
      }
      updateData.exchangeRate = rate;
    }

    const transaction = await db.transaction.update({
      where: { id },
      data: updateData,
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
