"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeConfig } from "@/lib/types";

interface HeartFillProps {
  personName: string;
  theme: ThemeConfig;
  onNext: () => void;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
}

const TARGET_HEARTS = 15;

export default function HeartFill({
  personName,
  theme,
  onNext,
}: HeartFillProps) {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [complete, setComplete] = useState(false);
  const idRef = useRef(0);

  const heartColors = [
    theme.colors.primary,
    theme.colors.accent,
    theme.colors.secondary,
    "#FF6B8A",
    "#FF85A1",
    "#FFB3C6",
  ];

  const addHeart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (complete) return;

      let x: number, y: number;
      if ("touches" in e) {
        const touch = e.touches[0];
        const rect = e.currentTarget.getBoundingClientRect();
        x = touch.clientX - rect.left;
        y = touch.clientY - rect.top;
      } else {
        const rect = e.currentTarget.getBoundingClientRect();
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }

      const newHeart: FloatingHeart = {
        id: idRef.current++,
        x,
        y,
        size: 20 + Math.random() * 25,
        color: heartColors[Math.floor(Math.random() * heartColors.length)],
        rotation: (Math.random() - 0.5) * 40,
      };

      setHearts((prev) => [...prev, newHeart]);
    },
    [complete, heartColors],
  );

  // Auto-advance once the heart fills, ~2s pause for celebration.
  // `complete` deliberately excluded from deps — it's set inside this effect, so
  // including it would cancel the pending timer the moment it flips true.
  useEffect(() => {
    if (hearts.length < TARGET_HEARTS) return;
    setComplete(true);
    const t = setTimeout(() => onNext(), 2000);
    return () => clearTimeout(t);
  }, [hearts.length, onNext]);

  const progress = Math.min(hearts.length / TARGET_HEARTS, 1);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden select-none"
      onClick={addHeart}
      onTouchStart={addHeart}
    >
      {/* Background glow that grows with hearts */}
      <motion.div
        className="absolute rounded-full blur-3xl pointer-events-none"
        style={{
          width: 300,
          height: 300,
          background: `radial-gradient(circle, ${theme.colors.primary}${Math.round(progress * 25).toString(16).padStart(2, "0")}, transparent)`,
        }}
        animate={{ scale: 1 + progress * 0.5 }}
      />

      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <h2
          className="text-2xl md:text-3xl font-bold mb-2"
          style={{ color: theme.colors.text, fontFamily: theme.font }}
        >
          Fill the sky with love
        </h2>
        <p
          className="text-sm"
          style={{ color: theme.colors.textMuted }}
        >
          {complete
            ? `${personName}'s sky is full of love!`
            : `Tap anywhere! (${hearts.length}/${TARGET_HEARTS})`}
        </p>
      </div>

      {/* Large heart outline that fills up */}
      <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center z-10">
        {/* Outline heart */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{ filter: `drop-shadow(0 0 20px ${theme.colors.primary}30)` }}
        >
          <path
            d="M50 88 C25 65 5 50 5 30 C5 15 15 5 30 5 C38 5 45 10 50 18 C55 10 62 5 70 5 C85 5 95 15 95 30 C95 50 75 65 50 88Z"
            fill="none"
            stroke={`${theme.colors.primary}30`}
            strokeWidth="1.5"
          />
          {/* Fill that grows */}
          <clipPath id="heartClip">
            <path d="M50 88 C25 65 5 50 5 30 C5 15 15 5 30 5 C38 5 45 10 50 18 C55 10 62 5 70 5 C85 5 95 15 95 30 C95 50 75 65 50 88Z" />
          </clipPath>
          <rect
            clipPath="url(#heartClip)"
            x="0"
            y={100 - progress * 100}
            width="100"
            height={progress * 100}
            fill={theme.colors.primary}
            opacity="0.3"
          >
            <animate
              attributeName="y"
              to={100 - progress * 100}
              dur="0.5s"
              fill="freeze"
            />
          </rect>
        </svg>

        {/* Percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-3xl md:text-4xl font-bold"
            style={{
              color: theme.colors.text,
              fontFamily: theme.font,
              textShadow: `0 0 20px ${theme.colors.primary}40`,
            }}
          >
            {Math.round(progress * 100)}%
          </span>
        </div>
      </div>

      {/* Floating hearts from taps */}
      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            className="absolute pointer-events-none z-20"
            style={{
              left: heart.x,
              top: heart.y,
              fontSize: heart.size,
              color: heart.color,
            }}
            initial={{ opacity: 1, scale: 0.3, y: 0, rotate: 0 }}
            animate={{
              opacity: 0,
              scale: 1.5,
              y: -300 - Math.random() * 200,
              x: (Math.random() - 0.5) * 100,
              rotate: heart.rotation,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            ♥
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Completion burst */}
      <AnimatePresence>
        {complete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute z-30 text-center"
          >
            <motion.p
              className="text-4xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              💕
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div
        className="absolute bottom-16 left-8 right-8 h-1 rounded-full overflow-hidden"
        style={{ backgroundColor: `${theme.colors.text}10` }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: theme.colors.primary }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <p
        className="absolute bottom-8 text-xs"
        style={{ color: theme.colors.textMuted, opacity: 0.4 }}
      >
        {complete ? "moving on..." : "tap to spread love"}
      </p>
    </div>
  );
}
