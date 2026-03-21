"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence, MotionValue } from "framer-motion";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const EMOJIS = ["😂","🔥","💸","👑","🏏","🎬","🚀","💯","⚡","🌍","💻","🎙️","🗳️","😤","🤑","🎯","💥","🏆","🫡","😈","🤣","🔊"];

const ROLLING_WORDS = ["BRANDS", "AGENCIES", "BOLLYWOOD", "CREATORS", "POLITICIANS", "PODCASTS"];

// ─────────────────────────────────────────────────────────────────────────────
// THREE.JS — EMOJI DEPTH FIELD
// Custom bokeh shader — emojis at different Z depths, focal plane sweeps on scroll
// ─────────────────────────────────────────────────────────────────────────────

const BOKEH_VERT = `
  attribute float aSize;
  attribute float aDepth;
  attribute float aPhase;
  varying float vBlur;
  varying float vAlpha;
  uniform float uFocalZ;   // current focal plane Z (-1..0)
  uniform float uTime;
  void main() {
    // gentle drift
    vec3 pos = position;
    pos.x += sin(uTime * 0.4 + aPhase) * 0.3;
    pos.y += cos(uTime * 0.33 + aPhase * 1.3) * 0.18;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float depthDiff = abs(pos.z - uFocalZ);       // distance from focal plane
    vBlur  = clamp(depthDiff * 0.28, 0.0, 1.0);   // 0=sharp, 1=fully bokeh
    vAlpha = mix(0.9, 0.18, vBlur);               // sharp = opaque, blurred = faint

    float size = aSize * (380.0 / -mv.z);
    gl_PointSize = size;
    gl_Position  = projectionMatrix * mv;
  }
`;

const BOKEH_FRAG = `
  varying float vBlur;
  varying float vAlpha;
  uniform sampler2D uTex;
  void main() {
    vec2 uv   = gl_PointCoord;
    float d   = distance(uv, vec2(0.5));

    // bokeh disc — sharp: crisp circle, blurred: soft feathered disc
    float edge   = mix(0.48, 0.5, vBlur);
    float feather = mix(0.04, 0.28, vBlur);
    float mask   = 1.0 - smoothstep(edge - feather, edge, d);

    vec4 texCol = texture2D(uTex, uv);
    gl_FragColor = vec4(texCol.rgb, texCol.a * mask * vAlpha);
  }
`;

