import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex-1 bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Content */}
            <div className="flex flex-col justify-center lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div>
                <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#002d62]">
                  Rabbi Menachem
                </h1>

                {/* Golden Divider */}
                <div className="my-6 flex items-center">
                  <div className="h-[1.5px] bg-[#d4af37] w-full max-w-[200px]" />
                  <span className="mx-3 text-[#d4af37] text-lg font-serif">◆</span>
                  <div className="h-[1.5px] bg-[#d4af37] w-full max-w-[200px]" />
                </div>
              </div>

              <p className="text-xl sm:text-2xl leading-relaxed text-zinc-700 font-sans max-w-2xl font-light">
                Providing you with{" "}
                <strong className="font-semibold text-[#002d62]">3,000</strong>{" "}
                years of ancient Jewish wisdom in the areas that matter in your life:{" "}
                <strong className="font-semibold text-[#002d62]">
                  Family, Faith, Finances, Friendships and Fitness
                </strong>
                .
              </p>

              {/* Call to Actions */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="/masterclasses"
                  className="rounded-full bg-[#002d62] px-8 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#001f42] hover:scale-[1.03] active:scale-[0.98]"
                >
                  Explore Masterclasses
                </Link>
                <Link
                  href="/ebook"
                  className="rounded-full border border-zinc-300 bg-white px-8 py-3.5 text-base font-semibold text-zinc-700 shadow-sm transition-all duration-300 hover:bg-zinc-50 hover:border-zinc-400"
                >
                  Get Ebook
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="lg:col-span-5 flex justify-center animate-in fade-in slide-in-from-right-6 duration-700 delay-200">
              <div className="relative w-full max-w-[450px] aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-zinc-100 group">
                <Image
                  src="/images/rabbi.jpeg"
                  alt="Rabbi Menachem"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#002d62]/10 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teachings Banner Section */}
      <section className="bg-blue-600 w-full py-12">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-white text-base md:text-[17px] font-semibold tracking-wider uppercase max-w-3xl leading-relaxed text-center md:text-left">
            Join 40,000+ people who have chosen to receive weekly teachings from Rabbi Menachem revealing ancient Jewish wisdom for their lives.
          </p>
          <Link
            href="/masterclasses"
            className="flex items-center gap-3 rounded-lg border-2 border-white px-8 py-3 text-base font-bold text-white transition-all duration-300 hover:bg-white hover:text-blue-600 shadow-md hover:scale-[1.03] active:scale-[0.98] shrink-0"
          >
            <span>Masterclass</span>
            <span className="text-xl">»</span>
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="w-full py-20 bg-zinc-50/50 border-b border-zinc-100">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 flex flex-col items-center">
          <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#002d62] text-center">
            About Rabbi Menachem
          </h2>
          
          {/* Subtle Decorative Golden Divider */}
          <div className="my-6 flex items-center justify-center w-full">
            <div className="h-[1px] bg-[#d4af37]/60 w-16" />
            <span className="mx-3 text-[#d4af37]/80 text-sm">◆</span>
            <div className="h-[1px] bg-[#d4af37]/60 w-16" />
          </div>

          <p className="italic font-sans text-zinc-600 text-lg sm:text-xl leading-relaxed text-center max-w-4xl">
            Rabbi Menachem Goldberg is a noted rabbinic scholar, trusted advisor, and author deeply committed to sharing the timeless principles of Jewish wisdom. He hosts the Rabbi's Blueprint channel and has spent over twenty years translating ancient scriptural texts into practical, real-world strategies for modern life. Renowned for his ability to unpack profound truths with clarity and nuance, his teachings on the intersection of faith, finance, and unshakeable character have helped thousands of people from all backgrounds master their personal growth, cultivate generational wealth, and live with deep purpose.
          </p>
        </div>
      </section>

      {/* Get In Touch Section */}
      <section className="w-full py-20 bg-white">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 flex flex-col items-center">
          <h2 className="text-3xl font-bold tracking-wider text-[#002d62] text-center uppercase">
            Get In Touch
          </h2>
          
          <p className="mt-4 italic font-sans text-zinc-600 text-[15px] sm:text-base leading-relaxed text-center max-w-2xl">
            Do you have a question you'd like to discuss or simply want to stay in touch? Send us an email at:{" "}
            <a href="mailto:admin@rabbimenachem.com" className="text-blue-600 hover:underline">
              admin@rabbimenachem.com
            </a>{" "}
            or use the contact form below.
          </p>

          <form className="w-full mt-12 space-y-6">
            {/* Name Fields */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-zinc-800 flex items-center">
                Name <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <input
                    type="text"
                    required
                    className="w-full rounded border border-zinc-300 bg-zinc-50/30 px-3 py-2 text-[15px] text-zinc-800 outline-none transition-all focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]"
                  />
                  <span className="text-[12px] text-zinc-500 block">First</span>
                </div>
                <div className="space-y-1">
                  <input
                    type="text"
                    required
                    className="w-full rounded border border-zinc-300 bg-zinc-50/30 px-3 py-2 text-[15px] text-zinc-800 outline-none transition-all focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]"
                  />
                  <span className="text-[12px] text-zinc-500 block">Last</span>
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[15px] font-bold text-zinc-800 flex items-center">
                Email <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                required
                className="w-full rounded border border-zinc-300 bg-zinc-50/30 px-3 py-2 text-[15px] text-zinc-800 outline-none transition-all focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]"
              />
            </div>

            {/* Comment or Message */}
            <div className="space-y-1">
              <label className="text-[15px] font-bold text-zinc-800 block">
                Comment or Message
              </label>
              <textarea
                rows={6}
                className="w-full rounded border border-zinc-300 bg-zinc-50/30 px-3 py-2 text-[15px] text-zinc-800 outline-none transition-all focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62] resize-y"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="rounded-md bg-zinc-100 border border-zinc-300 hover:bg-zinc-200 px-6 py-2.5 text-[14px] font-medium text-zinc-700 shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
