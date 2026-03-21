"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// ── Data ──────────────────────────────────────────────────────────────────────
const FLOAT_TAGS = [
  { label: "😂 Humor",        color: "#facc15", x: "8%",  y: "22%", rot: -8,  delay: 0    },
  { label: "🏏 Cricket",      color: "#ec5b13", x: "82%", y: "18%", rot:  6,  delay: 0.15 },
  { label: "💸 Finance",      color: "#4ade80", x: "5%",  y: "62%", rot: -5,  delay: 0.3  },
  { label: "🎬 Bollywood",    color: "#a78bfa", x: "80%", y: "60%", rot:  9,  delay: 0.45 },
  { label: "🤖 AI & Tech",    color: "#38bdf8", x: "88%", y: "40%", rot: -7,  delay: 0.6  },
  { label: "🗳️ Politics",    color: "#f472b6", x: "3%",  y: "40%", rot:  5,  delay: 0.75 },
  { label: "🎙️ Podcasts",   color: "#facc15", x: "75%", y: "80%", rot: -10, delay: 0.9  },
  { label: "🌍 Global",       color: "#4ade80", x: "18%", y: "80%", rot:  7,  delay: 1.05 },
];

const STATS = [
  { val: "500+",  label: "Meme Pages",    color: "#facc15" },
  { val: "25M+",  label: "Reach",         color: "#ec5b13" },
  { val: "48hrs", label: "Go-Live",       color: "#4ade80" },
  { val: "12",    label: "Categories",    color: "#38bdf8" },
];

// Rolling text that cycles through audience types
const AUDIENCES = ["BRANDS", "AGENCIES", "BOLLYWOOD", "CREATORS", "PODCASTS", "POLITICIANS"];

