"use client";

import { useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

// ── Data ───────────────────────────────────────────────────────────────────────
const BRAND_PROBLEMS = [
    { icon: "🔍", text: "No clean way to discover and book meme pages at scale", id: "B-001" },
    { icon: "📊", text: "No verified data — follower counts and engagement are unconfirmed", id: "B-002" },
    { icon: "🔄", text: "Every campaign is a fresh negotiation from scratch", id: "B-003" },
    { icon: "⏱️", text: "Activation takes 1–2 weeks through informal broker networks", id: "B-004" },
    { icon: "⚠️", text: "No accountability if content goes live late or off-brief", id: "B-005" },
];

const PAGE_PROBLEMS = [
    { icon: "📉", text: "Deal flow is inconsistent — months of silence, then a lowball offer", id: "P-001" },
    { icon: "💸", text: "No rate benchmarks — most pages have no idea what to charge", id: "P-002" },
    { icon: "👻", text: "Payments are delayed, disputed, or ghosted entirely", id: "P-003" },
    { icon: "🤝", text: "No trusted middleman representing your interests", id: "P-004" },
    { icon: "🎯", text: "Brand safety risks — taking any deal without proper vetting", id: "P-005" },
];

// ── Glitch heading ─────────────────────────────────────────────────────────────
function GlitchHeading({ children, color = "white" }: { children: string; color?: string }) {
    const [g, setG] = useState(false);
    return (
        <span
            onMouseEnter={() => { setG(true); setTimeout(() => setG(false), 350); }}
            style={{ position: "relative", display: "inline-block", cursor: "default", color }}
        >
            <span style={{ opacity: g ? 0 : 1, transition: "opacity 0.04s" }}>{children}</span>
            {g && (
                <>
                    <span style={{ position: "absolute", inset: 0, color: "#ff3030", clipPath: "inset(20% 0 50% 0)", transform: "translateX(-4px) skewX(-2deg)", pointerEvents: "none" }}>{children}</span>
                    <span style={{ position: "absolute", inset: 0, color: "#00e5ff", clipPath: "inset(55% 0 10% 0)", transform: "translateX(4px) skewX(2deg)", pointerEvents: "none" }}>{children}</span>
                </>
            )}
        </span>
    );
}

// ── Damage counter ─────────────────────────────────────────────────────────────
function DamageCounter({ value, label, inView }: { value: number; label: string; inView: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
            style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                padding: "7px 16px", borderRadius: "9999px",
                background: "rgba(236,91,19,0.1)",
                border: "1px solid rgba(236,91,19,0.25)",
            }}
        >
            <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                    width: "7px", height: "7px", borderRadius: "50%",
                    background: "#ec5b13", display: "inline-block",
                    boxShadow: "0 0 8px #ec5b13",
                }}
            />
            <span style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "18px", color: "#ec5b13",
                letterSpacing: "0.06em",
            }}>
                {value} {label.toUpperCase()}
            </span>
        </motion.div>
    );
}

// ── Case file card ─────────────────────────────────────────────────────────────
function CaseFile({ icon, text, id, index, side, inView }: {
    icon: string; text: string; id: string;
    index: number; side: "left" | "right"; inView: boolean;
}) {
    const [hovered, setHovered] = useState(false);
    const color = side === "left" ? "#ec5b13" : "#facc15";
    const xStart = side === "left" ? -100 : 100;
    const rotations = [-1.5, 0.8, -0.5, 1.2, -0.9];
    const restRot = rotations[index % rotations.length];

    return (
        <motion.div
            initial={{ opacity: 0, x: xStart, rotate: restRot * 3, scale: 0.92 }}
            animate={inView ? { opacity: 1, x: 0, rotate: hovered ? 0 : restRot, scale: hovered ? 1.02 : 1 } : {}}
            transition={{ duration: 0.6, delay: 0.08 + index * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ position: "relative", willChange: "transform" }}
        >
            {/* tape strip */}
            <div style={{
                position: "absolute", top: "-6px", left: "50%",
                transform: "translateX(-50%)",
                width: "48px", height: "12px",
                background: hovered ? `${color}90` : `${color}40`,
                borderRadius: "2px",
                transition: "background 0.25s",
                zIndex: 2,
            }} />

            <div style={{
                position: "relative",
                padding: "20px 18px 16px",
                borderRadius: "6px",
                background: hovered ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.025)",
                border: `1px solid ${hovered ? color + "45" : "rgba(255,255,255,0.07)"}`,
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                transition: "border-color 0.25s, background 0.25s",
                boxShadow: hovered ? `0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px ${color}20` : "none",
            }}>
                {/* case id + icon row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{
                        fontFamily: "monospace",
                        fontSize: "9px", fontWeight: 700,
                        letterSpacing: "0.2em",
                        color: hovered ? color : "rgba(255,255,255,0.2)",
                        textTransform: "uppercase",
                        transition: "color 0.25s",
                    }}>
                        CASE {id}
                    </span>
                    <div style={{
                        width: "30px", height: "30px", borderRadius: "6px",
                        background: hovered ? `${color}20` : "rgba(255,255,255,0.04)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "14px",
                        border: `1px solid ${hovered ? color + "40" : "rgba(255,255,255,0.06)"}`,
                        transition: "all 0.25s",
                    }}>
                        {icon}
                    </div>
                </div>

                {/* text */}
                <p style={{
                    fontFamily: "'Public Sans', sans-serif",
                    fontSize: "clamp(12px, 1vw, 14px)",
                    color: hovered ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)",
                    lineHeight: 1.6, margin: 0,
                    transition: "color 0.25s",
                }}>
                    {text}
                </p>

                {/* bottom accent line */}
                <motion.div
                    animate={{ scaleX: hovered ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    style={{
                        position: "absolute", bottom: 0, left: "16px", right: "16px",
                        height: "1.5px",
                        background: `linear-gradient(90deg, ${color}, transparent)`,
                        transformOrigin: "left", borderRadius: "1px",
                    }}
                />

                {/* OPEN stamp */}
                <motion.div
                    animate={{ opacity: hovered ? 0 : 0.06 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        position: "absolute", bottom: "10px", right: "12px",
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: "28px", letterSpacing: "0.08em",
                        color, transform: "rotate(-12deg)",
                        pointerEvents: "none", userSelect: "none", lineHeight: 1,
                    }}
                >
                    OPEN
                </motion.div>
            </div>
        </motion.div>
    );
}

