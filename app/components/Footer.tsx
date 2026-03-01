import Link from "next/link";
import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="space-y-3">
            <h3 className="font-semibold text-white text-lg">Services</h3>
            <ul className="space-y-2 text-gray-300">
              <li><span className="block py-1">Ground Shipping</span></li>
              <li><span className="block py-1">Air Freight</span></li>
              <li><span className="block py-1">Sea Freight</span></li>
              <li><span className="block py-1">Storage &amp; Packaging</span></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-white text-lg">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/" className="block py-2 pr-4 -ml-2 rounded-lg hover:bg-gray-700 hover:text-white transition-colors touch-target-inline min-h-[44px] flex items-center">
                  Track Shipment
                </Link>
              </li>
              <li>
                <Link href="/admin" className="block py-2 pr-4 -ml-2 rounded-lg hover:bg-gray-700 hover:text-white transition-colors touch-target-inline min-h-[44px] flex items-center">
                  Admin
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-white text-lg">Contact</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Globex Courier and Logistics
              <br />
              Wbb business space, 60/60E, 3rd floor, JC Champer, Panampilly Nagar, Kochi, Kerala, 682036
            </p>
            <p className="text-gray-300 text-sm">Phone: 8086884456 / 7237860313</p>
            <a
              href="mailto:iglobexindia@gmail.com"
              className="inline-block mt-1 text-gray-300 hover:text-white hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 rounded"
            >
              iglobexindia@gmail.com
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left order-2 md:order-1">
              Sign up for updates about new offers and discounts.
            </p>
            <form className="flex flex-col sm:flex-row gap-2 sm:items-center w-full md:w-auto max-w-md order-1 md:order-2">
              <input
                type="email"
                placeholder="Email Address"
                className="flex-1 min-h-[44px] px-4 py-3 rounded-xl bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary min-w-0"
              />
              <button
                type="submit"
                className="min-h-[44px] px-5 py-3 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shrink-0"
              >
                <Mail size={20} /> Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
}
