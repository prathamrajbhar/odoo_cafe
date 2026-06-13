"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

interface KPIs {
  totalOrders: number;
  totalOrdersChange: number;
  revenue: number;
  revenueChange: number;
  avgOrder: number;
  avgOrderChange: number;
}

interface TrendPoint { time: string; revenue: number; }
interface TopCategory { name: string; revenue: number; percent: number; }
interface TopProduct { name: string; qty: number; revenue: number; }
interface TopOrder {
  orderNumber: string;
  sessionId: string;
  date: string;
  customer: string | null;
  employee: string;
  total: number;
}

interface ReportsData {
  kpis: KPIs;
  salesTrend: TrendPoint[];
  topCategories: TopCategory[];
  topProducts: TopProduct[];
  topOrders: TopOrder[];
}

interface SessionItem { id: string; openedAt: string; closedAt: string | null; openedBy: string; }
interface ProductItem { id: string; name: string; }

interface Props {
  initialData: ReportsData | null;
  employees: { id: string; name: string }[];
  sessions: SessionItem[];
  products: ProductItem[];
}

type Period = "today" | "week" | "month" | "custom";

function fmtCurrency(v: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
}

function fmtCompact(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v}`;
}

const CHART_COLORS = ["#714b67", "#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#f97316"];
const SELECT_CLS = "px-3 py-2 border border-outline-variant rounded-lg text-body-sm bg-surface focus:outline-none focus:border-primary";
const LABEL_CLS = "block text-label-sm text-on-surface-variant mb-1";

function DeltaBadge({ delta }: { delta: number }) {
  const up = delta >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${up ? "bg-[#E8F5E9] text-[#1B5E20]" : "bg-red-50 text-red-700"}`}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
        {up ? <path d="M5 2L9 8H1L5 2Z" /> : <path d="M5 8L1 2H9L5 8Z" />}
      </svg>
      {Math.abs(delta)}%
    </span>
  );
}

function Sparkline({ values, color = "#714b67" }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1);
  const W = 80; const H = 32;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * W},${H - (v / max) * H}`);
  const gid = `sg-${color.replace("#", "")}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M${pts.join(" L")} L${W},${H} L0,${H} Z`} fill={`url(#${gid})`} />
      <path d={`M${pts.join(" L")}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AreaChart({ data }: { data: TrendPoint[] }) {
  if (!data.length) return <div className="flex items-center justify-center h-full text-body-sm text-on-surface-variant/60 italic">No data</div>;
  const W = 560; const H = 260; const PL = 48; const PB = 28; const PR = 12; const PT = 12;
  const iW = W - PL - PR; const iH = H - PT - PB;
  const maxRev = Math.max(...data.map((d) => d.revenue), 1);
  const pts = data.map((d, i) => ({ x: PL + (i / Math.max(data.length - 1, 1)) * iW, y: PT + iH - (d.revenue / maxRev) * iH, d }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${(PL + iW).toFixed(1)},${(PT + iH).toFixed(1)} L${PL.toFixed(1)},${(PT + iH).toFixed(1)} Z`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ v: maxRev * f, y: PT + iH - f * iH }));
  const step = Math.max(1, Math.floor(data.length / 6));
  const xLabels = data.filter((_, i) => i % step === 0 || i === data.length - 1);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="overflow-visible">
      <defs>
        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#714b67" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#714b67" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PL} y1={t.y} x2={PL + iW} y2={t.y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
          <text x={PL - 6} y={t.y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{fmtCompact(t.v)}</text>
        </g>
      ))}
      <path d={areaPath} fill="url(#area-grad)" />
      <path d={linePath} fill="none" stroke="#714b67" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2" fill="#714b67" stroke="white" strokeWidth="1.5" />)}
      {xLabels.map((d, i) => {
        const idx = data.indexOf(d);
        const x = PL + (idx / Math.max(data.length - 1, 1)) * iW;
        return <text key={i} x={x} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">{d.time.includes(":") ? d.time : d.time.slice(5)}</text>;
      })}
      <line x1={PL} y1={PT} x2={PL} y2={PT + iH} stroke="#e5e7eb" strokeWidth="1" />
      <line x1={PL} y1={PT + iH} x2={PL + iW} y2={PT + iH} stroke="#e5e7eb" strokeWidth="1" />
    </svg>
  );
}

