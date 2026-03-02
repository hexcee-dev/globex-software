import mongoose from "mongoose";
import { getTrackingUrl } from "./auth";

export interface IShipment {
  _id?: mongoose.Types.ObjectId;
  shipmentNumber: string;
  courierPartner: string;
  shipmentDate: Date;
  trackingNumber: string;
  trackingUrl: string;
  currentStatus: string;
  expectedDeliveryDate: Date;
  createdAt: Date;
}

const shipmentSchema = new mongoose.Schema<IShipment>(
  {
    shipmentNumber: { type: String, required: true },
    courierPartner: { type: String, required: false },
    shipmentDate: { type: Date, required: true },
    trackingNumber: { type: String, required: true, unique: true },
    trackingUrl: { type: String, required: true },
    currentStatus: { type: String, required: true },
    expectedDeliveryDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

shipmentSchema.index({ trackingNumber: 1 }, { unique: true });
shipmentSchema.index({ shipmentNumber: 1 });

export const Shipment =
  mongoose.models.Shipment || mongoose.model<IShipment>("Shipment", shipmentSchema);

export function buildShipmentDoc(data: {
  shipmentNumber: string;
  courierPartner: string;
  shipmentDate: Date | string;
  trackingNumber: string;
  currentStatus: string;
  expectedDeliveryDate: Date | string;
}): Omit<IShipment, "_id" | "createdAt"> & { createdAt?: Date } {
  const trackingUrl = getTrackingUrl(data.courierPartner, data.trackingNumber);
  return {
    shipmentNumber: data.shipmentNumber,
    courierPartner: data.courierPartner,
    shipmentDate: typeof data.shipmentDate === "string" ? new Date(data.shipmentDate) : data.shipmentDate,
    trackingNumber: data.trackingNumber,
    trackingUrl,
    currentStatus: data.currentStatus,
    expectedDeliveryDate:
      typeof data.expectedDeliveryDate === "string"
        ? new Date(data.expectedDeliveryDate)
        : data.expectedDeliveryDate,
    createdAt: new Date(),
  };
}
