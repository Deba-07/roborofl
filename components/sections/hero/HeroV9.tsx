"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// THREE.JS — GEOGRAPHIC DOT GLOBE
// Uses real lat/long for India + world distribution
// ─────────────────────────────────────────────────────────────────────────────

// Dense cluster in India region + sparse world distribution
const GEO_CLUSTERS = [
  // India cluster — lat 8–37, lon 68–97 (many dots)
  ...Array.from({ length: 280 }, () => ({
    lat: 8  + Math.random() * 29,
    lon: 68 + Math.random() * 29,
    color: Math.random() > 0.6 ? "#facc15" : Math.random() > 0.5 ? "#ec5b13" : "#ffffff",
    size: 0.8 + Math.random() * 1.4,
    isIndia: true,
  })),
  // SE Asia
  ...Array.from({ length: 40 }, () => ({
    lat: -10 + Math.random() * 40, lon: 95 + Math.random() * 40,
    color: "#38bdf8", size: 0.5 + Math.random(), isIndia: false,
  })),
  // UK / Europe
  ...Array.from({ length: 45 }, () => ({
    lat: 35 + Math.random() * 25, lon: -10 + Math.random() * 40,
    color: "#a78bfa", size: 0.5 + Math.random(), isIndia: false,
  })),
  // Middle East / Gulf
  ...Array.from({ length: 35 }, () => ({
    lat: 15 + Math.random() * 25, lon: 35 + Math.random() * 30,
    color: "#4ade80", size: 0.5 + Math.random(), isIndia: false,
  })),
  // North America
  ...Array.from({ length: 50 }, () => ({
    lat: 25 + Math.random() * 30, lon: -130 + Math.random() * 60,
    color: "#f472b6", size: 0.5 + Math.random(), isIndia: false,
  })),
  // Australia
  ...Array.from({ length: 25 }, () => ({
    lat: -40 + Math.random() * 30, lon: 115 + Math.random() * 35,
    color: "#4ade80", size: 0.5 + Math.random(), isIndia: false,
  })),
  // Rest of world
  ...Array.from({ length: 45 }, () => ({
    lat: -60 + Math.random() * 120, lon: -180 + Math.random() * 360,
    color: "#ffffff", size: 0.3 + Math.random() * 0.5, isIndia: false,
  })),
];

function latLonToXYZ(lat: number, lon: number, r: number) {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return {
    x:  r * Math.sin(phi) * Math.cos(theta),
    y:  r * Math.cos(phi),
    z: -r * Math.sin(phi) * Math.sin(theta),
  };
}

