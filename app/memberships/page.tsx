import Link from "next/link";
import Footer from "@/components/Footer";

export default function MembershipsPage() {
  const benefits = [
    "Unlimited access to all live and past Masterclasses",
    "Weekly inner-circle teachings & ancient scripture translation guides",
    "Direct advisory Q&A sessions with Rabbi Menachem",
    "Access to our private, secure communication channels",
    "Exclusive members-only archive of scriptural strategy blueprints",
    "Priority registration and VIP seating at all physical events",
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 font-sans">
      <main className="flex-1 w-full py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="text-[12px] font-bold tracking-widest text-amber-600 uppercase">
              Exclusive Membership
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#002d62]">
              Rabbi Menachem's Inner Circle
            </h1>
            
            {/* Subtle Gold Separator */}
            <div className="flex items-center justify-center">
              <div className="h-[1px] bg-[#d4af37]/60 w-16" />
              <span className="mx-3 text-[#d4af37]/80 text-sm">◆</span>
              <div className="h-[1px] bg-[#d4af37]/60 w-16" />
            </div>

            <p className="text-lg sm:text-xl leading-relaxed text-zinc-600 max-w-2xl mx-auto font-light">
              Enter our inner circle where you have access to everything—timeless wisdom, private direct advisory, and ancient strategy systems for modern success.
            </p>
          </div>

          {/* Grid Layout: Benefits & Pricing */}
          <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center max-w-6xl mx-auto">
            
            {/* Left Column: Benefits list */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 font-serif">
                  What you receive as a member:
                </h2>
                <p className="text-sm text-zinc-500 mt-1 font-light">
                  A comprehensive ecosystem dedicated to your spiritual, personal, and financial growth.
                </p>
              </div>

              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3 text-zinc-700">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-semibold text-sm">
                      ✓
                    </span>
                    <span className="text-base sm:text-[17px] font-light leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column: Pricing/Payment Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[420px] rounded-2xl bg-white border border-zinc-200 shadow-xl p-8 sm:p-10 flex flex-col gap-6 text-center relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                {/* Accent Tag */}
                <div className="absolute top-0 right-0 left-0 h-1.5 bg-[#002d62]" />
                
                <div>
                  <span className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                    All-Access Pass
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#002d62] mt-1">
                    Inner Circle Member
                  </h3>
                </div>

                <div className="py-4 border-y border-zinc-100 flex flex-col justify-center items-center">
                  <div className="flex items-baseline gap-1">
                    <span className="text-zinc-900 text-5xl font-bold font-serif">$49</span>
                    <span className="text-zinc-500 text-base font-light">/month</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2 font-light">Cancel at any time. No hidden fees.</p>
                </div>

                <p className="text-sm leading-relaxed text-zinc-500 font-light">
                  Gain instant access to our private Telegram, WhatsApp, and weekly Zoom advisory sessions today.
                </p>

                {/* Custom Red/Crimson Pay Button matching established brand style */}
                <Link
                  href="/checkout/membership"
                  className="mt-2 flex w-full items-center justify-center rounded-full bg-[#a80f14] pl-6 pr-2 py-2 text-[15px] font-bold uppercase tracking-wider text-white shadow-md transition-all duration-300 hover:bg-[#8e0b0f] hover:scale-[1.03] active:scale-[0.98] group"
                >
                  <span className="mx-auto">JOIN PRIVATE CHANNELS</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shrink-0">
                    <svg
                      className="h-4.5 w-4.5 text-[#a80f14]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                </Link>

                <span className="text-[11px] text-zinc-400 font-light flex items-center justify-center gap-1.5">
                  🛡️ Secure Checkout powered by Stripe
                </span>
              </div>
            </div>

          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
