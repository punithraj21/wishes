"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { ThemeConfig } from "@/lib/types";
import { sanitizeHTML } from "@/lib/utils";

interface MessageRevealProps {
  message: string;
  theme: ThemeConfig;
  onNext: () => void;
}

const WORD_DELAY_MS = 120;

export default function MessageReveal({
  message,
  theme,
  onNext,
}: MessageRevealProps) {
  const [revealedWords, setRevealedWords] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const plainText = message.replace(/<[^>]+>/g, "");
  const words = useMemo(
    () => plainText.split(/\s+/).filter((w) => w.length > 0),
    [plainText],
  );

  useEffect(() => {
    if (revealedWords < words.length) {
      const timer = setTimeout(() => {
        setRevealedWords((prev) => prev + 1);
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, WORD_DELAY_MS);
      return () => clearTimeout(timer);
    } else if (words.length > 0) {
      setIsComplete(true);
    }
  }, [revealedWords, words.length]);

  const skipAnimation = () => {
    setRevealedWords(words.length);
    setIsComplete(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 relative">
      <div className="relative w-full max-w-xl">
        {/* Heart icon */}
        <div className="text-center mb-6">
          <span className="text-3xl inline-block">💌</span>
        </div>

        {/* Left margin line */}
        <div
          className="absolute left-0 top-20 w-px rounded-full transition-all duration-300"
          style={{
            background: `linear-gradient(to bottom, ${theme.colors.primary}30, ${theme.colors.primary}08)`,
            height: isComplete ? "70%" : `${(revealedWords / Math.max(words.length, 1)) * 70}%`,
          }}
        />

        {/* Message area */}
        <div
          ref={containerRef}
          className="max-h-[55vh] overflow-y-auto px-6 md:px-8"
          onClick={!isComplete ? skipAnimation : undefined}
        >
          {!isComplete ? (
            <p
              className="text-xl md:text-2xl leading-relaxed"
              style={{ color: theme.colors.text, fontFamily: theme.font }}
            >
              {words.slice(0, revealedWords).map((word, i) => (
                <span
                  key={i}
                  className="inline-block mr-[0.3em] animate-fade-in"
                >
                  {word}
                </span>
              ))}
              {/* Blinking cursor */}
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
                  fontSize: "1.25rem",
                  lineHeight: "1.75",
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
        <div className="text-center mt-8 space-y-3">
          {!isComplete && (
            <button
              onClick={skipAnimation}
              className="text-sm px-4 py-1.5 rounded-full transition-colors opacity-60"
              style={{ color: theme.colors.textMuted }}
            >
              tap to reveal
            </button>
          )}
          {isComplete && (
            <button
              onClick={onNext}
              className="px-8 py-3 rounded-full font-medium text-lg border transition-all hover:scale-105 active:scale-95"
              style={{
                borderColor: `${theme.colors.primary}40`,
                color: theme.colors.text,
                backgroundColor: `${theme.colors.primary}15`,
              }}
            >
              <span className="flex items-center gap-2 justify-center">
                Keep reading...
                <span className="animate-bounce">↓</span>
              </span>
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
