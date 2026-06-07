import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required fields." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const newInquiry = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      message: message.trim(),
      status: "pending",
      createdAt: new Date(),
    };

    await db.collection("inquiries").insertOne(newInquiry);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Create Inquiry API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while sending your message." },
      { status: 500 }
    );
  }
}
