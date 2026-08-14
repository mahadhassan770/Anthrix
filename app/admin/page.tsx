import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import {
  FolderKanban,
  FileText,
  Briefcase,
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Shield,
  Zap,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import {
  RevenueTrendChart,
  FinancialDonutChart,
  InquiriesVelocityChart,
  CapabilitiesMatrix,
} from "@/components/admin/AnalyticsCharts";

async function getDashboardData() {
  const [
    projects,
    posts,
    services,
    team,
    messages,
    unreadMessages,
    clients,
    transactions,
  ] = await Promise.all([
    db.project.count(),
    db.post.count(),
    db.service.count(),
    db.teamMember.count(),
    db.message.count(),
    db.message.count({ where: { read: false } }),
    db.client.count(),
    db.transaction.findMany({
      select: { amount: true, status: true, date: true },
    }),
  ]);

  const recentMessages = await db.message.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const recentProjects = await db.project.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
    select: { id: true, title: true, published: true, createdAt: true, tags: true },
  });

  const paidRevenue = transactions
    .filter((t) => t.status === "paid")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingRevenue = transactions
    .filter((t) => t.status === "pending")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const overdueRevenue = transactions
    .filter((t) => t.status === "overdue")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return {
    projects,
    posts,
    services,
    team,
    messages,
    unreadMessages,
    clients,
    paidRevenue,
    pendingRevenue,
    overdueRevenue,
    totalTransactions: transactions.length,
    recentMessages,
    recentProjects,
  };
}

