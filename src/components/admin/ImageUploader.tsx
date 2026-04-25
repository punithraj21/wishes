"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { FILE_LIMITS } from "@/lib/constants";
import { MediaItem } from "@/lib/types";
import Image from "next/image";

interface ImageUploaderProps {
  items: MediaItem[];
  onChange: (items: MediaItem[]) => void;
}

export default function ImageUploader({ items, onChange }: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      const totalCount = items.length + acceptedFiles.length;
      if (totalCount > FILE_LIMITS.MAX_IMAGES) {
        setError(`Maximum ${FILE_LIMITS.MAX_IMAGES} images allowed`);
        return;
      }

      const oversized = acceptedFiles.find(
        (f) => f.size > FILE_LIMITS.IMAGE_MAX_SIZE,
      );
      if (oversized) {
        setError(`File "${oversized.name}" exceeds 10MB limit`);
        return;
      }

      const newItems: MediaItem[] = acceptedFiles.map((file) => ({
        kind: "new" as const,
        file,
        preview: URL.createObjectURL(file),
        id: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      }));
      onChange([...items, ...newItems]);
    },
    [items, onChange],
  );

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const reorder = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const fromIdx = items.findIndex((i) => i.id === fromId);
    const toIdx = items.findIndex((i) => i.id === toId);
    if (fromIdx === -1 || toIdx === -1) return;
    const next = [...items];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    onChange(next);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxSize: FILE_LIMITS.IMAGE_MAX_SIZE,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? "border-violet-500 bg-violet-500/10"
            : "border-white/20 hover:border-white/40 bg-white/5"
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <div className="text-3xl">📸</div>
          <p className="text-white font-medium">
            {isDragActive
              ? "Drop images here..."
              : "Drag & drop images or click to select"}
          </p>
          <p className="text-sm text-gray-400">
            JPG, PNG, WebP • Max 10MB each • Up to {FILE_LIMITS.MAX_IMAGES}{" "}
            images
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {items.length > 1 && (
        <p className="text-xs text-gray-400 flex items-center gap-1.5">
          <span>↕️</span> Drag images to reorder
        </p>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        <AnimatePresence mode="popLayout">
          {items.map((item) => {
            const src = item.kind === "existing" ? item.url : item.preview;
            const isDragging = draggedId === item.id;
            const isHover =
              hoverId === item.id && draggedId && draggedId !== item.id;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isDragging ? 0.4 : 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square"
              >
                <div
                  draggable
                  onDragStart={(e) => {
                    setDraggedId(item.id);
                    if (e.dataTransfer) {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", item.id);
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
                    if (draggedId && draggedId !== item.id) {
                      setHoverId(item.id);
                    }
                  }}
                  onDragLeave={() => {
                    if (hoverId === item.id) setHoverId(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedId) reorder(draggedId, item.id);
                    setDraggedId(null);
                    setHoverId(null);
                  }}
                  onDragEnd={() => {
                    setDraggedId(null);
                    setHoverId(null);
                  }}
                  className={`relative w-full h-full rounded-xl overflow-hidden group cursor-grab active:cursor-grabbing select-none ring-2 ${
                    isHover ? "ring-violet-400" : "ring-transparent"
                  }`}
                >
                  <Image
                    src={src}
                    alt="Image"
                    fill
                    className="object-cover pointer-events-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
