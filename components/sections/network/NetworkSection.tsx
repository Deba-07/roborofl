"use client";

import { useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";

const SplitText = dynamic(() => import("@/components/ui/SplitText"), { ssr: false });

// ── Data ───────────────────────────────────────────────────────────────────────
const ROW1 = [
  { label: "Humor & Memes",   icon: "😂", color: "#facc15" },
  { label: "Tech & Startups", icon: "💻", color: "#38bdf8" },
  { label: "Finance & Money", icon: "💸", color: "#4ade80" },
  { label: "Bollywood & Films",icon:"🎬", color: "#a78bfa" },
  { label: "Cricket & Sports", icon: "🏏", color: "#ec5b13" },
  { label: "Gen Z & Youth",   icon: "⚡", color: "#facc15" },
];
const ROW2 = [
  { label: "Political & News",    icon: "🗳️", color: "#4ade80" },
  { label: "D2C & Lifestyle",     icon: "🛍️", color: "#ec5b13" },
  { label: "AI & SaaS",           icon: "🤖", color: "#a78bfa" },
  { label: "Global English",      icon: "🌍", color: "#f472b6" },
  { label: "Regional & Language", icon: "🗣️", color: "#38bdf8" },
  { label: "Podcast & Audio",     icon: "🎙️", color: "#facc15" },
];
const ROW3 = [
  { label: "Startup Memes",  icon: "🚀", color: "#ec5b13" },
  { label: "Crypto & Web3",  icon: "🔗", color: "#38bdf8" },
  { label: "OTT & Streaming",icon: "📺", color: "#a78bfa" },
  { label: "Gym & Fitness",  icon: "💪", color: "#4ade80" },
  { label: "Food & Foodies", icon: "🍔", color: "#facc15" },
  { label: "Travel & Reels", icon: "✈️", color: "#f472b6" },
];

const STATS = [
  { value: "500+", label: "Verified Pages",      color: "#ec5b13" },
  { value: "12",   label: "Content Categories",  color: "#facc15" },
  { value: "100%", label: "Manually Reviewed",   color: "#4ade80" },
  { value: "0",    label: "Bots or Fakes",        color: "#38bdf8" },
];

// ── Pill component ─────────────────────────────────────────────────────────────
function Pill({ label, icon, color }: { label: string; icon: string; color: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{
        scale: hovered ? 1.14 : 1,
        background: hovered ? `${color}22` : "rgba(255,255,255,0.05)",
        boxShadow: hovered ? `0 0 32px ${color}50, 0 0 0 1px ${color}60` : "0 0 0 1px rgba(255,255,255,0.1)",
      }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "inline-flex", alignItems: "center", gap: "10px",
        padding: "12px 22px",
        borderRadius: "9999px",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        cursor: "default",
        flexShrink: 0,
        zIndex: hovered ? 2 : 1,
        position: "relative",
      }}
    >
      {/* glow orb behind icon */}
      {hovered && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: "absolute", inset: 0,
            borderRadius: "9999px",
            background: `radial-gradient(circle at 30% 50%, ${color}30, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      )}
      <motion.span
        animate={{ rotate: hovered ? 15 : 0, scale: hovered ? 1.2 : 1 }}
        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] as [number,number,number,number] }}
        style={{ fontSize: "18px", lineHeight: 1, position: "relative" }}
      >
        {icon}
      </motion.span>
      <span style={{
        fontFamily: "'Public Sans', sans-serif",
        fontSize: "clamp(12px, 1.1vw, 15px)",
        fontWeight: hovered ? 700 : 500,
        color: hovered ? color : "rgba(255,255,255,0.7)",
        whiteSpace: "nowrap",
        letterSpacing: "0.02em",
        transition: "color 0.2s, font-weight 0.1s",
        position: "relative",
      }}>
        {label}
      </span>
    </motion.div>
  );
}

// ── Infinite marquee row ───────────────────────────────────────────────────────
function MarqueeRow({
  pills, direction, speed = 40, tilt = 0,
}: {
  pills: typeof ROW1;
  direction: "left" | "right";
  speed?: number;
  tilt?: number;
}) {
  const doubled = [...pills, ...pills, ...pills, ...pills]; // 4× for seamless loop
  const animDir = direction === "left" ? "-50%" : "0%";
  const animStart = direction === "left" ? "0%" : "-50%";

  return (
    <div style={{
      overflow: "hidden",
      transform: `rotate(${tilt}deg)`,
      padding: "8px 0",
      // expand slightly to hide rotation edges
      marginLeft: "-4%", marginRight: "-4%", width: "108%",
    }}>
      <style>{`
        @keyframes marquee-${direction}-${speed} {
          0%   { transform: translateX(${animStart}); }
          100% { transform: translateX(${animDir}); }
        }
        .mq-${direction}-${speed} {
          animation: marquee-${direction}-${speed} ${speed}s linear infinite;
          will-change: transform;
        }
        .mq-${direction}-${speed}:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div
        className={`mq-${direction}-${speed}`}
        style={{ display: "flex", gap: "12px", width: "max-content" }}
      >
        {doubled.map((p, i) => <Pill key={`${p.label}-${i}`} {...p} />)}
      </div>
    </div>
  );
}

