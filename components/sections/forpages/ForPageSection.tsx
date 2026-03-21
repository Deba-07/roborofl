"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";

// ── Data ──────────────────────────────────────────────────────────────────────
const RECEIPTS = [
  {
    emoji: "💰", tag: "FAIR RATES", reaction: "🤑",
    headline: "2.4× more than direct deals",
    sub: "We benchmark every offer globally. No lowballs. No 'exposure' payments. Ever.",
    color: "#facc15", stat: "2.4×", delay: 0.08,
  },
  {
    emoji: "⏰", tag: "PAID ON TIME", reaction: "💯",
    headline: "100% on-time. No ghost mode.",
    sub: "Money hits within the agreed window. Every time. We track every payment.",
    color: "#4ade80", stat: "100%", delay: 0.18,
  },
  {
    emoji: "🎛️", tag: "YOUR CALL", reaction: "👑",
    headline: "You approve every brief",
    sub: "See the full brief first. Say yes or nah. Your page, your vibe, your rules.",
    color: "#38bdf8", stat: "0 forced", delay: 0.28,
  },
];

// Global FOMO toasts — worldwide creators
const FOMO_TOASTS = [
  { name: "Ravi S.",     page: "Desi Memes",        amount: "₹14,000", flag: "🇮🇳", emoji: "🔥" },
  { name: "Jake T.",     page: "UK Meme Factory",   amount: "£620",    flag: "🇬🇧", emoji: "💸" },
  { name: "Amir K.",     page: "Gulf Humor",        amount: "$480",    flag: "🇦🇪", emoji: "👑" },
  { name: "Priya M.",    page: "Brown Girl Memes",  amount: "$390",    flag: "🇨🇦", emoji: "💯" },
  { name: "Carlos R.",   page: "Desi Abroad",       amount: "$510",    flag: "🇺🇸", emoji: "🤑" },
  { name: "Fatima N.",   page: "South Asian Rants", amount: "£550",    flag: "🇬🇧", emoji: "⚡" },
];

const BG_EMOJIS = [
  { e:"😂", x:"6%",  y:"10%", s:3.4, rot:-14 },
  { e:"🔥", x:"87%", y:"7%",  s:2.6, rot: 16 },
  { e:"💸", x:"4%",  y:"58%", s:3.0, rot:-9  },
  { e:"💯", x:"91%", y:"52%", s:2.2, rot: 11 },
  { e:"👑", x:"14%", y:"84%", s:2.8, rot:-6  },
  { e:"🌍", x:"84%", y:"78%", s:2.0, rot: 20 },
  { e:"🚀", x:"48%", y:"4%",  s:1.8, rot:  4 },
  { e:"⚡", x:"73%", y:"28%", s:1.6, rot:-17 },
];

const DM_MSGS = [
  { from: "brand",   text: "Hey! Saw your page 👀 love the content frrr",              delay: 0.3  },
  { from: "you",     text: "thx bro 🙏 what's the deal?",                              delay: 1.0  },
  { from: "brand",   text: "₹8,500 for 1 reel. DM us the rate card",                  delay: 1.7  },
  { from: "you",     text: "lmao they always say this then ghost 😭", isThought: true, delay: 2.3  },
  { from: "robo",    text: "💸 Roborofl Deal\n₹8,500 · 1 Reel · 48hr\nVerified ✓  Payment locked 🔒", delay: 3.0 },
  { from: "you",     text: "W. Accepted ✅",                                            delay: 3.8  },
  { from: "robo",    text: "Paid in 3 days. No cap. 🤝",                               delay: 4.4  },
];

