import { NextRequest, NextResponse } from "next/server";
import {
  updateStatus,
  updateDeliveredDate,
  updateNotes,
  deleteById,
} from "@/lib/db/shipments";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    const body = await request.json();
    const { currentStatus, deliveredDate, notes } = body;

    let updated = null;
    if (typeof currentStatus === "string" && currentStatus.trim()) {
      updated = await updateStatus(id, currentStatus.trim(), deliveredDate);
    }
    if (typeof deliveredDate === "string" && deliveredDate.trim()) {
      updated = (await updateDeliveredDate(id, deliveredDate.trim())) ?? updated;
    }
    if (notes !== undefined) {
      updated =
        (await updateNotes(id, typeof notes === "string" ? notes : String(notes))) ??
        updated;
    }
    if (!updated) {
      if (typeof currentStatus !== "string" || !currentStatus?.trim()) {
        if (notes === undefined && !deliveredDate) {
          return NextResponse.json(
            { error: "Provide currentStatus, deliveredDate, or notes" },
            { status: 400 }
          );
        }
      }
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }
    return NextResponse.json({
      ...updated,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const deleted = await deleteById(id);
    if (!deleted) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
