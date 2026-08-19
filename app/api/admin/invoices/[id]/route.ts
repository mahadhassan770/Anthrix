import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const invoice = await db.invoice.findUnique({
    where: { id },
    include: { items: true, bankAccount: true },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  // Recalculate totals if items provided
  let financialUpdate = {};
  if (data.items) {
    const subtotal = data.items.reduce((s: number, i: { amount: number }) => s + i.amount, 0);
    const taxAmount = subtotal * ((data.taxRate ?? 0) / 100);
    const total = subtotal + taxAmount - (data.discount ?? 0);
    financialUpdate = { subtotal, taxAmount, total };

    // Delete old items and recreate
    await db.invoiceItem.deleteMany({ where: { invoiceId: id } });
  }

  const invoice = await db.invoice.update({
    where: { id },
    data: {
      clientName: data.clientName,
      clientEmail: data.clientEmail ?? null,
      clientPhone: data.clientPhone ?? null,
      clientAddress: data.clientAddress ?? null,
      currency: data.currency,
      taxRate: data.taxRate ?? 0,
      discount: data.discount ?? 0,
      notes: data.notes ?? null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: data.status,
      bankAccountId: data.bankAccountId ?? null,
      paidAt: data.status === "paid" ? new Date() : undefined,
      ...financialUpdate,
      ...(data.items
        ? {
            items: {
              create: data.items.map((item: { description: string; quantity: number; rate: number; amount: number }) => ({
                description: item.description,
                quantity: item.quantity,
                rate: item.rate,
                amount: item.amount,
              })),
            },
          }
        : {}),
    },
    include: { items: true, bankAccount: true },
  });

  return NextResponse.json(invoice);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.invoice.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
