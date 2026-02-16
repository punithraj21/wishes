"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Wish, WishMedia, ThemeConfig } from "@/lib/types";
import { THEMES } from "@/lib/constants";
import IntroScreen from "./IntroScreen";
import NameReveal from "./NameReveal";
import MemoryGallery from "./MemoryGallery";
import MessageReveal from "./MessageReveal";
import CelebrationScreen from "./CelebrationScreen";
import BackgroundMusic from "./BackgroundMusic";
import BirthdayCake from "./BirthdayCake";
import FloatingBalloons from "./FloatingBalloons";

type StepKey =
  | "intro"
  | "name"
  | "gallery"
  | "message"
  | "cake"
  | "celebration";

interface WishExperienceProps {
  wish: Wish;
}

export default function WishExperience({ wish }: WishExperienceProps) {
  const [currentStep, setCurrentStep] = useState<StepKey>("intro");
  const theme: ThemeConfig = THEMES[wish.theme] || THEMES.cartoon;

  const images = (wish.wish_media || [])
    .filter((m: WishMedia) => m.type === "image")
    .sort((a: WishMedia, b: WishMedia) => a.order_index - b.order_index);

  const audio = (wish.wish_media || []).find(
    (m: WishMedia) => m.type === "audio",
  );

  const steps: StepKey[] = [
    "intro",
    "name",
    "gallery",
    "message",
    "cake",
    "celebration",
  ];

  const goToStep = (step: StepKey) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    const currentIdx = steps.indexOf(currentStep);
    let nextIdx = currentIdx + 1;

    // Skip gallery if no images
    if (steps[nextIdx] === "gallery" && images.length === 0) {
      nextIdx++;
    }
    // Skip message if no message
    if (steps[nextIdx] === "message" && !wish.message?.trim()) {
      nextIdx++;
    }

    if (nextIdx < steps.length) {
      goToStep(steps[nextIdx]);
    }
  };

  const replay = () => {
    setCurrentStep("intro");
  };

  // Show balloons from name reveal onward
  const showBalloons = currentStep !== "intro";

  return (
    <div className="relative">
      {/* Floating balloons (behind content) */}
      {showBalloons && <FloatingBalloons theme={theme} count={10} />}

      <AnimatePresence mode="wait">
        {currentStep === "intro" && (
          <IntroScreen
            key="intro"
            personName={wish.person_name}
            theme={theme}
            onNext={nextStep}
          />
        )}
        {currentStep === "name" && (
          <NameReveal
            key="name"
            personName={wish.person_name}
            title={wish.title}
            specialDate={wish.special_date}
            theme={theme}
            onNext={nextStep}
          />
        )}
        {currentStep === "gallery" && (
          <MemoryGallery
            key="gallery"
            images={images}
            theme={theme}
            onNext={nextStep}
          />
        )}
        {currentStep === "message" && (
          <MessageReveal
            key="message"
            message={wish.message}
            theme={theme}
            onNext={nextStep}
          />
        )}
        {currentStep === "cake" && (
          <CakeStep
            key="cake"
            personName={wish.person_name}
            theme={theme}
            onNext={nextStep}
          />
        )}
        {currentStep === "celebration" && (
          <CelebrationScreen
            key="celebration"
            personName={wish.person_name}
            theme={theme}
            onReplay={replay}
          />
        )}
      </AnimatePresence>

      {/* Background music - invisible, auto-plays after intro */}
      <BackgroundMusic
        src={audio ? audio.file_url : "/music.mp3"}
        play={currentStep !== "intro"}
      />
    </div>
  );
}

/* Cake Step - wraps BirthdayCake with full-screen layout */
import { motion } from "framer-motion";

function CakeStep({
  personName,
  theme,
  onNext,
}: {
  personName: string;
  theme: ThemeConfig;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: `${theme.colors.primary}10` }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
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
      </motion.div>

      {/* Interactive Cake */}
      <div className="relative z-10">
        <BirthdayCake
          personName={personName}
          theme={theme}
          onAllCandlesBlown={onNext}
        />
      </div>
    </motion.div>
  );
}
