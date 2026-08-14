"use client";

import { useState } from "react";
import { TrendingUp, DollarSign, ArrowUpRight, Shield, Zap, CheckCircle2, Clock, AlertCircle } from "lucide-react";

// ─── 1. Real Revenue Trend Area Chart ──────────────────────────────────────
export interface RevenuePoint {
  month: string;
  revenue: number;
  projected: number;
}

export function RevenueTrendChart({
  data = [],
  totalRevenue = 0,
  currency = "USD",
}: {
  data?: RevenuePoint[];
  totalRevenue?: number;
  currency?: "USD" | "PKR";
}) {
  const isPKR = currency === "PKR";
  const multiplier = isPKR ? 280 : 1;
  const symbol = isPKR ? "Rs " : "$";

  // Use real data passed from database. If empty, generate zero-filled current months.
  const chartData =
    data.length > 0
      ? data
      : Array.from({ length: 6 }).map((_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - (5 - i));
          return {
            month: d.toLocaleString("default", { month: "short" }),
            revenue: 0,
            projected: 0,
          };
        });

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const rawMax = Math.max(
    ...chartData.map((d) => Math.max(d.revenue, d.projected)),
    100
  );
  const maxVal = rawMax * 1.15;
  const width = 600;
  const height = 200;
  const paddingX = 40;
  const paddingY = 25;

  const getX = (index: number) =>
    paddingX + (index / (chartData.length - 1 || 1)) * (width - paddingX * 2);
  const getY = (val: number) =>
    height - paddingY - (val / maxVal) * (height - paddingY * 2);

  // Build SVG Path
  const points = chartData.map((d, i) => `${getX(i)},${getY(d.revenue)}`).join(" ");
  const projectedPoints = chartData
    .map((d, i) => `${getX(i)},${getY(d.projected)}`)
    .join(" ");

  const areaPath = `M ${getX(0)},${height - paddingY} L ${points} L ${getX(
    chartData.length - 1
  )},${height - paddingY} Z`;

  const displayTotal = totalRevenue * multiplier;

  return (
    <div className="bg-[#080B12] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
      {/* Ambient Glow */}
      <div
        className="absolute top-0 right-0 w-72 h-40 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(245,80,54,0.1) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#F55036] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#F55036]">
              REAL-TIME FINANCIAL TELEMETRY // REVENUE STREAM ({currency})
            </span>
          </div>
          <h3 className="text-xl font-bold text-white flex items-baseline gap-2">
            {symbol}
            {displayTotal.toLocaleString(undefined, {
              minimumFractionDigits: isPKR ? 0 : 2,
              maximumFractionDigits: isPKR ? 0 : 2,
            })}
            <span className="text-xs font-mono font-normal text-white/50">
              verified collections
            </span>
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-white/70">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#F55036]" />
            <span>Actual Collected</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/40">
            <span className="w-2.5 h-0.5 bg-white/40 border-dashed" />
            <span>Target Velocity</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full h-[210px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F55036" stopOpacity="0.45" />
              <stop offset="85%" stopColor="#F55036" stopOpacity="0.0" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#F55036" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((pct, i) => {
            const yPos = height - paddingY - pct * (height - paddingY * 2);
            return (
              <line
                key={i}
                x1={paddingX}
                y1={yPos}
                x2={width - paddingX}
                y2={yPos}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Fill Area */}
          <path d={areaPath} fill="url(#revenueGrad)" />

          {/* Projected Target Line */}
          <polyline
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="2"
            strokeDasharray="4 4"
            points={projectedPoints}
          />

          {/* Actual Line */}
          <polyline
            fill="none"
            stroke="#F55036"
            strokeWidth="3"
            filter="url(#neonGlow)"
            points={points}
          />

          {/* Points & Hover targets */}
          {chartData.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.revenue);
            const isHovered = hoveredIdx === i;

            return (
              <g key={d.month} className="cursor-pointer">
                {/* Vertical guide line on hover */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={paddingY}
                    x2={cx}
                    y2={height - paddingY}
                    stroke="#F55036"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  fill="#080B12"
                  stroke="#F55036"
                  strokeWidth="2.5"
                  className="transition-all duration-200"
                />

                {/* X Axis Labels */}
                <text
                  x={cx}
                  y={height - 5}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.4)"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {d.month}
                </text>

                {/* Invisible hover trigger */}
                <rect
                  x={cx - 20}
                  y={0}
                  width={40}
                  height={height}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIdx !== null && (
          <div
            className="absolute -top-3 z-30 pointer-events-none transform -translate-x-1/2 bg-[#05080D]/95 border border-[#F55036]/50 rounded-lg px-3 py-1.5 shadow-xl text-center backdrop-blur-md"
            style={{ left: `${(getX(hoveredIdx) / width) * 100}%` }}
          >
            <p className="text-[10px] font-mono text-white/50 uppercase">
              {chartData[hoveredIdx].month}
            </p>
            <p className="text-sm font-bold text-[#F55036]">
              {symbol}
              {(chartData[hoveredIdx].revenue * multiplier).toLocaleString(undefined, {
                maximumFractionDigits: isPKR ? 0 : 2,
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 2. Real Financial Breakdown Donut Chart ─────────────────────────────────────────
interface BreakdownItem {
  label: string;
  amount: number;
  color: string;
  border: string;
}

export function FinancialDonutChart({
  paid = 0,
  pending = 0,
  overdue = 0,
  currency = "USD",
}: {
  paid?: number;
  pending?: number;
  overdue?: number;
  currency?: "USD" | "PKR";
}) {
  const isPKR = currency === "PKR";
  const multiplier = isPKR ? 280 : 1;
  const symbol = isPKR ? "Rs " : "$";

  const totalUSD = paid + pending + overdue;
  const displayTotal = totalUSD * multiplier;

  const items: BreakdownItem[] = [
    { label: "Paid", amount: paid * multiplier, color: "#10B981", border: "rgba(16,185,129,0.3)" },
    { label: "Pending", amount: pending * multiplier, color: "#F59E0B", border: "rgba(245,158,11,0.3)" },
    { label: "Overdue", amount: overdue * multiplier, color: "#EF4444", border: "rgba(239,68,68,0.3)" },
  ];

  const size = 160;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const collectionRate = totalUSD > 0 ? ((paid / totalUSD) * 100).toFixed(0) : "0";

  return (
    <div className="bg-[#080B12] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Invoice Settlement</h3>
        </div>
        <span className="text-[10px] font-mono text-white/40 uppercase">{currency} LIVE</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-2">
        {/* Donut graphic */}
        <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={strokeWidth}
            />

            {/* Segments */}
            {totalUSD > 0 &&
              items.map((item) => {
                const percent = item.amount / (displayTotal || 1);
                if (percent <= 0) return null;

                const strokeDasharray = `${percent * circumference} ${circumference}`;
                const strokeDashoffset = -accumulatedPercent * circumference;
                accumulatedPercent += percent;

                return (
                  <circle
                    key={item.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                );
              })}
          </svg>

          {/* Center stats */}
          <div className="absolute flex flex-col items-center justify-center text-center px-1">
            <span className="text-sm font-bold text-white font-[family-name:var(--font-orbitron)] truncate max-w-[100px]">
              {totalUSD > 0
                ? isPKR
                  ? `${(displayTotal / 1000).toFixed(0)}k`
                  : `$${displayTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                : "0"}
            </span>
            <span className="text-[9px] font-mono uppercase text-white/40">{currency} Total</span>
          </div>
        </div>

        {/* Legend stats */}
        <div className="flex flex-col gap-3 w-full sm:w-auto">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-4 text-xs p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} />
                <span className="text-white/70">{item.label}</span>
              </div>
              <span className="font-mono font-bold text-white">
                {symbol}
                {item.amount.toLocaleString(undefined, { maximumFractionDigits: isPKR ? 0 : 2 })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-white/40">
        <span>Settlement Rate</span>
        <span className="text-emerald-400 font-bold">{collectionRate}%</span>
      </div>
    </div>
  );
}

// ─── 3. Real 7-Day Inquiries Velocity Bar Chart ───────────────────────────────────
export interface DayInquiry {
  day: string;
  date: string;
  count: number;
}

export function InquiriesVelocityChart({
  data = [],
  totalThisWeek = 0,
}: {
  data?: DayInquiry[];
  totalThisWeek?: number;
}) {
  const defaultDays: DayInquiry[] = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      day: d.toLocaleString("default", { weekday: "short" }),
      date: d.toISOString().split("T")[0],
      count: 0,
    };
  });

  const chartData = data.length > 0 ? data : defaultDays;
  const maxVal = Math.max(...chartData.map((d) => d.count), 1);
  const totalCount = totalThisWeek || chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="bg-[#080B12] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#38BDF8] block mb-1">
            CLIENT INGESTION // 7-DAY INTAKE
          </span>
          <h3 className="text-base font-bold text-white">Inquiry Activity</h3>
        </div>
        <div className="px-2.5 py-1 rounded-md bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[11px] font-mono text-[#38BDF8]">
          {totalCount} Total (7D)
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end justify-between gap-2 h-36 pt-4 pb-2 px-1">
        {chartData.map((item) => {
          const heightPercent = item.count > 0 ? (item.count / maxVal) * 100 : 8;
          const hasCount = item.count > 0;

          return (
            <div key={item.day + item.date} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="relative w-full flex items-end justify-center h-28">
                {/* Bar */}
                <div
                  className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                    hasCount
                      ? "bg-gradient-to-t from-[#38BDF8]/30 to-[#38BDF8] group-hover:to-[#F55036] shadow-[0_0_12px_rgba(56,189,248,0.35)]"
                      : "bg-white/5 group-hover:bg-white/10"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />

                {/* Hover count pill */}
                <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] font-mono text-white bg-[#05080D] border border-white/15 px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none">
                  {item.count} Briefs
                </span>
              </div>
              <span className="text-[11px] font-mono text-white/40 group-hover:text-white transition-colors">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-white/40">
        <span>Intake Frequency</span>
        <span className="text-[#38BDF8] font-bold">
          {(totalCount / 7).toFixed(1)} / Day
        </span>
      </div>
    </div>
  );
}

// ─── 4. Real Practice & Tech Stack Distribution Matrix ─────────────────────────────
export interface StackCapability {
  label: string;
  count: number;
  pct: number;
  color: string;
}

export function CapabilitiesMatrix({
  data = [],
}: {
  data?: StackCapability[];
}) {
  const defaultCapabilities: StackCapability[] = [
    { label: "AI Agents & Autonomous Workflows", count: 0, pct: 25, color: "#F55036" },
    { label: "Next.js SaaS Platforms & Web Apps", count: 0, pct: 25, color: "#38BDF8" },
    { label: "RAG Systems & Vector Embeddings", count: 0, pct: 25, color: "#A855F7" },
    { label: "Custom API & Enterprise Pipelines", count: 0, pct: 25, color: "#10B981" },
  ];

  const items = data.length > 0 ? data : defaultCapabilities;

  return (
    <div className="bg-[#080B12] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#A855F7] block mb-1">
            STACK ARCHITECTURE // LOAD
          </span>
          <h3 className="text-base font-bold text-white">Practice Distribution</h3>
        </div>
        <Zap size={15} className="text-[#A855F7]" />
      </div>

      <div className="space-y-4 my-auto py-2">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-white/80 truncate max-w-[200px]">{item.label}</span>
              <span className="font-bold" style={{ color: item.color }}>
                {item.pct}% {item.count > 0 ? `(${item.count})` : ""}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${item.pct}%`,
                  background: item.color,
                  boxShadow: `0 0 10px ${item.color}80`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-white/40">
        <span>Production Health</span>
        <span className="text-emerald-400 font-bold">100% Operational</span>
      </div>
    </div>
  );
}
