"use client";

import { motion } from "framer-motion";

interface AnimatedHeadingProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const container = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: i * 0.04
    }
  })
};

const child = {
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      damping: 12,
      stiffness: 100
    }
  },
  hidden: {
    opacity: 0,
    y: 20,
    transition: {
      type: "spring" as const,
      damping: 12,
      stiffness: 100
    }
  }
};

export function AnimatedHeading({ children, className = "", delay = 0 }: AnimatedHeadingProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      custom={delay}
      className={className}
    >
      {typeof children === 'string' ? (
        children.split(" ").map((word, index) => (
          <motion.span
            key={index}
            variants={child}
            style={{ display: 'inline-block', marginRight: '0.25em' }}
            className={word === "UI" || word === "Components" ? "gradient-text" : ""}
          >
            {word}
          </motion.span>
        ))
      ) : (
        children
      )}
    </motion.div>
  );
}
