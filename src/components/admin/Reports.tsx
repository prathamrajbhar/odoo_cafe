"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

interface KpiData {
  totalOrders: number;
  totalOrdersDelta: number;
  revenue: number;
  revenueDelta: number;
  avgOrder: number;
  avgOrderDelta: number;
}

interface TopOrder {
  id: string;
  orderNumber: string;
  date: string;
  customer: string | null;
  employee: string;
  total: number;
}

interface TopProduct {
  name: string;
  qty: number;
  revenue: number;
}

interface TopCategory {
  name: string;
  revenue: number;
}

interface ReportsData {
  kpi: KpiData;
  topOrders: TopOrder[];
  topProducts: TopProduct[];
  topCategories: TopCategory[];
}

interface Props {
  initialData: ReportsData | null;
  employees: { id: string; name: string }[];
}

type Period = "TODAY" | "WEEK" | "MONTH" | "CUSTOM";

function fmtCurrency(v: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);
}

function DeltaBadge({ delta }: { delta: number }) {
  const positive = delta >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-label-md px-1.5 py-0.5 rounded ${
        positive ? "bg-[#E8F5E9] text-[#1B5E20]" : "bg-error-container text-error"
      }`}
    >
      <span className="material-symbols-outlined text-[14px]">
        {positive ? "trending_up" : "trending_down"}
      </span>
      {Math.abs(delta)}%
    </span>
  );
}

function MiniBarChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-0.5 h-10">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-primary/30"
          style={{ height: `${(v / max) * 100}%`, minHeight: 2 }}
        />
      ))}
    </div>
  );
}

const SPARKLINE = [12, 18, 15, 22, 19, 25, 30, 28, 35, 32, 40, 38];

export const Reports: React.FC<Props> = ({ initialData, employees }) => {
  const [period, setPeriod] = useState<Period>("TODAY");
  const [employeeId, setEmployeeId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportsData | null>(initialData);

  const fetchReport = async () => {
    setLoading(true);
    const params = new URLSearchParams({ period });
    if (employeeId) params.append("employeeId", employeeId);
    if (period === "CUSTOM" && dateFrom) params.append("from", dateFrom);
    if (period === "CUSTOM" && dateTo) params.append("to", dateTo);
    try {
      const res: any = await api.get(`/reports?${params}`);
      setData(res.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: "PDF" | "XLS") => {
    const params = new URLSearchParams({ period, format });
    window.open(`/api/reports/export?${params}`, "_blank");
  };

  const kpi = data?.kpi;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-available-border pb-5">
        <div>
          <h1 className="text-headline-lg text-primary font-bold">Reports & Analytics</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Sales performance and operational insights.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport("PDF")}
            className="flex items-center gap-1.5 px-3 py-2 border border-available-border rounded-lg text-label-md text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            PDF
          </button>
          <button
            onClick={() => handleExport("XLS")}
            className="flex items-center gap-1.5 px-3 py-2 border border-available-border rounded-lg text-label-md text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
            XLS
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-surface-container-lowest border border-available-border rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-label-md text-on-surface-variant mb-1.5">Period</label>
          <div className="flex gap-1.5">
            {(["TODAY", "WEEK", "MONTH", "CUSTOM"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded text-label-md transition-colors border ${
                  period === p
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface text-on-surface-variant border-available-border hover:bg-surface-container"
                }`}
              >
                {p.charAt(0) + p.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {period === "CUSTOM" && (
          <div className="flex gap-2 items-end">
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 border border-available-border rounded-lg text-body-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 border border-available-border rounded-lg text-body-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-label-md text-on-surface-variant mb-1.5">Employee</label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="px-3 py-2 border border-available-border rounded-lg text-body-sm bg-surface focus:outline-none focus:border-primary min-w-[140px]"
          >
            <option value="">All Employees</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchReport}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading && (
            <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
          )}
          Apply
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Orders",
            value: String(kpi?.totalOrders ?? 0),
            delta: kpi?.totalOrdersDelta ?? 0,
            icon: "receipt_long",
          },
          {
            label: "Revenue",
            value: fmtCurrency(kpi?.revenue ?? 0),
            delta: kpi?.revenueDelta ?? 0,
            icon: "payments",
          },
          {
            label: "Average Order",
            value: fmtCurrency(kpi?.avgOrder ?? 0),
            delta: kpi?.avgOrderDelta ?? 0,
            icon: "trending_up",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-surface-container-lowest border border-available-border rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-label-md text-on-surface-variant">{card.label}</div>
                <div className="text-headline-md font-bold text-on-surface mt-1">{card.value}</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">{card.icon}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <DeltaBadge delta={card.delta} />
              <span className="text-label-md text-on-surface-variant">vs prev period</span>
            </div>
            <MiniBarChart values={SPARKLINE} />
          </div>
        ))}
      </div>

      {/* Product + Category tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest border border-available-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-available-border">
            <h3 className="text-label-lg font-bold text-on-surface">Top Products</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-5 py-3 text-label-md text-on-surface-variant font-bold uppercase tracking-wide">
                  Product
                </th>
                <th className="px-5 py-3 text-label-md text-on-surface-variant font-bold uppercase tracking-wide text-right">
                  Qty
                </th>
                <th className="px-5 py-3 text-label-md text-on-surface-variant font-bold uppercase tracking-wide text-right">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-available-border">
              {(data?.topProducts ?? []).length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-body-sm text-on-surface-variant/60 italic">
                    No data for this period
                  </td>
                </tr>
              ) : (
                data!.topProducts.map((p) => (
                  <tr key={p.name} className="hover:bg-surface-container-low/30">
                    <td className="px-5 py-3 text-body-sm text-on-surface">{p.name}</td>
                    <td className="px-5 py-3 text-body-sm text-on-surface-variant text-right">{p.qty}</td>
                    <td className="px-5 py-3 text-body-sm font-medium text-[#1B5E20] text-right">
                      {fmtCurrency(p.revenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-surface-container-lowest border border-available-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-available-border">
            <h3 className="text-label-lg font-bold text-on-surface">Top Categories</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-5 py-3 text-label-md text-on-surface-variant font-bold uppercase tracking-wide">
                  Category
                </th>
                <th className="px-5 py-3 text-label-md text-on-surface-variant font-bold uppercase tracking-wide text-right">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-available-border">
              {(data?.topCategories ?? []).length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-5 py-8 text-center text-body-sm text-on-surface-variant/60 italic">
                    No data for this period
                  </td>
                </tr>
              ) : (
                data!.topCategories.map((c) => (
                  <tr key={c.name} className="hover:bg-surface-container-low/30">
                    <td className="px-5 py-3 text-body-sm text-on-surface">{c.name}</td>
                    <td className="px-5 py-3 text-body-sm font-medium text-[#1B5E20] text-right">
                      {fmtCurrency(c.revenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Orders */}
      <div className="bg-surface-container-lowest border border-available-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-available-border">
          <h3 className="text-label-lg font-bold text-on-surface">Top Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[580px]">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-5 py-3 text-label-md text-on-surface-variant font-bold uppercase tracking-wide">
                  Order #
                </th>
                <th className="px-5 py-3 text-label-md text-on-surface-variant font-bold uppercase tracking-wide">
                  Date
                </th>
                <th className="px-5 py-3 text-label-md text-on-surface-variant font-bold uppercase tracking-wide">
                  Customer
                </th>
                <th className="px-5 py-3 text-label-md text-on-surface-variant font-bold uppercase tracking-wide">
                  Employee
                </th>
                <th className="px-5 py-3 text-label-md text-on-surface-variant font-bold uppercase tracking-wide text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-available-border">
              {(data?.topOrders ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-body-sm text-on-surface-variant/60 italic">
                    No orders for this period
                  </td>
                </tr>
              ) : (
                data!.topOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-surface-container-low/30">
                    <td className="px-5 py-3 text-body-sm font-mono text-primary">{o.orderNumber}</td>
                    <td className="px-5 py-3 text-body-sm text-on-surface-variant">
                      {new Date(o.date).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-3 text-body-sm text-on-surface">{o.customer ?? "—"}</td>
                    <td className="px-5 py-3 text-body-sm text-on-surface">{o.employee}</td>
                    <td className="px-5 py-3 text-body-sm font-medium text-[#1B5E20] text-right">
                      {fmtCurrency(o.total)}
                    </td>
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
