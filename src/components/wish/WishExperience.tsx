"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Wish, WishMedia, ThemeConfig } from "@/lib/types";
import { THEMES } from "@/lib/constants";
import IntroScreen from "./IntroScreen";
import NameReveal from "./NameReveal";
import CountdownSection from "./CountdownSection";
import MemoryGallery from "./MemoryGallery";
import MessageReveal from "./MessageReveal";
import LoveAffirmations from "./LoveAffirmations";
import HeartFill from "./HeartFill";
import DinoSection from "./DinoSection";
import CelebrationScreen from "./CelebrationScreen";
import BirthdayCake from "./BirthdayCake";
import BackgroundMusic from "./BackgroundMusic";

// Lazy load Three.js components
const Starfield = dynamic(() => import("./Starfield"), {
  ssr: false,
  loading: () => null,
});

interface WishExperienceProps {
  wish: Wish;
}

/**
 * Cinematic single-page vertical scroll wish experience.
 * Flow: Intro → Name → Countdown → Gallery → Message → Affirmations → Hearts → Lanterns → Celebration
 */
export default function WishExperience({ wish }: WishExperienceProps) {
  const theme: ThemeConfig = THEMES[wish.theme] || THEMES.cartoon;
  const [started, setStarted] = useState(false);
  const [unlockedSections, setUnlockedSections] = useState(1);

  const images = (wish.wish_media || [])
    .filter((m: WishMedia) => m.type === "image")
    .sort((a: WishMedia, b: WishMedia) => a.order_index - b.order_index);

  const audio = (wish.wish_media || []).find(
    (m: WishMedia) => m.type === "audio",
  );

  // Build list of sections — new sections added to the flow
  const sections: string[] = ["intro", "name"];
  if (wish.special_date) sections.push("countdown");
  sections.push("dino");
  if (images.length > 0) sections.push("gallery");
  if (wish.message?.trim()) sections.push("message");
  sections.push("affirmations", "hearts", "lanterns", "celebration");

  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToSection = useCallback((index: number) => {
    const el = sectionRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const unlockNext = useCallback(() => {
    setUnlockedSections((prev) => {
      const next = prev + 1;
      setTimeout(() => scrollToSection(next - 1), 300);
      return next;
    });
  }, [scrollToSection]);

  const handleIntroNext = useCallback(() => {
    setStarted(true);
    unlockNext();
  }, [unlockNext]);

  const handleReplay = useCallback(() => {
    setUnlockedSections(1);
    setStarted(false);
    scrollToSection(0);
  }, [scrollToSection]);

  return (
    <div
      className="relative w-full overflow-y-auto overflow-x-hidden"
      style={{
        backgroundColor: theme.colors.background,
        scrollBehavior: "smooth",
      }}
    >
      {/* Persistent Three.js starfield background */}
      <Starfield />

      {/* Background music */}
      <BackgroundMusic
        src={audio ? audio.file_url : "/music.mp3"}
        play={started}
      />

      {/* === SECTIONS === */}
      {sections.map((section, idx) => {
        const isUnlocked = idx < unlockedSections;
        if (!isUnlocked) return null;

        return (
          <div
            key={section}
            ref={(el) => {
              sectionRefs.current[idx] = el;
            }}
          >
            {section === "intro" && (
              <IntroScreen
                personName={wish.person_name}
                theme={theme}
                onNext={handleIntroNext}
              />
            )}

            {section === "name" && (
              <NameReveal
                personName={wish.person_name}
                title={wish.title}
                specialDate={wish.special_date}
                theme={theme}
                onNext={unlockNext}
              />
            )}

            {section === "countdown" && (
              <CountdownSection
                personName={wish.person_name}
                specialDate={wish.special_date!}
                theme={theme}
                onNext={unlockNext}
              />
            )}

            {section === "dino" && (
              <DinoSection
                personName={wish.person_name}
                theme={theme}
                onNext={unlockNext}
              />
            )}

            {section === "gallery" && (
              <MemoryGallery
                images={images}
                theme={theme}
                onNext={unlockNext}
              />
            )}

            {section === "message" && (
              <MessageReveal
                message={wish.message}
                theme={theme}
                onNext={unlockNext}
              />
            )}

            {section === "affirmations" && (
              <LoveAffirmations
                personName={wish.person_name}
                theme={theme}
                onNext={unlockNext}
              />
            )}

            {section === "hearts" && (
              <HeartFill
                personName={wish.person_name}
                theme={theme}
                onNext={unlockNext}
              />
            )}

            {section === "lanterns" && (
              <LanternSection
                personName={wish.person_name}
                theme={theme}
                onNext={unlockNext}
              />
            )}

            {section === "celebration" && (
              <CelebrationScreen
                personName={wish.person_name}
                theme={theme}
                onReplay={handleReplay}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* Lantern section — wish lanterns interactive moment */
function LanternSection({
  personName,
  theme,
  onNext,
}: {
  personName: string;
  theme: ThemeConfig;
  onNext: () => void;
}) {
  return (
    <div className="min-h-screen relative">
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl"
            style={{ backgroundColor: `${theme.colors.primary}15` }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </div>

        {/* Title */}
        <div className="text-center mb-8 relative z-10">
          <h2
            className="text-2xl md:text-4xl font-bold mb-2"
            style={{ color: theme.colors.text, fontFamily: theme.font }}
          >
            Release your wishes into the sky
          </h2>
          <p
            className="text-sm md:text-base"
            style={{ color: theme.colors.textMuted }}
          >
            Tap each lantern to set it free, {personName}
          </p>
        </div>

        {/* Interactive Lanterns */}
        <div className="relative z-10">
          <BirthdayCake
            personName={personName}
            theme={theme}
            onAllCandlesBlown={onNext}
          />
        </div>
      </div>
    </div>
  );
}
