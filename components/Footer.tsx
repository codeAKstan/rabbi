"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = [
    { name: "Masterclasses", href: "/masterclasses" },
    { name: "Memberships", href: "/memberships" },
    { name: "Ebook", href: "/ebook" },
  ];

  return (
    <footer className="w-full bg-zinc-950 text-zinc-400 py-16 border-t border-zinc-900 mt-auto">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-zinc-900">

          {/* Logo & Brand */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/images/logo.png"
                alt="We Happy Warriors Logo"
                width={240}
                height={240}
                className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105 brightness-0 invert"
                priority
              />
            </Link>
            <p className="text-sm text-zinc-500 text-center md:text-left max-w-xs mt-1">
              Revealing ancient Jewish wisdom for personal growth, community, and purposeful living.
            </p>
          </div>

          {/* Quick Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-zinc-500">
          <p>© {currentYear} Rabbi Menachem. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
