import { NextRequest, NextResponse } from "next/server";
import { insertMany } from "@/lib/db/shipments";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

type ShipmentRow = {
  shipmentNumber: string;
  courierPartner: string;
  shipmentDate: string;
  trackingNumber: string;
  currentStatus: string;
  expectedDeliveryDate: string;
  refNo?: string;
  address?: string;
  clearanceDate?: string;
  shipmentLabel?: string;
  deliveryPartnerLabel?: string;
};

const DEFAULT_DATE = new Date().toISOString().slice(0, 10);

type BulkOverrides = {
  clearanceDate?: string;
  shipment?: string;
  shipmentName?: string;
  deliveryPartner?: string;
};

export async function POST(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const rows = body.shipments as unknown[];
    const overrides = (body.overrides ?? {}) as BulkOverrides;
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "shipments array is required and must not be empty" },
        { status: 400 }
      );
    }

    const docs: ShipmentRow[] = [];
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] as Record<string, unknown>;
      if (!r || typeof r !== "object") {
        errors.push(`Row ${i + 1}: invalid row`);
        continue;
      }
      let refNo = r.refNo != null ? String(r.refNo).trim() || undefined : undefined;
      let trackingRaw = r.trackingNumber != null ? String(r.trackingNumber).trim() : "";
      if (trackingRaw.toUpperCase() === "HOLD") trackingRaw = "";
      if (!trackingRaw && !refNo) {
        refNo = "Third party";
      }
      let shipmentNumber = (overrides.shipmentName?.trim() || String(r.shipmentNumber ?? "").trim()) || "Unknown";
      const courierPartner = String(r.courierPartner ?? "").trim();
      const shipmentDate = String(r.shipmentDate ?? "").trim() || DEFAULT_DATE;
      const expectedDeliveryDate = String(r.expectedDeliveryDate ?? "").trim() || shipmentDate;
      const currentStatus = String(r.currentStatus ?? "").trim() || "Booked";
      const trackingNumber = trackingRaw || (refNo ? `REF:${refNo}:${i}` : "");
      const deliveryPartnerLabel = overrides.deliveryPartner != null && String(overrides.deliveryPartner).trim() !== "" ? String(overrides.deliveryPartner).trim() : undefined;
      docs.push({
        shipmentNumber,
        courierPartner,
        shipmentDate,
        trackingNumber,
        currentStatus,
        expectedDeliveryDate,
        refNo,
        address: r.address != null ? String(r.address).trim() || undefined : undefined,
        clearanceDate: overrides.clearanceDate != null && String(overrides.clearanceDate).trim() ? String(overrides.clearanceDate).trim() : (r.clearanceDate != null ? String(r.clearanceDate).trim() || undefined : undefined),
        shipmentLabel: overrides.shipment != null && String(overrides.shipment).trim() ? String(overrides.shipment).trim() : (r.shipmentLabel != null ? String(r.shipmentLabel).trim() || undefined : undefined),
        deliveryPartnerLabel,
      });
    }

    if (docs.length === 0) {
      return NextResponse.json(
        { error: "No valid rows to insert", details: errors },
        { status: 400 }
      );
    }

    const inserted = await insertMany(docs);
    return NextResponse.json({
      success: true,
      inserted,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
