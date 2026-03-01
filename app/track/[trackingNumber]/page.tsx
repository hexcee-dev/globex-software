import { notFound } from "next/navigation";
import Link from "next/link";
import { getShipmentByTrackingNumber } from "@/app/actions/shipments";
import NavBar from "@/app/components/NavBar";

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

  const hasDeliveryLink = shipment.trackingUrl && shipment.trackingUrl !== "#";

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
              {hasDeliveryLink && (
                <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <dt className="text-sm text-gray-500">Delivery link</dt>
                  <dd>
                    <a
                      href={shipment.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center min-h-[44px] justify-center sm:justify-end text-primary hover:underline font-medium"
                    >
                      Open delivery link →
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
