import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: "No session token found" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      // Clear invalid cookie
      cookieStore.delete("admin_session");
      return NextResponse.json(
        { authenticated: false, error: "Session has expired or is invalid" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.json(
      { authenticated: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
