import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";

/**
 * Public GET Handler: Returns all ebooks, or a single ebook if `id` is provided in query params.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const { db } = await connectToDatabase();

    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          { error: "Invalid ebook ID format" },
          { status: 400 }
      );
      }
      const ebook = await db.collection("ebooks").findOne({ _id: new ObjectId(id) });
      if (!ebook) {
        return NextResponse.json(
          { error: "Ebook not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        ebook: {
          _id: ebook._id.toString(),
          title: ebook.title,
          description: ebook.description,
          price: ebook.price,
          fileUrl: ebook.fileUrl,
          imageUrl: ebook.imageUrl || null,
        }
      });
    }

    // Otherwise fetch all
    const ebooks = await db
      .collection("ebooks")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const serialized = ebooks.map(eb => ({
      _id: eb._id.toString(),
      title: eb.title,
      description: eb.description,
      price: eb.price,
      fileUrl: eb.fileUrl,
      imageUrl: eb.imageUrl || null,
    }));

    return NextResponse.json({ success: true, ebooks: serialized });
  } catch (error) {
    console.error("Public Ebooks API GET Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching ebook details" },
      { status: 500 }
    );
  }
}
