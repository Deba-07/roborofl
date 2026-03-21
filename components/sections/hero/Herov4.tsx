"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

// ── Ticker data ───────────────────────────────────────────────────────────────
const TICKERS = [
  { sym: "HMRM", name: "Humor & Memes",    val: 8420, chg: +3.2,  color: "#facc15" },
  { sym: "BLWD", name: "Bollywood",        val: 6180, chg: +1.8,  color: "#a78bfa" },
  { sym: "CRKT", name: "Cricket",          val: 9340, chg: +5.1,  color: "#ec5b13" },
  { sym: "FNCE", name: "Finance",          val: 4290, chg: +2.4,  color: "#4ade80" },
  { sym: "TECH", name: "Tech & Startups",  val: 7710, chg: +0.9,  color: "#38bdf8" },
  { sym: "PLTS", name: "Politics",         val: 5560, chg: +4.3,  color: "#f472b6" },
  { sym: "GNZR", name: "Gen Z",            val: 8900, chg: +6.7,  color: "#facc15" },
  { sym: "GBLG", name: "Global English",   val: 3870, chg: +1.1,  color: "#38bdf8" },
];

const HEADLINE_WORDS = [
  { text: "THE",    color: "rgba(255,255,255,0.18)", outline: true,  size: 1.0  },
  { text: "MEME",   color: "#facc15",                outline: false, size: 1.35 },
  { text: "STOCK",  color: "white",                  outline: false, size: 1.0  },
  { text: "MARKET", color: "#ec5b13",                outline: false, size: 1.15 },
  { text: "IS",     color: "rgba(255,255,255,0.25)", outline: true,  size: 0.75 },
  { text: "OPEN",   color: "white",                  outline: false, size: 1.4  },
];

// ── Animated ticker row ───────────────────────────────────────────────────────
function TickerRow({ t, delay }: { t: typeof TICKERS[0]; delay: number }) {
  const [val, setVal] = useState(t.val);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const jitter = () => {
      const delta = (Math.random() - 0.45) * 40;
      setVal(p => Math.max(1000, +(p + delta).toFixed(0)));
      setFlash(delta > 0 ? "up" : "down");
      setTimeout(() => setFlash(null), 300);
    };
    const id = setInterval(jitter, 1400 + delay * 300 + Math.random() * 800);
    return () => clearInterval(id);
  }, [delay]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.08 }}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "9px 16px",
        borderRadius: "8px",
        background: flash === "up" ? "rgba(74,222,128,0.07)" : flash === "down" ? "rgba(255,80,80,0.07)" : "rgba(255,255,255,0.025)",
        border: `1px solid ${flash === "up" ? "rgba(74,222,128,0.3)" : flash === "down" ? "rgba(255,80,80,0.2)" : "rgba(255,255,255,0.06)"}`,
        transition: "background 0.15s, border-color 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "14px", color: t.color, letterSpacing: "0.1em", minWidth: "40px" }}>{t.sym}</span>
        <span style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em", display: "none" }} className="ticker-name">{t.name}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <motion.span
          animate={{ color: flash === "up" ? "#4ade80" : flash === "down" ? "#ff5555" : "rgba(255,255,255,0.7)" }}
          transition={{ duration: 0.15 }}
          style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em" }}
        >
          {val.toLocaleString()}
        </motion.span>
        <span style={{
          fontFamily: "monospace", fontSize: "9px", fontWeight: 700,
          color: t.chg >= 0 ? "#4ade80" : "#ff5555",
          letterSpacing: "0.04em",
        }}>
          {t.chg >= 0 ? "▲" : "▼"} {Math.abs(t.chg)}%
        </span>
      </div>
    </motion.div>
  );
}

// ── Matrix emoji rain column ──────────────────────────────────────────────────
const RAIN_EMOJIS = ["😂","💸","🔥","💯","👑","⚡","🎬","🏏","🚀","💻","🗳️","🎙️"];

