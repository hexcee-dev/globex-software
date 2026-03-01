import { NextRequest, NextResponse } from "next/server";
import { list } from "@/lib/db/shipments";
import { isAuthenticated } from "@/lib/auth";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 10000;

export async function GET(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const requestedSize = parseInt(searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE), 10);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, requestedSize));
    const shipmentNumber = searchParams.get("shipmentNumber")?.trim() || "";
    const courierPartner = searchParams.get("courierPartner")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const refNo = searchParams.get("refNo")?.trim() || "";

    const result = await list({
      page,
      pageSize,
      shipmentNumber,
      courierPartner,
      status,
      refNo,
    });

    const shipments = result.shipments.map((s) => ({
      ...s,
      shipmentDate: s.shipmentDate instanceof Date ? s.shipmentDate.toISOString() : s.shipmentDate,
      expectedDeliveryDate: s.expectedDeliveryDate instanceof Date ? s.expectedDeliveryDate.toISOString() : s.expectedDeliveryDate,
      createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
      deliveredDate: s.deliveredDate != null ? (s.deliveredDate instanceof Date ? s.deliveredDate.toISOString().slice(0, 10) : s.deliveredDate) : undefined,
      shipmentLabel: s.shipmentLabel ?? undefined,
      clearanceDate: s.clearanceDate ?? undefined,
      deliveryPartnerLabel: s.deliveryPartnerLabel ?? undefined,
    }));

    return NextResponse.json({
      shipments,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
