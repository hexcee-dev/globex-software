import { NextRequest, NextResponse } from "next/server";
import { create as createShipment } from "@/lib/db/shipments";
import { isAuthenticated } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const {
      shipmentNumber,
      courierPartner,
      shipmentDate,
      trackingNumber,
      currentStatus,
      expectedDeliveryDate,
      refNo,
      address,
    } = body;

    if (
      !shipmentNumber ||
      !courierPartner ||
      !shipmentDate ||
      !trackingNumber ||
      !currentStatus ||
      !expectedDeliveryDate
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!["Delhivery", "DP World"].includes(courierPartner)) {
      return NextResponse.json(
        { error: "Courier partner must be Delhivery or DP World" },
        { status: 400 }
      );
    }

    const created = await createShipment({
      shipmentNumber,
      courierPartner,
      shipmentDate,
      trackingNumber,
      currentStatus,
      expectedDeliveryDate,
      refNo: refNo != null ? String(refNo).trim() || undefined : undefined,
      address: address != null ? String(address).trim() || undefined : undefined,
    });

    return NextResponse.json({
      _id: created._id,
      shipmentNumber: created.shipmentNumber,
      courierPartner: created.courierPartner,
      shipmentDate: created.shipmentDate,
      trackingNumber: created.trackingNumber,
      trackingUrl: created.trackingUrl,
      currentStatus: created.currentStatus,
      expectedDeliveryDate: created.expectedDeliveryDate,
      createdAt: created.createdAt,
    });
  } catch (e: unknown) {
    const err = e as { code?: number };
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Tracking number already exists" },
        { status: 400 }
      );
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
