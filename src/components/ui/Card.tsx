"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className,
  hover = false,
  onClick,
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      className={cn(
        "bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm",
        "transition-all duration-300",
        hover &&
          "cursor-pointer hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
