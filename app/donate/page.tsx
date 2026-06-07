"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

// Preset Chai values and their descriptions
const CHAI_PRESETS = [
  { amount: 18, label: "$18", meaning: "Chai (Life)", desc: "Sponsors weekly distribution of scriptural insights." },
  { amount: 36, label: "$36", meaning: "Double Chai", desc: "Helps translate ancient Hebrew texts for modern application." },
  { amount: 72, label: "$72", meaning: "Triple Chai", desc: "Provides worksheets and reflection guides to students." },
  { amount: 180, label: "$180", meaning: "Tenfold Chai", desc: "Directly funds a live online Masterclass session." },
  { amount: 360, label: "$360", meaning: "Twentyfold Chai", desc: "Supports technical infrastructure and physical events." },
  { amount: 540, label: "$540", meaning: "Thirtyfold Chai", desc: "Sponsors global outreach and translation of core ebook libraries." },
];

export default function DonatePage() {
  const [frequency, setFrequency] = useState<"once" | "monthly">("once");
  const [selectedPreset, setSelectedPreset] = useState<number | "custom">(36);
  const [customAmount, setCustomAmount] = useState<string>("");

  // Payment Type State
  const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto">("card");

  // Billing/Card States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Flow & Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Determine actual amount being given
  const activeAmount = selectedPreset === "custom"
    ? (Number(customAmount) || 0)
    : selectedPreset;

  // Custom Amount Dynamic Message generator
  const getImpactMessage = (amount: number) => {
    if (amount <= 0) return "Please enter a donation amount.";
    if (amount < 18) return "Thank you for your valuable support in spreading ancient wisdom.";
    if (amount >= 18 && amount < 36) return "Sponsors the weekly delivery of Ancient Jewish Wisdom to 100+ readers.";
    if (amount >= 36 && amount < 72) return "Translates a full paragraph of historical Hebrew texts into practical modern blueprints.";
    if (amount >= 72 && amount < 180) return "Distributes reflection guides and workbook chapters to digital members.";
    if (amount >= 180 && amount < 360) return "Sponsors an online interactive masterclass session with Rabbi Menachem.";
    if (amount >= 360 && amount < 540) return "Funds the recording, editing, and hosting of educational videos.";
    return "Sponsors global outreach initiatives, translating files, and broadcasting teachings internationally.";
  };

  // Preset detail display
  const getPresetDetail = () => {
    if (selectedPreset === "custom") {
      return {
        meaning: "Custom Offering",
        desc: getImpactMessage(Number(customAmount) || 0)
      };
    }
    const preset = CHAI_PRESETS.find(p => p.amount === selectedPreset);
    return preset ? { meaning: preset.meaning, desc: preset.desc } : null;
  };

  const currentPresetDetail = getPresetDetail();

  // Check for successful redirect back from BTCPay Server
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("status") === "success") {
        setIsSuccess(true);
        // Clean up URL query parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Simple validation & simulated submit or BTCPay invoice redirect
  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (activeAmount <= 0) {
      setErrorMessage("Please select or enter a donation amount greater than $0.");
      return;
    }
    if (!firstName || !lastName || !email) {
      setErrorMessage("Please fill out your name and email address.");
      return;
    }
    if (paymentMethod === "card" && (!cardNumber || !expiry || !cvc)) {
      setErrorMessage("Please complete your card details for secure processing.");
      return;
    }
    if (!agreeTerms) {
      setErrorMessage("You must accept the terms of service to proceed.");
      return;
    }

    setIsSubmitting(true);

    if (paymentMethod === "card") {
      setErrorMessage("Credit Card payment is currently not available.");
      setIsSubmitting(false);
      return;
    } else {
      // BTCPay Server integration (Redirect Flow)
      try {
        const response = await fetch("/api/donate/btcpay", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: activeAmount,
            firstName,
            lastName,
            email,
            frequency,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to create crypto invoice.");
        }

        if (data.checkoutLink) {
          // Redirect the user to BTCPay Server payment page
          window.location.href = data.checkoutLink;
        } else {
          throw new Error("BTCPay Server did not return a valid checkout link.");
        }
      } catch (err: any) {
        console.error("Crypto payment checkout error:", err);
        setErrorMessage(err.message || "An error occurred while launching crypto payment.");
        setIsSubmitting(false);
      }
    }
  };

  // Card formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 16);
    // Format in groups of 4: XXXX XXXX XXXX XXXX
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 4);
    // Format as MM/YY
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

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 font-sans">
      <main className="flex-1 w-full py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">

          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto space-y-6 mb-16">
            <span className="text-[12px] font-bold tracking-widest text-[#d4af37] uppercase">
              Partner With Our Mission
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#002d62]">
              Support Rabbi Menachem
            </h1>

            {/* Gold Separator */}
            <div className="flex items-center justify-center">
              <div className="h-[1px] bg-[#d4af37]/60 w-16" />
              <span className="mx-3 text-[#d4af37]/80 text-sm">◆</span>
              <div className="h-[1px] bg-[#d4af37]/60 w-16" />
            </div>

            <p className="text-lg sm:text-xl leading-relaxed text-zinc-600 max-w-2xl mx-auto font-light">
              Your donation directly enables the translation of ancient Jewish texts into actionable, life-changing blueprints for family, faith, finance, friendships, and fitness.
            </p>
          </div>

          {isSuccess ? (
            /* Thank You / Success Receipt State */
            <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-zinc-200 shadow-xl p-8 sm:p-12 text-center animate-in fade-in duration-500">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-6">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>

              <span className="text-[12px] font-bold tracking-widest text-emerald-600 uppercase">
                Payment Securely Processed
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#002d62] mt-2 mb-4">
                Thank You, {firstName}!
              </h2>

              <div className="my-6 border-y border-zinc-100 py-6 text-left space-y-4 max-w-md mx-auto">
                <div className="flex justify-between text-sm text-zinc-600">
                  <span>Sponsorship Type:</span>
                  <span className="font-semibold text-zinc-900 capitalize">{frequency} Pledge</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-600">
                  <span>Amount:</span>
                  <span className="font-bold text-[#002d62] text-lg">${activeAmount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-600">
                  <span>Payment Method:</span>
                  <span className="font-semibold text-zinc-900 capitalize">
                    {paymentMethod === "crypto" ? "Bitcoin / Crypto" : "Credit Card"}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-zinc-600">
                  <span>Donor Email:</span>
                  <span className="font-semibold text-zinc-900">{email}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-600">
                  <span>Transaction ID:</span>
                  <span className="font-mono text-zinc-500">TXN-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
              </div>

              {/* Personal message block */}
              <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100 italic text-zinc-600 text-sm leading-relaxed max-w-lg mx-auto text-left relative">
                <span className="absolute -top-3 left-4 bg-white px-2 text-[10px] uppercase font-bold tracking-widest text-[#d4af37]">
                  A Message from the Rabbi
                </span>
                "Tzedakah is more than a donation—it is a partnership in spreading light, virtue, and timeless direction in an uncertain world. Your generosity makes you a vital builder in this community. May you and your family be blessed with abundance, health, and joy in all your endeavors."
                <div className="text-right mt-3 font-serif font-bold text-[#002d62] not-italic">— Rabbi Menachem</div>
              </div>

              <div className="mt-8 flex justify-center gap-4">
                <Link
                  href="/"
                  className="rounded-full bg-[#002d62] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#001f42] transition-colors"
                >
                  Return Home
                </Link>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setSelectedPreset(36);
                    setCustomAmount("");
                    setCardNumber("");
                    setExpiry("");
                    setCvc("");
                    setFirstName("");
                    setLastName("");
                    setEmail("");
                    setBillingZip("");
                  }}
                  className="rounded-full border border-zinc-300 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  Donate Again
                </button>
              </div>
            </div>
          ) : (
            /* Two Column Interactive Donation Page */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-start">

              {/* Left Column: The Interactive Form */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200 shadow-xl p-6 sm:p-8 space-y-8">

                {/* Frequency Toggle */}
                <div>
                  <label className="text-[13px] font-bold text-zinc-400 tracking-wider uppercase block mb-3">
                    Select Donation Frequency
                  </label>
                  <div className="grid grid-cols-2 bg-zinc-100 p-1 rounded-full border border-zinc-200">
                    <button
                      type="button"
                      onClick={() => setFrequency("once")}
                      className={`py-2.5 text-sm font-bold uppercase tracking-wider rounded-full transition-all duration-300 ${frequency === "once"
                          ? "bg-[#002d62] text-white shadow-md"
                          : "text-zinc-600 hover:text-zinc-900"
                        }`}
                    >
                      Give One-Time
                    </button>
                    <button
                      type="button"
                      onClick={() => setFrequency("monthly")}
                      className={`py-2.5 text-sm font-bold uppercase tracking-wider rounded-full transition-all duration-300 ${frequency === "monthly"
                          ? "bg-[#002d62] text-white shadow-md"
                          : "text-zinc-600 hover:text-zinc-900"
                        }`}
                    >
                      Give Monthly
                    </button>
                  </div>
                </div>

                {/* Amount Select Grid */}
                <div>
                  <label className="text-[13px] font-bold text-zinc-400 tracking-wider uppercase block mb-3">
                    Choose Amount (USD)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {CHAI_PRESETS.map((preset) => (
                      <button
                        key={preset.amount}
                        type="button"
                        onClick={() => {
                          setSelectedPreset(preset.amount);
                          setCustomAmount("");
                        }}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${selectedPreset === preset.amount
                            ? "border-[#d4af37] bg-amber-50/20 ring-2 ring-[#d4af37]/30"
                            : "border-zinc-200 hover:border-zinc-300 bg-white"
                          }`}
                      >
                        <span className={`text-xl font-bold font-serif ${selectedPreset === preset.amount ? "text-[#002d62]" : "text-zinc-800"}`}>
                          {preset.label}
                        </span>
                        <span className="text-[10px] text-amber-600 font-semibold tracking-wide uppercase mt-1">
                          {preset.meaning}
                        </span>
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setSelectedPreset("custom")}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${selectedPreset === "custom"
                          ? "border-[#d4af37] bg-amber-50/20 ring-2 ring-[#d4af37]/30"
                          : "border-zinc-200 hover:border-zinc-300 bg-white"
                        }`}
                    >
                      <span className={`text-lg font-bold font-serif ${selectedPreset === "custom" ? "text-[#002d62]" : "text-zinc-800"}`}>
                        Custom
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium tracking-wide uppercase mt-1">
                        Any Amount
                      </span>
                    </button>
                  </div>

                  {/* Custom Amount Field */}
                  {selectedPreset === "custom" && (
                    <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                      <div className="relative rounded-lg shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-zinc-500 sm:text-base">$</span>
                        </div>
                        <input
                          type="number"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="Enter your custom amount"
                          className="w-full rounded-lg border border-zinc-300 bg-zinc-50/30 pl-8 pr-3 py-3 text-base text-zinc-800 outline-none transition-all focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]"
                          min="1"
                        />
                      </div>
                    </div>
                  )}

                  {/* Dynamic Impact Statement */}
                  {currentPresetDetail && activeAmount > 0 && (
                    <div className="mt-4 p-4 rounded-lg bg-zinc-50 border border-zinc-100 flex items-start gap-3 animate-in fade-in duration-300">
                      <span className="text-amber-500 text-lg mt-0.5">◆</span>
                      <div>
                        <p className="text-[12px] font-bold text-amber-800 uppercase tracking-wide">
                          {currentPresetDetail.meaning}
                        </p>
                        <p className="text-sm text-zinc-600 font-light leading-relaxed mt-0.5">
                          {currentPresetDetail.desc}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Secure Checkout Form */}
                <form onSubmit={handleDonate} className="border-t border-zinc-100 pt-8 space-y-6">
                  <h3 className="font-serif text-xl font-bold text-[#002d62] border-b border-zinc-100 pb-2">
                    2. Payment Information
                  </h3>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="text-[13px] font-bold text-zinc-400 tracking-wider uppercase block mb-3">
                      Select Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer ${paymentMethod === "card"
                            ? "border-[#002d62] bg-[#002d62]/5 text-[#002d62] ring-2 ring-[#002d62]/10"
                            : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 bg-white"
                          }`}
                      >
                        <span className="text-base">💳</span> Credit Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("crypto")}
                        className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer ${paymentMethod === "crypto"
                            ? "border-[#d4af37] bg-amber-50/20 text-[#c89e2b] ring-2 ring-[#d4af37]/20"
                            : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 bg-white"
                          }`}
                      >
                        <span className="text-amber-500 font-serif text-base">₿</span> Bitcoin / Crypto
                      </button>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium flex items-center gap-2">
                      <span>⚠️</span> {errorMessage}
                    </div>
                  )}

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[13px] font-bold text-zinc-700 flex items-center">
                        First Name <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full rounded border border-zinc-300 bg-zinc-50/30 px-3 py-2.5 text-[15px] text-zinc-800 outline-none transition-all focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[13px] font-bold text-zinc-700 flex items-center">
                        Last Name <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full rounded border border-zinc-300 bg-zinc-50/30 px-3 py-2.5 text-[15px] text-zinc-800 outline-none transition-all focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1">
                    <label className="text-[13px] font-bold text-zinc-700 flex items-center">
                      Email Address <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded border border-zinc-300 bg-zinc-50/30 px-3 py-2.5 text-[15px] text-zinc-800 outline-none transition-all focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]"
                    />
                  </div>

                  {/* Credit Card Inputs */}
                  {paymentMethod === "card" && (
                    <>
                      {/* Credit Card Input Row */}
                      <div className="space-y-3">
                        <label className="text-[13px] font-bold text-zinc-700 flex items-center justify-between">
                          <span>Card Details <span className="text-red-500">*</span></span>
                          <span className="text-zinc-400 text-xs flex gap-1 items-center">
                            🔒 SSL Encrypted Secure Checkout
                          </span>
                        </label>

                        <div className="border border-zinc-300 rounded-lg overflow-hidden focus-within:border-[#002d62] focus-within:ring-1 focus-within:ring-[#002d62] bg-zinc-50/30 transition-all">
                          {/* Card Number */}
                          <div className="relative border-b border-zinc-200">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <span className="text-zinc-400 text-sm">💳</span>
                            </div>
                            <input
                              type="text"
                              required
                              value={cardNumber}
                              onChange={handleCardNumberChange}
                              placeholder="Card Number (XXXX XXXX XXXX XXXX)"
                              className="w-full bg-transparent pl-10 pr-3 py-3 text-[15px] text-zinc-800 outline-none"
                            />
                          </div>

                          {/* Expiry, CVC, Zip */}
                          <div className="grid grid-cols-3 divide-x divide-zinc-200">
                            <input
                              type="text"
                              required
                              value={expiry}
                              onChange={handleExpiryChange}
                              placeholder="MM/YY"
                              className="w-full bg-transparent px-3 py-3 text-[15px] text-zinc-800 outline-none text-center"
                            />
                            <input
                              type="text"
                              required
                              value={cvc}
                              onChange={handleCvcChange}
                              placeholder="CVC"
                              className="w-full bg-transparent px-3 py-3 text-[15px] text-zinc-800 outline-none text-center"
                            />
                            <input
                              type="text"
                              required
                              value={billingZip}
                              onChange={(e) => setBillingZip(e.target.value)}
                              placeholder="Zip Code"
                              className="w-full bg-transparent px-3 py-3 text-[15px] text-zinc-800 outline-none text-center"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Alternative Fast Payments Mocks */}
                      <div className="pt-2">
                        <span className="text-xs text-zinc-400 font-semibold tracking-wider uppercase block text-center mb-3">
                          Or Give Securely Via
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => alert("PayPal is currently not available.")}
                            className="flex items-center justify-center gap-2 rounded-lg border border-zinc-300 hover:border-zinc-400 bg-white py-2.5 text-sm font-semibold text-zinc-700 transition-colors cursor-pointer"
                          >
                            <span className="text-blue-600 font-bold">Pay</span><span className="text-cyan-500 font-bold">Pal</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => alert("Apple Pay is currently not available.")}
                            className="flex items-center justify-center gap-2 rounded-lg border border-zinc-300 hover:border-zinc-400 bg-white py-2.5 text-sm font-semibold text-zinc-700 transition-colors cursor-pointer"
                          >
                            <span> Pay</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Cryptocurrency Information */}
                  {paymentMethod === "crypto" && (
                    <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4 animate-in fade-in duration-300">
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
                        We support **Bitcoin (BTC)** and **Lightning Network** payments directly. Upon clicking the button below, a secure checkout modal will open to complete your payment.
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

                  {/* Terms Acceptance */}
                  <label className="flex items-start gap-3 text-xs text-zinc-500 select-none cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-zinc-300 text-[#002d62] focus:ring-[#002d62]"
                    />
                    <span>
                      I authorize this charge and agree to support Rabbi Menachem's blueprints. Recurring pledges can be cancelled anytime by contacting support.
                    </span>
                  </label>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center rounded-full bg-[#a80f14] pl-6 pr-2 py-3 text-[16px] font-bold uppercase tracking-wider text-white shadow-md transition-all duration-300 hover:bg-[#8e0b0f] hover:scale-[1.01] active:scale-[0.99] disabled:bg-zinc-400 disabled:scale-100 group cursor-pointer"
                    >
                      <span className="mx-auto font-bold">
                        {isSubmitting
                          ? "Securing Transaction..."
                          : paymentMethod === "crypto"
                            ? `DONATE WITH BITCOIN / CRYPTO`
                            : `CONFIRM ${frequency === "monthly" ? "MONTHLY" : "ONE-TIME"} DONATION OF $${activeAmount}`}
                      </span>
                      {!isSubmitting && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shrink-0">
                          <svg className="h-4.5 w-4.5 text-[#a80f14]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>

                </form>
              </div>

              {/* Right Column: Quotes, Sponsorship Info, FAQ */}
              <div className="lg:col-span-5 space-y-8">

                {/* Tzedakah philosophy quote */}
                <div className="bg-[#002d62] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-blue-900 relative overflow-hidden">
                  {/* Subtle Background Pattern */}
                  <div className="absolute top-0 right-0 p-8 text-blue-900 text-9xl opacity-20 font-serif pointer-events-none">
                    ◆
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#d4af37] uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>The Act of Tzedakah</span>
                  </h3>
                  <p className="font-serif italic text-base leading-relaxed text-zinc-100">
                    "Charity, in ancient Jewish wisdom, is called Tzedakah. It does not mean mercy; it translates literally to 'justice'. When you give, you are not handing out a favor—you are performing an act of righteousness to balance the scales and partner in correcting the world."
                  </p>
                  <div className="h-[1px] bg-blue-800 my-4" />
                  <p className="text-xs text-zinc-300 font-light leading-relaxed">
                    By sponsoring our study guides, webinars, and masterclasses, you ensure that timeless guidelines for building families, thriving businesses, and strong communities remain accessible to everyone, everywhere.
                  </p>
                </div>

                {/* Sponsorship Tiers summary */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg p-6 space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#002d62] border-b border-zinc-100 pb-2">
                    Sponsorship Benefits
                  </h3>

                  <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                      <span className="text-emerald-500 font-semibold text-lg">✓</span>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-800">Inner Circle Access</h4>
                        <p className="text-xs text-zinc-500 font-light mt-0.5">All donors giving $36/month or more receive invitations to private Telegram channels.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-emerald-500 font-semibold text-lg">✓</span>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-800">Study Blueprints & Ebooks</h4>
                        <p className="text-xs text-zinc-500 font-light mt-0.5">Receive complimentary PDF editions of new ebooks and translation workbook packages.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="text-emerald-500 font-semibold text-lg">✓</span>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-800">Live Q&A Priority</h4>
                        <p className="text-xs text-zinc-500 font-light mt-0.5">Submit questions directly ahead of masterclass sessions to ensure Rabbi Menachem addresses them.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQs */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg p-6 space-y-6">
                  <h3 className="font-serif text-lg font-bold text-[#002d62] border-b border-zinc-100 pb-2">
                    Frequently Asked Questions
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-zinc-800">Is my donation tax-deductible?</h4>
                      <p className="text-xs text-zinc-500 font-light leading-relaxed">
                        Yes, donations are processed through our non-profit structural partner and are fully tax-deductible to the extent allowed by law. You will receive an official tax receipt via email.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-zinc-800">Can I modify or cancel my monthly pledge?</h4>
                      <p className="text-xs text-zinc-500 font-light leading-relaxed">
                        Absolutely. You can modify the amount or cancel your recurring contribution at any time by emailing admin@rabbimenachem.com. No questions asked.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-zinc-800">How will my contribution be spent?</h4>
                      <p className="text-xs text-zinc-500 font-light leading-relaxed">
                        Funds directly pay for scholarly research, translation of classic ancient texts, video recording production, and technical delivery infrastructure.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
