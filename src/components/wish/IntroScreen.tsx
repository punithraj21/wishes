"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeConfig } from "@/lib/types";

interface IntroScreenProps {
  personName: string;
  theme: ThemeConfig;
  onNext: () => void;
}

// Phases: moon rise → heartbeat → portal → gift reveal → tap to open
type Phase = "star" | "heartbeat" | "portal" | "gift" | "ready";

export default function IntroScreen({
  personName,
  theme,
  onNext,
}: IntroScreenProps) {
  const [phase, setPhase] = useState<Phase>("star");
  const [opened, setOpened] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Phase progression
    const t1 = setTimeout(() => setPhase("heartbeat"), 2000);
    const t2 = setTimeout(() => setPhase("portal"), 3500);
    const t3 = setTimeout(() => setPhase("gift"), 5000);
    const t4 = setTimeout(() => setPhase("ready"), 6200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  // Sparkle particles for the star trail
  const sparkles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        y: 20 + Math.random() * 60,
        size: 1 + Math.random() * 2.5,
        delay: 2.2 + Math.random() * 1.5,
        duration: 1.5 + Math.random() * 2,
        color: i % 2 === 0 ? theme.colors.primary : theme.colors.accent,
      })),
    [theme.colors.primary, theme.colors.accent],
  );

  const handleOpen = () => {
    if (opened || phase !== "ready") return;
    setOpened(true);
    // Let the lid open and light burst play, then transition
    setTimeout(() => onNext(), 1400);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* === PHASE 1: FULL MOON RISING === */}
      <AnimatePresence>
        {(phase === "star" || phase === "heartbeat") && mounted && (
          <motion.div
            className="absolute rounded-full select-none"
            style={{
              width: 80,
              height: 80,
              background: `radial-gradient(circle at 40% 35%, #FFFDE8, #F5E6B8 40%, #D4C494 70%, #B8A67A)`,
              boxShadow: `0 0 30px rgba(255,253,220,0.6), 0 0 60px ${theme.colors.accent}40, 0 0 120px ${theme.colors.primary}30`,
            }}
            initial={{ left: "calc(50% - 40px)", top: "85%", opacity: 0, scale: 0.2 }}
            animate={{
              top: "30%",
              opacity: [0, 0.8, 1],
              scale: [0.2, 1.05, 1],
            }}
            exit={{ opacity: 0, scale: 2, filter: "blur(20px)" }}
            transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Moon craters / texture */}
            <div
              className="absolute rounded-full"
              style={{
                width: 12, height: 12, top: "25%", left: "30%",
                background: "radial-gradient(circle, rgba(180,165,120,0.3), transparent)",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 8, height: 8, top: "55%", left: "55%",
                background: "radial-gradient(circle, rgba(180,165,120,0.25), transparent)",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 15, height: 15, top: "40%", left: "60%",
                background: "radial-gradient(circle, rgba(180,165,120,0.2), transparent)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Moon glow aura */}
      {(phase === "star" || phase === "heartbeat") && mounted && (
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 250,
            height: 250,
            left: "calc(50% - 125px)",
            top: "calc(30% - 85px)",
            background: `radial-gradient(circle, rgba(255,253,220,0.12), rgba(255,253,220,0.04) 50%, transparent 70%)`,
          }}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: [0, 0.8, 0.5], scale: [0.3, 1.2, 1] }}
          transition={{ duration: 2.2, ease: "easeOut" }}
        />
      )}

      {/* === PHASE 2: HEARTBEAT PULSES === */}
      <AnimatePresence>
        {(phase === "heartbeat" || phase === "portal") && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`pulse-${i}`}
                className="absolute rounded-full pointer-events-none"
                style={{
                  border: `2px solid ${theme.colors.primary}`,
                }}
                initial={{ width: 10, height: 10, opacity: 0.8 }}
                animate={{
                  width: [10, 250 + i * 80],
                  height: [10, 250 + i * 80],
                  opacity: [0.6, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.25,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* === PHASE 3: PORTAL / LIGHT BURST === */}
      <AnimatePresence>
        {(phase === "portal" || phase === "gift" || phase === "ready") && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${theme.colors.primary}30, ${theme.colors.primary}10, transparent 70%)`,
            }}
            initial={{ width: 0, height: 0, opacity: 0 }}
            animate={{ width: 600, height: 600, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Portal light rays */}
      {(phase === "portal" || phase === "gift" || phase === "ready") &&
        [0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <motion.div
            key={angle}
            className="absolute pointer-events-none"
            style={{
              width: 1,
              height: 120,
              background: `linear-gradient(to top, ${theme.colors.primary}20, transparent)`,
              transformOrigin: "bottom center",
              rotate: `${angle}deg`,
            }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: [0, 0.4, 0.2], scaleY: [0, 1, 0.8] }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          />
        ))}

      {/* === PHASE 4 & 5: GIFT BOX WITH REALISTIC OPENING === */}
      {(phase === "gift" || phase === "ready" || opened) && (
        <motion.div
          initial={{ scale: 0, rotateY: -30 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ type: "spring", damping: 12, stiffness: 100 }}
          className="relative z-10"
          style={{ perspective: 800 }}
        >
          {/* Bobbing wrapper — only when not opened */}
          <motion.div
            animate={!opened && phase === "ready" ? { y: [0, -8, 0] } : {}}
            transition={!opened ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
            className="relative cursor-pointer"
            onClick={handleOpen}
          >
            {/* === LID (separates on open) === */}
            <motion.div
              className="relative z-20"
              style={{ transformOrigin: "center bottom", perspective: 600 }}
              animate={
                opened
                  ? { rotateX: -120, y: -60, opacity: 0 }
                  : { rotateX: 0, y: 0, opacity: 1 }
              }
              transition={opened ? { duration: 0.7, ease: "easeOut" } : {}}
            >
              {/* Lid surface */}
              <div
                className="w-32 h-8 md:w-40 md:h-10 rounded-t-lg relative"
                style={{
                  background: `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                  boxShadow: `0 -4px 15px ${theme.colors.primary}20`,
                }}
              >
                {/* Lid ribbon horizontal */}
                <div
                  className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-4"
                  style={{
                    background: `linear-gradient(180deg, ${theme.colors.accent}CC, ${theme.colors.accent}, ${theme.colors.accent}CC)`,
                  }}
                />
              </div>
              {/* Ribbon bow on lid */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex gap-0">
                <div
                  className="w-6 h-5 rounded-full -mr-1"
                  style={{ backgroundColor: theme.colors.accent, transform: "rotate(-20deg)" }}
                />
                <div
                  className="w-6 h-5 rounded-full -ml-1"
                  style={{ backgroundColor: theme.colors.accent, transform: "rotate(20deg)" }}
                />
                <div
                  className="absolute left-1/2 -translate-x-1/2 bottom-0 w-3 h-3 rounded-full"
                  style={{ backgroundColor: theme.colors.accent }}
                />
              </div>
            </motion.div>

            {/* === BOX BODY (stays in place) === */}
            <div
              className="w-32 h-20 md:w-40 md:h-24 rounded-b-lg relative overflow-hidden"
              style={{
                background: `linear-gradient(165deg, ${theme.colors.primary}DD, ${theme.colors.secondary})`,
                boxShadow: `0 20px 60px ${theme.colors.primary}40`,
              }}
            >
              {/* Vertical ribbon */}
              <div
                className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4"
                style={{
                  background: `linear-gradient(90deg, ${theme.colors.accent}CC, ${theme.colors.accent}, ${theme.colors.accent}CC)`,
                }}
              />

              {/* Light burst from inside when opened */}
              <AnimatePresence>
                {opened && (
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(ellipse at center top, rgba(255,255,220,0.9), rgba(255,255,220,0.3) 50%, transparent 80%)`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.6] }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </AnimatePresence>

              {/* Shimmer */}
              {!opened && (
                <motion.div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.15) 48%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.15) 52%, transparent 70%)`,
                    }}
                    animate={{ x: ["-150%", "250%"] }}
                    transition={{ duration: 2, delay: 1, repeat: Infinity, repeatDelay: 3 }}
                  />
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Light rays bursting upward on open */}
          <AnimatePresence>
            {opened && (
              <>
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={`ray-${i}`}
                    className="absolute pointer-events-none"
                    style={{
                      width: 3,
                      left: `${20 + i * 15}%`,
                      bottom: "60%",
                      background: `linear-gradient(to top, ${theme.colors.accent}80, rgba(255,255,220,0.6), transparent)`,
                      borderRadius: 2,
                      transformOrigin: "bottom center",
                    }}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: [0, 80 + i * 20],
                      opacity: [0, 0.8, 0],
                    }}
                    transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Glow under box */}
          <motion.div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-36 h-6 rounded-full blur-xl"
            style={{ backgroundColor: theme.colors.primary }}
            animate={
              opened
                ? { opacity: 0.8, width: 200 }
                : { opacity: [0.3, 0.5, 0.3] }
            }
            transition={opened ? { duration: 0.3 } : { duration: 2, repeat: Infinity }}
          />
        </motion.div>
      )}

      {/* Sparkles that appear after star explosion */}
      {mounted && (phase === "portal" || phase === "gift" || phase === "ready") &&
        sparkles.map((s) => (
          <motion.div
            key={s.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              backgroundColor: s.color,
              boxShadow: `0 0 ${s.size * 2}px ${s.color}80`,
            }}
            animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0] }}
            transition={{
              duration: s.duration,
              delay: s.delay - 2,
              repeat: Infinity,
              repeatDelay: Math.random() * 3,
            }}
          />
        ))}

      {/* "For [Name]" text */}
      {(phase === "gift" || phase === "ready") && !opened && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-8 text-center z-10"
        >
          <p
            className="text-xs uppercase tracking-[0.3em] mb-1"
            style={{ color: theme.colors.textMuted, opacity: 0.6 }}
          >
            a surprise for
          </p>
          <p
            className="text-2xl md:text-3xl font-light"
            style={{ color: theme.colors.text, fontFamily: theme.font }}
          >
            {personName}
          </p>
        </motion.div>
      )}

      {/* Tap hint */}
      {phase === "ready" && !opened && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.3, 0.5] }}
          transition={{ delay: 1, duration: 2, repeat: Infinity }}
          className="absolute bottom-12 text-xs tracking-wider z-10"
          style={{ color: theme.colors.textMuted }}
        >
          tap the gift to open
        </motion.p>
      )}

      {/* White flash on open */}
      <AnimatePresence>
        {opened && (
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none"
            style={{ backgroundColor: "white" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ duration: 0.7, times: [0, 0.25, 1] }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
