"use client";

import { motion } from "framer-motion";
import { ThemeConfig } from "@/lib/types";

interface IntroScreenProps {
  personName: string;
  theme: ThemeConfig;
  onNext: () => void;
}

export default function IntroScreen({
  personName,
  theme,
  onNext,
}: IntroScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
    >
      {/* Background effects removed for cleaner look */}

      {/* Gift box */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 10, delay: 0.3 }}
        className="relative cursor-pointer mb-8"
        onClick={onNext}
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-8xl md:text-9xl select-none"
        >
          🎁
        </motion.div>

        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl -z-10"
          style={{ backgroundColor: theme.colors.primary }}
          animate={{ opacity: [0.1, 0.3, 0.1], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center space-y-3"
      >
        <p
          className="text-lg md:text-xl"
          style={{ color: theme.colors.textMuted }}
        >
          Hey{" "}
          <span className="font-bold" style={{ color: theme.colors.primary }}>
            {personName}
          </span>
          ! 👋
        </p>
        <h1
          className="text-2xl md:text-4xl font-bold"
          style={{ color: theme.colors.text, fontFamily: theme.font }}
        >
          Someone has a special surprise for you!
        </h1>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        className="mt-10 px-8 py-4 rounded-full text-lg font-bold shadow-2xl transition-all"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
          color: theme.colors.text,
          boxShadow: `0 10px 40px ${theme.colors.primary}40`,
        }}
      >
        ✨ Tap to Open
      </motion.button>

      {/* Pulse ring */}
      <motion.div
        className="absolute bottom-20 w-4 h-4 rounded-full"
        style={{ backgroundColor: theme.colors.accent }}
        animate={{
          scale: [1, 2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
}