function RainColumn({ x, duration, delay }: { x: string; duration: number; delay: number }) {
  const [emojis, setEmojis] = useState<string[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 8 }, (_, i) =>
      RAIN_EMOJIS[(i + Math.floor(Math.random() * 5)) % RAIN_EMOJIS.length]
    );
    setEmojis(generated);
  }, []);

  return (
    <motion.div
      initial={{ y: "-100%" }}
      animate={{ y: "120%" }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
      style={{
        position: "absolute", left: x, top: 0,
        display: "flex", flexDirection: "column", gap: "20px",
        fontSize: "16px", opacity: 0.06,
        pointerEvents: "none",
      }}
    >
      {emojis.map((e, i) => <span key={`emoji-${i}`}>{e}</span>)}
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HeroV4() {
  const [marketOpen] = useState(true);
  const [totalReach, setTotalReach] = useState(24800000);

  useEffect(() => {
    const id = setInterval(() => {
      setTotalReach(p => p + Math.floor(Math.random() * 3000));
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const fmtReach = (n: number) => {
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    return `${(n / 1e3).toFixed(0)}K`;
  };

  return (
    <section id="hero" style={{
      minHeight: "100dvh", position: "relative",
      background: "#060806", overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      {/* emoji rain background */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
        {[
          ["7%", 9, 0], ["16%", 11, 1.2], ["26%", 8, 0.4], ["38%", 12, 2.1],
          ["52%", 10, 0.8], ["63%", 9, 1.6], ["74%", 11, 0.3], ["84%", 8, 1.9], ["93%", 10, 0.7],
        ].map(([x, dur, del], i) => (
          <RainColumn key={i} x={x as string} duration={dur as number} delay={del as number} />
        ))}
      </div>

      {/* dark vignette over rain */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(6,8,6,0.4) 0%, rgba(6,8,6,0.92) 70%)", zIndex: 1, pointerEvents: "none" }} />

      {/* green glow */}
      <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: "60vw", height: "60vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(74,222,128,0.05) 0%, transparent 65%)", pointerEvents: "none", zIndex: 1 }} />

      {/* ── EXCHANGE HEADER ── */}
      <div style={{
        position: "relative", zIndex: 10,
        paddingTop: "80px",
        borderBottom: "1px solid rgba(74,222,128,0.15)",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(12px)",
        padding: "80px 24px 0",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", flexWrap: "wrap", gap: "12px" }}>
          {/* exchange name */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px",
              color: "#4ade80", letterSpacing: "0.08em",
            }}>RBR EXCHANGE</div>
            <div style={{
              padding: "3px 10px", borderRadius: "4px",
              background: marketOpen ? "rgba(74,222,128,0.15)" : "rgba(255,0,0,0.15)",
              border: `1px solid ${marketOpen ? "rgba(74,222,128,0.4)" : "rgba(255,0,0,0.4)"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <motion.div animate={{ opacity: [1,0.2,1] }} transition={{ duration: 0.9, repeat: Infinity }}
                  style={{ width: "5px", height: "5px", borderRadius: "50%", background: marketOpen ? "#4ade80" : "#ff5555" }} />
                <span style={{ fontFamily: "monospace", fontSize: "9px", fontWeight: 700, color: marketOpen ? "#4ade80" : "#ff5555", letterSpacing: "0.14em" }}>
                  {marketOpen ? "MARKET OPEN" : "MARKET CLOSED"}
                </span>
              </div>
            </div>
          </div>

          {/* live reach counter */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontFamily: "monospace", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>TOTAL REACH</span>
            <motion.span
              animate={{ color: ["#4ade80", "#ffffff", "#4ade80"] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", letterSpacing: "0.06em" }}
            >
              {fmtReach(totalReach)}
            </motion.span>
          </div>

          {/* scrolling mini ticker */}
          <div style={{ overflow: "hidden", maxWidth: "320px", display: "flex", gap: "0" }}>
            <style>{`
              @keyframes minit { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
              .minit { display:flex; width:max-content; animation:minit 18s linear infinite; }
            `}</style>
            <div className="minit">
              {[...TICKERS, ...TICKERS].map((t, i) => (
                <span key={i} style={{ fontFamily: "monospace", fontSize: "10px", padding: "0 14px", whiteSpace: "nowrap", color: t.chg >= 0 ? "#4ade80" : "#ff5555", letterSpacing: "0.06em" }}>
                  {t.sym} {t.chg >= 0 ? "▲" : "▼"}{Math.abs(t.chg)}%
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, position: "relative", zIndex: 5, display: "grid", maxWidth: "1280px", margin: "0 auto", width: "100%", padding: "32px 24px 0" }} className="hv4-main">

        {/* LEFT — headline */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>

          {/* stacked headline words */}
          <div style={{ marginBottom: "24px" }}>
            {HEADLINE_WORDS.map((w, i) => (
              <motion.div
                key={w.text}
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: `clamp(${Math.round(44 * w.size)}px, ${(9 * w.size).toFixed(1)}vw, ${Math.round(108 * w.size)}px)`,
                  color: w.outline ? "transparent" : w.color,
                  WebkitTextStroke: w.outline ? `1.5px ${w.color}` : "none",
                  letterSpacing: "0.02em",
                  lineHeight: 0.9,
                  userSelect: "none",
                  display: "block",
                  textShadow: !w.outline && w.color !== "white" && w.color !== "rgba(255,255,255,0.18)" ? `0 0 60px ${w.color}40` : "none",
                }}
              >
                {w.text}
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "clamp(13px, 1.2vw, 16px)", color: "rgba(255,255,255,0.38)", maxWidth: "440px", lineHeight: 1.65, marginBottom: "28px" }}
          >
            500+ verified meme pages. Real reach, real engagement, zero bots.{" "}
            <span style={{ color: "rgba(255,255,255,0.72)", fontWeight: 600 }}>Brief to live in 48 hours.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
          >
            <motion.a href="#for-brands"
              whileHover={{ scale: 1.04, boxShadow: "0 0 48px rgba(74,222,128,0.4)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "14px 32px", borderRadius: "8px",
                fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px",
                letterSpacing: "0.1em", textDecoration: "none",
                background: "#4ade80", color: "#060806",
                boxShadow: "0 0 32px rgba(74,222,128,0.2)",
              }}
            >BUY REACH →</motion.a>
            <motion.a href="#for-pages"
              whileHover={{ scale: 1.04, borderColor: "rgba(255,255,255,0.4)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "14px 28px", borderRadius: "8px",
                fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px",
                letterSpacing: "0.1em", textDecoration: "none",
                background: "rgba(255,255,255,0)", color: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >LIST YOUR PAGE</motion.a>
          </motion.div>
        </div>

        {/* RIGHT — live ticker board */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="hv4-ticker-board"
          style={{
            borderRadius: "16px",
            border: "1px solid rgba(74,222,128,0.15)",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(16px)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(74,222,128,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, color: "rgba(74,222,128,0.7)", letterSpacing: "0.14em" }}>CATEGORY INDEX</span>
            <span style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>REACH / PAGE</span>
          </div>
          <div style={{ padding: "10px 10px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {TICKERS.map((t, i) => <TickerRow key={t.sym} t={t} delay={i} />)}
          </div>
        </motion.div>
      </div>

      {/* bottom stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        style={{
          position: "relative", zIndex: 10,
          maxWidth: "1280px", margin: "24px auto 0", width: "100%",
          padding: "0 24px 24px",
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px",
        }}
        className="hv4-stats"
      >
        {[
          { l: "Verified Pages",   v: "500+",  c: "#4ade80" },
          { l: "Live Campaigns",   v: "48hrs", c: "#facc15" },
          { l: "Categories",       v: "12",    c: "#ec5b13" },
          { l: "Avg. Engagement",  v: "8.4%",  c: "#38bdf8" },
        ].map((s, i) => (
          <motion.div key={s.l}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.85 + i * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              padding: "14px 16px", borderRadius: "10px",
              background: "rgba(0,0,0,0.5)",
              border: `1px solid ${s.c}20`,
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(22px, 3vw, 32px)", color: s.c, lineHeight: 1, letterSpacing: "0.04em" }}>{s.v}</div>
            <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "3px" }}>{s.l}</div>
          </motion.div>
        ))}
      </motion.div>

      <style>{`
        .hv4-main {
          grid-template-columns: 1fr 340px;
          gap: 48px;
          align-items: center;
        }
        .ticker-name { display: none !important; }
        @media (max-width: 960px) {
          .hv4-main { grid-template-columns: 1fr !important; }
          .hv4-ticker-board { display: none !important; }
          .hv4-stats { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </section>
  );
}