"use client";

import { useMemo, useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { ThemeConfig } from "@/lib/types";

interface FloatingBalloonsProps {
  theme: ThemeConfig;
  count?: number;
  flyAway?: boolean;
}

interface Balloon {
  id: number;
  x: number; // 0-100%
  scale: number;
  color: string;
  delay: number;
  duration: number;
  wobbleDuration: number;
}

export default function FloatingBalloons({
  theme,
  count = 15, // Increased default count for better effect
  flyAway = false,
}: FloatingBalloonsProps) {
  const [windowHeight, setWindowHeight] = useState(1000);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const balloonColors = [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.accent,
    "#FF6B6B", // Red-pink
    "#4ECDC4", // Teal
    "#FFE66D", // Yellow
    "#A78BFA", // Purple
    "#F472B6", // Pink
    "#34D399", // Green
    "#60A5FA", // Blue
  ];

  const balloons: Balloon[] = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      scale: 0.8 + Math.random() * 0.6, // varied sizes
      color: balloonColors[i % balloonColors.length],
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10, // Slower, more graceful (unless flying away)
      wobbleDuration: 3 + Math.random() * 4,
    }));
  }, [count, balloonColors]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {balloons.map((b) => (
        <BalloonItem
          key={b.id}
          balloon={b}
          windowHeight={windowHeight}
          flyAway={flyAway}
        />
      ))}
    </div>
  );
}

function BalloonItem({
  balloon,
  windowHeight,
  flyAway,
}: {
  balloon: Balloon;
  windowHeight: number;
  flyAway: boolean;
}) {
  const controls = useAnimation();

  useEffect(() => {
    if (flyAway) {
      // Accelerate upwards quickly
      controls.start({
        y: -windowHeight - 500,
        transition: {
          duration: 1.5 + Math.random(), // varied speed for natural feel
          ease: "easeIn",
          delay: Math.random() * 0.5, // slight stagger
        },
      });
    } else {
      // Normal floating loop
      controls.start({
        y: -windowHeight - 200,
        transition: {
          duration: balloon.duration,
          delay: balloon.delay,
          ease: "linear",
          repeat: Infinity,
        },
      });
    }
  }, [controls, balloon, windowHeight, flyAway]);

  return (
    <motion.div
      initial={{ y: 200, x: `${balloon.x}vw` }} // Start below screen
      animate={controls}
      className="absolute bottom-0"
      style={{
        zIndex: Math.floor(balloon.scale * 10), // Larger balloons in front
      }}
    >
      <motion.div
        animate={{
          x: [-20, 20, -20],
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: balloon.wobbleDuration,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        style={{ scale: balloon.scale }}
      >
        <svg
          width="100"
          height="120"
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          <defs>
            <radialGradient
              id={`grad-${balloon.id}`}
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(30 30) rotate(0) scale(60)"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0.6" />
              <stop offset="30%" stopColor={balloon.color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={balloon.color} />
            </radialGradient>
            <filter id={`glow-${balloon.id}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* String */}
          <path
            d="M50 90 Q 55 105 50 120"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Balloon Body */}
          <path
            d="M50 94 C 20 94 10 50 10 35 C 10 15 28 0 50 0 C 72 0 90 15 90 35 C 90 50 80 94 50 94 Z"
            fill={`url(#grad-${balloon.id})`}
            style={{ filter: `drop-shadow(0 4px 6px ${balloon.color}40)` }}
          />

          {/* Knot */}
          <path d="M46 94 L 54 94 L 52 98 L 48 98 Z" fill={balloon.color} />

          {/* Specular Highlight (Shiny reflection) */}
          <ellipse
            cx="30"
            cy="25"
            rx="10"
            ry="18"
            transform="rotate(-20 30 25)"
            fill="white"
            fillOpacity="0.3"
          />
          <circle cx="25" cy="18" r="3" fill="white" fillOpacity="0.6" />
        </svg>
      </motion.div>
    </motion.div>
  );
}
