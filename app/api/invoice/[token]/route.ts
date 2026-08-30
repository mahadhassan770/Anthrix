import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getContactSettings } from "@/lib/contact-settings";

// Public — no auth needed. Customer opens /invoice/[token]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const [invoice, contactSettings] = await Promise.all([
    db.invoice.findUnique({
      where: { shareToken: token },
      include: { items: true, bankAccount: true },
    }),
    getContactSettings(),
  ]);

  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (invoice.status === "cancelled") {
    return NextResponse.json({ error: "This invoice has been cancelled." }, { status: 410 });
  }

  // Mark as viewed if it was only sent
  if (invoice.status === "sent") {
    await db.invoice.update({
      where: { id: invoice.id },
      data: { status: "viewed" },
    });
  }

  return NextResponse.json({
    ...invoice,
    contactSettings,
  });
}
