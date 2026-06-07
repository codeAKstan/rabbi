import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Credit Card payment is currently not available." },
    { status: 400 }
  );
}
