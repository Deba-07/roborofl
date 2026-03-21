"use client";

import { motion } from "framer-motion";

interface FloatingCardProps {
  emoji: string;
  label: string;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
  rotate?: number;
}

export default function FloatingCard({
  emoji,
  label,
  style,
  delay = 0,
  duration = 3,
  rotate = 0,
}: FloatingCardProps) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
        className="glass-card"
        style={{
          transform: `rotate(${rotate}deg)`,
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "1rem",
          padding: "0.75rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>{emoji}</span>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "'Public Sans', sans-serif",
          }}
        >
          {label}
        </span>
      </motion.div>
    </motion.div>
  );
}