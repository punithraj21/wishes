"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { ALLOWED_IMAGE_FORMATS, FILE_LIMITS } from "@/lib/constants";
import { UploadedFile } from "@/lib/types";
import Image from "next/image";

interface ImageUploaderProps {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  existingUrls?: string[];
  onRemoveExisting?: (url: string) => void;
}

export default function ImageUploader({
  files,
  onChange,
  existingUrls = [],
  onRemoveExisting,
}: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      const totalCount =
        files.length + existingUrls.length + acceptedFiles.length;
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

      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      }));
      onChange([...files, ...newFiles]);
    },
    [files, existingUrls.length, onChange],
  );

  const removeFile = (id: string) => {
    const updated = files.filter((f) => f.id !== id);
    onChange(updated);
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

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        <AnimatePresence mode="popLayout">
          {existingUrls.map((url) => (
            <motion.div
              key={url}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative aspect-square rounded-xl overflow-hidden group"
            >
              <Image src={url} alt="Upload" fill className="object-cover" />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(url)}
                  className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              )}
            </motion.div>
          ))}
          {files.map((file) => (
            <motion.div
              key={file.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative aspect-square rounded-xl overflow-hidden group"
            >
              <Image
                src={file.preview}
                alt="Preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
