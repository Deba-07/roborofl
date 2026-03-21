"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

// ── Data ───────────────────────────────────────────────────────────────────────
const STATS = [
  {
    value:    50,
    suffix:   "+",
    label:    "Meme Pages\nOnboarded",
    sublabel: "Manually reviewed & verified",
    color:    "#ec5b13",
  },
  {
    value:    25,
    suffix:   "M+",
    label:    "Combined\nFollowers",
    sublabel: "Real reach. No inflated metrics.",
    color:    "#facc15",
  },
  {
    value:    12,
    suffix:   "",
    label:    "Campaign\nCategories",
    sublabel: "From Finance to Bollywood",
    color:    "#ec5b13",
  },
  {
    value:    48,
    suffix:   " hrs",
    label:    "Activation\nTime",
    sublabel: "Brief today. Live tomorrow.",
    color:    "#facc15",
  },
];

// ── Animated counter hook ──────────────────────────────────────────────────────
function useCounter(target: number, started: boolean, duration = 1800) {
  const [count, setCount] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!started || doneRef.current) return;
    doneRef.current = true;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return count;
}

// ── Single stat card ───────────────────────────────────────────────────────────
function StatCard({
  value,
  suffix,
  label,
  sublabel,
  color,
  index,
  started,
}: (typeof STATS)[0] & { index: number; started: boolean }) {
  const count   = useCounter(value, started, 1600 + index * 120);
  const isLast  = index === STATS.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        flex: 1,
        minWidth: 0,
        padding: "40px 32px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        // right border divider on all but last
        borderRight: isLast ? "none" : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Accent top line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          top: 0, left: "32px", right: "32px",
          height: "2px",
          background: `linear-gradient(90deg, ${color}, transparent)`,
          transformOrigin: "left",
          borderRadius: "1px",
        }}
      />

      {/* Big number */}
      <div
        style={{
          fontFamily: "'Bebas Neue', 'Anton', sans-serif",
          fontSize: "clamp(52px, 6vw, 96px)",
          lineHeight: 1,
          letterSpacing: "-0.01em",
          color: "white",
          display: "flex",
          alignItems: "baseline",
          gap: "2px",
        }}
      >
        <span>{count}</span>
        <span style={{ color, fontSize: "0.7em" }}>{suffix}</span>
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: "'Public Sans', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(13px, 1.2vw, 16px)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "rgba(255,255,255,0.85)",
          whiteSpace: "pre-line",
          lineHeight: 1.3,
        }}
      >
        {label}
      </div>

      {/* Sublabel */}
      <div
        style={{
          fontFamily: "'Public Sans', sans-serif",
          fontSize: "clamp(11px, 1vw, 13px)",
          fontWeight: 400,
          color: "rgba(255,255,255,0.30)",
          lineHeight: 1.4,
        }}
      >
        {sublabel}
      </div>

      {/* Hover glow */}
      <motion.div
        className="stat-hover-glow"
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 30% 50%, ${color}0a 0%, transparent 70%)`,
          opacity: 0,
          pointerEvents: "none",
          transition: "opacity 0.3s ease",
          borderRadius: "inherit",
        }}
      />
    </motion.div>
  );
}

// ── Section ────────────────────────────────────────────────────────────────────
export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView   = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      id="stats"
      ref={sectionRef}
      style={{
        position: "relative",
        background: "#0f0805",
        overflow: "hidden",
      }}
    >
      {/* subtle grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      {/* top edge glow */}
      <div
        style={{
          position: "absolute",
          top: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(236,91,19,0.4), rgba(250,204,21,0.4), transparent)",
        }}
      />

      {/* bottom edge glow */}
      <div
        style={{
          position: "absolute",
          bottom: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
        }}
      />

      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          textAlign: "center",
          paddingTop: "56px",
          paddingBottom: "8px",
        }}
      >
        <span
          style={{
            fontFamily: "'Public Sans', sans-serif",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            color: "rgba(236,91,19,0.7)",
          }}
        >
          The Network in Numbers
        </span>
      </motion.div>

      {/* Stats row */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px 0 24px",
        }}
      >
        {/* Desktop: horizontal row */}
        <div
          className="stats-row"
          style={{
            display: "flex",
            flexDirection: "row",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            marginTop: "24px",
            marginBottom: "56px",
          }}
        >
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} {...stat} index={i} started={isInView} />
          ))}
        </div>
      </div>

      {/* Mobile responsive override */}
      <style>{`
        @media (max-width: 640px) {
          .stats-row {
            flex-direction: column !important;
          }
          .stats-row > div {
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            padding: 28px 20px !important;
          }
          .stats-row > div:last-child {
            border-bottom: none !important;
          }
        }
        @media (min-width: 641px) and (max-width: 900px) {
          .stats-row {
            flex-wrap: wrap !important;
          }
          .stats-row > div {
            flex: 1 1 50% !important;
            min-width: 50% !important;
          }
          .stats-row > div:nth-child(2) {
            border-right: none !important;
          }
          .stats-row > div:nth-child(3),
          .stats-row > div:nth-child(4) {
            border-top: 1px solid rgba(255,255,255,0.06);
          }
          .stats-row > div:nth-child(4) {
            border-right: none !important;
          }
        }
        .stat-card-wrap:hover .stat-hover-glow {
          opacity: 1 !important;
        }
      `}</style>
    </section>
  );
}