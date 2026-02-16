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

  const candleStickColors = [
    "#FF6B9D",
    "#C084FC",
    "#60A5FA",
    "#34D399",
    "#FBBF24",
  ];
  const candleHeights = [44, 52, 48, 50, 46];
  const primary = theme.colors.primary;
  const secondary = theme.colors.secondary;
  const accent = theme.colors.accent;

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
        className="text-sm mb-8 font-medium tracking-wide"
        style={{ color: theme.colors.textMuted }}
      >
        {allBlown ? "🎉 Make a wish!" : "👆 Tap the candles to blow them out!"}
      </motion.p>

      <div className="relative">
        {/* === Candles (positioned above the SVG cake) === */}
        <div
          className="flex justify-center items-end gap-5 md:gap-7 relative z-20 px-4"
          style={{ marginBottom: -2 }}
        >
          {litCandles.map((isLit, i) => (
            <div
              key={i}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => blowCandle(i)}
            >
              {/* Flame */}
              <div className="relative h-10 flex items-end justify-center mb-0.5">
                <AnimatePresence>
                  {isLit && (
                    <motion.div
                      initial={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0, y: -30 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="relative"
                    >
                      <motion.div
                        className="absolute -inset-4 rounded-full"
                        style={{
                          background:
                            "radial-gradient(circle, rgba(255,180,50,0.4), rgba(255,120,0,0.1) 50%, transparent 70%)",
                        }}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{
                          duration: 0.5 + i * 0.05,
                          repeat: Infinity,
                        }}
                      />
                      <motion.div
                        className="relative"
                        style={{
                          width: 10,
                          height: 20,
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
                        <motion.div
                          className="absolute bottom-0 left-1/2 -translate-x-1/2"
                          style={{
                            width: 5,
                            height: 10,
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
              {/* Wick */}
              <div
                className="w-px rounded-full"
                style={{
                  height: 6,
                  background: isLit
                    ? "linear-gradient(to top, #333, #FF6B00)"
                    : "linear-gradient(to top, #333, #666)",
                }}
              />
              {/* Candle stick */}
              <motion.div
                className="rounded-t-sm relative overflow-hidden"
                style={{
                  width: 12,
                  height: candleHeights[i],
                  background: `linear-gradient(90deg, ${candleStickColors[i]}CC, ${candleStickColors[i]}, ${candleStickColors[i]}BB)`,
                  boxShadow: isLit
                    ? `0 0 12px ${candleStickColors[i]}40, inset -2px 0 4px rgba(0,0,0,0.1)`
                    : "inset -2px 0 4px rgba(0,0,0,0.15)",
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-2 rounded-b-full"
                  style={{ background: `${candleStickColors[i]}DD` }}
                />
                <div
                  className="absolute top-0 left-1 w-1 h-full rounded-full"
                  style={{ background: "rgba(255,255,255,0.3)" }}
                />
              </motion.div>
            </div>
          ))}
        </div>

        {/* === SVG Cake === */}
        <svg
          viewBox="0 0 300 200"
          width="300"
          height="200"
          className="relative z-10"
        >
          <defs>
            {/* Cake sponge gradient */}
            <linearGradient id="spongeTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FCEBD5" />
              <stop offset="40%" stopColor="#F0D4AE" />
              <stop offset="100%" stopColor="#DEB887" />
            </linearGradient>
            <linearGradient id="spongeBot" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5DFC0" />
              <stop offset="40%" stopColor="#E8C89A" />
              <stop offset="100%" stopColor="#D2A96A" />
            </linearGradient>
            {/* Frosting gradients */}
            <linearGradient id="frostTop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={primary} />
              <stop offset="100%" stopColor={secondary} />
            </linearGradient>
            <linearGradient id="frostMid" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={accent} />
              <stop offset="100%" stopColor={primary} />
            </linearGradient>
            <linearGradient id="plateGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F0F0F0" />
              <stop offset="50%" stopColor="#D8D8D8" />
              <stop offset="100%" stopColor="#B0B0B0" />
            </linearGradient>
            {/* Shadow filter */}
            <filter id="cakeShadow" x="-10%" y="-5%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.2" />
            </filter>
            <filter id="innerGlow" x="-5%" y="-5%" width="110%" height="110%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
              <feFlood
                floodColor={primary}
                floodOpacity="0.15"
                result="color"
              />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g filter="url(#cakeShadow)">
            {/* === Plate === */}
            <ellipse
              cx="150"
              cy="185"
              rx="140"
              ry="12"
              fill="url(#plateGrad)"
            />
            <ellipse
              cx="150"
              cy="183"
              rx="134"
              ry="9"
              fill="#EAEAEA"
              opacity="0.5"
            />

            {/* === Bottom tier === */}
            {/* Back ellipse (3D top of bottom tier visible behind) */}
            <ellipse
              cx="150"
              cy="115"
              rx="110"
              ry="14"
              fill="url(#frostMid)"
              opacity="0.4"
            />
            {/* Body */}
            <path
              d="M40,115 L40,170 Q40,180 60,182 L240,182 Q260,180 260,170 L260,115 Z"
              fill="url(#spongeBot)"
            />
            {/* Left shading */}
            <path
              d="M40,115 L40,170 Q40,180 60,182 L80,182 L80,115 Z"
              fill="rgba(0,0,0,0.06)"
            />
            {/* Right shading */}
            <path
              d="M220,115 L220,182 L240,182 Q260,180 260,170 L260,115 Z"
              fill="rgba(0,0,0,0.04)"
            />
            {/* Bottom tier rounded bottom */}
            <path
              d="M40,170 Q40,185 65,186 L235,186 Q260,185 260,170"
              fill="url(#spongeBot)"
            />
            {/* Filling stripe */}
            <rect
              x="42"
              y="142"
              width="216"
              height="6"
              rx="2"
              fill="#E06070"
              opacity="0.7"
            />
            <rect
              x="42"
              y="143"
              width="216"
              height="2"
              rx="1"
              fill="#FFB0B8"
              opacity="0.4"
            />

            {/* Bottom frosting drips */}
            {[60, 85, 110, 140, 170, 195, 220, 240].map((x, i) => (
              <path
                key={`drip-bot-${i}`}
                d={`M${x},115 Q${x},${125 + (i % 3) * 8} ${x + 3},${128 + (i % 3) * 8} Q${x + 6},${125 + (i % 3) * 8} ${x + 6},115`}
                fill={accent}
                opacity="0.85"
              />
            ))}

            {/* === Top tier === */}
            {/* Body */}
            <path
              d="M70,60 L70,110 Q70,118 90,119 L210,119 Q230,118 230,110 L230,60 Z"
              fill="url(#spongeTop)"
            />
            {/* Left shading */}
            <path
              d="M70,60 L70,110 Q70,118 90,119 L100,119 L100,60 Z"
              fill="rgba(0,0,0,0.05)"
            />
            {/* Filling stripe */}
            <rect
              x="72"
              y="85"
              width="156"
              height="5"
              rx="2"
              fill="#E06070"
              opacity="0.6"
            />
            <rect
              x="72"
              y="86"
              width="156"
              height="2"
              rx="1"
              fill="#FFB0B8"
              opacity="0.3"
            />

            {/* Top frosting ellipse */}
            <ellipse
              cx="150"
              cy="58"
              rx="82"
              ry="14"
              fill="url(#frostTop)"
              filter="url(#innerGlow)"
            />
            {/* Frosting highlight */}
            <ellipse
              cx="140"
              cy="54"
              rx="50"
              ry="6"
              fill="white"
              opacity="0.15"
            />

            {/* Top frosting drips */}
            {[82, 105, 130, 155, 180, 205].map((x, i) => (
              <path
                key={`drip-top-${i}`}
                d={`M${x},58 Q${x},${68 + (i % 3) * 10} ${x + 4},${72 + (i % 3) * 10} Q${x + 8},${68 + (i % 3) * 10} ${x + 8},58`}
                fill={primary}
                opacity="0.8"
              />
            ))}

            {/* Middle frosting band */}
            <ellipse cx="150" cy="115" rx="112" ry="12" fill="url(#frostMid)" />
            <ellipse
              cx="145"
              cy="112"
              rx="70"
              ry="5"
              fill="white"
              opacity="0.1"
            />

            {/* === Decorations === */}
            {/* Piping dots on top */}
            {Array.from({ length: 11 }).map((_, i) => {
              const angle = (i / 11) * Math.PI * 2 - Math.PI / 2;
              const cx = 150 + Math.cos(angle) * 65;
              const cy = 58 + Math.sin(angle) * 10;
              return (
                <circle
                  key={`pip-${i}`}
                  cx={cx}
                  cy={cy}
                  r="3.5"
                  fill={secondary}
                  opacity="0.9"
                />
              );
            })}

            {/* Small dots on bottom tier */}
            {Array.from({ length: 14 }).map((_, i) => {
              const angle = (i / 14) * Math.PI * 2 - Math.PI / 2;
              const cx = 150 + Math.cos(angle) * 90;
              const cy = 115 + Math.sin(angle) * 8;
              return (
                <circle
                  key={`pip2-${i}`}
                  cx={cx}
                  cy={cy}
                  r="3"
                  fill={secondary}
                  opacity="0.7"
                />
              );
            })}

            {/* Sprinkles on top */}
            {[
              { x: 120, y: 50, r: 15, c: "#FF6B9D" },
              { x: 155, y: 52, r: -20, c: "#60A5FA" },
              { x: 170, y: 48, r: 45, c: "#FBBF24" },
              { x: 135, y: 55, r: -30, c: "#34D399" },
              { x: 160, y: 56, r: 60, c: "#C084FC" },
              { x: 140, y: 48, r: 10, c: "#FF6B6B" },
            ].map((s, i) => (
              <rect
                key={`spr-${i}`}
                x={s.x}
                y={s.y}
                width="6"
                height="2"
                rx="1"
                fill={s.c}
                opacity="0.8"
                transform={`rotate(${s.r} ${s.x + 3} ${s.y + 1})`}
              />
            ))}

            {/* Name text */}
            <text
              x="150"
              y="155"
              textAnchor="middle"
              fontFamily={theme.font}
              fontSize="11"
              fontWeight="bold"
              fill={secondary}
              opacity="0.9"
            >
              ♥ {personName} ♥
            </text>
          </g>
        </svg>
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
