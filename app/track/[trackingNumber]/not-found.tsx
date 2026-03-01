import Link from "next/link";
import NavBar from "@/app/components/NavBar";
import { PackageX } from "lucide-react";

export default function TrackNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 text-gray-500 mb-6">
            <PackageX size={32} />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
            Shipment Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            We couldn&apos;t find a shipment with that tracking number. Please check and try again.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
