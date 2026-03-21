"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

// ── Social icon paths ─────────────────────────────────────────────────────────
const SOCIALS = [
  {
    label: "Instagram",
    href: "https://instagram.com/roborofl",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/roborofl",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "https://x.com/roborofl",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
];

// ── Neon flicker hook ─────────────────────────────────────────────────────────
function useFlicker(trigger: boolean) {
  const [opacity, setOpacity] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    // flicker sequence: off → flash → off → flash → stable
    const seq = [0, 0.4, 0, 0.7, 0.1, 1, 0.8, 1];
    let i = 0;
    const run = () => {
      setOpacity(seq[i]);
      i++;
      if (i < seq.length) setTimeout(run, 80 + Math.random() * 60);
    };
    setTimeout(run, 200);
  }, [trigger]);
  return opacity;
}

// ── Marquee ───────────────────────────────────────────────────────────────────
const MARQUEE_WORDS = [
  "MEME AMPLIFICATION", "·", "INDIA-WIDE REACH", "·",
  "WORLDWIDE NETWORK", "·", "500+ PAGES", "·",
  "48HR CAMPAIGNS", "·", "NO BOTS", "·",
];

function FooterMarquee() {
  const doubled = [...MARQUEE_WORDS, ...MARQUEE_WORDS];
  return (
    <div style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "12px 0" }}>
      <style>{`
        @keyframes fmq { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .fmq-track { display:flex; gap:0; width:max-content; animation:fmq 32s linear infinite; }
      `}</style>
      <div className="fmq-track">
        {doubled.map((w, i) => (
          <span key={i} style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "12px", letterSpacing: "0.18em",
            color: w === "·" ? "#facc15" : "rgba(255,255,255,0.18)",
            padding: "0 18px", whiteSpace: "nowrap",
          }}>{w}</span>
        ))}
      </div>
    </div>
  );
}

