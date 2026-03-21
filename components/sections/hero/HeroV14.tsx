"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & TYPES
// ─────────────────────────────────────────────────────────────────────────────
const BRAND   = "ROBOROFL";
const PALETTE = ["#facc15","#ec5b13","#ffffff","#fde68a","#f97316"];

interface Shard {
  mesh:     THREE.Mesh;
  vel:      THREE.Vector3;
  rotVel:   THREE.Vector3;
  lifespan: number;          // frames until fully transparent
  age:      number;
}

// ─────────────────────────────────────────────────────────────────────────────
// THREE.JS — GLASS SHATTER
// ─────────────────────────────────────────────────────────────────────────────
function ShatterCanvas({ onDone }: { onDone: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 300);
    camera.position.z = 24;

    // ── lighting for glass ──
    scene.add(new THREE.AmbientLight(0x111111, 2));
    const spot1 = new THREE.SpotLight(0xfacc15, 8, 60, Math.PI * 0.2, 0.5);
    spot1.position.set(10, 12, 16);
    scene.add(spot1);
    const spot2 = new THREE.SpotLight(0xec5b13, 5, 50, Math.PI * 0.25, 0.5);
    spot2.position.set(-12, -8, 14);
    scene.add(spot2);
    const fill = new THREE.PointLight(0x38bdf8, 3, 40);
    fill.position.set(0, 0, 20);
    scene.add(fill);

    // ── helpers ──
    const randRange = (a: number, b: number) => a + Math.random() * (b - a);

    // ── PHASE 1: Engrave the brand name as outlined glowing text ──
    // We raster the text on a canvas, then voronoi-partition it into shard shapes

    const TC = 640, TH_c = 240;   // texture canvas size (landscape)
    const textCanvas  = document.createElement("canvas");
    textCanvas.width  = TC;
    textCanvas.height = TH_c;
    const tctx = textCanvas.getContext("2d")!;

    // dark glass background
    tctx.fillStyle = "#050507";
    tctx.fillRect(0, 0, TC, TH_c);

    // brand name — double pass for glow
    const FS = Math.min(TC * 0.22, 130);
    tctx.font      = `900 ${FS}px 'Bebas Neue', sans-serif`;
    tctx.textAlign = "center";
    tctx.textBaseline = "middle";

    // outer glow
    tctx.shadowColor  = "#facc15";
    tctx.shadowBlur   = 28;
    tctx.strokeStyle  = "#facc15";
    tctx.lineWidth    = 1.5;
    tctx.strokeText(BRAND, TC / 2, TH_c / 2);

    // inner bright stroke
    tctx.shadowBlur   = 8;
    tctx.strokeStyle  = "#ffffff";
    tctx.lineWidth    = 0.8;
    tctx.strokeText(BRAND, TC / 2, TH_c / 2);
    tctx.shadowBlur   = 0;

    // hairline cracks emanating from center
    const CRACKS = 22;
    for (let c = 0; c < CRACKS; c++) {
      const angle  = (c / CRACKS) * Math.PI * 2;
      const length = randRange(60, TC * 0.48);
      const segs   = Math.floor(randRange(3, 7));
      let cx = TC / 2, cy = TH_c / 2;
      tctx.beginPath();
      tctx.moveTo(cx, cy);
      for (let s = 0; s < segs; s++) {
        const jitter = randRange(-18, 18);
        const ex = cx + Math.cos(angle + jitter * 0.03) * (length / segs);
        const ey = cy + Math.sin(angle + jitter * 0.03) * (length / segs);
        tctx.lineTo(ex, ey);
        cx = ex; cy = ey;
      }
      tctx.strokeStyle = `rgba(250,204,21,${randRange(0.04, 0.14)})`;
      tctx.lineWidth   = randRange(0.3, 1.0);
      tctx.stroke();
    }

    const brandTex = new THREE.CanvasTexture(textCanvas);

    // ── GLASS PLANE (pre-shatter state) ──
    const aspect = TC / TH_c;
    const PW = 14, PH = PW / aspect;
    const glassGeo = new THREE.PlaneGeometry(PW, PH);
    const glassMat = new THREE.MeshStandardMaterial({
      map: brandTex, transparent: true, opacity: 0,
      roughness: 0.08, metalness: 0.9,
      envMapIntensity: 1.2,
    });
    const glassPlane = new THREE.Mesh(glassGeo, glassMat);
    scene.add(glassPlane);

    // ── BUILD SHARDS ──
    // Poisson-disk-like set of Voronoi seed points
    const SHARD_COUNT = 64;
    const seeds: { x: number; y: number }[] = [];
    // first seed = center (impact point)
    seeds.push({ x: 0, y: 0 });
    for (let i = 1; i < SHARD_COUNT; i++) {
      seeds.push({
        x: randRange(-PW / 2, PW / 2),
        y: randRange(-PH / 2, PH / 2),
      });
    }

    // For each shard, approximate its cell with a small convex polygon
    // by finding which seed is nearest at a set of angular samples
    const makeShardGeo = (seed: { x: number; y: number }) => {
      const ANGLES  = 14;
      const pts: THREE.Vector2[] = [];

      for (let a = 0; a < ANGLES; a++) {
        const angle = (a / ANGLES) * Math.PI * 2;
        let minDist = Infinity, best = 0;
        // ray march to find Voronoi boundary
        for (let r = 0.05; r < 6; r += 0.05) {
          const tx = seed.x + Math.cos(angle) * r;
          const ty = seed.y + Math.sin(angle) * r;
          // find nearest seed
          let nearDist = Infinity, nearIdx = -1;
          seeds.forEach((s, si) => {
            const d = (tx - s.x) ** 2 + (ty - s.y) ** 2;
            if (d < nearDist) { nearDist = d; nearIdx = si; }
          });
          if (nearIdx !== seeds.indexOf(seed)) {
            // boundary found — clip to plane bounds
            const bx = Math.max(-PW / 2, Math.min(PW / 2, tx));
            const by = Math.max(-PH / 2, Math.min(PH / 2, ty));
            pts.push(new THREE.Vector2(bx, by));
            break;
          }
        }
      }

      if (pts.length < 3) return null;
      const shape = new THREE.Shape(pts);
      return new THREE.ShapeGeometry(shape);
    };

    const shards: Shard[] = [];

    seeds.forEach((seed) => {
      const geo = makeShardGeo(seed);
      if (!geo) return;

      // UV calculation for texture sampling at shard position
      const uOff = (seed.x + PW / 2) / PW;
      const vOff = (seed.y + PH / 2) / PH;

      // glass shard material — semi-transparent with iridescent tint
      const hue    = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const mat = new THREE.MeshStandardMaterial({
        color:    new THREE.Color(hue),
        emissive: new THREE.Color(hue),
        emissiveIntensity: 0.12,
        transparent: true,
        opacity: 0,
        roughness: 0.05,
        metalness: 0.85,
        side: THREE.DoubleSide,
        wireframe: false,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0, 0);
      mesh.renderOrder = 1;
      scene.add(mesh);

      // explosion velocity — away from impact point with angular bias
      const angle  = Math.atan2(seed.y - 0, seed.x - 0) + randRange(-0.4, 0.4);
      const speed  = randRange(0.08, 0.32);
      const vel    = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed + randRange(0, 0.05),
        randRange(-0.15, 0.15),
      );

      shards.push({
        mesh,
        vel,
        rotVel: new THREE.Vector3(
          randRange(-0.04, 0.04),
          randRange(-0.06, 0.06),
          randRange(-0.08, 0.08),
        ),
        lifespan: randRange(120, 220),
        age: 0,
      });
    });

    // ── PHASE CONTROLLER ──
    // Phase 0: fade in glass (0–60f)
    // Phase 1: hold glass (60–120f)
    // Phase 2: SHATTER — show shards, hide glass (120–140f)
    // Phase 3: shards fly out (140–320f)
    // Phase 4: done — call onDone
    let frame = 0, animId: number;
    let phase = 0;
    let doneCalled = false;

    const onResize = () => {
      if (!el) return;
      W = el.clientWidth; H = el.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener("resize", onResize);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      frame++;

      if (phase === 0) {
        // fade in glass plane
        const p = Math.min(frame / 60, 1);
        glassMat.opacity = p * 0.92;
        if (frame >= 60) { phase = 1; }
      }
      else if (phase === 1) {
        // subtle breathing — glass glows
        glassMat.opacity = 0.92 + Math.sin(frame * 0.08) * 0.05;
        if (frame >= 120) {
          phase = 2;
          // make all shards visible
          shards.forEach(s => {
            (s.mesh.material as THREE.MeshStandardMaterial).opacity = 0.82;
          });
          glassMat.opacity = 0;
          glassPlane.visible = false;
        }
      }
      else if (phase >= 2) {
        // physics — gravity + damping
        shards.forEach(s => {
          s.age++;
          s.vel.y  -= 0.0025;            // gravity
          s.vel.multiplyScalar(0.994);   // air resistance
          s.mesh.position.add(s.vel);
          s.mesh.rotation.x += s.rotVel.x;
          s.mesh.rotation.y += s.rotVel.y;
          s.mesh.rotation.z += s.rotVel.z;

          // fade out over lifespan
          const mat = s.mesh.material as THREE.MeshStandardMaterial;
          mat.opacity = Math.max(0, 0.85 * (1 - s.age / s.lifespan));
        });

        // tiny residual sparkles on first few frames of explosion
        if (phase === 2 && frame - 120 < 30) {
          fill.intensity = 8 * (1 - (frame - 120) / 30);
        } else {
          fill.intensity = Math.max(0, fill.intensity - 0.06);
        }

        // call done when all shards faded
        if (!doneCalled && frame > 280) {
          doneCalled = true;
          onDone();
        }

        // slow camera drift after explosion
        camera.position.x = Math.sin((frame - 120) * 0.005) * 0.8;
        camera.position.y = Math.cos((frame - 120) * 0.004) * 0.4;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [onDone]);

  return (
    <div ref={mountRef} style={{ position: "absolute", inset: 0, zIndex: 5 }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAGNETIC CURSOR
// ─────────────────────────────────────────────────────────────────────────────
function MagneticOrb() {
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const sx = useSpring(mx, { stiffness: 55, damping: 16 });
  const sy = useSpring(my, { stiffness: 55, damping: 16 });
  useEffect(() => {
    const fn = (e: MouseEvent) => { mx.set(e.clientX - 220); my.set(e.clientY - 220); };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, [mx, my]);
  return (
    <motion.div style={{ x: sx, y: sy, position: "fixed", top: 0, left: 0, width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle, rgba(250,204,21,0.055) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WORD SLIDE REVEAL
// ─────────────────────────────────────────────────────────────────────────────
function SlideWord({ children, delay, color = "white", size, outline = false }: {
  children: string; delay: number; color?: string; size: string; outline?: boolean;
}) {
  return (
    <div style={{ overflow: "hidden", lineHeight: 0.88 }}>
      <motion.div
        initial={{ y: "108%", skewY: 3 }}
        animate={{ y: "0%",   skewY: 0 }}
        transition={{ duration: 0.82, delay, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: size,
          letterSpacing: "0.01em",
          color: outline ? "transparent" : color,
          WebkitTextStroke: outline ? `2px ${color}` : "none",
          display: "block",
          userSelect: "none",
          textShadow: !outline && color === "#facc15" ? "0 0 80px rgba(250,204,21,0.4)" : "none",
        }}
      >{children}</motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function HeroV14() {
  const [shatterDone, setShatterDone] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY      = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);

  return (
    <section id="hero" ref={heroRef}
      style={{ minHeight: "100dvh", position: "relative", background: "#050507", overflow: "hidden", display: "flex", flexDirection: "column" }}>

      {/* ── BG LAYERS ── */}
      <MagneticOrb />

      {/* noise grain */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.5, zIndex: 0, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E")`,
        backgroundSize: "160px" }} />

      {/* subtle grid */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px)`,
        backgroundSize: "80px 80px" }} />

      {/* radial warm center */}
      <motion.div style={{ y: bgY, position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(236,91,19,0.08) 0%, rgba(250,204,21,0.04) 35%, transparent 68%)" }} />

      {/* nav spacer */}
      <div style={{ height: "80px", flexShrink: 0, position: "relative", zIndex: 20 }} />

      {/* ── THREE.JS SHATTER — overlay, disappears after done ── */}
      <AnimatePresence>
        {!shatterDone && (
          <motion.div
            key="shatter"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ position: "absolute", inset: 0, zIndex: 30 }}
          >
            <ShatterCanvas onDone={() => setTimeout(() => setShatterDone(true), 200)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT — always mounted, fades in after shatter ── */}
      <motion.div
        style={{ y: contentY }}
        animate={shatterDone ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="v14-content"
      >
        <div style={{
          flex: 1, position: "relative", zIndex: 10,
          display: "flex", flexDirection: "column",
          padding: "clamp(16px,5vw,64px) clamp(20px,5vw,64px)",
          gap: "clamp(16px,2.5vw,28px)",
          minHeight: "calc(92dvh - 80px)",
          justifyContent: "center",
        }}>
          {/* top badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={shatterDone ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px", borderRadius: "3px", background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.22)", alignSelf: "flex-start" }}
          >
            <motion.div animate={{ opacity: [1,0.2,1] }} transition={{ duration: 1, repeat: Infinity }}
              style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#facc15", boxShadow: "0 0 8px #facc15" }} />
            <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, color: "#facc15", letterSpacing: "0.2em" }}>
              INDIA'S MEME AMPLIFICATION NETWORK
            </span>
          </motion.div>

          {/* headline stack */}
          <div>
            <SlideWord delay={0.05} color="rgba(255,255,255,0.22)" outline size="clamp(28px,5vw,72px)">WE ARE</SlideWord>
            <SlideWord delay={0.14} color="#facc15"                size="clamp(68px,13.5vw,186px)">MEME</SlideWord>
            <SlideWord delay={0.23} color="white"                  size="clamp(44px,8.5vw,118px)">AMPLIFICATION</SlideWord>
            <SlideWord delay={0.32} color="#ec5b13"                size="clamp(52px,10vw,140px)">NETWORK</SlideWord>
          </div>

          {/* two-col bottom */}
          <div className="v14-bottom" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(24px,5vw,72px)", alignItems: "end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(14px,2vw,24px)" }}>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={shatterDone ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.55 }}
                style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "clamp(13px,1.2vw,17px)", color: "rgba(255,255,255,0.38)", maxWidth: "440px", lineHeight: 1.7, margin: 0 }}
              >
                500+ verified meme pages. Brief in. Live in 48 hours.{" "}
                <span style={{ color: "rgba(255,255,255,0.72)", fontWeight: 600 }}>Zero bots. Zero fakes. India-dense, worldwide reach.</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={shatterDone ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.68 }}
                style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
              >
                <motion.a href="#for-brands"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 56px rgba(250,204,21,0.55)" }}
                  whileTap={{ scale: 0.97 }}
                  style={{ display: "inline-flex", alignItems: "center", gap: "9px", padding: "clamp(12px,1.4vw,15px) clamp(22px,2.8vw,38px)", borderRadius: "8px", fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(15px,1.7vw,19px)", letterSpacing: "0.1em", textDecoration: "none", background: "#facc15", color: "#050507", boxShadow: "0 0 32px rgba(250,204,21,0.2)", position: "relative", overflow: "hidden" }}>
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

            {/* stats */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={shatterDone ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.72 }}
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(10px,2vw,20px)" }}
            >
              {[
                { v: "500+",  l: "Verified Pages",  c: "#facc15" },
                { v: "25M+",  l: "Combined Reach",  c: "#ec5b13" },
                { v: "48hr",  l: "Brief → Live",    c: "#4ade80" },
                { v: "0",     l: "Bots or Fakes",   c: "#38bdf8" },
              ].map((s, i) => (
                <motion.div key={s.l}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={shatterDone ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.78 + i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
                  style={{ padding: "clamp(10px,1.5vw,16px)", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${s.c}22`, textAlign: "center" }}
                >
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(22px,3vw,36px)", color: s.c, lineHeight: 1, letterSpacing: "0.04em", textShadow: `0 0 24px ${s.c}50` }}>{s.v}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "clamp(7px,0.7vw,9px)", color: "rgba(255,255,255,0.25)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: "4px" }}>{s.l}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* bottom tape — always visible */}
      <div style={{ position: "relative", zIndex: 20, overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}>
        <style>{`
          @keyframes v14t  { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
          @keyframes v14tr { 0%{transform:translateX(-50%)} 100%{transform:translateX(0)} }
          .v14a { display:flex; width:max-content; animation:v14t  26s linear infinite; padding:9px 0; }
          .v14b { display:flex; width:max-content; animation:v14tr 32s linear infinite; padding:8px 0; border-top:1px solid rgba(255,255,255,0.04); background:rgba(250,204,21,0.03); }
        `}</style>
        <div className="v14a">
          {[...Array(2)].flatMap((_, j) => ["ROBOROFL","·","MEME AMPLIFICATION NETWORK","·","500+ PAGES","·","INDIA & WORLDWIDE","·","48HR CAMPAIGNS","·","ZERO BOTS","·"].map((w,i) => (
            <span key={`${j}-${i}`} style={{ fontFamily:w==="ROBOROFL"?"'Bebas Neue',sans-serif":"monospace", fontSize:w==="ROBOROFL"?"clamp(13px,1.5vw,18px)":"clamp(9px,1vw,11px)", letterSpacing:"0.16em", color:w==="·"?"#facc15":w==="ROBOROFL"?"rgba(255,255,255,0.4)":"rgba(255,255,255,0.14)", padding:"0 18px", whiteSpace:"nowrap" }}>{w}</span>
          )))}
        </div>
        <div className="v14b">
          {[...Array(2)].flatMap((_, j) => ["BRANDS","·","AGENCIES","·","BOLLYWOOD","·","CREATORS","·","PODCASTS","·","POLITICIANS","·","D2C","·"].map((w,i) => (
            <span key={`${j}-${i}`} style={{ fontFamily:"monospace", fontSize:"clamp(9px,1vw,11px)", letterSpacing:"0.18em", color:w==="·"?"#ec5b13":"rgba(255,255,255,0.13)", padding:"0 18px", whiteSpace:"nowrap", fontWeight:700 }}>{w}</span>
          )))}
        </div>
      </div>

      <style>{`
        .v14-content { flex:1; display:flex; flex-direction:column; position:relative; z-index:10; }
        @media (max-width:860px) { .v14-bottom { grid-template-columns:1fr !important; } }
      `}</style>
    </section>
  );
}