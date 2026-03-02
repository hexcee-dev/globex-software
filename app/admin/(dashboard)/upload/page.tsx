"use client";

import { useState, useRef } from "react";
import { ClipboardPaste, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";

const COLS = [
  "refNo",
  "shipmentNumber",
  "courierPartner",
  "shipmentDate",
  "trackingNumber",
  "currentStatus",
  "expectedDeliveryDate",
  "address",
] as const;

function normalizeHeader(h: string): string {
  return h
    .replace(/\uFEFF/g, "")
    .replace(/\s+/g, "")
    .replace(/\./g, "")
    .toLowerCase();
}

/** Parse "DELHIVERY -20.02.26" or "DP WORLD - 21.02.26" → { carrier, date } */
function parseCarrierAndDate(val: string): { carrier: string; date: string } {
  const carrier = val.toUpperCase();
  let outCarrier = "";
  if (carrier.includes("DELHIVERY")) outCarrier = "Delhivery";
  else if (carrier.includes("DP WORLD")) outCarrier = "DP World";

  const match = val.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
  if (match) {
    const [, d, m, y] = match;
    const year = y.length === 2 ? `20${y}` : y;
    outCarrier = outCarrier || "Delhivery";
    return { carrier: outCarrier, date: `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}` };
  }
  return { carrier: outCarrier, date: "" };
}

function parsePaste(text: string): { rows: Record<string, string>[]; errors: string[] } {
  const errors: string[] = [];
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return { rows: [], errors: ["No data to parse."] };

  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const rawRows = lines.map((line) => line.split(delimiter).map((c) => c.trim()));

  const first = rawRows[0];
  const firstNorm = first.map((c) => normalizeHeader(c));

  const isYourFormat =
    firstNorm.some((h) => h.includes("refno") || h.includes("docket") || h.includes("carier") || h.includes("carrier")) &&
    firstNorm.some((h) => h.includes("shipment") || h.includes("docket"));

  let startIndex = 0;
  let idxRefNo = -1,
    idxCarrierDate = -1,
    idxDocketNo = -1,
    idxShipment = -1,
    idxAddress = -1;

  if (isYourFormat && first.length >= 4) {
    startIndex = 1;
    firstNorm.forEach((h, i) => {
      if (
        h.includes("refno") ||
        h === "referenceno" ||
        (h.startsWith("ref") && h.includes("no"))
      )
        idxRefNo = i;
      if (h.includes("carier") || h.includes("carrier")) idxCarrierDate = i;
      if (h.includes("docket")) idxDocketNo = i;
      if (h.includes("shipment")) idxShipment = i;
      if (h.includes("address")) idxAddress = i;
    });
    if (idxCarrierDate === -1) idxCarrierDate = 2;
    if (idxDocketNo === -1) idxDocketNo = 3;
    if (idxShipment === -1) idxShipment = first.length >= 11 ? 10 : 0;
    if (idxRefNo === -1) idxRefNo = 0;
  }

  const rows: Record<string, string>[] = [];
  for (let r = startIndex; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length < 2) continue;

    let shipmentNumber = "";
    let courierPartner = "";
    let shipmentDate = "";
    let trackingNumber = "";
    let currentStatus = "Booked";
    let expectedDeliveryDate = "";

    if (isYourFormat) {
      const carrierDateVal = row[idxCarrierDate] || "";
      const { carrier, date } = parseCarrierAndDate(carrierDateVal);
      courierPartner = carrier;
      shipmentDate = date;
      expectedDeliveryDate = date || "";
      trackingNumber = (row[idxDocketNo] || "").trim();
      shipmentNumber = (row[idxShipment] || row[idxRefNo] || "").trim();
      if (!shipmentNumber && idxRefNo >= 0) shipmentNumber = (row[idxRefNo] || "").trim();
    } else {
      const looksLikeHeader = firstNorm.some(
        (c) =>
          c.includes("shipment") || c.includes("courier") || c.includes("tracking") || c.includes("date")
      );
      if (startIndex === 0 && looksLikeHeader && r === 0) continue;
      shipmentNumber = (row[0] ?? "").trim();
      courierPartner = (row[1] ?? "").trim();
      shipmentDate = (row[2] ?? "").trim();
      trackingNumber = (row[3] ?? "").trim();
      const statusVal = (row[4] ?? "").trim();
      currentStatus = statusVal || "Booked";
      expectedDeliveryDate = (row[5] ?? row[2] ?? "").trim();
    }

    const refNoVal = isYourFormat && idxRefNo >= 0 ? (row[idxRefNo] || "").trim() : "";
    if (!trackingNumber && !refNoVal) {
      errors.push(`Row ${r + 1}: REF NO or Docket No / tracking number is required`);
      continue;
    }
    if (!shipmentDate) shipmentDate = new Date().toISOString().slice(0, 10);
    if (!expectedDeliveryDate) expectedDeliveryDate = shipmentDate;
    if (!shipmentNumber) shipmentNumber = "RAUFF AIR 110";

    const addressVal = isYourFormat && idxAddress >= 0 ? (row[idxAddress] || "").trim() : "";
    rows.push({
      shipmentNumber,
      courierPartner,
      shipmentDate,
      trackingNumber,
      currentStatus,
      expectedDeliveryDate,
      refNo: refNoVal || "",
      address: addressVal || "",
    });
  }
  return { rows, errors };
}

