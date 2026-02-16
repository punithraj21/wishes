"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeConfig } from "@/lib/types";

interface BirthdayCakeProps {
  personName: string;
  theme: ThemeConfig;
  onAllCandlesBlown: () => void;
}

const CANDLE_COUNT = 5;

export default function BirthdayCake({
  personName,
  theme,
  onAllCandlesBlown,
}: BirthdayCakeProps) {
  const [litCandles, setLitCandles] = useState<boolean[]>(
    Array(CANDLE_COUNT).fill(true),
  );
  const [allBlown, setAllBlown] = useState(false);

  const blowCandle = (index: number) => {
    if (!litCandles[index] || allBlown) return;
    const newLit = [...litCandles];
    newLit[index] = false;
    setLitCandles(newLit);
    if (newLit.every((c) => !c)) {
      setAllBlown(true);
      setTimeout(() => onAllCandlesBlown(), 1200);
    }
  };

  const primary = theme.colors.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 12 }}
      className="flex flex-col items-center"
    >
      {/* Instruction */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm mb-6 font-medium tracking-wide"
        style={{ color: theme.colors.textMuted }}
      >
        {allBlown ? "🎉 Make a wish!" : "👆 Tap the candles to blow them out!"}
      </motion.p>

      {/* Cake with interactive candles */}
      <div className="relative">
        {/* Candle flames overlay — positioned above the cake GIF */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-end gap-4 md:gap-5 z-10"
          style={{ top: -10 }}
        >
          {litCandles.map((isLit, i) => (
            <div
              key={i}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => blowCandle(i)}
            >
              <div className="relative h-10 flex items-end justify-center">
                <AnimatePresence>
                  {isLit && (
                    <motion.div
                      initial={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0, y: -30 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="relative"
                    >
                      {/* Glow */}
                      <motion.div
                        className="absolute -inset-4 rounded-full"
                        style={{
                          background:
                            "radial-gradient(circle, rgba(255,180,50,0.5), rgba(255,120,0,0.1) 50%, transparent 70%)",
                        }}
                        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{
                          duration: 0.5 + i * 0.05,
                          repeat: Infinity,
                        }}
                      />
                      {/* Outer flame */}
                      <motion.div
                        style={{
                          width: 12,
                          height: 22,
                          borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                          background:
                            "linear-gradient(0deg, #FF6B00, #FF9500 30%, #FFD700 60%, #FFEFA0 85%, #FFFFFFCC)",
                          filter: "blur(0.5px)",
                        }}
                        animate={{
                          scaleX: [1, 0.8, 1.15, 0.85, 1],
                          scaleY: [1, 1.1, 0.85, 1.15, 1],
                          rotate: [0, 3, -2, 1, 0],
                        }}
                        transition={{
                          duration: 0.4 + i * 0.08,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        {/* Inner blue core */}
                        <motion.div
                          className="absolute bottom-0 left-1/2 -translate-x-1/2"
                          style={{
                            width: 6,
                            height: 11,
                            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                            background:
                              "linear-gradient(0deg, #4D9FFF, #87CEFA 40%, #FFF 90%)",
                          }}
                          animate={{ scaleY: [1, 1.2, 0.9, 1] }}
                          transition={{ duration: 0.3, repeat: Infinity }}
                        />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Smoke puffs when blown */}
                <AnimatePresence>
                  {!isLit && (
                    <>
                      {[0, 1, 2].map((s) => (
                        <motion.div
                          key={s}
                          initial={{ opacity: 0.6, y: 0, x: 0, scale: 0.3 }}
                          animate={{
                            opacity: 0,
                            y: -40 - s * 15,
                            x: (s - 1) * 8,
                            scale: 1.2 + s * 0.3,
                          }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 1.5,
                            delay: s * 0.15,
                            ease: "easeOut",
                          }}
                          className="absolute bottom-0 rounded-full"
                          style={{
                            width: 8,
                            height: 8,
                            background:
                              "radial-gradient(circle, rgba(180,180,190,0.5), rgba(200,200,210,0.1))",
                            filter: "blur(2px)",
                          }}
                        />
                      ))}
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>

        {/* Cake GIF */}
        <motion.img
          src="/cake.gif"
          alt="Birthday Cake"
          className="w-64 md:w-80 h-auto relative z-0"
          draggable={false}
          animate={allBlown ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Name label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-center"
        >
          <span
            className="text-sm md:text-base font-bold px-4 py-1 rounded-full"
            style={{
              color: theme.colors.text,
              background: `${theme.colors.background}CC`,
              textShadow: `0 0 10px ${primary}40`,
              border: `1px solid ${primary}30`,
            }}
          >
            ♥ {personName} ♥
          </span>
        </motion.div>
      </div>

      {/* All blown celebration */}
      <AnimatePresence>
        {allBlown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="mt-4 text-center"
          >
            <motion.p
              className="text-xl font-bold"
              style={{
                color: theme.colors.text,
                textShadow: `0 0 20px ${primary}40`,
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ✨ Your wish is coming true... ✨
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
