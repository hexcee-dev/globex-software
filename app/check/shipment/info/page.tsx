"use client";

import { useState } from "react";
import { getFullShipmentInfoByBoxNumber, type FullShipmentInfo } from "@/app/actions/shipments";

function ShipmentInfoBlock({ shipment }: { shipment: FullShipmentInfo }) {
  const rows: { label: string; value: string | undefined }[] = [
    { label: "Shipment name", value: shipment.shipmentNumber },
    { label: "Shipment (label)", value: shipment.shipmentLabel },
    { label: "Ref No / Box number", value: shipment.refNo },
    { label: "PCS", value: shipment.pcs },
    { label: "Weight", value: shipment.weight },
    { label: "Courier partner", value: shipment.courierPartner },
    { label: "Delivery partner (info)", value: shipment.deliveryPartnerLabel },
    { label: "Tracking number", value: shipment.trackingNumber },
    { label: "Tracking URL", value: shipment.trackingUrl },
    { label: "Current status", value: shipment.currentStatus },
    { label: "Shipment date", value: shipment.shipmentDate },
    { label: "Expected delivery date", value: shipment.expectedDeliveryDate },
    { label: "Delivered date", value: shipment.deliveredDate },
    { label: "Clearance date", value: shipment.clearanceDate },
    { label: "Created at", value: shipment.createdAt },
    { label: "Address", value: shipment.address },
    { label: "Notes", value: shipment.notes },
  ];

  return (
    <div className="mt-6 pt-6 border-t border-slate-700">
      <h2 className="text-sm font-semibold text-slate-400 mb-4">Shipment info</h2>
      <dl className="space-y-3 text-sm">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col sm:flex-row sm:gap-4 gap-0.5 border-b border-slate-700 pb-3"
          >
            <dt className="text-slate-500 font-medium min-w-[180px]">{label}</dt>
            <dd className="text-slate-200 break-words">
              {value != null && value !== "" ? value : "—"}
            </dd>
          </div>
        ))}
      </dl>
      {shipment.trackingUrl && shipment.trackingUrl !== "#" && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <a
            href={shipment.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            Open delivery link →
          </a>
        </div>
      )}
    </div>
  );
}

export default function CheckShipmentInfoPage() {
  const [boxNumber, setBoxNumber] = useState("");
  const [result, setResult] = useState<FullShipmentInfo | null | "loading" | "none">(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = boxNumber.trim();
    if (!trimmed) return;
    setResult("loading");
    try {
      const shipment = await getFullShipmentInfoByBoxNumber(trimmed);
      setResult(shipment ?? "none");
    } catch {
      setResult("none");
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-6 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-lg font-semibold text-slate-300 mb-4">
          Shipment info by box number
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={boxNumber}
            onChange={(e) => setBoxNumber(e.target.value)}
            placeholder="Enter box number (REF NO)"
            className="flex-1 min-h-[44px] rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={result === "loading"}
            className="min-h-[44px] px-5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium transition-colors"
          >
            {result === "loading" ? "Searching…" : "Show info"}
          </button>
        </form>

        {result === "none" && (
          <p className="mt-6 text-slate-500">No shipment found for this box number.</p>
        )}
        {result && result !== "loading" && result !== "none" && (
          <ShipmentInfoBlock shipment={result} />
        )}
      </div>
    </div>
  );
}
