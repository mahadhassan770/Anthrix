import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const users = await db.user.findMany();
    const accounts = await db.account.findMany();
    
    return NextResponse.json({ 
      users,
      accounts
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
