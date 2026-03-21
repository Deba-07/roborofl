"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

// ── Data ──────────────────────────────────────────────────────────────────────
const CHANNELS = [
  { id: "CH-01", label: "BRANDS",     color: "#facc15", copy: "500+ VERIFIED PAGES", sub: "Instant brand amplification" },
  { id: "CH-02", label: "MEME PAGES", color: "#ec5b13", copy: "FAIR DEALS. ON TIME.", sub: "Consistent creator income"   },
  { id: "CH-03", label: "BOLLYWOOD",  color: "#a78bfa", copy: "SEEDING IN 48HRS",     sub: "Film & OTT launch network"   },
  { id: "CH-04", label: "POLITICS",   color: "#4ade80", copy: "YOUTH REACH. FAST.",   sub: "Topical narrative seeding"   },
];

const TICKER_WORDS = [
  "LIVE NOW", "·", "500+ MEME PAGES", "·", "INDIA-WIDE", "·",
  "48HR CAMPAIGNS", "·", "VERIFIED NETWORK", "·", "ZERO BOTS", "·",
  "Q2 2026 LAUNCH", "·",
];

const STATS = [
  { val: "500+",  label: "Verified Pages"    },
  { val: "25M+",  label: "Combined Reach"    },
  { val: "48hr",  label: "Go-Live Time"      },
  { val: "12",    label: "Categories"        },
];

// ── Signal indicator ──────────────────────────────────────────────────────────
function SignalBars() {
  return (
    <div style={{ display: "flex", gap: "2px", alignItems: "flex-end", height: "14px" }}>
      {[4, 6, 9, 12, 14].map((h, i) => (
        <motion.div key={i}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.12 }}
          style={{ width: "3px", height: `${h}px`, background: "#4ade80", borderRadius: "1px" }}
        />
      ))}
    </div>
  );
}

// ── CRT scanline layer ────────────────────────────────────────────────────────
function Scanlines() {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
      backgroundSize: "100% 4px",
    }} />
  );
}