// ── Main Footer ───────────────────────────────────────────────────────────────
export default function Footer() {
  const ref    = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const wordmarkOpacity = useFlicker(inView);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["6%", "0%"]);

  return (
    <footer
      ref={ref}
      style={{
        position: "relative",
        background: "#080602",
        overflow: "hidden",
      }}
    >
      {/* dot grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        opacity: 0.5,
      }} />

      {/* top gradient fade from last section */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "120px",
        background: "linear-gradient(to bottom, rgba(20,9,8,0.8), transparent)",
        pointerEvents: "none",
      }} />

      {/* scanline sweep */}
      <motion.div
        animate={{ y: ["-100%", "200%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
        style={{
          position: "absolute", left: 0, right: 0, height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(250,204,21,0.2), transparent)",
          pointerEvents: "none",
        }}
      />

      {/* ── Top CTA strip ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "72px 32px 56px" }}>
        <div className="footer-cta-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1px 1fr",
          gap: "0",
          alignItems: "center",
        }}>
          {/* LEFT — For Pages */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ padding: "0 40px 0 0", textAlign: "left" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <motion.span animate={{ rotate: [0, 14, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: "22px" }}>💸</motion.span>
              <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, color: "rgba(250,204,21,0.6)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                For Meme Page Admins
              </span>
            </div>
            <h3 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(28px, 3.5vw, 44px)",
              letterSpacing: "0.02em", color: "white",
              lineHeight: 1, margin: "0 0 10px",
            }}>
              Turn your page into<br/>
              <span style={{ color: "#facc15" }}>consistent income</span>
            </h3>
            <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.35)", lineHeight: 1.6, margin: "0 0 20px" }}>
              Free to join. No exclusivity. WhatsApp-first. Worldwide.
            </p>
            <motion.a
              href="#for-pages"
              whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(250,204,21,0.45)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "12px 28px", borderRadius: "10px",
                background: "#facc15", color: "#080602",
                fontFamily: "'Public Sans', sans-serif",
                fontSize: "13px", fontWeight: 900,
                textDecoration: "none", letterSpacing: "0.04em",
                boxShadow: "0 0 24px rgba(250,204,21,0.25)",
              }}
            >
              Join the Network →
            </motion.a>
          </motion.div>

          {/* DIVIDER */}
          <div style={{ width: "1px", alignSelf: "stretch", background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.1) 70%, transparent)" }} />

          {/* RIGHT — For Brands */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{ padding: "0 0 0 40px", textAlign: "left" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.4, repeat: Infinity }} style={{ fontSize: "22px" }}>⚡</motion.span>
              <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, color: "rgba(236,91,19,0.7)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                For Brands & Agencies
              </span>
            </div>
            <h3 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(28px, 3.5vw, 44px)",
              letterSpacing: "0.02em", color: "white",
              lineHeight: 1, margin: "0 0 10px",
            }}>
              Brief to live in<br/>
              <span style={{ color: "#ec5b13" }}>48 hours flat</span>
            </h3>
            <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.35)", lineHeight: 1.6, margin: "0 0 20px" }}>
              500+ verified pages. Full management. One invoice.
            </p>
            <motion.a
              href="#for-brands"
              whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(236,91,19,0.4)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "12px 28px", borderRadius: "10px",
                background: "transparent", color: "white",
                fontFamily: "'Public Sans', sans-serif",
                fontSize: "13px", fontWeight: 700,
                textDecoration: "none", letterSpacing: "0.04em",
                border: "1px solid rgba(236,91,19,0.5)",
              }}
            >
              Submit a Brief →
            </motion.a>
          </motion.div>
        </div>
      </div>

      {/* ── Marquee ── */}
      <FooterMarquee />

      {/* ── Giant wordmark ── */}
      <div style={{
        position: "relative",
        padding: "40px 0 0",
        overflow: "hidden",
        textAlign: "center",
      }}>
        {/* glow behind wordmark */}
        <div style={{
          position: "absolute",
          bottom: "10%", left: "50%", transform: "translateX(-50%)",
          width: "70%", height: "40%",
          background: "radial-gradient(ellipse, rgba(250,204,21,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <motion.div style={{ y: bgY }}>
          <motion.h1
            style={{ opacity: wordmarkOpacity }}
            transition={{ duration: 0.1 }}
            className="footer-wordmark"
          >
            ROBOROFL
          </motion.h1>
        </motion.div>
      </div>

      {/* ── Pre-launch note ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.5 }}
        style={{ textAlign: "center", padding: "0 24px 32px" }}
      >
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "8px 18px", borderRadius: "9999px",
          background: "rgba(250,204,21,0.07)",
          border: "1px solid rgba(250,204,21,0.18)",
        }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#facc15", boxShadow: "0 0 8px #facc15" }}
          />
          <span style={{
            fontFamily: "'Public Sans', sans-serif",
            fontSize: "12px", color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.04em",
          }}>
            Roborofl is currently onboarding its founding network of meme pages.{" "}
            <span style={{ color: "#facc15", fontWeight: 600 }}>Launch campaigns open Q2 2026.</span>
          </span>
        </div>
      </motion.div>

      {/* ── Bottom utility bar ── */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 32px",
        maxWidth: "1200px", margin: "0 auto",
      }}>
        <div className="footer-bottom" style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap", gap: "16px",
        }}>
          {/* left — tagline + copyright */}
          <div>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "14px", letterSpacing: "0.12em",
              color: "#facc15", marginBottom: "3px",
            }}>
              India&apos;s Meme Amplification Network
            </div>
            <div style={{
              fontFamily: "'Public Sans', sans-serif",
              fontSize: "11px", color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.04em",
            }}>
              © 2026 Roborofl. All rights reserved.
            </div>
          </div>

          {/* center — contact */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <motion.a
              href="mailto:hello@roborofl.com"
              whileHover={{ color: "#facc15" }}
              style={{
                fontFamily: "'Public Sans', sans-serif",
                fontSize: "12px", color: "rgba(255,255,255,0.35)",
                textDecoration: "none", letterSpacing: "0.04em",
                transition: "color 0.2s",
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              hello@roborofl.com
            </motion.a>

            <motion.a
              href="https://wa.me/919999999999"
              target="_blank" rel="noopener noreferrer"
              whileHover={{ color: "#4ade80" }}
              style={{
                fontFamily: "'Public Sans', sans-serif",
                fontSize: "12px", color: "rgba(255,255,255,0.35)",
                textDecoration: "none", letterSpacing: "0.04em",
                display: "flex", alignItems: "center", gap: "6px",
                transition: "color 0.2s",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Us
            </motion.a>
          </div>

          {/* right — social + legal */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* socials */}
            <div style={{ display: "flex", gap: "12px" }}>
              {SOCIALS.map(s => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, color: "#facc15", y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    display: "flex", alignItems: "center",
                    textDecoration: "none",
                  }}
                  title={s.label}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>

            {/* divider */}
            <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.1)" }} />

            {/* legal */}
            <div style={{ display: "flex", gap: "16px" }}>
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Use",   href: "/terms"   },
              ].map(l => (
                <motion.a
                  key={l.label}
                  href={l.href}
                  whileHover={{ color: "rgba(255,255,255,0.7)" }}
                  style={{
                    fontFamily: "'Public Sans', sans-serif",
                    fontSize: "11px", color: "rgba(255,255,255,0.22)",
                    textDecoration: "none", letterSpacing: "0.04em",
                    transition: "color 0.2s",
                  }}
                >
                  {l.label}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .footer-wordmark {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(80px, 16vw, 220px);
          letter-spacing: 0.06em;
          color: #facc15;
          line-height: 0.85;
          margin: 0;
          user-select: none;
          display: block;
          text-shadow: 0 0 120px rgba(250,204,21,0.25);
        }
        @media (max-width: 768px) {
          .footer-cta-grid { grid-template-columns: 1fr !important; }
          .footer-cta-grid > div:nth-child(2) { display: none; }
          .footer-cta-grid > div { padding: 0 0 32px 0 !important; }
          .footer-bottom { flex-direction: column; align-items: flex-start !important; gap: 20px !important; }
          .footer-wordmark { font-size: clamp(60px, 18vw, 120px) !important; }
        }
        @media (max-width: 480px) {
          .footer-wordmark { font-size: clamp(48px, 20vw, 80px) !important; }
        }
      `}</style>
    </footer>
  );
}