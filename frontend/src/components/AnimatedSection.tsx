"use client";

import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export function AnimatedSection({ 
  children, 
  className, 
  delay = 0,
  direction = "up" 
}: AnimatedSectionProps) {

  const getVariants = () => {
    switch (direction) {
      case "up": return { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } };
      case "down": return { hidden: { opacity: 0, y: -50 }, visible: { opacity: 1, y: 0 } };
      case "left": return { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } };
      case "right": return { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } };
      default: return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    }
  };

  return (
    <motion.div
      variants={getVariants()}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
