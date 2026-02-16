export interface Wish {
  id: string;
  slug: string;
  person_name: string;
  title: string;
  special_date: string | null;
  message: string;
  theme: ThemeKey;
  created_by: string;
  created_at: string;
  updated_at: string;
  wish_media?: WishMedia[];
}

export interface WishMedia {
  id: string;
  wish_id: string;
  type: "image" | "audio";
  file_url: string;
  order_index: number;
}

export interface WishFormData {
  person_name: string;
  title: string;
  special_date?: string;
  message: string;
  theme: ThemeKey;
}

export type ThemeKey = "cartoon" | "elegant" | "minimal" | "festive";

export interface ThemeConfig {
  key: ThemeKey;
  name: string;
  description: string;
  emoji: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
  };
  font: string;
}

export interface UploadedFile {
  file: File;
  preview: string;
  id: string;
}
