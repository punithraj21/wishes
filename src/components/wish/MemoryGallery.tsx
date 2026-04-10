"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeConfig, WishMedia } from "@/lib/types";
import Image from "next/image";

interface MemoryGalleryProps {
  images: WishMedia[];
  theme: ThemeConfig;
  onNext: () => void;
}

// Ken Burns effect presets — each image gets a different slow zoom/pan
const kenBurnsVariants = [
  { scale: [1, 1.15], x: ["0%", "2%"], y: ["0%", "-2%"] },
  { scale: [1.05, 1.18], x: ["0%", "-3%"], y: ["0%", "1%"] },
  { scale: [1, 1.12], x: ["0%", "-2%"], y: ["-1%", "2%"] },
  { scale: [1.08, 1.2], x: ["1%", "-1%"], y: ["0%", "-3%"] },
  { scale: [1, 1.14], x: ["-1%", "2%"], y: ["0%", "-1%"] },
];

const AUTO_ADVANCE_MS = 4500;

export default function MemoryGallery({
  images,
  theme,
  onNext,
}: MemoryGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTitle, setShowTitle] = useState(true);
  const [progressKey, setProgressKey] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hide title after 2 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowTitle(false), 2000);
    return () => clearTimeout(t);
  }, []);

  // Reset loaded state when image changes
  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  // Auto-advance only AFTER image has loaded
  useEffect(() => {
    if (!imageLoaded) return;
    timerRef.current = setTimeout(() => {
      if (currentIndex < images.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setProgressKey((prev) => prev + 1);
      } else {
        setTimeout(() => onNext(), 2000);
      }
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [imageLoaded, currentIndex, images.length, onNext]);

  const goToIndex = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < images.length) {
        setCurrentIndex(idx);
        setProgressKey((prev) => prev + 1);
      }
    },
    [images.length],
  );

  // Handle swipe
  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const threshold = 50;
      if (info.offset.x < -threshold || info.velocity.x < -500) {
        if (currentIndex < images.length - 1) goToIndex(currentIndex + 1);
      } else if (info.offset.x > threshold || info.velocity.x > 500) {
        if (currentIndex > 0) goToIndex(currentIndex - 1);
      }
    },
    [currentIndex, images.length, goToIndex],
  );

  // Handle tap on left/right half
  const handleTap = useCallback(
    (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x < rect.width / 3) {
        if (currentIndex > 0) goToIndex(currentIndex - 1);
      } else if (x > (rect.width * 2) / 3) {
        if (currentIndex < images.length - 1) goToIndex(currentIndex + 1);
      }
    },
    [currentIndex, images.length, goToIndex],
  );

  const kb = kenBurnsVariants[currentIndex % kenBurnsVariants.length];

  if (images.length === 0) return null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Full-bleed image with Ken Burns */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={handleTap}
      >
        <AnimatePresence mode="sync">
          <motion.div
            key={currentIndex}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0"
              animate={{
                scale: kb.scale,
                x: kb.x,
                y: kb.y,
              }}
              transition={{
                duration: AUTO_ADVANCE_MS / 1000 + 1,
                ease: "linear",
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
            >
              <Image
                src={images[currentIndex].file_url}
                alt={`Memory ${currentIndex + 1}`}
                fill
                className="object-cover"
                priority
                onLoad={() => setImageLoaded(true)}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Cinematic vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(ellipse at center, transparent 35%, ${theme.colors.background}CC 75%, ${theme.colors.background} 100%)`,
          }}
        />

        {/* Bottom letterbox gradient */}
        <div
          className="absolute inset-x-0 bottom-0 h-48 pointer-events-none z-10"
          style={{
            background: `linear-gradient(transparent, ${theme.colors.background}EE)`,
          }}
        />

        {/* Top letterbox gradient */}
        <div
          className="absolute inset-x-0 top-0 h-32 pointer-events-none z-10"
          style={{
            background: `linear-gradient(${theme.colors.background}AA, transparent)`,
          }}
        />
      </div>

      {/* Title overlay — fades out */}
      <AnimatePresence>
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-20 flex items-center justify-center"
          >
            <h2
              className="text-3xl md:text-5xl font-bold"
              style={{
                color: theme.colors.text,
                fontFamily: theme.font,
                textShadow: `0 0 40px ${theme.colors.background}, 0 2px 10px ${theme.colors.background}`,
              }}
            >
              Our Moments
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image counter pill */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 2.2 }}
        className="absolute top-6 right-6 z-20 px-3 py-1 rounded-full text-xs"
        style={{
          backgroundColor: `${theme.colors.surface}CC`,
          color: theme.colors.text,
          backdropFilter: "blur(8px)",
        }}
      >
        {currentIndex + 1} / {images.length}
      </motion.div>

      {/* Progress bar — only starts after image loads */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5">
        <motion.div
          key={progressKey}
          className="h-full"
          style={{ backgroundColor: theme.colors.primary }}
          initial={{ width: "0%" }}
          animate={{ width: imageLoaded ? "100%" : "0%" }}
          transition={{ duration: imageLoaded ? AUTO_ADVANCE_MS / 1000 : 0, ease: "linear" }}
        />
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              goToIndex(i);
            }}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                i === currentIndex
                  ? theme.colors.primary
                  : `${theme.colors.text}40`,
              transform: i === currentIndex ? "scale(1.8)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
