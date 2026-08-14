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
} from "lucide-react";
import {
  RevenueTrendChart,
  FinancialDonutChart,
  InquiriesVelocityChart,
  CapabilitiesMatrix,
  RevenuePoint,
  DayInquiry,
  StackCapability,
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
  practiceDistribution: StackCapability[];
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
          1. EXECUTIVE HEADER (Full Width)
      ══════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-white/50 text-xs font-medium uppercase tracking-wider">
              {greeting},
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                data.isSuperAdmin
                  ? "bg-[#F55036]/15 border border-[#F55036]/30 text-[#F55036]"
                  : "bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8]"
              }`}
            >
              {data.isSuperAdmin ? "Super Admin" : "Admin"}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {data.userName}
          </h1>
        </div>

        {/* Header Actions & Currency Switch */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Currency Switcher */}
          <div className="flex items-center gap-1 bg-[#080B12] p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setCurrency("USD")}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                currency === "USD"
                  ? "bg-[#F55036] text-white shadow-sm"
                  : "text-white/50 hover:text-white"
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency("PKR")}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                currency === "PKR"
                  ? "bg-[#F55036] text-white shadow-sm"
                  : "text-white/50 hover:text-white"
              }`}
            >
              PKR (Rs)
            </button>
          </div>

          <Link
            href="/admin/projects/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all"
          >
            <Plus size={14} className="text-[#F55036]" />
            <span>New Project</span>
          </Link>

          <Link
            href="/admin/revenue"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white bg-[#F55036] hover:bg-[#d94429] transition-all shadow-sm"
          >
            <DollarSign size={14} />
            <span>Log Revenue</span>
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          2. CORE KPI RIBBON (Full Width 4 Columns)
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Verified Revenue */}
        <Link
          href="/admin/revenue"
          className="group bg-[#080B12] hover:bg-white/[0.02] border border-white/10 hover:border-[#F55036]/40 rounded-2xl p-5 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-white/50">Verified Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign size={15} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white tracking-tight mb-1">
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

        {/* Card 2: Total Clients */}
        <Link
          href="/admin/clients"
          className="group bg-[#080B12] hover:bg-white/[0.02] border border-white/10 hover:border-[#38BDF8]/40 rounded-2xl p-5 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-white/50">Active Clients</span>
            <div className="w-8 h-8 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-center text-[#38BDF8]">
              <Users size={15} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white tracking-tight mb-1">
              {data.clientsCount}
            </p>
            <p className="text-xs text-white/40">Registered accounts</p>
          </div>
        </Link>

        {/* Card 3: Live Projects */}
        <Link
          href="/admin/projects"
          className="group bg-[#080B12] hover:bg-white/[0.02] border border-white/10 hover:border-violet-500/40 rounded-2xl p-5 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-white/50">Portfolio Projects</span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <FolderKanban size={15} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white tracking-tight mb-1">
              {data.projectsCount}
            </p>
            <p className="text-xs text-white/40">Published case studies</p>
          </div>
        </Link>

        {/* Card 4: Inquiries */}
        <Link
          href="/admin/messages"
          className="group bg-[#080B12] hover:bg-white/[0.02] border border-white/10 hover:border-[#F55036]/40 rounded-2xl p-5 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-white/50">Inquiries &amp; Leads</span>
            <div className="w-8 h-8 rounded-xl bg-[#F55036]/10 border border-[#F55036]/20 flex items-center justify-center text-[#F55036]">
              <MessageSquare size={15} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-white tracking-tight mb-1">
                {data.messagesCount}
              </p>
              {data.unreadMessages > 0 && (
                <span className="text-[11px] bg-[#F55036] text-white px-2 py-0.5 rounded-full font-semibold">
                  {data.unreadMessages} unread
                </span>
              )}
            </div>
            <p className="text-xs text-white/40">
              {data.inquiriesThisWeek} briefs this week
            </p>
          </div>
        </Link>
      </div>

      {/* ══════════════════════════════════════════
          3. MAIN ORGANIZED WORKSPACE (Full Width 2 Columns)
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN (2/3 width on large screens) ── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Telemetry Hub with Tabs */}
          <div className="bg-[#080B12] border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-[#F55036]" />
                <h2 className="font-bold text-white text-base">Growth &amp; Intake Telemetry</h2>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10 text-xs">
                <button
                  onClick={() => setActiveTab("revenue")}
                  className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                    activeTab === "revenue"
                      ? "bg-[#F55036] text-white shadow-sm"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  Revenue Velocity
                </button>
                <button
                  onClick={() => setActiveTab("inquiries")}
                  className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                    activeTab === "inquiries"
                      ? "bg-[#38BDF8] text-white shadow-sm"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  Inquiry Intake (7D)
                </button>
              </div>
            </div>

            {/* Render Tab Chart */}
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

          {/* Practice Area Distribution */}
          <CapabilitiesMatrix data={data.practiceDistribution} />
        </div>

        {/* ── RIGHT COLUMN (1/3 width) ── */}
        <div className="space-y-6">

          {/* 1. Settlement Donut Chart (Fully Fixed Geometry & Simple Fonts) */}
          <FinancialDonutChart
            paid={data.paidRevenue}
            pending={data.pendingRevenue}
            overdue={data.overdueRevenue}
            currency={currency}
          />

          {/* 2. Recent Inquiries Feed */}
          <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <MessageSquare size={15} className="text-[#F55036]" />
                <h3 className="text-sm font-semibold text-white">Recent Inquiries</h3>
              </div>
              <Link
                href="/admin/messages"
                className="text-xs text-white/40 hover:text-[#F55036] transition-colors flex items-center gap-1 font-medium"
              >
                View all <ArrowUpRight size={12} />
              </Link>
            </div>

            {data.recentMessages.length === 0 ? (
              <p className="text-xs text-white/30 py-4 text-center">No messages yet</p>
            ) : (
              <div className="space-y-3">
                {data.recentMessages.map((msg) => (
                  <Link
                    key={msg.id}
                    href="/admin/messages"
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors group"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                        !msg.read
                          ? "bg-[#F55036]/20 border border-[#F55036]/40 text-[#F55036]"
                          : "bg-white/5 text-white/40"
                      }`}
                    >
                      {msg.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white group-hover:text-[#F55036] truncate transition-colors">
                        {msg.name}
                      </p>
                      <p className="text-[11px] text-white/40 truncate">
                        {msg.subject ?? msg.body.slice(0, 30)}
                      </p>
                    </div>
                    <span className="text-[11px] text-white/30 whitespace-nowrap">
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

          {/* 3. Recent Projects Snapshot */}
          <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <FolderKanban size={15} className="text-violet-400" />
                <h3 className="text-sm font-semibold text-white">Recent Projects</h3>
              </div>
              <Link
                href="/admin/projects"
                className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1 font-medium"
              >
                View all <ArrowUpRight size={12} />
              </Link>
            </div>

            {data.recentProjects.length === 0 ? (
              <p className="text-xs text-white/30 py-4 text-center">No projects yet</p>
            ) : (
              <div className="space-y-3">
                {data.recentProjects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/admin/projects/${p.id}`}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-white/[0.03] transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white group-hover:text-violet-300 truncate transition-colors">
                        {p.title}
                      </p>
                      <p className="text-[11px] text-white/40">
                        {new Date(p.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${
                        p.published
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-white/5 text-white/30 border border-white/10"
                      }`}
                    >
                      {p.published ? "LIVE" : "DRAFT"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
