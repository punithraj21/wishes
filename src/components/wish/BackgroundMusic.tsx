"use client";

import { useEffect, useRef } from "react";
import { Howl } from "howler";

interface BackgroundMusicProps {
  src: string;
  play: boolean;
  loop?: boolean;
  volume?: number;
}

export default function BackgroundMusic({
  src,
  play,
  loop = true,
  volume = 0.4,
}: BackgroundMusicProps) {
  const howlRef = useRef<Howl | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    howlRef.current = new Howl({
      src: [src],
      loop,
      volume,
      html5: true,
    });

    return () => {
      howlRef.current?.unload();
    };
  }, [src, loop, volume]);

  useEffect(() => {
    if (play && howlRef.current && !startedRef.current) {
      startedRef.current = true;
      howlRef.current.play();
    } else if (!play && howlRef.current) {
      howlRef.current.pause();
      startedRef.current = false;
    }
  }, [play]);

  return null; // No UI
}
