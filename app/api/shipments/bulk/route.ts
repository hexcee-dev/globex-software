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
    const requiredExceptTracking = [
      "shipmentNumber",
      "courierPartner",
      "shipmentDate",
      "currentStatus",
      "expectedDeliveryDate",
    ] as const;

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] as Record<string, unknown>;
      if (!r || typeof r !== "object") {
        errors.push(`Row ${i + 1}: invalid row`);
        continue;
      }
      const missing = requiredExceptTracking.filter((k) => r[k] == null || String(r[k]).trim() === "");
      if (missing.length) {
        errors.push(`Row ${i + 1}: missing ${missing.join(", ")}`);
        continue;
      }
      const refNo = r.refNo != null ? String(r.refNo).trim() || undefined : undefined;
      const trackingRaw = r.trackingNumber != null ? String(r.trackingNumber).trim() : "";
      if (!trackingRaw && !refNo) {
        errors.push(`Row ${i + 1}: tracking number or REF NO (box number) is required`);
        continue;
      }
      let shipmentNumber = String(r.shipmentNumber).trim();
      const courierPartner = String(r.courierPartner ?? "").trim();
      if (overrides.shipmentName?.trim()) shipmentNumber = overrides.shipmentName.trim();
      const trackingNumber = trackingRaw || (refNo ? `REF:${refNo}:${i}` : "");
      const deliveryPartnerLabel = overrides.deliveryPartner != null && String(overrides.deliveryPartner).trim() !== "" ? String(overrides.deliveryPartner).trim() : undefined;
      docs.push({
        shipmentNumber,
        courierPartner,
        shipmentDate: String(r.shipmentDate).trim(),
        trackingNumber,
        currentStatus: String(r.currentStatus).trim(),
        expectedDeliveryDate: String(r.expectedDeliveryDate).trim(),
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