function Globe() {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ nx: 0, ny: 0 }); // normalized -1..1

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
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 200);
    camera.position.z = 5.5;

    const R = 1.8; // globe radius

    // ── ghost wireframe sphere ──
    const wireGeo = new THREE.SphereGeometry(R, 32, 32);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.025 });
    scene.add(new THREE.Mesh(wireGeo, wireMat));

    // ── particles ──
    const N = GEO_CLUSTERS.length;
    const positions = new Float32Array(N * 3);
    const basePos   = new Float32Array(N * 3);
    const colors    = new Float32Array(N * 3);
    const sizes     = new Float32Array(N);
    const isIndia   = new Float32Array(N);

    GEO_CLUSTERS.forEach((g, i) => {
      const { x, y, z } = latLonToXYZ(g.lat, g.lon, R);
      positions[i*3] = basePos[i*3] = x;
      positions[i*3+1] = basePos[i*3+1] = y;
      positions[i*3+2] = basePos[i*3+2] = z;
      const c = new THREE.Color(g.color);
      colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
      sizes[i] = g.size;
      isIndia[i] = g.isIndia ? 1 : 0;
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color",    new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("aSize",    new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: renderer.getPixelRatio() } },
      vertexShader: `
        attribute float aSize;
        varying vec3 vColor;
        varying float vDist;
        uniform float uTime;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vDist = -mv.z;
          // pulsing India dots
          float pulse = 1.0 + 0.18 * sin(uTime * 2.0 + position.x * 8.0 + position.y * 6.0);
          gl_PointSize = aSize * pulse * (220.0 / -mv.z) * uPixelRatio;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vDist;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float alpha = smoothstep(0.5, 0.1, d) * 0.92;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // ── arc lines between India and world cities ──
    const arcColors = ["#facc15","#ec5b13","#38bdf8","#4ade80","#a78bfa"];
    const arcGroup  = new THREE.Group();
    const worldPairs = [
      { fromLat: 28.6, fromLon: 77.2, toLat: 51.5, toLon: -0.1 },   // Delhi → London
      { fromLat: 19.0, fromLon: 72.8, toLat: 25.2, toLon: 55.3 },   // Mumbai → Dubai
      { fromLat: 13.1, fromLon: 80.3, toLat: 1.35, toLon: 103.8 },  // Chennai → Singapore
      { fromLat: 22.6, fromLon: 88.4, toLat: 40.7, toLon: -74.0 },  // Kolkata → NYC
      { fromLat: 12.9, fromLon: 77.6, toLat: -33.9,toLon: 151.2 },  // Bangalore → Sydney
    ];
    worldPairs.forEach((pair, pi) => {
      const from = latLonToXYZ(pair.fromLat, pair.fromLon, R);
      const to   = latLonToXYZ(pair.toLat,   pair.toLon,   R);
      const mid  = { x: (from.x + to.x) * 0.5, y: (from.y + to.y) * 0.5 + 0.6, z: (from.z + to.z) * 0.5 };
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(from.x, from.y, from.z),
        new THREE.Vector3(mid.x, mid.y, mid.z),
        new THREE.Vector3(to.x, to.y, to.z),
      );
      const arcPts = curve.getPoints(48);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPts);
      const arcMat = new THREE.LineBasicMaterial({ color: arcColors[pi % arcColors.length], transparent: true, opacity: 0.4 });
      arcGroup.add(new THREE.Line(arcGeo, arcMat));
    });
    scene.add(arcGroup);

    // ── orbit ring around equator ──
    const ringGeo = new THREE.TorusGeometry(R * 1.12, 0.003, 4, 128);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.12 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.2;
    scene.add(ringMesh);

    // mouse handler
    const onMouse = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseRef.current = {
        nx:  ((e.clientX - rect.left) / rect.width)  * 2 - 1,
        ny: -((e.clientY - rect.top)  / rect.height) * 2 + 1,
      };
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      const rect = el.getBoundingClientRect();
      mouseRef.current = {
        nx: ((t.clientX - rect.left) / rect.width) * 2 - 1,
        ny: -((t.clientY - rect.top) / rect.height) * 2 + 1,
      };
    };
    el.addEventListener("mousemove", onMouse);
    el.addEventListener("touchmove", onTouch, { passive: true });

    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // ── animate ──
    let frame = 0, animId: number;
    const targetRot = { y: 0, x: 0 };
    const currentRot = { y: 0, x: 0 };

    const animate = () => {
      animId = requestAnimationFrame(animate);
      frame++;
      const t = frame * 0.004;
      mat.uniforms.uTime.value = t;

      // auto-rotate + mouse tilt
      targetRot.y = t * 0.18 + mouseRef.current.nx * 0.4;
      targetRot.x = mouseRef.current.ny * 0.25;
      currentRot.y += (targetRot.y - currentRot.y) * 0.04;
      currentRot.x += (targetRot.x - currentRot.x) * 0.04;
      points.rotation.y = currentRot.y;
      points.rotation.x = currentRot.x;
      arcGroup.rotation.y = currentRot.y;
      arcGroup.rotation.x = currentRot.x;
      ringMesh.rotation.y = currentRot.y;

      // pulse arc opacity
      arcGroup.children.forEach((child, i) => {
        const l = child as THREE.Line;
        const m = l.material as THREE.LineBasicMaterial;
        m.opacity = 0.25 + 0.25 * Math.sin(t * 1.2 + i * 0.8);
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener("mousemove", onMouse);
      el.removeEventListener("touchmove", onTouch);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// LETTER ASSEMBLE ANIMATION
// Letters fly in from random screen positions
// ─────────────────────────────────────────────────────────────────────────────
function AssembleText({ text, color, delay, fontSize }: {
  text: string; color: string; delay: number; fontSize: string;
}) {
  const [go, setGo] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setGo(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);

  if (!mounted) return (
    <div style={{ display: "flex", flexWrap: "wrap", lineHeight: 0.88, gap: "0.02em", opacity: 0 }}>
      {text.split("").map((ch, i) => (
        <span key={i} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize, color: "transparent", display: "inline-block", width: ch === " " ? "0.25em" : "auto" }}>
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </div>
  );

  return (
    <div style={{ display: "flex", flexWrap: "wrap", lineHeight: 0.88, gap: "0.02em" }}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, x: (Math.random() - 0.5) * 300, y: (Math.random() - 0.5) * 200, rotate: (Math.random() - 0.5) * 60 }}
          animate={go ? { opacity: 1, x: 0, y: 0, rotate: 0 } : {}}
          transition={{ duration: 0.6, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize,
            color: ch === " " ? "transparent" : color,
            display: "inline-block",
            letterSpacing: "0.02em",
            textShadow: color !== "white" && color !== "rgba(255,255,255,0.22)" ? `0 0 60px ${color}50` : "none",
            userSelect: "none",
            width: ch === " " ? "0.25em" : "auto",
          }}
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function HeroV9() {
  return (
    <section id="hero" style={{ minHeight: "100dvh", position: "relative", background: "#040304", overflow: "hidden", display: "flex", flexDirection: "column" }}>

      {/* ── GLOBE — takes right 55% on desktop, full bg on mobile ── */}
      <div className="hv9-globe" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "60%", zIndex: 1 }}>
        <Globe />
        {/* fade left edge so globe blends into content */}
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "40%", background: "linear-gradient(to right, #040304, transparent)", pointerEvents: "none" }} />
      </div>

      {/* full dark overlay on mobile */}
      <div className="hv9-mob-overlay" style={{ display: "none", position: "absolute", inset: 0, background: "rgba(4,3,4,0.78)", zIndex: 2, pointerEvents: "none" }} />

      {/* grain */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.5, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, backgroundSize: "160px", pointerEvents: "none", zIndex: 3 }} />

      {/* nav space */}
      <div style={{ height: "80px", flexShrink: 0 }} />

      {/* ── LEFT CONTENT ── */}
      <div style={{ flex: 1, position: "relative", zIndex: 10, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 clamp(20px,5vw,72px)", maxWidth: "clamp(340px, 52vw, 680px)" }}>

        {/* badge */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 14px", borderRadius: "3px", background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.22)", marginBottom: "clamp(20px,3vw,36px)", alignSelf: "flex-start" }}
        >
          <motion.div animate={{ opacity: [1,0.2,1] }} transition={{ duration: 1, repeat: Infinity }}
            style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#facc15", boxShadow: "0 0 8px #facc15" }} />
          <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, color: "#facc15", letterSpacing: "0.2em" }}>INDIA'S MEME AMPLIFICATION NETWORK</span>
        </motion.div>

        {/* assembling headline */}
        <div style={{ marginBottom: "clamp(16px,2.5vw,28px)" }}>
          <AssembleText text="THE"           color="rgba(255,255,255,0.22)" delay={0.5}  fontSize="clamp(36px,6vw,88px)"   />
          <AssembleText text="MEME"          color="#facc15"                delay={0.9}  fontSize="clamp(68px,12vw,164px)"  />
          <AssembleText text="AMPLIFICATION" color="white"                  delay={1.4}  fontSize="clamp(28px,5vw,68px)"   />
          <AssembleText text="NETWORK"       color="#ec5b13"                delay={1.9}  fontSize="clamp(52px,9.5vw,130px)" />
        </div>

        {/* sub */}
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 2.4 }}
          style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "clamp(13px,1.2vw,17px)", color: "rgba(255,255,255,0.38)", maxWidth: "480px", lineHeight: 1.7, marginBottom: "clamp(20px,3vw,32px)" }}
        >
          Each dot on that globe — a verified meme page.{" "}
          <span style={{ color: "rgba(255,255,255,0.72)", fontWeight: 600 }}>500+ pages. India-dense. Worldwide reach. Live in 48 hours.</span>
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 2.6 }}
          style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "clamp(20px,3vw,36px)" }}
        >
          <motion.a href="#for-brands" whileHover={{ scale: 1.05, boxShadow: "0 0 56px rgba(250,204,21,0.55)" }} whileTap={{ scale: 0.97 }}
            style={{ display: "inline-flex", alignItems: "center", gap: "9px", padding: "clamp(12px,1.4vw,16px) clamp(24px,3vw,40px)", borderRadius: "6px", fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(16px,1.8vw,20px)", letterSpacing: "0.12em", textDecoration: "none", background: "#facc15", color: "#040304", boxShadow: "0 0 32px rgba(250,204,21,0.2)", position: "relative", overflow: "hidden" }}
          >
            <motion.div animate={{ x: ["-120%","120%"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
              style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)", pointerEvents: "none" }} />
            <span style={{ position: "relative" }}>🌍 AMPLIFY MY BRAND</span>
          </motion.a>
          <motion.a href="#for-pages" whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.06)" }} whileTap={{ scale: 0.97 }}
            style={{ display: "inline-flex", alignItems: "center", gap: "9px", padding: "clamp(12px,1.4vw,16px) clamp(20px,2.5vw,32px)", borderRadius: "6px", fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(16px,1.8vw,20px)", letterSpacing: "0.12em", textDecoration: "none", background: "rgba(255,255,255,0)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.18)" }}
          >
            💸 JOIN AS CREATOR
          </motion.a>
        </motion.div>

        {/* stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 2.8 }}
          style={{ display: "flex", gap: "clamp(14px,2.5vw,28px)", flexWrap: "wrap" }}
        >
          {[
            { v: "520",  l: "Pages on Globe",  c: "#facc15" },
            { v: "25M+", l: "Combined Reach",  c: "#ec5b13" },
            { v: "6",    l: "Continents",      c: "#4ade80" },
            { v: "48hr", l: "Go-Live",         c: "#38bdf8" },
          ].map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 2.85 + i * 0.07, ease: [0.34, 1.56, 0.64, 1] }}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(22px,3vw,34px)", color: s.c, lineHeight: 1, letterSpacing: "0.04em", textShadow: `0 0 20px ${s.c}50` }}>{s.v}</span>
              <span style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: "3px" }}>{s.l}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* bottom marquee */}
      <div style={{ position: "relative", zIndex: 10, overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
        <style>{`
          @keyframes g9mq { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
          .g9mq { display:flex; width:max-content; animation:g9mq 32s linear infinite; padding:10px 0; }
        `}</style>
        <div className="g9mq">
          {[...Array(2)].flatMap((_, j) => ["ROBOROFL","·","520 PAGES","·","INDIA-DENSE","·","WORLDWIDE","·","48HR CAMPAIGNS","·","ZERO BOTS","·","Q2 2026","·"].map((w,i)=>(
            <span key={`${j}-${i}`} style={{ fontFamily: w==="ROBOROFL"?"'Bebas Neue',sans-serif":"monospace", fontSize: w==="ROBOROFL"?"clamp(14px,1.6vw,20px)":"clamp(9px,1vw,12px)", letterSpacing:"0.16em", color: w==="·"?"#facc15": w==="ROBOROFL"?"rgba(255,255,255,0.45)":"rgba(255,255,255,0.15)", padding:"0 20px", whiteSpace:"nowrap" }}>{w}</span>
          )))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hv9-globe { width: 100% !important; opacity: 0.35; }
          .hv9-mob-overlay { display: block !important; }
        }
      `}</style>
    </section>
  );
}