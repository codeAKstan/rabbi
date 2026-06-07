"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";

// Default ebook fallback details
const DEFAULT_EBOOK = {
  _id: "default",
  title: "The Rabbi's Blueprint",
  description: "Unlock 3,000 years of ancient Jewish wisdom with Rabbi Menachem's definitive guide to building wealth, character, and unshakeable purpose.",
  price: 20.00,
  fileUrl: "#", // Fallback placeholder
  imageUrl: null,
};

// Crypto conversion rates and wallets
const CRYPTO_CONFIG: Record<string, { symbol: string; rate: number; address: string }> = {
  btc: {
    symbol: "BTC",
    rate: 65000, // $65,000 per BTC
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  },
  eth: {
    symbol: "ETH",
    rate: 3500, // $3,500 per ETH
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  },
  sol: {
    symbol: "SOL",
    rate: 160, // $160 per SOL
    address: "HN7cAB1K3Xj5o5o5o5o5o5o5o5o5o5o5o5o5o5o5o",
  },
  usdc: {
    symbol: "USDC",
    rate: 1, // $1 per USDC
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  },
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const ebookId = searchParams.get("id");

  // States
  const [ebook, setEbook] = useState<any>(DEFAULT_EBOOK);
  const [loadingEbook, setLoadingEbook] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "crypto">("stripe");
  const [selectedCrypto, setSelectedCrypto] = useState<string>("btc");

  // Billing details
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Card details
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [zip, setZip] = useState("");

  // Crypto specifics
  const [copied, setCopied] = useState(false);
  const [txHashMock, setTxHashMock] = useState("");

  // Submission & Success
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [receiptId, setReceiptId] = useState("");

  // Fetch ebook details on mount & check for successful checkout redirect
  useEffect(() => {
    if (ebookId && ebookId !== "default") {
      fetchEbookDetails(ebookId);
    }

    const status = searchParams.get("status");
    const orderId = searchParams.get("orderId");
    if (status === "success" && orderId) {
      setPaymentMethod("crypto");
      setReceiptId(orderId);
      setIsSuccess(true);
      // Clean up URL query parameters
      if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, `${window.location.pathname}?id=${ebookId}`);
      }
    }
  }, [ebookId, searchParams]);

  const fetchEbookDetails = async (id: string) => {
    setLoadingEbook(true);
    try {
      const res = await fetch(`/api/ebooks?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.ebook) {
          setEbook(data.ebook);
        }
      }
    } catch (err) {
      console.error("Failed to fetch ebook for checkout:", err);
    } finally {
      setLoadingEbook(false);
    }
  };

  // Compute equivalent crypto amount
  const getCryptoAmount = () => {
    const config = CRYPTO_CONFIG[selectedCrypto];
    if (!config) return "0.00";
    const amount = ebook.price / config.rate;
    // Format appropriately: BTC/ETH (6 decimal places), SOL (4 decimal places), USDC (2 decimal places)
    const decimals = selectedCrypto === "btc" || selectedCrypto === "eth" ? 6 : selectedCrypto === "sol" ? 4 : 2;
    return amount.toFixed(decimals);
  };

  const handleCopyAddress = () => {
    const address = CRYPTO_CONFIG[selectedCrypto]?.address;
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!firstName || !lastName || !email) {
      setErrorMessage("Please complete your personal and billing info.");
      return;
    }

    if (paymentMethod === "stripe") {
      if (!cardName || !cardNumber || !expiry || !cvc || !zip) {
        setErrorMessage("Please complete your credit card billing details.");
        return;
      }
      setIsSubmitting(true);
      setErrorMessage("Credit Card payment is currently not available.");
      setIsSubmitting(false);
      return;
    } else {
      setIsSubmitting(true);
      // BTCPay Server redirect flow
      try {
        const response = await fetch("/api/checkout/btcpay", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ebookId,
            firstName,
            lastName,
            email,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to create crypto invoice.");
        }

        if (data.checkoutLink) {
          window.location.href = data.checkoutLink;
        } else {
          throw new Error("BTCPay Server did not return a valid checkout link.");
        }
      } catch (err: any) {
        console.error("Crypto purchase error:", err);
        setErrorMessage(err.message || "An error occurred while launching crypto payment.");
        setIsSubmitting(false);
      }
    }
  };

  // Card formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (value.length > 2) {
      setExpiry(`${value.substring(0, 2)}/${value.substring(2)}`);
    } else {
      setExpiry(value);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 4);
    setCvc(value);
  };

  if (loadingEbook) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-zinc-50 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-300 border-t-[#002d62]"></div>
          <span className="text-zinc-600 text-sm font-semibold tracking-wider uppercase">
            Resolving Ebook Details...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-8">
      {/* Header Back Button */}
      <div className="border-b border-zinc-200 pb-6 mb-12 flex justify-between items-center">
        <Link href="/ebook" className="text-xs font-bold text-zinc-500 hover:text-[#002d62] transition-colors flex items-center gap-1">
          ← Back to Library
        </Link>
        <span className="text-xs text-zinc-400 font-light font-mono">Secure Checkout</span>
      </div>

      {isSuccess ? (
        /* SUCCESS RECEIPT VIEW */
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-zinc-200 shadow-xl p-8 sm:p-12 text-center animate-in fade-in duration-500">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-6">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <span className="text-[12px] font-bold tracking-widest text-emerald-600 uppercase">
            Payment Confirmed
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#002d62] mt-2 mb-4">
            Thank You for Your Purchase!
          </h2>
          <p className="text-sm text-zinc-500 font-light max-w-md mx-auto">
            Your payment was securely verified. You now have full lifetime access to this wisdom blueprint.
          </p>

          <div className="my-8 border-y border-zinc-100 py-6 text-left space-y-4 max-w-md mx-auto">
            <div className="flex justify-between text-xs sm:text-sm text-zinc-600">
              <span>Title:</span>
              <span className="font-bold text-[#002d62]">{ebook.title}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-zinc-600">
              <span>Amount Paid:</span>
              <span className="font-bold text-zinc-950">${Number(ebook.price).toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-zinc-600">
              <span>Payment Type:</span>
              <span className="font-semibold text-zinc-850 uppercase">{paymentMethod}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-zinc-600">
              <span>Receipt ID:</span>
              <span className="font-mono text-zinc-500">{receiptId}</span>
            </div>
          </div>

          {/* ACTIVE DOWNLOAD BUTTON */}
          <div className="space-y-4 max-w-md mx-auto pt-2">
            <a
              href={ebook.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center rounded-full bg-[#a80f14] pl-6 pr-2 py-3 text-[16px] font-bold uppercase tracking-wider text-white shadow-md transition-all duration-300 hover:bg-[#8e0b0f] hover:scale-[1.02] active:scale-[0.98] group"
            >
              <span className="mx-auto">DOWNLOAD YOUR EBOOK</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shrink-0">
                <span className="text-[#a80f14] font-bold text-sm">↓</span>
              </div>
            </a>
            <span className="text-[11px] text-zinc-400 font-light block leading-relaxed">
              We have also dispatched a backup email containing your permanent download link.
            </span>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-100 flex justify-center">
            <Link
              href="/ebook"
              className="text-xs text-zinc-500 hover:text-[#002d62] font-semibold underline transition-colors"
            >
              Return to Rabbi's Library
            </Link>
          </div>
        </div>
      ) : (
        /* TWO COLUMN CHECKOUT LAYOUT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">

          {/* Left Column: Form billing/payment selection */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200 shadow-xl p-6 sm:p-8 space-y-8">

            <form onSubmit={handleCheckoutSubmit} className="space-y-8">

              {/* Step 1: Customer Details */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#002d62] border-b border-zinc-100 pb-2">
                  1. Contact Details
                </h3>

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold">
                    ⚠️ {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-zinc-700 block">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded border border-zinc-300 bg-zinc-50/30 px-3 py-2 text-[14px] text-zinc-800 outline-none focus:border-[#002d62]"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-zinc-700 block">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded border border-zinc-300 bg-zinc-50/30 px-3 py-2 text-[14px] text-zinc-800 outline-none focus:border-[#002d62]"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-zinc-700 block">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded border border-zinc-300 bg-zinc-50/30 px-3 py-2 text-[14px] text-zinc-800 outline-none focus:border-[#002d62]"
                    disabled={isSubmitting}
                  />
                  <span className="text-[10px] text-zinc-400 block font-light">
                    Your secure download link will be dispatched immediately to this address.
                  </span>
                </div>
              </div>

              {/* Step 2: Payment Selector */}
              <div className="space-y-6">
                <h3 className="font-serif text-lg font-bold text-[#002d62] border-b border-zinc-100 pb-2">
                  2. Choose Payment Method
                </h3>

                {/* Tabs */}
                <div className="grid grid-cols-2 bg-zinc-100 p-1 rounded-full border border-zinc-200">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("stripe")}
                    className={`py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 ${paymentMethod === "stripe"
                        ? "bg-[#002d62] text-white shadow-md"
                        : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    disabled={isSubmitting}
                  >
                    💳 Stripe / Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("crypto")}
                    className={`py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 ${paymentMethod === "crypto"
                        ? "bg-[#002d62] text-white shadow-md"
                        : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    disabled={isSubmitting}
                  >
                    🪙 Crypto Payment
                  </button>
                </div>

                {/* TAB 1: STRIPE CARD VIEW */}
                {paymentMethod === "stripe" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <label className="text-[12px] font-bold text-zinc-700 block">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        required={paymentMethod === "stripe"}
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full rounded border border-zinc-300 bg-zinc-50/30 px-3 py-2 text-[14px] text-zinc-800 outline-none focus:border-[#002d62]"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[12px] font-bold text-zinc-700 block flex justify-between">
                        <span>Card Information</span>
                        <span className="text-[10px] text-zinc-400 font-light flex items-center gap-1">
                          🔒 SSL Secured
                        </span>
                      </label>

                      <div className="border border-zinc-300 rounded-lg overflow-hidden bg-zinc-50/30">
                        {/* Number */}
                        <div className="border-b border-zinc-200">
                          <input
                            type="text"
                            required={paymentMethod === "stripe"}
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="Card Number (XXXX XXXX XXXX XXXX)"
                            className="w-full bg-transparent px-3 py-2.5 text-[14px] text-zinc-800 outline-none"
                            disabled={isSubmitting}
                          />
                        </div>
                        {/* Expiry, Cvc, Zip */}
                        <div className="grid grid-cols-3 divide-x divide-zinc-200">
                          <input
                            type="text"
                            required={paymentMethod === "stripe"}
                            value={expiry}
                            onChange={handleExpiryChange}
                            placeholder="MM/YY"
                            className="w-full bg-transparent px-2 py-2.5 text-[14px] text-zinc-800 outline-none text-center"
                            disabled={isSubmitting}
                          />
                          <input
                            type="text"
                            required={paymentMethod === "stripe"}
                            value={cvc}
                            onChange={handleCvcChange}
                            placeholder="CVC"
                            className="w-full bg-transparent px-2 py-2.5 text-[14px] text-zinc-800 outline-none text-center"
                            disabled={isSubmitting}
                          />
                          <input
                            type="text"
                            required={paymentMethod === "stripe"}
                            value={zip}
                            onChange={(e) => setZip(e.target.value)}
                            placeholder="Zip Code"
                            className="w-full bg-transparent px-2 py-2.5 text-[14px] text-zinc-800 outline-none text-center"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: CRYPTO VIEW */}
                {paymentMethod === "crypto" && (
                  <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-[#c89e2b] font-bold font-serif text-lg border border-amber-200 shadow-inner">
                        ₿
                      </div>
                      <div>
                        <h4 className="font-serif text-base font-bold text-[#002d62]">
                          Crypto Payment
                        </h4>

                      </div>
                    </div>

                    {/* <p className="text-xs text-zinc-600 leading-relaxed font-light">
                      We support **Bitcoin (BTC)** and **Lightning Network** payments directly. Upon clicking the button below, you will be redirected to our secure self-hosted BTCPay Server page to complete your purchase.
                    </p> */}

                    <div className="h-[1px] bg-zinc-200" />

                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 bg-white border border-zinc-200 rounded-full text-[10px] font-bold text-zinc-500">
                        ⚡ Lightning Network Enabled
                      </span>
                      <span className="px-2.5 py-1 bg-white border border-zinc-200 rounded-full text-[10px] font-bold text-zinc-500">
                        🛡️ Peer-to-Peer Encryption
                      </span>
                    </div>
                  </div>
                )}

              </div>

              {/* Submit Checkout Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center rounded-full bg-[#a80f14] pl-6 pr-2 py-3 text-[16px] font-bold uppercase tracking-wider text-white shadow-md transition-all duration-300 hover:bg-[#8e0b0f] hover:scale-[1.01] active:scale-[0.99] disabled:bg-zinc-400 disabled:scale-100 group"
                >
                  <span className="mx-auto">
                    {isSubmitting
                      ? (paymentMethod === "stripe"
                        ? "Authorizing Card..."
                        : "Verifying Blockchain Record...")
                      : `COMPLETE PURCHASE - $${Number(ebook.price).toFixed(2)}`}
                  </span>
                  {!isSubmitting && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shrink-0">
                      <span className="text-[#a80f14] font-bold text-sm">→</span>
                    </div>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Order Summary details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg p-6 space-y-6">

              <h3 className="font-serif text-lg font-bold text-[#002d62] border-b border-zinc-100 pb-2">
                Order Summary
              </h3>

              {/* Book Info Block */}
              <div className="flex gap-4 items-center">
                {/* Image Cover thumbnail */}
                <div className="h-24 w-16 bg-zinc-100 border border-zinc-200 rounded overflow-hidden shadow shrink-0 relative flex items-center justify-center">
                  {ebook.imageUrl ? (
                    <img
                      src={ebook.imageUrl}
                      alt={ebook.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#001b3b] to-[#002d62] p-2 flex flex-col justify-between text-[7px] text-white text-center font-bold font-sans">
                      <span className="line-clamp-4 leading-tight uppercase">{ebook.title}</span>
                      <span className="text-[5px] opacity-70">Rabbi Menachem</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <h4 className="font-serif text-sm font-bold text-[#002d62] line-clamp-2 leading-snug">
                    {ebook.title}
                  </h4>
                  <p className="text-xs text-zinc-400 font-light line-clamp-2 leading-relaxed">
                    {ebook.description}
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t border-zinc-100 text-xs sm:text-sm text-zinc-600">
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-medium text-zinc-950">${Number(ebook.price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Tax:</span>
                  <span className="font-medium text-zinc-950">$0.00</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-zinc-100 text-base font-bold text-[#002d62]">
                  <span>Total Amount:</span>
                  <span>${Number(ebook.price).toFixed(2)} USD</span>
                </div>
              </div>

            </div>

            {/* Verification Assurances */}
            <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-5 text-center text-[11px] text-zinc-400 space-y-2">
              <p className="font-bold text-zinc-500 uppercase tracking-wider">🛡️ Guarantee & Delivery</p>
              <p className="leading-relaxed font-light">
                Secure checkout powered by Stripe and secure blockchain nodes. Upon checkout verification, document links are instantly activated in the browser and back-delivered to your email address.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 font-sans">
      <main className="flex-1 w-full py-16 sm:py-24">
        {/* Search params are client-only and require Suspense wrapper for clean Next.js compile builds */}
        <Suspense fallback={
          <div className="min-h-[400px] flex justify-center items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-[#002d62]"></div>
          </div>
        }>
          <CheckoutContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
