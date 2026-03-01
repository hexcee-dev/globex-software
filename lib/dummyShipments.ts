import { getTrackingUrl } from "./auth";
import { loadFromFile, saveToFile, type SerializedShipment } from "./shipmentsStorage";

export type DummyShipment = {
  _id: string;
  shipmentNumber: string;
  courierPartner: string;
  shipmentDate: Date;
  trackingNumber: string;
  trackingUrl: string;
  currentStatus: string;
  expectedDeliveryDate: Date;
  createdAt: Date;
  refNo?: string;
  deliveredDate?: Date;
  address?: string;
  notes?: string;
  clearanceDate?: string;
  shipmentLabel?: string;
  deliveryPartnerLabel?: string;
};

function buildDoc(
  data: {
    shipmentNumber: string;
    courierPartner: string;
    shipmentDate: string | Date;
    trackingNumber: string;
    currentStatus: string;
    expectedDeliveryDate: string | Date;
    refNo?: string;
    deliveredDate?: string | Date;
    address?: string;
    notes?: string;
    clearanceDate?: string;
    shipmentLabel?: string;
    deliveryPartnerLabel?: string;
  },
  id: string,
  createdAt: Date
): DummyShipment {
  const shipmentDate = typeof data.shipmentDate === "string" ? new Date(data.shipmentDate) : data.shipmentDate;
  const expectedDeliveryDate =
    typeof data.expectedDeliveryDate === "string" ? new Date(data.expectedDeliveryDate) : data.expectedDeliveryDate;
  const trackingUrl = getTrackingUrl(data.courierPartner, data.trackingNumber);
  const deliveredDate =
    data.deliveredDate == null
      ? undefined
      : typeof data.deliveredDate === "string"
        ? new Date(data.deliveredDate)
        : data.deliveredDate;
  return {
    _id: id,
    shipmentNumber: data.shipmentNumber,
    courierPartner: data.courierPartner,
    shipmentDate,
    trackingNumber: data.trackingNumber,
    trackingUrl,
    currentStatus: data.currentStatus,
    expectedDeliveryDate,
    createdAt,
    refNo: data.refNo?.trim() || undefined,
    deliveredDate,
    address: data.address?.trim() || undefined,
    notes: data.notes?.trim() || undefined,
    clearanceDate: data.clearanceDate?.trim() || undefined,
    shipmentLabel: data.shipmentLabel?.trim() || undefined,
    deliveryPartnerLabel: data.deliveryPartnerLabel?.trim() || undefined,
  };
}

const SEED: Array<{
  shipmentNumber: string;
  courierPartner: string;
  shipmentDate: string;
  trackingNumber: string;
  currentStatus: string;
  expectedDeliveryDate: string;
}> = [
  {
    shipmentNumber: "RAUFF-AIR-110",
    courierPartner: "Delhivery",
    shipmentDate: "2026-01-13",
    trackingNumber: "295441918",
    currentStatus: "In Transit",
    expectedDeliveryDate: "2026-01-20",
  },
  {
    shipmentNumber: "RAUFF-AIR-110",
    courierPartner: "Delhivery",
    shipmentDate: "2026-01-13",
    trackingNumber: "295442039",
    currentStatus: "Delivered",
    expectedDeliveryDate: "2026-01-20",
  },
  {
    shipmentNumber: "RAUFF-AIR-110",
    courierPartner: "DP World",
    shipmentDate: "2026-01-13",
    trackingNumber: "1841402237",
    currentStatus: "Booked",
    expectedDeliveryDate: "2026-01-25",
  },
];

let idCounter = 1;
const store: DummyShipment[] = [];

function serialize(s: DummyShipment): SerializedShipment {
  return {
    ...s,
    shipmentDate: s.shipmentDate.toISOString(),
    expectedDeliveryDate: s.expectedDeliveryDate.toISOString(),
    createdAt: s.createdAt.toISOString(),
    deliveredDate: s.deliveredDate ? s.deliveredDate.toISOString().slice(0, 10) : undefined,
  };
}

function deserialize(x: SerializedShipment): DummyShipment {
  return {
    ...x,
    shipmentDate: new Date(x.shipmentDate),
    expectedDeliveryDate: new Date(x.expectedDeliveryDate),
    createdAt: new Date(x.createdAt),
    deliveredDate: x.deliveredDate ? new Date(x.deliveredDate) : undefined,
  };
}

function persist() {
  saveToFile(store.map(serialize), idCounter);
}

function init() {
  if (store.length > 0) return;
  const loaded = loadFromFile();
  if (loaded) {
    store.length = 0;
    loaded.store.forEach((x) => store.push(deserialize(x)));
    idCounter = loaded.idCounter;
    return;
  }
  const now = new Date();
  SEED.forEach((row) => {
    store.push(buildDoc(row, String(idCounter++), now));
  });
  persist();
}

