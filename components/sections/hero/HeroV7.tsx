"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// THREE.JS CONSTELLATION
// ─────────────────────────────────────────────────────────────────────────────
function Constellation({ count = 520 }: { count?: number }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // ── renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // ── scene / camera ──
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.1, 1000);
    camera.position.z = 28;

    // ── particle positions (sphere distribution) ──
    const positions  = new Float32Array(count * 3);
    const basePos    = new Float32Array(count * 3); // rest positions
    const colors     = new Float32Array(count * 3);
    const sizes      = new Float32Array(count);

    const palette = [
      new THREE.Color("#facc15"),
      new THREE.Color("#ec5b13"),
      new THREE.Color("#4ade80"),
      new THREE.Color("#38bdf8"),
      new THREE.Color("#a78bfa"),
      new THREE.Color(0xffffff),
    ];

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 10 + Math.random() * 8;
      const x     = r * Math.sin(phi) * Math.cos(theta);
      const y     = r * Math.sin(phi) * Math.sin(theta);
      const z     = r * Math.cos(phi);
      positions[i*3]   = basePos[i*3]   = x;
      positions[i*3+1] = basePos[i*3+1] = y;
      positions[i*3+2] = basePos[i*3+2] = z;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i*3]   = c.r;
      colors[i*3+1] = c.g;
      colors[i*3+2] = c.b;
      sizes[i] = 0.5 + Math.random() * 1.8;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position",  new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color",     new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("size",      new THREE.BufferAttribute(sizes, 1));

    // ── shader material for round glowing dots ──
    const mat = new THREE.ShaderMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float uTime;
        void main() {
          vColor = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (280.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.15, 0.5, d);
          gl_FragColor = vec4(vColor, alpha * 0.88);
        }
      `,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // ── connection lines ──
    const MAX_LINES = 900;
    const linePts  = new Float32Array(MAX_LINES * 2 * 3);
    const lineAlph = new Float32Array(MAX_LINES * 2);
    const lineGeo  = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePts, 3));
    lineGeo.setAttribute("alpha",    new THREE.BufferAttribute(lineAlph, 1));
    const lineMat  = new THREE.LineBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.06, depthWrite: false,
    });
    const lines    = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    // ── mouse repulsion ──
    const raycaster = new THREE.Raycaster();
    const mouse3d   = new THREE.Vector2();

    const onMouse = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseRef.current = {
        x:  ((e.clientX - rect.left)  / rect.width)  * 2 - 1,
        y: -((e.clientY - rect.top)   / rect.height) * 2 + 1,
      };
    };
    el.addEventListener("mousemove", onMouse);

    // ── resize ──
    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // ── animation loop ──
    let frame = 0;
    let animId: number;

    const tmpVec = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      frame++;
      const t = frame * 0.004;
      mat.uniforms.uTime.value = t;

      // slow rotation
      points.rotation.y = t * 0.12;
      points.rotation.x = t * 0.05;
      lines.rotation.y  = t * 0.12;
      lines.rotation.x  = t * 0.05;

      // mouse repulsion in world space
      mouse3d.set(mouseRef.current.x, mouseRef.current.y);
      raycaster.setFromCamera(mouse3d, camera);
      const plane  = new THREE.Plane(new THREE.Vector3(0, 0, 1), -camera.position.z * 0.3);
      const hitPt  = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, hitPt);

      const pos = geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < count; i++) {
        const bx = basePos[i*3], by = basePos[i*3+1], bz = basePos[i*3+2];
        tmpVec.set(bx, by, bz).applyMatrix4(points.matrixWorld);
        const dx = tmpVec.x - hitPt.x;
        const dy = tmpVec.y - hitPt.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const repel = Math.max(0, 1 - dist / 5) * 2.2;
        const nx = bx + (dist > 0 ? (dx/dist)*repel : 0);
        const ny = by + (dist > 0 ? (dy/dist)*repel : 0);
        // lerp back
        pos.array[i*3]   += (nx - pos.array[i*3])   * 0.08;
        pos.array[i*3+1] += (ny - pos.array[i*3+1]) * 0.08;
        pos.array[i*3+2] += (bz - pos.array[i*3+2]) * 0.08;
      }
      pos.needsUpdate = true;

      // rebuild connection lines (sample subset for perf)
      let lineIdx = 0;
      const LP = lineGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < count && lineIdx < MAX_LINES; i += 2) {
        for (let j = i + 1; j < count && lineIdx < MAX_LINES; j += 3) {
          const dx2 = pos.array[i*3]   - pos.array[j*3];
          const dy2 = pos.array[i*3+1] - pos.array[j*3+1];
          const dz2 = pos.array[i*3+2] - pos.array[j*3+2];
          const d2  = dx2*dx2 + dy2*dy2 + dz2*dz2;
          if (d2 < 9) {
            LP.array[lineIdx*6]   = pos.array[i*3];
            LP.array[lineIdx*6+1] = pos.array[i*3+1];
            LP.array[lineIdx*6+2] = pos.array[i*3+2];
            LP.array[lineIdx*6+3] = pos.array[j*3];
            LP.array[lineIdx*6+4] = pos.array[j*3+1];
            LP.array[lineIdx*6+5] = pos.array[j*3+2];
            lineIdx++;
          }
        }
      }
      lineGeo.setDrawRange(0, lineIdx * 2);
      LP.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [count]);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLLING WORD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const ROLES = ["BRANDS", "AGENCIES", "CREATORS", "BOLLYWOOD", "PODCASTS", "POLITICIANS"];

function RollingWord() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(p => (p + 1) % ROLES.length), 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ display: "inline-block", overflow: "hidden", height: "1em", verticalAlign: "bottom" }}>
      <AnimatePresence mode="wait">
        <motion.span key={idx}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y:   "0%", opacity: 1 }}
          exit={{   y: "-100%", opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "block", color: "#facc15", textShadow: "0 0 40px rgba(250,204,21,0.4)" }}
        >{ROLES[idx]}</motion.span>
      </AnimatePresence>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT PILL
// ─────────────────────────────────────────────────────────────────────────────
function StatPill({ val, label, color, delay }: { val: string; label: string; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.85 }}
      animate={{ opacity: 1, y:  0, scale: 1    }}
      transition={{ duration: 0.5, delay, ease: [0.34, 1.56, 0.64, 1] }}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "14px 20px", borderRadius: "14px",
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${color}25`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        minWidth: "80px",
      }}
    >
      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(22px,3vw,32px)", color, lineHeight: 1, letterSpacing: "0.04em", textShadow: `0 0 20px ${color}50` }}>{val}</span>
      <span style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: "4px" }}>{label}</span>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function HeroV7() {
  return (
    <section id="hero" style={{ minHeight: "100dvh", position: "relative", background: "#060508", overflow: "hidden", display: "flex", flexDirection: "column" }}>

      {/* THREE.JS canvas fills entire bg */}
      <Constellation count={520} />

      {/* subtle vignette so text is legible */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(6,5,8,0.75) 75%)", pointerEvents: "none", zIndex: 1 }} />

      {/* noise grain */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.4, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E")`, backgroundSize: "160px", pointerEvents: "none", zIndex: 1 }} />

      {/* ── NAV SPACE ── */}
      <div style={{ height: "80px", flexShrink: 0 }} />

      {/* ── CONTENT ── */}
      <div style={{
        flex: 1, position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center",
        padding: "0 clamp(16px,5vw,48px)",
        gap: "clamp(20px,3.5vw,36px)",
      }}>

        {/* badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "9999px", background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.22)" }}
        >
          <motion.div animate={{ opacity: [1,0.2,1] }} transition={{ duration: 1.1, repeat: Infinity }}
            style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#facc15", boxShadow: "0 0 10px #facc15" }} />
          <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, color: "#facc15", letterSpacing: "0.2em" }}>
            {520} PAGES IN THE CONSTELLATION
          </span>
        </motion.div>

        {/* headline */}
        <div>
          {/* line 1 */}
          <div style={{ overflow: "hidden" }}>
            <motion.div
              initial={{ y: "108%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px,12vw,164px)", lineHeight: 0.88, color: "white", letterSpacing: "0.01em", userSelect: "none" }}
            >
              THE NETWORK
            </motion.div>
          </div>
          {/* line 2 — outlined */}
          <div style={{ overflow: "hidden" }}>
            <motion.div
              initial={{ y: "108%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px,12vw,164px)", lineHeight: 0.88, color: "transparent", WebkitTextStroke: "2px rgba(255,255,255,0.28)", letterSpacing: "0.01em", userSelect: "none" }}
            >
              BUILT FOR
            </motion.div>
          </div>
          {/* line 3 — rolling */}
          <div style={{ overflow: "hidden" }}>
            <motion.div
              initial={{ y: "108%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px,12vw,164px)", lineHeight: 0.88, userSelect: "none" }}
            >
              <RollingWord />
            </motion.div>
          </div>
        </div>

        {/* sub */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.62 }}
          style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "clamp(14px,1.3vw,18px)", color: "rgba(255,255,255,0.38)", maxWidth: "540px", lineHeight: 1.68 }}
        >
          Every dot above is a meme page. Every connection is a campaign.{" "}
          <span style={{ color: "rgba(255,255,255,0.72)", fontWeight: 600 }}>500+ verified. India & worldwide.</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.74 }}
          style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}
        >
          <motion.a href="#for-brands"
            whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(250,204,21,0.55)" }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "9px",
              padding: "clamp(12px,1.5vw,16px) clamp(24px,3vw,40px)",
              borderRadius: "10px",
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(16px,1.8vw,20px)",
              letterSpacing: "0.12em",
              textDecoration: "none",
              background: "#facc15", color: "#060508",
              boxShadow: "0 0 40px rgba(250,204,21,0.22)",
              position: "relative", overflow: "hidden",
            }}
          >
            <motion.div animate={{ x: ["-120%","120%"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
              style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.32),transparent)", pointerEvents: "none" }} />
            <span style={{ position: "relative" }}>🔥 AMPLIFY MY BRAND</span>
          </motion.a>
          <motion.a href="#for-pages"
            whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.06)" }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "9px",
              padding: "clamp(12px,1.5vw,16px) clamp(20px,2.5vw,32px)",
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.85 }}
          style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}
        >
          {[
            { val: "500+",  label: "Pages",     color: "#facc15" },
            { val: "25M+",  label: "Reach",     color: "#ec5b13" },
            { val: "48hr",  label: "Go-Live",   color: "#4ade80" },
            { val: "12",    label: "Categories",color: "#38bdf8" },
            { val: "0",     label: "Bots",      color: "#a78bfa" },
          ].map((s, i) => <StatPill key={s.label} {...s} delay={0.9 + i * 0.06} />)}
        </motion.div>
      </div>

      {/* bottom tape */}
      <div style={{ position: "relative", zIndex: 10, overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <style>{`
          @keyframes tape7 { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
          .tape7 { display:flex; width:max-content; animation:tape7 30s linear infinite; padding: 10px 0; }
        `}</style>
        <div className="tape7">
          {[...Array(2)].flatMap((_, j) =>
            ["ROBOROFL","·","MEME AMPLIFICATION NETWORK","·","WORLDWIDE","·","500+ PAGES","·","Q2 2026 LAUNCH","·"].map((w, i) => (
              <span key={`${j}-${i}`} style={{ fontFamily: w === "ROBOROFL" ? "'Bebas Neue',sans-serif" : "monospace", fontSize: w === "ROBOROFL" ? "clamp(14px,1.6vw,20px)" : "clamp(9px,1vw,12px)", letterSpacing: "0.16em", color: w === "·" ? "#facc15" : w === "ROBOROFL" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.16)", padding: "0 20px", whiteSpace: "nowrap", fontWeight: w === "ROBOROFL" ? undefined : 700 }}>{w}</span>
            ))
          )}
        </div>
      </div>
    </section>
  );
}