"use client";

import { motion } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import type { RefObject } from "react";

interface AnimatedButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
  target?: string;
  rel?: string;
}

export function AnimatedButton({
  children,
  href,
  variant = "primary",
  className = "",
  onClick,
  target,
  rel
}: AnimatedButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleRipple = useCallback((event: React.MouseEvent) => {
    const element = href ? anchorRef.current : buttonRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  }, [href]);

  const baseClasses = variant === "primary"
    ? "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
    : "border border-input bg-background hover:bg-accent hover:text-accent-foreground";

  if (href) {
    return (
      <motion.a
        ref={anchorRef}
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        onMouseDown={handleRipple}
        className={`relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md px-6 py-3 text-base font-medium transition-colors ${baseClasses} ${className}`}
        whileHover={{
          scale: 1.05,
          boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.3)"
        }}
        whileTap={{ scale: 0.98 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17
        }}
      >
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              transform: "translate(-50%, -50%)"
            }}
            animate={{
              width: 200,
              height: 200,
              opacity: 0
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut"
            }}
          />
        ))}

        {/* Button content */}
        <span className="relative z-10">{children}</span>
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={buttonRef}
      onClick={onClick}
      onMouseDown={handleRipple}
      className={`relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md px-6 py-3 text-base font-medium transition-colors ${baseClasses} ${className}`}
      whileHover={{
        scale: 1.05,
        boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.3)"
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            transform: "translate(-50%, -50%)"
          }}
          animate={{
            width: 200,
            height: 200,
            opacity: 0
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut"
          }}
        />
      ))}

      {/* Button content */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
