import { NextResponse } from "next/server";
import { clearAll } from "@/lib/db/shipments";
import { isAuthenticated } from "@/lib/auth";

export async function POST() {
  try {
    const auth = await isAuthenticated();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await clearAll();
    return NextResponse.json({ success: true, message: "All shipment data cleared." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
