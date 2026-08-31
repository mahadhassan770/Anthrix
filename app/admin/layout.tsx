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
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/invoices", label: "Invoices", icon: Receipt },
  { href: "/admin/revenue", label: "Revenue", icon: DollarSign },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
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
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group border",
        isActive
          ? "border-primary/20 bg-primary/10 text-primary"
          : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <Icon size={16} className={isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground transition-colors"} />
      <span>{label}</span>
      {badge !== undefined && badge > 0 ? (
        <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F55036] text-white shadow-[0_0_8px_rgba(245,80,54,0.6)]">
          {badge}
        </span>
      ) : isActive ? (
        <ChevronRight size={14} className="ml-auto text-primary/50" />
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

  return (
    <aside className="flex flex-col h-full bg-card border-r border-border">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-muted/40 border border-border overflow-hidden">
          <img src="/logo.png" alt="Anthrix Logo" className="h-6 w-6 object-contain drop-shadow-[0_0_8px_rgba(245,80,54,0.5)]" />
        </div>
        <div className="flex flex-col">
          <span className="flex items-center gap-1.5 font-[family-name:var(--font-orbitron)] font-extrabold text-sm tracking-[0.18em] uppercase text-foreground">
            ANTHRIX
            <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] shadow-[0_0_8px_#F55036] animate-pulse" />
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">Admin Console</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            badge={item.href === "/admin/messages" ? unreadCount : undefined}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-border">
        {/* Profile Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border mb-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border flex items-center justify-center bg-primary/10">
              {(session?.user as any)?.image ? (
                <img
                  src={(session?.user as any).image}
                  alt={session?.user?.name ?? "Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-primary">
                  {session?.user?.name?.[0]?.toUpperCase() ?? "A"}
                </span>
              )}
            </div>
            {/* Online indicator */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-card" />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate text-foreground leading-none mb-0.5">
              {session?.user?.name ?? "Admin"}
            </p>
            <p className="text-xs truncate text-muted-foreground">
              {session?.user?.email ?? ""}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href="/admin/settings"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
          >
            <Settings size={13} />
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            <LogOut size={13} />
            Sign out
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
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30">
        <Sidebar />
      </div>

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-64 h-full">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar (mobile only) */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center gap-4 px-4 h-14 backdrop-blur-md bg-background/85 border-b border-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg transition-all text-muted-foreground"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground">A</div>
            <span className="text-sm font-bold text-foreground">Admin Panel</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
