import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized access: Please log in." },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Session has expired. Please log in again." },
        { status: 401 }
      );
    }

    // Return dashboard statistics and recent data logs
    return NextResponse.json({
      success: true,
      stats: {
        totalDonations: 18450,
        activeMemberships: 142,
        ebookDownloads: 294,
        pendingInquiries: 8,
      },
      donations: [
        { id: "1", name: "Sarah Cohen", email: "sarah.c@gmail.com", amount: 180, frequency: "once", date: "2 hours ago" },
        { id: "2", name: "David Levy", email: "david.levy@yahoo.com", amount: 36, frequency: "monthly", date: "5 hours ago" },
        { id: "3", name: "Michael Stein", email: "mstein@stein-law.com", amount: 72, frequency: "once", date: "1 day ago" },
        { id: "4", name: "Rachel Greenberg", email: "rachel.g@me.com", amount: 18, frequency: "monthly", date: "2 days ago" },
        { id: "5", name: "Joshua Friedman", email: "josh@friedman-capital.com", amount: 540, frequency: "once", date: "3 days ago" },
        { id: "6", name: "Miriam Horowitz", email: "m.horowitz@outlook.com", amount: 36, frequency: "monthly", date: "4 days ago" },
      ],
      registrants: [
        { id: "101", name: "Jonathan Marcus", email: "j.marcus@gmail.com", source: "Masterclass Loop", date: "1 hour ago" },
        { id: "102", name: "Leah Solomon", email: "leah.solomon@outlook.com", source: "Ebook Access", date: "3 hours ago" },
        { id: "103", name: "Aaron Klein", email: "aklein@yahoo.com", source: "Newsletter Opt-in", date: "1 day ago" },
        { id: "104", name: "Hannah Bernstein", email: "hannahb@me.com", source: "Masterclass Loop", date: "1 day ago" },
        { id: "105", name: "Daniel Perlman", email: "dperlman@protonmail.com", source: "Newsletter Opt-in", date: "2 days ago" },
      ],
      inquiries: [
        {
          id: "201",
          name: "Rebecca Vance",
          email: "rebecca.v@example.com",
          message: "I wanted to check if there is an upcoming physical masterclass in Chicago or nearby cities? Thank you!",
          date: "Yesterday"
        },
        {
          id: "202",
          name: "Samuel Gold",
          email: "sgold@business.com",
          message: "Is there a bulk order discount for The Rabbi's Blueprint ebook? We want to distribute it to 50 members of our study circle.",
          date: "2 days ago"
        },
        {
          id: "203",
          name: "Deborah Ross",
          email: "dross@yahoo.com",
          message: "How can I access the private Telegram group? I signed up yesterday but didn't receive the invite link.",
          date: "3 days ago"
        }
      ]
    });
  } catch (error) {
    console.error("Dashboard stats API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while loading dashboard stats" },
      { status: 500 }
    );
  }
}
