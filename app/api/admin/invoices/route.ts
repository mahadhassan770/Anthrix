import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET all invoices
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoices = await db.invoice.findMany({
    include: { items: true, bankAccount: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(invoices);
}

// POST create invoice
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  // Auto-generate invoice number: ANT-2026-001
  const count = await db.invoice.count();
  const year = new Date().getFullYear();
  const invoiceNumber = `ANT-${year}-${String(count + 1).padStart(3, "0")}`;

  // Calculate totals
  const items: { description: string; quantity: number; rate: number; amount: number }[] =
    data.items ?? [];
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const taxAmount = subtotal * ((data.taxRate ?? 0) / 100);
  const total = subtotal + taxAmount - (data.discount ?? 0);

  const invoice = await db.invoice.create({
    data: {
      invoiceNumber,
      clientId: data.clientId ?? null,
      clientName: data.clientName,
      clientEmail: data.clientEmail ?? null,
      clientPhone: data.clientPhone ?? null,
      clientAddress: data.clientAddress ?? null,
      currency: data.currency ?? "PKR",
      subtotal,
      taxRate: data.taxRate ?? 0,
      taxAmount,
      discount: data.discount ?? 0,
      total,
      notes: data.notes ?? null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: data.status ?? "draft",
      bankAccountId: data.bankAccountId ?? null,
      items: {
        create: items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        })),
      },
    },
    include: { items: true, bankAccount: true },
  });

  return NextResponse.json(invoice, { status: 201 });
}