// ── Column header ──────────────────────────────────────────────────────────────
function ColumnHeader({ title, badge, side, count, inView }: {
    title: string; badge: string; side: "left" | "right";
    count: number; inView: boolean;
}) {
    const color = side === "left" ? "#ec5b13" : "#facc15";
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: side === "left" ? 0.05 : 0.12, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            style={{ marginBottom: "24px" }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    padding: "5px 12px", borderRadius: "9999px",
                    background: `${color}12`, border: `1px solid ${color}28`,
                }}>
                    <motion.span
                        animate={{ boxShadow: [`0 0 0px ${color}`, `0 0 8px ${color}`, `0 0 0px ${color}`] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, display: "inline-block" }}
                    />
                    <span style={{
                        fontFamily: "'Public Sans', sans-serif",
                        fontSize: "10px", fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: "0.15em", color,
                    }}>{badge}</span>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
                    style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        background: `${color}15`, border: `1px solid ${color}35`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", color,
                    }}
                >
                    {count}
                </motion.div>
            </div>

            <h3 style={{
                fontFamily: "'Bebas Neue', 'Anton', sans-serif",
                fontSize: "clamp(26px, 2.8vw, 40px)",
                letterSpacing: "0.03em", color: "white", lineHeight: 1, margin: 0,
            }}>
                {title}
            </h3>

            <motion.div
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                style={{
                    height: "1px", marginTop: "12px",
                    background: `linear-gradient(90deg, ${color}50, transparent)`,
                    transformOrigin: side === "left" ? "left" : "right",
                }}
            />
        </motion.div>
    );
}

// ── Centre VS divider ──────────────────────────────────────────────────────────
function VSPillar({ inView }: { inView: boolean }) {
    return (
        <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", flexShrink: 0, width: "56px",
            paddingTop: "80px",
        }}>
            <motion.div
                initial={{ scaleY: 0 }}
                animate={inView ? { scaleY: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.35 }}
                style={{
                    width: "1px", height: "40px",
                    background: "linear-gradient(to bottom, transparent, rgba(236,91,19,0.4))",
                    transformOrigin: "top",
                }}
            />
            <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={inView ? { scale: 1, rotate: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
                style={{
                    width: "42px", height: "42px", borderRadius: "10px",
                    background: "rgba(236,91,19,0.12)",
                    border: "1px solid rgba(236,91,19,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "17px", color: "#ec5b13", letterSpacing: "0.04em",
                    flexShrink: 0, zIndex: 2,
                    boxShadow: "0 0 24px rgba(236,91,19,0.15)",
                }}
            >
                VS
            </motion.div>
            <motion.div
                initial={{ scaleY: 0 }}
                animate={inView ? { scaleY: 1 } : {}}
                transition={{ duration: 1.4, delay: 0.55, ease: "easeInOut" }}
                style={{
                    width: "1px", flex: 1, minHeight: "220px",
                    background: "linear-gradient(to bottom, rgba(236,91,19,0.35), rgba(250,204,21,0.2), transparent)",
                    transformOrigin: "top",
                }}
            />
        </div>
    );
}

