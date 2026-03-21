"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// THREE.JS WORMHOLE
// ─────────────────────────────────────────────────────────────────────────────
function Wormhole() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 200);
    camera.position.z = 0;

    // palette: orange → yellow → white → purple
    const ringColors = [
      new THREE.Color("#ec5b13"),
      new THREE.Color("#f28c35"),
      new THREE.Color("#facc15"),
      new THREE.Color("#fde68a"),
      new THREE.Color("#ffffff"),
      new THREE.Color("#c4b5fd"),
      new THREE.Color("#a78bfa"),
    ];

    // create tube rings along Z axis
    const RING_COUNT   = 80;
    const RING_SPACING = 2.2;
    const rings: THREE.Mesh[] = [];

    for (let i = 0; i < RING_COUNT; i++) {
      const z = -i * RING_SPACING;
      const radius = 3.5 + Math.sin(i * 0.25) * 0.4; // slight wave
      const geo  = new THREE.TorusGeometry(radius, 0.04, 8, 64);
      const colorIdx = Math.floor((i / RING_COUNT) * ringColors.length);
      const col  = ringColors[Math.min(colorIdx, ringColors.length - 1)];
      const mat  = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55 });
      const ring = new THREE.Mesh(geo, mat);
      ring.position.z = z;
      // slight random tilt
      ring.rotation.x = (Math.random() - 0.5) * 0.18;
      ring.rotation.y = (Math.random() - 0.5) * 0.18;
      scene.add(ring);
      rings.push(ring);
    }

    // add speed lines (particles flying past)
    const LINE_COUNT = 180;
    const lPositions = new Float32Array(LINE_COUNT * 6);
    const lColors    = new Float32Array(LINE_COUNT * 6);
    for (let i = 0; i < LINE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r     = 0.5 + Math.random() * 3.0;
      const x     = Math.cos(angle) * r;
      const y     = Math.sin(angle) * r;
      const z     = -(Math.random() * RING_COUNT * RING_SPACING);
      lPositions[i*6]   = x; lPositions[i*6+1] = y; lPositions[i*6+2] = z;
      lPositions[i*6+3] = x; lPositions[i*6+4] = y; lPositions[i*6+5] = z + 1.2;
      const c = ringColors[Math.floor(Math.random() * ringColors.length)];
      lColors[i*6] = lColors[i*6+3] = c.r;
      lColors[i*6+1] = lColors[i*6+4] = c.g;
      lColors[i*6+2] = lColors[i*6+5] = c.b;
    }
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute("position", new THREE.BufferAttribute(lPositions, 3));
    lGeo.setAttribute("color",    new THREE.BufferAttribute(lColors, 3));
    const lMat  = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.25 });
    const speedLines = new THREE.LineSegments(lGeo, lMat);
    scene.add(speedLines);

    // resize
    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // animate — camera flies forward through tunnel
    let frame = 0;
    let animId: number;
    const TUNNEL_DEPTH = RING_COUNT * RING_SPACING;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      frame++;
      const t = frame * 0.008;

      // camera position: loop through tunnel
      const cz = -(t * 3.5 % TUNNEL_DEPTH);
      camera.position.z = cz + RING_SPACING;

      // slight camera sway
      camera.position.x = Math.sin(t * 0.3) * 0.18;
      camera.position.y = Math.cos(t * 0.22) * 0.12;
      camera.lookAt(0, 0, cz - 10);

      // pulse ring opacity
      rings.forEach((ring, i) => {
        const relZ    = ring.position.z - camera.position.z;
        const visible = relZ < 0 && relZ > -TUNNEL_DEPTH * 0.85;
        const mat     = ring.material as THREE.MeshBasicMaterial;
        if (visible) {
          const pulse = 0.3 + Math.sin(t * 2.5 - i * 0.35) * 0.25;
          mat.opacity = pulse;
          const scale = 1 + Math.sin(t * 1.8 - i * 0.4) * 0.04;
          ring.scale.set(scale, scale, 1);
        }
      });

      // speed lines scroll
      const lp = lGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < LINE_COUNT; i++) {
        lp.array[i*6+2]   = ((lp.array[i*6+2]   - cz + RING_SPACING) % TUNNEL_DEPTH) + cz;
        lp.array[i*6+5]   = lp.array[i*6+2] + 1.2;
      }
      lp.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPEWRITER
// ─────────────────────────────────────────────────────────────────────────────
function Typewriter({ texts }: { texts: string[] }) {
  const [tIdx, setTIdx] = useState(0);
  const [display, setDisplay] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = texts[tIdx];
    if (!deleting && display.length < full.length) {
      const t = setTimeout(() => setDisplay(full.slice(0, display.length + 1)), 55);
      return () => clearTimeout(t);
    }
    if (!deleting && display.length === full.length) {
      const t = setTimeout(() => setDeleting(true), 2200);
      return () => clearTimeout(t);
    }
    if (deleting && display.length > 0) {
      const t = setTimeout(() => setDisplay(display.slice(0, -1)), 28);
      return () => clearTimeout(t);
    }
    if (deleting && display.length === 0) {
      setDeleting(false);
      setTIdx(p => (p + 1) % texts.length);
    }
  }, [display, deleting, tIdx, texts]);

  return (
    <span>
      {display}
      <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.6, repeat: Infinity }}
        style={{ display: "inline-block", width: "3px", height: "0.85em", background: "#facc15", marginLeft: "3px", verticalAlign: "middle" }}
      />
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function HeroV8() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const bgScale  = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section id="hero" ref={heroRef}
      style={{ minHeight: "100dvh", position: "relative", background: "#050306", overflow: "hidden", display: "flex", flexDirection: "column" }}
    >

      {/* THREE.JS WORMHOLE fills bg */}
      <motion.div style={{ scale: bgScale, position: "absolute", inset: 0, zIndex: 0 }}>
        <Wormhole />
      </motion.div>

      {/* dark overlay — heavier at edges, lighter at center so tunnel visible */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 48%, rgba(5,3,6,0.2) 0%, rgba(5,3,6,0.82) 68%, rgba(5,3,6,0.96) 100%)", pointerEvents: "none", zIndex: 1 }} />

      {/* grain */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.45, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E")`, backgroundSize: "160px", pointerEvents: "none", zIndex: 1 }} />

      {/* nav gap */}
      <div style={{ height: "80px", flexShrink: 0 }} />

      {/* ── CONTENT ── */}
      <motion.div
        style={{ y: contentY }}
        className="hv8-content"
        // fill remaining height, center content
        data-lenis-prevent
      >
        <div style={{ flex: 1, position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 clamp(16px,5vw,56px)", textAlign: "center", gap: "clamp(16px,2.5vw,28px)", minHeight: "calc(100dvh - 80px)", paddingBottom: "60px" }}>

          {/* eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ display: "inline-flex", alignItems: "center", gap: "clamp(8px,1.5vw,16px)", flexWrap: "wrap", justifyContent: "center" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "5px 14px", borderRadius: "9999px", background: "rgba(250,204,21,0.1)", border: "1px solid rgba(250,204,21,0.28)" }}>
              <motion.div animate={{ scale: [1,1.6,1] }} transition={{ duration: 1, repeat: Infinity }}
                style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#facc15", boxShadow: "0 0 10px #facc15" }} />
              <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, color: "#facc15", letterSpacing: "0.2em" }}>
                ENTERING THE NETWORK
              </span>
            </div>
            <span style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.14em" }}>
              500+ PAGES · WORLDWIDE · Q2 2026
            </span>
          </motion.div>

          {/* headline block */}
          <div>
            {/* top line — big outlined */}
            <div style={{ overflow: "hidden" }}>
              <motion.div
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.72, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(52px,13vw,180px)", lineHeight: 0.86, color: "transparent", WebkitTextStroke: "2px rgba(255,255,255,0.22)", letterSpacing: "0.01em", userSelect: "none" }}
              >INDIA'S</motion.div>
            </div>

            {/* mega yellow */}
            <div style={{ overflow: "hidden" }}>
              <motion.div
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.72, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(52px,13vw,180px)", lineHeight: 0.86, color: "#facc15", textShadow: "0 0 100px rgba(250,204,21,0.4)", letterSpacing: "0.01em", userSelect: "none" }}
              >MEME</motion.div>
            </div>

            {/* typewriter line */}
            <div style={{ overflow: "hidden" }}>
              <motion.div
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.72, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px,8vw,110px)", lineHeight: 0.9, color: "#ec5b13", letterSpacing: "0.02em", userSelect: "none", textShadow: "0 0 60px rgba(236,91,19,0.45)" }}
              >
                <Typewriter texts={["AMPLIFICATION NETWORK", "CULTURE MACHINE", "48HR ACTIVATION", "ZERO BOTS. ZERO FAKES.", "YOUR CAMPAIGN. LIVE."]} />
              </motion.div>
            </div>
          </div>

          {/* sub */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.65 }}
            style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "clamp(13px,1.3vw,17px)", color: "rgba(255,255,255,0.38)", maxWidth: "520px", lineHeight: 1.7 }}
          >
            Every ring you just flew through — a meme page in our network.{" "}
            <span style={{ color: "rgba(255,255,255,0.72)", fontWeight: 600 }}>
              Brief in. Live in 48 hours. Worldwide.
            </span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.76 }}
            style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}
          >
            <motion.a href="#for-brands"
              whileHover={{ scale: 1.05, boxShadow: "0 0 64px rgba(250,204,21,0.55)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "9px",
                padding: "clamp(12px,1.5vw,16px) clamp(24px,3.5vw,44px)",
                borderRadius: "10px",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(16px,1.8vw,20px)",
                letterSpacing: "0.12em",
                textDecoration: "none",
                background: "#facc15", color: "#050306",
                boxShadow: "0 0 40px rgba(250,204,21,0.24)",
                position: "relative", overflow: "hidden",
              }}
            >
              <motion.div animate={{ x: ["-120%","120%"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.32),transparent)", pointerEvents: "none" }} />
              <span style={{ position: "relative" }}>🚀 AMPLIFY MY BRAND</span>
            </motion.a>

            <motion.a href="#for-pages"
              whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.07)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "9px",
                padding: "clamp(12px,1.5vw,16px) clamp(20px,3vw,36px)",
                borderRadius: "10px",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(16px,1.8vw,20px)",
                letterSpacing: "0.12em",
                textDecoration: "none",
                background: "rgba(255,255,255,0)", color: "rgba(255,255,255,0.75)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              💸 JOIN AS CREATOR
            </motion.a>
          </motion.div>

          {/* stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.86 }}
            className="hv8-stats"
            style={{ display: "flex", gap: "clamp(12px,2.5vw,28px)", flexWrap: "wrap", justifyContent: "center" }}
          >
            {[
              { v: "500+",  l: "Verified Pages",  c: "#facc15" },
              { v: "25M+",  l: "Combined Reach",  c: "#ec5b13" },
              { v: "48hr",  l: "Brief to Live",   c: "#4ade80" },
              { v: "12",    l: "Categories",       c: "#38bdf8" },
              { v: "0",     l: "Bots or Fakes",   c: "#a78bfa" },
            ].map((s, i) => (
              <motion.div key={s.l}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.92 + i * 0.07, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ textAlign: "center" }}
              >
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(22px,3.5vw,38px)", color: s.c, lineHeight: 1, letterSpacing: "0.04em", textShadow: `0 0 24px ${s.c}50` }}>{s.v}</div>
                <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: "3px" }}>{s.l}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* bottom tape */}
      <div style={{ position: "relative", zIndex: 10, overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}>
        <style>{`
          @keyframes tape8l { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
          @keyframes tape8r { 0%{transform:translateX(-50%)} 100%{transform:translateX(0%)} }
          .t8l { display:flex; width:max-content; animation:tape8l 26s linear infinite; padding: 9px 0; }
          .t8r { display:flex; width:max-content; animation:tape8r 34s linear infinite; padding: 9px 0; background: rgba(250,204,21,0.04); border-top: 1px solid rgba(255,255,255,0.04); }
        `}</style>
        <div className="t8l">
          {[...Array(2)].flatMap((_, j) => ["ROBOROFL","·","MEME AMPLIFICATION NETWORK","·","500+ VERIFIED PAGES","·","WORLDWIDE","·","48HR CAMPAIGNS","·","ZERO BOTS","·"].map((w, i) => (
            <span key={`${j}-${i}`} style={{ fontFamily: w === "ROBOROFL" ? "'Bebas Neue',sans-serif" : "monospace", fontSize: w === "ROBOROFL" ? "clamp(14px,1.5vw,19px)" : "clamp(9px,1vw,12px)", letterSpacing: "0.16em", color: w === "·" ? "#ec5b13" : w === "ROBOROFL" ? "#facc15" : "rgba(255,255,255,0.18)", padding: "0 18px", whiteSpace: "nowrap" }}>{w}</span>
          )))}
        </div>
        <div className="t8r">
          {[...Array(2)].flatMap((_, j) => ["BRANDS","·","AGENCIES","·","BOLLYWOOD","·","CREATORS","·","PODCASTS","·","POLITICIANS","·","D2C","·"].map((w, i) => (
            <span key={`${j}-${i}`} style={{ fontFamily: "monospace", fontSize: "clamp(9px,1vw,12px)", letterSpacing: "0.18em", color: w === "·" ? "#facc15" : "rgba(255,255,255,0.15)", padding: "0 18px", whiteSpace: "nowrap", fontWeight: 700 }}>{w}</span>
          )))}
        </div>
      </div>

      <style>{`
        .hv8-content { flex: 1; display: flex; flex-direction: column; }
        @media (max-width: 480px) {
          .hv8-stats { gap: 16px !important; }
        }
      `}</style>
    </section>
  );
}