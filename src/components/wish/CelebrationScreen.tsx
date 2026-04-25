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
}

export default function CelebrationScreen({
  personName,
  theme,
}: CelebrationScreenProps) {
  const hasLaunched = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const launchConfetti = useCallback(() => {
    if (!canvasRef.current) return;

    const myConfetti = confetti.create(canvasRef.current, {
      resize: true,
      useWorker: true,
    });

    const duration = 5000;
    const end = Date.now() + duration;
    const colors = [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.accent,
      "#FFD700",
      "#FF69B4",
    ];

    // Big initial burst
    myConfetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors,
    });

    // Continuous confetti from sides
    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }

      myConfetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      myConfetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
    }, 120);

    return () => clearInterval(interval);
  }, [theme.colors.primary, theme.colors.secondary, theme.colors.accent]);

  useEffect(() => {
    if (!hasLaunched.current && canvasRef.current) {
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
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
    >
      {/* Dedicated Confetti Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-20"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Three.js 3D Fireworks (background) */}
      <Fireworks3D colors={fireworkColors} />

      {/* CSS Fireworks (mid-layer) */}
      <Fireworks theme={theme} />

      {/* Large pulsing glow behind text */}
      <motion.div
        className="absolute pointer-events-none rounded-full blur-3xl"
        style={{
          width: 400,
          height: 400,
          background: `radial-gradient(circle, ${theme.colors.primary}18, transparent)`,
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Main content */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 10, delay: 0.3 }}
        className="text-center space-y-6 relative z-10"
      >
        {/* Shimmer gradient title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-3xl md:text-6xl font-bold relative"
          style={{
            fontFamily: theme.font,
            background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.accent}, ${theme.colors.primary})`,
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 3s linear infinite",
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
          You are loved beyond measure ❤️
        </motion.p>

        {/* Action button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex justify-center pt-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="px-6 py-3 rounded-full font-medium transition-all"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              color: theme.colors.text,
              boxShadow: `0 8px 30px ${theme.colors.primary}30`,
            }}
          >
            Share This Wish
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
        Made with ❤️
      </motion.p>

      {/* CSS shimmer keyframe */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </motion.div>
  );
}
