"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Settings,
  Users,
  MessageSquare,
  Briefcase,
  LogOut,
  ChevronRight,
  Menu,
  DollarSign,
  Receipt,
  UserCheck,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ModalProvider } from "@/components/admin/ui/modals";

// ─── Organized Navigation Sections ────────────────────────────────────────────
interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/revenue", label: "Treasury & Revenue", icon: DollarSign },
    ],
  },
  {
    title: "Talent & ATS",
    items: [
      { href: "/admin/candidates", label: "Candidates", icon: UserCheck },
      { href: "/admin/careers", label: "Job Openings", icon: Briefcase },
    ],
  },
  {
    title: "Agency Portfolio",
    items: [
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/services", label: "Services & Solutions", icon: Layers },
      { href: "/admin/blog", label: "Blog & Insights", icon: FileText },
    ],
  },
  {
    title: "Client Relations",
    items: [
      { href: "/admin/clients", label: "Clients CRM", icon: Users },
      { href: "/admin/invoices", label: "Invoices & Billing", icon: Receipt },
      { href: "/admin/messages", label: "Inquiries & Leads", icon: MessageSquare },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/team", label: "Team & Access", icon: Shield },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  badge,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group relative",
        isActive
          ? "bg-[#F55036]/10 text-[#F55036] font-semibold border-l-2 border-[#F55036] shadow-sm"
          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
      )}
    >
      <Icon
        size={15}
        className={cn(
          "flex-shrink-0 transition-colors",
          isActive ? "text-[#F55036]" : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      <span className="truncate">{label}</span>
      {badge !== undefined && badge > 0 ? (
        <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F55036] text-white shadow-[0_0_8px_rgba(245,80,54,0.5)]">
          {badge}
        </span>
      ) : isActive ? (
        <ChevronRight size={13} className="ml-auto text-[#F55036]/60 flex-shrink-0" />
      ) : null}
    </Link>
  );
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((data) => {
        if (data.counts?.unread !== undefined) {
          setUnreadCount(data.counts.unread);
        }
      })
      .catch(() => {});
  }, [pathname]);

  async function handleSignOut() {
    await signOut();
    router.push("/admin/login");
  }

  const roleLabel = (session?.user as any)?.role === "super_admin" ? "Super Admin" : "Admin";

  return (
    <aside className="flex flex-col h-full bg-card border-r border-border select-none">
      {/* ── Brand Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/10">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#F55036]/10 border border-[#F55036]/25 group-hover:border-[#F55036] transition-colors overflow-hidden flex-shrink-0 shadow-sm">
            <img
              src="/logo.png"
              alt="Anthrix"
              className="h-5 w-5 object-contain drop-shadow-[0_0_8px_rgba(245,80,54,0.4)]"
            />
          </div>
          <div className="flex flex-col">
            <span className="flex items-center gap-1.5 font-[family-name:var(--font-orbitron)] font-extrabold text-xs tracking-[0.18em] uppercase text-foreground group-hover:text-[#F55036] transition-colors">
              ANTHRIX
              <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] shadow-[0_0_8px_#F55036] animate-pulse" />
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/70">
              Agency Operating System
            </span>
          </div>
        </Link>
      </div>

      {/* ── Grouped Navigation ── */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto scrollbar-none">
        {navSections.map((sec) => (
          <div key={sec.title} className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 px-3 pt-1 pb-0.5">
              {sec.title}
            </p>
            <div className="space-y-0.5">
              {sec.items.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  badge={item.href === "/admin/messages" ? unreadCount : undefined}
                  onClick={onClose}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── User Profile Footer ── */}
      <div className="p-3 border-t border-border bg-muted/10">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-background/60 border border-border mb-2.5 shadow-sm">
          {/* Avatar with Online Indicator */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-border flex items-center justify-center bg-[#F55036]/10 text-[#F55036] font-bold text-xs font-mono">
              {(session?.user as any)?.image ? (
                <img
                  src={(session?.user as any).image}
                  alt={session?.user?.name ?? "Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                session?.user?.name?.[0]?.toUpperCase() ?? "A"
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
          </div>

          {/* User Details & Role */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold truncate text-foreground leading-tight">
                {session?.user?.name ?? "Administrator"}
              </p>
            </div>
            <p className="text-[10px] truncate text-muted-foreground/70 font-mono mt-0.5">
              {session?.user?.email ?? ""}
            </p>
            <span className="inline-block mt-1 text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[#F55036]/10 text-[#F55036] border border-[#F55036]/20">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <Link
            href="/admin/settings"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-border/60 transition-all"
          >
            <Settings size={12} />
            <span>Settings</span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 border border-border/60 transition-all cursor-pointer"
          >
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Login page gets NO sidebar/shell — just the raw page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <ModalProvider>
      <div className="min-h-screen flex bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30">
          <Sidebar />
        </div>

        {/* Mobile Sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden animate-in fade-in duration-200">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative w-64 h-full animate-in slide-in-from-left duration-200">
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
          {/* Top bar (mobile only) */}
          <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 h-14 backdrop-blur-md bg-background/85 border-b border-border">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold bg-[#F55036] text-white">
                A
              </div>
              <span className="text-xs font-bold text-foreground font-[family-name:var(--font-orbitron)] tracking-wider">
                ANTHRIX
              </span>
            </div>
            <Link
              href="/admin/settings"
              className="p-2 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
            >
              <Settings size={16} />
            </Link>
          </header>

          {/* Page content */}
          <main className="flex-1 p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ModalProvider>
  );
}
