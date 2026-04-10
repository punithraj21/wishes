"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeConfig } from "@/lib/types";

interface BirthdayCakeProps {
  personName: string;
  theme: ThemeConfig;
  onAllCandlesBlown: () => void;
}

const LANTERN_COUNT = 5;

// Lantern positions in a gentle arc
const lanternPositions = [
  { x: -120, y: 30 },
  { x: -55, y: -15 },
  { x: 0, y: -30 },
  { x: 55, y: -15 },
  { x: 120, y: 30 },
];

export default function BirthdayCake({
  personName,
  theme,
  onAllCandlesBlown,
}: BirthdayCakeProps) {
  const [released, setReleased] = useState<boolean[]>(
    Array(LANTERN_COUNT).fill(false),
  );
  const [allReleased, setAllReleased] = useState(false);

  const releaseLantern = (index: number) => {
    if (released[index] || allReleased) return;
    const newReleased = [...released];
    newReleased[index] = true;
    setReleased(newReleased);
    if (newReleased.every((r) => r)) {
      setAllReleased(true);
      setTimeout(() => onAllCandlesBlown(), 2000);
    }
  };

  const releasedCount = released.filter(Boolean).length;

  // Colors for each lantern from theme
  const lanternColors = useMemo(
    () => [
      theme.colors.primary,
      theme.colors.accent,
      theme.colors.secondary,
      theme.colors.primary,
      theme.colors.accent,
    ],
    [theme.colors.primary, theme.colors.accent, theme.colors.secondary],
  );

  // Glow intensity increases as more lanterns are released
  const glowIntensity = 0.1 + releasedCount * 0.08;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 12 }}
      className="flex flex-col items-center relative"
    >
      {/* Instruction */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm mb-10 font-medium tracking-wide"
        style={{ color: theme.colors.textMuted }}
      >
        {allReleased
          ? "Your wishes are on their way..."
          : `Tap each lantern to release it (${releasedCount}/${LANTERN_COUNT})`}
      </motion.p>

      {/* Lanterns container */}
      <div className="relative w-80 md:w-96 h-64 md:h-72">
        {lanternPositions.map((pos, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`,
            }}
          >
            <AnimatePresence>
              {!released[i] && (
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    y: -800,
                    opacity: 0,
                    scale: 0.3,
                    transition: { duration: 2.5, ease: "easeIn" },
                  }}
                  transition={{
                    type: "spring",
                    damping: 12,
                    delay: i * 0.15,
                  }}
                  className="cursor-pointer relative"
                  onClick={() => releaseLantern(i)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Lantern bob animation */}
                  <motion.div
                    animate={{ y: [0, -6, 0, -3, 0] }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Lantern glow */}
                    <motion.div
                      className="absolute -inset-4 rounded-full blur-xl pointer-events-none"
                      style={{ backgroundColor: lanternColors[i] }}
                      animate={{
                        opacity: [glowIntensity, glowIntensity + 0.15, glowIntensity],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />

                    {/* Lantern SVG */}
                    <svg
                      width="56"
                      height="76"
                      viewBox="0 0 56 76"
                      fill="none"
                      className="relative z-10"
                    >
                      {/* String */}
                      <line
                        x1="28"
                        y1="60"
                        x2="28"
                        y2="75"
                        stroke={`${theme.colors.text}40`}
                        strokeWidth="1"
                      />
                      {/* Lantern body */}
                      <ellipse
                        cx="28"
                        cy="34"
                        rx="22"
                        ry="28"
                        fill={`${lanternColors[i]}30`}
                        stroke={`${lanternColors[i]}60`}
                        strokeWidth="1"
                      />
                      {/* Inner glow */}
                      <ellipse
                        cx="28"
                        cy="34"
                        rx="14"
                        ry="18"
                        fill={`${lanternColors[i]}25`}
                      />
                      {/* Flame at base */}
                      <ellipse
                        cx="28"
                        cy="55"
                        rx="4"
                        ry="6"
                        fill={lanternColors[i]}
                        opacity="0.8"
                      />
                      {/* Flame core */}
                      <ellipse
                        cx="28"
                        cy="54"
                        rx="2"
                        ry="3"
                        fill="white"
                        opacity="0.7"
                      />
                      {/* Top cap */}
                      <rect
                        x="22"
                        y="4"
                        width="12"
                        height="4"
                        rx="2"
                        fill={`${lanternColors[i]}50`}
                      />
                      {/* Decorative ribs */}
                      <path
                        d={`M 16 20 Q 28 18 40 20`}
                        stroke={`${lanternColors[i]}20`}
                        strokeWidth="0.5"
                        fill="none"
                      />
                      <path
                        d={`M 12 34 Q 28 32 44 34`}
                        stroke={`${lanternColors[i]}20`}
                        strokeWidth="0.5"
                        fill="none"
                      />
                      <path
                        d={`M 16 48 Q 28 46 40 48`}
                        stroke={`${lanternColors[i]}20`}
                        strokeWidth="0.5"
                        fill="none"
                      />
                    </svg>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Trail particles when released */}
            <AnimatePresence>
              {released[i] && (
                <>
                  {[0, 1, 2, 3].map((p) => (
                    <motion.div
                      key={p}
                      className="absolute rounded-full"
                      style={{
                        width: 3,
                        height: 3,
                        backgroundColor: lanternColors[i],
                        boxShadow: `0 0 6px ${lanternColors[i]}`,
                        left: "50%",
                        top: "50%",
                      }}
                      initial={{ opacity: 0.8, y: 0, x: 0 }}
                      animate={{
                        opacity: 0,
                        y: -300 - p * 80,
                        x: (p - 1.5) * 12,
                      }}
                      transition={{
                        duration: 2,
                        delay: p * 0.2,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Warm sky glow when all released */}
      <AnimatePresence>
        {allReleased && (
          <motion.div
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="rounded-full blur-3xl"
              style={{
                width: 300,
                height: 300,
                background: `radial-gradient(circle, ${theme.colors.primary}30, ${theme.colors.accent}15, transparent)`,
              }}
              animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion message */}
      <AnimatePresence>
        {allReleased && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-center"
          >
            <motion.p
              className="text-lg font-medium"
              style={{
                color: theme.colors.text,
                textShadow: `0 0 20px ${theme.colors.primary}40`,
              }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨ {personName}&apos;s wishes are flying high ✨
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
