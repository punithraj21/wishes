"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Howl } from "howler";

interface AudioPlayerProps {
  audioUrl: string;
  autoPlay?: boolean;
  accentColor?: string;
}

export default function AudioPlayer({
  audioUrl,
  autoPlay = false,
  accentColor = "#7C3AED",
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const soundRef = useRef<Howl | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const sound = new Howl({
      src: [audioUrl],
      html5: true,
      onload: () => {
        setDuration(sound.duration());
      },
      onplay: () => {
        setIsPlaying(true);
        updateProgress();
      },
      onpause: () => {
        setIsPlaying(false);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      },
      onstop: () => {
        setIsPlaying(false);
        setProgress(0);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      },
      onend: () => {
        setIsPlaying(false);
        setProgress(0);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      },
    });

    soundRef.current = sound;

    if (autoPlay) {
      // Defer autoplay to after user interaction
      const handleClick = () => {
        if (soundRef.current && !soundRef.current.playing()) {
          soundRef.current.play();
        }
        document.removeEventListener("click", handleClick);
      };
      document.addEventListener("click", handleClick, { once: true });
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      sound.unload();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  const updateProgress = () => {
    if (soundRef.current && soundRef.current.playing()) {
      const seek = soundRef.current.seek() as number;
      setProgress(seek);
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const togglePlay = () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm"
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl shadow-2xl border border-white/10"
        style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      >
        {/* Play/Pause */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: accentColor }}
        >
          {isPlaying ? (
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-white ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </motion.button>

        {/* Progress */}
        <div className="flex-1 space-y-1">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Music note */}
        <motion.span
          animate={isPlaying ? { rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-sm"
        >
          🎵
        </motion.span>
      </div>
    </motion.div>
  );
}
