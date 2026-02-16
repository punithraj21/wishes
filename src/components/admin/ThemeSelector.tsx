"use client";

import { THEMES } from "@/lib/constants";
import { ThemeKey } from "@/lib/types";
import { motion } from "framer-motion";

interface ThemeSelectorProps {
  selected: ThemeKey;
  onChange: (theme: ThemeKey) => void;
}

export default function ThemeSelector({
  selected,
  onChange,
}: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.values(THEMES).map((theme) => (
        <motion.button
          key={theme.key}
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(theme.key)}
          className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
            selected === theme.key
              ? "border-violet-500 bg-violet-500/10"
              : "border-white/10 bg-white/5 hover:border-white/20"
          }`}
        >
          {selected === theme.key && (
            <motion.div
              layoutId="theme-check"
              className="absolute top-2 right-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center"
            >
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
          )}
          <div className="text-2xl mb-2">{theme.emoji}</div>
          <p className="text-white font-medium text-sm">{theme.name}</p>
          <p className="text-gray-400 text-xs mt-0.5">{theme.description}</p>
          <div className="flex gap-1.5 mt-3">
            {[
              theme.colors.primary,
              theme.colors.secondary,
              theme.colors.accent,
            ].map((color) => (
              <div
                key={color}
                className="w-5 h-5 rounded-full border border-white/20"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </motion.button>
      ))}
    </div>
  );
}
