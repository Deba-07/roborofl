"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  motion, useMotionValue, useSpring, useTransform,
  AnimatePresence, useScroll,
} from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const DEAL_FEED = [
  { creator: "@delhimemes",       cat: "Humor",     amount: "₹14,500",  flag: "🇮🇳", color: "#facc15" },
  { creator: "@startupbanter",    cat: "Tech",      amount: "₹9,200",   flag: "🇮🇳", color: "#38bdf8" },
  { creator: "@ukbrowngirls",     cat: "Lifestyle", amount: "£680",     flag: "🇬🇧", color: "#a78bfa" },
  { creator: "@cricketshitpost",  cat: "Sports",    amount: "₹22,000",  flag: "🇮🇳", color: "#ec5b13" },
  { creator: "@desitechbro",      cat: "AI & SaaS", amount: "₹7,800",   flag: "🇮🇳", color: "#38bdf8" },
  { creator: "@gulfhumour",       cat: "Regional",  amount: "$520",     flag: "🇦🇪", color: "#4ade80" },
  { creator: "@bollywoodrants",   cat: "Films",     amount: "₹18,000",  flag: "🇮🇳", color: "#f472b6" },
  { creator: "@genzmumbai",       cat: "Gen Z",     amount: "₹11,500",  flag: "🇮🇳", color: "#facc15" },
  { creator: "@canadadesimemes",  cat: "Diaspora",  amount: "$390",     flag: "🇨🇦", color: "#4ade80" },
];

const STATS_ROW = [
  { val: "500+",  label: "Pages",      color: "#facc15" },
  { val: "25M+",  label: "Reach",      color: "#ec5b13" },
  { val: "48hr",  label: "Go-Live",    color: "#4ade80" },
  { val: "12",    label: "Categories", color: "#38bdf8" },
  { val: "0",     label: "Bots",       color: "#a78bfa" },
];

