"use client";

import { motion } from "framer-motion";
import { ThemeConfig } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface NameRevealProps {
  personName: string;
  title: string;
  specialDate: string | null;
  theme: ThemeConfig;
  onNext: () => void;
}

export default function NameReveal({
  personName,
  title,
  specialDate,
  theme,
  onNext,
}: NameRevealProps) {
  const nameChars = personName.split("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-3xl"
          style={{ backgroundColor: `${theme.colors.primary}15` }}
          animate={{ scale: [1, 1.2, 1], x: [-20, 20, -20] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full blur-3xl"
          style={{ backgroundColor: `${theme.colors.secondary}15` }}
          animate={{ scale: [1.2, 1, 1.2], x: [20, -20, 20] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="relative text-center space-y-6">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl md:text-2xl font-medium"
          style={{ color: theme.colors.textMuted, fontFamily: theme.font }}
        >
          {title}
        </motion.h2>

        {/* Name - letter by letter */}
        <div className="flex flex-wrap justify-center gap-1 md:gap-2">
          {nameChars.map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 50, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                delay: 0.8 + i * 0.08,
                type: "spring",
                damping: 12,
              }}
              className="text-4xl md:text-7xl font-bold inline-block"
              style={{
                color: theme.colors.text,
                fontFamily: theme.font,
                textShadow: `0 0 40px ${theme.colors.primary}60`,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </div>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="h-0.5 w-32 mx-auto rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.colors.primary}, transparent)`,
          }}
        />

        {/* Special date */}
        {specialDate && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-lg"
            style={{ color: theme.colors.accent }}
          >
            📅 {formatDate(specialDate)}
          </motion.p>
        )}

        {/* Continue button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="mt-8 px-8 py-3 rounded-full font-medium text-lg border-2 transition-all"
          style={{
            borderColor: theme.colors.primary,
            color: theme.colors.primary,
          }}
        >
          Continue →
        </motion.button>
      </div>
    </motion.div>
  );
}
