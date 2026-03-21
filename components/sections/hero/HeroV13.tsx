"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// DATA — the cards rolling on the belt
// ─────────────────────────────────────────────────────────────────────────────
const CARD_DATA = [
  { top: "😂 HUMOR",       handle: "@delhimemes",      deal: "₹14,500", cat: "BRAND DEAL",   accent: "#facc15" },
  { top: "🏏 CRICKET",     handle: "@cricketmafia",    deal: "₹22,000", cat: "CAMPAIGN",     accent: "#ec5b13" },
  { top: "🎬 BOLLYWOOD",   handle: "@bollywoodfire",   deal: "₹18,000", cat: "SEEDING",      accent: "#a78bfa" },
  { top: "💸 FINANCE",     handle: "@moneyminds_in",   deal: "₹9,800",  cat: "AWARENESS",    accent: "#4ade80" },
  { top: "🤖 AI & TECH",   handle: "@startupbanter",   deal: "₹7,200",  cat: "LAUNCH",       accent: "#38bdf8" },
  { top: "🗳️ POLITICS",  handle: "@youthvotein",     deal: "₹31,000", cat: "NARRATIVE",    accent: "#f472b6" },
  { top: "🌍 GLOBAL",      handle: "@ukbrowngirls",    deal: "£680",    cat: "DIASPORA",     accent: "#facc15" },
  { top: "🎙️ PODCASTS",  handle: "@nikhilameme",     deal: "₹5,500",  cat: "PROMO",        accent: "#ec5b13" },
  { top: "👑 GEN Z",       handle: "@genzmumbai",      deal: "₹11,200", cat: "COLLAB",       accent: "#a78bfa" },
  { top: "🇦🇪 GULF",      handle: "@gulfhumour",      deal: "$520",    cat: "REGIONAL",     accent: "#4ade80" },
  { top: "📱 D2C",         handle: "@d2cdeals_in",     deal: "₹8,900",  cat: "PERFORMANCE",  accent: "#38bdf8" },
  { top: "🍿 OTT",         handle: "@ottobsessed",     deal: "₹16,000", cat: "STREAMING",    accent: "#f472b6" },
];

