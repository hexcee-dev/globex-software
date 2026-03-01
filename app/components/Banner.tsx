"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ConnectUs from "./ConnectUs";

const HERO_IMAGES = ["/ship-cargo-1.jpg", "/air%20cargo-1.jpg", "/delivery-bg-1.jpg"];

export default function Banner() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = trackingNumber.trim();
    if (trimmed) router.push(`/track/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row min-h-[85vh] lg:min-h-[75vh]">
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full lg:w-1/2 order-2 lg:order-1 flex flex-col justify-center items-center px-4 py-8 sm:p-6 lg:px-12 lg:py-12 space-y-6"
      >
        <div className="text-center space-y-5 max-w-xl">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary font-serif leading-tight"
          >
            Effortless Logistics,
            <br /> Every Step of the Way.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-gray-600 text-sm sm:text-base lg:text-lg px-2"
          >
            Manage your shipments, track in real-time, and get the best rates—all from one platform.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex justify-center"
          >
            <ConnectUs />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="w-full lg:w-1/2 order-1 lg:order-2 relative min-h-[280px] sm:min-h-[340px] lg:min-h-[500px] rounded-none lg:rounded-xl overflow-hidden mx-0 lg:mx-3"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <Image
              src={HERO_IMAGES[currentImage]}
              alt="Cargo and logistics"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="absolute bottom-4 left-4 right-4 sm:left-5 sm:right-5 md:left-6 md:right-6 md:bottom-6"
        >
          <div className="bg-white/95 backdrop-blur py-4 px-4 sm:py-5 sm:px-5 rounded-xl shadow-2xl border border-white/20">
            <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-3">
              Track your courier
            </h4>
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter REF NO / Box number"
                className="flex-1 min-h-[44px] rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-0"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 min-h-[44px] bg-primary font-semibold py-3 px-5 hover:bg-primary-hover text-white rounded-xl text-sm sm:text-base transition-colors"
              >
                <span>Go Ahead</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </motion.button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
