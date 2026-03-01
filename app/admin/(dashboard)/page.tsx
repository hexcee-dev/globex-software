"use client";

import { useEffect, useState, useCallback } from "react";
import ShipmentOptionsList from "./ShipmentOptionsList";
import { Package, Filter } from "lucide-react";

type ShipmentRow = {
  _id: string;
  shipmentNumber: string;
  courierPartner: string;
  shipmentDate: string;
  trackingNumber: string;
  trackingUrl: string;
  currentStatus: string;
  expectedDeliveryDate: string;
  refNo?: string;
  deliveredDate?: string;
  address?: string;
  notes?: string;
  shipmentLabel?: string;
  clearanceDate?: string;
  deliveryPartnerLabel?: string;
};

type ApiResponse = {
  shipments: ShipmentRow[];
  total: number;
  page: number;
  totalPages: number;
};

type ShipmentWithProgress = {
  shipmentNumber: string;
  shipmentLabel?: string;
  clearanceDate?: string;
  deliveryPartnerLabel?: string;
  boxCount: number;
  statusCounts: Record<string, number>;
};

function groupByShipmentNumber(rows: ShipmentRow[]): ShipmentWithProgress[] {
  const map = new Map<
    string,
    { count: number; statusCounts: Record<string, number>; shipmentLabel?: string; clearanceDate?: string; deliveryPartnerLabel?: string }
  >();
  for (const r of rows) {
    const key = r.shipmentNumber.trim();
    const status = r.currentStatus?.trim() || "Unknown";
    if (!map.has(key)) {
      map.set(key, {
        count: 0,
        statusCounts: {},
        shipmentLabel: undefined,
        clearanceDate: undefined,
        deliveryPartnerLabel: undefined,
      });
    }
    const entry = map.get(key)!;
    entry.count += 1;
    entry.statusCounts[status] = (entry.statusCounts[status] ?? 0) + 1;
    if (r.shipmentLabel?.trim() && !entry.shipmentLabel) entry.shipmentLabel = r.shipmentLabel.trim();
    if (r.clearanceDate?.trim() && !entry.clearanceDate) entry.clearanceDate = r.clearanceDate.trim();
    if (r.deliveryPartnerLabel?.trim() && !entry.deliveryPartnerLabel) entry.deliveryPartnerLabel = r.deliveryPartnerLabel.trim();
  }
  return Array.from(map.entries())
    .map(([shipmentNumber, { count: boxCount, statusCounts, shipmentLabel, clearanceDate, deliveryPartnerLabel }]) => ({
      shipmentNumber,
      shipmentLabel,
      clearanceDate,
      deliveryPartnerLabel,
      boxCount,
      statusCounts,
    }))
    .sort((a, b) => a.shipmentNumber.localeCompare(b.shipmentNumber));
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [shipmentNumber, setShipmentNumber] = useState("");
  const [refNo, setRefNo] = useState("");
  const [courierPartner, setCourierPartner] = useState("");
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("pageSize", "5000");
      if (shipmentNumber) params.set("shipmentNumber", shipmentNumber);
      if (refNo) params.set("refNo", refNo);
      if (courierPartner) params.set("courierPartner", courierPartner);
      if (status) params.set("status", status);
      const res = await fetch(`/api/shipments?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json: ApiResponse = await res.json();
      setData(json);
    } catch {
      showToast("error", "Failed to load shipments");
    } finally {
      setLoading(false);
    }
  }, [shipmentNumber, refNo, courierPartner, status, showToast]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const handleClearAll = useCallback(async () => {
    if (!confirm("Clear all imported shipment data? This cannot be undone.")) return;
    try {
      const res = await fetch("/api/shipments/clear", { method: "POST" });
      if (!res.ok) throw new Error("Clear failed");
      showToast("success", "All shipment data cleared");
      fetchShipments();
    } catch {
      showToast("error", "Failed to clear data");
    }
  }, [fetchShipments, showToast]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage and track all shipments</p>
        </div>
        {data && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-admin-card border border-admin-border shadow-admin-card">
              <Package className="text-admin-accent" size={20} />
              <span className="font-semibold text-white">{data.total}</span>
              <span className="text-slate-400 text-sm">boxes</span>
              <span className="text-slate-500">in</span>
              <span className="font-semibold text-white">
                {groupByShipmentNumber(data.shipments).length}
              </span>
              <span className="text-slate-400 text-sm">shipments</span>
            </div>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-4 py-2.5 rounded-xl border border-red-500/50 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
            >
              Clear all data
            </button>
          </div>
        )}
      </div>

      <div className="bg-admin-card rounded-2xl border border-admin-border shadow-admin-card overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-admin-border bg-admin-bg/50">
          <div className="flex items-center gap-2 text-admin-accent mb-4">
            <Filter size={18} />
            <span className="font-medium text-sm uppercase tracking-wide">Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
                Ref No
              </label>
              <input
                type="text"
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                placeholder="Search by Ref No..."
                className="w-full min-h-[42px] rounded-xl border border-admin-border bg-admin-bg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
                Shipment Number
              </label>
              <input
                type="text"
                value={shipmentNumber}
                onChange={(e) => setShipmentNumber(e.target.value)}
                placeholder="Filter..."
                className="w-full min-h-[42px] rounded-xl border border-admin-border bg-admin-bg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
                Courier Partner
              </label>
              <select
                value={courierPartner}
                onChange={(e) => setCourierPartner(e.target.value)}
                className="w-full min-h-[42px] rounded-xl border border-admin-border bg-admin-bg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-admin-accent"
              >
                <option value="">All</option>
                <option value="Delhivery">Delhivery</option>
                <option value="DP World">DP World</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
                Status
              </label>
              <input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="e.g. In Transit"
                className="w-full min-h-[42px] rounded-xl border border-admin-border bg-admin-bg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => fetchShipments()}
                className="w-full sm:w-auto min-h-[42px] rounded-xl bg-admin-accent text-admin-bg px-5 py-2.5 text-sm font-semibold hover:bg-admin-accent-hover shadow-admin-glow transition-all"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-4 text-slate-400">
            <div className="w-10 h-10 border-2 border-admin-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading shipments...</p>
          </div>
        ) : data && data.shipments.length > 0 ? (
          <div className="min-h-0">
            <p className="text-sm text-slate-400 mb-3 px-4 pt-2">Click a shipment to open its details and boxes table.</p>
            <div className="max-h-[70vh] overflow-y-auto border-t border-admin-border">
              <ShipmentOptionsList shipments={groupByShipmentNumber(data.shipments)} />
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Package className="mx-auto text-slate-600 mb-3" size={48} />
            <p className="text-slate-400 font-medium">No shipments found</p>
          </div>
        )}
      </div>

      {toast && (
        <div
          className={`fixed left-4 right-4 sm:left-auto sm:right-6 bottom-6 max-w-sm rounded-xl px-4 py-3 text-sm text-white shadow-lg z-50 ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-500"
          }`}
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          role="status"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
