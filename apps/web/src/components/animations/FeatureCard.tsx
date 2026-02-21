"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  delay?: number;
}

export function FeatureCard({ icon, title, description, className = "", delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      className={`space-y-4 rounded-lg border bg-card p-6 ${className}`}
      initial={{ 
        opacity: 0, 
        y: 30,
        scale: 0.95
      }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        scale: 1
      }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{
        y: -5,
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(139, 92, 246, 0.1), 0 10px 10px -5px rgba(139, 92, 246, 0.04)"
      }}
      style={{
        transformStyle: "preserve-3d"
      }}
    >
      {/* Icon container with hover animation */}
      <motion.div
        className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"
        whileHover={{
          rotate: [0, -5, 5, -5, 0],
          scale: 1.1
        }}
        transition={{
          duration: 0.5,
          ease: "easeInOut"
        }}
      >
        {icon}
      </motion.div>

      {/* Title with subtle animation */}
      <motion.h3 
        className="text-xl font-semibold"
        whileHover={{
          x: 5,
          color: "hsl(var(--primary))"
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut"
        }}
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p 
        className="text-muted-foreground"
        initial={{ opacity: 0.7 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {description}
      </motion.p>

      {/* Decorative gradient border on hover */}
      <motion.div
        className="absolute inset-0 rounded-lg border-2 border-primary/20 opacity-0"
        whileHover={{
          opacity: 1,
          scale: 1.05
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut"
        }}
        style={{
          pointerEvents: "none"
        }}
      />
    </motion.div>
  );
}
