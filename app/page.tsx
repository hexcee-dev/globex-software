"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Truck, MapPin, Users } from "lucide-react";
import NavBar from "./components/NavBar";
import Banner from "./components/Banner";
import OurServices from "./components/OurServices";
import Footer from "./components/Footer";

const SECTION_BG_IMAGE = "/ship-2.jpg";

export default function HomePage() {
  const servicesRef = useRef<HTMLElement>(null);
  const cargoRef = useRef<HTMLElement>(null);
  const isServicesInView = useInView(servicesRef, { once: true, margin: "-60px" });
  const isCargoInView = useInView(cargoRef, { once: true, margin: "-60px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <NavBar />

      <Banner />

      {/* Our Services */}
      <motion.section
        ref={servicesRef}
        id="services"
        initial={{ opacity: 0, y: 30 }}
        animate={isServicesInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mt-10 sm:mt-16 border-t-2 border-b-0 border-gray-200 border-dotted px-4"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.98 }}
          animate={isServicesInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary pt-6 sm:pt-8 mb-3 sm:mb-4"
        >
          Our Services
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={isServicesInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto"
        >
          Reliable transportation and logistics services tailored to your business needs.
        </motion.p>
      </motion.section>

      <div className="container mx-auto px-4 sm:px-6">
        <OurServices />
      </div>

      <div className="h-8 sm:h-12" />

      {/* Professional Cargo Solutions - with static bg image */}
      <motion.main
        ref={cargoRef}
        initial="hidden"
        animate={isCargoInView ? "visible" : "hidden"}
        variants={containerVariants}
        className="relative rounded-none sm:rounded-2xl overflow-hidden flex-grow container mx-auto px-4 sm:px-6 py-8 sm:py-12 mb-8 sm:mb-10 border-0 sm:border border-gray-100 min-h-[360px] sm:min-h-[420px]"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src={SECTION_BG_IMAGE}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          <div className="absolute inset-0 bg-white/88 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10">
          <motion.section
            variants={cardVariants}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 sm:mb-4 px-2">
              Professional Cargo Solutions
            </h1>
            <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto px-2">
              Reliable transportation and logistics services tailored to your business needs.
            </p>
          </motion.section>

          <motion.section
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-10"
          >
            {[
              {
                icon: Truck,
                title: "Cargo Transport",
                text: "Efficient nationwide and international cargo transportation.",
              },
              {
                icon: MapPin,
                title: "Route Optimization",
                text: "Advanced route planning for faster, cost-effective delivery.",
              },
              {
                icon: Users,
                title: "Professional Team",
                text: "Experienced professionals dedicated to your logistics needs.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <motion.div
                key={title}
                variants={cardVariants}
                whileHover={{ y: -6 }}
                className="bg-white/95 backdrop-blur border border-gray-200 rounded-xl p-5 sm:p-6 text-center shadow-lg hover:shadow-xl active:scale-[0.99] transition-shadow duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="mb-3 sm:mb-4"
                >
                  <Icon className="mx-auto text-primary" size={44} aria-hidden />
                </motion.div>
                <h2 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">{title}</h2>
                <p className="text-gray-600 text-sm sm:text-base">{text}</p>
              </motion.div>
            ))}
          </motion.section>
        </div>
      </motion.main>

      <Footer />
    </div>
  );
}