export default function BulkUploadPage() {
  const [pasteText, setPasteText] = useState("");
  const [parsed, setParsed] = useState<Record<string, string>[] | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ inserted?: number; errors?: string[] } | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [bulkClearanceDate, setBulkClearanceDate] = useState("");
  const [bulkShipment, setBulkShipment] = useState("");
  const [bulkShipmentName, setBulkShipmentName] = useState("");
  const [bulkDeliveryPartner, setBulkDeliveryPartner] = useState("");

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleParse = () => {
    setResult(null);
    const { rows, errors } = parsePaste(pasteText);
    setParseErrors(errors);
    setParsed(rows.length > 0 ? rows : null);
  };

  const handleImportPaste = async () => {
    if (!parsed || parsed.length === 0) return;
    setLoading(true);
    setResult(null);
    const overrides: Record<string, string> = {};
    if (bulkClearanceDate.trim()) overrides.clearanceDate = bulkClearanceDate.trim();
    if (bulkShipment.trim()) overrides.shipment = bulkShipment.trim();
    if (bulkShipmentName.trim()) overrides.shipmentName = bulkShipmentName.trim();
    if (bulkDeliveryPartner.trim()) overrides.deliveryPartner = bulkDeliveryPartner.trim();
    try {
      const res = await fetch("/api/shipments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipments: parsed, overrides: Object.keys(overrides).length > 0 ? overrides : undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Import failed");
        if (data.details?.length) setParseErrors(data.details);
        return;
      }
      setResult({ inserted: data.inserted, errors: data.errors });
      showToast("success", `${data.inserted} shipment(s) added`);
      setPasteText("");
      setParsed(null);
      setParseErrors([]);
    } catch {
      showToast("error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      showToast("error", "Please select an Excel file");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.error || "Upload failed");
        if (data.details?.length) setParseErrors(data.details);
        return;
      }
      setResult({ inserted: data.inserted, errors: data.errors });
      showToast("success", `${data.inserted} shipment(s) added`);
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      showToast("error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Bulk & Paste</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Set shipment info, then paste data from Excel. These fields apply to all rows when you import.
        </p>
      </div>

      {/* Shipment info – applied to all rows on import */}
      <div className="bg-admin-card rounded-2xl border border-admin-border shadow-admin-card overflow-hidden">
        <div className="px-5 sm:px-8 py-4 border-b border-admin-border bg-admin-bg/50">
          <h2 className="text-base font-semibold text-white">Shipment info</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Optional. When set, these values are applied to every row when you import.
          </p>
        </div>
        <div className="p-5 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
                Clearance date
              </label>
              <input
                type="date"
                value={bulkClearanceDate}
                onChange={(e) => setBulkClearanceDate(e.target.value)}
                className="w-full min-h-[42px] rounded-xl border border-admin-border px-3 py-2.5 text-sm bg-admin-bg text-slate-100 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
                Shipment
              </label>
              <input
                type="text"
                value={bulkShipment}
                onChange={(e) => setBulkShipment(e.target.value)}
                placeholder="e.g. RAUFF AIR 110"
                className="w-full min-h-[42px] rounded-xl border border-admin-border px-3 py-2.5 text-sm bg-admin-bg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
                Shipment name
              </label>
              <input
                type="text"
                value={bulkShipmentName}
                onChange={(e) => setBulkShipmentName(e.target.value)}
                placeholder="Override for all rows"
                className="w-full min-h-[42px] rounded-xl border border-admin-border px-3 py-2.5 text-sm bg-admin-bg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
                Delivery partner
              </label>
              <input
                type="text"
                value={bulkDeliveryPartner}
                onChange={(e) => setBulkDeliveryPartner(e.target.value)}
                placeholder="e.g. Delhivery, DP World"
                className="w-full min-h-[42px] rounded-xl border border-admin-border px-3 py-2.5 text-sm bg-admin-bg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Paste from Excel */}
      <div className="bg-admin-card rounded-2xl border border-admin-border shadow-admin-card overflow-hidden">
        <div className="px-5 sm:px-8 py-5 border-b border-admin-border bg-admin-bg/30">
          <div className="flex items-center gap-2 text-admin-accent">
            <ClipboardPaste size={22} />
            <span className="font-semibold">Paste data</span>
          </div>
          <p className="text-slate-400 text-sm mt-2">
            Copy your table from Excel and paste below. We support your usual format: <strong className="text-slate-300">REF NO</strong>, <strong className="text-slate-300">PCS</strong>, <strong className="text-slate-300">CARIER &amp; DATE</strong> (e.g. DELHIVERY -20.02.26), <strong className="text-slate-300">DOCKET NO</strong>, … <strong className="text-slate-300">SHIPMENT</strong> (e.g. RAUFF AIR 110), <strong className="text-slate-300">AGENT</strong>. First row = headers. Dates as DD.MM.YY.
          </p>
        </div>
        <div className="p-5 sm:p-8 space-y-4">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste your Excel data here (with headers). Tab or comma separated."
            className="w-full min-h-[180px] rounded-xl border border-admin-border px-4 py-3 text-sm font-mono bg-admin-bg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-admin-accent resize-y"
            spellCheck={false}
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleParse}
              disabled={!pasteText.trim()}
              className="min-h-[44px] px-5 rounded-xl bg-admin-border text-slate-200 font-medium hover:bg-admin-border-light hover:text-white disabled:opacity-50 transition-colors"
            >
              Parse & Preview
            </button>
            {parsed && parsed.length > 0 && (
              <button
                type="button"
                onClick={handleImportPaste}
                disabled={loading}
                className="min-h-[44px] px-5 rounded-xl bg-admin-accent text-admin-bg font-semibold hover:bg-admin-accent-hover disabled:opacity-50 shadow-admin-glow transition-all"
              >
                {loading ? "Importing..." : `Import ${parsed.length} row(s)`}
              </button>
            )}
          </div>

          {parseErrors.length > 0 && (
            <div className="rounded-xl bg-amber-500/15 border border-amber-500/40 p-4">
              <div className="flex items-center gap-2 text-amber-400 font-medium mb-2">
                <AlertCircle size={18} /> Warnings
              </div>
              <ul className="text-sm text-amber-300/90 list-disc list-inside space-y-0.5">
                {parseErrors.slice(0, 8).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {parseErrors.length > 8 && <li>... and {parseErrors.length - 8} more</li>}
              </ul>
            </div>
          )}
          {parsed && parsed.length > 0 && (
            <div className="rounded-xl border border-admin-border overflow-hidden bg-admin-bg/50">
              <div className="px-4 py-2 bg-admin-bg border-b border-admin-border text-xs font-medium text-admin-accent uppercase tracking-wide">
                Preview · {parsed.length} row(s)
              </div>
              <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-admin-card sticky top-0">
                    <tr>
                      {COLS.map((c) => (
                        <th key={c} className="px-3 py-2 text-left font-medium text-slate-400">
                          {c === "refNo" ? "REF NO" : c.replace(/([A-Z])/g, " $1").trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-admin-border">
                    {parsed.slice(0, 20).map((row, i) => (
                      <tr key={i} className="bg-admin-card/30">
                        {COLS.map((col) => (
                          <td key={col} className="px-3 py-2 text-slate-200 max-w-[140px] truncate">
                            {row[col] ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsed.length > 20 && (
                <div className="px-4 py-2 bg-admin-bg border-t border-admin-border text-xs text-slate-500">
                  Showing first 20 of {parsed.length} rows
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upload file */}
      <div className="bg-admin-card rounded-2xl border border-admin-border shadow-admin-card overflow-hidden">
        <div className="px-5 sm:px-8 py-5 border-b border-admin-border bg-admin-bg/30">
          <div className="flex items-center gap-2 text-admin-accent">
            <FileSpreadsheet size={22} />
            <span className="font-semibold">Upload Excel file</span>
          </div>
          <p className="text-slate-400 text-sm mt-2">
            Same columns required. Courier: Delhivery or DP World.
          </p>
        </div>
        <form onSubmit={handleFileSubmit} className="p-5 sm:p-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Choose file</label>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:min-h-[44px] file:px-4 file:py-2.5 file:bg-admin-accent file:text-admin-bg file:font-semibold file:hover:bg-admin-accent-hover file:cursor-pointer"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] px-5 rounded-xl bg-admin-border text-slate-200 font-medium hover:bg-admin-border-light hover:text-white disabled:opacity-50 transition-colors"
          >
            {loading ? "Uploading..." : "Upload file"}
          </button>
        </form>
      </div>

      {result && (result.inserted != null || (result.errors && result.errors.length > 0)) && (
        <div className="rounded-2xl border border-admin-border bg-admin-card p-5 shadow-admin-card">
          <div className="flex items-center gap-2 text-white font-semibold mb-2">
            <CheckCircle className="text-emerald-400" size={20} />
            Result
          </div>
          {result.inserted != null && (
            <p className="text-slate-300">Inserted: {result.inserted} row(s)</p>
          )}
          {result.errors && result.errors.length > 0 && (
            <ul className="mt-2 text-red-400 text-sm list-disc list-inside space-y-0.5">
              {result.errors.slice(0, 5).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
              {result.errors.length > 5 && <li>... and {result.errors.length - 5} more</li>}
            </ul>
          )}
        </div>
      )}

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
