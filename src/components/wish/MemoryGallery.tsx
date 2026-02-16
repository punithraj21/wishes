"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeConfig, WishMedia } from "@/lib/types";
import Image from "next/image";

interface MemoryGalleryProps {
  images: WishMedia[];
  theme: ThemeConfig;
  onNext: () => void;
}

export default function MemoryGallery({
  images,
  theme,
  onNext,
}: MemoryGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const navigate = (newIndex: number) => {
    setDirection(newIndex > currentIndex ? 1 : -1);
    setCurrentIndex(newIndex);
  };

  const goNext = () => {
    if (currentIndex < images.length - 1) {
      navigate(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      navigate(currentIndex - 1);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  if (images.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ backgroundColor: theme.colors.background }}
      >
        <p className="text-lg" style={{ color: theme.colors.textMuted }}>
          No memories to show
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="mt-6 px-8 py-3 rounded-full font-medium text-lg"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
            color: theme.colors.text,
          }}
        >
          Continue →
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 relative"
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2
          className="text-2xl md:text-3xl font-bold mb-2"
          style={{ color: theme.colors.text, fontFamily: theme.font }}
        >
          📸 Memory Lane
        </h2>
        <p className="text-sm" style={{ color: theme.colors.textMuted }}>
          {currentIndex + 1} of {images.length}
        </p>
      </motion.div>

      {/* Image carousel */}
      <div className="relative w-full max-w-lg mx-auto aspect-[3/4] md:aspect-[4/3] rounded-2xl overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentIndex].file_url}
              alt={`Memory ${currentIndex + 1}`}
              fill
              className="object-cover rounded-2xl"
              priority
            />
            {/* Gradient overlay at bottom */}
            <div
              className="absolute inset-x-0 bottom-0 h-24"
              style={{
                background: `linear-gradient(transparent, ${theme.colors.background})`,
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {currentIndex > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
          >
            ←
          </button>
        )}
        {currentIndex < images.length - 1 && (
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
          >
            →
          </button>
        )}
      </div>

      {/* Dots */}
      <div className="flex gap-2 mt-4">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => navigate(i)}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                i === currentIndex
                  ? theme.colors.primary
                  : `${theme.colors.text}30`,
              transform: i === currentIndex ? "scale(1.5)" : "scale(1)",
            }}
          />
        ))}
      </div>

      {/* Continue button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        className="mt-8 px-8 py-3 rounded-full font-medium text-lg"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
          color: theme.colors.text,
          boxShadow: `0 8px 30px ${theme.colors.primary}30`,
        }}
      >
        See the Message →
      </motion.button>
    </motion.div>
  );
}
