"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ThemeConfig } from "@/lib/types";

interface CountdownSectionProps {
  personName: string;
  specialDate: string;
  theme: ThemeConfig;
  onNext: () => void;
}

function calculateAge(dateStr: string): number {
  const birthday = new Date(dateStr + "T00:00:00");
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();
  // If birthday hasn't happened yet this year, they're turning this age
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthday.getDate())
  ) {
    // Birthday is upcoming — they're turning `age`
    return age;
  }
  // Birthday already passed — they turned `age`
  return age;
}

export default function CountdownSection({
  personName,
  specialDate,
  theme,
  onNext,
}: CountdownSectionProps) {
  const age = calculateAge(specialDate);
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(age > 1 ? 1 : age);
  const [finished, setFinished] = useState(age <= 1);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // Tick fast up to (age - 3), then slow down for the last few
  useEffect(() => {
    if (!mounted) return;
    if (count >= age) {
      setFinished(true);
      return;
    }
    const remaining = age - count;
    const delay =
      remaining > 3 ? 55 : remaining === 3 ? 400 : remaining === 2 ? 700 : 1000;
    const t = setTimeout(() => setCount((c) => c + 1), delay);
    return () => clearTimeout(t);
  }, [count, age, mounted]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden cursor-pointer"
      onClick={onNext}
    >
      {/* Concentric pulse rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            border: `1px solid ${theme.colors.primary}12`,
          }}
          animate={{
            width: [80, 500],
            height: [80, 500],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 3.5,
            delay: i * 1.2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      {/* "Turning" label */}
      <p
        className="text-sm uppercase tracking-[0.3em] mb-4 transition-all duration-700"
        style={{
          color: theme.colors.textMuted,
          opacity: mounted ? 0.7 : 0,
          transform: mounted ? "translateY(0)" : "translateY(15px)",
        }}
      >
        Turning
      </p>

      {/* The big age number */}
      <div className="relative">
        <motion.span
          className="text-[120px] md:text-[160px] font-bold leading-none block tabular-nums"
          style={{
            color: theme.colors.text,
            fontFamily: theme.font,
            textShadow: `0 0 60px ${theme.colors.primary}40, 0 0 120px ${theme.colors.primary}20`,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0.5)",
            transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {count}
        </motion.span>

        {/* Shimmer sweep — fires once when counter lands */}
        {finished && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(110deg, transparent 30%, ${theme.colors.primary}20 48%, ${theme.colors.primary}35 50%, ${theme.colors.primary}20 52%, transparent 70%)`,
              mixBlendMode: "screen",
            }}
            initial={{ x: "-120%" }}
            animate={{ x: "220%" }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        )}
      </div>

      {/* "and fabulous" subtitle */}
      <p
        className="mt-2 text-lg md:text-xl font-medium transition-all duration-700"
        style={{
          color: theme.colors.accent,
          fontFamily: theme.font,
          opacity: finished ? 0.8 : 0,
          transform: finished ? "translateY(0)" : "translateY(10px)",
          transitionDelay: "0.2s",
        }}
      >
        and absolutely fabulous
      </p>

      {/* Person name */}
      <p
        className="mt-6 text-sm tracking-widest uppercase transition-all duration-700"
        style={{
          color: theme.colors.textMuted,
          opacity: finished ? 0.5 : 0,
          transitionDelay: "0.5s",
        }}
      >
        Happy Birthday to my Best frnd, {personName}
      </p>

      {/* Decorative sparkles */}
      {finished &&
        [
          { x: -80, y: -60, delay: 1.2 },
          { x: 90, y: -40, delay: 1.5 },
          { x: -50, y: 50, delay: 1.8 },
          { x: 70, y: 60, delay: 2.0 },
        ].map((spark, i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none text-sm"
            style={{ color: theme.colors.accent }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{
              delay: spark.delay,
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          >
            <span
              style={{
                position: "absolute",
                left: `calc(50% + ${spark.x}px)`,
                top: `calc(50% + ${spark.y}px)`,
              }}
            >
              ✦
            </span>
          </motion.div>
        ))}

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
