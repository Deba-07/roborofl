"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";

// ── Data ──────────────────────────────────────────────────────────────────────
const COVER_TAGS = [
  { text: "COVER STORY",    color: "#facc15", outline: false },
  { text: "EXCLUSIVE",      color: "white",   outline: true  },
  { text: "Q2 2026",        color: "#ec5b13", outline: false },
  { text: "VERIFIED ONLY",  color: "white",   outline: true  },
];

// The 6 "cover lines" — classic magazine sidebar copy
const COVER_LINES = [
  { kicker: "INSIDE:", headline: "How 500 pages move a nation's culture" },
  { kicker: "SPECIAL:",headline: "48-hour campaigns that actually work"   },
  { kicker: "PLUS:",   headline: "The brand playbook for meme marketing"  },
];

// Rotating cover date badge text
const BADGE_TEXT = "ROBOROFL · INDIA'S MEME AMPLIFICATION NETWORK · WORLDWIDE · ";

// ── Magnetic cursor ───────────────────────────────────────────────────────────
function MagneticBlob() {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 40, damping: 18 });
  const sy = useSpring(my, { stiffness: 40, damping: 18 });

  const blobX = useTransform(sx, [0, 1], ["-8%", "8%"]);
  const blobY = useTransform(sy, [0, 1], ["-8%", "8%"]);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth);
      my.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mx, my]);

  return (
    <motion.div
      style={{
        x: blobX, y: blobY,
        position: "absolute", top: "15%", left: "20%",
        width: "60vw", height: "60vw",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(236,91,19,0.12) 0%, rgba(250,204,21,0.06) 40%, transparent 70%)",
        pointerEvents: "none", zIndex: 0, filter: "blur(40px)",
      }}
    />
  );
}

// ── Rotating badge ────────────────────────────────────────────────────────────
function RotatingBadge() {
  const doubled = BADGE_TEXT + BADGE_TEXT;
  return (
    <div style={{ position: "relative", width: "88px", height: "88px", flexShrink: 0 }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{ position: "absolute", inset: 0 }}
      >
        <svg viewBox="0 0 88 88" width="88" height="88">
          <defs>
            <path id="circle" d="M44,44 m-34,0 a34,34 0 1,1 68,0 a34,34 0 1,1 -68,0" />
          </defs>
          <text style={{ fontSize: "7.8px", fill: "#facc15", fontFamily: "monospace", letterSpacing: "0.08em", fontWeight: 700 }}>
            <textPath href="#circle">{doubled}</textPath>
          </text>
        </svg>
      </motion.div>
      {/* center dot */}
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#facc15" }}
        />
      </div>
    </div>
  );
}

// ── Word reveal animation ─────────────────────────────────────────────────────
type WordProps = {
  children: string;
  delay: number;
  color?: string;
  outline?: boolean;
  size: string;
  italic?: boolean;
  align?: "left" | "center" | "right";
};

