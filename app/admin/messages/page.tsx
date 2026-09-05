"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
  MoreVertical,
  Phone,
  DollarSign,
  Briefcase,
  Share2,
} from "lucide-react";
import MarkdownMessage from "@/components/copilot/markdown-message";
import { useModal } from "@/components/admin/ui/modals";

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

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
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

// ─── Reusable Dropdown ────────────────────────────────────────────────────────
function Dropdown({
  trigger,
  children,
  align = "right",
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={`absolute z-50 mt-1.5 min-w-[200px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ${
            align === "right" ? "right-0" : "left-0"
          }`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  onClick,
  icon,
  label,
  variant = "default",
}: {
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  variant?: "default" | "danger" | "muted" | "primary";
}) {
  const colors =
    variant === "danger"
      ? "text-rose-400 hover:bg-rose-500/10"
      : variant === "primary"
      ? "text-[#F55036] hover:bg-[#F55036]/10 font-semibold"
      : variant === "muted"
      ? "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      : "text-foreground hover:bg-muted/60";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors text-left ${colors}`}
    >
      {icon && <span className="opacity-75 flex-shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
    </button>
  );
}

function DropdownSeparator() {
  return <div className="border-t border-border/60 my-1" />;
}

// ─── Main Messages Page ───────────────────────────────────────────────────────
export default function MessagesPage() {
  const { confirm, alert } = useModal();
  const [messages, setMessages] = useState<Message[]>([]);
  const [counts, setCounts] = useState<Counts>({ total: 0, unread: 0, leads: 0, contact: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "read" | "leads" | "contact">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedInfo, setCopiedInfo] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Fetch messages
  const fetchMessages = useCallback(
    async (showRefreshing = false) => {
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
    },
    [searchQuery, activeFilter, selectedId]
  );

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

  // Select message & auto-mark as read
  const handleSelectMessage = (msg: Message) => {
    setSelectedId(msg.id);
    if (!msg.read) {
      toggleReadStatus(msg.id, false);
    }
  };

  // Delete single message
  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const confirmed = await confirm({
      title: "Delete Message",
      message: "Are you sure you want to delete this message? This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;

    setDeletingId(id);
    try {
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

      const remaining = messages.filter((m) => m.id !== id);
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id);
      } else {
        setSelectedId(null);
      }
      await alert({
        title: "Message Deleted",
        message: "Message has been deleted.",
        variant: "success",
      });
    } catch (err: any) {
      console.error("Delete error:", err);
      fetchMessages();
      await alert({
        title: "Delete Failed",
        message: err.message || "Failed to delete message",
        variant: "danger",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Bulk actions
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

  const handleBulkMarkRead = async (read: boolean) => {
    if (selectedIds.size === 0) return;
    setBulkProcessing(true);
    try {
      const ids = Array.from(selectedIds);
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
    const confirmed = await confirm({
      title: "Bulk Delete Messages",
      message: `Are you sure you want to delete ${selectedIds.size} selected message(s)? This cannot be undone.`,
      confirmText: `Delete ${selectedIds.size} Messages`,
      variant: "danger",
    });
    if (!confirmed) return;

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

  const handleCopyBody = (msg: Message) => {
    navigator.clipboard.writeText(msg.body);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  // Structured details extraction
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
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#F55036] mb-1">
            Communication &amp; Inquiries
          </p>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Messages &amp; Leads</h1>
            {counts.unread > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F55036] text-white shadow-[0_0_12px_rgba(245,80,54,0.5)]">
                {counts.unread} New
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Incoming website inquiries, contact requests, and prospective client AI leads
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchMessages(true)}
          disabled={refreshing}
          className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border hover:border-[#F55036]/40 text-foreground text-xs font-semibold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin text-[#F55036]" : "text-muted-foreground"} />
          <span>{refreshing ? "Refreshing..." : "Refresh Inbox"}</span>
        </button>
      </div>

      {/* ── KPI Summary Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveFilter("all")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === "all"
              ? "bg-[#F55036]/8 border-[#F55036] shadow-sm"
              : "bg-card border-border hover:border-[#F55036]/30"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Total Inquiries</span>
            <Inbox size={15} className="text-foreground opacity-50" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">{counts.total}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">All received communications</p>
        </div>

        <div
          onClick={() => setActiveFilter("unread")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === "unread"
              ? "bg-[#F55036]/15 border-[#F55036] shadow-sm"
              : "bg-card border-border hover:border-[#F55036]/30"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-[#F55036]">Unread</span>
            <Mail size={15} className="text-[#F55036]" />
          </div>
          <p className="text-2xl font-extrabold text-[#F55036]">{counts.unread}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">Awaiting response</p>
        </div>

        <div
          onClick={() => setActiveFilter("leads")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === "leads"
              ? "bg-[#F55036]/8 border-[#F55036] shadow-sm"
              : "bg-card border-border hover:border-[#F55036]/30"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">AI Copilot Leads</span>
            <Bot size={15} className="text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-purple-400">{counts.leads}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">Captured via Chatbot</p>
        </div>

        <div
          onClick={() => setActiveFilter("contact")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeFilter === "contact"
              ? "bg-[#F55036]/8 border-[#F55036] shadow-sm"
              : "bg-card border-border hover:border-[#F55036]/30"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Contact Form</span>
            <MessageSquare size={15} className="text-sky-400" />
          </div>
          <p className="text-2xl font-extrabold text-sky-400">{counts.contact}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">Direct form submissions</p>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-3.5 rounded-2xl border border-border shadow-sm">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: "all" as const, label: "All", count: counts.total },
            { id: "unread" as const, label: "Unread", count: counts.unread },
            { id: "leads" as const, label: "AI Leads", count: counts.leads },
            { id: "contact" as const, label: "Contact Form", count: counts.contact },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? "bg-[#F55036] text-white shadow-sm"
                  : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-border/60"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeFilter === tab.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px] md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, email, keyword..."
            className="w-full bg-background border border-border rounded-xl pl-9 pr-8 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-[#F55036] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Bulk Actions Bar ── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F55036]/10 border border-[#F55036]/30 text-xs font-medium animate-in fade-in slide-in-from-top-2 shadow-sm">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <span className="w-2 h-2 rounded-full bg-[#F55036] animate-pulse" />
            <span>{selectedIds.size} message(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkMarkRead(true)}
              disabled={bulkProcessing}
              className="px-3 py-1.5 rounded-xl bg-card border border-border hover:border-[#F55036]/40 text-foreground font-semibold flex items-center gap-1.5 transition-all text-xs cursor-pointer"
            >
              <CheckCheck size={13} className="text-emerald-400" />
              <span>Mark Read</span>
            </button>
            <button
              onClick={() => handleBulkMarkRead(false)}
              disabled={bulkProcessing}
              className="px-3 py-1.5 rounded-xl bg-card border border-border hover:border-[#F55036]/40 text-foreground font-semibold flex items-center gap-1.5 transition-all text-xs cursor-pointer"
            >
              <Mail size={13} className="text-[#F55036]" />
              <span>Mark Unread</span>
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkProcessing}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-rose-400 font-semibold flex items-center gap-1.5 transition-all text-xs cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Master-Detail Inbox Container ── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px] shadow-sm">
        {/* ── Left Pane: Messages Thread List (5 cols) ── */}
        <div className="lg:col-span-5 border-r border-border flex flex-col h-[680px]">
          {/* List Header */}
          <div className="p-3.5 border-b border-border bg-muted/20 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={messages.length > 0 && selectedIds.size === messages.length}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-border text-[#F55036] accent-[#F55036] cursor-pointer"
                title="Select all"
              />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {messages.length} {messages.length === 1 ? "Inquiry" : "Inquiries"}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">Sorted by Newest</span>
          </div>

          {/* List Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/40 scrollbar-thin">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                <Loader2 size={24} className="animate-spin text-[#F55036] mb-3" />
                <p className="text-xs">Loading inquiries...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border flex items-center justify-center text-muted-foreground mb-3">
                  <Inbox size={22} />
                </div>
                <h4 className="text-sm font-bold text-foreground">No messages found</h4>
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
                        ? "bg-[#F55036]/10 border-l-4 border-l-[#F55036]"
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
                          className="w-3.5 h-3.5 rounded border-border accent-[#F55036] cursor-pointer"
                        />
                      </div>

                      {/* Avatar with unread ring */}
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F55036]/20 to-[#F55036]/5 border border-[#F55036]/30 flex items-center justify-center text-xs font-bold text-[#F55036] font-mono">
                          {getInitials(msg.name)}
                        </div>
                        {!msg.read && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#F55036] ring-2 ring-card shadow-[0_0_8px_#F55036]" />
                        )}
                      </div>

                      {/* Preview info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span
                            className={`text-xs truncate ${
                              !msg.read ? "font-bold text-foreground" : "text-foreground/90 font-medium"
                            }`}
                          >
                            {msg.name || "Anonymous Visitor"}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>

                        {/* Subject & Pill */}
                        <div className="flex items-center gap-1.5 mb-1">
                          {isLead ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-purple-500/10 border border-purple-500/25 text-purple-400 flex-shrink-0">
                              <Bot size={10} />
                              AI Lead
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-sky-500/10 border border-sky-500/25 text-sky-400 flex-shrink-0">
                              <MessageSquare size={10} />
                              Contact
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

        {/* ── Right Pane: Message Detail Viewer (7 cols) ── */}
        <div className="lg:col-span-7 flex flex-col h-[680px] bg-background/30">
          {activeMessage ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Detail Header & Proper Dropdown */}
              <div className="p-5 border-b border-border bg-card flex-shrink-0 flex flex-wrap items-center justify-between gap-3">
                {/* Sender Identity */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#F55036]/10 border border-[#F55036]/25 flex items-center justify-center text-sm font-bold text-[#F55036] font-mono flex-shrink-0">
                    {getInitials(activeMessage.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-foreground truncate">
                        {activeMessage.name}
                      </h3>
                      {isAiLead(activeMessage) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 border border-purple-500/25 text-purple-400">
                          <Bot size={11} />
                          AI Copilot Lead
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 border border-sky-500/25 text-sky-400">
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

                {/* Header Action Buttons with Dropdown */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleReadStatus(activeMessage.id, activeMessage.read)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted/40 text-xs font-semibold text-foreground transition-all cursor-pointer"
                  >
                    {activeMessage.read ? (
                      <>
                        <Mail size={13} className="text-[#F55036]" />
                        <span>Mark Unread</span>
                      </>
                    ) : (
                      <>
                        <MailOpen size={13} className="text-emerald-400" />
                        <span>Mark Read</span>
                      </>
                    )}
                  </button>

                  {/* Dropdown Menu (⋮) */}
                  <Dropdown
                    align="right"
                    trigger={
                      <button
                        type="button"
                        className="p-2 rounded-xl border border-border bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                        title="More actions"
                      >
                        <MoreVertical size={14} />
                      </button>
                    }
                  >
                    <div className="py-1 min-w-[200px]">
                      <div className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 border-b border-border/40">
                        Inquiry Actions
                      </div>

                      <DropdownItem
                        onClick={() => handleCopyContact(activeMessage)}
                        icon={copiedInfo ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        label={copiedInfo ? "Copied Contact!" : "Copy Contact Details"}
                      />

                      <DropdownItem
                        onClick={() => handleCopyBody(activeMessage)}
                        icon={copiedBody ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
                        label={copiedBody ? "Copied Content!" : "Copy Message Text"}
                      />

                      <DropdownItem
                        onClick={() =>
                          window.open(
                            `mailto:${activeMessage.email}?subject=${encodeURIComponent(
                              `Re: ${activeMessage.subject || "Your inquiry with Anthrix"}`
                            )}`,
                            "_blank"
                          )
                        }
                        icon={<ExternalLink size={13} />}
                        label="Open in Email App"
                      />

                      <DropdownSeparator />

                      <DropdownItem
                        onClick={() => handleDelete(activeMessage.id)}
                        icon={<Trash2 size={13} />}
                        label="Delete Message"
                        variant="danger"
                      />
                    </div>
                  </Dropdown>
                </div>
              </div>

              {/* Quick Details Bar */}
              {parsedDetails && (parsedDetails.phone || parsedDetails.budget || parsedDetails.service) && (
                <div className="px-6 py-3 bg-muted/20 border-b border-border flex flex-wrap items-center gap-3 text-xs">
                  {parsedDetails.phone && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border font-mono">
                      <Phone size={11} className="text-[#F55036]" />
                      <span className="text-muted-foreground">Phone:</span>
                      <a href={`tel:${parsedDetails.phone}`} className="font-semibold text-foreground hover:underline">
                        {parsedDetails.phone}
                      </a>
                    </div>
                  )}
                  {parsedDetails.service && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border">
                      <Briefcase size={11} className="text-[#F55036]" />
                      <span className="text-muted-foreground">Service:</span>
                      <span className="font-semibold text-foreground">{parsedDetails.service}</span>
                    </div>
                  )}
                  {parsedDetails.budget && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border font-mono">
                      <DollarSign size={11} className="text-emerald-400" />
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="font-bold text-emerald-400">{parsedDetails.budget}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Message Body Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                {/* Subject Banner */}
                {activeMessage.subject && (
                  <div className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      <span className="text-muted-foreground font-normal">Subject:</span>
                      <span>{activeMessage.subject}</span>
                    </div>
                  </div>
                )}

                {/* Message Body */}
                <div className="bg-card rounded-2xl border border-border p-6 text-sm text-foreground/90 leading-relaxed shadow-sm">
                  {isAiLead(activeMessage) ? (
                    <MarkdownMessage content={activeMessage.body} />
                  ) : (
                    <div className="whitespace-pre-wrap font-sans space-y-2 text-xs sm:text-sm">
                      {activeMessage.body}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions CTA Bar */}
              <div className="p-4 border-t border-border bg-card flex-shrink-0 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/admin/clients/new?name=${encodeURIComponent(activeMessage.name)}&email=${encodeURIComponent(
                    activeMessage.email
                  )}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-background border border-border hover:border-[#F55036]/50 text-foreground text-xs font-semibold transition-all shadow-sm group"
                >
                  <UserPlus size={13} className="text-[#F55036] group-hover:scale-110 transition-transform" />
                  <span>Convert to Client</span>
                </Link>

                <a
                  href={`mailto:${activeMessage.email}?subject=${encodeURIComponent(
                    `Re: ${activeMessage.subject || "Your inquiry with Anthrix"}`
                  )}`}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#F55036] hover:bg-[#F55036]/90 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,80,54,0.3)]"
                >
                  <Mail size={13} />
                  <span>Reply via Email</span>
                  <ExternalLink size={11} className="opacity-70" />
                </a>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <div className="w-14 h-14 rounded-2xl bg-muted/30 border border-border flex items-center justify-center text-muted-foreground mb-3">
                <MailOpen size={26} />
              </div>
              <h3 className="text-base font-bold text-foreground">No inquiry selected</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Select a message from the list to review inquiry details, lead summaries, and reply.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
