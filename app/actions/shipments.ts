"use server";

import { findByRefNoOrTracking } from "@/lib/db/shipments";

export type TrackShipmentResult = {
  _id: string;
  shipmentNumber: string;
  courierPartner: string;
  shipmentDate: Date;
  trackingNumber: string;
  trackingUrl: string;
  currentStatus: string;
  expectedDeliveryDate: Date;
  notes?: string;
};

/** Find shipment by REF NO (box number) or tracking number; uses includes so partial match works (e.g. "54684648" matches "54684648/sdf4156465"). */
export async function getShipmentByTrackingNumber(
  refNoOrTracking: string
): Promise<TrackShipmentResult | null> {
  const doc = await findByRefNoOrTracking(refNoOrTracking);
  if (!doc) return null;
  return {
    _id: doc._id,
    shipmentNumber: doc.shipmentNumber,
    courierPartner: doc.courierPartner,
    shipmentDate: doc.shipmentDate,
    trackingNumber: doc.trackingNumber,
    trackingUrl: doc.trackingUrl,
    currentStatus: doc.currentStatus,
    expectedDeliveryDate: doc.expectedDeliveryDate,
    notes: doc.notes ?? undefined,
  };
}

/** Full shipment info for internal /check/shipment-info-with-boxNumber page. All fields, dates as ISO strings. */
export type FullShipmentInfo = {
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

export async function getFullShipmentInfoByBoxNumber(
  boxNumber: string
): Promise<FullShipmentInfo | null> {
  const doc = await findByRefNoOrTracking(boxNumber);
  if (!doc) return null;
  return {
    _id: doc._id,
    shipmentNumber: doc.shipmentNumber,
    courierPartner: doc.courierPartner,
    shipmentDate: doc.shipmentDate instanceof Date ? doc.shipmentDate.toISOString() : String(doc.shipmentDate),
    trackingNumber: doc.trackingNumber,
    trackingUrl: doc.trackingUrl,
    currentStatus: doc.currentStatus,
    expectedDeliveryDate: doc.expectedDeliveryDate instanceof Date ? doc.expectedDeliveryDate.toISOString() : String(doc.expectedDeliveryDate),
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
    refNo: doc.refNo ?? undefined,
    deliveredDate: doc.deliveredDate ? (doc.deliveredDate instanceof Date ? doc.deliveredDate.toISOString().slice(0, 10) : String(doc.deliveredDate)) : undefined,
    address: doc.address ?? undefined,
    notes: doc.notes ?? undefined,
    clearanceDate: doc.clearanceDate ?? undefined,
    shipmentLabel: doc.shipmentLabel ?? undefined,
    deliveryPartnerLabel: doc.deliveryPartnerLabel ?? undefined,
  };
}