// ── DM Chat — fixed height, loops, never pushes layout ───────────────────────
function DMChat({ inView }: { inView: boolean }) {
  const [vis, setVis] = useState(0);
  const msgsRef = useRef<HTMLDivElement>(null);
  const timers  = useRef<ReturnType<typeof setTimeout>[]>([]);

  const runCycle = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setVis(0);
    DM_MSGS.forEach((m, i) => {
      const t = setTimeout(() => setVis(i + 1), m.delay * 1000 + 600);
      timers.current.push(t);
    });
    const totalMs = DM_MSGS[DM_MSGS.length - 1].delay * 1000 + 600 + 2600;
    timers.current.push(setTimeout(runCycle, totalMs));
  };

  useEffect(() => {
    if (!inView) return;
    runCycle();
    return () => timers.current.forEach(clearTimeout);
  }, [inView]); // eslint-disable-line

  // scroll inside the message box only — never call scrollIntoView on the page
  useEffect(() => {
    const el = msgsRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [vis]);

  return (
    // CRITICAL: explicit fixed dimensions — never grows, never shrinks
    <div style={{ width: "280px", flexShrink: 0 }}>
      <div style={{
        borderRadius: "32px",
        background: "#000",
        border: "2px solid rgba(255,255,255,0.1)",
        boxShadow: "0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)",
        overflow: "hidden",
        // total height is fixed — phone never resizes
        height: "520px",
        display: "flex", flexDirection: "column",
      }}>
        {/* status bar */}
        <div style={{ background: "#000", padding: "10px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: "monospace", fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>9:41</span>
          <div style={{ width: "70px", height: "16px", background: "#111", borderRadius: "0 0 10px 10px" }} />
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            {[3,4,5].map(h => <div key={h} style={{ width: "3px", height: `${h}px`, background: "rgba(255,255,255,0.5)", borderRadius: "1px" }}/>)}
            <div style={{ width: "14px", height: "7px", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "2px", position: "relative" }}>
              <div style={{ position: "absolute", inset: "1px 1px 1px 2px", background: "#4ade80", borderRadius: "1px" }}/>
            </div>
          </div>
        </div>

        {/* header */}
        <div style={{ background: "#000", padding: "8px 14px", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg,#ffd600,#ff6b00,#ff0069,#d300c5)", padding: "2px" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}>🤖</div>
            </div>
            <div style={{ position: "absolute", bottom: -1, right: -1, width: "10px", height: "10px", borderRadius: "50%", background: "#4ade80", border: "2px solid #000" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "13px", fontWeight: 700, color: "white" }}>Roborofl</div>
            <div style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Active now · Worldwide 🌍</div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            {["📞","📹"].map(ic => <span key={ic} style={{ fontSize: "14px", opacity: 0.55 }}>{ic}</span>)}
          </div>
        </div>

        {/* messages — fixed height, internal scroll only */}
        <div
          ref={msgsRef}
          style={{
            flex: 1,
            background: "#000", padding: "10px 10px 6px",
            overflowY: "auto", display: "flex", flexDirection: "column", gap: "5px",
            scrollbarWidth: "none",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "6px" }}>
            <span style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.22)", background: "rgba(255,255,255,0.05)", padding: "2px 10px", borderRadius: "9999px" }}>Today</span>
          </div>

          {DM_MSGS.map((msg, i) => (
            vis > i && (
              <motion.div
                key={`${i}-${vis < i + 1}`}
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: "flex", flexDirection: "column", alignItems: msg.from === "you" ? "flex-end" : "flex-start" }}
              >
                {msg.isThought ? (
                  <div style={{ padding: "5px 10px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.1)", fontFamily: "'Public Sans', sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.3)", fontStyle: "italic", maxWidth: "85%" }}>
                    {msg.text}
                  </div>
                ) : (
                  <div style={{
                    maxWidth: "80%", padding: "7px 11px",
                    borderRadius: msg.from === "you" ? "16px 16px 3px 16px" : msg.from === "robo" ? "3px 16px 16px 16px" : "16px 16px 16px 3px",
                    background: msg.from === "you" ? "linear-gradient(135deg,#0095f6,#0074cc)" : msg.from === "robo" ? "rgba(250,204,21,0.12)" : "rgba(255,255,255,0.1)",
                    border: msg.from === "robo" ? "1px solid rgba(250,204,21,0.35)" : "none",
                    fontFamily: "'Public Sans', sans-serif", fontSize: "11px", fontWeight: 500,
                    color: msg.from === "you" ? "white" : msg.from === "robo" ? "#facc15" : "rgba(255,255,255,0.88)",
                    lineHeight: 1.45, whiteSpace: "pre-line",
                  }}>
                    {msg.from === "robo" && <div style={{ fontFamily: "monospace", fontSize: "7px", color: "rgba(250,204,21,0.55)", letterSpacing: "0.1em", marginBottom: "4px" }}>ROBOROFL · VERIFIED</div>}
                    {msg.text}
                  </div>
                )}
                {msg.from === "you" && vis > i + 1 && (
                  <span style={{ fontSize: "9px", color: "#0095f6", marginTop: "1px", marginRight: "2px" }}>Seen ✓✓</span>
                )}
              </motion.div>
            )
          ))}

          {/* typing dots */}
          {vis > 0 && vis < DM_MSGS.length && (
            <div style={{ display: "flex", gap: "4px", padding: "6px 10px", alignItems: "center" }}>
              {[0,1,2].map(i => (
                <motion.div key={i}
                  animate={{ scale: [1,1.5,1], opacity: [0.3,1,0.3] }}
                  transition={{ duration: 0.65, repeat: Infinity, delay: i * 0.16 }}
                  style={{ width: "5px", height: "5px", borderRadius: "50%", background: "rgba(255,255,255,0.4)" }}
                />
              ))}
            </div>
          )}
        </div>

        {/* input bar */}
        <div style={{ background: "#000", padding: "8px 12px 12px", display: "flex", alignItems: "center", gap: "8px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div style={{ flex: 1, height: "30px", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.16)", display: "flex", alignItems: "center", padding: "0 12px" }}>
            <span style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>Message…</span>
          </div>
          <span style={{ fontSize: "17px" }}>❤️</span>
        </div>
      </div>
    </div>
  );
}

// ── FOMO toasts ───────────────────────────────────────────────────────────────
function FOMOToasts({ inView }: { inView: boolean }) {
  const [current, setCurrent] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (!inView || started) return;
    setStarted(true);
    let idx = 0;
    const show = () => {
      setCurrent(idx % FOMO_TOASTS.length);
      idx++;
      setTimeout(() => { setCurrent(null); setTimeout(show, 1600 + Math.random() * 1400); }, 2800);
    };
    setTimeout(show, 1800);
  }, [inView, started]);

  return (
    <div style={{ position: "absolute", bottom: "28px", left: "20px", zIndex: 10, pointerEvents: "none" }}>
      <AnimatePresence>
        {current !== null && (
          <motion.div key={current}
            initial={{ opacity: 0, x: -36, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "14px", background: "rgba(10,8,0,0.96)", border: "1px solid rgba(250,204,21,0.25)", backdropFilter: "blur(12px)", maxWidth: "240px", position: "relative", overflow: "hidden" }}
          >
            <span style={{ fontSize: "18px", flexShrink: 0 }}>{FOMO_TOASTS[current].flag}</span>
            <div>
              <div style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "11px", fontWeight: 700, color: "white", lineHeight: 1.3 }}>
                {FOMO_TOASTS[current].name} got {FOMO_TOASTS[current].amount} {FOMO_TOASTS[current].emoji}
              </div>
              <div style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.35)", marginTop: "1px" }}>
                {FOMO_TOASTS[current].page}
              </div>
            </div>
            <motion.div
              initial={{ width: "100%" }} animate={{ width: "0%" }}
              transition={{ duration: 2.8, ease: "linear" }}
              style={{ position: "absolute", bottom: 0, left: 0, height: "2px", background: "#facc15", borderRadius: "0 0 0 14px" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Data for OfferSheet ───────────────────────────────────────────────────────
const BENEFITS_DATA = [
  {
    emoji: "💰", tag: "FAIR RATES",   reaction: "🤑",
    headline: "2.4× more than direct",
    sub: "We benchmark every offer globally. No lowballs. No exposure payments.",
    color: "#facc15", stat: "2.4×",
  },
  {
    emoji: "⏰", tag: "PAID ON TIME", reaction: "💯",
    headline: "100% on-time. Always.",
    sub: "Money hits within the agreed window. Every single time. We track it.",
    color: "#4ade80", stat: "100%",
  },
  {
    emoji: "🎛️", tag: "YOUR CALL",   reaction: "👑",
    headline: "You approve every brief",
    sub: "See the full brief first. Say yes or nah. Your page, your rules.",
    color: "#38bdf8", stat: "0 forced",
  },
];

const TERMS_DATA = [
  { icon: "🆓", bold: "Free to join",        rest: "zero fees, we earn when you earn",       color: "#facc15" },
  { icon: "🤝", bold: "No exclusivity",       rest: "work with anyone, we don't own you",     color: "#4ade80" },
  { icon: "📱", bold: "WhatsApp only",        rest: "no new app, no dashboard, just ur phone", color: "#38bdf8" },
  { icon: "👀", bold: "Opt-in every time",    rest: "see the brief before you commit",        color: "#a78bfa" },
  { icon: "💰", bold: "Market-rate only",     rest: "lowball offers never reach you",          color: "#ec5b13" },
];

// ── The Offer Sheet — unified left/right panel ────────────────────────────────
function OfferSheet({ inView }: { inView: boolean }) {
  const [activeB, setActiveB] = useState(0);
  const [litT, setLitT]       = useState(0);
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const termRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // benefit auto-cycle
  useEffect(() => {
    if (!inView) return;
    cycleRef.current = setInterval(() => setActiveB(p => (p + 1) % BENEFITS_DATA.length), 2600);
    return () => { if (cycleRef.current) clearInterval(cycleRef.current); };
  }, [inView]);

  // term sequential lighting
  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const tick = () => {
      setLitT(i % TERMS_DATA.length);
      i++;
      termRef.current = setTimeout(tick, 1500);
    };
    termRef.current = setTimeout(tick, 400);
    return () => { if (termRef.current) clearTimeout(termRef.current); };
  }, [inView]);

  const b = BENEFITS_DATA[activeB];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        borderRadius: "24px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: `0 40px 100px rgba(0,0,0,0.5)`,
      }}
      className="offer-sheet"
    >
      {/* ── LEFT — benefit selector ── */}
      <div style={{ borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column" }}>

        {/* selector rows */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {BENEFITS_DATA.map((item, i) => {
            const isActive = i === activeB;
            return (
              <motion.button
                key={item.tag}
                onClick={() => {
                  setActiveB(i);
                  if (cycleRef.current) clearInterval(cycleRef.current);
                  cycleRef.current = setInterval(() => setActiveB(p => (p + 1) % BENEFITS_DATA.length), 2600);
                }}
                animate={{
                  background: isActive ? `${item.color}10` : `${item.color}00`,
                }}
                initial={{ background: `${item.color}00` }}
                transition={{ duration: 0.3 }}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "18px 22px",
                  border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  textAlign: "left",
                }}
              >
                {/* active left bar */}
                <motion.div
                  animate={{ scaleY: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    width: "3px", background: item.color,
                    transformOrigin: "top",
                    boxShadow: `0 0 12px ${item.color}`,
                  }}
                />
                <motion.span
                  animate={{ scale: isActive ? 1.15 : 1, rotate: isActive ? [0, 8, -4, 0] : 0 }}
                  transition={{ duration: isActive ? 1.5 : 0.3, repeat: isActive ? Infinity : 0 }}
                  style={{ fontSize: "22px", flexShrink: 0 }}
                >{item.emoji}</motion.span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "monospace", fontSize: "8px", fontWeight: 700,
                    color: isActive ? item.color : "rgba(255,255,255,0.25)",
                    letterSpacing: "0.18em", textTransform: "uppercase",
                    marginBottom: "2px", transition: "color 0.3s",
                  }}>{item.tag}</div>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "clamp(14px, 1.6vw, 18px)",
                    color: isActive ? "white" : "rgba(255,255,255,0.4)",
                    letterSpacing: "0.04em", lineHeight: 1,
                    transition: "color 0.3s",
                  }}>{item.headline}</div>
                </div>
                <motion.div
                  animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 8 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "clamp(18px, 2vw, 24px)",
                    color: item.color,
                    lineHeight: 1, flexShrink: 0,
                    textShadow: `0 0 20px ${item.color}80`,
                  }}
                >{item.stat}</motion.div>
              </motion.button>
            );
          })}
        </div>

        {/* expanded detail of active */}
        <div style={{ flex: 1, padding: "24px 22px", position: "relative", overflow: "hidden", minHeight: "140px" }}>
          {/* color glow */}
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(circle at 30% 50%, ${b.color}12 0%, ${b.color}00 65%)`,
            pointerEvents: "none", transition: "background 0.4s",
          }} />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeB}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: "relative" }}
            >
              {/* big stat */}
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(48px, 6vw, 72px)",
                  color: b.color,
                  lineHeight: 1, letterSpacing: "0.02em",
                  textShadow: `0 0 60px ${b.color}50`,
                  marginBottom: "10px",
                }}
              >{b.stat}</motion.div>
              <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.16em", marginBottom: "10px" }}>VERIFIED · WORLDWIDE</div>
              <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: "0 0 14px" }}>
                {b.sub}
              </p>
              {/* sweep bar */}
              <div style={{ height: "2px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                <motion.div
                  key={`bar-${activeB}`}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.6, ease: "linear" }}
                  style={{ height: "100%", background: b.color, borderRadius: "2px", boxShadow: `0 0 8px ${b.color}` }}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── RIGHT — deal terms ── */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* header */}
        <div style={{
          padding: "18px 22px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <motion.span
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: "16px" }}
          >📋</motion.span>
          <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
            The Deal · No BS
          </span>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px" }}
          >
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
            <span style={{ fontFamily: "monospace", fontSize: "8px", color: "#4ade80", letterSpacing: "0.1em" }}>LIVE</span>
          </motion.div>
        </div>

        {/* terms list */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {TERMS_DATA.map((t, i) => (
            <motion.div
              key={t.bold}
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "16px 22px",
                borderBottom: i < TERMS_DATA.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                position: "relative", overflow: "hidden",
                flex: 1,
              }}
            >
              {/* sweep highlight */}
              <AnimatePresence>
                {litT === i && (
                  <motion.div
                    key="sweep"
                    initial={{ x: "-100%", opacity: 0.8 }}
                    animate={{ x: "100%", opacity: 0 }}
                    exit={{}}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                    style={{
                      position: "absolute", inset: 0,
                      background: `linear-gradient(90deg, ${t.color}00, ${t.color}20, ${t.color}00)`,
                      pointerEvents: "none",
                    }}
                  />
                )}
              </AnimatePresence>
              {/* persistent tint on active */}
              <motion.div
                animate={{ opacity: litT === i ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: "absolute", inset: 0,
                  background: `linear-gradient(90deg, ${t.color}08 0%, ${t.color}00 60%)`,
                  borderLeft: `2px solid ${t.color}`,
                  pointerEvents: "none",
                }}
              />

              <motion.span
                animate={{
                  scale:  litT === i ? 1.25 : 1,
                  rotate: litT === i ? 10 : 0,
                }}
                transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] as [number,number,number,number] }}
                style={{ fontSize: "18px", flexShrink: 0, position: "relative" }}
              >{t.icon}</motion.span>

              <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
                <span style={{
                  fontFamily: "'Public Sans', sans-serif", fontSize: "13px", fontWeight: 700,
                  color: litT === i ? "white" : "rgba(255,255,255,0.65)",
                  transition: "color 0.3s",
                }}>{t.bold} </span>
                <span style={{
                  fontFamily: "'Public Sans', sans-serif", fontSize: "11px",
                  color: litT === i ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.2)",
                  transition: "color 0.3s",
                }}>— {t.rest}</span>
              </div>

              <motion.div
                animate={{
                  scale:   litT === i ? [0.5, 1.4, 1] : 1,
                  opacity: litT === i ? 1 : 0.15,
                }}
                transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number,number,number,number] }}
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "20px", color: t.color,
                  flexShrink: 0, position: "relative",
                  textShadow: litT === i ? `0 0 16px ${t.color}` : "none",
                }}
              >✓</motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}


// ── Tally modal ───────────────────────────────────────────────────────────────
function TallyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }} onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }} />
          <motion.div key="panel"
            initial={{ y: "100%", opacity: 0 }} animate={{ y: "0%", opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 101, background: "#0a0800", borderTop: "2px solid rgba(250,204,21,0.5)", borderRadius: "24px 24px 0 0", height: "92vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <motion.div animate={{ rotate: [0, 14, -10, 0] }} transition={{ duration: 1.8, repeat: Infinity }} style={{ fontSize: "24px" }}>💸</motion.div>
                <div>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", letterSpacing: "0.06em", color: "white", margin: 0, lineHeight: 1 }}>Join the Roborofl Network</p>
                  <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>5 min · free · no exclusivity · worldwide</p>
                </div>
              </div>
              <motion.button onClick={onClose} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: "16px" }}>✕</motion.button>
            </div>
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", background: "#0a0800", zIndex: 0 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  style={{ width: "36px", height: "36px", borderRadius: "50%", border: "2px solid rgba(250,204,21,0.15)", borderTopColor: "#facc15" }} />
                <span style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>Loading form...</span>
              </div>
              <iframe src="https://tally.so/embed/YOUR_TALLY_FORM_ID?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
                width="100%" height="100%" frameBorder={0} marginHeight={0} marginWidth={0}
                title="Join the Roborofl Network"
                style={{ position: "relative", zIndex: 1, background: "transparent", border: "none" }}
                onLoad={e => { const l = (e.currentTarget.previousElementSibling as HTMLElement); if (l) l.style.display = "none"; }} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────────
export default function ForPagesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-20% 0px -20% 0px" });
  const [modalOpen, setModalOpen] = useState(false);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <>
      <section id="for-pages" ref={sectionRef}
        style={{ position: "relative", background: "#0a0800", overflow: "hidden", paddingBottom: "100px" }}
      >
        {/* grain */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.4,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px" }} />

        {/* bg emojis */}
        {BG_EMOJIS.map((b, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={inView ? { opacity: 0.07 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            style={{ position: "absolute", left: b.x, top: b.y, fontSize: `${b.s}rem`, transform: `rotate(${b.rot}deg)`, pointerEvents: "none", userSelect: "none" }}
          >{b.e}</motion.div>
        ))}

        {/* top edge */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "60%", height: "2px", background: "linear-gradient(90deg,transparent,#facc15,transparent)", opacity: 0.5 }} />

        {/* FOMO toasts */}
        <FOMOToasts inView={inView} />

        {/* glow */}
        <motion.div style={{ y: bgY }} className="fp-glow" />

        {/* ── HERO — two col on desktop, stacked on mobile ── */}
        <div className="fp-hero" style={{ maxWidth: "1200px", margin: "0 auto", padding: "88px 24px 48px" }}>

          {/* LEFT — copy */}
          <div className="fp-copy">
            <motion.p initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4 }}
              style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(250,204,21,0.7)", margin: "0 0 18px" }}
            >For Meme Page Admins — Worldwide 🌍</motion.p>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
              style={{ marginBottom: "18px" }}
            >
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(44px, 7vw, 92px)", letterSpacing: "0.01em", lineHeight: 0.9, color: "white" }}>
                YOUR PAGE.<br/>
                <span style={{ color: "#facc15", textShadow: "0 0 80px rgba(250,204,21,0.45)" }}>YOUR MONEY.</span><br/>
                <span style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.6em", letterSpacing: "0.08em" }}>NO CAP. FR FR.</span>
              </div>
            </motion.div>

            <motion.p initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.25 }}
              style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "clamp(14px, 1.1vw, 16px)", color: "rgba(255,255,255,0.38)", maxWidth: "400px", lineHeight: 1.65, marginBottom: "24px" }}
            >
              Brand deals to your WhatsApp. Fair rates. On-time payment. Full control.{" "}
              <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Pages from IN, UK, UAE, US, CA, SG already earning. 🍽️</span>
            </motion.p>

            {/* earnings badge */}
            <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.45, delay: 0.38, ease: [0.34, 1.56, 0.64, 1] as [number,number,number,number] }}
              style={{ display: "inline-flex", alignItems: "center", gap: "12px", padding: "12px 18px", borderRadius: "14px", background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.22)" }}
            >
              <motion.span animate={{ rotate: [0, 18, -12, 0] }} transition={{ duration: 2.2, repeat: Infinity }} style={{ fontSize: "26px" }}>💸</motion.span>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(20px, 2.5vw, 28px)", color: "#facc15", lineHeight: 1, letterSpacing: "0.04em" }}>$150 – $1,200 USD</div>
                <div style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>avg. per campaign · paid within 3 days</div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT — phone, only in flow on desktop */}
          <motion.div
            className="fp-phone"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
          >
            <DMChat inView={inView} />
          </motion.div>
        </div>

        {/* ── Offer Sheet — unified benefit selector + deal terms ── */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <OfferSheet inView={inView} />
        </div>

        {/* ── CTA ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.8 }}
          style={{ maxWidth: "560px", margin: "40px auto 0", padding: "0 24px" }}
        >
          <motion.button onClick={() => setModalOpen(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "20px 32px", borderRadius: "16px", background: "#facc15", border: "none", cursor: "pointer", boxShadow: "0 0 48px rgba(250,204,21,0.32), 0 12px 40px rgba(0,0,0,0.5)", position: "relative", overflow: "hidden" }}
          >
            <motion.div animate={{ x: ["-120%","120%"] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
              style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)", pointerEvents: "none" }} />
            <motion.span animate={{ rotate: [0,16,-12,0] }} transition={{ duration: 1.8, repeat: Infinity }} style={{ fontSize: "22px", position: "relative" }}>💸</motion.span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(20px,2.5vw,26px)", letterSpacing: "0.08em", color: "#0a0800", position: "relative" }}>
              GET ME IN — JOIN WORLDWIDE
            </span>
          </motion.button>
          <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: "10px", letterSpacing: "0.06em" }}>
            Free · No exclusivity · Open to creators worldwide
          </p>
        </motion.div>

        <style>{`
          .fp-glow { position:absolute; top:25%; left:50%; transform:translate(-50%,-50%); width:80%; padding-bottom:40%; background:radial-gradient(ellipse,rgba(250,204,21,0.07) 0%,transparent 70%); pointer-events:none; }
          .fp-hero { display:grid; grid-template-columns:1fr auto; gap:40px; align-items:center; }
          .fp-phone { display:block; }
          @media (max-width:900px) {
            .fp-hero { grid-template-columns:1fr !important; }
            .fp-phone { display:none !important; }
            .offer-sheet { grid-template-columns:1fr !important; }
          }
        `}</style>
      </section>

      <TallyModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}