// build emoji texture
function buildEmojiTex(emoji: string): THREE.CanvasTexture {
  const SIZE = 96;
  const c = document.createElement("canvas");
  c.width = c.height = SIZE;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.font = `${SIZE * 0.72}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, SIZE / 2, SIZE / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

function EmojiDepthField({ focalZ }: { focalZ: number }) {
  const mountRef  = useRef<HTMLDivElement>(null);
  const focalRef  = useRef(focalZ);

  useEffect(() => { focalRef.current = focalZ; }, [focalZ]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    let W = el.clientWidth, H = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, premultipliedAlpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 200);
    camera.position.z = 12;

    // build emoji atlas — one texture per emoji type
    const texMap: Map<string, THREE.CanvasTexture> = new Map();
    EMOJIS.forEach(e => texMap.set(e, buildEmojiTex(e)));

    // ── particle field — 3 depth layers ──
    const LAYERS = [
      { z:  2,   count: 20, sizeRange: [1.8, 3.2] as [number, number] },   // near — large
      { z: -2,   count: 36, sizeRange: [0.9, 1.6] as [number, number] },   // mid — medium
      { z: -7,   count: 44, sizeRange: [0.4, 0.85] as [number, number] },  // far — small
    ];

    // one Points object per emoji (so each has its own texture uniform)
    const pointsObjects: THREE.Points[] = [];

    LAYERS.forEach(layer => {
      for (let ei = 0; ei < EMOJIS.length; ei++) {
        const emoji = EMOJIS[ei];
        const perEmoji = Math.ceil(layer.count / EMOJIS.length);
        const N = perEmoji;

        const positions = new Float32Array(N * 3);
        const sizes     = new Float32Array(N);
        const depths    = new Float32Array(N);
        const phases    = new Float32Array(N);

        for (let i = 0; i < N; i++) {
          positions[i*3]   = (Math.random() - 0.5) * 22;
          positions[i*3+1] = (Math.random() - 0.5) * 14;
          positions[i*3+2] = layer.z + (Math.random() - 0.5) * 2.5;
          sizes[i]         = layer.sizeRange[0] + Math.random() * (layer.sizeRange[1] - layer.sizeRange[0]);
          depths[i]        = layer.z;
          phases[i]        = Math.random() * Math.PI * 2;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geo.setAttribute("aSize",    new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute("aDepth",   new THREE.BufferAttribute(depths, 1));
        geo.setAttribute("aPhase",   new THREE.BufferAttribute(phases, 1));

        const mat = new THREE.ShaderMaterial({
          vertexShader:   BOKEH_VERT,
          fragmentShader: BOKEH_FRAG,
          transparent: true,
          depthWrite: false,
          uniforms: {
            uFocalZ: { value: focalRef.current },
            uTime:   { value: 0 },
            uTex:    { value: texMap.get(emoji)! },
          },
        });

        const pts = new THREE.Points(geo, mat);
        scene.add(pts);
        pointsObjects.push(pts);
      }
    });

    const onResize = () => {
      W = el.clientWidth; H = el.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener("resize", onResize);

    let frame = 0, animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      frame++;
      const t = frame * 0.004;

      // update uniforms
      pointsObjects.forEach(pts => {
        const mat = pts.material as THREE.ShaderMaterial;
        mat.uniforms.uTime.value   = t;
        mat.uniforms.uFocalZ.value = focalRef.current;
      });

      // very slow camera drift
      camera.position.x = Math.sin(t * 0.07) * 0.6;
      camera.position.y = Math.cos(t * 0.05) * 0.35;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      texMap.forEach(t => t.dispose());
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLLING WORD
// ─────────────────────────────────────────────────────────────────────────────
function RollWord() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(p => (p + 1) % ROLLING_WORDS.length), 1900);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ display: "inline-block", overflow: "hidden", height: "1em", verticalAlign: "bottom" }}>
      <AnimatePresence mode="wait">
        <motion.span key={idx}
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "block", color: "#ec5b13", textShadow: "0 0 48px rgba(236,91,19,0.55)" }}
        >{ROLLING_WORDS[idx]}</motion.span>
      </AnimatePresence>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HORIZONTAL SPLIT HEADLINE
// Top half slides right → left, bottom half slides left → right on scroll
// ─────────────────────────────────────────────────────────────────────────────
function SplitHeadline({ scrollY }: { scrollY: MotionValue<number> }) {
  const topX = useTransform(scrollY, [0, 1], ["6%", "0%"]);
  const botX = useTransform(scrollY, [0, 1], ["-6%", "0%"]);

  return (
    <div style={{ userSelect: "none", lineHeight: 0.88 }}>
      {/* top half — slides from right */}
      <motion.div style={{ x: topX }}>
        <div style={{ overflow: "hidden" }}>
          <motion.div
            initial={{ y: "108%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.78, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(52px,12vw,168px)", color: "#facc15", letterSpacing: "0.01em", textShadow: "0 0 100px rgba(250,204,21,0.35)" }}
          >MEME</motion.div>
        </div>
        <div style={{ overflow: "hidden" }}>
          <motion.div
            initial={{ y: "108%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.78, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px,6.5vw,90px)", color: "rgba(255,255,255,0.88)", letterSpacing: "0.02em" }}
          >AMPLIFICATION</motion.div>
        </div>
      </motion.div>

      {/* horizontal rule */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ height: "2px", background: "linear-gradient(90deg, #facc15, #ec5b13, transparent)", transformOrigin: "left", margin: "clamp(6px,1vw,12px) 0" }}
      />

      {/* bottom half — slides from left */}
      <motion.div style={{ x: botX }}>
        <div style={{ overflow: "hidden" }}>
          <motion.div
            initial={{ y: "108%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.78, delay: 0.33, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px,6.5vw,90px)", color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.3)", letterSpacing: "0.02em" }}
          >NETWORK · FOR</motion.div>
        </div>
        <div style={{ overflow: "hidden" }}>
          <motion.div
            initial={{ y: "108%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.78, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px,10vw,140px)", letterSpacing: "0.01em" }}
          ><RollWord /></motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function HeroV15() {
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  // focal plane: starts at mid-depth (-2), scrolling pulls it toward near (+2)
  const rawFocal = useTransform(scrollYProgress, [0, 1], [-2, 2.5]);
  const smoothFocal = useSpring(rawFocal, { stiffness: 40, damping: 18 });
  const [focalVal, setFocalVal] = useState(-2);
  useEffect(() => smoothFocal.on("change", v => setFocalVal(v)), [smoothFocal]);

  // content parallax
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);

  // headline split
  const splitProgress = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    <section id="hero" ref={heroRef}
      style={{ minHeight: "100dvh", position: "relative", background: "#07060c", overflow: "hidden", display: "flex", flexDirection: "column" }}>

      {/* THREE.JS depth field — full bg */}
      <EmojiDepthField focalZ={focalVal} />

      {/* vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 88% 85% at 50% 48%, rgba(7,6,12,0.3) 0%, rgba(7,6,12,0.78) 65%, rgba(7,6,12,0.97) 100%)", pointerEvents: "none", zIndex: 2 }} />

      {/* grain */}
      <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", opacity: 0.45,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E")`,
        backgroundSize: "160px" }} />

      {/* nav */}
      <div style={{ height: "80px", flexShrink: 0, position: "relative", zIndex: 20 }} />

      {/* ── CONTENT ── */}
      <motion.div style={{ y: contentY, flex: 1, position: "relative", zIndex: 10, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ padding: "0 clamp(20px,5vw,64px)", display: "grid", gridTemplateColumns: "auto 1fr", gap: "clamp(24px,5vw,72px)", alignItems: "center" }} className="v15-grid">

          {/* LEFT — main typographic statement */}
          <div style={{ maxWidth: "clamp(320px, 60vw, 780px)" }}>

            {/* eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "5px 14px", borderRadius: "9999px", background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.22)", marginBottom: "clamp(14px,2vw,24px)" }}
            >
              <motion.div animate={{ opacity: [1,0.2,1] }} transition={{ duration: 1.1, repeat: Infinity }}
                style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#facc15", boxShadow: "0 0 10px #facc15" }} />
              <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, color: "#facc15", letterSpacing: "0.2em" }}>
                SCROLL — WATCH THE FOCUS SHIFT
              </span>
            </motion.div>

            <SplitHeadline scrollY={splitProgress} />

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.62 }}
              style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "clamp(13px,1.2vw,17px)", color: "rgba(255,255,255,0.38)", maxWidth: "460px", lineHeight: 1.7, marginTop: "clamp(14px,2vw,24px)" }}
            >
              Every emoji floating around you is a real meme category in our network.{" "}
              <span style={{ color: "rgba(255,255,255,0.72)", fontWeight: 600 }}>500+ verified pages. Brief in. Live in 48 hours.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.75 }}
              style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "clamp(18px,2.5vw,32px)" }}
            >
              <motion.a href="#for-brands"
                whileHover={{ scale: 1.05, boxShadow: "0 0 56px rgba(250,204,21,0.55)" }}
                whileTap={{ scale: 0.97 }}
                style={{ display: "inline-flex", alignItems: "center", gap: "9px", padding: "clamp(12px,1.4vw,15px) clamp(22px,2.8vw,38px)", borderRadius: "8px", fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(15px,1.7vw,19px)", letterSpacing: "0.1em", textDecoration: "none", background: "#facc15", color: "#07060c", boxShadow: "0 0 32px rgba(250,204,21,0.22)", position: "relative", overflow: "hidden" }}>
                <motion.div animate={{ x: ["-120%","120%"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                  style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)", pointerEvents: "none" }} />
                <span style={{ position: "relative" }}>🚀 AMPLIFY MY BRAND</span>
              </motion.a>
              <motion.a href="#for-pages"
                whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.07)" }}
                whileTap={{ scale: 0.97 }}
                style={{ display: "inline-flex", alignItems: "center", gap: "9px", padding: "clamp(12px,1.4vw,15px) clamp(18px,2.2vw,30px)", borderRadius: "8px", fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(15px,1.7vw,19px)", letterSpacing: "0.1em", textDecoration: "none", background: "rgba(255,255,255,0)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.18)" }}>
                💸 JOIN AS CREATOR
              </motion.a>
            </motion.div>
          </div>

          {/* RIGHT — stat column */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="v15-stats"
            style={{ display: "flex", flexDirection: "column", gap: "clamp(12px,2vw,22px)", borderLeft: "1px solid rgba(255,255,255,0.07)", paddingLeft: "clamp(16px,3vw,40px)" }}
          >
            {/* focal depth indicator */}
            <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.22)", letterSpacing: "0.14em", marginBottom: "4px" }}>
              // FOCAL DEPTH
            </div>
            <div style={{ height: "80px", position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              {["NEAR +2","MID  0","FAR  -7"].map((l, i) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <motion.div
                    animate={{ width: Math.abs(focalVal - [2,0,-7][i]) < 2.5 ? "28px" : "8px", background: Math.abs(focalVal - [2,0,-7][i]) < 2.5 ? "#facc15" : "rgba(255,255,255,0.15)" }}
                    transition={{ duration: 0.3 }}
                    style={{ height: "2px", borderRadius: "1px" }}
                  />
                  <span style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.1em" }}>{l}</span>
                </div>
              ))}
            </div>

            <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "4px 0" }} />

            {[
              { v: "500+",  l: "Pages",     c: "#facc15" },
              { v: "25M+",  l: "Reach",     c: "#ec5b13" },
              { v: "48hr",  l: "Go-Live",   c: "#4ade80" },
              { v: "22",    l: "Categories",c: "#38bdf8" },
            ].map((s, i) => (
              <motion.div key={s.l}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.62 + i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(24px,3.5vw,42px)", color: s.c, lineHeight: 1, letterSpacing: "0.04em", textShadow: `0 0 24px ${s.c}50` }}>{s.v}</div>
                <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: "2px" }}>{s.l}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* dual tape */}
      <div style={{ position: "relative", zIndex: 10, overflow: "hidden", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <style>{`
          @keyframes v15a { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
          @keyframes v15b { 0%{transform:translateX(-50%)} 100%{transform:translateX(0)} }
          .v15ta { display:flex; width:max-content; animation:v15a 28s linear infinite; padding:9px 0; }
          .v15tb { display:flex; width:max-content; animation:v15b 34s linear infinite; padding:8px 0; border-top:1px solid rgba(255,255,255,0.04); background:rgba(250,204,21,0.03); }
          @media (max-width:860px) {
            .v15-grid { grid-template-columns:1fr !important; }
            .v15-stats { border-left:none !important; padding-left:0 !important; border-top:1px solid rgba(255,255,255,0.07) !important; padding-top: 20px; flex-direction:row !important; flex-wrap:wrap; gap:16px !important; }
            .v15-stats > div { flex:1; min-width:64px; }
          }
        `}</style>
        <div className="v15ta">
          {[...Array(2)].flatMap((_, j) => ["ROBOROFL","·","EMOJI DEPTH FIELD","·","MEME AMPLIFICATION NETWORK","·","500+ PAGES","·","48HR CAMPAIGNS","·","SCROLL TO REFOCUS","·"].map((w,i) => (
            <span key={`${j}-${i}`} style={{ fontFamily:w==="ROBOROFL"?"'Bebas Neue',sans-serif":"monospace", fontSize:w==="ROBOROFL"?"clamp(13px,1.5vw,18px)":"clamp(9px,1vw,11px)", letterSpacing:"0.16em", color:w==="·"?"#facc15":w==="ROBOROFL"?"rgba(255,255,255,0.4)":"rgba(255,255,255,0.14)", padding:"0 18px", whiteSpace:"nowrap" }}>{w}</span>
          )))}
        </div>
        <div className="v15tb">
          {[...Array(2)].flatMap((_, j) => ["😂 HUMOR","·","🏏 CRICKET","·","🎬 BOLLYWOOD","·","💸 FINANCE","·","🤖 AI","·","👑 GEN Z","·","🗳️ POLITICS","·"].map((w,i) => (
            <span key={`${j}-${i}`} style={{ fontFamily:"monospace", fontSize:"clamp(9px,1vw,11px)", letterSpacing:"0.16em", color:w==="·"?"#ec5b13":"rgba(255,255,255,0.18)", padding:"0 18px", whiteSpace:"nowrap" }}>{w}</span>
          )))}
        </div>
      </div>
    </section>
  );
}