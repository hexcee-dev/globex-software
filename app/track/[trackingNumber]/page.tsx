import { notFound } from "next/navigation";
import Link from "next/link";
import { getShipmentByTrackingNumber } from "@/app/actions/shipments";
import NavBar from "@/app/components/NavBar";

const WHATSAPP_NUMBER = "918086884456";
const WHATSAPP_TRACKING_MSG = "Hi, I need help tracking my box. ";

function formatDate(d: Date | string): string {
  if (typeof d === "string") return d.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ trackingNumber: string }>;
}) {
  const { trackingNumber } = await params;
  const shipment = await getShipmentByTrackingNumber(
    decodeURIComponent(trackingNumber)
  );

  if (!shipment) {
    notFound();
  }

  const hasTrackingUrl = shipment.trackingUrl && shipment.trackingUrl !== "#";
  const hasDocket = shipment.trackingNumber && !shipment.trackingNumber.startsWith("REF:");
  const showStatus =
    shipment.currentStatus === "Delivered" ||
    shipment.currentStatus === "Out for Delivery";
  const showWhatsApp = !hasTrackingUrl || !hasDocket;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <main className="flex-1 py-6 sm:py-10 px-4 sm:px-6">
        <div className="max-w-xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary mb-6 min-h-[44px]"
          >
            ← Back to home
          </Link>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50/80">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
                Shipment Details
              </h1>
            </div>
            <dl className="divide-y divide-gray-200">
              <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <dt className="text-sm text-gray-500">Courier</dt>
                <dd className="font-medium text-gray-900 text-base sm:text-right break-words">
                  {shipment.courierPartner || "—"}
                </dd>
              </div>
              <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <dt className="text-sm text-gray-500">Ship date</dt>
                <dd className="font-medium text-gray-900 text-base sm:text-right">
                  {formatDate(shipment.shipmentDate)}
                </dd>
              </div>
              {showStatus && (
                <>
                  <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <dt className="text-sm text-gray-500">Status</dt>
                    <dd className="font-medium text-gray-900 text-base sm:text-right">
                      {shipment.currentStatus}
                    </dd>
                  </div>
                  {shipment.currentStatus === "Delivered" &&
                    shipment.deliveredDate && (
                      <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                        <dt className="text-sm text-gray-500">
                          Delivered on
                        </dt>
                        <dd className="font-medium text-gray-900 text-base sm:text-right">
                          {formatDate(shipment.deliveredDate)}
                        </dd>
                      </div>
                    )}
                </>
              )}
              {hasTrackingUrl && (
                <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <dt className="text-sm text-gray-500">Tracking link</dt>
                  <dd>
                    <a
                      href={shipment.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center min-h-[44px] justify-center sm:justify-end text-primary hover:underline font-medium"
                    >
                      Open tracking link →
                    </a>
                  </dd>
                </div>
              )}
              {showWhatsApp && (
                <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <dt className="text-sm text-gray-500">Tracking help</dt>
                  <dd>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TRACKING_MSG)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 min-h-[44px] justify-center sm:justify-end px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium text-sm"
                    >
                      <span className="inline-block w-5 h-5 text-center leading-5" aria-hidden>💬</span>
                      Contact us on WhatsApp for tracking
                    </a>
                  </dd>
                </div>
              )}
              <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <dt className="text-sm text-gray-500">Shipment name</dt>
                <dd className="font-medium text-gray-900 text-base sm:text-right break-words">
                  {shipment.shipmentNumber}
                </dd>
              </div>
              {shipment.notes?.trim() && (
                <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <dt className="text-sm text-gray-500">Notes</dt>
                  <dd className="font-medium text-gray-900 text-base sm:text-right break-words">
                    {shipment.notes.trim()}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}
