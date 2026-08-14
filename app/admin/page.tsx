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
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

async function getStats() {
  const [projects, posts, services, team, messages, unreadMessages] = await Promise.all([
    db.project.count(),
    db.post.count(),
    db.service.count(),
    db.teamMember.count(),
    db.message.count(),
    db.message.count({ where: { read: false } }),
  ]);

  const recentMessages = await db.message.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentProjects = await db.project.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
    select: { id: true, title: true, published: true, createdAt: true, tags: true },
  });

  return { projects, posts, services, team, messages, unreadMessages, recentMessages, recentProjects };
}

export default async function AdminDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  const stats = await getStats();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const statCards = [
    {
      label: "Projects",
      value: stats.projects,
      icon: FolderKanban,
      href: "/admin/projects",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
    {
      label: "Blog Posts",
      value: stats.posts,
      icon: FileText,
      href: "/admin/blog",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Services",
      value: stats.services,
      icon: Briefcase,
      href: "/admin/services",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Team Members",
      value: stats.team,
      icon: Users,
      href: "/admin/team",
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
    {
      label: "Messages",
      value: stats.messages,
      icon: MessageSquare,
      href: "/admin/messages",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      badge: stats.unreadMessages > 0 ? stats.unreadMessages : undefined,
    },
  ];

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div>
        <p className="text-white/40 text-sm mb-1">{greeting},</p>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          {session?.user?.name ?? "Admin"} 👋
        </h1>
        <p className="text-white/30 text-sm mt-1">Here&apos;s an overview of your content today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/10 rounded-2xl p-5 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-9 h-9 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center`}>
                  <Icon size={16} className={card.color} />
                </div>
                {card.badge && (
                  <span className="text-xs font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                    {card.badge}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-white mb-0.5">{card.value}</div>
              <div className="text-xs text-white/40 flex items-center gap-1 group-hover:text-white/60 transition-colors">
                {card.label}
                <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two column row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-violet-400" />
              <h2 className="text-sm font-semibold text-white">Recent Projects</h2>
            </div>
            <Link
              href="/admin/projects"
              className="text-xs text-white/30 hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              View all <ArrowUpRight size={11} />
            </Link>
          </div>

          {stats.recentProjects.length === 0 ? (
            <div className="text-center py-8">
              <FolderKanban size={24} className="text-white/10 mx-auto mb-2" />
              <p className="text-xs text-white/30">No projects yet</p>
              <Link
                href="/admin/projects/new"
                className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 inline-block"
              >
                Create your first project →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/admin/projects/${project.id}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <FolderKanban size={13} className="text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 group-hover:text-white truncate transition-colors">
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
                    className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
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
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <MessageSquare size={15} className="text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">Recent Messages</h2>
              {stats.unreadMessages > 0 && (
                <span className="text-xs font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                  {stats.unreadMessages}
                </span>
              )}
            </div>
            <Link
              href="/admin/messages"
              className="text-xs text-white/30 hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              View all <ArrowUpRight size={11} />
            </Link>
          </div>

          {stats.recentMessages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare size={24} className="text-white/10 mx-auto mb-2" />
              <p className="text-xs text-white/30">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentMessages.map((msg) => (
                <Link
                  key={msg.id}
                  href="/admin/messages"
                  className="flex items-center gap-3 group"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      !msg.read
                        ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-400"
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
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-white/30 truncate">{msg.subject ?? msg.body.slice(0, 40)}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Clock size={10} className="text-white/20" />
                    <span className="text-xs text-white/20">
                      {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-white/50 mb-3 uppercase tracking-wider">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "New Project", href: "/admin/projects/new", icon: FolderKanban },
            { label: "New Post", href: "/admin/blog/new", icon: FileText },
            { label: "Add Team Member", href: "/admin/team/new", icon: Users },
            { label: "View Messages", href: "/admin/messages", icon: MessageSquare },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/10 rounded-xl text-sm text-white/60 hover:text-white transition-all duration-150"
              >
                <Icon size={14} />
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
