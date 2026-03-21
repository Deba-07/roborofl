"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion, useInView, AnimatePresence,
  useMotionValue, useSpring, useTransform, useScroll,
} from "framer-motion";

// ── Data ───────────────────────────────────────────────────────────────────────
const TIMELINE = [
  {
    step: "01",
    title: "Submit Your Brief",
    body: "Objective, audience, budget, timeline. 5 minutes. No agency decks.",
    duration: "5 min",
    color: "#facc15",
    icon: "📋",
  },
  {
    step: "02",
    title: "We Curate & Match",
    body: "Algorithm + human selection picks the exact right pages from our verified network.",
    duration: "2–4 hrs",
    color: "#ec5b13",
    icon: "🎯",
  },
  {
    step: "03",
    title: "Pages Get Briefed",
    body: "We brief every page admin with your exact requirements. Content reviewed before publishing.",
    duration: "12 hrs",
    color: "#a78bfa",
    icon: "📡",
  },
  {
    step: "04",
    title: "Campaign Goes Live",
    body: "Content published simultaneously across all activated pages. You watch the reach counter climb.",
    duration: "48 hrs",
    color: "#4ade80",
    icon: "🔥",
  },
  {
    step: "05",
    title: "Report Delivered",
    body: "Reach, engagement, clicks, cost-per-impression. Full transparency. One invoice.",
    duration: "+48 hrs",
    color: "#38bdf8",
    icon: "📊",
  },
];

const TRUST_STATS = [
  { value: "500+",  label: "Verified Pages",    color: "#facc15" },
  { value: "48hrs", label: "Avg. Go-Live",      color: "#ec5b13" },
  { value: "25M+",  label: "Combined Reach",    color: "#4ade80" },
  { value: "0",     label: "Bots or Fakes",     color: "#38bdf8" },
];

