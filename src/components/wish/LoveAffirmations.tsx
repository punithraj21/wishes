"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeConfig } from "@/lib/types";

interface LoveAffirmationsProps {
  personName: string;
  theme: ThemeConfig;
  onNext: () => void;
}

const affirmationTemplates = [
  "You're the best friend anyone could wish for",
  "Cute, stubborn, and impossibly lovable",
  "You'll forever be the kiddo we all adore",
  "Your laughter could light up a whole sky",
  "Even when you're being a brat, you're my favorite",
  "Your stubbornness is secretly your superpower",
  "Tiny menace, biggest heart",
  "Arguing with you is weirdly the best part of my day",
  "You make ordinary days feel like magic",
  "Best friend, partner-in-crime, eternal kiddo",
];

export default function LoveAffirmations({
  personName,
  theme,
  onNext,
}: LoveAffirmationsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const affirmations = useMemo(() => affirmationTemplates, []);

  // Show affirmations one by one — slower pace so each line is comfortable to read
  useEffect(() => {
    if (currentIndex < affirmations.length) {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      // All shown, wait a beat then show the final state
      const timer = setTimeout(() => setShowAll(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, affirmations.length]);


  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden cursor-pointer"
      onClick={onNext}
    >
      {/* Soft ambient glow */}
      <motion.div
        className="absolute rounded-full blur-3xl pointer-events-none"
        style={{
          width: 350,
          height: 350,
          background: `radial-gradient(circle, ${theme.colors.accent}12, transparent)`,
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <p
          className="text-sm uppercase tracking-[0.2em] mb-2"
          style={{ color: theme.colors.textMuted }}
        >
          Dear {personName}
        </p>
        <h2
          className="text-2xl md:text-3xl font-bold"
          style={{ color: theme.colors.text, fontFamily: theme.font }}
        >
          Things you should know
        </h2>
      </motion.div>

      {/* Affirmation cards appearing one by one */}
      <div className="relative w-full max-w-sm h-48 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!showAll && currentIndex < affirmations.length && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute text-center px-8 py-6 rounded-2xl"
              style={{
                backgroundColor: `${theme.colors.surface}CC`,
                border: `1px solid ${theme.colors.primary}15`,
                backdropFilter: "blur(8px)",
                boxShadow: `0 8px 32px ${theme.colors.primary}08`,
              }}
            >
              <p
                className="text-lg md:text-xl font-medium leading-relaxed"
                style={{ color: theme.colors.text, fontFamily: theme.font }}
              >
                &ldquo;{affirmations[currentIndex]}&rdquo;
              </p>
            </motion.div>
          )}

          {showAll && (
            <motion.div
              key="final"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <p
                className="text-2xl md:text-3xl font-bold"
                style={{
                  color: theme.colors.text,
                  fontFamily: theme.font,
                }}
              >
                And so much more...
              </p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.5 }}
                className="mt-3 text-4xl"
              >
                ✨
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mt-10">
        {affirmations.map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-all duration-500"
            style={{
              backgroundColor:
                i < currentIndex
                  ? theme.colors.primary
                  : `${theme.colors.text}20`,
              transform: i < currentIndex ? "scale(1)" : "scale(0.7)",
            }}
          />
        ))}
      </div>

      {/* Tap hint */}
      <p
        className="absolute bottom-10 text-xs animate-pulse"
        style={{ color: theme.colors.textMuted, opacity: 0.4 }}
      >
        tap to continue
      </p>
    </div>
  );
}
