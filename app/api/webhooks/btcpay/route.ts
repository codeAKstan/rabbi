import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.BTCPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("BTCPAY_WEBHOOK_SECRET environment variable is not defined");
      return NextResponse.json(
        { error: "Webhook verification is not configured." },
        { status: 500 }
      );
    }

    // 1. Get BTCPay Signature from Headers
    const signatureHeader = request.headers.get("btcpay-sig");
    if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
      console.warn("Incoming BTCPay webhook missing or invalid signature header");
      return NextResponse.json({ error: "Missing or invalid signature" }, { status: 400 });
    }

    const signature = signatureHeader.substring("sha256=".length);

    // 2. Read Raw Request Body
    const rawBody = await request.text();

    // 3. Compute expected HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    // 4. Secure Timing-Safe Comparison
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );

    if (!isSignatureValid) {
      console.warn("BTCPay webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature verification" }, { status: 401 });
    }

    // 5. Parse Event Payload
    const payload = JSON.parse(rawBody);
    const eventType = payload.type;
    const invoiceId = payload.invoiceId;

    console.log(`Received BTCPay webhook event: ${eventType} for Invoice ID: ${invoiceId}`);

    const { db } = await connectToDatabase();

    // 6. Handle relevant events
    const orderType = payload.metadata?.orderType;
    const collectionName = orderType === "ebook" ? "purchases" : "donations";
    const displayName = orderType === "ebook" ? "Ebook Purchase" : "Donation";

    if (eventType === "InvoiceSettled") {
      // Payment confirmed and settled
      const result = await db.collection(collectionName).updateOne(
        { btcPayInvoiceId: invoiceId },
        {
          $set: {
            status: "settled",
            updatedAt: new Date(),
          },
        }
      );
      if (result.matchedCount === 0) {
        console.warn(`Webhook: No record found in '${collectionName}' matching BTCPay Invoice ID: ${invoiceId}`);
      } else {
        console.log(`${displayName} associated with BTCPay Invoice ID: ${invoiceId} updated to 'settled'`);
      }
    } else if (eventType === "InvoiceExpired") {
      // Payment expired/canceled
      await db.collection(collectionName).updateOne(
        { btcPayInvoiceId: invoiceId },
        {
          $set: {
            status: "expired",
            updatedAt: new Date(),
          },
        }
      );
      console.log(`${displayName} associated with BTCPay Invoice ID: ${invoiceId} updated to 'expired'`);
    } else {
      console.log(`Unhandled BTCPay webhook event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("BTCPay Webhook POST Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing webhook" },
      { status: 500 }
    );
  }
}