function Word({ children, delay, color = "white", outline = false, size, italic = false, align = "left" }: WordProps) {
  return (
    <div style={{ overflow: "hidden", display: "block", textAlign: align }}>
      <motion.div
        initial={{ y: "110%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: size,
          letterSpacing: "0.01em",
          lineHeight: 0.88,
          color: outline ? "transparent" : color,
          WebkitTextStroke: outline ? `2px ${color}` : "none",
          fontStyle: italic ? "italic" : "normal",
          display: "block",
          textShadow: !outline && color !== "white" && color !== "rgba(255,255,255,0.22)" ? `0 0 80px ${color}40` : "none",
          userSelect: "none",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HeroV5() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const headingY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const bgY      = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  const baseSize = "clamp(68px, 14vw, 190px)";
  const lgSize   = "clamp(80px, 16vw, 220px)";
  const smSize   = "clamp(36px, 7vw, 96px)";

  return (
    <section
      id="hero"
      ref={heroRef}
      style={{
        minHeight: "100dvh", position: "relative",
        background: "#0d0604", overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* ── Background layers ── */}
      <MagneticBlob />

      {/* noise */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.6, zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E")`,
        backgroundSize: "160px 160px",
      }} />

      {/* wide rule lines */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {[22, 40, 60, 78].map(top => (
          <div key={top} style={{
            position: "absolute", left: 0, right: 0, top: `${top}%`,
            height: "1px", background: "rgba(255,255,255,0.025)",
          }} />
        ))}
      </div>

      {/* vertical rule — left gutter */}
      <div style={{ position: "absolute", left: "clamp(16px,5vw,64px)", top: 0, bottom: 0, width: "1px", background: "rgba(255,255,255,0.06)", pointerEvents: "none", zIndex: 1 }} />

      {/* ── NAV SPACER ── */}
      <div style={{ height: "80px", flexShrink: 0 }} />

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, position: "relative", zIndex: 5, display: "flex", flexDirection: "column", padding: "0 clamp(16px,5vw,64px)" }}>

        {/* ── TOP ROW — issue number + cover tags + badge ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap", gap: "12px" }}>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ display: "flex", alignItems: "center", gap: "16px" }}
          >
            <span style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.22)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              VOL. 01 · ISSUE 001 · Q2 2026
            </span>
            <div style={{ width: "1px", height: "14px", background: "rgba(255,255,255,0.15)" }} />
            <span style={{ fontFamily: "monospace", fontSize: "9px", color: "#ec5b13", letterSpacing: "0.14em", fontWeight: 700 }}>
              FOUNDING EDITION
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
          >
            {COVER_TAGS.map((t, i) => (
              <motion.div
                key={t.text}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.07, ease: [0.34, 1.56, 0.64, 1] }}
                style={{
                  padding: "4px 12px", borderRadius: "3px",
                  background: t.outline ? "transparent" : `${t.color}18`,
                  border: `1px solid ${t.outline ? "rgba(255,255,255,0.25)" : t.color + "40"}`,
                  fontFamily: "monospace", fontSize: "9px", fontWeight: 700,
                  color: t.outline ? "rgba(255,255,255,0.55)" : t.color,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                }}
              >{t.text}</motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── MASSIVE TYPOGRAPHIC HEADLINE ── */}
        <motion.div style={{ y: headingY }} className="hv5-headline">

          {/* Line 1 */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "clamp(8px, 2vw, 24px)", flexWrap: "wrap", marginTop: "clamp(12px, 2vw, 24px)" }}>
            <Word children="THE" delay={0.2} color="rgba(255,255,255,0.22)" outline size={smSize} />
            <Word children="MEME" delay={0.28} color="#facc15" size={lgSize} />
            <Word children="PAGE" delay={0.36} color="rgba(255,255,255,0.22)" outline size={smSize} />
          </div>

          {/* Line 2 — bleeds */}
          <Word children="AMPLIFICATION" delay={0.44} color="white" size={baseSize} />

          {/* Line 3 */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "clamp(8px, 2vw, 24px)", flexWrap: "wrap" }}>
            <Word children="NETWORK" delay={0.52} color="#ec5b13" size={baseSize} />
            <Word children="IS" delay={0.58} color="rgba(255,255,255,0.18)" outline size={smSize} italic />
            <Word children="LIVE" delay={0.64} color="white" outline size={smSize} />
          </div>
        </motion.div>

        {/* ── BOTTOM ROW — cover lines + CTA + badge ── */}
        <div style={{ flex: 1, display: "flex", alignItems: "flex-end", paddingBottom: "clamp(24px, 4vw, 48px)", marginTop: "auto" }}>
          <div className="hv5-bottom" style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr auto auto", gap: "32px", alignItems: "end", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "24px" }}>

            {/* cover lines */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {COVER_LINES.map((l, i) => (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "8px", fontWeight: 700, color: "#ec5b13", letterSpacing: "0.14em", flexShrink: 0 }}>{l.kicker}</span>
                  <span style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "clamp(11px, 1.1vw, 13px)", color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>{l.headline}</span>
                </div>
              ))}
              {/* sub + CTAs */}
              <div style={{ display: "flex", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
                <motion.a href="#for-brands"
                  whileHover={{ scale: 1.04, boxShadow: "0 0 48px rgba(250,204,21,0.45)" }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    padding: "13px 32px", borderRadius: "6px",
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "0.1em",
                    textDecoration: "none", background: "#facc15", color: "#0d0604",
                    boxShadow: "0 0 32px rgba(250,204,21,0.2)",
                  }}
                >
                  I Need Amplification →
                </motion.a>
                <motion.a href="#for-pages"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    padding: "13px 28px", borderRadius: "6px",
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "0.1em",
                    textDecoration: "none", background: "rgba(255,255,255,0)", color: "rgba(255,255,255,0.75)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  I Run a Meme Page
                </motion.a>
              </div>
            </motion.div>

            {/* stats column */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.78 }}
              style={{ display: "flex", flexDirection: "column", gap: "14px", borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: "32px" }}
              className="hv5-stats"
            >
              {[
                { v: "500+", l: "Pages",     c: "#facc15" },
                { v: "25M+", l: "Reach",     c: "#ec5b13" },
                { v: "48h",  l: "Go-Live",   c: "#4ade80" },
                { v: "0",    l: "Bots",      c: "#38bdf8" },
              ].map(s => (
                <div key={s.l} style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(24px, 3vw, 36px)", color: s.c, lineHeight: 1, letterSpacing: "0.04em" }}>{s.v}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(255,255,255,0.22)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{s.l}</div>
                </div>
              ))}
            </motion.div>

            {/* rotating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotate: -40 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, delay: 0.85, ease: [0.34, 1.56, 0.64, 1] }}
              className="hv5-badge"
            >
              <RotatingBadge />
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hv5-bottom { grid-template-columns: 1fr !important; gap: 20px !important; }
          .hv5-stats { display: grid !important; grid-template-columns: repeat(4,1fr); border-left: none !important; padding-left: 0 !important; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; }
          .hv5-stats > div { text-align: center !important; }
          .hv5-badge { display: none !important; }
          .hv5-headline div { flex-wrap: wrap !important; }
        }
        @media (max-width: 480px) {
          .hv5-stats { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </section>
  );
}