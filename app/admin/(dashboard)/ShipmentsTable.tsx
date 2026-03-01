"use client";

type Row = {
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
};

const STATUS_OPTIONS = ["Booked", "In Transit", "Out for Delivery", "Delivered", "Recheck needed", "Cancelled"];

const today = () => new Date().toISOString().slice(0, 10);

export default function ShipmentsTable({
  shipments,
  onDelete,
  onStatusUpdate,
  onDeliveredDateChange,
}: {
  shipments: Row[];
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: string, deliveredDate?: string) => void;
  onDeliveredDateChange?: (id: string, deliveredDate: string) => void;
}) {
  const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString("en-IN") : "-");

  return (
    <>
      {/* Mobile: cards */}
      <div className="lg:hidden divide-y divide-gray-200">
        {shipments.map((s) => (
          <div
            key={s._id}
            className={`p-4 sm:p-5 transition-colors ${
              s.currentStatus === "Recheck needed"
                ? "bg-yellow-400 hover:bg-yellow-500"
                : s.currentStatus === "Delivered"
                  ? "bg-green-200 hover:bg-green-300"
                  : s.currentStatus === "Out for Delivery"
                    ? "bg-orange-200 hover:bg-orange-300"
                    : "bg-white hover:bg-gray-50/50"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {s.refNo || s.shipmentNumber}
              </span>
              <span className="text-sm text-gray-600">{s.courierPartner}</span>
            </div>
            {s.refNo && s.refNo !== s.shipmentNumber && (
              <p className="text-xs text-gray-500 mb-1">Ref: {s.refNo}</p>
            )}
            <a
              href={`/track/${encodeURIComponent(s.trackingNumber)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline block mb-3"
            >
              {s.trackingNumber}
            </a>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
              <span>Ship: {formatDate(s.shipmentDate)}</span>
              <span>Expected: {formatDate(s.expectedDeliveryDate)}</span>
            </div>
            {s.currentStatus === "Delivered" && (
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Delivered date</label>
                <input
                  type="date"
                  value={s.deliveredDate ? s.deliveredDate.slice(0, 10) : today()}
                  onChange={(e) => onDeliveredDateChange?.(s._id, e.target.value)}
                  className="min-h-[44px] rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white"
                />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={s.currentStatus}
                onChange={(e) => {
                  const v = e.target.value;
                  onStatusUpdate(s._id, v, v === "Delivered" ? today() : undefined);
                }}
                className="min-h-[44px] flex-1 min-w-[140px] rounded-xl border border-gray-300 px-3 py-2 text-gray-900 bg-white text-sm"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <a
                href={s.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] inline-flex items-center px-4 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Partner link
              </a>
              <button
                type="button"
                onClick={() => onDelete(s._id)}
                className="min-h-[44px] px-4 rounded-xl text-red-600 hover:bg-red-50 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700">Ref No</th>
              <th className="px-4 py-3 font-medium text-gray-700">Shipment #</th>
              <th className="px-4 py-3 font-medium text-gray-700">Courier</th>
              <th className="px-4 py-3 font-medium text-gray-700">Tracking #</th>
              <th className="px-4 py-3 font-medium text-gray-700">Shipment Date</th>
              <th className="px-4 py-3 font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 font-medium text-gray-700">Delivered date</th>
              <th className="px-4 py-3 font-medium text-gray-700">Expected</th>
              <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {shipments.map((s) => (
              <tr
                key={s._id}
                className={
                  s.currentStatus === "Recheck needed"
                    ? "bg-yellow-400 hover:bg-yellow-500"
                    : s.currentStatus === "Delivered"
                      ? "bg-green-200 hover:bg-green-300"
                      : s.currentStatus === "Out for Delivery"
                        ? "bg-orange-200 hover:bg-orange-300"
                        : "hover:bg-gray-50"
                }
              >
                <td className="px-4 py-3 font-medium text-gray-900">{s.refNo ?? "—"}</td>
                <td className="px-4 py-3 text-gray-900">{s.shipmentNumber}</td>
                <td className="px-4 py-3 text-gray-900">{s.courierPartner}</td>
                <td className="px-4 py-3">
                  <a
                    href={`/track/${encodeURIComponent(s.trackingNumber)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {s.trackingNumber}
                  </a>
                </td>
                <td className="px-4 py-3 text-gray-600">{formatDate(s.shipmentDate)}</td>
                <td className="px-4 py-3">
                  <select
                    value={s.currentStatus}
                    onChange={(e) => {
                      const v = e.target.value;
                      onStatusUpdate(s._id, v, v === "Delivered" ? today() : undefined);
                    }}
                    className="rounded-lg border border-gray-300 px-2 py-1.5 text-gray-900 bg-white min-h-[36px]"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  {s.currentStatus === "Delivered" ? (
                    <input
                      type="date"
                      value={s.deliveredDate ? s.deliveredDate.slice(0, 10) : today()}
                      onChange={(e) => onDeliveredDateChange?.(s._id, e.target.value)}
                      className="rounded-lg border border-gray-300 px-2 py-1.5 text-gray-900 bg-white min-h-[36px] text-sm"
                    />
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{formatDate(s.expectedDeliveryDate)}</td>
                <td className="px-4 py-3 flex gap-2">
                  <a
                    href={s.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Link
                  </a>
                  <button
                    type="button"
                    onClick={() => onDelete(s._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
