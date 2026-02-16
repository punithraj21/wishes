"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ThemeConfig } from "@/lib/types";
import { sanitizeHTML } from "@/lib/utils";

interface MessageRevealProps {
  message: string;
  theme: ThemeConfig;
  onNext: () => void;
}

export default function MessageReveal({
  message,
  theme,
  onNext,
}: MessageRevealProps) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Strip HTML for typewriter, then reveal full HTML when done
  const plainText = message.replace(/<[^>]+>/g, "");

  useEffect(() => {
    if (displayedLength < plainText.length) {
      const timer = setTimeout(() => {
        setDisplayedLength((prev) => prev + 1);
        // Auto-scroll
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 30);
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [displayedLength, plainText.length]);

  const skipAnimation = () => {
    setDisplayedLength(plainText.length);
    setIsComplete(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 relative"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10 }}
            className="text-4xl mb-3"
          >
            💌
          </motion.div>
          <h2
            className="text-2xl md:text-3xl font-bold"
            style={{ color: theme.colors.text, fontFamily: theme.font }}
          >
            A Message For You
          </h2>
        </div>

        {/* Message card */}
        <div
          ref={containerRef}
          className="rounded-2xl p-6 md:p-8 max-h-[50vh] overflow-y-auto"
          style={{
            backgroundColor: `${theme.colors.surface}`,
            border: `1px solid ${theme.colors.primary}20`,
            boxShadow: `0 20px 60px ${theme.colors.primary}10`,
          }}
          onClick={!isComplete ? skipAnimation : undefined}
        >
          {!isComplete ? (
            <p
              className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap"
              style={{ color: theme.colors.text, fontFamily: theme.font }}
            >
              {plainText.slice(0, displayedLength)}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-0.5 h-6 ml-1 align-middle"
                style={{ backgroundColor: theme.colors.primary }}
              />
            </p>
          ) : (
            <div
              className="prose prose-lg max-w-none"
              style={
                {
                  color: theme.colors.text,
                  fontFamily: theme.font,
                  "--tw-prose-body": theme.colors.text,
                  "--tw-prose-headings": theme.colors.text,
                  "--tw-prose-bold": theme.colors.text,
                  "--tw-prose-quotes": theme.colors.textMuted,
                } as React.CSSProperties
              }
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(message) }}
            />
          )}
        </div>

        {/* Skip / Continue */}
        <div className="text-center mt-6 space-y-3">
          {!isComplete && (
            <button
              onClick={skipAnimation}
              className="text-sm px-4 py-1.5 rounded-full transition-colors"
              style={{ color: theme.colors.textMuted }}
            >
              Tap to skip animation
            </button>
          )}
          {isComplete && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNext}
              className="px-8 py-3 rounded-full font-medium text-lg"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                color: theme.colors.text,
                boxShadow: `0 8px 30px ${theme.colors.primary}30`,
              }}
            >
              🎉 Time to Celebrate!
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
