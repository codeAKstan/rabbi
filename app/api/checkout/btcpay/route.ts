import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ebookId, firstName, lastName, email } = body;

    // 1. Validation
    if (!ebookId || !ObjectId.isValid(ebookId)) {
      return NextResponse.json(
        { error: "Invalid or missing ebook ID format." },
        { status: 400 }
      );
    }
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "First name, last name, and email are required fields." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // 2. Fetch ebook price and details from database
    const ebook = await db.collection("ebooks").findOne({ _id: new ObjectId(ebookId) });
    if (!ebook) {
      return NextResponse.json(
        { error: "Requested ebook was not found in our catalog." },
        { status: 404 }
      );
    }

    // 3. Insert initial pending purchase record into MongoDB
    const newPurchase = {
      ebookId: new ObjectId(ebookId),
      ebookTitle: ebook.title,
      amount: Number(ebook.price),
      currency: "USD",
      firstName,
      lastName,
      email,
      paymentMethod: "crypto",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await db.collection("purchases").insertOne(newPurchase);
    const purchaseId = insertResult.insertedId.toString();

    // 4. Make request to self-hosted BTCPay Server Greenfield API
    const btcPayUrl = process.env.BTCPAY_URL;
    const storeId = process.env.BTCPAY_STORE_ID;
    const apiKey = process.env.BTCPAY_API_KEY;

    if (!btcPayUrl || !storeId || !apiKey) {
      console.error("Missing BTCPay environment configuration:", {
        hasUrl: !!btcPayUrl,
        hasStoreId: !!storeId,
        hasApiKey: !!apiKey,
      });
      return NextResponse.json(
        { error: "Payment processor is currently misconfigured." },
        { status: 500 }
      );
    }

    const btcPayEndpoint = `${btcPayUrl}/api/v1/stores/${storeId}/invoices`;

    const response = await fetch(btcPayEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `token ${apiKey}`,
      },
      body: JSON.stringify({
        amount: Number(ebook.price).toFixed(2),
        currency: "USD",
        metadata: {
          buyerName: `${firstName} ${lastName}`,
          buyerEmail: email,
          ebookId,
          purchaseId,
          orderType: "ebook",
        },
        checkout: {
          redirectURL: `${request.nextUrl.origin}/checkout/ebook?status=success&id=${ebookId}&orderId=${purchaseId}`,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("BTCPay Server Greenfield API error response:", errorText);
      throw new Error(`BTCPay Server returned status ${response.status}`);
    }

    const invoiceData = await response.json();

    // 5. Update the purchase record with BTCPay invoice details
    await db.collection("purchases").updateOne(
      { _id: insertResult.insertedId },
      {
        $set: {
          btcPayInvoiceId: invoiceData.id,
          btcPayCheckoutLink: invoiceData.checkoutLink,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      invoiceId: invoiceData.id,
      checkoutLink: invoiceData.checkoutLink,
      purchaseId: purchaseId,
    });
  } catch (error) {
    console.error("Create BTCPay Ebook Purchase API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while setting up the payment transaction." },
      { status: 500 }
    );
  }
}
