import Link from "next/link";
import Footer from "@/components/Footer";

export default function EbookPage() {
  const features = [
    "Complete breakdown of scriptural principles on personal finance and growth",
    "Detailed blueprints for balancing Family, Faith, Finance, Friendships, and Fitness",
    "Practical daily strategies derived from 3,000 years of ancient Jewish teachings",
    "Over 150 pages of deeply researched, easy-to-read translations and applications",
    "Exclusive bonus workbook section with interactive reflection guides",
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 font-sans">
      <main className="flex-1 w-full py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="text-[12px] font-bold tracking-widest text-amber-600 uppercase">
              Exclusive Resource
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#002d62]">
              The Rabbi's Blueprint
            </h1>
            
            {/* Gold Separator */}
            <div className="flex items-center justify-center">
              <div className="h-[1px] bg-[#d4af37]/60 w-16" />
              <span className="mx-3 text-[#d4af37]/80 text-sm">◆</span>
              <div className="h-[1px] bg-[#d4af37]/60 w-16" />
            </div>

            <p className="text-lg sm:text-xl leading-relaxed text-zinc-600 max-w-2xl mx-auto font-light">
              Unlock 3,000 years of ancient Jewish wisdom with Rabbi Menachem's definitive guide to building generational wealth, cultivating character, and living with unshakeable purpose.
            </p>
          </div>

          {/* Ebook Presentation Layout */}
          <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center max-w-6xl mx-auto">
            
            {/* Left Column: Premium Ebook Mockup */}
            <div className="lg:col-span-5 flex justify-center animate-in fade-in duration-700">
              <div className="relative w-full max-w-[320px] aspect-[3/4.5] rounded-r-2xl bg-gradient-to-r from-[#001b3b] to-[#002d62] shadow-2xl p-8 flex flex-col justify-between border-y-2 border-r-2 border-amber-400/30 group hover:shadow-amber-500/10 hover:shadow-2xl transition-all duration-300">
                {/* Book Spine Shadow Accent */}
                <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/40 to-transparent rounded-l-sm" />
                
                {/* Book Header */}
                <div className="text-center pt-6 space-y-2">
                  <span className="text-[9px] font-bold tracking-[0.2em] text-amber-400 uppercase font-sans">
                    Ancient Wisdom
                  </span>
                  <div className="h-[1px] bg-amber-400/20 w-12 mx-auto" />
                </div>

                {/* Book Title */}
                <div className="text-center py-6 space-y-4">
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                    THE<br />
                    RABBI'S<br />
                    BLUEPRINT
                  </h2>
                  <p className="text-[11px] tracking-widest text-amber-400/80 font-sans uppercase">
                    Modern Wealth & Character
                  </p>
                </div>

                {/* Book Author */}
                <div className="text-center pb-6 space-y-2">
                  <div className="h-[1px] bg-amber-400/20 w-12 mx-auto" />
                  <p className="font-serif text-sm font-semibold tracking-wide text-white">
                    Rabbi Menachem
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Book details & Call to Action */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-zinc-900 font-serif leading-tight">
                  Discover strategies for building generational wealth and unshakeable character.
                </h2>
                <p className="text-base text-zinc-500 font-light leading-relaxed">
                  In this masterfully translated guide, Rabbi Menachem Goldberg shares the timeless, scriptural laws of productivity, finance, and human connection that have shaped thriving cultures for millennia.
                </p>
              </div>

              {/* Benefits checklist */}
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-zinc-700">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-semibold text-sm">
                      ✓
                    </span>
                    <span className="text-base sm:text-[17px] font-light leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button: Get Ebook */}
              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link
                  href="/checkout/ebook"
                  className="flex items-center justify-center rounded-full bg-[#a80f14] pl-6 pr-2 py-2 text-[15px] font-bold uppercase tracking-wider text-white shadow-md transition-all duration-300 hover:bg-[#8e0b0f] hover:scale-[1.03] active:scale-[0.98] group"
                >
                  <span className="mx-auto">GET THE EBOOK</span>
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
                <span className="text-xs text-zinc-400 max-w-[200px] leading-tight font-light mt-2 sm:mt-0">
                  Instant PDF & EPUB download sent immediately to your email.
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
