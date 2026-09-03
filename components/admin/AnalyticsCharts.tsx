"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  TrendingUp,
  DollarSign,
  Zap,
  ChevronLeft,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ZoomIn,
  ZoomOut,
  BarChart2,
  Activity,
} from "lucide-react";

// ─── Shared helpers ───────────────────────────────────────────────────────────
function formatMoney(val: number, symbol: string, isPKR: boolean) {
  if (val >= 1_000_000) return `${symbol}${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${symbol}${(val / 1_000).toFixed(isPKR ? 0 : 1)}K`;
  return `${symbol}${val.toLocaleString(undefined, { maximumFractionDigits: isPKR ? 0 : 2 })}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  1.  Revenue Trend Chart  — with monthly → weekly drill-down zoom
// ═══════════════════════════════════════════════════════════════════════════════
export interface RevenuePoint {
  month: string;
  revenue: number;
  projected: number;
}

// Synthetic weekly breakdown for a clicked month (proportional split)
function generateWeekly(point: RevenuePoint) {
  const total = point.revenue;
  const splits = [0.22, 0.28, 0.31, 0.19]; // rough weekly distribution
  return splits.map((s, i) => ({
    label: `Wk ${i + 1}`,
    revenue: Math.round(total * s),
    projected: Math.round((point.projected * s) * 1.05),
  }));
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

  const monthlyData: RevenuePoint[] =
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

  // Drill-down state
  const [zoomedMonth, setZoomedMonth] = useState<string | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [animate, setAnimate] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const zoomedData = zoomedMonth
    ? generateWeekly(monthlyData.find((d) => d.month === zoomedMonth) ?? monthlyData[0])
    : null;

  const chartData = zoomedData ?? monthlyData;
  const chartLabels = zoomedData
    ? zoomedData.map((d) => d.label)
    : monthlyData.map((d) => d.month);

  // Trigger animation on data change
  useEffect(() => {
    setAnimate(false);
    const t = setTimeout(() => setAnimate(true), 60);
    return () => clearTimeout(t);
  }, [zoomedMonth]);

  // Layout
  const W = 1200;
  const H = 280;
  const PX = 60;
  const PY = 20;
  const PB = 40;

  const rawMax = Math.max(...chartData.map((d) => Math.max(d.revenue, d.projected)), 1);
  const niceMax = Math.ceil(rawMax * 1.2);
  const gridCount = 5;

  const getX = (i: number) => PX + (i / (chartData.length - 1 || 1)) * (W - PX * 2);
  const getY = (val: number) => H - PB - (val / niceMax) * (H - PY - PB);

  const revPoints = chartData.map((d, i) => `${getX(i)},${getY(d.revenue)}`).join(" ");
  const projPoints = chartData.map((d, i) => `${getX(i)},${getY(d.projected)}`).join(" ");
  const areaPath = `M ${getX(0)},${H - PB} L ${revPoints} L ${getX(chartData.length - 1)},${H - PB} Z`;

  // Smooth SVG cubic bezier path
  const smoothPath = () => {
    const pts = chartData.map((d, i) => ({ x: getX(i), y: getY(d.revenue) }));
    if (pts.length < 2) return `M ${pts[0]?.x ?? 0},${pts[0]?.y ?? 0}`;
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const cpx1 = (pts[i - 1].x + pts[i].x) / 2;
      d += ` C ${cpx1},${pts[i - 1].y} ${cpx1},${pts[i].y} ${pts[i].x},${pts[i].y}`;
    }
    return d;
  };

  const smoothAreaPath = () => {
    const pts = chartData.map((d, i) => ({ x: getX(i), y: getY(d.revenue) }));
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x},${H - PB} L ${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const cpx1 = (pts[i - 1].x + pts[i].x) / 2;
      d += ` C ${cpx1},${pts[i - 1].y} ${cpx1},${pts[i].y} ${pts[i].x},${pts[i].y}`;
    }
    d += ` L ${pts[pts.length - 1].x},${H - PB} Z`;
    return d;
  };

  const displayTotal = (totalRevenue * multiplier);
  const prevRevenue = monthlyData.length >= 2
    ? monthlyData[monthlyData.length - 2].revenue * multiplier
    : 0;
  const currentRevenue = monthlyData.length >= 1
    ? monthlyData[monthlyData.length - 1].revenue * multiplier
    : 0;
  const delta = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

  return (
    <div className="w-full select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {zoomedMonth && (
              <button
                onClick={() => { setZoomedMonth(null); setHoveredIdx(null); }}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded-md border border-border/60 bg-muted/30 cursor-pointer"
              >
                <ChevronLeft size={11} /> Monthly
              </button>
            )}
            <span className="text-xs text-muted-foreground font-medium">
              {zoomedMonth ? `${zoomedMonth} — Weekly Breakdown` : `Monthly Collected Revenue (${currency})`}
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <p className="text-2xl font-extrabold text-foreground tracking-tight">
              {formatMoney(displayTotal, symbol, isPKR)}
            </p>
            {!zoomedMonth && (
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${
                delta > 0 ? "text-emerald-400" : delta < 0 ? "text-rose-400" : "text-muted-foreground"
              }`}>
                {delta > 0 ? <ArrowUpRight size={12} /> : delta < 0 ? <ArrowDownRight size={12} /> : <Minus size={12} />}
                {Math.abs(delta).toFixed(1)}% MoM
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {zoomedMonth ? (
            <button
              onClick={() => { setZoomedMonth(null); setHoveredIdx(null); }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1.5 transition-all cursor-pointer"
            >
              <ZoomOut size={13} /> Zoom Out
            </button>
          ) : (
            <span className="text-[10px] text-muted-foreground/60 font-mono flex items-center gap-1">
              <ZoomIn size={11} /> Click any point to drill down
            </span>
          )}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F55036]" />
              <span>Actual</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground/60">
              <span className="w-4 h-px bg-muted-foreground/40 border-dashed border-t-2 border-muted-foreground/30" />
              <span>Projected</span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto max-h-[320px] overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F55036" stopOpacity="0.3" />
              <stop offset="85%" stopColor="#F55036" stopOpacity="0.03" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <clipPath id="chartClip">
              <rect x={PX} y={PY} width={W - PX * 2} height={H - PY - PB} />
            </clipPath>
          </defs>

          {/* Y-axis grid + labels */}
          {Array.from({ length: gridCount + 1 }).map((_, gi) => {
            const pct = gi / gridCount;
            const yPos = H - PB - pct * (H - PY - PB);
            const val = pct * niceMax;
            return (
              <g key={gi}>
                <line
                  x1={PX} y1={yPos}
                  x2={W - PX} y2={yPos}
                  stroke="currentColor"
                  className="text-border/50"
                  strokeWidth="0.75"
                  strokeDasharray={gi === 0 ? "none" : "3 4"}
                />
                <text
                  x={PX - 6} y={yPos + 4}
                  textAnchor="end"
                  fill="currentColor"
                  className="text-muted-foreground"
                  fontSize="10"
                  fontFamily="ui-monospace, monospace"
                >
                  {formatMoney(val * multiplier, symbol, isPKR)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={smoothAreaPath()} fill="url(#revGrad)" clipPath="url(#chartClip)" />

          {/* Projected dashed line */}
          <polyline
            fill="none"
            stroke="currentColor"
            className="text-muted-foreground/30"
            strokeWidth="1.5"
            strokeDasharray="5 4"
            points={projPoints}
            clipPath="url(#chartClip)"
          />

          {/* Actual smooth line */}
          <path
            d={smoothPath()}
            fill="none"
            stroke="#F55036"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            clipPath="url(#chartClip)"
          />

          {/* Data points & hover zones */}
          {chartData.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.revenue);
            const isHov = hoveredIdx === i;
            const prevRev = i > 0 ? chartData[i - 1].revenue : d.revenue;
            const dayDelta = prevRev > 0 ? ((d.revenue - prevRev) / prevRev) * 100 : 0;

            return (
              <g key={chartLabels[i] + i} className="cursor-pointer">
                {/* Vertical guide */}
                {isHov && (
                  <line
                    x1={cx} y1={PY}
                    x2={cx} y2={H - PB}
                    stroke="#F55036"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.5"
                  />
                )}

                {/* Outer glow ring on hover */}
                {isHov && (
                  <circle cx={cx} cy={cy} r={10} fill="#F55036" opacity="0.12" />
                )}

                {/* Dot */}
                <circle
                  cx={cx} cy={cy}
                  r={isHov ? 6 : 4}
                  fill="var(--background, #0a0a0a)"
                  stroke="#F55036"
                  strokeWidth={isHov ? 2.5 : 1.75}
                  style={{ transition: "r 0.15s ease" }}
                />

                {/* X-axis labels */}
                <text
                  x={cx} y={H - 4}
                  textAnchor="middle"
                  fill="currentColor"
                  className={isHov ? "text-[#F55036]" : "text-muted-foreground/60"}
                  fontSize="11"
                  fontWeight={isHov ? "700" : "500"}
                  fontFamily="ui-monospace, monospace"
                >
                  {chartLabels[i]}
                </text>

                {/* Hover zone */}
                <rect
                  x={cx - 28} y={0}
                  width={56} height={H}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => {
                    if (!zoomedMonth) {
                      setZoomedMonth(monthlyData[i]?.month ?? null);
                      setHoveredIdx(null);
                    }
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIdx !== null && (
          <div
            className="absolute z-30 pointer-events-none bg-card border border-border rounded-xl px-3 py-2.5 shadow-2xl text-left min-w-[130px]"
            style={{
              top: "4px",
              left: `${(getX(hoveredIdx) / W) * 100}%`,
              transform: hoveredIdx > chartData.length / 2 ? "translateX(-110%)" : "translateX(8px)",
            }}
          >
            <p className="text-[10px] text-muted-foreground font-mono mb-1 uppercase tracking-wider">
              {zoomedMonth ? `${zoomedMonth} / ` : ""}{chartLabels[hoveredIdx]}
            </p>
            <p className="text-sm font-extrabold text-foreground">
              {formatMoney(chartData[hoveredIdx].revenue * multiplier, symbol, isPKR)}
            </p>
            {chartData[hoveredIdx].projected > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Target: {formatMoney(chartData[hoveredIdx].projected * multiplier, symbol, isPKR)}
              </p>
            )}
            {chartData[hoveredIdx].revenue > 0 && (
              <p className={`text-[10px] mt-1 font-semibold flex items-center gap-0.5 ${
                chartData[hoveredIdx].revenue >= (chartData[hoveredIdx].projected || chartData[hoveredIdx].revenue)
                  ? "text-emerald-400" : "text-amber-400"
              }`}>
                {chartData[hoveredIdx].revenue >= (chartData[hoveredIdx].projected || chartData[hoveredIdx].revenue)
                  ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                vs target
              </p>
            )}
            {!zoomedMonth && (
              <p className="text-[9px] text-[#F55036] mt-1.5 font-mono flex items-center gap-1">
                <ZoomIn size={9} /> Click to zoom in
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  2.  Financial Donut  — interactive segment hover
// ═══════════════════════════════════════════════════════════════════════════════
interface BreakdownItem {
  label: string;
  amount: number;
  color: string;
  dotColor: string;
  icon: React.ReactNode;
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
  const [hovSeg, setHovSeg] = useState<string | null>(null);

  const totalUSD = paid + pending + overdue;
  const displayTotal = totalUSD * multiplier;

  const items: BreakdownItem[] = [
    { label: "Paid", amount: paid * multiplier, color: "#10B981", dotColor: "bg-emerald-500", icon: <span className="text-emerald-400">✓</span> },
    { label: "Pending", amount: pending * multiplier, color: "#F59E0B", dotColor: "bg-amber-500", icon: <span className="text-amber-400">◷</span> },
    { label: "Overdue", amount: overdue * multiplier, color: "#EF4444", dotColor: "bg-rose-500", icon: <span className="text-rose-400">!</span> },
  ];

  const size = 180;
  const strokeWidth = 18;
  const strokeHovWidth = 22;
  const center = size / 2;
  const radius = 66;
  const circumference = 2 * Math.PI * radius;

  let accPct = 0;
  const collectionRate = totalUSD > 0 ? Math.round((paid / totalUSD) * 100) : 0;

  const hovItem = items.find((it) => it.label === hovSeg);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <DollarSign size={13} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground leading-none">Invoice Settlement</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">{currency} · Live</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-extrabold text-emerald-400">{collectionRate}%</span>
          <p className="text-[10px] text-muted-foreground">collected</p>
        </div>
      </div>

      {/* Donut + Stats */}
      <div className="flex items-center gap-5">
        {/* Donut */}
        <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 110, height: 110 }}>
          <svg
            viewBox={`0 0 ${size} ${size}`}
            width={size} height={size}
            className="w-full h-full transform -rotate-90"
            style={{ overflow: "visible" }}
          >
            {/* Track */}
            <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" className="text-border/40" strokeWidth={strokeWidth} />

            {totalUSD > 0 && items.map((item) => {
              const percent = item.amount / (displayTotal || 1);
              if (percent <= 0) return null;
              const dash = percent * circumference;
              const offset = -accPct * circumference;
              accPct += percent;
              const isHov = hovSeg === item.label;
              return (
                <circle
                  key={item.label}
                  cx={center} cy={center} r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={isHov ? strokeHovWidth : strokeWidth}
                  strokeDasharray={`${dash} ${circumference}`}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-width 0.2s ease, filter 0.2s ease", filter: isHov ? `drop-shadow(0 0 6px ${item.color}88)` : "none", cursor: "pointer" }}
                  onMouseEnter={() => setHovSeg(item.label)}
                  onMouseLeave={() => setHovSeg(null)}
                />
              );
            })}
          </svg>
          {/* Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            {hovItem ? (
              <>
                <span className="text-xs font-extrabold leading-none" style={{ color: hovItem.color }}>
                  {formatMoney(hovItem.amount, symbol, isPKR)}
                </span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-wide mt-0.5">{hovItem.label}</span>
              </>
            ) : (
              <>
                <span className="text-base font-extrabold text-foreground leading-none">{collectionRate}%</span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-wide mt-0.5">Paid</span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2.5 flex-1">
          {items.map((item) => {
            const pct = displayTotal > 0 ? Math.round((item.amount / displayTotal) * 100) : 0;
            return (
              <div
                key={item.label}
                className={`rounded-lg px-2.5 py-1.5 transition-all cursor-pointer ${hovSeg === item.label ? "bg-muted/50" : "hover:bg-muted/30"}`}
                onMouseEnter={() => setHovSeg(item.label)}
                onMouseLeave={() => setHovSeg(null)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.dotColor}`} />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {formatMoney(item.amount, symbol, isPKR)}
                  </span>
                </div>
                <div className="w-full h-1 rounded-full bg-border/30 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: item.color }}
                  />
                </div>
              </div>
            );
          })}

          {/* Total */}
          <div className="flex items-center justify-between pt-1 mt-0.5 border-t border-border/60">
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Total Pipeline</span>
            <span className="text-xs font-extrabold text-foreground">{formatMoney(displayTotal, symbol, isPKR)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  3.  Inquiries Velocity  — bar chart with avg line, click to see hourly
// ═══════════════════════════════════════════════════════════════════════════════
export interface DayInquiry {
  day: string;
  date: string;
  count: number;
}

function generateHourly(dayCount: number) {
  // Proportional hourly distribution for a day
  const buckets = [
    { label: "0–4", weight: 0.05 },
    { label: "4–8", weight: 0.08 },
    { label: "8–12", weight: 0.28 },
    { label: "12–16", weight: 0.32 },
    { label: "16–20", weight: 0.18 },
    { label: "20–24", weight: 0.09 },
  ];
  const total = buckets.reduce((s, b) => s + b.weight, 0);
  return buckets.map((b) => ({
    label: b.label,
    count: Math.round((b.weight / total) * dayCount),
  }));
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
    return { day: d.toLocaleString("default", { weekday: "short" }), date: d.toISOString().split("T")[0], count: 0 };
  });

  const chartData = data.length > 0 ? data : defaultDays;
  const maxVal = Math.max(...chartData.map((d) => d.count), 1);
  const totalCount = totalThisWeek || chartData.reduce((acc, c) => acc + c.count, 0);
  const avg = totalCount / chartData.length;

  const [zoomedDay, setZoomedDay] = useState<DayInquiry | null>(null);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const displayData = zoomedDay ? generateHourly(zoomedDay.count) : null;
  const barData = displayData ?? chartData.map((d, i) => ({ label: d.day, count: d.count, orig: d }));
  const barMax = Math.max(...barData.map((d) => d.count), 1);

  // SVG grid for bar chart
  const W = 1200;
  const H = 240;
  const gridLines = 4;

  return (
    <div className="w-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {zoomedDay && (
              <button
                onClick={() => { setZoomedDay(null); setHoveredBar(null); }}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded-md border border-border/60 bg-muted/30 cursor-pointer"
              >
                <ChevronLeft size={11} /> Weekly
              </button>
            )}
            <span className="text-xs text-muted-foreground font-medium">
              {zoomedDay ? `${zoomedDay.day} (${zoomedDay.date}) — Hourly Buckets` : "Weekly Incoming Inquiries"}
            </span>
          </div>
          <p className="text-2xl font-extrabold text-foreground tracking-tight">
            {zoomedDay ? zoomedDay.count : totalCount}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              {zoomedDay ? "briefs that day" : "briefs (7D)"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {zoomedDay ? (
            <button
              onClick={() => setZoomedDay(null)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1.5 transition-all cursor-pointer"
            >
              <ZoomOut size={13} /> Zoom Out
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-sky-400">
                  <span className="w-2 h-2 rounded-sm bg-sky-500/70" />
                  <span>Count</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="w-3 h-px bg-[#F55036]" />
                  <span>Avg</span>
                </div>
              </div>
              <div className="px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs font-semibold text-sky-400">
                Avg {avg.toFixed(1)}/day
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="relative w-full">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-h-[260px] overflow-visible" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="barGradHov" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F55036" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#F55036" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Y grid lines */}
          {Array.from({ length: gridLines + 1 }).map((_, gi) => {
            const pct = gi / gridLines;
            const yPos = H * 0.05 + pct * (H * 0.7);
            const val = Math.round((1 - pct) * barMax);
            return (
              <g key={gi}>
                <line x1={30} y1={yPos} x2={W} y2={yPos} stroke="currentColor" className="text-border/40" strokeWidth="0.75" strokeDasharray="3 4" />
                <text x={25} y={yPos + 3} textAnchor="end" fill="currentColor" className="text-muted-foreground/60" fontSize="9" fontFamily="ui-monospace, monospace">{val}</text>
              </g>
            );
          })}

          {/* Average line (weekly view only) */}
          {!zoomedDay && avg > 0 && (
            <>
              <line
                x1={30} y1={H * 0.05 + ((1 - avg / barMax) * H * 0.7)}
                x2={W} y2={H * 0.05 + ((1 - avg / barMax) * H * 0.7)}
                stroke="#F55036" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7"
              />
              <text
                x={W - 2} y={H * 0.05 + ((1 - avg / barMax) * H * 0.7) - 3}
                textAnchor="end" fill="#F55036" fontSize="9" fontFamily="ui-monospace, monospace" opacity="0.9"
              >avg</text>
            </>
          )}

          {/* Bars */}
          {barData.map((item, i) => {
            const barW = (W - 60) / barData.length;
            const barX = 35 + i * barW + barW * 0.15;
            const barInnerW = barW * 0.7;
            const heightPct = item.count > 0 ? (item.count / barMax) : 0.04;
            const barH = heightPct * H * 0.7;
            const barY = H * 0.05 + H * 0.7 - barH;
            const isHov = hoveredBar === i;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
                onClick={() => {
                  if (!zoomedDay && (item as any).orig) {
                    setZoomedDay((item as any).orig);
                    setHoveredBar(null);
                  }
                }}
              >
                {/* Bar shadow */}
                {isHov && <rect x={barX - 2} y={barY - 2} width={barInnerW + 4} height={barH + 2} rx={5} fill="#F55036" opacity="0.12" />}

                {/* Bar */}
                <rect
                  x={barX} y={barY}
                  width={barInnerW} height={barH}
                  rx={4}
                  fill={isHov ? "url(#barGradHov)" : item.count > 0 ? "url(#barGrad)" : "currentColor"}
                  className={item.count === 0 ? "text-border/20" : ""}
                  style={{ transition: "fill 0.15s ease" }}
                />

                {/* Value label on bar */}
                {item.count > 0 && (
                  <text
                    x={barX + barInnerW / 2} y={barY - 4}
                    textAnchor="middle"
                    fill={isHov ? "#F55036" : "currentColor"}
                    className="text-muted-foreground"
                    fontSize="10"
                    fontWeight={isHov ? "700" : "500"}
                    fontFamily="ui-monospace, monospace"
                  >
                    {item.count}
                  </text>
                )}

                {/* X label */}
                <text
                  x={barX + barInnerW / 2}
                  y={H - 2}
                  textAnchor="middle"
                  fill={isHov ? "#F55036" : "currentColor"}
                  className="text-muted-foreground/70"
                  fontSize="10"
                  fontWeight={isHov ? "700" : "400"}
                  fontFamily="system-ui, sans-serif"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Zoom hint */}
        {!zoomedDay && (
          <div className="absolute bottom-0 right-0 text-[9px] text-muted-foreground/40 font-mono flex items-center gap-1">
            <ZoomIn size={9} /> Click bar to see hourly breakdown
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  4.  Capabilities Matrix  — stacked visual bars + mini KPI
// ═══════════════════════════════════════════════════════════════════════════════
export interface StackCapability {
  label: string;
  count: number;
  pct: number;
  color: string;
}

export function CapabilitiesMatrix({ data = [] }: { data?: StackCapability[] }) {
  const defaultCapabilities: StackCapability[] = [
    { label: "AI Agents & Autonomous Workflows", count: 0, pct: 35, color: "#F55036" },
    { label: "Next.js SaaS Platforms & Web Apps", count: 0, pct: 30, color: "#38BDF8" },
    { label: "RAG Systems & Vector Embeddings", count: 0, pct: 20, color: "#A855F7" },
    { label: "Custom API & Enterprise Pipelines", count: 0, pct: 15, color: "#10B981" },
  ];

  const items = data.length > 0 ? data : defaultCapabilities;
  const maxPct = Math.max(...items.map((i) => i.pct), 1);
  const [hovItem, setHovItem] = useState<string | null>(null);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-violet-400" />
          <h3 className="text-sm font-semibold text-foreground">Practice Area Distribution</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 font-semibold">100% Operational</span>
          <div className="flex items-center gap-1">
            {items.map((item) => (
              <span key={item.label} className="w-2 h-2 rounded-full" style={{ background: item.color }} />
            ))}
          </div>
        </div>
      </div>

      {/* Stacked proportion bar (overview) */}
      <div className="flex w-full h-2.5 rounded-full overflow-hidden mb-5 gap-0.5">
        {items.map((item) => (
          <div
            key={item.label}
            className="h-full rounded-full transition-all duration-500 cursor-pointer"
            style={{
              width: `${item.pct}%`,
              background: item.color,
              opacity: hovItem && hovItem !== item.label ? 0.35 : 1,
              filter: hovItem === item.label ? `drop-shadow(0 0 4px ${item.color}88)` : "none",
            }}
            onMouseEnter={() => setHovItem(item.label)}
            onMouseLeave={() => setHovItem(null)}
          />
        ))}
      </div>

      {/* Individual rows */}
      <div className="space-y-3.5">
        {items.map((item) => {
          const isHov = hovItem === item.label;
          return (
            <div
              key={item.label}
              className="group cursor-pointer"
              onMouseEnter={() => setHovItem(item.label)}
              onMouseLeave={() => setHovItem(null)}
            >
              <div className="flex items-center justify-between text-xs font-medium mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className={`transition-colors ${isHov ? "text-foreground" : "text-muted-foreground"}`}>
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  {item.count > 0 && (
                    <span className="text-[10px] font-mono text-muted-foreground/70">{item.count} projects</span>
                  )}
                  <span className="font-extrabold text-foreground tabular-nums" style={{ color: isHov ? item.color : undefined }}>
                    {item.pct}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-border/20 overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${item.pct}%`,
                    background: item.color,
                    opacity: hovItem && !isHov ? 0.35 : 1,
                    filter: isHov ? `drop-shadow(0 0 4px ${item.color}66)` : "none",
                  }}
                />
                {/* Relative scale ticks */}
                {[25, 50, 75].map((tick) => (
                  <div
                    key={tick}
                    className="absolute top-0 h-full w-px bg-background/60"
                    style={{ left: `${tick}%` }}
                  />
                ))}
              </div>

              {/* Mini sparkline-style sub-bar breakdown (expanded on hover) */}
              {isHov && (
                <div className="mt-1.5 flex items-center gap-1 h-1 w-full">
                  {[0.2, 0.35, 0.25, 0.2].map((seg, si) => (
                    <div
                      key={si}
                      className="h-full rounded-full transition-all"
                      style={{ width: `${seg * 100}%`, background: item.color, opacity: 0.4 + si * 0.15 }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom summary */}
      <div className="mt-5 pt-3 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <div
              className="text-sm font-extrabold"
              style={{ color: item.color }}
            >
              {item.pct}%
            </div>
            <div className="text-[10px] text-muted-foreground/70 leading-tight mt-0.5 line-clamp-1">
              {item.label.split(" ")[0]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