// ── Live campaign dashboard (left panel) ───────────────────────────────────────
function CampaignDashboard({ inView }: { inView: boolean }) {
  const [reach, setReach] = useState(0);
  const [livePages, setLivePages] = useState(0);
  const [barHeights] = useState(() => Array.from({ length: 12 }, () => 20 + Math.random() * 80));
  const [activeBars, setActiveBars] = useState<boolean[]>(Array(12).fill(false));

  useEffect(() => {
    if (!inView) return;
    // animate reach counter
    let r = 0;
    const target = 2400000;
    const rId = setInterval(() => {
      r += target / 80;
      if (r >= target) { setReach(target); clearInterval(rId); }
      else setReach(Math.floor(r));
    }, 30);
    // animate live pages
    let p = 0;
    const pId = setInterval(() => {
      p++;
      setLivePages(p);
      if (p >= 24) clearInterval(pId);
    }, 120);
    // light up bars one by one
    barHeights.forEach((_, i) => {
      setTimeout(() => setActiveBars(prev => { const n = [...prev]; n[i] = true; return n; }), 400 + i * 80);
    });
    return () => { clearInterval(rId); clearInterval(pId); };
  }, [inView]);

  const fmtReach = (n: number) => n >= 1000000
    ? `${(n / 1000000).toFixed(1)}M`
    : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : `${n}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "relative",
        borderRadius: "20px",
        background: "rgba(0,0,0,0.6)",
        border: "1px solid rgba(236,91,19,0.2)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        overflow: "hidden",
        padding: "28px",
      }}
    >
      {/* scanline sweep */}
      <motion.div
        animate={{ y: ["-100%", "200%"] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
        style={{
          position: "absolute", left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, transparent, rgba(236,91,19,0.4), transparent)",
          pointerEvents: "none",
        }}
      />

      {/* top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <motion.div
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }}
          />
          <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#4ade80", letterSpacing: "0.1em", fontWeight: 700 }}>
            LIVE CAMPAIGN
          </span>
        </div>
        <span style={{ fontFamily: "monospace", fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>
          ROBOROFL · WARROOM
        </span>
      </div>

      {/* reach counter */}
      <div style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontFamily: "monospace", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", marginBottom: "6px", textTransform: "uppercase" }}>
          Total Reach
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px, 5vw, 56px)", color: "#facc15", lineHeight: 1, letterSpacing: "0.02em" }}>
          {fmtReach(reach)}
          <span style={{ fontSize: "0.4em", color: "rgba(250,204,21,0.5)", marginLeft: "4px" }}>IMPRESSIONS</span>
        </div>
      </div>

      {/* two metric boxes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Pages Live", value: livePages, suffix: "", color: "#ec5b13" },
          { label: "Engagement", value: "8.4", suffix: "%", color: "#4ade80" },
        ].map((m, i) => (
          <div key={i} style={{
            padding: "14px 16px", borderRadius: "10px",
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${m.color}25`,
          }}>
            <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.1em", marginBottom: "6px", textTransform: "uppercase" }}>
              {m.label}
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", color: m.color, lineHeight: 1 }}>
              {m.value}{m.suffix}
            </div>
          </div>
        ))}
      </div>

      {/* animated bar chart */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", marginBottom: "10px", textTransform: "uppercase" }}>
          Hourly Reach Distribution
        </div>
        <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", height: "64px" }}>
          {barHeights.map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={activeBars[i] ? { height: `${h}%` } : {}}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                flex: 1, borderRadius: "2px 2px 0 0",
                background: i % 3 === 0 ? "rgba(236,91,19,0.7)" : i % 3 === 1 ? "rgba(250,204,21,0.5)" : "rgba(255,255,255,0.15)",
                minHeight: "3px",
              }}
            />
          ))}
        </div>
      </div>

      {/* page activation dots */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px" }}>
        <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", marginBottom: "10px", textTransform: "uppercase" }}>
          Page Activation Map
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {Array.from({ length: 32 }, (_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: i < livePages ? 1 : 0.15 } : {}}
              transition={{ duration: 0.3, delay: 1.2 + i * 0.06 }}
              style={{
                width: "10px", height: "10px", borderRadius: "2px",
                background: i < livePages
                  ? i % 4 === 0 ? "#ec5b13" : i % 4 === 1 ? "#facc15" : i % 4 === 2 ? "#4ade80" : "#38bdf8"
                  : "rgba(255,255,255,0.08)",
                boxShadow: i < livePages ? `0 0 6px currentColor` : "none",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Animated timeline ──────────────────────────────────────────────────────────
function Timeline({ inView }: { inView: boolean }) {
  return (
    <div style={{ position: "relative", paddingLeft: "28px" }}>
      {/* vertical line */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={inView ? { scaleY: 1 } : {}}
        transition={{ duration: 1.4, delay: 0.3, ease: "easeInOut" }}
        style={{
          position: "absolute", left: "9px", top: "12px", bottom: "12px",
          width: "1px",
          background: "linear-gradient(to bottom, #facc15, #ec5b13, #a78bfa, #4ade80, #38bdf8)",
          transformOrigin: "top",
        }}
      />

      {TIMELINE.map((item, i) => (
        <motion.div
          key={item.step}
          initial={{ opacity: 0, x: 20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.4 + i * 0.12, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          style={{ display: "flex", gap: "18px", alignItems: "flex-start", marginBottom: i < TIMELINE.length - 1 ? "28px" : 0, position: "relative" }}
        >
          {/* node dot */}
          <motion.div
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.12, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
            style={{
              position: "absolute", left: "-28px", top: "4px",
              width: "20px", height: "20px", borderRadius: "50%",
              background: `${item.color}20`,
              border: `1.5px solid ${item.color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", flexShrink: 0,
              boxShadow: `0 0 14px ${item.color}40`,
              zIndex: 1,
            }}
          >
            <span>{item.icon}</span>
          </motion.div>

          {/* content */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
              <span style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(16px, 1.5vw, 20px)",
                letterSpacing: "0.04em", color: "white", lineHeight: 1,
              }}>
                {item.title}
              </span>
              <span style={{
                fontFamily: "monospace", fontSize: "9px", fontWeight: 700,
                color: item.color, letterSpacing: "0.12em",
                padding: "2px 8px", borderRadius: "9999px",
                background: `${item.color}15`,
                border: `1px solid ${item.color}30`,
              }}>
                {item.duration}
              </span>
            </div>
            <p style={{
              fontFamily: "'Public Sans', sans-serif",
              fontSize: "clamp(12px, 0.95vw, 13px)",
              color: "rgba(255,255,255,0.38)",
              lineHeight: 1.6, margin: 0,
            }}>
              {item.body}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Launch CTA ─────────────────────────────────────────────────────────────────
function LaunchCTA({ onClick }: { onClick: () => void }) {
  const [hovered,   setHovered]   = useState(false);
  const [clicked,   setClicked]   = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [launching, setLaunching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Click: run countdown 3→2→1→0, then open modal & reset
  const handleClick = () => {
    if (clicked) return; // ignore double-click during countdown
    setClicked(true);
    setCountdown(3);
    setLaunching(false);
    let c = 3;
    timerRef.current = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(timerRef.current!);
        setLaunching(true);
        // slight pause so user sees "LAUNCHING" then open modal
        setTimeout(() => {
          onClick();
          // reset button state after modal opens
          setTimeout(() => {
            setClicked(false);
            setLaunching(false);
            setCountdown(3);
          }, 400);
        }, 380);
      }
    }, 320);
  };

  // Cleanup on unmount
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const isActive = clicked || launching;

  return (
    <motion.button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      whileTap={{ scale: 0.98 }}
      style={{
        width: "100%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "22px 32px",
        borderRadius: "16px",
        background: isActive ? "#facc15" : hovered ? "rgba(250,204,21,0.06)" : "transparent",
        border: `1.5px solid ${isActive ? "#facc15" : hovered ? "rgba(250,204,21,0.6)" : "rgba(250,204,21,0.35)"}`,
        cursor: clicked ? "default" : "pointer",
        transition: "background 0.25s, border-color 0.25s",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* sweep on click */}
      {isActive && (
        <motion.div
          initial={{ x: "-110%" }}
          animate={{ x: "110%" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* countdown progress bar */}
      {clicked && !launching && (
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.96, ease: "linear" }}
          style={{
            position: "absolute",
            bottom: 0, left: 0, height: "2px",
            background: "rgba(20,9,8,0.3)",
            pointerEvents: "none",
          }}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" }}>
        <span style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(20px, 2.2vw, 28px)",
          letterSpacing: "0.06em",
          color: isActive ? "#140908" : "white",
          lineHeight: 1,
          transition: "color 0.2s",
        }}>
          {launching ? "🚀 LAUNCHING CAMPAIGN..." : "SUBMIT A CAMPAIGN BRIEF"}
        </span>
        <span style={{
          fontFamily: "'Public Sans', sans-serif",
          fontSize: "12px",
          color: isActive ? "rgba(20,9,8,0.55)" : hovered ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)",
          transition: "color 0.2s",
          letterSpacing: "0.02em",
        }}>
          {clicked && !launching
            ? `Opening in ${countdown}...`
            : hovered
            ? "Click to submit your brief →"
            : "We respond within 24 hours"}
        </span>
      </div>

      <motion.div
        animate={{
          rotate:  launching ? 45 : 0,
          scale:   hovered ? 1.15 : 1,
        }}
        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          color: isActive ? "#140908" : "#facc15",
          transition: "color 0.2s",
          flexShrink: 0,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 14h18M14 5l9 9-9 9"/>
        </svg>
      </motion.div>
    </motion.button>
  );
}

// ── Tally Form Modal ───────────────────────────────────────────────────────────
function BrandFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
          />
          <motion.div
            key="panel"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%",   opacity: 1 }}
            exit={{ y: "100%",  opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 101,
              background: "#0a0604",
              borderTop: "1px solid rgba(236,91,19,0.35)",
              borderRadius: "24px 24px 0 0",
              height: "92vh", display: "flex", flexDirection: "column", overflow: "hidden",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "22px 32px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: "rgba(236,91,19,0.12)",
                  border: "1px solid rgba(236,91,19,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px",
                }}>⚡</div>
                <div>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", letterSpacing: "0.06em", color: "white", margin: 0, lineHeight: 1 }}>
                    Tell Us About Your Campaign
                  </p>
                  <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: "4px 0 0", lineHeight: 1 }}>
                    We&apos;ll respond with a recommendation & rate card within 24 hours
                  </p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, background: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: "38px", height: "38px", borderRadius: "50%",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: "16px",
                }}
              >✕</motion.button>
            </div>
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center",
                justifyContent: "center", flexDirection: "column", gap: "16px",
                background: "#0a0604", zIndex: 0,
              }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  style={{ width: "36px", height: "36px", borderRadius: "50%", border: "2px solid rgba(236,91,19,0.15)", borderTopColor: "#ec5b13" }}
                />
                <span style={{ fontFamily: "monospace", fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
                  LOADING CAMPAIGN BRIEF FORM...
                </span>
              </div>
              {/* Replace YOUR_BRAND_FORM_ID with actual Tally form ID */}
              <iframe
                src="https://tally.so/embed/YOUR_BRAND_FORM_ID?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
                width="100%" height="100%"
                frameBorder={0} marginHeight={0} marginWidth={0}
                title="Campaign Brief Form"
                style={{ position: "relative", zIndex: 1, background: "transparent", border: "none" }}
                onLoad={e => { const l = (e.currentTarget.previousElementSibling as HTMLElement); if (l) l.style.display = "none"; }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Main Section ───────────────────────────────────────────────────────────────
export default function ForBrandsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-20% 0px -20% 0px" });
  const [modalOpen, setModalOpen] = useState(false);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  return (
    <>
      <section
        id="for-brands"
        ref={sectionRef}
        style={{ position: "relative", background: "#0a0604", overflow: "hidden", paddingBottom: "100px" }}
      >
        {/* fine dot grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, rgba(236,91,19,0.18) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.35,
        }} />

        {/* top edge */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "70%", height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(236,91,19,0.5), rgba(250,204,21,0.3), transparent)",
        }} />

        {/* parallax watermark */}
        <motion.div style={{ y: bgY }} className="fb-watermark">BRANDS</motion.div>

        {/* ── Heading ── */}
        <div style={{ textAlign: "center", padding: "88px 24px 64px", maxWidth: "1200px", margin: "0 auto" }}>
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
            For Brands & Agencies
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(44px, 7vw, 100px)",
              letterSpacing: "0.02em",
              lineHeight: 0.92,
              margin: "0 0 20px",
            }}
          >
            <span style={{ color: "white", display: "block" }}>Your Campaign Brief.</span>
            <span style={{ color: "#ec5b13", display: "block", textShadow: "0 0 80px rgba(236,91,19,0.4)" }}>Our Network.</span>
            <span style={{ color: "#facc15", display: "block", textShadow: "0 0 80px rgba(250,204,21,0.3)" }}>Live in 48 Hours.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
            style={{
              fontFamily: "'Public Sans', sans-serif",
              fontSize: "clamp(14px, 1.2vw, 17px)",
              color: "rgba(255,255,255,0.3)",
              maxWidth: "560px", marginInline: "auto", lineHeight: 1.65,
            }}
          >
            Stop sourcing pages manually. We manage the entire supply chain —{" "}
            <span style={{ color: "rgba(255,255,255,0.72)" }}>selection, briefing, approvals, publishing, and reporting.</span>
          </motion.p>
        </div>

        {/* ── Main two-column layout ── */}
        <div
          className="fb-split"
          style={{
            maxWidth: "1200px", margin: "0 auto",
            padding: "0 24px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
            alignItems: "start",
          }}
        >
          {/* LEFT — live dashboard */}
          <CampaignDashboard inView={inView} />

          {/* RIGHT — timeline + stats + CTA */}
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            >
              <p style={{
                fontFamily: "monospace", fontSize: "10px", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.25)", margin: "0 0 24px",
              }}>
                — Campaign Timeline
              </p>
              <Timeline inView={inView} />
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
              }}
            >
              {TRUST_STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.55 + i * 0.07, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
                  style={{
                    padding: "14px 12px", borderRadius: "10px",
                    background: "rgba(255,255,255,0.025)",
                    border: `1px solid ${s.color}20`,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", color: s.color, lineHeight: 1, marginBottom: "4px" }}>{s.value}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(255,255,255,0.22)", letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.3 }}>{s.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Launch CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <LaunchCTA onClick={() => setModalOpen(true)} />
            </motion.div>
          </div>
        </div>

        <style>{`
          .fb-watermark {
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Bebas Neue', sans-serif;
            font-size: clamp(120px, 24vw, 360px);
            color: rgba(236,91,19,0.025);
            letter-spacing: 0.06em;
            white-space: nowrap;
            pointer-events: none; user-select: none; line-height: 1;
          }
          @media (max-width: 900px) {
            .fb-split { grid-template-columns: 1fr !important; }
          }
          @media (max-width: 640px) {
            .fb-split { padding: 0 16px !important; }
          }
        `}</style>
      </section>

      <BrandFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}