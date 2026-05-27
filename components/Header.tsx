"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Masterclasses", href: "/masterclasses" },
    { name: "Memberships", href: "/memberships" },
    { name: "Ebook", href: "/ebook" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 sm:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center h-full group">
          <Image
            src="/images/logo.png"
            alt="We Happy Warriors Logo"
            width={240}
            height={240}
            className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105 translate-y-3"
            priority
          />
        </Link>

        {/* Desktop Navigation & Actions */}
        <div className="hidden md:flex items-center gap-8 h-full">
          <nav className="flex items-center justify-center gap-8 h-full">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative text-[18px] font-normal tracking-wide text-zinc-600 transition-colors duration-200 hover:text-zinc-900 py-2 group flex items-center h-full"
              >
                {item.name}
                <span className="absolute bottom-[26px] left-0 h-[1.5px] w-0 bg-zinc-400 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>
          <Link
            href="/donate"
            className="flex items-center justify-center rounded-full bg-[#a80f14] pl-6 pr-2 py-1.5 text-[16px] font-bold uppercase tracking-wider text-white shadow-md transition-all duration-300 hover:bg-[#8e0b0f] hover:scale-[1.03] active:scale-[0.98] group"
          >
            <span>DONATE</span>
            <div className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-white transition-transform duration-300 group-hover:scale-105">
              <svg
                className="h-4.5 w-4.5 text-[#a80f14]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <svg
              className="h-5 w-5 animate-in spin-in-90 duration-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5 animate-in fade-in duration-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-6 py-4">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-[17px] font-normal tracking-wide text-zinc-600 hover:text-zinc-900 py-2 border-b border-zinc-100 last:border-0"
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/donate"
              onClick={() => setIsOpen(false)}
              className="mt-2 flex w-full items-center justify-center rounded-full bg-[#a80f14] pl-6 pr-2 py-1.5 text-[16px] font-bold uppercase tracking-wider text-white shadow-md transition-all duration-300 hover:bg-[#8e0b0f]"
            >
              <span>DONATE</span>
              <div className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-white">
                <svg
                  className="h-4.5 w-4.5 text-[#a80f14]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
