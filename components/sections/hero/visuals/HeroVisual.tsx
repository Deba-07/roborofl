"use client";

import { motion } from "framer-motion";
import FloatingCard from "../cards/FloatingCard";

export default function HeroVisual() {
  return (
    <div className="flex-1 relative w-full aspect-square max-w-lg mx-auto lg:mx-0">

      {/* ── Main Mascot Box ── */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
          style={{
            width: "clamp(240px, 40vw, 340px)",
            height: "clamp(240px, 40vw, 340px)",
          }}
        >
          {/* Glass box */}
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "3rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              boxShadow: "0 0 100px rgba(236, 91, 19, 0.12)",
              position: "relative",
            }}
          >
            {/* Inner border ring */}
            <div
              style={{
                position: "absolute",
                inset: "1rem",
                border: "1px solid rgba(236, 91, 19, 0.18)",
                borderRadius: "2.5rem",
                pointerEvents: "none",
              }}
            />
            {/* Scan line sweep */}
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, transparent 0%, rgba(236,91,19,0.04) 50%, transparent 100%)",
                pointerEvents: "none",
              }}
              animate={{ y: ["-100%", "100%"] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            />
            {/* Emoji mascot */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                fontSize: "clamp(5rem, 12vw, 8rem)",
                lineHeight: 1,
                filter: "drop-shadow(0 0 40px rgba(250,204,21,0.35))",
                userSelect: "none",
              }}
            >
              😂
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ── Floating Notification Cards ── */}

      {/* Growth card — top left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute"
        style={{ top: "8%", left: "-2%" }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "1rem",
            padding: "1rem 1.25rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                background: "rgba(34, 197, 94, 0.15)",
                borderRadius: "0.5rem",
                padding: "0.4rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUpIcon />
            </div>
            <div>
              <p
                style={{
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.4)",
                  margin: 0,
                  fontFamily: "'Public Sans', sans-serif",
                }}
              >
                Growth
              </p>
              <p
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 900,
                  color: "white",
                  margin: 0,
                  lineHeight: 1.1,
                  fontFamily: "'Public Sans', sans-serif",
                }}
              >
                +480%
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Live campaign — bottom right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute"
        style={{ bottom: "14%", right: "-2%" }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "1rem",
            padding: "0.9rem 1.1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span
              style={{
                width: "0.6rem",
                height: "0.6rem",
                borderRadius: "50%",
                background: "#ef4444",
                animation: "pulse 1.5s ease-in-out infinite",
                flexShrink: 0,
              }}
            />
            <div>
              <p
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "white",
                  margin: 0,
                  fontFamily: "'Public Sans', sans-serif",
                }}
              >
                Live campaign running
              </p>
              <p
                style={{
                  fontSize: "0.6rem",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.4)",
                  margin: 0,
                  fontFamily: "'Public Sans', sans-serif",
                }}
              >
                Viral status: CRITICAL 🔥
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Emoji stickers */}
      <FloatingCard emoji="🔥" label="" style={{ top: "12%", right: "12%" }} delay={1.3} duration={2.8} rotate={12} />
      <FloatingCard emoji="💀" label="" style={{ bottom: "18%", left: "6%" }} delay={1.5} duration={3.2} rotate={-12} />
      <FloatingCard emoji="💯" label="" style={{ top: "48%", right: "-4%" }} delay={1.7} duration={3.6} rotate={6} />

      {/* Zomato notification pill */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute"
        style={{ top: "55%", left: "-8%" }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(250,204,21,0.25)",
            borderRadius: "9999px",
            padding: "0.4rem 0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              width: "1.4rem",
              height: "1.4rem",
              borderRadius: "50%",
              background: "#facc15",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <BellIcon />
          </div>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "white",
              whiteSpace: "nowrap",
              fontFamily: "'Public Sans', sans-serif",
            }}
          >
            @Zomato just amplified a meme!
          </span>
        </motion.div>
      </motion.div>

      {/* Particle dots */}
      <div className="absolute top-1/4 right-1/4 size-1 bg-[#ec5b13] rounded-full blur-[1px] animate-pulse" />
      <div className="absolute bottom-1/3 left-1/4 size-1.5 bg-[#facc15] rounded-full blur-[1px] animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 size-1 bg-white rounded-full blur-[1px] animate-pulse" style={{ animationDelay: "2s" }} />
    </div>
  );
}

function TrendingUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1a0f0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}