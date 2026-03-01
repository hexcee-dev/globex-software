import { NextRequest, NextResponse } from "next/server";
import { insertMany } from "@/lib/db/shipments";
import { isAuthenticated } from "@/lib/auth";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

const COURIERS = ["Delhivery", "DP World"];

export async function POST(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buf, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    const required = [
      "shipmentNumber",
      "courierPartner",
      "shipmentDate",
      "trackingNumber",
      "currentStatus",
      "expectedDeliveryDate",
    ];
    const docs: Array<{
      shipmentNumber: string;
      courierPartner: string;
      shipmentDate: string;
      trackingNumber: string;
      currentStatus: string;
      expectedDeliveryDate: string;
    }> = [];
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const r = row as Record<string, unknown>;
      const missing = required.filter((k) => r[k] == null || String(r[k]).trim() === "");
      if (missing.length) {
        errors.push(`Row ${i + 2}: missing ${missing.join(", ")}`);
        continue;
      }
      const courier = String(r.courierPartner).trim();
      if (!COURIERS.includes(courier)) {
        errors.push(`Row ${i + 2}: courierPartner must be Delhivery or DP World`);
        continue;
      }
      docs.push({
        shipmentNumber: String(r.shipmentNumber).trim(),
        courierPartner: courier,
        shipmentDate: String(r.shipmentDate).trim(),
        trackingNumber: String(r.trackingNumber).trim(),
        currentStatus: String(r.currentStatus).trim(),
        expectedDeliveryDate: String(r.expectedDeliveryDate).trim(),
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
