import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    // Force a sign in for Mahad using the server API
    const result = await auth.api.signInEmail({
      body: {
        email: "mahadhassan095@gmail.com",
        password: "Mahad@6225425",
      },
      asResponse: true,
    });

    // Extract the Set-Cookie headers from the successful Better Auth response
    const setCookieHeaders = result.headers.getSetCookie();

    // Redirect to the admin dashboard
    const response = NextResponse.redirect(new URL("/admin", req.url));

    // Apply the cookies to the redirect response so the browser logs in
    setCookieHeaders.forEach((cookie) => {
      response.headers.append("Set-Cookie", cookie);
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
