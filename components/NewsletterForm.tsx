"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email,
          source: "Masterclass Loop",
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setFullName("");
        setEmail("");
      } else {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to submit. Please try again.");
      }
    } catch (err) {
      setErrorMessage("Could not connect to the server. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {isSuccess && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded text-amber-300 text-sm font-medium animate-in fade-in duration-300">
          ✓ Success! You are now registered to receive masterclass notifications.
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm font-medium">
          ⚠️ {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="First and Last Name"
          className="flex-1 rounded bg-white px-4 py-2.5 text-[14px] text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:ring-2 focus:ring-amber-400"
          disabled={isSubmitting}
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="flex-1 rounded bg-white px-4 py-2.5 text-[14px] text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:ring-2 focus:ring-amber-400"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-[#fbbf24] hover:bg-[#f59e0b] px-6 py-2.5 text-[15px] font-bold text-black shadow-md transition-all duration-200 active:scale-95 shrink-0 disabled:bg-zinc-600 disabled:text-zinc-400 cursor-pointer"
        >
          {isSubmitting ? "Sending..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
