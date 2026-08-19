import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET all bank accounts
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accounts = await db.bankAccount.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(accounts);
}

// POST create bank account
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  if (!data.bankName || !data.accountTitle) {
    return NextResponse.json({ error: "bankName and accountTitle are required" }, { status: 400 });
  }

  // If this is set as default, unset others first
  if (data.isDefault) {
    await db.bankAccount.updateMany({ data: { isDefault: false } });
  }

  const account = await db.bankAccount.create({
    data: {
      bankName: data.bankName,
      accountTitle: data.accountTitle,
      accountNumber: data.accountNumber ?? null,
      iban: data.iban ?? null,
      branch: data.branch ?? null,
      type: data.type ?? "bank",
      currency: data.currency ?? "PKR",
      paypalEmail: data.paypalEmail ?? null,
      paypalMe: data.paypalMe ?? null,
      isDefault: Boolean(data.isDefault),
    },
  });

  return NextResponse.json(account, { status: 201 });
}
