"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Login Form States
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [submittingLogin, setSubmittingLogin] = useState(false);

  // Dashboard States
  const [stats, setStats] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [registrants, setRegistrants] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"donations" | "registrants" | "inquiries" | "ebooks">("donations");
  const [searchQuery, setSearchQuery] = useState("");

  // Ebook Upload Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newEbookTitle, setNewEbookTitle] = useState("");
  const [newEbookDescription, setNewEbookDescription] = useState("");
  const [newEbookPrice, setNewEbookPrice] = useState("");
  const [newEbookFile, setNewEbookFile] = useState<File | null>(null);
  const [newEbookImage, setNewEbookImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Ebook Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEbookId, setEditingEbookId] = useState("");
  const [editEbookTitle, setEditEbookTitle] = useState("");
  const [editEbookDescription, setEditEbookDescription] = useState("");
  const [editEbookPrice, setEditEbookPrice] = useState("");
  const [editEbookFile, setEditEbookFile] = useState<File | null>(null);
  const [editEbookImage, setEditEbookImage] = useState<File | null>(null);
  const [editEbookFileUrl, setEditEbookFileUrl] = useState("");
  const [editEbookImageUrl, setEditEbookImageUrl] = useState("");
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");

  // Check auth state on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        setIsAuthenticated(true);
        await fetchDashboardData();
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setDonations(data.donations || []);
        setRegistrants(data.registrants || []);
        setInquiries(data.inquiries || []);
      } else {
        if (res.status === 401) {
          setIsAuthenticated(false);
          return;
        }
      }

      // Fetch Ebooks list
      const ebooksRes = await fetch("/api/admin/ebooks");
      if (ebooksRes.ok) {
        const ebooksData = await ebooksRes.json();
        setEbooks(ebooksData.ebooks || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setSubmittingLogin(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        await fetchDashboardData();
      } else {
        setLoginError(data.error || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setLoginError("Could not connect to authentication service.");
    } finally {
      setSubmittingLogin(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setIsAuthenticated(false);
        setStats(null);
        setDonations([]);
        setRegistrants([]);
        setInquiries([]);
        setEbooks([]);
        setEmailInput("");
        setPasswordInput("");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Handle new Ebook upload submission
  const handleEbookUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError("");
    setUploading(true);

    if (!newEbookTitle.trim() || !newEbookDescription.trim() || !newEbookPrice || !newEbookFile) {
      setUploadError("All fields including the ebook file are required.");
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", newEbookTitle.trim());
      formData.append("description", newEbookDescription.trim());
      formData.append("price", newEbookPrice);
      formData.append("file", newEbookFile);
      if (newEbookImage) {
        formData.append("image", newEbookImage);
      }

      const res = await fetch("/api/admin/ebooks", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh ebooks list
        await fetchDashboardData();
        // Reset and close modal
        setNewEbookTitle("");
        setNewEbookDescription("");
        setNewEbookPrice("");
        setNewEbookFile(null);
        setNewEbookImage(null);
        setIsUploadModalOpen(false);
      } else {
        setUploadError(data.error || "Failed to upload ebook.");
      }
    } catch (err) {
      setUploadError("An error occurred while uploading. Check your network.");
    } finally {
      setUploading(false);
    }
  };

  // Open Edit Ebook Modal and populate fields
  const openEditModal = (eb: any) => {
    setEditError("");
    setEditingEbookId(eb._id);
    setEditEbookTitle(eb.title || "");
    setEditEbookDescription(eb.description || "");
    setEditEbookPrice(String(eb.price || ""));
    setEditEbookFile(null);
    setEditEbookImage(null);
    setEditEbookFileUrl(eb.fileUrl || "");
    setEditEbookImageUrl(eb.imageUrl || "");
    setIsEditModalOpen(true);
  };

  // Handle Ebook update submission
  const handleEbookEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    setEditing(true);

    if (!editEbookTitle.trim() || !editEbookDescription.trim() || !editEbookPrice) {
      setEditError("Title, description, and price are required.");
      setEditing(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", editEbookTitle.trim());
      formData.append("description", editEbookDescription.trim());
      formData.append("price", editEbookPrice);
      if (editEbookFile) {
        formData.append("file", editEbookFile);
      }
      if (editEbookImage) {
        formData.append("image", editEbookImage);
      }

      const res = await fetch(`/api/admin/ebooks?id=${editingEbookId}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await fetchDashboardData();
        setIsEditModalOpen(false);
      } else {
        setEditError(data.error || "Failed to update ebook.");
      }
    } catch (err) {
      setEditError("An error occurred during save. Check your connection.");
    } finally {
      setEditing(false);
    }
  };

  // Handle Ebook deletion
  const handleEbookDelete = async (id: string, title: string) => {
    const confirmed = window.confirm(`Are you sure you want to permanently delete the ebook "${title}"?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/ebooks?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await fetchDashboardData();
      } else {
        alert(data.error || "Failed to delete ebook.");
      }
    } catch (err) {
      alert("An error occurred while deleting. Check your connection.");
    }
  };

  // Filter lists based on search bar
  const getFilteredDonations = () => {
    return donations.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredRegistrants = () => {
    return registrants.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.source.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredInquiries = () => {
    return inquiries.filter(i => 
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.message.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredEbooks = () => {
    return ebooks.filter(eb => 
      eb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eb.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-zinc-50 font-sans">
        <div className="flex flex-col items-center gap-4">
          {/* Custom Spinner */}
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-300 border-t-[#002d62]"></div>
          <span className="text-zinc-600 text-sm font-semibold tracking-wider uppercase">
            Verifying Admin Session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 font-sans">
      
      {!isAuthenticated ? (
        /* RENDER LOGIN FORM */
        <main className="flex-1 flex items-center justify-center py-20 px-6">
          <div className="w-full max-w-[440px] bg-white rounded-2xl border border-zinc-200 shadow-xl p-8 sm:p-10 space-y-6">
            
            {/* Header Brand */}
            <div className="text-center space-y-2">
              <span className="text-[11px] font-bold tracking-widest text-[#d4af37] uppercase">
                Secure Administrator Portal
              </span>
              <h1 className="font-serif text-3xl font-bold text-[#002d62]">
                Admin Login
              </h1>
              <div className="flex items-center justify-center">
                <div className="h-[1px] bg-[#d4af37]/40 w-12" />
                <span className="mx-2 text-[#d4af37]/60 text-[10px]">◆</span>
                <div className="h-[1px] bg-[#d4af37]/40 w-12" />
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold flex items-center gap-2">
                <span>⚠️</span> {loginError}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[13px] font-bold text-zinc-700 block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@rabbimenachem.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full rounded border border-zinc-300 bg-zinc-50/30 px-3 py-2.5 text-[15px] text-zinc-800 outline-none transition-all focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[13px] font-bold text-zinc-700 block">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full rounded border border-zinc-300 bg-zinc-50/30 px-3 py-2.5 text-[15px] text-zinc-800 outline-none transition-all focus:border-[#002d62] focus:ring-1 focus:ring-[#002d62]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingLogin}
                  className="w-full rounded-full bg-[#002d62] py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md transition-all duration-300 hover:bg-[#001f42] active:scale-[0.98] disabled:bg-zinc-400"
                >
                  {submittingLogin ? "Verifying Credentials..." : "Authenticate Session"}
                </button>
              </div>
            </form>

            <div className="text-center pt-2">
              <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
                ← Return to Public Website
              </Link>
            </div>
            
          </div>
        </main>
      ) : (
        /* RENDER ADMIN DASHBOARD */
        <main className="flex-1 w-full py-12 px-6 sm:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
          
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
            <div>
              <span className="text-xs font-bold tracking-widest text-[#d4af37] uppercase">
                Active Session
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#002d62]">
                Admin Dashboard
              </h1>
              <p className="text-xs text-zinc-500 mt-1 font-light">
                Logged in as: <strong className="font-semibold text-zinc-700">admin@rabbimenachem.com</strong>
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-6 py-2 rounded-full border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-600 transition-all active:scale-95 self-start sm:self-auto"
            >
              Sign Out Session
            </button>
          </div>

          {/* Statistics Grid */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Card 1 */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-md p-6 flex flex-col justify-between h-32 relative overflow-hidden">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Total Donations
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-serif text-[#002d62]">
                  ${stats.totalDonations.toLocaleString()}
                </span>
                <div className="h-6" /> {/* Placeholder for alignment */}
                <span className="absolute right-4 bottom-2 text-6xl text-zinc-50 font-bold select-none pointer-events-none">
                  $
                </span>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-md p-6 flex flex-col justify-between h-32 relative overflow-hidden">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Active Memberships
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-serif text-[#002d62]">
                  {stats.activeMemberships}
                </span>
                <div className="h-6" />
                <span className="absolute right-4 bottom-2 text-6xl text-zinc-50 font-bold select-none pointer-events-none">
                  ☺
                </span>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-md p-6 flex flex-col justify-between h-32 relative overflow-hidden">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Ebook Sales
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-serif text-[#002d62]">
                  {stats.ebookDownloads}
                </span>
                <div className="h-6" />
                <span className="absolute right-4 bottom-2 text-6xl text-zinc-50 font-bold select-none pointer-events-none">
                  📖
                </span>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-md p-6 flex flex-col justify-between h-32 relative overflow-hidden">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Inquiries Received
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-serif text-[#002d62]">
                  {stats.pendingInquiries}
                </span>
                {stats.pendingInquiries > 0 ? (
                  <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 self-start px-2 py-0.5 rounded">
                    ● Pending Reply
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 self-start px-2 py-0.5 rounded">
                    ✓ All Answered
                  </span>
                )}
                <span className="absolute right-4 bottom-2 text-6xl text-zinc-50 font-bold select-none pointer-events-none">
                  ✉
                </span>
              </div>
            </div>
          )}

          {/* Interactive Lists Panel */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden flex flex-col">
            
            {/* Control Bar: Tabs & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-200 bg-zinc-50/50 p-4 gap-4">
              
              {/* Tab Toggles */}
              <div className="flex border border-zinc-200 rounded-lg overflow-hidden bg-white shrink-0 self-start">
                <button
                  onClick={() => { setActiveTab("donations"); setSearchQuery(""); }}
                  className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    activeTab === "donations"
                      ? "bg-[#002d62] text-white"
                      : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                  }`}
                >
                  Donations
                </button>
                <button
                  onClick={() => { setActiveTab("registrants"); setSearchQuery(""); }}
                  className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-x border-zinc-200 ${
                    activeTab === "registrants"
                      ? "bg-[#002d62] text-white"
                      : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                  }`}
                >
                  Registrants
                </button>
                <button
                  onClick={() => { setActiveTab("inquiries"); setSearchQuery(""); }}
                  className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-r border-zinc-200 ${
                    activeTab === "inquiries"
                      ? "bg-[#002d62] text-white"
                      : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                  }`}
                >
                  Messages
                </button>
                <button
                  onClick={() => { setActiveTab("ebooks"); setSearchQuery(""); }}
                  className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    activeTab === "ebooks"
                      ? "bg-[#002d62] text-white"
                      : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                  }`}
                >
                  Ebooks
                </button>
              </div>

              {/* Search input */}
              <div className="relative w-full max-w-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-zinc-400 text-xs">🔍</span>
                </div>
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white pl-8 pr-3 py-2 text-xs text-zinc-800 outline-none focus:border-[#002d62]"
                />
              </div>

            </div>

            {/* TAB CONTENT: DONATIONS */}
            {activeTab === "donations" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-200">
                      <th className="px-6 py-4">Donor</th>
                      <th className="px-6 py-4">Frequency</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-sans">
                    {getFilteredDonations().length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-zinc-400 font-light italic">
                          No donations found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      getFilteredDonations().map((don) => (
                        <tr key={don.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-zinc-800">{don.name}</div>
                            <div className="text-[10px] text-zinc-400 mt-0.5">{don.email}</div>
                          </td>
                          <td className="px-6 py-4 capitalize font-light text-zinc-600">
                            {don.frequency}
                          </td>
                          <td className="px-6 py-4 font-bold text-[#002d62]">
                            ${don.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            {don.status === "settled" || don.status === "completed" ? (
                              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                                Completed
                              </span>
                            ) : don.status === "pending" ? (
                              <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100 animate-pulse">
                                Pending
                              </span>
                            ) : (
                              <span className="bg-zinc-100 text-zinc-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-zinc-200">
                                Expired
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right text-zinc-500 font-light">
                            {don.date}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB CONTENT: REGISTRANTS */}
            {activeTab === "registrants" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-200">
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Signup Source</th>
                      <th className="px-6 py-4 text-right">Date Added</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-sans">
                    {getFilteredRegistrants().length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-zinc-400 font-light italic">
                          No registrants found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      getFilteredRegistrants().map((reg) => (
                        <tr key={reg.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-zinc-800">
                            {reg.name}
                          </td>
                          <td className="px-6 py-4 text-zinc-600 font-light">
                            {reg.email}
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-zinc-100 text-zinc-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                              {reg.source}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-zinc-500 font-light">
                            {reg.date}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB CONTENT: INQUIRIES */}
            {activeTab === "inquiries" && (
              <div className="divide-y divide-zinc-200">
                {getFilteredInquiries().length === 0 ? (
                  <div className="p-12 text-center text-zinc-400 font-light italic text-xs">
                    No contact messages found matching criteria.
                  </div>
                ) : (
                  getFilteredInquiries().map((inq) => (
                    <div key={inq.id} className="p-6 hover:bg-zinc-50/30 transition-colors flex flex-col md:flex-row justify-between gap-4 items-start">
                      <div className="space-y-2 max-w-3xl">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-zinc-800 text-sm">{inq.name}</span>
                          <span className="text-zinc-400 text-xs font-light">({inq.email})</span>
                          <span className="text-[10px] text-zinc-400 font-light ml-2">● {inq.date}</span>
                        </div>
                        <p className="text-zinc-600 font-light text-xs sm:text-[13px] leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-100 italic">
                          "{inq.message}"
                        </p>
                      </div>
                      
                      {/* Action simulation */}
                      <button
                        onClick={() => alert(`Reply email simulation to ${inq.email}`)}
                        className="px-4 py-2 border border-zinc-300 hover:border-zinc-400 bg-white text-zinc-700 font-bold uppercase tracking-wider text-[10px] rounded-lg transition-colors shrink-0"
                      >
                        Send Reply
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: EBOOKS */}
            {activeTab === "ebooks" && (
              <div className="p-6 space-y-6">
                {/* Header Action Button inside tab */}
                <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#002d62]">
                      Manage Ebooks
                    </h3>
                    <p className="text-xs text-zinc-400 font-light mt-0.5">
                      Upload and update digital books stored securely via UploadThing.
                    </p>
                  </div>
                  <button
                    onClick={() => { setUploadError(""); setIsUploadModalOpen(true); }}
                    className="flex items-center gap-2 rounded-full bg-[#a80f14] hover:bg-[#8e0b0f] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow transition-all duration-300 active:scale-95"
                  >
                    <span>+ Upload Ebook</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-zinc-100 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse bg-white">
                    <thead>
                      <tr className="bg-zinc-50 text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-200">
                        <th className="px-6 py-4">Cover</th>
                        <th className="px-6 py-4">Title</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Secure Link</th>
                        <th className="px-6 py-4">Actions</th>
                        <th className="px-6 py-4 text-right">Upload Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-sans">
                      {getFilteredEbooks().length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-zinc-400 font-light italic">
                            No ebooks found. Click "+ Upload Ebook" to add your first ebook.
                          </td>
                        </tr>
                      ) : (
                        getFilteredEbooks().map((eb) => (
                          <tr key={eb._id} className="hover:bg-zinc-50/50 transition-colors">
                            <td className="px-6 py-4">
                              {eb.imageUrl ? (
                                <img
                                  src={eb.imageUrl}
                                  alt={eb.title}
                                  className="h-12 w-9 object-cover rounded shadow-md border border-zinc-200"
                                />
                              ) : (
                                <div className="h-12 w-9 bg-zinc-100 rounded flex items-center justify-center text-[8px] text-zinc-400 border border-zinc-200 border-dashed">
                                  No Cover
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 font-semibold text-[#002d62]">
                              {eb.title}
                            </td>
                            <td className="px-6 py-4 text-zinc-500 font-light max-w-xs truncate">
                              {eb.description}
                            </td>
                            <td className="px-6 py-4 font-bold text-zinc-700">
                              ${Number(eb.price).toFixed(2)}
                            </td>
                            <td className="px-6 py-4">
                              <a
                                href={eb.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline font-medium truncate max-w-[150px] inline-block"
                              >
                                View File ↗
                              </a>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openEditModal(eb)}
                                  className="px-2.5 py-1 border border-zinc-200 hover:bg-zinc-50 text-[10px] font-bold text-zinc-600 rounded transition-all"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleEbookDelete(eb._id, eb.title)}
                                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-[10px] font-bold text-red-600 rounded border border-red-100 transition-all"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right text-zinc-500 font-light">
                              {eb.createdAt ? new Date(eb.createdAt).toLocaleDateString() : "Just now"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

        </main>
      )}

      {/* UPLOAD EBOOK MODAL DIALOG */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 sm:p-8 space-y-6 relative animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 text-lg font-bold"
              disabled={uploading}
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-widest text-[#d4af37] uppercase">
                Resource Publisher
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#002d62]">
                Upload New Ebook
              </h3>
              <p className="text-xs text-zinc-400 font-light">
                Securely host document files via UploadThing and register in MongoDB.
              </p>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold">
                ⚠️ {uploadError}
              </div>
            )}

            <form onSubmit={handleEbookUploadSubmit} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-zinc-700 block">
                  Book Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Rabbi's Blueprint"
                  value={newEbookTitle}
                  onChange={(e) => setNewEbookTitle(e.target.value)}
                  className="w-full rounded border border-zinc-300 bg-zinc-50/30 px-3 py-2 text-[14px] text-zinc-800 outline-none focus:border-[#002d62]"
                  disabled={uploading}
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-zinc-700 block">
                  Brief Description
                </label>
                <textarea
                  required
                  placeholder="Summarize the core wisdom blueprint details..."
                  rows={3}
                  value={newEbookDescription}
                  onChange={(e) => setNewEbookDescription(e.target.value)}
                  className="w-full rounded border border-zinc-300 bg-zinc-50/30 px-3 py-2 text-[14px] text-zinc-800 outline-none resize-none focus:border-[#002d62]"
                  disabled={uploading}
                />
              </div>

              {/* Price */}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-zinc-700 block">
                  Price (USD)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-zinc-500 text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="19.99"
                    value={newEbookPrice}
                    onChange={(e) => setNewEbookPrice(e.target.value)}
                    className="w-full rounded border border-zinc-300 bg-zinc-50/30 pl-7 pr-3 py-2 text-[14px] text-zinc-800 outline-none focus:border-[#002d62]"
                    disabled={uploading}
                    min="0"
                  />
                </div>
              </div>

              {/* Cover Image Input */}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-zinc-700 block">
                  Cover Image (Optional - .png, .jpg, .jpeg)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewEbookImage(e.target.files?.[0] || null)}
                  className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer"
                  disabled={uploading}
                />
              </div>

              {/* File Input */}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-zinc-700 block">
                  Ebook File (.pdf, .epub, etc.)
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.epub,.docx,.txt"
                  onChange={(e) => setNewEbookFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer"
                  disabled={uploading}
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 py-2 text-xs font-bold uppercase border border-zinc-300 rounded-full hover:bg-zinc-50 text-zinc-600 transition-colors text-center"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-2 text-xs font-bold uppercase rounded-full bg-[#002d62] text-white hover:bg-[#001f42] disabled:bg-zinc-400 transition-all flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Publish Ebook</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EBOOK MODAL DIALOG */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 sm:p-8 space-y-6 relative animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 text-lg font-bold"
              disabled={editing}
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-widest text-[#d4af37] uppercase">
                Resource Editor
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#002d62]">
                Edit Ebook
              </h3>
              <p className="text-xs text-zinc-400 font-light">
                Update details or upload replacement files to the cloud.
              </p>
            </div>

            {editError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold">
                ⚠️ {editError}
              </div>
            )}

            <form onSubmit={handleEbookEditSubmit} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-zinc-700 block">
                  Book Title
                </label>
                <input
                  type="text"
                  required
                  value={editEbookTitle}
                  onChange={(e) => setEditEbookTitle(e.target.value)}
                  className="w-full rounded border border-zinc-300 bg-zinc-50/30 px-3 py-2 text-[14px] text-zinc-800 outline-none focus:border-[#002d62]"
                  disabled={editing}
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-zinc-700 block">
                  Brief Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={editEbookDescription}
                  onChange={(e) => setEditEbookDescription(e.target.value)}
                  className="w-full rounded border border-zinc-300 bg-zinc-50/30 px-3 py-2 text-[14px] text-zinc-800 outline-none resize-none focus:border-[#002d62]"
                  disabled={editing}
                />
              </div>

              {/* Price */}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-zinc-700 block">
                  Price (USD)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-zinc-500 text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="19.99"
                    value={editEbookPrice}
                    onChange={(e) => setEditEbookPrice(e.target.value)}
                    className="w-full rounded border border-zinc-300 bg-zinc-50/30 pl-7 pr-3 py-2 text-[14px] text-zinc-800 outline-none focus:border-[#002d62]"
                    disabled={editing}
                    min="0"
                  />
                </div>
              </div>

              {/* Cover Image Input */}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-zinc-700 block flex justify-between">
                  <span>Replace Cover Image (Optional)</span>
                  {editEbookImageUrl && (
                    <span className="text-emerald-600 text-[10px] font-semibold">Has existing cover</span>
                  )}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditEbookImage(e.target.files?.[0] || null)}
                  className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer"
                  disabled={editing}
                />
              </div>

              {/* File Input */}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-zinc-700 block flex justify-between">
                  <span>Replace Ebook File (Optional)</span>
                  <span className="text-emerald-600 text-[10px] font-semibold">Has existing file</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.epub,.docx,.txt"
                  onChange={(e) => setEditEbookFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 cursor-pointer"
                  disabled={editing}
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2 text-xs font-bold uppercase border border-zinc-300 rounded-full hover:bg-zinc-50 text-zinc-600 transition-colors text-center"
                  disabled={editing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="flex-1 py-2 text-xs font-bold uppercase rounded-full bg-[#002d62] text-white hover:bg-[#001f42] disabled:bg-zinc-400 transition-all flex items-center justify-center gap-2"
                >
                  {editing ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
