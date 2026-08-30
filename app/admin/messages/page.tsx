"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  Mail,
  Bot,
  UserPlus,
  RefreshCw,
  MailOpen,
  Filter,
  CheckCheck,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  Calendar,
  Sparkles,
  Inbox,
  ArrowUpDown,
  X,
} from "lucide-react";
import MarkdownMessage from "@/components/copilot/markdown-message";

// ─── Types ──────────────────────────────────────────────────────────────────
type Message = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  body: string;
  read: boolean;
  createdAt: string;
};

type Counts = {
  total: number;
  unread: number;
  leads: number;
  contact: number;
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
  } catch {
    return dateStr;
  }
}

function formatFullDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

function getInitials(name: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function isAiLead(msg: Message) {
  return (
    msg.subject?.includes("[AI Assistant Lead]") ||
    msg.subject?.includes("[Copilot Lead]") ||
    msg.body.includes("Source: Anthrix AI") ||
    msg.body.includes("Source: Anthrix A-OS")
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [counts, setCounts] = useState<Counts>({ total: 0, unread: 0, leads: 0, contact: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "read" | "leads" | "contact">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedInfo, setCopiedInfo] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Fetch messages from API
  const fetchMessages = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (activeFilter !== "all") params.set("filter", activeFilter);

      const res = await fetch(`/api/admin/messages?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();

      setMessages(data.messages || []);
      setCounts(data.counts || { total: 0, unread: 0, leads: 0, contact: 0 });

      // If currently selected message was deleted or none selected, pick the first one on desktop
      if (data.messages?.length > 0) {
        if (!selectedId || !data.messages.some((m: Message) => m.id === selectedId)) {
          setSelectedId(data.messages[0].id);
        }
      } else {
        setSelectedId(null);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, activeFilter, selectedId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const activeMessage = useMemo(() => {
    return messages.find((m) => m.id === selectedId) || null;
  }, [messages, selectedId]);

  // Mark message as read/unread
  const toggleReadStatus = async (id: string, currentStatus: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const nextStatus = !currentStatus;
      // Optimistic update
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, read: nextStatus } : m))
      );
      setCounts((prev) => ({
        ...prev,
        unread: nextStatus ? Math.max(0, prev.unread - 1) : prev.unread + 1,
      }));

      await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: nextStatus }),
      });
    } catch (err) {
      console.error("Failed to update status:", err);
      fetchMessages();
    }
  };

  // Select message & auto-mark as read if unread
  const handleSelectMessage = (msg: Message) => {
    setSelectedId(msg.id);
    if (!msg.read) {
      toggleReadStatus(msg.id, false);
    }
  };

  // Delete message
  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this message?")) return;

    setDeletingId(id);
    try {
      // Optimistic remove
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete message");

      // Select next available message
      const remaining = messages.filter((m) => m.id !== id);
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id);
      } else {
        setSelectedId(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
      fetchMessages();
    } finally {
      setDeletingId(null);
    }
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === messages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(messages.map((m) => m.id)));
    }
  };

  const handleToggleSelectId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Bulk actions
  const handleBulkMarkRead = async (read: boolean) => {
    if (selectedIds.size === 0) return;
    setBulkProcessing(true);
    try {
      const ids = Array.from(selectedIds);
      // Optimistic update
      setMessages((prev) =>
        prev.map((m) => (selectedIds.has(m.id) ? { ...m, read } : m))
      );

      await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, read }),
      });

      setSelectedIds(new Set());
      fetchMessages();
    } catch (err) {
      console.error("Bulk mark error:", err);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} selected message(s)?`)) return;

    setBulkProcessing(true);
    try {
      const ids = Array.from(selectedIds);
      setMessages((prev) => prev.filter((m) => !selectedIds.has(m.id)));
      setSelectedIds(new Set());

      await fetch("/api/admin/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      fetchMessages();
    } catch (err) {
      console.error("Bulk delete error:", err);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleCopyContact = (msg: Message) => {
    navigator.clipboard.writeText(`Name: ${msg.name}\nEmail: ${msg.email}`);
    setCopiedInfo(true);
    setTimeout(() => setCopiedInfo(false), 2000);
  };

  // Extract structured details from body if available
  const parsedDetails = useMemo(() => {
    if (!activeMessage) return null;
    const body = activeMessage.body;

    const nameMatch = body.match(/(?:Client Name|Contact Name|Name):\s*([^\n\r]+)/i);
    const emailMatch = body.match(/(?:Email):\s*([^\n\r]+)/i);
    const phoneMatch = body.match(/(?:Phone):\s*([^\n\r]+)/i);
    const serviceMatch = body.match(/(?:Service Required|Service):\s*([^\n\r]+)/i);
    const budgetMatch = body.match(/(?:Budget|Budget Range):\s*([^\n\r]+)/i);

    return {
      name: nameMatch ? nameMatch[1].trim() : activeMessage.name,
      email: emailMatch ? emailMatch[1].trim() : activeMessage.email,
      phone: phoneMatch && !phoneMatch[1].includes("Not provided") ? phoneMatch[1].trim() : null,
      service: serviceMatch ? serviceMatch[1].trim() : null,
      budget: budgetMatch && !budgetMatch[1].includes("Not specified") ? budgetMatch[1].trim() : null,
    };
  }, [activeMessage]);

  return (
    <div className="w-full space-y-6">
      {/* ── Top Header & KPI Summary ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">
              Messages & Inquiries
            </h1>
            {counts.unread > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F55036] text-white shadow-[0_0_12px_rgba(245,80,54,0.5)]">
                {counts.unread} New
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Review contact form submissions, inquiries, and AI Copilot captured leads.
          </p>
        </div>

        <button
          onClick={() => fetchMessages(true)}
          disabled={refreshing}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border hover:border-primary/40 text-foreground text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin text-primary" : ""} />
          <span>{refreshing ? "Refreshing..." : "Refresh Inbox"}</span>
        </button>
      </div>

      {/* ── KPI Metric Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          onClick={() => setActiveFilter("all")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeFilter === "all"
              ? "bg-primary/10 border-primary/40 shadow-sm"
              : "bg-card border-border hover:border-border/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Inquiries</span>
            <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/8 flex items-center justify-center text-muted-foreground">
              <Inbox size={14} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{counts.total}</p>
        </div>

        <div
          onClick={() => setActiveFilter("unread")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeFilter === "unread"
              ? "bg-[#F55036]/15 border-[#F55036]/50 shadow-sm"
              : "bg-card border-border hover:border-[#F55036]/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#F55036] uppercase tracking-wider">Unread</span>
            <div className="w-7 h-7 rounded-lg bg-[#F55036]/10 border border-[#F55036]/30 flex items-center justify-center text-[#F55036]">
              <Mail size={14} />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#F55036] mt-2">{counts.unread}</p>
        </div>

        <div
          onClick={() => setActiveFilter("leads")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeFilter === "leads"
              ? "bg-primary/10 border-primary/40 shadow-sm"
              : "bg-card border-border hover:border-border/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Copilot Leads</span>
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Bot size={14} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{counts.leads}</p>
        </div>

        <div
          onClick={() => setActiveFilter("contact")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeFilter === "contact"
              ? "bg-primary/10 border-primary/40 shadow-sm"
              : "bg-card border-border hover:border-border/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Form</span>
            <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/8 flex items-center justify-center text-muted-foreground">
              <MessageSquare size={14} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{counts.contact}</p>
        </div>
      </div>

      {/* ── Toolbar & Filter Tabs ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "all" as const, label: "All Messages", count: counts.total },
            { id: "unread" as const, label: "Unread", count: counts.unread },
            { id: "leads" as const, label: "AI Leads", count: counts.leads },
            { id: "contact" as const, label: "Contact Form", count: counts.contact },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? "bg-primary text-white shadow-sm shadow-primary/20 font-semibold"
                  : "bg-background/60 text-muted-foreground hover:text-foreground hover:bg-background border border-border/50"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === tab.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px] md:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, keyword..."
            className="w-full bg-background border border-border rounded-xl pl-9 pr-8 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Bulk Actions Bar (Conditional) ────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/30 text-xs font-medium animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>{selectedIds.size} message(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkMarkRead(true)}
              disabled={bulkProcessing}
              className="px-3 py-1.5 rounded-lg bg-card border border-border hover:border-primary/40 text-foreground font-semibold flex items-center gap-1.5 transition-all"
            >
              <CheckCheck size={13} className="text-emerald-500" />
              <span>Mark Read</span>
            </button>
            <button
              onClick={() => handleBulkMarkRead(false)}
              disabled={bulkProcessing}
              className="px-3 py-1.5 rounded-lg bg-card border border-border hover:border-primary/40 text-foreground font-semibold flex items-center gap-1.5 transition-all"
            >
              <Mail size={13} className="text-primary" />
              <span>Mark Unread</span>
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkProcessing}
              className="px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 text-destructive font-semibold flex items-center gap-1.5 transition-all"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Master-Detail Inbox Container ─────────────────────────────────── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* ── Left Pane: Messages Thread List (5 cols) ──────────────────────── */}
        <div className="lg:col-span-5 border-r border-border flex flex-col h-[650px]">
          {/* List Header / Bulk Select */}
          <div className="p-3.5 border-b border-border/80 bg-background/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={messages.length > 0 && selectedIds.size === messages.length}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-[#F55036] cursor-pointer"
                title="Select all"
              />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {messages.length} {messages.length === 1 ? "Message" : "Messages"}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              Sorted by Newest
            </span>
          </div>

          {/* List Items Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/40 scrollbar-thin scrollbar-thumb-border">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                <Loader2 size={24} className="animate-spin text-primary mb-3" />
                <p className="text-xs">Loading inquiries...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted/40 border border-border flex items-center justify-center text-muted-foreground mb-3">
                  <Inbox size={22} />
                </div>
                <h4 className="text-sm font-semibold text-foreground">No messages found</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  {searchQuery
                    ? "Try adjusting your search query or switching filters."
                    : "When prospective clients submit inquiries or chat with AI, they'll appear here."}
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isSelected = msg.id === selectedId;
                const isLead = isAiLead(msg);
                const isChecked = selectedIds.has(msg.id);

                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`group relative p-4 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary/10 border-l-4 border-l-primary"
                        : msg.read
                        ? "hover:bg-muted/30 opacity-80 hover:opacity-100"
                        : "bg-background/40 hover:bg-muted/50 font-medium"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div className="pt-0.5" onClick={(e) => handleToggleSelectId(msg.id, e)}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 rounded border-border text-primary accent-[#F55036] cursor-pointer"
                        />
                      </div>

                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary font-mono">
                          {getInitials(msg.name)}
                        </div>
                        {!msg.read && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#F55036] ring-2 ring-card shadow-[0_0_8px_#F55036]" />
                        )}
                      </div>

                      {/* Content Preview */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className={`text-xs truncate ${!msg.read ? "font-bold text-foreground" : "text-foreground/90 font-medium"}`}>
                            {msg.name || "Anonymous Visitor"}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>

                        {/* Subject & Pill */}
                        <div className="flex items-center gap-1.5 mb-1">
                          {isLead ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#F55036]/10 border border-[#F55036]/30 text-[#F55036]">
                              <Bot size={10} />
                              AI Lead
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-muted border border-border text-muted-foreground">
                              <MessageSquare size={10} />
                              Contact Form
                            </span>
                          )}
                          <span className="text-xs text-foreground/80 truncate font-medium">
                            {msg.subject || "No Subject"}
                          </span>
                        </div>

                        {/* Body snippet */}
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {msg.body.replace(/[#*`_]/g, "").slice(0, 140)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right Pane: Message Detail Viewer (7 cols) ────────────────────── */}
        <div className="lg:col-span-7 flex flex-col h-[650px] bg-background/30">
          {activeMessage ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Detail Header / Action Toolbar */}
              <div className="p-5 border-b border-border bg-card/80 flex-shrink-0 flex flex-wrap items-center justify-between gap-3">
                {/* Sender Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary font-mono flex-shrink-0">
                    {getInitials(activeMessage.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground truncate">
                        {activeMessage.name}
                      </h3>
                      {isAiLead(activeMessage) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F55036]/10 border border-[#F55036]/30 text-[#F55036]">
                          <Bot size={11} />
                          AI Copilot Lead
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted border border-border text-muted-foreground">
                          <MessageSquare size={11} />
                          Website Contact Form
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span className="font-mono">{activeMessage.email}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock size={11} />
                        {formatFullDate(activeMessage.createdAt)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => toggleReadStatus(activeMessage.id, activeMessage.read)}
                    className="p-2 rounded-lg bg-background border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-all"
                    title={activeMessage.read ? "Mark as unread" : "Mark as read"}
                  >
                    {activeMessage.read ? <Mail size={14} className="text-primary" /> : <MailOpen size={14} />}
                  </button>

                  <button
                    onClick={() => handleCopyContact(activeMessage)}
                    className="p-2 rounded-lg bg-background border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-all"
                    title="Copy contact info"
                  >
                    {copiedInfo ? <Check size={14} className="text-[#F55036]" /> : <Copy size={14} />}
                  </button>

                  <button
                    onClick={() => handleDelete(activeMessage.id)}
                    disabled={deletingId === activeMessage.id}
                    className="p-2 rounded-lg bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 text-destructive transition-all disabled:opacity-50"
                    title="Delete message"
                  >
                    {deletingId === activeMessage.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Details Box (If structured data detected) */}
              {parsedDetails && (parsedDetails.phone || parsedDetails.budget || parsedDetails.service) && (
                <div className="px-6 py-3.5 bg-background/50 border-b border-border flex flex-wrap gap-4 text-xs">
                  {parsedDetails.phone && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Phone:</span>
                      <a href={`tel:${parsedDetails.phone}`} className="font-semibold text-primary hover:underline font-mono">
                        {parsedDetails.phone}
                      </a>
                    </div>
                  )}
                  {parsedDetails.service && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Service:</span>
                      <span className="font-semibold text-foreground">{parsedDetails.service}</span>
                    </div>
                  )}
                  {parsedDetails.budget && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="font-semibold text-emerald-400">{parsedDetails.budget}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Message Body Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-border">
                {/* Subject Banner */}
                {activeMessage.subject && (
                  <div className="p-3 rounded-xl bg-card border border-border/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      <span className="text-muted-foreground font-normal">Subject:</span>
                      <span>{activeMessage.subject}</span>
                    </div>
                  </div>
                )}

                {/* Message Body */}
                <div className="bg-card rounded-2xl border border-border p-5 text-sm text-foreground/90 leading-relaxed shadow-sm">
                  {isAiLead(activeMessage) ? (
                    <MarkdownMessage content={activeMessage.body} />
                  ) : (
                    <div className="whitespace-pre-wrap font-sans space-y-2">
                      {activeMessage.body}
                    </div>
                  )}
                </div>
              </div>

              {/* Detail Footer CTA Bar */}
              <div className="p-4 border-t border-border bg-card/80 flex-shrink-0 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/clients/new?name=${encodeURIComponent(activeMessage.name)}&email=${encodeURIComponent(activeMessage.email)}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-background border border-border hover:border-primary/50 text-foreground text-xs font-semibold transition-all shadow-sm group"
                  >
                    <UserPlus size={13} className="text-primary group-hover:scale-110 transition-transform" />
                    <span>Convert to Client</span>
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${activeMessage.email}?subject=${encodeURIComponent(`Re: ${activeMessage.subject || "Your inquiry with Anthrix"}`)}`}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#F55036] hover:bg-[#E04025] text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:scale-[1.02]"
                  >
                    <Mail size={13} />
                    <span>Reply via Email</span>
                    <ExternalLink size={11} className="opacity-70" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <div className="w-14 h-14 rounded-2xl bg-muted/30 border border-border flex items-center justify-center text-muted-foreground mb-3">
                <MailOpen size={26} />
              </div>
              <h3 className="text-base font-bold text-foreground">No message selected</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Select an inquiry from the left thread list to view full communication details, transcripts, and contact actions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
