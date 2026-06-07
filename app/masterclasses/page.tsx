import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import NewsletterForm from "@/components/NewsletterForm";

export default function MasterclassesPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-950">
      <main className="relative flex-1 w-full flex items-center justify-start overflow-hidden py-16 sm:py-24">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/images/rabbi-speaking.png"
            alt="Rabbi Menachem Speaking"
            fill
            className="object-cover object-right md:object-center"
            priority
          />
          {/* Darkening overlays for readability */}
          <div className="absolute inset-0 bg-black/50 md:bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-transparent" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-8 z-10 flex">
          {/* Text Overlay Card (Left Aligned) */}
          <div className="w-full max-w-[620px] bg-transparent flex flex-col gap-6 text-zinc-200 animate-in fade-in slide-in-from-left-8 duration-700">

            {/* Category */}
            <span className="text-[12px] font-bold tracking-widest text-zinc-400 uppercase">
              Masterclasses with Rabbi Menachem
            </span>

            {/* Heading */}
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-white">
              Welcome!
            </h1>

            {/* Paragraphs */}
            <div className="space-y-4 text-[15px] sm:text-base leading-relaxed font-light text-zinc-300">
              <p>
                This page is home for our upcoming live Masterclass sessions with Rabbi Menachem. We are hard at work planning our next class and will list it here along with registration information as soon as it is scheduled.
              </p>
              <p>
                Our past masterclasses covered topics on wealth building, wisdom in the age of AI, and persuading confidently through sales and influence.
              </p>
              <p>
                Our session <strong className="font-medium text-white italic">Persuade with Purpose: Sell, Influence, & Prosper with Conviction and Confidence</strong> was so popular we expanded on it and made it a standalone course. For anyone who sells ideas or things, influences decisions, or simply wants to connect with their family and their associates more effectively. It includes all the core teaching along with material based on questions raised in and feedback from the live session, creating a rich in-depth learning experience.{" "}
                <Link href="/ebook" className="text-amber-400 hover:text-amber-300 underline font-semibold transition-colors">
                  Explore the Course Here.
                </Link>
              </p>

              {/* Callout */}
              <p className="italic text-amber-400 font-medium text-base sm:text-[17px] pt-2">
                If you would like to be among the first to hear about upcoming masterclasses, fill out the form below.
              </p>
            </div>

            {/* Stay in the Loop Form Section */}
            <div className="border-t border-white/10 pt-6 mt-2 space-y-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  Stay in the Loop
                </h3>
                <p className="text-sm text-zinc-400 mt-1 font-light">
                  Leave your email to get notified when a new Masterclass is available.
                </p>
              </div>

              <NewsletterForm />
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
