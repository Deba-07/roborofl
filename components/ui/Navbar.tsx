"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const NAV_LINKS = [
  { label: "For Meme Pages",      href: "#for-pages"  },
  { label: "For Brands & Agencies", href: "#for-brands" },
];

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0,
        zIndex: 50,
        padding: "14px 20px",
      }}
    >
      {/* ── Glass pill ── */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "10px 20px",
          borderRadius: "9999px",
          border: "1px solid rgba(255,255,255,0.12)",
          background: scrolled
            ? "rgba(20, 10, 5, 0.88)"
            : "rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: scrolled
            ? "0 8px 32px rgba(0,0,0,0.45)"
            : "0 2px 16px rgba(0,0,0,0.2)",
          transition: "background 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        {/* LEFT — logo */}
        <motion.a
          href="/"
          aria-label="Roborofl home"
          style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {/* Icon box */}
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "#ec5b13",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(236,91,19,0.35)",
            flexShrink: 0,
          }}>
            <RocketIcon />
          </div>
          {/* Wordmark */}
          <span style={{
            fontFamily: "'Public Sans', sans-serif",
            fontWeight: 900, fontSize: "18px",
            letterSpacing: "-0.04em", textTransform: "uppercase",
            color: "white",
          }}>
            ROBOROFL
          </span>
        </motion.a>

        {/* RIGHT — nav links (desktop) / hamburger (mobile) */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>

          {/* Desktop links */}
          <div className="hidden md:flex" style={{ gap: "32px", alignItems: "center" }}>
            {NAV_LINKS.map(link => (
              <NavLink key={link.href} href={link.href}>{link.label}</NavLink>
            ))}
          </div>

          {/* Hamburger — mobile only, no inline display to avoid overriding md:hidden */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", flexDirection: "column", gap: "5px", alignItems: "center" }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: "block", height: "1.5px", borderRadius: "2px",
                background: "rgba(255,255,255,0.7)",
                width: i === 1 ? "16px" : "20px",
                transformOrigin: "center",
                transition: "all 0.25s ease",
                transform: mobileOpen
                  ? i === 0 ? "rotate(45deg) translate(4.5px, 4.5px)"
                  : i === 2 ? "rotate(-45deg) translate(4.5px, -4.5px)"
                  : "scaleX(0)"
                  : "none",
                opacity: mobileOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* ── Mobile dropdown ── */}
      <motion.div
        initial={false}
        animate={mobileOpen ? { opacity: 1, y: 0, pointerEvents: "auto" as const } : { opacity: 0, y: -8, pointerEvents: "none" as const }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="md:hidden"
        style={{ marginTop: "8px", maxWidth: "1280px", margin: "8px auto 0" }}
      >
        <div style={{
          background: "rgba(20,10,5,0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: "16px",
          overflow: "hidden",
        }}>
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 20px",
                fontFamily: "'Public Sans', sans-serif",
                fontSize: "14px", fontWeight: 600,
                color: "rgba(255,255,255,0.65)",
                textDecoration: "none",
                borderBottom: i < NAV_LINKS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                transition: "color 0.2s, background 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "white"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {link.label}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 3l4 4-4 4"/>
              </svg>
            </a>
          ))}
        </div>
      </motion.div>
    </motion.header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        fontFamily: "'Public Sans', sans-serif",
        fontSize: "14px", fontWeight: 600,
        color: hovered ? "white" : "rgba(255,255,255,0.55)",
        textDecoration: "none",
        transition: "color 0.2s ease",
        paddingBottom: "2px",
      }}
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
      {/* Orange underline */}
      <motion.span
        style={{
          position: "absolute", bottom: 0, left: 0,
          height: "1px", background: "#ec5b13", borderRadius: "1px",
        }}
        initial={{ width: "0%" }}
        animate={{ width: hovered ? "100%" : "0%" }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      />
    </motion.a>
  );
}

function RocketIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  );
}