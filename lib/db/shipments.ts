import mongoose, { Schema, type Model, type Document, type Types } from "mongoose";
import { getTrackingUrl } from "@/lib/auth";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "globex";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set in environment");
}

// ---------- Shipment (shipment info only) ----------
type ShipmentDoc = Document & {
  shipmentNumber: string;
  shipmentLabel?: string;
  clearanceDate?: string;
  deliveryPartnerLabel?: string;
  createdAt: Date;
};

const ShipmentSchema = new Schema<ShipmentDoc>(
  {
    shipmentNumber: { type: String, required: true, unique: true },
    shipmentLabel: { type: String },
    clearanceDate: { type: String },
    deliveryPartnerLabel: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "shipments" }
);

// ---------- Ref (box rows, linked to Shipment by shipmentId) ----------
type RefDoc = Document & {
  shipmentId: Types.ObjectId;
  shipmentNumber: string; // denormalized for filter/display
  refNo?: string;
  trackingNumber: string;
  trackingUrl: string;
  courierPartner: string;
  shipmentDate: Date;
  expectedDeliveryDate: Date;
  currentStatus: string;
  deliveredDate?: Date;
  address?: string;
  notes?: string;
  createdAt: Date;
};

const RefSchema = new Schema<RefDoc>(
  {
    shipmentId: { type: Schema.Types.ObjectId, ref: "Shipment", required: true },
    shipmentNumber: { type: String, required: true },
    refNo: { type: String },
    trackingNumber: { type: String, required: true, unique: true },
    trackingUrl: { type: String, required: true },
    courierPartner: { type: String, required: true },
    shipmentDate: { type: Date, required: true },
    expectedDeliveryDate: { type: Date, required: true },
    currentStatus: { type: String, required: true },
    deliveredDate: { type: Date },
    address: { type: String },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "refs" }
);

RefSchema.index({ shipmentId: 1 });
RefSchema.index({ refNo: 1 });
RefSchema.index({ shipmentNumber: 1 });

let ShipmentModel: Model<ShipmentDoc>;
let RefModel: Model<RefDoc>;

function ensureConnection() {
  if (mongoose.connection.readyState === 0) {
    mongoose.connect(MONGODB_URI!, { dbName: MONGODB_DB } as any);
  }
}

function getShipmentModel(): Model<ShipmentDoc> {
  if (!ShipmentModel) {
    ensureConnection();
    ShipmentModel =
      (mongoose.models.Shipment as Model<ShipmentDoc>) ||
      mongoose.model<ShipmentDoc>("Shipment", ShipmentSchema);
  }
  return ShipmentModel;
}

function getRefModel(): Model<RefDoc> {
  if (!RefModel) {
    ensureConnection();
    RefModel =
      (mongoose.models.Ref as Model<RefDoc>) ||
      mongoose.model<RefDoc>("Ref", RefSchema);
  }
  return RefModel;
}

