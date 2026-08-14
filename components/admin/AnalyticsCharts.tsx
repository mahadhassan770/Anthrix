"use client";

import { useState } from "react";
import { TrendingUp, DollarSign, ArrowUpRight, Zap, CheckCircle2, Clock, AlertCircle } from "lucide-react";

// ─── 1. Clean Revenue Trend Area Chart ──────────────────────────────────────
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
  const height = 180;
  const paddingX = 35;
  const paddingY = 20;

  const getX = (index: number) =>
    paddingX + (index / (chartData.length - 1 || 1)) * (width - paddingX * 2);
  const getY = (val: number) =>
    height - paddingY - (val / maxVal) * (height - paddingY * 2);

  const points = chartData.map((d, i) => `${getX(i)},${getY(d.revenue)}`).join(" ");
  const projectedPoints = chartData
    .map((d, i) => `${getX(i)},${getY(d.projected)}`)
    .join(" ");

  const areaPath = `M ${getX(0)},${height - paddingY} L ${points} L ${getX(
    chartData.length - 1
  )},${height - paddingY} Z`;

  const displayTotal = totalRevenue * multiplier;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <span className="text-xs text-white/50 font-medium">
            Monthly Collected Revenue ({currency})
          </span>
          <p className="text-2xl font-bold text-white tracking-tight mt-0.5">
            {symbol}
            {displayTotal.toLocaleString(undefined, {
              minimumFractionDigits: isPKR ? 0 : 2,
              maximumFractionDigits: isPKR ? 0 : 2,
            })}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-white/80">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F55036]" />
            <span>Actual</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/40">
            <span className="w-3 h-0.5 bg-white/30 border-dashed" />
            <span>Projected</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full h-[190px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="cleanRevenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F55036" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#F55036" stopOpacity="0.0" />
            </linearGradient>
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
                strokeDasharray="3 3"
              />
            );
          })}

          {/* Fill Area */}
          <path d={areaPath} fill="url(#cleanRevenueGrad)" />

          {/* Projected Target Line */}
          <polyline
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            points={projectedPoints}
          />

          {/* Actual Line */}
          <polyline
            fill="none"
            stroke="#F55036"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Points & Hover targets */}
          {chartData.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.revenue);
            const isHovered = hoveredIdx === i;

            return (
              <g key={d.month} className="cursor-pointer">
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

                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5 : 3.5}
                  fill="#080B12"
                  stroke="#F55036"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />

                {/* X Axis Labels */}
                <text
                  x={cx}
                  y={height - 2}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.5)"
                  fontSize="11"
                  fontWeight="500"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {d.month}
                </text>

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
            className="absolute -top-3 z-30 pointer-events-none transform -translate-x-1/2 bg-[#0C1017] border border-white/15 rounded-lg px-3 py-1.5 shadow-xl text-center backdrop-blur-md"
            style={{ left: `${(getX(hoveredIdx) / width) * 100}%` }}
          >
            <p className="text-[11px] text-white/50 font-medium">
              {chartData[hoveredIdx].month}
            </p>
            <p className="text-sm font-bold text-white">
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

// ─── 2. Clean, Fully-Visible Financial Breakdown Donut Chart ────────────────
interface BreakdownItem {
  label: string;
  amount: number;
  color: string;
  dotColor: string;
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
    { label: "Paid", amount: paid * multiplier, color: "#10B981", dotColor: "bg-emerald-500" },
    { label: "Pending", amount: pending * multiplier, color: "#F59E0B", dotColor: "bg-yellow-500" },
    { label: "Overdue", amount: overdue * multiplier, color: "#EF4444", dotColor: "bg-red-500" },
  ];

  // SVG Geometry with safe padding
  const size = 160;
  const strokeWidth = 14;
  const center = size / 2; // 80
  const radius = 64; // Outer edge is 64 + 7 = 71px, well inside 80px boundary
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const collectionRate = totalUSD > 0 ? Math.round((paid / totalUSD) * 100) : 0;

  return (
    <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5 flex flex-col justify-between h-full">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Invoice Settlement</h3>
        </div>
        <span className="text-xs text-white/40 font-medium">{currency} Live</span>
      </div>

      {/* Donut & Stats Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 my-2">
        {/* Donut Circle (Zero clipping, perfectly centered) */}
        <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            width={size}
            height={size}
            className="w-full h-full transform -rotate-90 overflow-visible"
          >
            {/* Base Background Track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={strokeWidth}
            />

            {/* Dynamic Segments */}
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
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                );
              })}
          </svg>

          {/* Center Text (Simple, standard typography) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-base font-bold text-white tracking-tight">
              {symbol}
              {totalUSD > 0
                ? displayTotal.toLocaleString(undefined, { maximumFractionDigits: isPKR ? 0 : 2 })
                : "0"}
            </span>
            <span className="text-[10px] text-white/40 uppercase font-medium tracking-wider mt-0.5">
              Total Invoiced
            </span>
          </div>
        </div>

        {/* Legend List (Clean Cards) */}
        <div className="flex flex-col gap-2 w-full sm:w-44">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.dotColor}`} />
                <span className="text-white/70 font-medium">{item.label}</span>
              </div>
              <span className="font-semibold text-white">
                {symbol}
                {item.amount.toLocaleString(undefined, {
                  minimumFractionDigits: isPKR ? 0 : 2,
                  maximumFractionDigits: isPKR ? 0 : 2,
                })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Settlement Rate */}
      <div className="pt-3.5 border-t border-white/5 flex items-center justify-between text-xs text-white/50 font-medium">
        <span>Settlement Rate</span>
        <span className="text-emerald-400 font-bold">{collectionRate}%</span>
      </div>
    </div>
  );
}

// ─── 3. Clean 7-Day Inquiries Velocity Bar Chart ───────────────────────────
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
    <div className="w-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-xs text-white/50 font-medium">Weekly Incoming Inquiries</span>
          <p className="text-2xl font-bold text-white tracking-tight mt-0.5">
            {totalCount} <span className="text-sm font-normal text-white/40">briefs logged (7D)</span>
          </p>
        </div>
        <div className="px-3 py-1 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-xs font-semibold text-[#38BDF8]">
          Avg {(totalCount / 7).toFixed(1)} / Day
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end justify-between gap-3 h-36 pt-4 pb-2">
        {chartData.map((item) => {
          const heightPercent = item.count > 0 ? (item.count / maxVal) * 100 : 6;
          const hasCount = item.count > 0;

          return (
            <div key={item.day + item.date} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="relative w-full flex items-end justify-center h-28">
                <div
                  className={`w-full max-w-[32px] rounded-t-lg transition-all duration-200 ${
                    hasCount
                      ? "bg-[#38BDF8] group-hover:bg-[#F55036]"
                      : "bg-white/5 group-hover:bg-white/10"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />

                <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-xs font-medium text-white bg-[#0C1017] border border-white/15 px-2 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none">
                  {item.count} Briefs
                </span>
              </div>
              <span className="text-xs text-white/50 group-hover:text-white font-medium transition-colors">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 4. Clean Practice & Tech Stack Distribution Matrix ────────────────────
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
    <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-[#A855F7]" />
          <h3 className="text-sm font-semibold text-white">Practice Area Distribution</h3>
        </div>
        <span className="text-xs text-emerald-400 font-medium">100% Operational</span>
      </div>

      <div className="space-y-4 my-auto py-2">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs font-medium mb-1.5">
              <span className="text-white/80">{item.label}</span>
              <span className="text-white font-semibold">
                {item.pct}% {item.count > 0 ? `(${item.count})` : ""}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${item.pct}%`,
                  background: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
