import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET all transactions
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const transactions = await db.transaction.findMany({
      orderBy: { date: "desc" },
      include: {
        client: {
          select: { id: true, name: true, company: true, logo: true }
        }
      }
    });
    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

// POST create new transaction
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.amount || !data.description || !data.clientId) {
      return NextResponse.json(
        { error: "Amount, description, and clientId are required" },
        { status: 400 }
      );
    }

    const DEFAULT_RATE = 280.0;
    const currency = (data.currency || "USD").toUpperCase();
    const rawAmount = parseFloat(data.amount);
    const rate = parseFloat(data.exchangeRate) || DEFAULT_RATE;

    let amountUSD = rawAmount;
    let amountPKR = rawAmount * rate;

    if (currency === "PKR") {
      amountUSD = rawAmount / rate;
      amountPKR = rawAmount;
    }

    const transaction = await db.transaction.create({
      data: {
        amount: amountUSD,
        amountPKR: amountPKR,
        currency: currency,
        exchangeRate: rate,
        description: data.description,
        date: data.date ? new Date(data.date) : new Date(),
        status: data.status ?? "paid",
        clientId: data.clientId,
      },
      include: {
        client: {
          select: { id: true, name: true, company: true }
        }
      }
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction", details: error.message },
      { status: 500 }
    );
  }
}
