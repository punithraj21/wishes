"use client";

import { useEffect, useState, useMemo } from "react";
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
  const [autoAdvanced, setAutoAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger animations after mount
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!autoAdvanced) {
        setAutoAdvanced(true);
        onNext();
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [onNext, autoAdvanced]);

  const handleSkip = () => {
    if (!autoAdvanced) {
      setAutoAdvanced(true);
      onNext();
    }
  };

  const nameChars = personName.split("");

  const constellationDots = useMemo(
    () =>
      nameChars.map((_, i) =>
        Array.from({ length: 4 }, (__, d) => ({
          x: (Math.random() - 0.5) * 30,
          y: (Math.random() - 0.5) * 40,
          delay: 0.8 + i * 0.12 + d * 0.05,
          size: 1.5 + Math.random() * 2,
        })),
      ),
    [nameChars.length],
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden cursor-pointer"
      onClick={handleSkip}
    >
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: `${theme.colors.primary}10` }}
          animate={{ scale: [1, 1.2, 1], x: [-20, 20, -20] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: `${theme.colors.secondary}10` }}
          animate={{ scale: [1.2, 1, 1.2], x: [20, -20, 20] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative text-center space-y-8">
        {/* Title */}
        <h2
          className="text-xl md:text-2xl font-medium transition-all duration-700"
          style={{
            color: theme.colors.textMuted,
            fontFamily: theme.font,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
          }}
        >
          {title}
        </h2>

        {/* Name — constellation forming effect */}
        <div className="relative">
          <div className="flex flex-wrap justify-center gap-1 md:gap-3">
            {nameChars.map((char, i) => (
              <div key={i} className="relative">
                {/* Constellation dots */}
                {mounted &&
                  constellationDots[i]?.map((dot, d) => (
                    <motion.div
                      key={d}
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        width: dot.size,
                        height: dot.size,
                        backgroundColor: theme.colors.primary,
                        boxShadow: `0 0 ${dot.size * 3}px ${theme.colors.primary}`,
                        left: "50%",
                        top: "50%",
                      }}
                      animate={{
                        opacity: [0, 0.8, 0],
                        x: [dot.x, 0],
                        y: [dot.y, 0],
                      }}
                      transition={{
                        delay: dot.delay,
                        duration: 0.6,
                        ease: "easeIn",
                      }}
                    />
                  ))}

                {/* Letter */}
                <span
                  className="text-5xl md:text-8xl font-bold inline-block transition-all duration-500"
                  style={{
                    color: theme.colors.text,
                    fontFamily: theme.font,
                    textShadow: `0 0 40px ${theme.colors.primary}60, 0 0 80px ${theme.colors.primary}30`,
                    opacity: mounted ? 1 : 0,
                    filter: mounted ? "blur(0px)" : "blur(12px)",
                    transitionDelay: `${1.0 + i * 0.12}s`,
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              </div>
            ))}
          </div>

          {/* Golden light sweep */}
          {mounted && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${theme.colors.primary}25 45%, ${theme.colors.primary}40 50%, ${theme.colors.primary}25 55%, transparent 100%)`,
                mixBlendMode: "screen",
              }}
              animate={{ x: ["-120%", "220%"] }}
              transition={{ delay: 2.5, duration: 1.2, ease: "easeInOut" }}
            />
          )}
        </div>

        {/* Decorative line */}
        <div
          className="h-px w-40 mx-auto rounded-full transition-all duration-700"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.colors.primary}80, transparent)`,
            transform: mounted ? "scaleX(1)" : "scaleX(0)",
            transitionDelay: "2.8s",
          }}
        />

        {/* Special date */}
        {specialDate && (
          <p
            className="text-lg transition-all duration-500"
            style={{
              color: theme.colors.accent,
              fontFamily: theme.font,
              opacity: mounted ? 1 : 0,
              transitionDelay: "3.2s",
            }}
          >
            {formatDate(specialDate)}
          </p>
        )}

        {/* Tap hint */}
        <p
          className="text-xs pt-4 animate-pulse"
          style={{
            color: theme.colors.textMuted,
            opacity: mounted ? 0.4 : 0,
            transitionDelay: "4.5s",
          }}
        >
          tap anywhere to continue
        </p>
      </div>
    </div>
  );
}
