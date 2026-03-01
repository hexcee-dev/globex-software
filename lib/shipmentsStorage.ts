/**
 * File-based persistence for shipments (code-level storage).
 * Data is kept in memory and also saved to data/shipments.json so imports survive restarts.
 */

import { getTrackingUrl } from "./auth";

export type SerializedShipment = {
  _id: string;
  shipmentNumber: string;
  courierPartner: string;
  shipmentDate: string;
  trackingNumber: string;
  trackingUrl: string;
  currentStatus: string;
  expectedDeliveryDate: string;
  createdAt: string;
  refNo?: string;
  deliveredDate?: string;
  address?: string;
  notes?: string;
  clearanceDate?: string;
  shipmentLabel?: string;
  deliveryPartnerLabel?: string;
};

const STORAGE_DIR = "data";
const STORAGE_FILE = "shipments.json";

function getFilePath(): string {
  if (typeof process === "undefined" || !process.cwd) return "";
  const path = require("path");
  return path.join(process.cwd(), STORAGE_DIR, STORAGE_FILE);
}

export function loadFromFile(): { store: SerializedShipment[]; idCounter: number } | null {
  try {
    const fs = require("fs");
    const filePath = getFilePath();
    if (!filePath) return null;
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw) as { store: SerializedShipment[]; idCounter: number };
    if (Array.isArray(data.store) && typeof data.idCounter === "number") {
      return { store: data.store, idCounter: data.idCounter };
    }
  } catch {
    // no file or invalid
  }
  return null;
}

export function saveToFile(store: SerializedShipment[], idCounter: number): void {
  try {
    const fs = require("fs");
    const path = require("path");
    const filePath = getFilePath();
    if (!filePath) return;
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      filePath,
      JSON.stringify({ store, idCounter }, null, 2),
      "utf8"
    );
  } catch (e) {
    console.error("[shipmentsStorage] save failed:", e);
  }
}
