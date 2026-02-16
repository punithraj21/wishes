"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ThemeConfig } from "@/lib/types";

interface FloatingBalloonsProps {
  theme: ThemeConfig;
  count?: number;
}

interface Balloon {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  sway: number;
}

const BALLOON_EMOJIS = ["🎈"];

export default function FloatingBalloons({
  theme,
  count = 12,
}: FloatingBalloonsProps) {
  const balloonColors = [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.accent,
    "#FF6B6B",
    "#4ECDC4",
    "#FFE66D",
    "#A78BFA",
    "#F472B6",
    "#34D399",
  ];

  const balloons: Balloon[] = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 6 + Math.random() * 6,
      size: 28 + Math.random() * 20,
      color: balloonColors[i % balloonColors.length],
      sway: 20 + Math.random() * 40,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {balloons.map((balloon) => (
        <motion.div
          key={balloon.id}
          className="absolute flex flex-col items-center"
          style={{
            left: `${balloon.x}%`,
            bottom: -80,
          }}
          animate={{
            y: [0, -(window.innerHeight + 200)],
            x: [-balloon.sway / 2, balloon.sway / 2, -balloon.sway / 2],
          }}
          transition={{
            y: {
              duration: balloon.duration,
              delay: balloon.delay,
              repeat: Infinity,
              ease: "linear",
            },
            x: {
              duration: balloon.duration / 3,
              delay: balloon.delay,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          {/* Balloon body */}
          <motion.div
            className="relative flex items-center justify-center select-none"
            style={{ fontSize: balloon.size }}
            animate={{
              rotate: [-5, 5, -5],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {BALLOON_EMOJIS[0]}
            {/* Shine effect */}
            <div
              className="absolute top-[25%] left-[35%] w-[15%] h-[15%] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.6), transparent)",
              }}
            />
          </motion.div>

          {/* String */}
          <motion.div
            className="w-px origin-top"
            style={{
              height: 30 + Math.random() * 20,
              background: `linear-gradient(to bottom, ${balloon.color}80, transparent)`,
            }}
            animate={{
              scaleX: [1, 0.8, 1.2, 1],
              rotate: [-3, 3, -3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
