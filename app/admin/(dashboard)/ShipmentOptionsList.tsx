"use client";

import Link from "next/link";

const STATUS_ORDER = [
  "Delivered",
  "Out for Delivery",
  "In Transit",
  "Recheck needed",
  "Booked",
  "Cancelled",
  "Unknown",
];

export type ShipmentOption = {
  shipmentNumber: string;
  shipmentLabel?: string;
  clearanceDate?: string;
  deliveryPartnerLabel?: string;
  boxCount: number;
  statusCounts: Record<string, number>;
};

export default function ShipmentOptionsList({
  shipments,
}: {
  shipments: ShipmentOption[];
}) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-shrink-0 px-4 py-3 border-b border-admin-border bg-admin-bg/30">
        <p className="text-xs font-semibold text-admin-accent uppercase tracking-wider">
          Shipments ({shipments.length})
        </p>
      </div>
      <ul className="flex-1 overflow-y-auto min-h-0 divide-y divide-admin-border">
        {shipments.map((s) => {
          const total = s.boxCount;
          const ordered = STATUS_ORDER.filter((status) => (s.statusCounts[status] ?? 0) > 0);
          const rest = Object.keys(s.statusCounts).filter((k) => !STATUS_ORDER.includes(k)).sort();
          const statusLines = [...ordered, ...rest]
            .filter((status) => (s.statusCounts[status] ?? 0) > 0)
            .map((status) => `${status}: ${s.statusCounts[status]}/${total}`);
          return (
            <li key={s.shipmentNumber}>
              <Link
                href={`/admin/shipments/${encodeURIComponent(s.shipmentNumber)}`}
                className="block w-full text-left px-4 py-3 transition-all border-l-2 border-transparent hover:bg-white/5 hover:border-admin-accent/50"
              >
                <div className="text-[10px] font-semibold text-admin-accent/80 uppercase tracking-wide mb-1">
                  Shipment info
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-slate-200">
                  <span><span className="text-slate-500">Shipment name:</span> <span className="font-medium text-white">{s.shipmentNumber}</span></span>
                  <span><span className="text-slate-500">Shipment:</span> <span>{s.shipmentLabel || "—"}</span></span>
                  <span><span className="text-slate-500">Clearance date:</span> <span>{s.clearanceDate || "—"}</span></span>
                  <span><span className="text-slate-500">Delivery partner:</span> <span>{s.deliveryPartnerLabel || "—"}</span></span>
                </div>
                <div className="text-xs text-slate-500 mt-1.5">
                  {s.boxCount} box{s.boxCount !== 1 ? "es" : ""} inside
                </div>
                {statusLines.length > 0 && (
                  <div className="text-xs text-slate-400 mt-1.5 space-y-0.5">
                    {statusLines.map((line) => (
                      <div key={line} className="truncate">
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