// ─────────────────────────────────────────────────────────────────────────────
// THREE.JS — INFINITE CARD BELT
// Three rows of textured plane cards rolling in 3D
// ─────────────────────────────────────────────────────────────────────────────
function CardBelt() {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollV  = useRef(0);   // current scroll velocity
  const scrollA  = useRef(0);   // accumulated offset

  // expose scroll velocity for parent to drive
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let W = el.clientWidth;
    let H = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = false;
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    // Fog — creates depth fade on far cards
    scene.fog = new THREE.FogExp2(0x080608, 0.048);

    const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 120);
    camera.position.set(0, 3.5, 18);
    camera.rotation.x = -0.14;

    // ── ambient + directional light ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const dirLight = new THREE.DirectionalLight(0xfacc15, 1.2);
    dirLight.position.set(5, 10, 8);
    scene.add(dirLight);
    const fillLight = new THREE.DirectionalLight(0xec5b13, 0.6);
    fillLight.position.set(-8, 2, 4);
    scene.add(fillLight);

    // ── build card texture ──
    const buildCardTexture = (card: typeof CARD_DATA[0]) => {
      const CW = 320, CH = 180;
      const c = document.createElement("canvas");
      c.width = CW; c.height = CH;
      const ctx = c.getContext("2d")!;

      // background — very dark with accent tint
      ctx.fillStyle = "#0a090f";
      ctx.roundRect(0, 0, CW, CH, 16);
      ctx.fill();

      // accent border
      ctx.strokeStyle = card.accent + "60";
      ctx.lineWidth = 2;
      ctx.roundRect(1, 1, CW-2, CH-2, 16);
      ctx.stroke();

      // top accent bar
      const grad = ctx.createLinearGradient(0, 0, CW, 0);
      grad.addColorStop(0, card.accent + "cc");
      grad.addColorStop(1, card.accent + "22");
      ctx.fillStyle = grad;
      ctx.roundRect(0, 0, CW, 38, [16, 16, 0, 0]);
      ctx.fill();

      // top label
      ctx.font = "700 18px 'Bebas Neue', sans-serif";
      ctx.fillStyle = "#0a090f";
      ctx.textAlign = "left";
      ctx.fillText(card.top, 14, 26);

      // cat badge top right
      ctx.font = "700 10px monospace";
      ctx.fillStyle = "#0a090f";
      ctx.textAlign = "right";
      ctx.fillText(card.cat, CW - 12, 24);

      // handle
      ctx.font = "700 22px monospace";
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.textAlign = "left";
      ctx.fillText(card.handle, 14, 84);

      // deal amount
      ctx.font = "900 42px 'Bebas Neue', sans-serif";
      ctx.fillStyle = card.accent;
      ctx.shadowColor = card.accent;
      ctx.shadowBlur = 12;
      ctx.fillText(card.deal, 14, 138);
      ctx.shadowBlur = 0;

      // "DEAL LIVE" badge
      ctx.fillStyle = "rgba(74,222,128,0.18)";
      ctx.roundRect(14, 148, 96, 22, 4);
      ctx.fill();
      ctx.font = "700 10px monospace";
      ctx.fillStyle = "#4ade80";
      ctx.textAlign = "left";
      ctx.fillText("● DEAL LIVE", 20, 163);

      // verified tick
      ctx.font = "700 10px monospace";
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.textAlign = "right";
      ctx.fillText("VERIFIED ✓", CW - 12, 163);

      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    };

    // ── ROWS config ──
    const ROWS = [
      { y: 0,    z: 0,   speed: 1.0,   dir:  1, scale: 1.00, count: 10 },
      { y: 2.5,  z: -4,  speed: 0.72,  dir: -1, scale: 0.82, count: 10 },
      { y: -2.5, z: -8,  speed: 0.52,  dir:  1, scale: 0.66, count: 10 },
    ];

    const CARD_W  = 3.8;
    const CARD_H  = 2.14;
    const GAP     = 0.28;
    const STEP    = CARD_W + GAP;

    interface RowData {
      meshes:  THREE.Mesh[];
      offset:  number;
      config:  typeof ROWS[0];
      loopW:   number;
    }
    const rowData: RowData[] = [];

    ROWS.forEach((row) => {
      const meshes: THREE.Mesh[] = [];
      const loopW = row.count * STEP;
      const startX = -loopW / 2;

      for (let i = 0; i < row.count; i++) {
        const card = CARD_DATA[i % CARD_DATA.length];
        const tex  = buildCardTexture(card);

        // card face
        const geo  = new THREE.PlaneGeometry(CARD_W, CARD_H, 1, 1);
        const mat  = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.4,
          metalness: 0.1,
          transparent: true,
          opacity: 1,
        });
        const mesh = new THREE.Mesh(geo, mat);
        const xPos = startX + i * STEP + CARD_W / 2;
        mesh.position.set(xPos * row.scale, row.y, row.z);
        mesh.scale.setScalar(row.scale);
        // slight tilt for depth
        mesh.rotation.x = -0.08 - row.z * 0.006;
        mesh.rotation.y = (Math.random() - 0.5) * 0.06;
        scene.add(mesh);
        meshes.push(mesh);
      }
      rowData.push({ meshes, offset: 0, config: row, loopW });
    });

    // ── scroll input ──
    const onWheel = (e: WheelEvent) => {
      scrollV.current += e.deltaY * 0.004;
    };
    const onTouch = (() => {
      let lastY = 0;
      return {
        start: (e: TouchEvent) => { lastY = e.touches[0].clientY; },
        move:  (e: TouchEvent) => {
          const dy = lastY - e.touches[0].clientY;
          scrollV.current += dy * 0.015;
          lastY = e.touches[0].clientY;
        },
      };
    })();
    window.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("touchstart", onTouch.start, { passive: true });
    el.addEventListener("touchmove",  onTouch.move,  { passive: true });

    const onResize = () => {
      W = el.clientWidth; H = el.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener("resize", onResize);

    // ── animate ──
    let frame = 0, animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      frame++;
      const t = frame * 0.005;

      // decay scroll velocity
      scrollV.current *= 0.88;
      scrollA.current += scrollV.current;

      // camera subtle breathe
      camera.position.y = 3.5 + Math.sin(t * 0.4) * 0.15;

      rowData.forEach(({ meshes, config }) => {
        const baseSpeed = config.speed * 0.028;
        const scrollDelta = scrollV.current * config.speed * 0.4;
        const totalDelta  = (baseSpeed + scrollDelta) * config.dir;

        meshes.forEach((mesh) => {
          mesh.position.x += totalDelta * config.scale;

          // loop: when card exits right, wrap to left (and vice versa)
          const halfLoop = (config.count * STEP * config.scale) / 2;
          if (config.dir > 0 && mesh.position.x > halfLoop + CARD_W * config.scale) {
            mesh.position.x -= config.count * STEP * config.scale;
          }
          if (config.dir < 0 && mesh.position.x < -(halfLoop + CARD_W * config.scale)) {
            mesh.position.x += config.count * STEP * config.scale;
          }

          // subtle per-card bob
          const idx = meshes.indexOf(mesh);
          mesh.position.y = config.y + Math.sin(t * 0.8 + idx * 0.7) * 0.06;
          mesh.rotation.z = Math.sin(t * 0.5 + idx * 0.9) * 0.012;
        });
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("wheel",   onWheel);
      window.removeEventListener("resize",  onResize);
      el.removeEventListener("touchstart", onTouch.start);
      el.removeEventListener("touchmove",  onTouch.move);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: "absolute", inset: 0, zIndex: 1 }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNTER — animated stat number
// ─────────────────────────────────────────────────────────────────────────────
function Counter({ to, suffix = "", color }: { to: number; suffix?: string; color: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let start = 0;
      const step = () => {
        start += to / 55;
        setVal(Math.min(Math.ceil(start), to));
        if (start < to) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      observer.disconnect();
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);

  return (
    <div ref={ref}>
      <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(28px,4vw,52px)", color, lineHeight: 1, letterSpacing: "0.04em", textShadow: `0 0 32px ${color}55` }}>
        {val}{suffix}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function HeroV13() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const contentY       = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <section
      id="hero"
      ref={heroRef}
      style={{ minHeight: "100dvh", position: "relative", background: "#080608", overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* ── THREE.JS BELT — full section ── */}
      <CardBelt />

      {/* gradient top — so nav area stays dark */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "200px", background: "linear-gradient(to bottom, #080608 0%, rgba(8,6,8,0.7) 60%, transparent 100%)", zIndex: 2, pointerEvents: "none" }} />

      {/* gradient bottom */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "280px", background: "linear-gradient(to top, #080608 0%, rgba(8,6,8,0.8) 50%, transparent 100%)", zIndex: 2, pointerEvents: "none" }} />

      {/* grain */}
      <div style={{ position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none", opacity: 0.4, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, backgroundSize: "160px" }} />

      {/* nav space */}
      <div style={{ height: "80px", flexShrink: 0, position: "relative", zIndex: 20 }} />

      {/* ── CENTREPIECE — frosted glass headline ── */}
      <motion.div
        style={{ y: contentY }}
        className="hv13-centre"
      >
        <div style={{
          flex: 1,
          position: "relative", zIndex: 20,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center",
          padding: "0 clamp(16px,5vw,48px)",
          gap: "clamp(12px,2vw,22px)",
          minHeight: "calc(80dvh - 80px)",
        }}>

          {/* frosted glass card behind headline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "relative",
              padding: "clamp(28px,4vw,52px) clamp(28px,5vw,64px)",
              borderRadius: "24px",
              background: "rgba(8,6,8,0.55)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
              maxWidth: "clamp(320px, 80vw, 780px)",
            }}
          >
            {/* top shimmer line on glass */}
            <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(250,204,21,0.6), transparent)", borderRadius: "1px" }} />

            {/* pre-launch badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 14px", borderRadius: "9999px", background: "rgba(236,91,19,0.12)", border: "1px solid rgba(236,91,19,0.3)", marginBottom: "clamp(12px,2vw,20px)" }}
            >
              <motion.div animate={{ scale: [1,1.5,1], opacity: [1,0.3,1] }} transition={{ duration: 1, repeat: Infinity }}
                style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ec5b13", boxShadow: "0 0 8px #ec5b13" }} />
              <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, color: "#ec5b13", letterSpacing: "0.2em" }}>
                SCROLL TO ACCELERATE THE BELT
              </span>
            </motion.div>

            {/* headline — three lines staggered */}
            <div>
              {/* line 1 */}
              <div style={{ overflow: "hidden" }}>
                <motion.div
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.75, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(22px,4vw,56px)", color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em", lineHeight: 1, WebkitTextStroke: "1px rgba(255,255,255,0.35)" }}
                >INDIA'S</motion.div>
              </div>

              {/* line 2 — the big one */}
              <div style={{ overflow: "hidden" }}>
                <motion.div
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.75, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(60px,13vw,172px)", color: "#facc15", letterSpacing: "0.01em", lineHeight: 0.85, textShadow: "0 0 80px rgba(250,204,21,0.35)" }}
                >MEME</motion.div>
              </div>

              {/* line 3 — two words, different weights */}
              <div style={{ overflow: "hidden", display: "flex", gap: "0.18em", justifyContent: "center", flexWrap: "wrap", alignItems: "flex-end" }}>
                <motion.span
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.75, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(36px,7.5vw,100px)", color: "white", letterSpacing: "0.02em", lineHeight: 0.88, display: "block" }}
                >AMPLIFICATION</motion.span>
              </div>
              <div style={{ overflow: "hidden" }}>
                <motion.div
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.75, delay: 0.83, ease: [0.22, 1, 0.36, 1] }}
                  style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(44px,9.5vw,128px)", color: "#ec5b13", letterSpacing: "0.01em", lineHeight: 0.88, textShadow: "0 0 60px rgba(236,91,19,0.4)" }}
                >NETWORK</motion.div>
              </div>
            </div>

            {/* sub */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.0 }}
              style={{ fontFamily: "'Public Sans',sans-serif", fontSize: "clamp(13px,1.2vw,16px)", color: "rgba(255,255,255,0.4)", maxWidth: "480px", lineHeight: 1.7, margin: "clamp(12px,2vw,20px) auto 0" }}
            >
              Every card rolling past is a real meme category we cover.{" "}
              <span style={{ color: "rgba(255,255,255,0.72)", fontWeight: 600 }}>500+ verified pages. Brief in. Live in 48 hours.</span>
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.15 }}
              style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginTop: "clamp(16px,2.5vw,28px)" }}
            >
              <motion.a
                href="#for-brands"
                whileHover={{ scale: 1.05, boxShadow: "0 0 56px rgba(250,204,21,0.55)" }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "9px",
                  padding: "clamp(12px,1.4vw,15px) clamp(24px,3vw,40px)",
                  borderRadius: "10px",
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: "clamp(16px,1.8vw,20px)", letterSpacing: "0.1em",
                  textDecoration: "none",
                  background: "#facc15", color: "#080608",
                  boxShadow: "0 0 36px rgba(250,204,21,0.22)",
                  position: "relative", overflow: "hidden",
                }}
              >
                <motion.div animate={{ x: ["-120%","120%"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                  style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.32),transparent)", pointerEvents: "none" }} />
                <span style={{ position: "relative" }}>🚀 AMPLIFY MY BRAND</span>
              </motion.a>

              <motion.a
                href="#for-pages"
                whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.08)" }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "9px",
                  padding: "clamp(12px,1.4vw,15px) clamp(18px,2.2vw,30px)",
                  borderRadius: "10px",
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: "clamp(16px,1.8vw,20px)", letterSpacing: "0.1em",
                  textDecoration: "none",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.78)",
                  border: "1px solid rgba(255,255,255,0.16)",
                }}
              >
                💸 JOIN AS CREATOR
              </motion.a>
            </motion.div>

            {/* bottom shimmer */}
            <div style={{ position: "absolute", bottom: 0, left: "20%", right: "20%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(236,91,19,0.4), transparent)" }} />
          </motion.div>

          {/* stats below glass card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            style={{ display: "flex", gap: "clamp(20px,4vw,52px)", flexWrap: "wrap", justifyContent: "center" }}
          >
            {[
              { to: 500,  suffix: "+",   label: "Pages",     color: "#facc15" },
              { to: 25,   suffix: "M+",  label: "Reach",     color: "#ec5b13" },
              { to: 48,   suffix: "hr",  label: "Go-Live",   color: "#4ade80" },
              { to: 12,   suffix: "",    label: "Categories",color: "#38bdf8" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.35 + i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ textAlign: "center" }}
              >
                <Counter to={s.to} suffix={s.suffix} color={s.color} />
                <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: "3px" }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* bottom tape */}
      <div style={{ position: "relative", zIndex: 20, overflow: "hidden", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <style>{`
          @keyframes v13t  { 0%{transform:translateX(0)}   100%{transform:translateX(-50%)} }
          @keyframes v13tr { 0%{transform:translateX(-50%)} 100%{transform:translateX(0%)}  }
          .v13ta { display:flex; width:max-content; animation:v13t  26s linear infinite; padding:8px 0; }
          .v13tb { display:flex; width:max-content; animation:v13tr 32s linear infinite; padding:8px 0; border-top:1px solid rgba(255,255,255,0.04); background:rgba(250,204,21,0.03); }
        `}</style>
        <div className="v13ta">
          {[...Array(2)].flatMap((_, j) => ["ROBOROFL","·","MEME AMPLIFICATION NETWORK","·","500+ PAGES","·","INDIA & WORLDWIDE","·","48HR CAMPAIGNS","·","ZERO BOTS","·"].map((w,i) => (
            <span key={`${j}-${i}`} style={{ fontFamily: w==="ROBOROFL"?"'Bebas Neue',sans-serif":"monospace", fontSize: w==="ROBOROFL"?"clamp(13px,1.5vw,18px)":"clamp(9px,1vw,11px)", letterSpacing:"0.16em", color: w==="·"?"#facc15":w==="ROBOROFL"?"rgba(255,255,255,0.4)":"rgba(255,255,255,0.14)", padding:"0 18px", whiteSpace:"nowrap" }}>{w}</span>
          )))}
        </div>
        <div className="v13tb">
          {[...Array(2)].flatMap((_, j) => ["HUMOR","·","CRICKET","·","BOLLYWOOD","·","FINANCE","·","AI & TECH","·","GEN Z","·","POLITICS","·","D2C","·","OTT","·"].map((w,i) => (
            <span key={`${j}-${i}`} style={{ fontFamily:"monospace", fontSize:"clamp(9px,1vw,11px)", letterSpacing:"0.18em", color: w==="·"?"#ec5b13":"rgba(255,255,255,0.14)", padding:"0 18px", whiteSpace:"nowrap", fontWeight:700 }}>{w}</span>
          )))}
        </div>
      </div>

      <style>{`
        .hv13-centre { flex: 1; display: flex; flex-direction: column; position: relative; z-index: 15; }
        @media (max-width: 640px) {
          .hv13-centre { justify-content: center; }
        }
      `}</style>
    </section>
  );
}