import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uploadToImgBB } from "@/lib/imgbb";

// POST — customer uploads payment proof screenshot
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const invoice = await db.invoice.findUnique({
    where: { shareToken: token },
  });

  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (invoice.status === "paid") {
    return NextResponse.json({ error: "Invoice already marked as paid." }, { status: 400 });
  }
  if (invoice.status === "cancelled") {
    return NextResponse.json({ error: "Invoice is cancelled." }, { status: 400 });
  }

  // Expect JSON body with base64 image
  const { imageBase64, fileName } = await req.json();
  if (!imageBase64) {
    return NextResponse.json({ error: "No image provided." }, { status: 400 });
  }

  // Upload to ImgBB (or fallback)
  const imageUrl = await uploadToImgBB(
    imageBase64,
    `proof-${invoice.invoiceNumber}-${Date.now()}`
  );

  // Save proof URL and set status to "viewed" (admin will confirm payment)
  await db.invoice.update({
    where: { id: invoice.id },
    data: {
      paymentProof: imageUrl,
      proofUploadedAt: new Date(),
      status: "viewed", // Admin still needs to confirm
    },
  });

  return NextResponse.json({ success: true, imageUrl });
}