/** Clears all shipments and resets idCounter. Persists empty store. */
export function clearAll(): void {
  init();
  store.length = 0;
  idCounter = 1;
  persist();
}

export function getByTrackingNumber(trackingNumber: string): DummyShipment | null {
  init();
  const t = trackingNumber.trim();
  return store.find((s) => s.trackingNumber === t) ?? null;
}

/** Find shipment by REF NO (box number) or tracking number; uses includes so "54684648" matches "54684648/sdf4156465". */
export function findByRefNoOrTracking(query: string): DummyShipment | null {
  init();
  const q = query.trim().toLowerCase();
  if (!q) return null;
  return (
    store.find(
      (s) =>
        (s.refNo != null && s.refNo.toLowerCase().includes(q)) ||
        (s.trackingNumber != null && s.trackingNumber.toLowerCase().includes(q))
    ) ?? null
  );
}

type ListFilters = {
  page?: number;
  pageSize?: number;
  shipmentNumber?: string;
  courierPartner?: string;
  status?: string;
  refNo?: string;
};

export function list(filters: ListFilters): {
  shipments: DummyShipment[];
  total: number;
  page: number;
  totalPages: number;
} {
  init();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? 10;
  let filtered = [...store];
  if (filters.shipmentNumber) {
    const re = new RegExp(filters.shipmentNumber, "i");
    filtered = filtered.filter((s) => re.test(s.shipmentNumber));
  }
  if (filters.courierPartner) {
    filtered = filtered.filter((s) => s.courierPartner === filters.courierPartner);
  }
  if (filters.status) {
    filtered = filtered.filter((s) => s.currentStatus === filters.status);
  }
  if (filters.refNo) {
    const re = new RegExp(filters.refNo, "i");
    filtered = filtered.filter((s) => (s.refNo ?? "").match(re));
  }
  filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const shipments = filtered.slice(start, start + pageSize);
  return {
    shipments,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  };
}

export function create(data: {
  shipmentNumber: string;
  courierPartner: string;
  shipmentDate: string;
  trackingNumber: string;
  currentStatus: string;
  expectedDeliveryDate: string;
  refNo?: string;
  address?: string;
  notes?: string;
  clearanceDate?: string;
  shipmentLabel?: string;
  deliveryPartnerLabel?: string;
}): DummyShipment {
  init();
  const existing = store.find((s) => s.trackingNumber === data.trackingNumber.trim());
  if (existing) {
    const err = new Error("Duplicate tracking number") as Error & { code?: number };
    err.code = 11000;
    throw err;
  }
  const now = new Date();
  const doc = buildDoc(data, String(idCounter++), now);
  store.unshift(doc);
  persist();
  return doc;
}

export function updateStatus(
  id: string,
  currentStatus: string,
  deliveredDate?: string
): DummyShipment | null {
  init();
  const idx = store.findIndex((s) => s._id === id);
  if (idx === -1) return null;
  store[idx].currentStatus = currentStatus;
  if (currentStatus === "Delivered" && deliveredDate) {
    store[idx].deliveredDate = new Date(deliveredDate);
  }
  persist();
  return store[idx];
}

export function updateDeliveredDate(id: string, deliveredDate: string): DummyShipment | null {
  init();
  const idx = store.findIndex((s) => s._id === id);
  if (idx === -1) return null;
  store[idx].deliveredDate = new Date(deliveredDate);
  persist();
  return store[idx];
}

export function updateNotes(id: string, notes: string): DummyShipment | null {
  init();
  const idx = store.findIndex((s) => s._id === id);
  if (idx === -1) return null;
  store[idx].notes = notes?.trim() || undefined;
  persist();
  return store[idx];
}

export function deleteById(id: string): boolean {
  init();
  const idx = store.findIndex((s) => s._id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  persist();
  return true;
}

export function insertMany(
  rows: Array<{
    shipmentNumber: string;
    courierPartner: string;
    shipmentDate: string;
    trackingNumber: string;
    currentStatus: string;
    expectedDeliveryDate: string;
    refNo?: string;
    address?: string;
    notes?: string;
    clearanceDate?: string;
    shipmentLabel?: string;
    deliveryPartnerLabel?: string;
  }>
): number {
  init();
  const now = new Date();
  let added = 0;
  for (const row of rows) {
    if (store.some((s) => s.trackingNumber === row.trackingNumber.trim())) continue;
    const doc = buildDoc(row, String(idCounter++), now);
    store.unshift(doc);
    added++;
  }
  if (added > 0) persist();
  return added;
}
