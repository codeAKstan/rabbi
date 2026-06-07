import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

// Simple relative date formatter helper
function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / (60 * 1000));
  const diffHours = Math.round(diffMs / (60 * 60 * 1000));
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

  if (diffMins < 1) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else {
    return `${diffDays} days ago`;
  }
}

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

    const { db } = await connectToDatabase();

    // 1. Fetch real donations list (all records, ordered by date)
    const donationsCursor = await db
      .collection("donations")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const donationsList = donationsCursor.map(doc => ({
      id: doc._id.toString(),
      name: `${doc.firstName} ${doc.lastName}`,
      email: doc.email,
      amount: doc.amount,
      frequency: doc.frequency,
      status: doc.status || "settled",
      date: getRelativeTimeString(doc.createdAt),
    }));

    // 2. Fetch real registrants
    const registrantsCursor = await db
      .collection("registrants")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const registrantsList = registrantsCursor.map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      source: doc.source || "Newsletter Opt-in",
      date: getRelativeTimeString(doc.createdAt),
    }));

    // 3. Fetch real inquiries (messages)
    const inquiriesCursor = await db
      .collection("inquiries")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const inquiriesList = inquiriesCursor.map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      message: doc.message,
      date: getRelativeTimeString(doc.createdAt),
    }));

    // 4. Calculate Stats Card values
    // A. Sum of settled donations
    const donationSumResult = await db.collection("donations").aggregate([
      { $match: { status: "settled" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).toArray();
    const totalDonationsAmount = donationSumResult[0]?.total || 0;

    // B. Ebook Sales: count of settled purchases
    const totalEbookSales = await db.collection("purchases").countDocuments({ status: "settled" });

    // C. Active Memberships
    const totalActiveMemberships = await db.collection("memberships").countDocuments({ status: "active" });

    // D. Pending Inquiries
    const pendingInquiriesCount = await db.collection("inquiries").countDocuments({ status: "pending" });

    return NextResponse.json({
      success: true,
      stats: {
        totalDonations: totalDonationsAmount,
        activeMemberships: totalActiveMemberships,
        ebookDownloads: totalEbookSales,
        pendingInquiries: pendingInquiriesCount,
      },
      donations: donationsList,
      registrants: registrantsList,
      inquiries: inquiriesList,
    });
  } catch (error) {
    console.error("Dashboard stats API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while loading dashboard stats" },
      { status: 500 }
    );
  }
}