// ─────────────────────────────────────────────────────────────────────────────
// SONAR BACKGROUND
// ─────────────────────────────────────────────────────────────────────────────
function SonarRings() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", overflow: "hidden" }}>
      {[0, 1, 2, 3, 4].map(i => (
        <motion.div
          key={i}
          animate={{ scale: [0.2, 2.8], opacity: [0.22, 0] }}
          transition={{ duration: 5, delay: i * 1.0, repeat: Infinity, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: "clamp(300px, 50vw, 700px)",
            height: "clamp(300px, 50vw, 700px)",
            borderRadius: "50%",
            border: "1px solid rgba(250,204,21,0.35)",
          }}
        />
      ))}
      {/* inner static ring */}
      <div style={{
        width: "clamp(120px, 20vw, 240px)", height: "clamp(120px, 20vw, 240px)",
        borderRadius: "50%",
        border: "1px solid rgba(250,204,21,0.08)",
        background: "radial-gradient(circle, rgba(250,204,21,0.04) 0%, transparent 70%)",
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OSCILLOSCOPE WAVEFORM
// ─────────────────────────────────────────────────────────────────────────────
function Oscilloscope({ color }: { color: string }) {
  const [phase, setPhase] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let t = 0;
    const tick = () => {
      t += 0.06;
      setPhase(t);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const W = 320, H = 48;
  const pts = Array.from({ length: 120 }, (_, i) => {
    const x = (i / 119) * W;
    const y = H / 2
      + Math.sin(i * 0.18 + phase) * 10
      + Math.sin(i * 0.06 + phase * 0.7) * 7
      + Math.sin(i * 0.38 + phase * 1.3) * 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="wave-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={color} stopOpacity="0" />
          <stop offset="20%"  stopColor={color} stopOpacity="1" />
          <stop offset="80%"  stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="url(#wave-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* glow duplicate */}
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.12"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEAL FEED CARD
// ─────────────────────────────────────────────────────────────────────────────
function DealCard({ deal, onDone }: { deal: typeof DEAL_FEED[0]; onDone: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.92 }}
      animate={{ opacity: 1, x: 0,  scale: 1    }}
      exit={{    opacity: 0, x: -40, scale: 0.95 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={(def) => {
        if ((def as Record<string, unknown>).opacity === 0) onDone();
      }}
      style={{
        position: "relative",
        padding: "14px 16px",
        borderRadius: "14px",
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${deal.color}30`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        overflow: "hidden",
      }}
    >
      {/* left glow bar */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "3px",
        background: deal.color,
        boxShadow: `0 0 12px ${deal.color}`,
      }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px" }}>{deal.flag}</span>
          <div>
            <div style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "12px", fontWeight: 700, color: "white", letterSpacing: "0.02em" }}>
              {deal.creator}
            </div>
            <div style={{ fontFamily: "monospace", fontSize: "9px", color: deal.color, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {deal.cat}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", color: deal.color, lineHeight: 1, letterSpacing: "0.04em" }}>
            {deal.amount}
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
            DEAL LIVE ✓
          </div>
        </div>
      </div>

      {/* shimmer sweep */}
      <motion.div
        initial={{ x: "-110%" }}
        animate={{ x: "110%"  }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(90deg, transparent, ${deal.color}18, transparent)`,
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEAL FEED (perpetual loop)
// ─────────────────────────────────────────────────────────────────────────────
function DealFeed() {
  const [cards, setCards] = useState<(typeof DEAL_FEED[0] & { key: number })[]>([]);
  const idxRef = useRef(0);
  const keyRef = useRef(0);

  useEffect(() => {
    const push = () => {
      const deal = DEAL_FEED[idxRef.current % DEAL_FEED.length];
      idxRef.current++;
      const card = { ...deal, key: keyRef.current++ };
      setCards(prev => [card, ...prev].slice(0, 4));
    };
    push();
    const id = setInterval(push, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <AnimatePresence initial={false}>
        {cards.map(c => (
          <DealCard key={c.key} deal={c} onDone={() => {}} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAGNETIC CURSOR GLOW
// ─────────────────────────────────────────────────────────────────────────────
function CursorGlow() {
  const mx = useMotionValue(-500);
  const my = useMotionValue(-500);
  const sx = useSpring(mx, { stiffness: 80, damping: 20 });
  const sy = useSpring(my, { stiffness: 80, damping: 20 });

  useEffect(() => {
    const fn = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY); };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, [mx, my]);

  return (
    <motion.div
      style={{
        position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 0,
        x: useTransform(sx, v => v - 200),
        y: useTransform(sy, v => v - 200),
        width: 400, height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(236,91,19,0.07) 0%, transparent 65%)",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCROLLING TAPE
// ─────────────────────────────────────────────────────────────────────────────
function Tape({ direction = "left" }: { direction?: "left" | "right" }) {
  const words = [
    "ROBOROFL", "·", "INDIA'S MEME AMPLIFICATION NETWORK", "·",
    "500+ PAGES", "·", "WORLDWIDE", "·", "48HR CAMPAIGNS", "·",
    "NO BOTS", "·",
  ];
  const doubled = [...words, ...words];
  const anim = direction === "left"
    ? { x: ["0%", "-50%"] }
    : { x: ["-50%", "0%"] };

  return (
    <div style={{ overflow: "hidden", background: direction === "left" ? "rgba(250,204,21,0.07)" : "transparent", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 0" }}>
      <motion.div
        animate={anim}
        transition={{ duration: direction === "left" ? 28 : 34, repeat: Infinity, ease: "linear" }}
        style={{ display: "flex", width: "max-content", gap: "0" }}
      >
        {doubled.map((w, i) => (
          <span key={i} style={{
            fontFamily: w === "ROBOROFL" ? "'Bebas Neue', sans-serif" : "monospace",
            fontSize: w === "ROBOROFL" ? "clamp(16px,1.8vw,22px)" : "clamp(10px,1.1vw,13px)",
            letterSpacing: "0.14em",
            color: w === "·" ? "#ec5b13" : w === "ROBOROFL" ? "#facc15" : "rgba(255,255,255,0.22)",
            padding: "0 clamp(12px,2vw,24px)",
            whiteSpace: "nowrap",
            fontWeight: w === "ROBOROFL" ? undefined : 700,
          }}>{w}</span>
        ))}
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HERO
// ─────────────────────────────────────────────────────────────────────────────
export default function HeroV6() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY      = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const headingY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  // line reveal stagger
  const lines = [
    { text: "MEME",         color: "#facc15",                outline: false, size: "clamp(70px,14.5vw,196px)" },
    { text: "AMPLIFI-",     color: "rgba(255,255,255,0.88)", outline: false, size: "clamp(46px,9vw,122px)"    },
    { text: "CATION",       color: "transparent",            outline: true,  stroke: "rgba(255,255,255,0.3)", size: "clamp(46px,9vw,122px)"    },
    { text: "NETWORK",      color: "#ec5b13",                outline: false, size: "clamp(52px,10.5vw,142px)" },
  ];

  return (
    <section
      id="hero"
      ref={heroRef}
      style={{ minHeight: "100dvh", position: "relative", background: "#080604", overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* ── BG LAYERS ── */}
      <CursorGlow />

      {/* noise grain */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.55, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E")`, backgroundSize: "160px", pointerEvents: "none", zIndex: 0 }} />

      {/* sonar */}
      <motion.div style={{ y: bgY, position: "absolute", inset: 0, zIndex: 0 }}>
        <SonarRings />
      </motion.div>

      {/* ── NAV OFFSET ── */}
      <div style={{ height: "80px", flexShrink: 0 }} />

      {/* ── TOP BADGE BAR ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "center", padding: "0 24px", marginBottom: "clamp(16px,3vw,40px)" }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: "clamp(10px,2vw,20px)", flexWrap: "wrap", justifyContent: "center" }}>
          {/* live badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "5px 14px", borderRadius: "9999px", background: "rgba(236,91,19,0.1)", border: "1px solid rgba(236,91,19,0.28)" }}>
            <motion.div animate={{ scale: [1,1.5,1], opacity: [1,0.3,1] }} transition={{ duration: 1, repeat: Infinity }}
              style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ec5b13", boxShadow: "0 0 8px #ec5b13" }} />
            <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, color: "#ec5b13", letterSpacing: "0.2em" }}>PRE-LAUNCH LIVE</span>
          </div>
          <span style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em" }}>
            FOUNDING NETWORK OPEN · Q2 2026
          </span>
        </div>
      </motion.div>

      {/* ── MAIN GRID ── */}
      <div className="hv6-grid" style={{ flex: 1, position: "relative", zIndex: 5, display: "grid", gridTemplateColumns: "1fr 320px", gap: "clamp(24px,4vw,56px)", padding: "0 clamp(16px,5vw,56px)", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>

          {/* HEADLINE */}
          <motion.div style={{ y: headingY }}>
            <div style={{ overflow: "hidden", marginBottom: "clamp(16px,3vw,32px)" }}>
              {lines.map((l, i) => (
                <div key={l.text} style={{ overflow: "hidden" }}>
                  <motion.div
                    initial={{ y: "105%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.72, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: l.size,
                      letterSpacing: "0.01em",
                      lineHeight: 0.88,
                      color: l.outline ? "transparent" : l.color,
                      WebkitTextStroke: l.outline ? `2px ${l.stroke}` : "none",
                      display: "block",
                      textShadow: !l.outline && l.color !== "rgba(255,255,255,0.88)" && l.color !== "transparent"
                        ? `0 0 80px ${l.color}45`
                        : "none",
                      userSelect: "none",
                    }}
                  >{l.text}</motion.div>
                </div>
              ))}
            </div>

            {/* oscilloscope */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "left", maxWidth: "400px", marginBottom: "clamp(16px,3vw,28px)" }}
            >
              <Oscilloscope color="#facc15" />
            </motion.div>
          </motion.div>

          {/* SUBHEADING */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.62 }}
            style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "clamp(13px,1.2vw,17px)", color: "rgba(255,255,255,0.38)", maxWidth: "480px", lineHeight: 1.7, marginBottom: "clamp(20px,3vw,32px)" }}
          >
            500+ verified meme pages. India & worldwide.
            Brief in. Live in 48 hours.{" "}
            <span style={{ color: "rgba(255,255,255,0.72)", fontWeight: 600 }}>
              No middlemen. No bots. No BS.
            </span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.72 }}
            style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "clamp(20px,3vw,36px)" }}
          >
            <motion.a
              href="#for-brands"
              whileHover={{ scale: 1.04, boxShadow: "0 0 56px rgba(250,204,21,0.5)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "9px",
                padding: "clamp(12px,1.4vw,16px) clamp(24px,3vw,36px)",
                borderRadius: "10px",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(16px,1.8vw,20px)",
                letterSpacing: "0.1em",
                textDecoration: "none",
                background: "#facc15", color: "#080604",
                boxShadow: "0 0 36px rgba(250,204,21,0.22)",
                position: "relative", overflow: "hidden",
              }}
            >
              <motion.div
                animate={{ x: ["-120%", "120%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.5 }}
                style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)", pointerEvents: "none" }}
              />
              <span style={{ position: "relative" }}>🚀 AMPLIFY MY BRAND</span>
            </motion.a>

            <motion.a
              href="#for-pages"
              whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.06)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "9px",
                padding: "clamp(12px,1.4vw,16px) clamp(20px,2.5vw,30px)",
                borderRadius: "10px",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(16px,1.8vw,20px)",
                letterSpacing: "0.1em",
                textDecoration: "none",
                background: "transparent", color: "rgba(255,255,255,0.78)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              💸 JOIN AS CREATOR
            </motion.a>
          </motion.div>

          {/* STATS STRIP */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.82 }}
            style={{ display: "flex", gap: "clamp(16px,3vw,32px)", flexWrap: "wrap" }}
          >
            {STATS_ROW.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.88 + i * 0.07, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ display: "flex", flexDirection: "column", gap: "2px" }}
              >
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(22px,3vw,34px)", color: s.color, lineHeight: 1, letterSpacing: "0.04em", textShadow: `0 0 24px ${s.color}40` }}>
                  {s.val}
                </span>
                <span style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  {s.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN — DEAL FEED ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="hv6-feed"
          style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "16px" }}
        >
          {/* feed header */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <motion.div animate={{ opacity: [1,0.2,1] }} transition={{ duration: 1.1, repeat: Infinity }}
              style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
            <span style={{ fontFamily: "monospace", fontSize: "9px", fontWeight: 700, color: "#4ade80", letterSpacing: "0.18em" }}>LIVE DEAL FEED</span>
          </div>

          <DealFeed />

          {/* feed footer note */}
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <span style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.12em" }}>
              DEALS HAPPENING RIGHT NOW · WORLDWIDE
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── TAPE STRIPS ── */}
      <div style={{ position: "relative", zIndex: 10, marginTop: "clamp(16px,3vw,32px)" }}>
        <Tape direction="left" />
        <Tape direction="right" />
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hv6-grid {
            grid-template-columns: 1fr !important;
          }
          .hv6-feed {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}