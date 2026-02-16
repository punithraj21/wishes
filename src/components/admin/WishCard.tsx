"use client";

import { Wish } from "@/lib/types";
import { THEMES } from "@/lib/constants";
import { formatDate, getPublicWishUrl } from "@/lib/utils";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { motion } from "framer-motion";

interface WishCardProps {
  wish: Wish;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function WishCard({ wish, onEdit, onDelete }: WishCardProps) {
  const theme = THEMES[wish.theme] || THEMES.cartoon;
  const images = wish.wish_media?.filter((m) => m.type === "image") || [];
  const thumbnail = images[0]?.file_url;

  const handleShare = async () => {
    const url = getPublicWishUrl(wish.slug);
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } catch {
      prompt("Copy this link:", url);
    }
  };

  const handlePreview = () => {
    window.open(`/wish/${wish.slug}`, "_blank");
  };

  return (
    <Card className="overflow-hidden">
      {/* Thumbnail */}
      <div className="relative h-44 bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={wish.person_name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-4xl">
            {theme.emoji}
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md"
            style={{
              backgroundColor: `${theme.colors.primary}33`,
              color: theme.colors.primary,
            }}
          >
            {theme.name}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-white font-semibold text-lg truncate">
            {wish.person_name}
          </h3>
          <p className="text-gray-400 text-sm truncate">{wish.title}</p>
          {wish.special_date && (
            <p className="text-gray-500 text-xs mt-1">
              📅 {formatDate(wish.special_date)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          {images.length > 0 && <span>📸 {images.length}</span>}
          {wish.wish_media?.some((m) => m.type === "audio") && (
            <span>🎵 Audio</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-white/5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreview}
            className="flex-1"
          >
            👁️ Preview
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(wish.id)}
            className="flex-1"
          >
            ✏️ Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            🔗
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(wish.id)}
            className="text-red-400"
          >
            🗑️
          </Button>
        </div>
      </div>
    </Card>
  );
}