// ── Channel card ──────────────────────────────────────────────────────────────
function ChannelCard({ ch, active }: { ch: typeof CHANNELS[0]; active: boolean }) {
  return (
    <motion.div
      animate={{
        opacity:     active ? 1 : 0.28,
        scale:       active ? 1 : 0.94,
        borderColor: active ? ch.color + "60" : "rgba(255,255,255,0.06)",
        background:  active ? `${ch.color}0c` : "rgba(255,255,255,0.02)",
      }}
      transition={{ duration: 0.4 }}
      style={{
        borderRadius: "12px",
        border: "1px solid",
        padding: "14px 16px",
        cursor: "default",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* scanline glitch on active */}
      {active && (
        <motion.div
          animate={{ y: ["-100%", "200%"] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear", repeatDelay: 1.8 }}
          style={{
            position: "absolute", left: 0, right: 0, height: "2px",
            background: `linear-gradient(90deg, transparent, ${ch.color}60, transparent)`,
            pointerEvents: "none",
          }}
        />
      )}
      <div style={{ fontFamily: "monospace", fontSize: "8px", color: active ? ch.color : "rgba(255,255,255,0.2)", letterSpacing: "0.2em", marginBottom: "6px" }}>
        {ch.id} · {ch.label}
      </div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(13px, 1.4vw, 16px)", color: active ? "white" : "rgba(255,255,255,0.35)", letterSpacing: "0.06em", lineHeight: 1, marginBottom: "4px" }}>
        {ch.copy}
      </div>
      <div style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "10px", color: active ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)", lineHeight: 1.4 }}>
        {ch.sub}
      </div>
    </motion.div>
  );
}

// ── Magnetic cursor orb ───────────────────────────────────────────────────────
function CursorOrb() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });

  useEffect(() => {
    const move = (e: MouseEvent) => { mx.set(e.clientX - 150); my.set(e.clientY - 150); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mx, my]);

  return (
    <motion.div
      style={{ x: sx, y: sy, position: "fixed", top: 0, left: 0, width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(250,204,21,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }}
    />
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HeroV2() {
  const [activeCh, setActiveCh] = useState(0);
  const [glitching, setGlitching] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // cycle channels with glitch transition
  useEffect(() => {
    const id = setInterval(() => {
      setGlitching(true);
      setTimeout(() => {
        setActiveCh(p => (p + 1) % CHANNELS.length);
        setGlitching(false);
      }, 180);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const ch = CHANNELS[activeCh];

  return (
    <section id="hero" style={{ minHeight: "100dvh", position: "relative", background: "#080604", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <Scanlines />
      <CursorOrb />

      {/* dot grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
        backgroundSize: "32px 32px", zIndex: 0,
      }} />

      {/* ambient glow that follows active channel */}
      <motion.div
        animate={{ background: `radial-gradient(ellipse at 50% 40%, ${ch.color}10 0%, transparent 60%)` }}
        transition={{ duration: 0.5 }}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
      />

      {/* ── TOP TICKER ── */}
      <div style={{
        position: "relative", zIndex: 10,
        paddingTop: "84px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(8px)",
        overflow: "hidden",
      }}>
        <style>{`
          @keyframes htick { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
          .htick-track { display:flex; width:max-content; animation:htick 22s linear infinite; }
        `}</style>
        <div className="htick-track">
          {[...Array(2)].flatMap((_, j) => TICKER_WORDS.map((w, i) => (
            <span key={`${j}-${i}`} style={{
              fontFamily: "monospace", fontSize: "10px", fontWeight: 700,
              color: w === "·" ? ch.color : "rgba(255,255,255,0.35)",
              letterSpacing: "0.16em", padding: "8px 16px",
              whiteSpace: "nowrap", flexShrink: 0,
            }}>{w}</span>
          )))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, position: "relative", zIndex: 5, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 24px 0", maxWidth: "1280px", margin: "0 auto", width: "100%" }}>

        {/* broadcast badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 14px", borderRadius: "9999px", background: "rgba(255,0,0,0.12)", border: "1px solid rgba(255,0,0,0.3)" }}>
            <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
              style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ff3333", boxShadow: "0 0 8px #ff3333" }} />
            <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, color: "#ff6666", letterSpacing: "0.18em" }}>ON AIR</span>
          </div>
          <SignalBars />
          <span style={{ fontFamily: "monospace", fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
            ROBOROFL BROADCAST NETWORK · {mounted ? new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
          </span>
        </motion.div>

        {/* two-col main layout */}
        <div className="hv2-grid" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "48px", alignItems: "center" }}>

          {/* LEFT — headline */}
          <div>
            <div style={{ marginBottom: "16px" }}>
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(52px, 9vw, 124px)", lineHeight: 0.88, letterSpacing: "0.01em", userSelect: "none" }}>
                  <span style={{ color: "rgba(255,255,255,0.9)", display: "block" }}>INDIA'S</span>

                  {/* glitchable word */}
                  <span style={{ position: "relative", display: "block" }}>
                    <motion.span
                      animate={{ opacity: glitching ? 0 : 1 }}
                      transition={{ duration: 0.05 }}
                      style={{ color: "#facc15", textShadow: "0 0 60px rgba(250,204,21,0.35)", display: "block" }}
                    >MEME</motion.span>
                    {glitching && (
                      <>
                        <span style={{ position: "absolute", inset: 0, color: "#ff3030", clipPath: "inset(30% 0 40% 0)", transform: "translateX(-6px)", display: "block" }}>MEME</span>
                        <span style={{ position: "absolute", inset: 0, color: "#00e5ff", clipPath: "inset(60% 0 10% 0)", transform: "translateX(6px)", display: "block" }}>MEME</span>
                      </>
                    )}
                  </span>

                  <span style={{ color: "rgba(255,255,255,0.9)", display: "block" }}>AMPLIFICATION</span>
                  <span style={{ color: "#ec5b13", display: "block", textShadow: "0 0 60px rgba(236,91,19,0.3)" }}>NETWORK</span>
                </div>
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "clamp(14px, 1.2vw, 17px)", color: "rgba(255,255,255,0.38)", maxWidth: "520px", lineHeight: 1.65, marginBottom: "32px" }}
            >
              Connecting brands, agencies & creators with 500+ verified meme pages.{" "}
              <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>Curated, verified, live in 48 hours.</span>
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.48 }}
              style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
            >
              {[
                { label: "I Need Amplification",  href: "#for-brands", solid: true  },
                { label: "I Run a Meme Page",     href: "#for-pages",  solid: false },
              ].map(({ label, href, solid }) => (
                <motion.a key={href} href={href}
                  whileHover={{ scale: 1.04, boxShadow: solid ? "0 0 48px rgba(250,204,21,0.45)" : "0 0 24px rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    padding: "14px 32px", borderRadius: "12px",
                    fontFamily: "'Public Sans', sans-serif", fontSize: "14px", fontWeight: 900,
                    textDecoration: "none", letterSpacing: "0.04em",
                    background: solid ? "#facc15" : "rgba(255,255,255,0)",
                    color: solid ? "#080604" : "white",
                    border: solid ? "none" : "1px solid rgba(255,255,255,0.18)",
                    boxShadow: solid ? "0 0 32px rgba(250,204,21,0.25)" : "0 0 0 rgba(0,0,0,0)",
                  }}
                >{label}</motion.a>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — channel cards */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="hv2-channels"
            style={{ display: "flex", flexDirection: "column", gap: "10px", width: "240px" }}
          >
            <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.22)", letterSpacing: "0.16em", marginBottom: "4px" }}>// ACTIVE CHANNELS</div>
            {CHANNELS.map((c, i) => <ChannelCard key={c.id} ch={c} active={i === activeCh} />)}
          </motion.div>
        </div>

        {/* stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1px", background: "rgba(255,255,255,0.06)",
            borderRadius: "14px", overflow: "hidden",
            marginTop: "40px",
          }}
          className="hv2-stats"
        >
          {STATS.map((s, i) => (
            <div key={s.label} style={{ padding: "18px 20px", background: "#080604", textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(24px, 3vw, 36px)", color: i % 2 === 0 ? "#facc15" : "#ec5b13", lineHeight: 1, letterSpacing: "0.02em" }}>{s.val}</div>
              <div style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* bottom marquee */}
      <div style={{ position: "relative", zIndex: 10, marginTop: "40px", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 0", background: "rgba(0,0,0,0.3)" }}>
        <style>{`
          @keyframes hbmq { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
          .hbmq-track { display:flex; width:max-content; animation:hbmq 36s linear infinite; }
        `}</style>
        <div className="hbmq-track">
          {[...Array(2)].flatMap((_, j) => TICKER_WORDS.map((w, i) => (
            <span key={`${j}-${i}`} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(14px, 1.4vw, 18px)", letterSpacing: "0.16em", color: w === "·" ? "#facc15" : "rgba(255,255,255,0.12)", padding: "0 20px", whiteSpace: "nowrap" }}>{w}</span>
          )))}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .hv2-grid { grid-template-columns: 1fr !important; }
          .hv2-channels { display: none !important; }
          .hv2-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}