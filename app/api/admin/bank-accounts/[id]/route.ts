import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();
  if (data.isDefault) {
    await db.bankAccount.updateMany({ data: { isDefault: false } });
  }

  const account = await db.bankAccount.update({
    where: { id },
    data: {
      bankName: data.bankName,
      accountTitle: data.accountTitle,
      accountNumber: data.accountNumber ?? null,
      iban: data.iban ?? null,
      branch: data.branch ?? null,
      type: data.type,
      currency: data.currency,
      swiftCode: data.swiftCode ?? null,
      instructions: data.instructions ?? null,
      paypalEmail: data.paypalEmail ?? null,
      paypalMe: data.paypalMe ?? null,
      isDefault: Boolean(data.isDefault),
    },
  });
  return NextResponse.json(account);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.bankAccount.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
