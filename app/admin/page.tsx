import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import ExecutiveDashboardClient, { DashboardDataProps } from "@/components/admin/ExecutiveDashboardClient";
import { RevenuePoint, DayInquiry } from "@/components/admin/AnalyticsCharts";

async function getDashboardData(): Promise<Omit<DashboardDataProps, "userName" | "isSuperAdmin">> {
  const [
    projectsCount,
    postsCount,
    servicesCount,
    teamCount,
    messagesCount,
    unreadMessages,
    clientsCount,
    transactions,
    invoices,
    allMessages,
    allProjects,
  ] = await Promise.all([
    db.project.count(),
    db.post.count(),
    db.service.count(),
    db.teamMember.count(),
    db.message.count(),
    db.message.count({ where: { read: false } }),
    db.client.count(),
    db.transaction.findMany({
      orderBy: { date: "asc" },
      select: { amount: true, amountPKR: true, status: true, date: true },
    }),
    db.invoice.findMany({
      select: { total: true, currency: true, status: true, createdAt: true, paidAt: true },
    }),
    db.message.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, subject: true, body: true, read: true, createdAt: true },
    }),
    db.project.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, published: true, createdAt: true, tags: true },
    }),
  ]);

  // ── 1. Real Revenue Totals (Transactions + Invoices) ────────────────────────
  const invoicePaidUSD = invoices
    .filter((i) => i.status === "paid")
    .reduce((acc, i) => acc + (i.currency === "USD" ? i.total : i.total / 280), 0);

  const invoicePendingUSD = invoices
    .filter((i) => i.status === "sent" || i.status === "viewed")
    .reduce((acc, i) => acc + (i.currency === "USD" ? i.total : i.total / 280), 0);

  const invoiceOverdueUSD = invoices
    .filter((i) => i.status === "overdue")
    .reduce((acc, i) => acc + (i.currency === "USD" ? i.total : i.total / 280), 0);

  const paidRevenue = transactions
    .filter((t) => t.status === "paid")
    .reduce((acc, curr) => acc + curr.amount, 0) + invoicePaidUSD;

  const pendingRevenue = transactions
    .filter((t) => t.status === "pending")
    .reduce((acc, curr) => acc + curr.amount, 0) + invoicePendingUSD;

  const overdueRevenue = transactions
    .filter((t) => t.status === "overdue")
    .reduce((acc, curr) => acc + curr.amount, 0) + invoiceOverdueUSD;

  // ── 2. Real Monthly Revenue Stream (Past 6 Months) ──────────────────────────
  const now = new Date();
  const monthlyRevenue: RevenuePoint[] = [];

  for (let i = 5; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = targetDate.toLocaleString("default", { month: "short" });
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();

    const monthSum = transactions
      .filter((t) => {
        const txDate = new Date(t.date);
        return (
          txDate.getFullYear() === targetYear &&
          txDate.getMonth() === targetMonth &&
          t.status === "paid"
        );
      })
      .reduce((acc, curr) => acc + curr.amount, 0);

    const projectedBaseline = monthSum > 0 ? monthSum * 1.15 : (paidRevenue / 6) * 1.2;

    monthlyRevenue.push({
      month: monthName,
      revenue: monthSum,
      projected: Math.round(projectedBaseline),
    });
  }

  // ── 3. Real 7-Day Inquiries Velocity ────────────────────────────────────────
  const weeklyInquiries: DayInquiry[] = [];
  let inquiriesThisWeek = 0;

  for (let i = 6; i >= 0; i--) {
    const dayDate = new Date();
    dayDate.setDate(dayDate.getDate() - i);
    const dayKey = dayDate.toISOString().split("T")[0];
    const dayName = dayDate.toLocaleString("default", { weekday: "short" });

    const dayCount = allMessages.filter((m) => {
      const msgKey = new Date(m.createdAt).toISOString().split("T")[0];
      return msgKey === dayKey;
    }).length;

    inquiriesThisWeek += dayCount;
    weeklyInquiries.push({
      day: dayName,
      date: dayKey,
      count: dayCount,
    });
  }

  return {
    projectsCount,
    postsCount,
    servicesCount,
    teamCount,
    messagesCount,
    unreadMessages,
    clientsCount,
    paidRevenue,
    pendingRevenue,
    overdueRevenue,
    monthlyRevenue,
    weeklyInquiries,
    inquiriesThisWeek,
    recentMessages: allMessages.slice(0, 4),
    recentProjects: allProjects.slice(0, 4),
  };
}

export default async function AdminDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  const rawData = await getDashboardData();

  const userRole = (session?.user as any)?.role || "user";
  const isSuperAdmin = userRole === "super_admin";
  const userName = session?.user?.name || "Executive Admin";

  const dashboardData: DashboardDataProps = {
    ...rawData,
    userName,
    isSuperAdmin,
  };

  return <ExecutiveDashboardClient data={dashboardData} />;
}
