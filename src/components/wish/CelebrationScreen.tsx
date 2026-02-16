"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import dynamic from "next/dynamic";
import { ThemeConfig } from "@/lib/types";
import Fireworks from "./Fireworks";

// Dynamic import for Three.js to keep initial bundle small
const Fireworks3D = dynamic(() => import("./Fireworks3D"), {
  ssr: false,
  loading: () => null,
});

interface CelebrationScreenProps {
  personName: string;
  theme: ThemeConfig;
  onReplay: () => void;
}

export default function CelebrationScreen({
  personName,
  theme,
  onReplay,
}: CelebrationScreenProps) {
  const hasLaunched = useRef(false);

  const launchConfetti = useCallback(() => {
    const duration = 4000;
    const end = Date.now() + duration;
    const colors = [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.accent,
      "#FFD700",
      "#FF69B4",
    ];

    // Initial burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });

    // Continuous confetti
    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
    }, 150);

    return () => clearInterval(interval);
  }, [theme.colors.primary, theme.colors.secondary, theme.colors.accent]);

  useEffect(() => {
    if (!hasLaunched.current) {
      hasLaunched.current = true;
      launchConfetti();
    }
  }, [launchConfetti]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `A special wish for ${personName}!`,
        url: window.location.href,
      });
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied!");
      } catch {
        // Fallback
      }
    }
  };

  const fireworkColors = [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.accent,
    "#FFD700",
    "#FF69B4",
    "#00E5FF",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* Three.js 3D Fireworks (background) */}
      <Fireworks3D colors={fireworkColors} />

      {/* CSS Fireworks (mid-layer) */}
      <Fireworks theme={theme} />

      {/* Main content */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 10, delay: 0.3 }}
        className="text-center space-y-6 relative z-10"
      >
        {/* Emoji burst */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-7xl md:text-8xl"
        >
          🎉
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-3xl md:text-5xl font-bold"
          style={{
            fontFamily: theme.font,
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Happy Wishes, {personName}!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-lg md:text-xl"
          style={{ color: theme.colors.textMuted }}
        >
          You are truly special! ❤️
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReplay}
            className="px-6 py-3 rounded-full font-medium border-2 transition-all"
            style={{
              borderColor: theme.colors.primary,
              color: theme.colors.primary,
            }}
          >
            🔄 Replay Experience
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="px-6 py-3 rounded-full font-medium transition-all"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              color: theme.colors.text,
            }}
          >
            🔗 Share This Wish
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 text-sm z-10"
        style={{ color: `${theme.colors.textMuted}80` }}
      >
        Made with ❤️ using Wishes Platform
      </motion.p>
    </motion.div>
  );
}
