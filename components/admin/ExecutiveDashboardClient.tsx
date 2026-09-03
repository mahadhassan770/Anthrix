"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  Users,
  FolderKanban,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Activity,
  BookOpen,
  Layers,
  BarChart3,
  Briefcase,
} from "lucide-react";
import {
  RevenueTrendChart,
  FinancialDonutChart,
  InquiriesVelocityChart,
  RevenuePoint,
  DayInquiry,
} from "@/components/admin/AnalyticsCharts";

export interface DashboardDataProps {
  projectsCount: number;
  postsCount: number;
  servicesCount: number;
  teamCount: number;
  messagesCount: number;
  unreadMessages: number;
  clientsCount: number;
  paidRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
  monthlyRevenue: RevenuePoint[];
  weeklyInquiries: DayInquiry[];
  inquiriesThisWeek: number;
  recentMessages: {
    id: string;
    name: string;
    subject: string | null;
    body: string;
    read: boolean;
    createdAt: Date;
  }[];
  recentProjects: {
    id: string;
    title: string;
    published: boolean;
    createdAt: Date;
    tags: string[];
  }[];
  userName: string;
  isSuperAdmin: boolean;
}



export default function ExecutiveDashboardClient({ data }: { data: DashboardDataProps }) {
  const [activeTab, setActiveTab] = useState<"revenue" | "inquiries">("revenue");
  const [currency, setCurrency] = useState<"USD" | "PKR">("USD");

  const isPKR = currency === "PKR";
  const rate = 280.0;
  const symbol = isPKR ? "Rs " : "$";
  const displayRevenue = isPKR ? data.paidRevenue * rate : data.paidRevenue;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="w-full space-y-6">
      {/* ══════════════════════════════════════════
          1. EXECUTIVE HEADER
      ══════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              {greeting},
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                data.isSuperAdmin
                  ? "bg-[#F55036]/12 border border-[#F55036]/30 text-[#F55036]"
                  : "bg-sky-500/12 border border-sky-500/30 text-sky-400"
              }`}
            >
              {data.isSuperAdmin ? "Super Admin" : "Admin"}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">
            {data.userName}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="font-mono">{data.teamCount}</span> team members ·{" "}
            <span className="font-mono">{data.servicesCount}</span> services ·{" "}
            <span className="font-mono">{data.postsCount}</span> articles
          </p>
        </div>

        {/* Header Actions & Currency Switch */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Currency Switcher */}
          <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-xl text-xs">
            <button
              onClick={() => setCurrency("USD")}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer ${
                currency === "USD"
                  ? "bg-[#F55036] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency("PKR")}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer ${
                currency === "PKR"
                  ? "bg-[#F55036] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              PKR (Rs)
            </button>
          </div>

          <Link
            href="/admin/projects"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-foreground bg-card hover:bg-muted/50 border border-border transition-all"
          >
            <Plus size={14} className="text-[#F55036]" />
            <span>New Project</span>
          </Link>

          <Link
            href="/admin/revenue"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#F55036] hover:bg-[#F55036]/90 transition-all shadow-[0_0_16px_rgba(245,80,54,0.3)]"
          >
            <DollarSign size={14} />
            <span>Log Revenue</span>
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          2. CORE KPI RIBBON
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Verified Revenue */}
        <Link
          href="/admin/revenue"
          className="group bg-card hover:bg-muted/30 border border-border hover:border-emerald-500/40 rounded-2xl p-5 transition-all flex flex-col justify-between shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">Verified Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign size={15} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground tracking-tight mb-1">
              {symbol}
              {displayRevenue.toLocaleString(undefined, {
                minimumFractionDigits: isPKR ? 0 : 2,
                maximumFractionDigits: isPKR ? 0 : 2,
              })}
            </p>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <TrendingUp size={12} /> Settled collections
            </p>
          </div>
        </Link>

        {/* Card 2: Active Clients */}
        <Link
          href="/admin/clients"
          className="group bg-card hover:bg-muted/30 border border-border hover:border-sky-500/40 rounded-2xl p-5 transition-all flex flex-col justify-between shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">Active Clients</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Users size={15} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground tracking-tight mb-1">
              {data.clientsCount}
            </p>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </div>
        </Link>

        {/* Card 3: Portfolio Projects */}
        <Link
          href="/admin/projects"
          className="group bg-card hover:bg-muted/30 border border-border hover:border-violet-500/40 rounded-2xl p-5 transition-all flex flex-col justify-between shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">Portfolio Projects</span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <FolderKanban size={15} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground tracking-tight mb-1">
              {data.projectsCount}
            </p>
            <p className="text-xs text-muted-foreground">Published case studies</p>
          </div>
        </Link>

        {/* Card 4: Inquiries & Leads */}
        <Link
          href="/admin/messages"
          className="group bg-card hover:bg-muted/30 border border-border hover:border-[#F55036]/40 rounded-2xl p-5 transition-all flex flex-col justify-between shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">Inquiries &amp; Leads</span>
            <div className="w-8 h-8 rounded-xl bg-[#F55036]/10 border border-[#F55036]/20 flex items-center justify-center text-[#F55036]">
              <MessageSquare size={15} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-foreground tracking-tight mb-1">
                {data.messagesCount}
              </p>
              {data.unreadMessages > 0 && (
                <span className="text-[11px] bg-[#F55036] text-white px-2 py-0.5 rounded-full font-semibold">
                  {data.unreadMessages} unread
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.inquiriesThisWeek} briefs this week
            </p>
          </div>
        </Link>
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <Layers size={14} />, label: "Services", value: data.servicesCount, href: "/admin/services", color: "text-amber-400" },
          { icon: <BookOpen size={14} />, label: "Blog Articles", value: data.postsCount, href: "/admin/blog", color: "text-[#F55036]" },
          { icon: <Briefcase size={14} />, label: "Team Members", value: data.teamCount, href: "/admin/team", color: "text-sky-400" },
          { icon: <BarChart3 size={14} />, label: "Pending Revenue", value: `$${data.pendingRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, href: "/admin/revenue", color: "text-amber-400" },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3 hover:bg-muted/30 hover:border-border/70 transition-all shadow-sm group"
          >
            <div className={`flex-shrink-0 ${stat.color}`}>{stat.icon}</div>
            <div className="min-w-0">
              <p className="text-xs font-mono font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground truncate">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          3. MAIN WORKSPACE (Full Width Chart + 3 Widgets)
      ══════════════════════════════════════════ */}
      <div className="space-y-6">

        {/* ── TOP SECTION (Full width) ── */}
        <div className="w-full">

          {/* Telemetry Hub with Tabs */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-[#F55036]" />
                <h2 className="font-bold text-foreground text-base">Growth &amp; Intake Telemetry</h2>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-background border border-border p-1 rounded-xl text-xs">
                <button
                  onClick={() => setActiveTab("revenue")}
                  className={`px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer ${
                    activeTab === "revenue"
                      ? "bg-[#F55036] text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Revenue Velocity
                </button>
                <button
                  onClick={() => setActiveTab("inquiries")}
                  className={`px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer ${
                    activeTab === "inquiries"
                      ? "bg-sky-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Inquiry Intake (7D)
                </button>
              </div>
            </div>

            {/* Chart */}
            {activeTab === "revenue" ? (
              <RevenueTrendChart
                data={data.monthlyRevenue}
                totalRevenue={data.paidRevenue}
                currency={currency}
              />
            ) : (
              <InquiriesVelocityChart
                data={data.weeklyInquiries}
                totalThisWeek={data.inquiriesThisWeek}
              />
            )}
          </div>
        </div>

        {/* ── BOTTOM WIDGETS (3 Columns) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Invoice Settlement Donut */}
          <FinancialDonutChart
            paid={data.paidRevenue}
            pending={data.pendingRevenue}
            overdue={data.overdueRevenue}
            currency={currency}
          />

          {/* Recent Inquiries */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#F55036]/10 border border-[#F55036]/20 flex items-center justify-center">
                  <MessageSquare size={13} className="text-[#F55036]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground leading-none">Recent Inquiries</h3>
                  {data.unreadMessages > 0 && (
                    <p className="text-[11px] text-[#F55036] mt-0.5">{data.unreadMessages} unread</p>
                  )}
                </div>
              </div>
              <Link
                href="/admin/messages"
                className="text-xs text-muted-foreground hover:text-[#F55036] transition-colors flex items-center gap-1"
              >
                All <ArrowUpRight size={11} />
              </Link>
            </div>

            <div className="p-3">
              {data.recentMessages.length === 0 ? (
                <div className="py-8 text-center">
                  <MessageSquare size={20} className="text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground/50">No messages yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {data.recentMessages.map((msg) => (
                    <Link
                      key={msg.id}
                      href="/admin/messages"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/40 transition-colors group"
                    >
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          !msg.read
                            ? "bg-[#F55036]/15 text-[#F55036]"
                            : "bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        {msg.name[0]?.toUpperCase()}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-medium text-foreground truncate">
                            {msg.name}
                          </p>
                          {!msg.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {msg.subject ?? msg.body.slice(0, 32)}
                        </p>
                      </div>
                      {/* Date */}
                      <span className="text-[11px] text-muted-foreground/60 whitespace-nowrap flex-shrink-0">
                        {new Date(msg.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <FolderKanban size={13} className="text-violet-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground leading-none">Recent Projects</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{data.projectsCount} total</p>
                </div>
              </div>
              <Link
                href="/admin/projects"
                className="text-xs text-muted-foreground hover:text-violet-400 transition-colors flex items-center gap-1"
              >
                All <ArrowUpRight size={11} />
              </Link>
            </div>

            <div className="p-3">
              {data.recentProjects.length === 0 ? (
                <div className="py-8 text-center">
                  <FolderKanban size={20} className="text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground/50">No projects yet</p>
                  <Link href="/admin/projects" className="text-xs text-[#F55036] hover:underline mt-1 inline-block">
                    + Create first project
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  {data.recentProjects.map((p) => (
                    <Link
                      key={p.id}
                      href={`/admin/projects/${p.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/40 transition-colors group"
                    >
                      {/* Icon */}
                      <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center flex-shrink-0">
                        <FolderKanban size={13} className="text-violet-400" />
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground group-hover:text-foreground/90 truncate">
                          {p.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {new Date(p.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "2-digit",
                          })}
                        </p>
                      </div>
                      {/* Status Badge */}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-semibold ${
                          p.published
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-muted/40 text-muted-foreground border border-border"
                        }`}
                      >
                        {p.published ? "Live" : "Draft"}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
