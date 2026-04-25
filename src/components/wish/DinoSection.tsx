"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ThemeConfig } from "@/lib/types";
import Image from "next/image";

interface DinoSectionProps {
  personName: string;
  theme: ThemeConfig;
  onNext: () => void;
}

// Colorful confetti dots
const dots = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 4 + Math.random() * 6,
  color: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#FF69B4", "#7C4DFF", "#00E5FF", "#76FF03"][i % 7],
  delay: Math.random() * 3,
}));

export default function DinoSection({
  personName,
  theme,
  onNext,
}: DinoSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden cursor-pointer"
      style={{ backgroundColor: "#1a1118" }}
      onClick={onNext}
    >
      {/* Animated confetti dots */}
      {mounted &&
        dots.map((dot) => (
          <motion.div
            key={dot.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: dot.size,
              height: dot.size,
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              backgroundColor: dot.color,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: dot.delay,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        ))}

      {/* Dino image — fits fully within screen */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 80 }}
        className="absolute inset-0 flex items-center justify-center p-6 pb-32"
      >
        <div className="relative w-full h-full max-w-lg">
          <Image
            src="/dinosar.png"
            alt="Birthday dinosaur"
            fill
            className="object-contain"
            priority
          />
        </div>
      </motion.div>

      {/* Bottom gradient for text readability */}
      <div
        className="absolute inset-x-0 bottom-0 h-40 z-10 pointer-events-none"
        style={{ background: "linear-gradient(transparent, rgba(26,17,24,0.9))" }}
      />

      {/* Fun text overlay at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-20 left-0 right-0 text-center z-20"
      >
        <p
          className="text-xl md:text-2xl font-bold px-4"
          style={{
            background: "linear-gradient(90deg, #FF6B6B, #FFE66D, #4ECDC4, #7C4DFF, #FF69B4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {personName}, you&apos;re gettin&apos; older & cooler!
        </p>
      </motion.div>

      {/* Tap hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 text-xs z-20"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        tap to continue
      </motion.p>
    </div>
  );
}