// ---------- Public record type (one box = Ref + Shipment info merged) ----------
export type ShipmentRecord = {
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

type RefLike = {
  _id: Types.ObjectId;
  shipmentId: Types.ObjectId;
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
};

type ShipmentInfo = {
  _id: Types.ObjectId;
  clearanceDate?: string;
  shipmentLabel?: string;
  deliveryPartnerLabel?: string;
};
type ShipmentLike = ShipmentInfo | null;

function mapRefToRecord(ref: RefLike, shipment: ShipmentLike): ShipmentRecord {
  return {
    _id: ref._id.toString(),
    shipmentNumber: ref.shipmentNumber,
    courierPartner: ref.courierPartner,
    shipmentDate: ref.shipmentDate,
    trackingNumber: ref.trackingNumber,
    trackingUrl: ref.trackingUrl,
    currentStatus: ref.currentStatus,
    expectedDeliveryDate: ref.expectedDeliveryDate,
    createdAt: ref.createdAt,
    refNo: ref.refNo ?? undefined,
    deliveredDate: ref.deliveredDate ?? undefined,
    address: ref.address ?? undefined,
    notes: ref.notes ?? undefined,
    clearanceDate: shipment?.clearanceDate ?? undefined,
    shipmentLabel: shipment?.shipmentLabel ?? undefined,
    deliveryPartnerLabel: shipment?.deliveryPartnerLabel ?? undefined,
  };
}

type ListFilters = {
  page?: number;
  pageSize?: number;
  shipmentNumber?: string;
  courierPartner?: string;
  status?: string;
  refNo?: string;
};

export async function list(filters: ListFilters): Promise<{
  shipments: ShipmentRecord[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const Ref = getRefModel();
  const Shipment = getShipmentModel();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? 10;

  const query: Record<string, unknown> = {};
  if (filters.shipmentNumber) {
    query.shipmentNumber = { $regex: filters.shipmentNumber, $options: "i" };
  }
  if (filters.courierPartner) {
    query.courierPartner = filters.courierPartner;
  }
  if (filters.status) {
    query.currentStatus = filters.status;
  }
  if (filters.refNo) {
    query.refNo = { $regex: filters.refNo, $options: "i" };
  }

  const total = await Ref.countDocuments(query);
  const refs = await Ref.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean()
    .exec();

  const shipmentIds = Array.from(new Set(refs.map((r) => (r as { shipmentId: Types.ObjectId }).shipmentId)));
  const shipments = await Shipment.find({ _id: { $in: shipmentIds } })
    .lean()
    .exec();
  const shipmentMap = new Map<string, ShipmentInfo>(
    (shipments as ShipmentInfo[]).map((s) => [s._id.toString(), s])
  );

  const records: ShipmentRecord[] = refs.map((r) => {
    const refLike = r as unknown as RefLike;
    const shipment = shipmentMap.get(refLike.shipmentId.toString()) ?? null;
    return mapRefToRecord(refLike, shipment);
  });

  return {
    shipments: records,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function clearAll(): Promise<void> {
  const Ref = getRefModel();
  const Shipment = getShipmentModel();
  await Ref.deleteMany({});
  await Shipment.deleteMany({});
}

export async function getByTrackingNumber(
  trackingNumber: string
): Promise<ShipmentRecord | null> {
  const Ref = getRefModel();
  const Shipment = getShipmentModel();
  const t = trackingNumber.trim();
  if (!t) return null;
  const ref = await Ref.findOne({ trackingNumber: t }).lean().exec();
  if (!ref) return null;
  const shipment = await Shipment.findById((ref as RefLike).shipmentId).lean().exec();
  return mapRefToRecord(ref as unknown as RefLike, (shipment as ShipmentInfo) ?? null);
}

export async function findByRefNoOrTracking(
  query: string
): Promise<ShipmentRecord | null> {
  const Ref = getRefModel();
  const Shipment = getShipmentModel();
  const q = query.trim();
  if (!q) return null;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");
  const ref = await Ref.findOne({
    $or: [{ refNo: regex }, { trackingNumber: regex }],
  })
    .lean()
    .exec();
  if (!ref) return null;
  const shipment = await Shipment.findById((ref as RefLike).shipmentId).lean().exec();
  return mapRefToRecord(ref as unknown as RefLike, (shipment as ShipmentInfo) ?? null);
}

async function findOrCreateShipment(data: {
  shipmentNumber: string;
  shipmentLabel?: string;
  clearanceDate?: string;
  deliveryPartnerLabel?: string;
}): Promise<ShipmentDoc> {
  const Shipment = getShipmentModel();
  let doc = await Shipment.findOne({ shipmentNumber: data.shipmentNumber }).exec();
  if (!doc) {
    doc = await Shipment.create({
      shipmentNumber: data.shipmentNumber,
      shipmentLabel: data.shipmentLabel?.trim() || undefined,
      clearanceDate: data.clearanceDate?.trim() || undefined,
      deliveryPartnerLabel: data.deliveryPartnerLabel?.trim() || undefined,
      createdAt: new Date(),
    });
  }
  return doc;
}

export async function create(data: {
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
}): Promise<ShipmentRecord> {
  const Ref = getRefModel();
  const shipment = await findOrCreateShipment({
    shipmentNumber: data.shipmentNumber,
    shipmentLabel: data.shipmentLabel,
    clearanceDate: data.clearanceDate,
    deliveryPartnerLabel: data.deliveryPartnerLabel,
  });
  const shipmentDate = new Date(data.shipmentDate);
  const expectedDeliveryDate = new Date(data.expectedDeliveryDate);
  const trackingUrl = getTrackingUrl(data.courierPartner, data.trackingNumber);

  try {
    const ref = await Ref.create({
      shipmentId: shipment._id,
      shipmentNumber: data.shipmentNumber,
      refNo: data.refNo?.trim() || undefined,
      trackingNumber: data.trackingNumber.trim(),
      trackingUrl,
      courierPartner: data.courierPartner,
      shipmentDate,
      expectedDeliveryDate,
      currentStatus: data.currentStatus,
      createdAt: new Date(),
      address: data.address?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
    });
    return mapRefToRecord(ref as unknown as RefLike, shipment as ShipmentInfo);
  } catch (e: unknown) {
    const err = e as { code?: number };
    if (err?.code === 11000) throw err;
    throw e;
  }
}

export async function updateStatus(
  id: string,
  currentStatus: string,
  deliveredDate?: string
): Promise<ShipmentRecord | null> {
  const Ref = getRefModel();
  const Shipment = getShipmentModel();
  const update: Record<string, unknown> = { currentStatus };
  if (currentStatus === "Delivered" && deliveredDate) {
    update.deliveredDate = new Date(deliveredDate);
  }
  const ref = await Ref.findByIdAndUpdate(id, update, { new: true }).exec();
  if (!ref) return null;
  const shipment = await Shipment.findById(ref.shipmentId).lean().exec();
  return mapRefToRecord(ref as unknown as RefLike, (shipment as ShipmentInfo) ?? null);
}

export async function updateDeliveredDate(
  id: string,
  deliveredDate: string
): Promise<ShipmentRecord | null> {
  const Ref = getRefModel();
  const Shipment = getShipmentModel();
  const ref = await Ref.findByIdAndUpdate(
    id,
    { deliveredDate: new Date(deliveredDate) },
    { new: true }
  ).exec();
  if (!ref) return null;
  const shipment = await Shipment.findById(ref.shipmentId).lean().exec();
  return mapRefToRecord(ref as unknown as RefLike, (shipment as ShipmentInfo) ?? null);
}

export async function updateNotes(
  id: string,
  notes: string
): Promise<ShipmentRecord | null> {
  const Ref = getRefModel();
  const Shipment = getShipmentModel();
  const ref = await Ref.findByIdAndUpdate(
    id,
    { notes: notes?.trim() || undefined },
    { new: true }
  ).exec();
  if (!ref) return null;
  const shipment = await Shipment.findById(ref.shipmentId).lean().exec();
  return mapRefToRecord(ref as unknown as RefLike, (shipment as ShipmentInfo) ?? null);
}

export async function deleteById(id: string): Promise<boolean> {
  const Ref = getRefModel();
  const res = await Ref.findByIdAndDelete(id).exec();
  return !!res;
}

export async function insertMany(
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
): Promise<number> {
  if (rows.length === 0) return 0;
  const Ref = getRefModel();
  const first = rows[0];
  const shipment = await findOrCreateShipment({
    shipmentNumber: first.shipmentNumber,
    shipmentLabel: first.shipmentLabel,
    clearanceDate: first.clearanceDate,
    deliveryPartnerLabel: first.deliveryPartnerLabel,
  });

  let added = 0;
  for (const row of rows) {
    const trackingNumber = row.trackingNumber.trim();
    if (!trackingNumber) continue;
    const existing = await Ref.findOne({ trackingNumber }).select("_id").lean().exec();
    if (existing) continue;
    const shipmentDate = new Date(row.shipmentDate);
    const expectedDeliveryDate = new Date(row.expectedDeliveryDate);
    const trackingUrl = getTrackingUrl(row.courierPartner, trackingNumber);
    await Ref.create({
      shipmentId: shipment._id,
      shipmentNumber: row.shipmentNumber,
      refNo: row.refNo ?? undefined,
      trackingNumber,
      trackingUrl,
      courierPartner: row.courierPartner,
      shipmentDate,
      expectedDeliveryDate,
      currentStatus: row.currentStatus,
      createdAt: new Date(),
      address: row.address ?? undefined,
      notes: row.notes ?? undefined,
    });
    added++;
  }
  return added;
}
