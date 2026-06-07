import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { uploadFile } from "@/lib/upload";

/**
 * GET Handler: Returns a list of all uploaded ebooks in MongoDB.
 * Secured: Requires admin login session.
 */
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

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Session expired: Please log in again." },
        { status: 401 }
      );
    }

    // Connect to database and fetch ebooks
    const { db } = await connectToDatabase();
    const ebooks = await db
      .collection("ebooks")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, ebooks });
  } catch (error) {
    console.error("Ebooks GET error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while loading ebooks" },
      { status: 500 }
    );
  }
}

/**
 * POST Handler: Processes the upload of a new ebook file & optional cover image via UploadThing
 * and stores metadata in MongoDB.
 * Secured: Requires admin login session.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized access: Please log in." },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Session expired: Please log in again." },
        { status: 401 }
      );
    }

    // Parse multipart form-data
    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        { error: "Invalid form data submission" },
        { status: 400 }
      );
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priceRaw = formData.get("price") as string;
    const file = formData.get("file") as File;
    const image = formData.get("image") as File | null; // Optional cover image

    if (!title || !description || !priceRaw || !file) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, price, and file are all required" },
        { status: 400 }
      );
    }

    const price = Number(priceRaw);
    if (isNaN(price)) {
      return NextResponse.json(
        { error: "Price must be a valid number" },
        { status: 400 }
      );
    }

    // Upload ebook file (UploadThing UTApi)
    console.log(`Uploading file ${file.name} to UploadThing...`);
    const docLink = await uploadFile(file, "ebook");

    // Upload cover image if provided
    let imageLink = null;
    if (image && image.size > 0) {
      console.log(`Uploading cover image ${image.name} to UploadThing...`);
      imageLink = await uploadFile(image, "cover");
    }

    // Connect to database and insert metadata
    const { db } = await connectToDatabase();
    const newEbook = {
      title: title.trim(),
      description: description.trim(),
      price,
      fileUrl: docLink,
      imageUrl: imageLink,
      createdAt: new Date(),
    };

    const result = await db.collection("ebooks").insertOne(newEbook);

    return NextResponse.json({
      success: true,
      message: "Ebook uploaded and saved successfully",
      ebook: {
        _id: result.insertedId.toString(),
        ...newEbook,
      },
    });
  } catch (error: any) {
    console.error("Ebooks POST error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during ebook upload" },
      { status: 500 }
    );
  }
}

/**
 * PUT Handler: Updates an existing ebook's metadata and optionally replaces its files in UploadThing.
 * Secured: Requires admin login session.
 */
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized access: Please log in." },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Session expired: Please log in again." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "A valid ebook ID parameter is required" },
        { status: 400 }
      );
    }

    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        { error: "Invalid form data submission" },
        { status: 400 }
      );
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priceRaw = formData.get("price") as string;
    const file = formData.get("file") as File | null;
    const image = formData.get("image") as File | null;

    if (!title || !description || !priceRaw) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, and price are required" },
        { status: 400 }
      );
    }

    const price = Number(priceRaw);
    if (isNaN(price)) {
      return NextResponse.json(
        { error: "Price must be a valid number" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Check if ebook exists
    const existingEbook = await db.collection("ebooks").findOne({ _id: new ObjectId(id) });
    if (!existingEbook) {
      return NextResponse.json(
        { error: "Ebook not found" },
        { status: 404 }
      );
    }

    // Process new file upload if provided
    let fileUrl = existingEbook.fileUrl;
    if (file && file.size > 0 && typeof file !== "string") {
      console.log(`Replacing ebook file with ${file.name}...`);
      fileUrl = await uploadFile(file, "ebook");
    }

    // Process new image upload if provided
    let imageUrl = existingEbook.imageUrl;
    if (image && image.size > 0 && typeof image !== "string") {
      console.log(`Replacing cover image with ${image.name}...`);
      imageUrl = await uploadFile(image, "cover");
    }

    // Update in database
    const updateData = {
      title: title.trim(),
      description: description.trim(),
      price,
      fileUrl,
      imageUrl,
      updatedAt: new Date(),
    };

    await db.collection("ebooks").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      message: "Ebook updated successfully",
      ebook: {
        _id: id,
        ...updateData,
      },
    });
  } catch (error: any) {
    console.error("Ebooks PUT error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during ebook edit" },
      { status: 500 }
    );
  }
}

/**
 * DELETE Handler: Deletes an ebook from MongoDB.
 * Secured: Requires admin login session.
 */
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in." },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Session expired. Please log in again." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "A valid ebook ID parameter is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const deleteResult = await db.collection("ebooks").deleteOne({ _id: new ObjectId(id) });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: "Ebook not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Ebook deleted successfully",
    });
  } catch (error: any) {
    console.error("Ebooks DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while deleting ebook" },
      { status: 500 }
    );
  }
}
