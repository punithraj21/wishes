import { ThemeConfig, ThemeKey } from "./types";

export const THEMES: Record<ThemeKey, ThemeConfig> = {
  cartoon: {
    key: "cartoon",
    name: "Cartoon",
    description: "Fun and playful with vibrant colors",
    emoji: "🎨",
    colors: {
      primary: "#FF6B6B",
      secondary: "#4ECDC4",
      accent: "#FFE66D",
      background: "#1a1a2e",
      surface: "#16213e",
      text: "#ffffff",
      textMuted: "#a0a0b8",
    },
    font: "Outfit",
  },
  elegant: {
    key: "elegant",
    name: "Elegant",
    description: "Sophisticated and refined",
    emoji: "✨",
    colors: {
      primary: "#C9A96E",
      secondary: "#8B7355",
      accent: "#F5E6CC",
      background: "#0D0D0D",
      surface: "#1A1A1A",
      text: "#F5F0EB",
      textMuted: "#A89B8C",
    },
    font: "Playfair Display",
  },
  minimal: {
    key: "minimal",
    name: "Minimal",
    description: "Clean and modern simplicity",
    emoji: "🤍",
    colors: {
      primary: "#6C63FF",
      secondary: "#3F3D56",
      accent: "#A8A5FF",
      background: "#0F0E17",
      surface: "#1A1929",
      text: "#FFFFFE",
      textMuted: "#94A1B2",
    },
    font: "Inter",
  },
  festive: {
    key: "festive",
    name: "Festive",
    description: "Bright and celebratory vibes",
    emoji: "🎉",
    colors: {
      primary: "#FF4081",
      secondary: "#7C4DFF",
      accent: "#FFD740",
      background: "#120338",
      surface: "#1B0A4A",
      text: "#FFFFFF",
      textMuted: "#B0A0D0",
    },
    font: "Outfit",
  },
};

export const FILE_LIMITS = {
  IMAGE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  AUDIO_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGES: 10,
};

export const ALLOWED_IMAGE_FORMATS = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_AUDIO_FORMATS = ["audio/mpeg", "audio/wav", "audio/mp3"];

export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
export const ALLOWED_AUDIO_EXTENSIONS = [".mp3", ".wav"];