// ── Animated stat bar ──────────────────────────────────────────────────────────
function StatBar({ inView }: { inView: boolean }) {
  return (
    <div style={{
      display: "flex", flexWrap: "wrap",
      gap: "2px", justifyContent: "center",
      margin: "0 auto", maxWidth: "960px",
      padding: "0 24px",
    }}>
      {STATS.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={inView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
          style={{
            flex: "1 1 140px",
            transformOrigin: "left",
            padding: "20px 24px",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.025)",
            border: `1px solid ${s.color}25`,
            display: "flex", flexDirection: "column", gap: "5px",
            position: "relative", overflow: "hidden",
          }}
        >
          {/* left accent */}
          <div style={{
            position: "absolute", left: 0, top: "16px", bottom: "16px",
            width: "3px", borderRadius: "0 3px 3px 0",
            background: s.color,
            boxShadow: `0 0 12px ${s.color}`,
          }} />
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(28px, 3.5vw, 44px)",
            color: s.color, lineHeight: 1,
            letterSpacing: "0.02em",
            paddingLeft: "12px",
          }}>
            {s.value}
          </span>
          <span style={{
            fontFamily: "'Public Sans', sans-serif",
            fontSize: "10px", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.3)",
            paddingLeft: "12px",
          }}>
            {s.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ── Section ────────────────────────────────────────────────────────────────────
export default function NetworkSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY    = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const tiltY  = useTransform(scrollYProgress, [0, 1], ["2deg", "-2deg"]);

  return (
    <section
      id="network"
      ref={sectionRef}
      style={{ position: "relative", background: "#0c0704", overflow: "hidden", paddingBottom: "100px" }}
    >
      {/* constellation SVG */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.055 }}>
          {Array.from({ length: 24 }, (_, i) => {
            const x1 = (i * 137 + 40) % 100;
            const y1 = (i * 79  + 20) % 100;
            const x2 = ((i + 4) * 137 + 40) % 100;
            const y2 = ((i + 4) * 79  + 20) % 100;
            return (
              <g key={i}>
                <circle cx={`${x1}%`} cy={`${y1}%`} r="2.5" fill="#ec5b13" />
                <line x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}
                  stroke="#facc15" strokeWidth="0.4" strokeDasharray="3 10" />
              </g>
            );
          })}
        </svg>
      </div>

      {/* parallax watermark */}
      <motion.div
        style={{ y: bgY }}
        className="net-watermark"
      >
        NETWORK
      </motion.div>

      {/* ── Heading ── */}
      <div style={{ textAlign: "center", padding: "88px 24px 56px" }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: "'Public Sans', sans-serif",
            fontSize: "11px", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.22em",
            color: "rgba(236,91,19,0.7)", margin: "0 0 20px",
          }}
        >
          The Roster
        </motion.p>

        {/* SplitText heading */}
        {inView && (
          <SplitText
            tag="h2"
            text="A Network Built On Culture,"
            splitType="chars"
            delay={28}
            duration={0.9}
            ease="power3.out"
            from={{ opacity: 0, y: 60, rotateX: -90 }}
            to={{ opacity: 1, y: 0, rotateX: 0 }}
            threshold={0.1}
            textAlign="center"
            className="net-heading-line"
          />
        )}
        {inView && (
          <SplitText
            tag="h2"
            text="Not Just Followers"
            splitType="chars"
            delay={28}
            duration={0.9}
            ease="power3.out"
            from={{ opacity: 0, y: 60, rotateX: -90 }}
            to={{ opacity: 1, y: 0, rotateX: 0 }}
            threshold={0.1}
            textAlign="center"
            className="net-heading-line net-heading-accent"
          />
        )}

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            fontFamily: "'Public Sans', sans-serif",
            fontSize: "clamp(14px, 1.2vw, 17px)",
            color: "rgba(255,255,255,0.35)",
            maxWidth: "520px", marginInline: "auto",
            lineHeight: 1.65, marginTop: "20px",
          }}
        >
          500+ verified meme pages across 12 categories.{" "}
          Every page manually reviewed.{" "}
          <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
            No bots. No fake engagement.
          </span>
        </motion.p>
      </div>

      {/* ── Stats bar ── */}
      <div style={{ marginBottom: "56px" }}>
        <StatBar inView={inView} />
      </div>

      {/* ── Marquee rows ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <MarqueeRow pills={ROW1} direction="left"  speed={36} tilt={-1.2} />
        <MarqueeRow pills={ROW2} direction="right" speed={42} tilt={0}    />
        <MarqueeRow pills={ROW3} direction="left"  speed={30} tilt={1.2}  />
      </motion.div>

      {/* ── Bottom note ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.8 }}
        style={{ textAlign: "center", marginTop: "48px", padding: "0 24px" }}
      >
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          padding: "8px 20px", borderRadius: "9999px",
          background: "rgba(236,91,19,0.08)",
          border: "1px solid rgba(236,91,19,0.2)",
        }}>
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{
              width: "7px", height: "7px", borderRadius: "50%",
              background: "#ec5b13", display: "inline-block",
              boxShadow: "0 0 8px #ec5b13",
            }}
          />
          <span style={{
            fontFamily: "'Public Sans', sans-serif",
            fontSize: "12px", fontWeight: 600,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.06em",
          }}>
            Network growing weekly · New pages added after manual review
          </span>
        </div>
      </motion.div>

      {/* ── Styles ── */}
      <style>{`
        .net-watermark {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(100px, 20vw, 300px);
          color: rgba(236,91,19,0.03);
          letter-spacing: 0.06em;
          white-space: nowrap;
          pointer-events: none; user-select: none;
          line-height: 1;
        }
        .net-heading-line {
          display: block !important;
          font-family: 'Bebas Neue', sans-serif !important;
          font-size: clamp(44px, 6.5vw, 90px) !important;
          letter-spacing: 0.02em !important;
          color: white !important;
          line-height: 1 !important;
          perspective: 600px;
        }
        .net-heading-accent {
          color: #ec5b13 !important;
        }
        .net-heading-accent .split-char {
          color: #ec5b13 !important;
        }
        .split-parent { perspective: 600px; }
        @media (max-width: 640px) {
          .net-heading-line { font-size: clamp(36px, 10vw, 56px) !important; }
        }
      `}</style>
    </section>
  );
}