function DonutChart({ categories }: { categories: TopCategory[] }) {
  if (!categories.length) return <div className="flex items-center justify-center h-full text-body-sm text-on-surface-variant/60 italic">No data</div>;
  const R = 60; const CX = 80; const CY = 80; const inner = 36;
  const total = categories.reduce((s, c) => s + c.revenue, 0);
  const slices = categories.slice(0, 6).map((cat, i, arr) => {
    const pct = cat.revenue / total;
    const angle = pct * 2 * Math.PI;
    const prevPct = arr.slice(0, i).reduce((sum, c) => sum + c.revenue / total, 0);
    const sa = -Math.PI / 2 + prevPct * 2 * Math.PI;
    const ea = sa + angle;
    const large = angle > Math.PI ? 1 : 0;
    const path = `M${(CX + inner * Math.cos(sa)).toFixed(2)},${(CY + inner * Math.sin(sa)).toFixed(2)} L${(CX + R * Math.cos(sa)).toFixed(2)},${(CY + R * Math.sin(sa)).toFixed(2)} A${R},${R} 0 ${large},1 ${(CX + R * Math.cos(ea)).toFixed(2)},${(CY + R * Math.sin(ea)).toFixed(2)} L${(CX + inner * Math.cos(ea)).toFixed(2)},${(CY + inner * Math.sin(ea)).toFixed(2)} A${inner},${inner} 0 ${large},0 ${(CX + inner * Math.cos(sa)).toFixed(2)},${(CY + inner * Math.sin(sa)).toFixed(2)} Z`;
    return { path, color: CHART_COLORS[i % CHART_COLORS.length], cat, pct };
  });
  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="160" height="160" viewBox="0 0 160 160" aria-hidden="true">
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="2" />)}
        <circle cx={CX} cy={CY} r={inner - 1} fill="white" />
      </svg>
      <div className="flex flex-col gap-2 w-full">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-2 pb-1.5 border-b border-outline-variant/10 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-on-surface font-medium truncate">{s.cat.name}</span>
            </div>
            <span className="text-xs font-semibold text-on-surface-variant shrink-0">{Math.round(s.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PERIOD_LABELS: Record<Period, string> = { today: "Today", week: "Week", month: "Month", custom: "Custom" };

export const Reports: React.FC<Props> = ({ initialData, employees, sessions, products }) => {
  const [period, setPeriod] = useState<Period>("today");
  const [employeeId, setEmployeeId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [productId, setProductId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportsData | null>(initialData);
  const [showAllOrders, setShowAllOrders] = useState(false);

  const fetchReport = async (
    p: Period = period,
    eid = employeeId,
    sid = sessionId,
    pid = productId,
  ) => {
    setLoading(true);
    const params = new URLSearchParams({ period: p });
    if (eid) params.append("employeeId", eid);
    if (sid) params.append("sessionId", sid);
    if (pid) params.append("productId", pid);
    if (p === "custom" && dateFrom) params.append("from", dateFrom);
    if (p === "custom" && dateTo) params.append("to", dateTo);
    try {
      const res: any = await api.get(`/reports?${params}`);
      setData(res.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const handlePeriod = (p: Period) => {
    setPeriod(p);
    if (p !== "custom") fetchReport(p, employeeId, sessionId, productId);
  };

  const handleFilter = (field: "employee" | "session" | "product", value: string) => {
    const next = { eid: employeeId, sid: sessionId, pid: productId };
    if (field === "employee") { setEmployeeId(value); next.eid = value; }
    if (field === "session") { setSessionId(value); next.sid = value; }
    if (field === "product") { setProductId(value); next.pid = value; }
    if (period !== "custom") fetchReport(period, next.eid, next.sid, next.pid);
  };

  const clearFilters = () => {
    setEmployeeId(""); setSessionId(""); setProductId("");
    fetchReport(period, "", "", "");
  };

  const handleExport = () => {
    const params = new URLSearchParams({ period, format: "pdf" });
    if (employeeId) params.append("employeeId", employeeId);
    if (sessionId) params.append("sessionId", sessionId);
    if (productId) params.append("productId", productId);
    window.open(`/api/reports/export?${params}`, "_blank");
  };

  const kpis = data?.kpis;
  const sparklineValues = (data?.salesTrend ?? []).map((d) => d.revenue);
  const filledSparkline = sparklineValues.length > 2 ? sparklineValues : [0, 10, 8, 15, 12, 18, 20, 16, 22, 18, 25, 22];
  const activeFilters = [employeeId, sessionId, productId].filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-headline-lg text-primary font-bold">Reports & Analytics</h1>
          <p className="text-body-sm text-on-surface-variant mt-0.5">Sales performance and operational insights.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant">
            {(["today", "week", "month", "custom"] as Period[]).map((p) => (
              <button key={p} onClick={() => handlePeriod(p)}
                className={`px-3 py-1 rounded-md text-label-md font-medium transition-all ${period === p ? "bg-surface-container-lowest shadow-sm text-on-surface font-semibold" : "text-on-surface-variant hover:text-on-surface"}`}>
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-on-primary text-label-md font-semibold rounded-lg hover:opacity-90 transition-opacity">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest border border-available-border rounded-xl p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className={LABEL_CLS}>Employee</label>
            <select value={employeeId} onChange={(e) => handleFilter("employee", e.target.value)} className={SELECT_CLS}>
              <option value="">All Employees</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL_CLS}>Session</label>
            <select value={sessionId} onChange={(e) => handleFilter("session", e.target.value)} className={SELECT_CLS}>
              <option value="">All Sessions</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {new Date(s.openedAt).toLocaleDateString("en-IN")} — {s.openedBy}{s.closedAt ? "" : " (active)"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLS}>Product</label>
            <select value={productId} onChange={(e) => handleFilter("product", e.target.value)} className={SELECT_CLS}>
              <option value="">All Products</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {period === "custom" && (
            <>
              <div>
                <label className={LABEL_CLS}>From</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary bg-surface" />
              </div>
              <div>
                <label className={LABEL_CLS}>To</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 border border-outline-variant rounded-lg text-body-sm focus:outline-none focus:border-primary bg-surface" />
              </div>
              <button onClick={() => fetchReport()} disabled={loading}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md font-semibold hover:opacity-90 disabled:opacity-50">
                {loading ? "Loading…" : "Apply"}
              </button>
            </>
          )}
          {activeFilters > 0 && (
            <button onClick={clearFilters}
              className="px-3 py-2 border border-outline-variant rounded-lg text-label-sm text-on-surface-variant hover:text-on-surface hover:border-primary transition-colors">
              Clear filters ({activeFilters})
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Orders", value: String(kpis?.totalOrders ?? 0), delta: kpis?.totalOrdersChange ?? 0 },
          { label: "Revenue", value: fmtCurrency(kpis?.revenue ?? 0), delta: kpis?.revenueChange ?? 0 },
          { label: "Avg. Order Value", value: fmtCurrency(kpis?.avgOrder ?? 0), delta: kpis?.avgOrderChange ?? 0 },
        ].map((card, i) => (
          <div key={card.label} className="bg-surface-container-lowest border border-available-border rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">{card.label}</div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0 ${i === 0 ? "bg-[#714b67]" : i === 1 ? "bg-[#10b981]" : "bg-[#3b82f6]"}`}>
                {i === 0 ? "#" : i === 1 ? "₹" : "~"}
              </div>
            </div>
            <div className="text-2xl font-bold text-on-surface mb-2">{card.value}</div>
            <div className="flex items-center justify-between">
              <DeltaBadge delta={card.delta} />
              <Sparkline values={filledSparkline} color={i === 0 ? "#714b67" : i === 1 ? "#10b981" : "#3b82f6"} />
            </div>
          </div>
        ))}
      </div>

      {/* Sales Trend + Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <div className="bg-surface-container-lowest border border-available-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-label-lg font-bold text-on-surface">Sales Trend</h3>
              <p className="text-body-sm text-on-surface-variant">Revenue over time</p>
            </div>
            <span className="px-2.5 py-1 bg-surface-container rounded-lg text-label-sm text-on-surface-variant border border-outline-variant font-medium">{PERIOD_LABELS[period]}</span>
          </div>
          <div className="h-[300px] flex items-stretch">
            <AreaChart data={data?.salesTrend ?? []} />
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-available-border rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-label-lg font-bold text-on-surface">Category Distribution</h3>
            <p className="text-body-sm text-on-surface-variant">Revenue by category</p>
          </div>
          <DonutChart categories={data?.topCategories ?? []} />
        </div>
      </div>

      {/* Top Orders */}
      <div className="bg-surface-container-lowest border border-available-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-available-border flex items-center justify-between">
          <h3 className="text-label-lg font-bold text-on-surface">Top Orders</h3>
          <button onClick={() => setShowAllOrders((v) => !v)} className="text-label-sm text-secondary font-medium hover:underline">
            {showAllOrders ? "Show Less" : "View All"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead className="bg-surface-container-low border-b border-available-border">
              <tr>
                {["Order", "Session", "Point of Sale", "Date", "Customer", "Employee", "Total"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-available-border">
              {!(data?.topOrders ?? []).length ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-body-sm text-on-surface-variant/60 italic">No orders for this period</td></tr>
              ) : (
                (showAllOrders ? data!.topOrders : data!.topOrders.slice(0, 5)).map((o) => (
                  <tr key={o.orderNumber} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-4 py-3 text-body-sm font-mono font-semibold text-primary">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-body-sm text-on-surface-variant font-mono text-xs">{o.sessionId.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-body-sm text-on-surface-variant">POS Terminal</td>
                    <td className="px-4 py-3 text-body-sm text-on-surface-variant">{new Date(o.date).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 text-body-sm text-on-surface">{o.customer ?? <span className="text-on-surface-variant/50">—</span>}</td>
                    <td className="px-4 py-3 text-body-sm text-on-surface">{o.employee}</td>
                    <td className="px-4 py-3 text-body-sm font-semibold text-[#1B5E20]">{fmtCurrency(o.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest border border-available-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-available-border">
            <h3 className="text-label-lg font-bold text-on-surface">Top Products</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Qty</th>
                <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-available-border">
              {!(data?.topProducts ?? []).length ? (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-body-sm text-on-surface-variant/60 italic">No data</td></tr>
              ) : (
                data!.topProducts.slice(0, 7).map((p, i) => (
                  <tr key={p.name} className="hover:bg-surface-container-low/30">
                    <td className="px-4 py-3 text-body-sm text-on-surface flex items-center gap-2">
                      <span className="text-xs text-on-surface-variant/40 font-mono w-4">{i + 1}</span>
                      {p.name}
                    </td>
                    <td className="px-4 py-3 text-body-sm text-on-surface-variant text-right">{p.qty}</td>
                    <td className="px-4 py-3 text-body-sm font-semibold text-[#1B5E20] text-right">{fmtCurrency(p.revenue)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-surface-container-lowest border border-available-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-available-border">
            <h3 className="text-label-lg font-bold text-on-surface">Category Breakdown</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-available-border">
              {!(data?.topCategories ?? []).length ? (
                <tr><td colSpan={2} className="px-5 py-8 text-center text-body-sm text-on-surface-variant/60 italic">No data</td></tr>
              ) : (
                data!.topCategories.map((c, i) => (
                  <tr key={c.name} className="hover:bg-surface-container-low/30">
                    <td className="px-4 py-3 text-body-sm text-on-surface flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-body-sm font-semibold text-[#1B5E20] text-right">{fmtCurrency(c.revenue)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
