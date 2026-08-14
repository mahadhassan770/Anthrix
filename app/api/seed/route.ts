import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    // 1. Delete all existing users to start fresh
    await db.session.deleteMany({});
    await db.account.deleteMany({});
    await db.user.deleteMany({});
    
    // 2. Create Admin 1 using the official Better Auth SDK
    // This ensures the password is hashed correctly and the account is linked properly
    const admin1 = await auth.api.signUpEmail({
      body: {
        email: "mahadhassan095@gmail.com",
        password: "Mahad@6225425",
        name: "Mahad Hassan",
      },
      asResponse: true,
    });
    
    // 3. Create Admin 2
    const admin2 = await auth.api.signUpEmail({
      body: {
        email: "abdulhaseeb7134@gmail.com",
        password: "Admin@1234",
        name: "Abdul Haseeb",
      },
      asResponse: true,
    });

    // 4. Update both to have the "admin" role (signUpEmail defaults to user)
    await db.user.updateMany({
      where: {
        email: {
          in: ["mahadhassan095@gmail.com", "abdulhaseeb7134@gmail.com"]
        }
      },
      data: {
        role: "admin",
        emailVerified: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Database seeded correctly using Better Auth SDK!" 
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
