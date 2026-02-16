"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import dynamic from "next/dynamic";
import { Wish, WishMedia, ThemeConfig } from "@/lib/types";
import { THEMES } from "@/lib/constants";
import IntroScreen from "./IntroScreen";
import NameReveal from "./NameReveal";
import MemoryGallery from "./MemoryGallery";
import MessageReveal from "./MessageReveal";
import CelebrationScreen from "./CelebrationScreen";
import BirthdayCake from "./BirthdayCake";
import FloatingBalloons from "./FloatingBalloons";
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
 * Single-page vertical scroll wish experience.
 */
export default function WishExperience({ wish }: WishExperienceProps) {
  const theme: ThemeConfig = THEMES[wish.theme] || THEMES.cartoon;
  const [started, setStarted] = useState(false);
  const [unlockedSections, setUnlockedSections] = useState(1);
  const [balloonsFlyAway, setBalloonsFlyAway] = useState(false);

  const images = (wish.wish_media || [])
    .filter((m: WishMedia) => m.type === "image")
    .sort((a: WishMedia, b: WishMedia) => a.order_index - b.order_index);

  const audio = (wish.wish_media || []).find(
    (m: WishMedia) => m.type === "audio",
  );

  // Build list of sections to show
  const sections: string[] = ["intro", "name"];
  if (images.length > 0) sections.push("gallery");
  if (wish.message?.trim()) sections.push("message");
  sections.push("cake", "celebration");

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
    setBalloonsFlyAway(true); // Fly away after intro (first screen only)
    unlockNext();
  }, [unlockNext]);

  const handleCakeNext = useCallback(() => {
    unlockNext();
  }, [unlockNext]);

  const handleReplay = useCallback(() => {
    setUnlockedSections(1);
    setStarted(false);
    setBalloonsFlyAway(false);
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

      {/* Balloons — visible during intro (first screen), then fly away */}
      <FloatingBalloons theme={theme} count={6} flyAway={balloonsFlyAway} />

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
              <ScrollSection theme={theme}>
                <NameReveal
                  personName={wish.person_name}
                  title={wish.title}
                  specialDate={wish.special_date}
                  theme={theme}
                  onNext={unlockNext}
                />
              </ScrollSection>
            )}

            {section === "gallery" && (
              <ScrollSection theme={theme}>
                <MemoryGallery
                  images={images}
                  theme={theme}
                  onNext={unlockNext}
                />
              </ScrollSection>
            )}

            {section === "message" && (
              <ScrollSection theme={theme}>
                <MessageReveal
                  message={wish.message}
                  theme={theme}
                  onNext={unlockNext}
                />
              </ScrollSection>
            )}

            {section === "cake" && (
              <CakeSection
                personName={wish.person_name}
                theme={theme}
                onNext={handleCakeNext}
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

/* Wrapper for sections that animate in when scrolled into view */
function ScrollSection({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: ThemeConfig;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div ref={ref} className="min-h-screen relative">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="min-h-screen"
        style={{ backgroundColor: "transparent" }}
      >
        {children}
      </motion.div>
      {/* Gradient divider between sections */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, transparent, ${theme.colors.background}40)`,
        }}
      />
    </div>
  );
}

/* Cake section — doesn't need ScrollSection wrapper, has its own layout */
import { motion as m } from "framer-motion";

function CakeSection({
  personName,
  theme,
  onNext,
}: {
  personName: string;
  theme: ThemeConfig;
  onNext: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref} className="min-h-screen relative">
      <m.div
        initial={{ opacity: 0, y: 60 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <m.div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl"
            style={{ backgroundColor: `${theme.colors.primary}10` }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

        {/* Title */}
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="text-center mb-8 relative z-10"
        >
          <h2
            className="text-2xl md:text-4xl font-bold mb-2"
            style={{ color: theme.colors.text, fontFamily: theme.font }}
          >
            🎂 Time to blow the candles!
          </h2>
          <p
            className="text-sm md:text-base"
            style={{ color: theme.colors.textMuted }}
          >
            A special cake for {personName}
          </p>
        </m.div>

        {/* Interactive Cake */}
        <div className="relative z-10">
          <BirthdayCake
            personName={personName}
            theme={theme}
            onAllCandlesBlown={onNext}
          />
        </div>
      </m.div>
    </div>
  );
}
