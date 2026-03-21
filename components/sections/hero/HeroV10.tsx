"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────────
// THREE.JS — CRT SHADER PLANE
// Full-screen post-processing shader: scanlines, chromatic aberration, vignette
// ─────────────────────────────────────────────────────────────────────────────

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = `
uniform float uTime;
uniform vec2  uRes;
varying vec2 vUv;

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;

  // barrel distortion — CRT curve
  vec2 dc = uv - 0.5;
  float r2 = dot(dc, dc);
  uv = uv + dc * r2 * 0.08;

  // chromatic aberration
  float ca = 0.0012 + 0.001 * sin(uTime * 0.7);
  float r = 0.18 + rand(vec2(uTime * 0.01)) * 0.02;  // base luminance
  float g = 0.14;
  float b = 0.06;

  // slight horizontal shift per channel
  vec2 uvR = uv + vec2( ca, 0.0);
  vec2 uvB = uv + vec2(-ca, 0.0);

  // phosphor glow — radial
  float glow = 1.0 - length(dc) * 1.8;
  glow = max(0.0, glow);
  glow = pow(glow, 1.4);

  // scanlines
  float scan = sin(uv.y * uRes.y * 1.6 + uTime * 0.0) * 0.5 + 0.5;
  scan = pow(scan, 1.8);
  float scanLine = mix(0.72, 1.0, scan);

  // rolling interference band
  float band = abs(sin(uv.y * 3.14159 - uTime * 0.4));
  band = smoothstep(0.88, 1.0, band) * 0.06;

  // noise grain
  float grain = rand(uv + fract(uTime * 0.07)) * 0.04;

  // compose
  vec3 col = vec3(
    (r + 0.08 * glow) * scanLine,
    (g + 0.06 * glow) * scanLine,
    (b + 0.04 * glow) * scanLine
  );
  col += grain;
  col += band;

  // vignette
  float vig = glow * 0.6 + 0.4;
  col *= vig;

  // outside barrel → black
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) col = vec3(0.0);

  gl_FragColor = vec4(col, 0.88);
}
`;

