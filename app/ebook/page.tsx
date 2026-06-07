import Link from "next/link";
import Footer from "@/components/Footer";
import { connectToDatabase } from "@/lib/mongodb";

// Default features for the featured book layout
const DEFAULT_FEATURES = [
  "Complete breakdown of scriptural principles on personal finance and growth",
  "Detailed blueprints for balancing Family, Faith, Finance, Friendships, and Fitness",
  "Practical daily strategies derived from 3,000 years of ancient Jewish teachings",
  "Over 150 pages of deeply researched, easy-to-read translations and applications",
  "Exclusive bonus workbook section with interactive reflection guides",
];

// Force dynamic fetch so updates from admin show up immediately on refresh
export const revalidate = 0;

export default async function EbookPage() {
  let ebooks: any[] = [];
  try {
    const { db } = await connectToDatabase();
    // Serialize MongoDB records
    const dbEbooks = await db
      .collection("ebooks")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    ebooks = dbEbooks.map(eb => ({
      _id: eb._id.toString(),
      title: eb.title,
      description: eb.description,
      price: eb.price,
      fileUrl: eb.fileUrl,
      imageUrl: eb.imageUrl || null,
      createdAt: eb.createdAt,
    }));
  } catch (error) {
    console.error("Database connection or query failed on ebooks page:", error);
  }

  // Determine what is the featured book and what are the others
  let featuredEbook: any = null;
  let remainingEbooks: any[] = [];

  if (ebooks.length > 0) {
    featuredEbook = ebooks[0];
    remainingEbooks = ebooks.slice(1);
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 font-sans">
      <main className="flex-1 w-full py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="text-[12px] font-bold tracking-widest text-[#d4af37] uppercase">
              Exclusive Resource Blueprints
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#002d62]">
              The Rabbi's Library
            </h1>
            
            {/* Gold Separator */}
            <div className="flex items-center justify-center">
              <div className="h-[1px] bg-[#d4af37]/60 w-16" />
              <span className="mx-3 text-[#d4af37]/80 text-sm">◆</span>
              <div className="h-[1px] bg-[#d4af37]/60 w-16" />
            </div>

            <p className="text-lg sm:text-xl leading-relaxed text-zinc-600 max-w-2xl mx-auto font-light">
              Unlock 3,000 years of ancient Jewish wisdom. Discover definitive guides to building generational wealth, cultivating character, and living with unshakeable purpose.
            </p>
          </div>

          {/* FEATURED EBOOK SECTION */}
          {!featuredEbook ? (
            /* Fallback Static Featured Ebook (When DB is empty) */
            <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center max-w-6xl mx-auto">
              {/* Left Column: Premium Ebook Mockup */}
              <div className="lg:col-span-5 flex justify-center animate-in fade-in duration-700">
                <div className="relative w-full max-w-[320px] aspect-[3/4.5] rounded-r-2xl bg-gradient-to-r from-[#001b3b] to-[#002d62] shadow-2xl p-8 flex flex-col justify-between border-y-2 border-r-2 border-[#d4af37]/30 group hover:shadow-amber-500/10 hover:shadow-2xl transition-all duration-300">
                  <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/40 to-transparent rounded-l-sm" />
                  
                  <div className="text-center pt-6 space-y-2">
                    <span className="text-[9px] font-bold tracking-[0.2em] text-amber-400 uppercase font-sans">
                      Ancient Wisdom
                    </span>
                    <div className="h-[1px] bg-amber-400/20 w-12 mx-auto" />
                  </div>

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

                  <div className="text-center pb-6 space-y-2">
                    <div className="h-[1px] bg-amber-400/20 w-12 mx-auto" />
                    <p className="font-serif text-sm font-semibold tracking-wide text-white">
                      Rabbi Menachem
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Book details */}
              <div className="lg:col-span-7 space-y-8">
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-zinc-900 font-serif leading-tight">
                    The Rabbi's Blueprint: Discover strategies for building generational wealth.
                  </h2>
                  <p className="text-base text-zinc-500 font-light leading-relaxed">
                    In this masterfully translated guide, Rabbi Menachem Goldberg shares the timeless, scriptural laws of productivity, finance, and human connection that have shaped thriving cultures for millennia.
                  </p>
                </div>

                <ul className="space-y-4">
                  {DEFAULT_FEATURES.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-zinc-700">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-semibold text-sm">
                        ✓
                      </span>
                      <span className="text-base sm:text-[17px] font-light leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Link
                    href="/checkout/ebook"
                    className="flex items-center justify-center rounded-full bg-[#a80f14] pl-6 pr-2 py-2 text-[15px] font-bold uppercase tracking-wider text-white shadow-md transition-all duration-300 hover:bg-[#8e0b0f] hover:scale-[1.03] active:scale-[0.98] group"
                  >
                    <span className="mx-auto">PURCHASE EBOOK</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shrink-0 ml-4">
                      <span className="text-[#a80f14] font-bold text-sm">→</span>
                    </div>
                  </Link>
                  <span className="text-xs text-zinc-400 max-w-[200px] leading-tight font-light mt-2 sm:mt-0">
                    Complete secure checkout to receive instant digital access in your inbox.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Database-driven Featured Ebook */
            <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center max-w-6xl mx-auto">
              
              {/* Left Column: Cover Mockup */}
              <div className="lg:col-span-5 flex justify-center animate-in fade-in duration-700">
                {featuredEbook.imageUrl ? (
                  /* Custom uploaded cover image with book border shadow */
                  <div className="relative w-full max-w-[320px] aspect-[3/4.5] rounded-r-2xl overflow-hidden shadow-2xl border-y border-r border-zinc-200 group hover:scale-[1.01] transition-transform duration-300">
                    <img
                      src={featuredEbook.imageUrl}
                      alt={featuredEbook.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/30 to-transparent" />
                  </div>
                ) : (
                  /* Premium Leather-bound mockup fallback utilizing the database title */
                  <div className="relative w-full max-w-[320px] aspect-[3/4.5] rounded-r-2xl bg-gradient-to-r from-[#001b3b] to-[#002d62] shadow-2xl p-8 flex flex-col justify-between border-y-2 border-r-2 border-[#d4af37]/30 group hover:shadow-2xl transition-all duration-300">
                    <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/40 to-transparent rounded-l-sm" />
                    
                    <div className="text-center pt-6 space-y-2">
                      <span className="text-[9px] font-bold tracking-[0.2em] text-amber-400 uppercase font-sans">
                        Premium Edition
                      </span>
                      <div className="h-[1px] bg-amber-400/20 w-12 mx-auto" />
                    </div>

                    <div className="text-center py-6 space-y-4">
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight uppercase">
                        {featuredEbook.title}
                      </h2>
                    </div>

                    <div className="text-center pb-6 space-y-2">
                      <div className="h-[1px] bg-amber-400/20 w-12 mx-auto" />
                      <p className="font-serif text-sm font-semibold tracking-wide text-white">
                        Rabbi Menachem
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Ebook Details */}
              <div className="lg:col-span-7 space-y-8 animate-in slide-in-from-right-6 duration-700">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Featured Blueprint
                    </span>
                    <span className="text-zinc-400 text-xs font-light">
                      Published {new Date(featuredEbook.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 font-serif leading-tight">
                    {featuredEbook.title}
                  </h2>
                  <div className="text-[#002d62] text-xl font-bold font-serif">
                    ${Number(featuredEbook.price).toFixed(2)} USD
                  </div>
                  <p className="text-base text-zinc-500 font-light leading-relaxed pt-2 border-t border-zinc-100">
                    {featuredEbook.description}
                  </p>
                </div>

                <ul className="space-y-4">
                  {DEFAULT_FEATURES.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-zinc-700">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-semibold text-sm">
                        ✓
                      </span>
                      <span className="text-base sm:text-[17px] font-light leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Link
                    href={`/checkout/ebook?id=${featuredEbook._id}`}
                    className="flex items-center justify-center rounded-full bg-[#a80f14] pl-6 pr-2 py-2 text-[15px] font-bold uppercase tracking-wider text-white shadow-md transition-all duration-300 hover:bg-[#8e0b0f] hover:scale-[1.03] active:scale-[0.98] group"
                  >
                    <span className="mx-auto">PURCHASE EBOOK</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shrink-0 ml-4">
                      <span className="text-[#a80f14] font-bold text-sm">→</span>
                    </div>
                  </Link>
                  <span className="text-xs text-zinc-400 max-w-[200px] leading-tight font-light mt-2 sm:mt-0">
                    Secure checkout powered by Stripe and Cryptocurrencies.
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* ALL OTHER EBOOKS GRID */}
          {remainingEbooks.length > 0 && (
            <div className="mt-28 space-y-12 border-t border-zinc-200 pt-16">
              <div className="text-center space-y-2">
                <h2 className="font-serif text-3xl font-bold text-[#002d62]">
                  More Blueprints from the Library
                </h2>
                <p className="text-sm text-zinc-500 font-light max-w-xl mx-auto">
                  Explore other publications and scriptural blueprints translated and compiled by Rabbi Menachem.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {remainingEbooks.map((eb) => (
                  <div key={eb._id} className="bg-white rounded-2xl border border-zinc-200 shadow-md overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300 group">
                    
                    {/* Cover Box Area */}
                    <div className="h-64 bg-zinc-100 relative flex items-center justify-center border-b border-zinc-100 overflow-hidden">
                      {eb.imageUrl ? (
                        <img
                          src={eb.imageUrl}
                          alt={eb.title}
                          className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-[#001b3b] to-[#002d62] flex flex-col justify-between p-6 text-white text-center">
                          <span className="text-[8px] font-bold tracking-widest text-amber-400 uppercase">
                            Premium Edition
                          </span>
                          <span className="font-serif font-bold text-lg leading-tight uppercase line-clamp-3 my-auto">
                            {eb.title}
                          </span>
                          <span className="text-[10px] text-zinc-300 font-serif">
                            Rabbi Menachem
                          </span>
                        </div>
                      )}
                      
                      {/* Price Badge */}
                      <span className="absolute top-3 right-3 bg-[#002d62] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                        ${Number(eb.price).toFixed(2)}
                      </span>
                    </div>

                    {/* Metadata Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4 bg-white">
                      <div className="space-y-2">
                        <h3 className="font-serif text-lg font-bold text-[#002d62] line-clamp-1">
                          {eb.title}
                        </h3>
                        <p className="text-zinc-500 font-light text-xs sm:text-sm line-clamp-3 leading-relaxed">
                          {eb.description}
                        </p>
                      </div>

                      <Link
                        href={`/checkout/ebook?id=${eb._id}`}
                        className="flex w-full items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-700 shadow-sm transition-colors text-center"
                      >
                        Purchase Ebook
                      </Link>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
