"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ShipmentDetailBoxes from "../../ShipmentDetailBoxes";
import { ArrowLeft, Package } from "lucide-react";

type BoxRow = {
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
  shipments: BoxRow[];
  total: number;
  page: number;
  totalPages: number;
};

export default function ShipmentDetailPage() {
  const params = useParams();
  const shipmentNumber = typeof params.shipmentNumber === "string" ? decodeURIComponent(params.shipmentNumber) : null;

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchBoxes = useCallback(async () => {
    if (!shipmentNumber) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("pageSize", "5000");
      params.set("shipmentNumber", shipmentNumber);
      const res = await fetch(`/api/shipments?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json: ApiResponse = await res.json();
      setData(json);
    } catch {
      showToast("error", "Failed to load shipment");
    } finally {
      setLoading(false);
    }
  }, [shipmentNumber, showToast]);

  useEffect(() => {
    fetchBoxes();
  }, [fetchBoxes]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Delete this box?")) return;
      try {
        const res = await fetch(`/api/shipments/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete failed");
        showToast("success", "Box deleted");
        fetchBoxes();
      } catch {
        showToast("error", "Failed to delete");
      }
    },
    [fetchBoxes, showToast]
  );

  const handleStatusUpdate = useCallback(
    async (id: string, newStatus: string, deliveredDate?: string) => {
      try {
        const body: { currentStatus: string; deliveredDate?: string } = { currentStatus: newStatus };
        if (newStatus === "Delivered" && deliveredDate) body.deliveredDate = deliveredDate;
        const res = await fetch(`/api/shipments/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Update failed");
        showToast("success", "Status updated");
        fetchBoxes();
      } catch {
        showToast("error", "Failed to update status");
      }
    },
    [fetchBoxes, showToast]
  );

  const handleDeliveredDateChange = useCallback(
    async (id: string, deliveredDate: string) => {
      try {
        const res = await fetch(`/api/shipments/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deliveredDate }),
        });
        if (!res.ok) throw new Error("Update failed");
        showToast("success", "Delivered date updated");
        fetchBoxes();
      } catch {
        showToast("error", "Failed to update delivered date");
      }
    },
    [fetchBoxes, showToast]
  );

  const handleNotesChange = useCallback(
    async (id: string, notes: string) => {
      try {
        const res = await fetch(`/api/shipments/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes }),
        });
        if (!res.ok) throw new Error("Update failed");
        showToast("success", "Notes updated");
        fetchBoxes();
      } catch {
        showToast("error", "Failed to update notes");
      }
    },
    [fetchBoxes, showToast]
  );

  if (!shipmentNumber) {
    return (
      <div className="p-6">
        <p className="text-slate-400">Invalid shipment.</p>
        <Link href="/admin" className="text-admin-accent hover:underline mt-2 inline-block">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const boxes = data?.shipments ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-admin-accent text-sm font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="bg-admin-card rounded-2xl border border-admin-border shadow-admin-card overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-admin-border bg-admin-bg/50">
          <div className="flex flex-wrap items-center gap-2">
            <Package className="text-admin-accent" size={22} />
            <h1 className="text-xl font-bold text-white">{shipmentNumber}</h1>
            <span className="text-slate-400 text-sm">
              ({loading ? "…" : boxes.length} box{boxes.length !== 1 ? "es" : ""})
            </span>
          </div>
          {(boxes[0]?.shipmentLabel || boxes[0]?.clearanceDate || boxes[0]?.deliveryPartnerLabel) && (
            <div className="text-xs text-slate-400 mt-2 flex flex-wrap gap-x-4 gap-y-0.5">
              {boxes[0].shipmentLabel && <span>Shipment: {boxes[0].shipmentLabel}</span>}
              {boxes[0].clearanceDate && <span>Clearance date: {boxes[0].clearanceDate}</span>}
              {boxes[0].deliveryPartnerLabel && <span>Delivery partner: {boxes[0].deliveryPartnerLabel}</span>}
            </div>
          )}
          <p className="text-slate-400 text-sm mt-1">Shipment details and boxes</p>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-4 text-slate-400">
            <div className="w-10 h-10 border-2 border-admin-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading boxes...</p>
          </div>
        ) : (
          <div className="min-h-[400px]">
            <ShipmentDetailBoxes
              shipmentNumber={shipmentNumber}
              boxes={boxes}
              onStatusUpdate={handleStatusUpdate}
              onDeliveredDateChange={handleDeliveredDateChange}
              onNotesChange={handleNotesChange}
              onDelete={handleDelete}
            />
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
