"use client";

import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";

export default function ConnectUs() {
  const whatsappNumber = "+918086884456";
  const emailAddress = "iglobexindia@gmail.com";

  const openWhatsApp = () => {
    window.open(`https://wa.me/${whatsappNumber.replace(/\+/g, "")}`, "_blank");
  };

  const openEmail = () => {
    window.location.href = `mailto:${emailAddress}`;
  };

  return (
    <div className="container pt-3 mx-auto text-center px-2">
      <h2 className="text-lg sm:text-xl font-bold text-primary mb-3">Connect With Us</h2>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
        <motion.button
          type="button"
          onClick={openEmail}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2 min-h-[44px] px-5 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl transition-colors duration-300 text-sm font-medium w-full sm:w-auto"
        >
          <Mail size={20} />
          Email Us
        </motion.button>
        <motion.button
          type="button"
          onClick={openWhatsApp}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2 min-h-[44px] px-5 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl transition-colors duration-300 text-sm font-medium w-full sm:w-auto"
        >
          <Send size={20} />
          WhatsApp
        </motion.button>
      </div>
      <p className="text-primary text-xs mt-2">Quick support at your fingertips</p>
    </div>
  );
}