function CRTShader() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(1); // intentionally low for CRT feel
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uRes:  { value: new THREE.Vector2(el.clientWidth, el.clientHeight) },
      },
    });
    scene.add(new THREE.Mesh(geo, mat));

    const onResize = () => {
      if (!el) return;
      renderer.setSize(el.clientWidth, el.clientHeight);
      mat.uniforms.uRes.value.set(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    let animId: number;
    const start = Date.now();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      mat.uniforms.uTime.value = (Date.now() - start) * 0.001;
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

  return <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNAL METER (vertical bars like a VU meter)
// ─────────────────────────────────────────────────────────────────────────────
function SignalMeter() {
  const [bars, setBars] = useState<number[]>(Array(12).fill(0));

  useEffect(() => {
    const id = setInterval(() => {
      setBars(prev => prev.map((_, i) =>
        Math.max(0.08, prev[i] * 0.7 + Math.random() * 0.6)
      ));
    }, 80);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", height: "clamp(40px,6vw,72px)" }}>
      {bars.map((h, i) => {
        const hue = i < 4 ? "#4ade80" : i < 9 ? "#facc15" : "#ec5b13";
        return (
          <div key={i} style={{
            width: "clamp(3px,0.5vw,6px)",
            height: `${Math.min(1, h) * 100}%`,
            background: hue,
            borderRadius: "2px 2px 0 0",
            boxShadow: `0 0 6px ${hue}80`,
            transition: "height 0.08s ease-out",
          }} />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GLITCH TEXT (severe RGB split on trigger)
// ─────────────────────────────────────────────────────────────────────────────
function GlitchWord({ text, color, trigger }: { text: string; color: string; trigger: boolean }) {
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ color: trigger ? "transparent" : color }}>{text}</span>
      {trigger && (
        <>
          <span style={{ position: "absolute", inset: 0, color: "#ff2020", clipPath: "inset(15% 0 60% 0)", transform: "translateX(-6px) skewX(-3deg)" }}>{text}</span>
          <span style={{ position: "absolute", inset: 0, color: "#00ffff", clipPath: "inset(55% 0 10% 0)", transform: "translateX(6px)" }}>{text}</span>
          <span style={{ position: "absolute", inset: 0, color, clipPath: "inset(30% 0 35% 0)", transform: "translateX(2px)" }}>{text}</span>
        </>
      )}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TICKER TAPE (horizontal, inside CRT frame look)
// ─────────────────────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { sym: "HUMOR",    v: "+3.2%", c: "#facc15" },
  { sym: "CRICKET",  v: "+5.1%", c: "#ec5b13" },
  { sym: "BOLLWOOD", v: "+1.8%", c: "#a78bfa" },
  { sym: "FINANCE",  v: "+2.4%", c: "#4ade80" },
  { sym: "AI·SAAS",  v: "+0.9%", c: "#38bdf8" },
  { sym: "GEN·Z",    v: "+6.7%", c: "#facc15" },
  { sym: "POLITICS", v: "+4.3%", c: "#f472b6" },
  { sym: "GLOBAL",   v: "+1.1%", c: "#38bdf8" },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function HeroV10() {
  const [glitching, setGlitching] = useState(false);
  const [booted, setBooted]       = useState(false);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [mounted, setMounted]     = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // boot sequence
  const BOOT_SEQUENCE = [
    "> ROBOROFL BROADCAST SYSTEM v2.0",
    "> LOADING MEME PAGE REGISTRY...",
    "> 520 PAGES VERIFIED ✓",
    "> NETWORK STATUS: ACTIVE",
    "> WORLDWIDE REACH: 25M+ IMPRESSIONS",
    "> CAMPAIGN QUEUE: 14 PENDING",
    "> SYSTEM READY. ENTERING MAIN FEED.",
    "",
  ];

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (i < BOOT_SEQUENCE.length) {
        setBootLines(prev => [...prev, BOOT_SEQUENCE[i]]);
        i++;
      } else {
        clearInterval(id);
        setTimeout(() => setBooted(true), 400);
      }
    }, 200);
    return () => clearInterval(id);
  }, []);

  // periodic glitch
  useEffect(() => {
    if (!booted) return;
    const id = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 180);
    }, 3500 + Math.random() * 2000);
    return () => clearInterval(id);
  }, [booted]);

  return (
    <section id="hero" style={{ minHeight: "100dvh", position: "relative", background: "#030204", overflow: "hidden", display: "flex", flexDirection: "column" }}>

      {/* CRT shader layer */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, mixBlendMode: "screen", opacity: 0.9 }}>
        <CRTShader />
      </div>

      {/* grain */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.45, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`, backgroundSize: "140px", pointerEvents: "none", zIndex: 2 }} />

      {/* nav space */}
      <div style={{ height: "80px", flexShrink: 0 }} />

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, position: "relative", zIndex: 10, display: "flex", flexDirection: "column", padding: "clamp(16px,4vw,56px) clamp(20px,5vw,72px)", gap: "clamp(12px,2vw,24px)", justifyContent: "center" }}>

        {/* ── TOP ROW — signal meter + broadcast badge + ticker ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(16px,3vw,36px)", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: "clamp(12px,2vw,20px)", flexWrap: "wrap" }}>
          <SignalMeter />
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <motion.div animate={{ opacity: [1,0,1] }} transition={{ duration: 0.7, repeat: Infinity }}
              style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#ff2020", boxShadow: "0 0 12px #ff2020" }} />
            <span style={{ fontFamily: "monospace", fontSize: "clamp(9px,1vw,12px)", fontWeight: 700, color: "#ff2020", letterSpacing: "0.22em" }}>ON AIR</span>
          </div>
          <div style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "center" }}>
            <style>{`
              @keyframes tick10 { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
              .tick10 { display:flex; width:max-content; animation:tick10 16s linear infinite; gap:0; }
            `}</style>
            <div className="tick10">
              {[...TICKER_ITEMS,...TICKER_ITEMS].map((t,i)=>(
                <span key={i} style={{ fontFamily:"monospace", fontSize:"clamp(9px,1vw,12px)", padding:"0 clamp(10px,1.5vw,20px)", whiteSpace:"nowrap", color:t.v.startsWith("+")?"#4ade80":"#ff5555", letterSpacing:"0.08em", fontWeight:700 }}>
                  {t.sym} <span style={{ color:t.c }}>{t.v}</span>
                </span>
              ))}
            </div>
          </div>
          <span style={{ fontFamily:"monospace", fontSize:"clamp(9px,1vw,11px)", color:"rgba(255,255,255,0.2)", letterSpacing:"0.12em", flexShrink:0 }}>
            {mounted ? new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}) : "--:--"} IST
          </span>
        </div>

        {/* ── BOOT / MAIN DISPLAY ── */}
        <AnimatePresence mode="wait">
          {!booted ? (
            // BOOT SCREEN
            <motion.div key="boot" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              style={{ fontFamily:"monospace", fontSize:"clamp(11px,1.2vw,14px)", color:"#4ade80", lineHeight:1.9, letterSpacing:"0.06em", padding:"clamp(12px,2vw,24px) 0" }}
            >
              {bootLines.map((l,i) => (
                <motion.div key={i} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.2 }}>
                  {l || "\u00A0"}
                </motion.div>
              ))}
              <motion.span animate={{ opacity:[1,0,1] }} transition={{ duration:0.6, repeat:Infinity }}
                style={{ display:"inline-block", width:"9px", height:"14px", background:"#4ade80", verticalAlign:"middle", marginLeft:"3px" }}
              />
            </motion.div>
          ) : (
            // MAIN HERO CONTENT
            <motion.div key="main" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.5 }}
              style={{ display:"flex", flexDirection:"column", gap:"clamp(12px,2vw,24px)" }}
            >
              {/* headline */}
              <div>
                <div style={{ overflow:"hidden" }}>
                  <motion.div initial={{ y:"108%" }} animate={{ y:"0%" }} transition={{ duration:0.7, delay:0.05, ease:[0.22,1,0.36,1] }}
                    style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:"clamp(28px,5vw,72px)", color:"rgba(255,255,255,0.22)", letterSpacing:"0.02em", lineHeight:0.88, WebkitTextStroke:"1px rgba(255,255,255,0.28)" }}
                  >
                    INDIA'S
                  </motion.div>
                </div>

                <div style={{ overflow:"hidden" }}>
                  <motion.div initial={{ y:"108%" }} animate={{ y:"0%" }} transition={{ duration:0.7, delay:0.12, ease:[0.22,1,0.36,1] }}
                    style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:"clamp(60px,13vw,178px)", color:"#facc15", letterSpacing:"0.01em", lineHeight:0.86, textShadow:"0 0 80px rgba(250,204,21,0.35)", userSelect:"none" }}
                  >
                    <GlitchWord text="MEME" color="#facc15" trigger={glitching} />
                  </motion.div>
                </div>

                <div style={{ overflow:"hidden", display:"flex", alignItems:"flex-end", gap:"clamp(8px,2vw,20px)", flexWrap:"wrap" }}>
                  <motion.div initial={{ y:"108%" }} animate={{ y:"0%" }} transition={{ duration:0.7, delay:0.2, ease:[0.22,1,0.36,1] }}
                    style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:"clamp(44px,9vw,124px)", color:"white", letterSpacing:"0.01em", lineHeight:0.88, userSelect:"none" }}
                  >
                    CULTURE
                  </motion.div>
                  <motion.div initial={{ y:"108%" }} animate={{ y:"0%" }} transition={{ duration:0.7, delay:0.27, ease:[0.22,1,0.36,1] }}
                    style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:"clamp(28px,5vw,72px)", color:"transparent", WebkitTextStroke:"2px rgba(255,255,255,0.3)", letterSpacing:"0.02em", lineHeight:0.88, userSelect:"none" }}
                  >
                    MACHINE
                  </motion.div>
                </div>

                <div style={{ overflow:"hidden" }}>
                  <motion.div initial={{ y:"108%" }} animate={{ y:"0%" }} transition={{ duration:0.7, delay:0.34, ease:[0.22,1,0.36,1] }}
                    style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:"clamp(40px,8vw,110px)", color:"#ec5b13", letterSpacing:"0.01em", lineHeight:0.88, textShadow:"0 0 60px rgba(236,91,19,0.4)", userSelect:"none" }}
                  >
                    <GlitchWord text="NETWORK" color="#ec5b13" trigger={glitching} />
                  </motion.div>
                </div>
              </div>

              {/* bottom row: sub + stats + CTAs */}
              <div className="hv10-bottom" style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:"clamp(20px,4vw,56px)", alignItems:"end" }}>
                <div style={{ display:"flex", flexDirection:"column", gap:"clamp(12px,2vw,20px)" }}>
                  <motion.p initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.45 }}
                    style={{ fontFamily:"'Public Sans', sans-serif", fontSize:"clamp(13px,1.2vw,17px)", color:"rgba(255,255,255,0.38)", maxWidth:"520px", lineHeight:1.7, margin:0 }}
                  >
                    500+ verified meme pages. Brief in. Live in 48 hours.{" "}
                    <span style={{ color:"rgba(255,255,255,0.72)", fontWeight:600 }}>India-dense. Worldwide reach. Zero bots. Ever.</span>
                  </motion.p>

                  <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.54 }}
                    style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}
                  >
                    <motion.a href="#for-brands" whileHover={{ scale:1.05, boxShadow:"0 0 56px rgba(250,204,21,0.55)" }} whileTap={{ scale:0.97 }}
                      style={{ display:"inline-flex", alignItems:"center", gap:"9px", padding:"clamp(11px,1.3vw,15px) clamp(22px,2.8vw,38px)", borderRadius:"6px", fontFamily:"'Bebas Neue', sans-serif", fontSize:"clamp(15px,1.7vw,19px)", letterSpacing:"0.12em", textDecoration:"none", background:"#facc15", color:"#030204", boxShadow:"0 0 32px rgba(250,204,21,0.2)", position:"relative", overflow:"hidden" }}
                    >
                      <motion.div animate={{ x:["-120%","120%"] }} transition={{ duration:2, repeat:Infinity, ease:"easeInOut", repeatDelay:3 }}
                        style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)", pointerEvents:"none" }} />
                      <span style={{ position:"relative" }}>🔥 AMPLIFY MY BRAND</span>
                    </motion.a>
                    <motion.a href="#for-pages" whileHover={{ scale:1.04, background:"rgba(255,255,255,0.06)" }} whileTap={{ scale:0.97 }}
                      style={{ display:"inline-flex", alignItems:"center", gap:"9px", padding:"clamp(11px,1.3vw,15px) clamp(18px,2.2vw,30px)", borderRadius:"6px", fontFamily:"'Bebas Neue', sans-serif", fontSize:"clamp(15px,1.7vw,19px)", letterSpacing:"0.12em", textDecoration:"none", background:"rgba(255,255,255,0)", color:"rgba(255,255,255,0.75)", border:"1px solid rgba(255,255,255,0.18)" }}
                    >
                      💸 JOIN AS CREATOR
                    </motion.a>
                  </motion.div>
                </div>

                {/* stats column */}
                <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.5, delay:0.5 }}
                  className="hv10-stats"
                  style={{ display:"flex", flexDirection:"column", gap:"clamp(10px,1.5vw,16px)", borderLeft:"1px solid rgba(255,255,255,0.08)", paddingLeft:"clamp(16px,3vw,40px)" }}
                >
                  {[
                    { v:"500+", l:"Verified Pages", c:"#facc15" },
                    { v:"25M+", l:"Reach",          c:"#ec5b13" },
                    { v:"48hr", l:"Go-Live",        c:"#4ade80" },
                    { v:"0",    l:"Bots",           c:"#38bdf8" },
                  ].map(s => (
                    <div key={s.l}>
                      <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:"clamp(24px,3.5vw,42px)", color:s.c, lineHeight:1, letterSpacing:"0.04em", textShadow:`0 0 20px ${s.c}50` }}>{s.v}</div>
                      <div style={{ fontFamily:"monospace", fontSize:"8px", color:"rgba(255,255,255,0.22)", letterSpacing:"0.14em", textTransform:"uppercase", marginTop:"2px" }}>{s.l}</div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* dual tape */}
      <div style={{ position:"relative", zIndex:10, overflow:"hidden" }}>
        <style>{`
          @keyframes t10a { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
          @keyframes t10b { 0%{transform:translateX(-50%)} 100%{transform:translateX(0%)} }
          .t10a { display:flex; width:max-content; animation:t10a 24s linear infinite; padding:8px 0; border-top:1px solid rgba(255,255,255,0.06); }
          .t10b { display:flex; width:max-content; animation:t10b 30s linear infinite; padding:8px 0; background:rgba(250,204,21,0.04); border-top:1px solid rgba(255,255,255,0.04); }
        `}</style>
        <div className="t10a">
          {[...Array(2)].flatMap((_, j)=>["ROBOROFL","·","MEME AMPLIFICATION NETWORK","·","INDIA & WORLDWIDE","·","500+ VERIFIED PAGES","·","48HR GO-LIVE","·","ZERO BOTS","·"].map((w,i)=>(
            <span key={`${j}-${i}`} style={{ fontFamily:w==="ROBOROFL"?"'Bebas Neue',sans-serif":"monospace", fontSize:w==="ROBOROFL"?"clamp(14px,1.6vw,20px)":"clamp(9px,1vw,12px)", letterSpacing:"0.16em", color:w==="·"?"#ec5b13":w==="ROBOROFL"?"#facc15":"rgba(255,255,255,0.16)", padding:"0 18px", whiteSpace:"nowrap" }}>{w}</span>
          )))}
        </div>
        <div className="t10b">
          {[...Array(2)].flatMap((_, j)=>["BRANDS","·","AGENCIES","·","BOLLYWOOD","·","CREATORS","·","PODCASTS","·","POLITICIANS","·","D2C","·","CRYPTO","·"].map((w,i)=>(
            <span key={`${j}-${i}`} style={{ fontFamily:"monospace", fontSize:"clamp(9px,1vw,12px)", letterSpacing:"0.18em", color:w==="·"?"#facc15":"rgba(255,255,255,0.14)", padding:"0 18px", whiteSpace:"nowrap", fontWeight:700 }}>{w}</span>
          )))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hv10-bottom { grid-template-columns: 1fr !important; }
          .hv10-stats { flex-direction: row !important; border-left: none !important; padding-left: 0 !important; border-top: 1px solid rgba(255,255,255,0.08) !important; padding-top: clamp(12px,2vw,20px) !important; flex-wrap: wrap; gap: clamp(14px,4vw,28px) !important; }
        }
      `}</style>
    </section>
  );
}