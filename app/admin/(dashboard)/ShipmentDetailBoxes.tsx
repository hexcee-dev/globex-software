"use client";

import { useState, useCallback } from "react";

const STATUS_OPTIONS = ["Booked", "In Transit", "Out for Delivery", "Delivered", "Recheck needed", "Cancelled"];
const COURIER_OPTIONS = ["", "Delhivery", "DP World", "Delhi Swift", "Speedway", "Other"];
const today = () => new Date().toISOString().slice(0, 10);

type Box = {
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
};

export default function ShipmentDetailBoxes({
  shipmentNumber,
  boxes,
  onStatusUpdate,
  onDeliveredDateChange,
  onNotesChange,
  onTrackingCourierChange,
  onDelete,
}: {
  shipmentNumber: string | null;
  boxes: Box[];
  onStatusUpdate: (id: string, status: string, deliveredDate?: string) => void;
  onDeliveredDateChange: (id: string, deliveredDate: string) => void;
  onNotesChange: (id: string, notes: string) => void;
  onTrackingCourierChange: (id: string, data: { trackingNumber?: string; courierPartner?: string }) => void;
  onDelete: (id: string) => void;
}) {
  const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");
  const isPlaceholderTracking = (tracking: string) => !tracking || tracking.startsWith("REF:");
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [editingTracking, setEditingTracking] = useState<Record<string, string>>({});
  const [editingCourier, setEditingCourier] = useState<Record<string, string>>({});

  const notesValue = useCallback(
    (box: Box) => editingNotes[box._id] ?? box.notes ?? "",
    [editingNotes]
  );
  const setNotesValue = useCallback((boxId: string, value: string) => {
    setEditingNotes((prev) => (value === "" ? (() => { const next = { ...prev }; delete next[boxId]; return next; })() : { ...prev, [boxId]: value }));
  }, []);
  const handleNotesBlur = useCallback(
    (box: Box) => {
      const value = editingNotes[box._id] ?? box.notes ?? "";
      if (value !== (box.notes ?? "")) onNotesChange(box._id, value);
      setEditingNotes((prev) => { const next = { ...prev }; delete next[box._id]; return next; });
    },
    [editingNotes, onNotesChange]
  );

  const trackingDisplayValue = useCallback(
    (box: Box) => editingTracking[box._id] ?? (isPlaceholderTracking(box.trackingNumber) ? "" : box.trackingNumber),
    [editingTracking]
  );
  const courierDisplayValue = useCallback(
    (box: Box) => editingCourier[box._id] ?? box.courierPartner ?? "",
    [editingCourier]
  );
  const handleTrackingBlur = useCallback(
    (box: Box) => {
      const value = (editingTracking[box._id] ?? "").trim();
      const current = isPlaceholderTracking(box.trackingNumber) ? "" : box.trackingNumber;
      if (value !== current) onTrackingCourierChange(box._id, { trackingNumber: value || undefined });
      setEditingTracking((prev) => { const next = { ...prev }; delete next[box._id]; return next; });
    },
    [editingTracking, onTrackingCourierChange]
  );
  const handleCourierBlur = useCallback(
    (box: Box) => {
      const value = (editingCourier[box._id] ?? box.courierPartner ?? "").trim();
      if (value !== (box.courierPartner ?? "")) onTrackingCourierChange(box._id, { courierPartner: value });
      setEditingCourier((prev) => { const next = { ...prev }; delete next[box._id]; return next; });
    },
    [editingCourier, onTrackingCourierChange]
  );

  if (!shipmentNumber) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[280px] text-slate-400 p-6">
        <p className="text-sm font-medium">Select a shipment</p>
        <p className="text-xs mt-1">Click a shipment (e.g. AIR 1) to see its boxes inside</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-shrink-0 px-4 py-3 border-b border-admin-border bg-admin-bg/50">
        <h2 className="text-sm font-semibold text-white">
          {shipmentNumber} <span className="text-slate-400 font-normal">({boxes.length} boxes)</span>
        </h2>
      </div>
      {boxes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <p className="text-sm font-medium">No boxes in this shipment</p>
        </div>
      ) : (
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-admin-bg/80 sticky top-0 z-10 border-b border-admin-border">
            <tr>
              <th className="px-3 py-2.5 font-medium text-slate-400 border-b border-admin-border">Ref No</th>
              <th className="px-3 py-2.5 font-medium text-slate-400 border-b border-admin-border">Tracking #</th>
              <th className="px-3 py-2.5 font-medium text-slate-400 border-b border-admin-border">Address</th>
              <th className="px-3 py-2.5 font-medium text-slate-400 border-b border-admin-border">Courier</th>
              <th className="px-3 py-2.5 font-medium text-slate-400 border-b border-admin-border">Ship date</th>
              <th className="px-3 py-2.5 font-medium text-slate-400 border-b border-admin-border">Expected</th>
              <th className="px-3 py-2.5 font-medium text-slate-400 border-b border-admin-border">Notes</th>
              <th className="px-3 py-2.5 font-medium text-slate-400 border-b border-admin-border">Status</th>
              <th className="px-3 py-2.5 font-medium text-slate-400 border-b border-admin-border">Delivered date</th>
              <th className="px-3 py-2.5 font-medium text-slate-400 border-b border-admin-border">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {boxes.map((box) => (
              <tr
                key={box._id}
                className={
                  box.currentStatus === "Recheck needed"
                    ? "bg-amber-500/25 hover:bg-amber-500/35 text-amber-950"
                    : box.currentStatus === "Delivered"
                      ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-50"
                      : box.currentStatus === "Out for Delivery"
                        ? "bg-orange-500/25 hover:bg-orange-500/35 text-orange-50"
                        : "bg-admin-card/50 hover:bg-white/5 text-slate-200"
                }
              >
                <td className="px-3 py-2.5 font-medium">{box.refNo ?? "—"}</td>
                <td className="px-3 py-2.5">
                  <input
                    type="text"
                    value={trackingDisplayValue(box)}
                    onChange={(e) => setEditingTracking((prev) => ({ ...prev, [box._id]: e.target.value }))}
                    onBlur={() => handleTrackingBlur(box)}
                    placeholder="Tracking #"
                    className="w-full min-w-[100px] max-w-[180px] rounded border border-admin-border px-2 py-1 text-sm bg-admin-bg text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-admin-accent"
                  />
                </td>
                <td className="px-3 py-2.5 min-w-[180px] max-w-[320px] whitespace-normal align-top opacity-90">{box.address ?? "—"}</td>
                <td className="px-3 py-2.5">
                  <select
                    value={courierDisplayValue(box)}
                    onChange={(e) => setEditingCourier((prev) => ({ ...prev, [box._id]: e.target.value }))}
                    onBlur={() => handleCourierBlur(box)}
                    className="rounded border border-admin-border px-2 py-1 text-sm bg-admin-bg text-slate-100 min-w-[110px] focus:ring-1 focus:ring-admin-accent"
                  >
                    {COURIER_OPTIONS.map((opt) => (
                      <option key={opt || "_empty"} value={opt}>
                        {opt || "—"}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2.5 opacity-90">{formatDate(box.shipmentDate)}</td>
                <td className="px-3 py-2.5 opacity-90">{formatDate(box.expectedDeliveryDate)}</td>
                <td className="px-3 py-2.5 align-top">
                  <input
                    type="text"
                    value={notesValue(box)}
                    onChange={(e) => setNotesValue(box._id, e.target.value)}
                    onBlur={() => handleNotesBlur(box)}
                    placeholder="Add notes..."
                    className="w-full min-w-[120px] max-w-[200px] rounded border border-admin-border px-2 py-1 text-sm bg-admin-bg text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-admin-accent"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <select
                    value={box.currentStatus}
                    onChange={(e) => {
                      const v = e.target.value;
                      onStatusUpdate(box._id, v, v === "Delivered" ? today() : undefined);
                    }}
                    className="rounded border border-admin-border px-2 py-1 text-sm bg-admin-bg text-slate-100 min-w-[120px] focus:ring-1 focus:ring-admin-accent"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2.5">
                  {box.currentStatus === "Delivered" ? (
                    <input
                      type="date"
                      value={box.deliveredDate ? box.deliveredDate.slice(0, 10) : today()}
                      onChange={(e) => onDeliveredDateChange(box._id, e.target.value)}
                      className="rounded border border-admin-border px-2 py-1 text-sm bg-admin-bg text-slate-100"
                    />
                  ) : (
                    <span className="opacity-70">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    {box.trackingUrl && box.trackingUrl !== "#" && (
                      <a
                        href={box.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-admin-accent hover:underline text-xs"
                      >
                        Link
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => onDelete(box._id)}
                      className="text-red-400 hover:text-red-300 hover:underline text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
