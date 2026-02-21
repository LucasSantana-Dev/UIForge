'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function RotatingSparkles() {
  return (
    <motion.div
      animate={{
        rotate: [0, 360],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <Sparkles className="h-4 w-4 text-primary" />
    </motion.div>
  );
}
