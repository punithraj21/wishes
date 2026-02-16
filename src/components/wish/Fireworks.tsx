"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ThemeConfig } from "@/lib/types";

interface FireworksProps {
  theme: ThemeConfig;
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
  delay: number;
}

interface Burst {
  id: number;
  x: number;
  y: number;
  delay: number;
  particles: Particle[];
}

export default function Fireworks({ theme }: FireworksProps) {
  const colors = [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.accent,
    "#FFD700",
    "#FF69B4",
    "#00E5FF",
    "#76FF03",
    "#FF6D00",
  ];

  const bursts: Burst[] = useMemo(() => {
    return Array.from({ length: 6 }).map((_, burstIdx) => ({
      id: burstIdx,
      x: 15 + Math.random() * 70,
      y: 10 + Math.random() * 50,
      delay: burstIdx * 0.8,
      particles: Array.from({ length: 12 }).map((_, pIdx) => ({
        id: pIdx,
        angle: (pIdx / 12) * 360,
        distance: 40 + Math.random() * 60,
        color: colors[(burstIdx + pIdx) % colors.length],
        size: 3 + Math.random() * 3,
        delay: Math.random() * 0.2,
      })),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {bursts.map((burst) => (
        <div
          key={burst.id}
          className="absolute"
          style={{ left: `${burst.x}%`, top: `${burst.y}%` }}
        >
          {/* Launch trail */}
          <motion.div
            className="absolute w-0.5 rounded-full"
            style={{
              height: 0,
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              background: `linear-gradient(to top, transparent, ${colors[burst.id % colors.length]})`,
            }}
            animate={{
              height: [0, 80, 0],
              opacity: [0, 0.8, 0],
              y: [100, 0, 0],
            }}
            transition={{
              duration: 0.5,
              delay: burst.delay,
              repeat: Infinity,
              repeatDelay: 4,
            }}
          />

          {/* Explosion particles */}
          {burst.particles.map((particle) => {
            const radians = (particle.angle * Math.PI) / 180;
            const endX = Math.cos(radians) * particle.distance;
            const endY = Math.sin(radians) * particle.distance;

            return (
              <motion.div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                  left: 0,
                  top: 0,
                }}
                animate={{
                  x: [0, endX, endX * 1.1],
                  y: [0, endY, endY + 30],
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0],
                }}
                transition={{
                  duration: 1.2,
                  delay: burst.delay + 0.5 + particle.delay,
                  repeat: Infinity,
                  repeatDelay: 3.5,
                  ease: [0.4, 0, 0.2, 1],
                }}
              />
            );
          })}

          {/* Center flash */}
          <motion.div
            className="absolute w-6 h-6 rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{
              background: `radial-gradient(circle, white, ${colors[burst.id % colors.length]}80, transparent)`,
            }}
            animate={{
              scale: [0, 2, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.4,
              delay: burst.delay + 0.5,
              repeat: Infinity,
              repeatDelay: 4.1,
            }}
          />
        </div>
      ))}
    </div>
  );
}
