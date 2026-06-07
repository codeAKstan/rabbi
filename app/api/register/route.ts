import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, source } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required fields." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const newRegistrant = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      source: source ? source.trim() : "Newsletter Opt-in",
      createdAt: new Date(),
    };

    await db.collection("registrants").insertOne(newRegistrant);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Create Registrant API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your registration." },
      { status: 500 }
    );
  }
}