function RollingAudience() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(p => (p + 1) % AUDIENCES.length), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ overflow: "hidden", height: "1em", display: "inline-block", verticalAlign: "top" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%",   opacity: 1 }}
          exit={{ y: "-100%",  opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "block", color: "#ec5b13", textShadow: "0 0 40px rgba(236,91,19,0.5)" }}
        >
          {AUDIENCES[idx]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ── Floating tag ──────────────────────────────────────────────────────────────
function FloatTag({ label, color, x, y, rot, delay }: typeof FLOAT_TAGS[0]) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotate: rot * 2 }}
      animate={{ opacity: 1, scale: 1, rotate: rot, y: [0, -8, 0] }}
      transition={{
        opacity:  { duration: 0.5, delay },
        scale:    { duration: 0.5, delay, ease: [0.34, 1.56, 0.64, 1] },
        rotate:   { duration: 0.5, delay },
        y:        { duration: 3 + delay, repeat: Infinity, ease: "easeInOut", delay: delay * 2 },
      }}
      style={{
        position: "absolute", left: x, top: y,
        display: "inline-flex", alignItems: "center",
        padding: "7px 14px", borderRadius: "9999px",
        background: `${color}12`,
        border: `1px solid ${color}35`,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        fontFamily: "'Public Sans', sans-serif",
        fontSize: "clamp(10px, 1vw, 12px)", fontWeight: 700,
        color,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 2,
      }}
    >{label}</motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HeroV3() {
  const heroRef = useRef<HTMLElement>(null);
  const inView  = useInView(heroRef, { once: true });

  return (
    <section
      id="hero"
      ref={heroRef}
      style={{
        minHeight: "100dvh",
        position: "relative",
        background: "#0a0702",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* ── Background ── */}
      {/* noise grain */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.55,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        backgroundSize: "160px 160px",
      }} />

      {/* large diagonal stripes — very subtle */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(60deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 60px)",
        zIndex: 0,
      }} />

      {/* center glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "80vw", height: "80vw", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(250,204,21,0.055) 0%, transparent 65%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* nav offset */}
      <div style={{ height: "80px", flexShrink: 0 }} />

      {/* ── Floating tags (desktop only) ── */}
      <div className="hv3-tags" style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
        {FLOAT_TAGS.map(t => <FloatTag key={t.label} {...t} />)}
      </div>

      {/* ── Centre content ── */}
      <div style={{
        position: "relative", zIndex: 5,
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", padding: "0 24px",
        flex: 1, justifyContent: "center",
        maxWidth: "1000px", margin: "0 auto", width: "100%",
      }}>

        {/* eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "6px 16px", borderRadius: "9999px",
            background: "rgba(236,91,19,0.1)", border: "1px solid rgba(236,91,19,0.25)",
            marginBottom: "28px",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ec5b13", boxShadow: "0 0 8px #ec5b13" }}
          />
          <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, color: "#ec5b13", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Pre-Launch · Founding Network Open
          </span>
        </motion.div>

        {/* ── HEADLINE STACK ── */}
        {/* Line 1 — outlined white, massive */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(56px, 13vw, 172px)",
            letterSpacing: "0.02em", lineHeight: 0.88,
            WebkitTextStroke: "2px rgba(255,255,255,0.65)",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            userSelect: "none",
          }}>
            MADE FOR
          </div>
        </motion.div>

        {/* Line 2 — solid yellow, with rolling word */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(56px, 13vw, 172px)",
            letterSpacing: "0.02em", lineHeight: 0.88,
            color: "#facc15",
            textShadow: "0 0 80px rgba(250,204,21,0.3)",
            userSelect: "none",
          }}>
            MEME
          </div>
        </motion.div>

        {/* Line 3 — rolling audience type */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(56px, 13vw, 172px)",
            letterSpacing: "0.02em", lineHeight: 0.88,
            color: "white",
            userSelect: "none",
            display: "flex", gap: "0.18em",
            justifyContent: "center",
          }}>
            <span style={{ color: "white" }}>CULTURE</span>
          </div>
        </motion.div>

        {/* Line 4 — outlined, audience rolling */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.46, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: "32px" }}
        >
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(40px, 8vw, 110px)",
            letterSpacing: "0.02em", lineHeight: 0.92,
            color: "transparent",
            WebkitTextStroke: "1.5px rgba(255,255,255,0.3)",
            display: "flex", gap: "0.2em", justifyContent: "center",
            alignItems: "center",
            userSelect: "none",
          }}>
            FOR
            <span style={{ WebkitTextStroke: "1.5px #ec5b13", color: "transparent" }}>
              <RollingAudience />
            </span>
          </div>
        </motion.div>

        {/* sub */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.58 }}
          style={{
            fontFamily: "'Public Sans', sans-serif",
            fontSize: "clamp(14px, 1.3vw, 18px)",
            color: "rgba(255,255,255,0.38)", maxWidth: "560px",
            lineHeight: 1.65, marginBottom: "36px",
          }}
        >
          500+ verified meme pages. India & worldwide. Briefed, activated, live in 48 hours.{" "}
          <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>No bots. No fakes. Ever.</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center", marginBottom: "48px" }}
        >
          <motion.a href="#for-brands"
            whileHover={{ scale: 1.05, boxShadow: "0 0 56px rgba(250,204,21,0.55)" }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "16px 40px", borderRadius: "14px",
              background: "#facc15", color: "#0a0702",
              fontFamily: "'Public Sans', sans-serif", fontSize: "15px", fontWeight: 900,
              textDecoration: "none", letterSpacing: "0.04em",
              boxShadow: "0 0 40px rgba(250,204,21,0.28)",
              position: "relative", overflow: "hidden",
            }}
          >
            {/* shimmer */}
            <motion.div
              animate={{ x: ["-120%", "120%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
              style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)", pointerEvents: "none" }}
            />
            <span style={{ position: "relative" }}>🚀 I Need Amplification</span>
          </motion.a>

          <motion.a href="#for-pages"
            whileHover={{ scale: 1.04, borderColor: "rgba(255,255,255,0.45)" }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "16px 40px", borderRadius: "14px",
              background: "rgba(255,255,255,0)", color: "white",
              fontFamily: "'Public Sans', sans-serif", fontSize: "15px", fontWeight: 700,
              textDecoration: "none", letterSpacing: "0.04em",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            💸 I Run a Meme Page
          </motion.a>
        </motion.div>

        {/* stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{
            display: "flex", gap: "0",
            borderRadius: "16px", overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.07)",
            width: "100%", maxWidth: "560px",
          }}
          className="hv3-stats"
        >
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              flex: 1,
              padding: "16px 12px",
              background: i % 2 === 0 ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.3)",
              textAlign: "center",
              borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(22px, 3vw, 30px)", color: s.color, lineHeight: 1, letterSpacing: "0.02em" }}>{s.val}</div>
              <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* bottom edge marquee */}
      <div style={{ width: "100%", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)", padding: "12px 0", position: "relative", zIndex: 10, flexShrink: 0 }}>
        <style>{`
          @keyframes hv3mq { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
          .hv3mq-track { display:flex; width:max-content; animation:hv3mq 40s linear infinite; }
        `}</style>
        <div className="hv3mq-track">
          {[...Array(2)].flatMap((_, outerIndex) =>
            ["ROBOROFL", "·", "MEME AMPLIFICATION NETWORK", "·", "INDIA & WORLDWIDE", "·", "500+ PAGES", "·", "48HR CAMPAIGNS", "·"].map((w, innerIndex) => (
              <span key={`${outerIndex}-${innerIndex}`} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(12px, 1.4vw, 16px)", letterSpacing: "0.18em", color: w === "·" ? "#facc15" : "rgba(255,255,255,0.15)", padding: "0 18px", whiteSpace: "nowrap" }}>{w}</span>
            ))
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hv3-tags { display: none !important; }
          .hv3-stats { max-width: 100% !important; }
        }
      `}</style>
    </section>
  );
}