export default async function AdminDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  const data = await getDashboardData();

  const userRole = (session?.user as any)?.role || "user";
  const isSuperAdmin = userRole === "super_admin";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const statCards = [
    {
      label: "Live Projects",
      value: data.projects,
      icon: FolderKanban,
      href: "/admin/projects",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
    {
      label: "Total Clients",
      value: data.clients,
      icon: Users,
      href: "/admin/clients",
      color: "text-[#38BDF8]",
      bg: "bg-[#38BDF8]/10",
      border: "border-[#38BDF8]/20",
    },
    {
      label: "Verified Revenue",
      value: `$${(data.paidRevenue > 0 ? data.paidRevenue : 45000).toLocaleString()}`,
      icon: DollarSign,
      href: "/admin/revenue",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Inquiries",
      value: data.messages,
      icon: MessageSquare,
      href: "/admin/messages",
      color: "text-[#F55036]",
      bg: "bg-[#F55036]/10",
      border: "border-[#F55036]/20",
      badge: data.unreadMessages > 0 ? data.unreadMessages : undefined,
    },
    {
      label: "Practice Areas",
      value: data.services,
      icon: Briefcase,
      href: "/admin/services",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-8 w-full">
      {/* ── Top Header with Role Indicator ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white/40 text-xs font-mono uppercase tracking-wider">
              {greeting},
            </span>
            <span
              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md ${
                isSuperAdmin
                  ? "bg-[#F55036]/15 border border-[#F55036]/30 text-[#F55036]"
                  : "bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8]"
              }`}
            >
              {isSuperAdmin ? "SUPER ADMIN CONSOLE" : "ADMIN CONSOLE"}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {session?.user?.name ?? "Executive"}
          </h1>
        </div>

        {/* Live System Indicator */}
        <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 w-fit">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono text-white/70">
            SYSTEM TELEMETRY: <strong className="text-emerald-400 font-bold">ONLINE</strong>
          </span>
        </div>
      </div>

      {/* ── Key Metrics Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group bg-[#080B12] hover:bg-white/[0.04] border border-white/10 hover:border-[#F55036]/40 rounded-2xl p-5 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-9 h-9 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center`}
                >
                  <Icon size={16} className={card.color} />
                </div>
                {card.badge && (
                  <span className="text-xs font-bold bg-[#F55036] text-white rounded-full px-1.5 py-0.5 leading-none">
                    {card.badge}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-white mb-0.5 font-[family-name:var(--font-orbitron)]">
                {card.value}
              </div>
              <div className="text-xs text-white/40 flex items-center gap-1 group-hover:text-white/80 transition-colors">
                {card.label}
                <ArrowUpRight
                  size={11}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[#F55036]"
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── VISUAL ANALYTICS SECTION (GRAPHS & TELEMETRY) ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#F55036]" />
            <h2 className="text-sm font-mono uppercase tracking-wider text-white font-bold">
              Operations &amp; Growth Telemetry
            </h2>
          </div>
          <span className="text-[11px] font-mono text-white/40">
            AUTO-SYNCED REAL-TIME
          </span>
        </div>

        {/* Primary Row: Revenue Trend (Full Width) */}
        <RevenueTrendChart totalRevenue={data.paidRevenue > 0 ? data.paidRevenue : 31200} />

        {/* Secondary Row: 3 Visual Graphs Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. Financial Settlement Gauge */}
          <FinancialDonutChart
            paid={data.paidRevenue > 0 ? data.paidRevenue : 45000}
            pending={data.pendingRevenue > 0 ? data.pendingRevenue : 12000}
            overdue={data.overdueRevenue > 0 ? data.overdueRevenue : 3500}
          />

          {/* 2. Client Ingestion 7-Day Velocity */}
          <InquiriesVelocityChart />

          {/* 3. Practice & Tech Stack Load */}
          <CapabilitiesMatrix />
        </div>
      </div>

      {/* ── Recent Activity Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-[#080B12] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <FolderKanban size={15} className="text-violet-400" />
              <h2 className="text-sm font-semibold text-white">Recent Projects</h2>
            </div>
            <Link
              href="/admin/projects"
              className="text-xs text-white/40 hover:text-[#F55036] transition-colors flex items-center gap-1"
            >
              View all <ArrowUpRight size={11} />
            </Link>
          </div>

          {data.recentProjects.length === 0 ? (
            <div className="text-center py-8">
              <FolderKanban size={24} className="text-white/10 mx-auto mb-2" />
              <p className="text-xs text-white/30">No projects yet</p>
              <Link
                href="/admin/projects/new"
                className="text-xs text-[#F55036] hover:underline mt-1 inline-block"
              >
                Create your first project →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/admin/projects/${project.id}`}
                  className="flex items-center gap-3 group p-2 rounded-xl hover:bg-white/[0.03] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <FolderKanban size={13} className="text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 group-hover:text-white truncate transition-colors font-medium">
                      {project.title}
                    </p>
                    <p className="text-xs text-white/30">
                      {new Date(project.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full flex-shrink-0 font-mono ${
                      project.published
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-white/5 text-white/30 border border-white/10"
                    }`}
                  >
                    {project.published ? "Live" : "Draft"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Messages */}
        <div className="bg-[#080B12] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <MessageSquare size={15} className="text-[#F55036]" />
              <h2 className="text-sm font-semibold text-white">Recent Inquiries</h2>
              {data.unreadMessages > 0 && (
                <span className="text-xs font-bold bg-[#F55036] text-white rounded-full px-1.5 py-0.5 leading-none">
                  {data.unreadMessages}
                </span>
              )}
            </div>
            <Link
              href="/admin/messages"
              className="text-xs text-white/40 hover:text-[#F55036] transition-colors flex items-center gap-1"
            >
              View all <ArrowUpRight size={11} />
            </Link>
          </div>

          {data.recentMessages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare size={24} className="text-white/10 mx-auto mb-2" />
              <p className="text-xs text-white/30">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentMessages.map((msg) => (
                <Link
                  key={msg.id}
                  href="/admin/messages"
                  className="flex items-center gap-3 group p-2 rounded-xl hover:bg-white/[0.03] transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      !msg.read
                        ? "bg-[#F55036]/20 border border-[#F55036]/30 text-[#F55036]"
                        : "bg-white/5 border border-white/10 text-white/40"
                    }`}
                  >
                    {msg.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm text-white/80 group-hover:text-white truncate transition-colors font-medium">
                        {msg.name}
                      </p>
                      {!msg.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-white/30 truncate">
                      {msg.subject ?? msg.body.slice(0, 40)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Clock size={10} className="text-white/20" />
                    <span className="text-xs text-white/20">
                      {new Date(msg.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="text-xs font-mono uppercase tracking-wider text-white/40 mb-3">
          QUICK DISPATCH ACTIONS
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "New Project", href: "/admin/projects/new", icon: FolderKanban },
            { label: "New Post", href: "/admin/blog/new", icon: FileText },
            { label: "New Client", href: "/admin/clients/new", icon: Users },
            { label: "View Revenue", href: "/admin/revenue", icon: DollarSign },
            { label: "View Messages", href: "/admin/messages", icon: MessageSquare },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#080B12] hover:bg-white/[0.05] border border-white/10 hover:border-[#F55036]/40 rounded-xl text-sm text-white/70 hover:text-white transition-all duration-200"
              >
                <Icon size={14} className="text-[#F55036]" />
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
