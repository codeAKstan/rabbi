"use client";

import { useState } from "react";

export default function ContactForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          email,
          message,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setFirstName("");
        setLastName("");
        setEmail("");
        setMessage("");
      } else {
        const data = await response.json();
        setErrorMessage(data.error || "Failed to send message. Please try again.");
      }
    } catch (err) {
      setErrorMessage("Could not connect to the server. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mt-12 space-y-6">
      {isSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm font-medium animate-in fade-in duration-300">
          ✓ Thank you! Your message has been sent successfully. We will get back to you soon.
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium">
          ⚠️ {errorMessage}
        </div>
      )}

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
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              className="w-full rounded border border-zinc-300 bg-zinc-50/30 px-3 py-2 text-[15px] text-zinc-800 outline-none transition-all focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]"
              disabled={isSubmitting}
            />
            <span className="text-[12px] text-zinc-500 block">First</span>
          </div>
          <div className="space-y-1">
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              className="w-full rounded border border-zinc-300 bg-zinc-50/30 px-3 py-2 text-[15px] text-zinc-800 outline-none transition-all focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]"
              disabled={isSubmitting}
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          className="w-full rounded border border-zinc-300 bg-zinc-50/30 px-3 py-2 text-[15px] text-zinc-800 outline-none transition-all focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]"
          disabled={isSubmitting}
        />
      </div>

      {/* Comment or Message */}
      <div className="space-y-1">
        <label className="text-[15px] font-bold text-zinc-800 block">
          Comment or Message
        </label>
        <textarea
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your message details..."
          className="w-full rounded border border-zinc-300 bg-zinc-50/30 px-3 py-2 text-[15px] text-zinc-800 outline-none transition-all focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62] resize-y"
          disabled={isSubmitting}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-[#002d62] hover:bg-[#001f42] hover:text-white px-6 py-2.5 text-[14px] font-bold uppercase tracking-wide text-white shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:bg-zinc-400 cursor-pointer"
        >
          {isSubmitting ? "Sending..." : "Submit Message"}
        </button>
      </div>
    </form>
  );
}
