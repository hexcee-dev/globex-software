import { connectDB } from "./mongodb";
import { Shipment, buildShipmentDoc } from "./shipment";

const DUMMY_DATA = [
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

export async function seedIfEmpty(): Promise<{ seeded: boolean; count: number }> {
  await connectDB();
  const count = await Shipment.countDocuments();
  if (count > 0) return { seeded: false, count };

  const docs = DUMMY_DATA.map((row) => buildShipmentDoc(row));
  await Shipment.insertMany(docs);
  return { seeded: true, count: docs.length };
}