// ── Main Section ───────────────────────────────────────────────────────────────
export default function ProblemSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const inView = useInView(sectionRef, { once: true, margin: "-60px" });

    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
    const headingY = useTransform(scrollYProgress, [0, 1], [50, -50]);
    const bgScale = useTransform(scrollYProgress, [0, 1], [0.95, 1.08]);

    return (
        <section
            id="problem"
            ref={sectionRef}
            style={{ position: "relative", background: "#130904", overflow: "hidden", paddingBottom: "100px" }}
        >
            {/* noise overlay */}
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
                backgroundSize: "180px 180px", opacity: 0.7,
            }} />

            {/* parallax watermark — using transform instead of x/y motion values */}
            <motion.div
                style={{ scale: bgScale }}
                className="prob-watermark"
            >
                PROBLEM
            </motion.div>

            {/* heading */}
            <div style={{ textAlign: "center", padding: "88px 24px 64px" }}>
                <motion.div style={{ y: headingY }}>

                    <motion.p
                        initial={{ opacity: 0, y: 14 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5 }}
                        style={{
                            fontFamily: "'Public Sans', sans-serif",
                            fontSize: "11px", fontWeight: 700,
                            textTransform: "uppercase", letterSpacing: "0.22em",
                            color: "rgba(236,91,19,0.7)", marginBottom: "18px",
                        }}
                    >
                        Why Roborofl Exists
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 1.12 }}
                        animate={inView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                    >
                        <h2 style={{
                            fontFamily: "'Bebas Neue', 'Anton', sans-serif",
                            fontSize: "clamp(52px, 8vw, 110px)",
                            letterSpacing: "0.03em", lineHeight: 0.95,
                            margin: "0 0 6px",
                            display: "inline-flex", gap: "0.18em",
                            flexWrap: "wrap", justifyContent: "center",
                        }}>
                            <GlitchHeading>THE</GlitchHeading>
                            <GlitchHeading color="#ec5b13">PROBLEM</GlitchHeading>
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.35 }}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "16px" }}
                    >
                        <DamageCounter value={10} label="open cases" inView={inView} />
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 14 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.55, delay: 0.45 }}
                        style={{
                            fontFamily: "'Public Sans', sans-serif",
                            fontSize: "clamp(14px, 1.2vw, 16px)",
                            color: "rgba(255,255,255,0.35)",
                            maxWidth: "500px", marginInline: "auto",
                            lineHeight: 1.65, marginTop: "16px",
                        }}
                    >
                        Meme marketing is broken on both sides. Brands can&apos;t scale it. Pages can&apos;t rely on it.{" "}
                        <span style={{ color: "#ec5b13", fontWeight: 600 }}>We fix both.</span>
                    </motion.p>
                </motion.div>
            </div>

            {/* two columns */}
            <div
                className="problem-grid"
                style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "flex-start" }}
            >
                <div style={{ flex: 1, minWidth: 0 }}>
                    <ColumnHeader title="For Brands & Agencies" badge="Brand Side" side="left" count={BRAND_PROBLEMS.length} inView={inView} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        {BRAND_PROBLEMS.map((p, i) => <CaseFile key={p.id} {...p} index={i} side="left" inView={inView} />)}
                    </div>
                </div>

                <div className="divider-desktop">
                    <VSPillar inView={inView} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <ColumnHeader title="For Meme Page Admins" badge="Creator Side" side="right" count={PAGE_PROBLEMS.length} inView={inView} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        {PAGE_PROBLEMS.map((p, i) => <CaseFile key={p.id} {...p} index={i} side="right" inView={inView} />)}
                    </div>
                </div>
            </div>

            {/* bottom CTA */}
            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.9 }}
                style={{ textAlign: "center", marginTop: "60px" }}
            >
                <p style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.22)" }}>
                    Sound familiar?{" "}
                    <a href="#how-it-works" style={{ color: "#ec5b13", textDecoration: "none", borderBottom: "1px solid rgba(236,91,19,0.35)", paddingBottom: "1px" }}>
                        Here&apos;s how we fix it →
                    </a>
                </p>
            </motion.div>

            <style>{`
        .prob-watermark {
          position: absolute;
          top: 42%; left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(120px, 22vw, 320px);
          color: rgba(236,91,19,0.035);
          letter-spacing: 0.06em;
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
          line-height: 1;
        }
        .divider-desktop { display: flex; }
        @media (max-width: 768px) {
          .problem-grid { flex-direction: column !important; gap: 52px !important; padding: 0 16px !important; }
          .divider-desktop { display: none !important; }
        }
      `}</style>
        </section>
    );
}