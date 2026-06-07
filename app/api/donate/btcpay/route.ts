import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, firstName, lastName, email, frequency } = body;

    // 1. Validation
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Invalid donation amount. Must be greater than 0." },
        { status: 400 }
      );
    }
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "First name, last name, and email are required fields." },
        { status: 400 }
      );
    }
    if (frequency !== "once" && frequency !== "monthly") {
      return NextResponse.json(
        { error: "Invalid frequency. Must be 'once' or 'monthly'." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // 2. Insert initial pending donation record into MongoDB
    const newDonation = {
      firstName,
      lastName,
      email,
      amount: Number(amount),
      currency: "USD",
      frequency,
      paymentMethod: "crypto",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await db.collection("donations").insertOne(newDonation);
    const donationId = insertResult.insertedId.toString();

    // 3. Make request to self-hosted BTCPay Server Greenfield API
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
        amount: Number(amount).toFixed(2),
        currency: "USD",
        metadata: {
          buyerName: `${firstName} ${lastName}`,
          buyerEmail: email,
          frequency,
          donationId: donationId,
        },
        checkout: {
          redirectURL: `${request.nextUrl.origin}/donate?status=success&donationId=${donationId}`,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("BTCPay Server Greenfield API error response:", errorText);
      throw new Error(`BTCPay Server returned status ${response.status}`);
    }

    const invoiceData = await response.json();

    // 4. Update the donation record with BTCPay invoice details
    await db.collection("donations").updateOne(
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
      donationId: donationId,
    });
  } catch (error) {
    console.error("Create BTCPay Invoice API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while setting up the payment transaction." },
      { status: 500 }
    );
  }
}
