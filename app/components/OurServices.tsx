"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Truck, Ship, MapPin, Package } from "lucide-react";

const services = [
  {
    icon: Truck,
    title: "Air Cargo",
    description:
      "Transporting critical shipments worldwide, including foodstuff, auto parts, electronics, vaccines, and high-value goods.",
  },
  {
    icon: Ship,
    title: "Sea Cargo",
    description:
      "Using container ships to cost-effectively transport large quantities of goods over long distances.",
  },
  {
    icon: MapPin,
    title: "Door-to-Door",
    description:
      "Comprehensive logistics with pickup, transport, and delivery to the customer's location.",
  },
  {
    icon: Package,
    title: "Warehousing",
    description: "Secure storage and inventory management for your goods.",
  },
];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function OurServices() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={container}
      className="mt-6 sm:mt-8 overflow-hidden"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {services.map(({ icon: Icon, title, description }) => (
          <motion.div
            key={title}
            variants={item}
            whileHover={{ y: -4 }}
            className="bg-primary text-white rounded-xl p-5 sm:p-6 text-center shadow-lg hover:shadow-xl active:scale-[0.99] transition-shadow duration-300"
          >
            <motion.div
              whileHover={{ scale: 1.08 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="mb-3 sm:mb-4"
            >
              <Icon className="mx-auto text-white" size={40} aria-hidden />
            </motion.div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">{title}</h3>
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed">{description}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
