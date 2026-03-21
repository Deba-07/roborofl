"use client";

import { useRef, useState } from "react";
import {
    motion,
    useScroll,
    useTransform,
    useMotionValueEvent,
    useSpring,
} from "framer-motion";
import dynamic from "next/dynamic";

const TextPressure = dynamic(() => import("@/components/ui/TextPressure"), { ssr: false });

// ── Data ───────────────────────────────────────────────────────────────────────
const STEPS = [
    {
        num: "01",
        label: "You",
        labelColor: "#facc15",
        title: "Share Your Brief",
        body: "Tell us your objective, target audience, budget and timeline. Takes 5 minutes. No agency fluff, no 40-slide decks.",
        duration: "~5 min",
        detail: "What happens on your end",
        bullets: [
            "Fill the brief form — objective, audience, budget",
            "Pick your preferred content categories",
            "Set your go-live date & approval preference",
        ],
        visual: <BriefVisual />,
    },
    {
        num: "02",
        label: "Roborofl",
        labelColor: "#ec5b13",
        title: "We Match & Activate",
        body: "We select the right pages from our verified network and brief them precisely. No middlemen, no WhatsApp chains, no fake followers.",
        duration: "Within 24 hrs",
        detail: "What we do behind the scenes",
        bullets: [
            "Algorithm + human curation picks the right pages",
            "We brief page admins on your exact requirements",
            "Content reviewed & approved before publishing",
        ],
        visual: <MatchVisual />,
    },
    {
        num: "03",
        label: "Live 🔥",
        labelColor: "#4ade80",
        title: "Goes Live. You Get Results.",
        body: "Your campaign fires across verified pages simultaneously. A full performance report lands in your inbox within 48 hours of campaign end.",
        duration: "48 hrs post-campaign",
        detail: "What you receive",
        bullets: [
            "Content published across all activated pages",
            "Real-time notification as posts go live",
            "Detailed performance report — reach, engagement, clicks",
        ],
        visual: <LiveVisual />,
    },
];

// ── Step visuals (inline SVG illustrations) ────────────────────────────────────
function BriefVisual() {
    return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    width: "200px",
                    background: "rgba(250,204,21,0.06)",
                    border: "1px solid rgba(250,204,21,0.2)",
                    borderRadius: "16px",
                    padding: "20px",
                    display: "flex", flexDirection: "column", gap: "12px",
                }}
            >
                {["Campaign objective", "Target audience", "Budget range", "Go-live date"].map((label, i) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.12, duration: 0.4 }}
                    >
                        <div style={{ fontSize: "9px", fontFamily: "'Public Sans', sans-serif", fontWeight: 700, color: "rgba(250,204,21,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "5px" }}>{label}</div>
                        <div style={{ height: "28px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }} />
                    </motion.div>
                ))}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    style={{
                        height: "34px", borderRadius: "8px",
                        background: "#facc15",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Public Sans', sans-serif",
                        fontSize: "11px", fontWeight: 900,
                        color: "#0d0806",
                    }}
                >
                    Submit Brief →
                </motion.div>
            </motion.div>
        </div>
    );
}

function MatchVisual() {
    const nodes = [
        { x: 50, y: 50, label: "Your\nBrief", color: "#ec5b13", size: 44 },
        { x: 200, y: 20, label: "Finance\nMemes", color: "#facc15", size: 32 },
        { x: 210, y: 85, label: "Tech\nPages", color: "#facc15", size: 32 },
        { x: 185, y: 150, label: "Gen Z\nHumor", color: "#facc15", size: 32 },
    ];
    return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="260" height="190" viewBox="0 0 260 190">
                {nodes.slice(1).map((node, i) => (
                    <motion.line
                        key={i}
                        x1={nodes[0].x} y1={nodes[0].y + nodes[0].size / 2}
                        x2={node.x} y2={node.y + node.size / 2}
                        stroke="#ec5b13" strokeWidth="1.5"
                        strokeDasharray="4 3"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.5 }}
                        transition={{ delay: 0.3 + i * 0.2, duration: 0.6 }}
                    />
                ))}
                {nodes.map((node, i) => (
                    <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.15, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}>
                        <circle cx={node.x} cy={node.y + node.size / 2} r={node.size / 2}
                            fill={`${node.color}18`} stroke={node.color} strokeWidth="1.5" />
                        {node.label.split("\n").map((t, j) => (
                            <text key={j} x={node.x} y={node.y + node.size / 2 + (j - 0.3) * 11}
                                textAnchor="middle" fill={node.color}
                                style={{ fontSize: "8px", fontWeight: 700, fontFamily: "sans-serif" }}>
                                {t}
                            </text>
                        ))}
                    </motion.g>
                ))}
                {nodes.slice(1).map((node, i) => (
                    <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 + i * 0.15 }}>
                        <circle cx={node.x + node.size / 2 - 4} cy={node.y - 2} r="7" fill="#4ade80" />
                        <text x={node.x + node.size / 2 - 4} y={node.y + 3}
                            textAnchor="middle" fill="#0d0806"
                            style={{ fontSize: "8px", fontWeight: 900, fontFamily: "sans-serif" }}>
                            ✓
                        </text>
                    </motion.g>
                ))}
            </svg>
        </div>
    );
}

function LiveVisual() {
    const bars = [68, 84, 91, 76, 95, 88];
    return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    width: "220px",
                    background: "rgba(74,222,128,0.04)",
                    border: "1px solid rgba(74,222,128,0.18)",
                    borderRadius: "16px",
                    padding: "20px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                        style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
                    <span style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "11px", fontWeight: 700, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        Campaign Live
                    </span>
                </div>
                <div style={{ display: "flex", gap: "6px", alignItems: "flex-end", height: "60px", marginBottom: "16px" }}>
                    {bars.map((h, i) => (
                        <motion.div key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                flex: 1, borderRadius: "3px 3px 0 0",
                                background: `rgba(74,222,128,${0.3 + h / 200})`,
                                border: "1px solid rgba(74,222,128,0.3)",
                            }}
                        />
                    ))}
                </div>
                {[["Total Reach", "4.2M"], ["Engagement", "8.4%"], ["Link Clicks", "18.2K"]].map(([k, v], i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: i === 0 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                        <span style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>{k}</span>
                        <span style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "11px", fontWeight: 700, color: "#4ade80" }}>{v}</span>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}

// ── Step indicator dots ────────────────────────────────────────────────────────
function StepDots({ active }: { active: number }) {
    return (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {STEPS.map((s, i) => (
                <motion.div
                    key={i}
                    animate={{
                        width: i === active ? 24 : 8,
                        background: i === active ? s.labelColor : i < active ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.12)",
                    }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: "8px", borderRadius: "4px" }}
                />
            ))}
        </div>
    );
}

// ── Main Section ───────────────────────────────────────────────────────────────
export default function HowItWorksSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);
    const [activeStep, setActiveStep] = useState(0);
    const springStep = useSpring(0, { stiffness: 80, damping: 20 });

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end end"],
    });

    const watermarkX = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

    useMotionValueEvent(scrollYProgress, "change", (v) => {
        const step = Math.min(2, Math.floor(v * 3));
        setActiveStep(step);
        springStep.set(step);
    });

    const step = STEPS[activeStep];

    return (
        <section
            id="how-it-works"
            ref={sectionRef}
            style={{
                position: "relative",
                background: "#0d0806",
                height: "400vh",
            }}
        >
            <div
                ref={stickyRef}
                style={{
                    position: "sticky",
                    top: 0,
                    height: "100vh",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Background dot grid */}
                <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)",
                    backgroundSize: "30px 30px", opacity: 0.6
                }} />

                {/* Moving watermark */}
                <motion.div style={{
                    x: watermarkX,
                    position: "absolute", top: "50%", left: "5%",
                    transform: "translateY(-50%)",
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "clamp(80px, 18vw, 240px)",
                    color: "rgba(255,255,255,0.022)",
                    letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                    pointerEvents: "none", userSelect: "none", lineHeight: 1,
                }}>
                    ONE BRIEF · THE RIGHT PAGES · 48 HOURS ·
                </motion.div>

                {/* Colour glow that shifts with step */}
                <motion.div
                    animate={{ background: `radial-gradient(ellipse at 60% 50%, ${step.labelColor}12 0%, rgba(0,0,0,0) 65%)` }}
                    transition={{ duration: 0.8 }}
                    style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
                />

                {/* ── Content layout ── */}
                <div style={{
                    flex: 1, display: "flex", flexDirection: "column",
                    maxWidth: "1280px", margin: "0 auto", width: "100%",
                    padding: "0 32px",
                    justifyContent: "center",
                    gap: "0",
                    position: "relative", zIndex: 1,
                }}>

                    {/* ── Section heading with TextPressure ── */}
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ marginBottom: "32px" }}
                    >
                        <p style={{
                            fontFamily: "'Public Sans', sans-serif",
                            fontSize: "11px", fontWeight: 700,
                            textTransform: "uppercase", letterSpacing: "0.22em",
                            color: "rgba(236,91,19,0.7)", margin: "0 0 10px",
                        }}>
                            The Process
                        </p>

                        {/* TextPressure interactive heading — hover to feel the pressure */}
                        <div style={{ height: "clamp(44px, 6vw, 80px)", width: "100%" }}>
                            <TextPressure
                                text="ONE BRIEF · THE RIGHT PAGES · 48 HOURS"
                                fontFamily="Compressa VF"
                                fontUrl="https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2"
                                width={true}
                                weight={true}
                                italic={true}
                                alpha={false}
                                flex={true}
                                stroke={false}
                                scale={true}
                                textColor="#ffffff"
                                minFontSize={14}
                                className=""
                            />
                        </div>
                    </motion.div>

                    {/* ── Main two-column story panel ── */}
                    <div className="hiw-grid" style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "32px",
                        alignItems: "center",
                    }}>

                        {/* LEFT: text panel */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                            {/* step counter row */}
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <StepDots active={activeStep} />
                                <span style={{
                                    fontFamily: "'Public Sans', sans-serif",
                                    fontSize: "11px", fontWeight: 600,
                                    color: "rgba(255,255,255,0.25)",
                                    letterSpacing: "0.08em",
                                }}>
                                    {activeStep + 1} / {STEPS.length}
                                </span>
                            </div>

                            {/* step tag */}
                            <motion.div
                                key={`tag-${activeStep}`}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: "8px",
                                    padding: "5px 14px", borderRadius: "9999px",
                                    background: `${step.labelColor}18`,
                                    border: `1px solid ${step.labelColor}40`,
                                    width: "fit-content",
                                }}
                            >
                                <motion.span
                                    animate={{ boxShadow: [`0 0 0px ${step.labelColor}`, `0 0 10px ${step.labelColor}`, `0 0 0px ${step.labelColor}`] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{ width: "7px", height: "7px", borderRadius: "50%", background: step.labelColor, display: "inline-block" }}
                                />
                                <span style={{
                                    fontFamily: "'Public Sans', sans-serif", fontSize: "11px", fontWeight: 700,
                                    textTransform: "uppercase", letterSpacing: "0.14em", color: step.labelColor
                                }}>
                                    {step.label}
                                </span>
                                <span style={{
                                    fontFamily: "'Public Sans', sans-serif", fontSize: "11px", fontWeight: 500,
                                    color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em"
                                }}>
                                    · {step.duration}
                                </span>
                            </motion.div>

                            {/* big step number + title */}
                            <div>
                                <motion.div
                                    key={`num-${activeStep}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <div style={{
                                        fontFamily: "'Bebas Neue', sans-serif",
                                        fontSize: "clamp(64px, 10vw, 140px)",
                                        lineHeight: 0.85, letterSpacing: "0.01em",
                                        color: step.labelColor,
                                        opacity: 0.18,
                                        userSelect: "none",
                                    }}>
                                        {step.num}
                                    </div>
                                    <h3 style={{
                                        fontFamily: "'Bebas Neue', sans-serif",
                                        fontSize: "clamp(28px, 3.5vw, 48px)",
                                        letterSpacing: "0.02em",
                                        color: "white", lineHeight: 1.05,
                                        margin: "-8px 0 16px",
                                    }}>
                                        {step.title}
                                    </h3>
                                </motion.div>

                                <motion.p
                                    key={`body-${activeStep}`}
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                                    style={{
                                        fontFamily: "'Public Sans', sans-serif",
                                        fontSize: "clamp(14px, 1.1vw, 16px)",
                                        color: "rgba(255,255,255,0.5)",
                                        lineHeight: 1.7, margin: 0,
                                    }}
                                >
                                    {step.body}
                                </motion.p>
                            </div>

                            {/* bullet points */}
                            <motion.div
                                key={`bullets-${activeStep}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.4, delay: 0.15 }}
                                style={{ display: "flex", flexDirection: "column", gap: "10px" }}
                            >
                                <p style={{
                                    fontFamily: "'Public Sans', sans-serif",
                                    fontSize: "10px", fontWeight: 700,
                                    textTransform: "uppercase", letterSpacing: "0.18em",
                                    color: "rgba(255,255,255,0.25)", margin: "0 0 4px",
                                }}>
                                    {step.detail}
                                </p>
                                {step.bullets.map((b, i) => (
                                    <motion.div key={i}
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                                        style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}
                                    >
                                        <div style={{
                                            width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0,
                                            background: `${step.labelColor}20`,
                                            border: `1px solid ${step.labelColor}50`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: step.labelColor }} />
                                        </div>
                                        <span style={{
                                            fontFamily: "'Public Sans', sans-serif",
                                            fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5,
                                        }}>{b}</span>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* scroll hint / CTA */}
                            {activeStep === 2 ? (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}>
                                    <a href="#for-brands" style={{
                                        display: "inline-flex", alignItems: "center", gap: "8px",
                                        padding: "12px 28px", borderRadius: "10px",
                                        background: "#facc15", color: "#0d0806",
                                        fontFamily: "'Public Sans', sans-serif",
                                        fontSize: "13px", fontWeight: 900,
                                        textDecoration: "none",
                                        boxShadow: "0 0 28px rgba(250,204,21,0.3)",
                                    }}>
                                        Submit a Campaign Brief
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 7h8M7 3l4 4-4 4" />
                                        </svg>
                                    </a>
                                </motion.div>
                            ) : (
                                <motion.div
                                    animate={{ y: [0, 6, 0] }}
                                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M7 2v10M3 9l4 4 4-4" />
                                    </svg>
                                    <span style={{ fontFamily: "'Public Sans', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
                                        Scroll for next step
                                    </span>
                                </motion.div>
                            )}
                        </div>

                        {/* RIGHT: visual panel */}
                        <motion.div
                            key={`visual-${activeStep}`}
                            initial={{ opacity: 0, scale: 0.94, x: 32 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.94, x: -32 }}
                            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                borderRadius: "24px",
                                border: `1px solid ${step.labelColor}25`,
                                background: `${step.labelColor}06`,
                                backdropFilter: "blur(12px)",
                                WebkitBackdropFilter: "blur(12px)",
                                height: "340px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                overflow: "hidden",
                                position: "relative",
                            }}
                        >
                            <div style={{
                                position: "absolute", top: 0, left: 0, right: 0, height: "1px",
                                background: `linear-gradient(90deg, transparent, ${step.labelColor}60, transparent)`,
                            }} />
                            {step.visual}
                        </motion.div>
                    </div>

                    {/* ── Horizontal step timeline strip ── */}
                    <div style={{
                        display: "flex", gap: "0", marginTop: "32px",
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        paddingTop: "24px",
                    }}>
                        {STEPS.map((s, i) => {
                            const isPast = i < activeStep;
                            const isCurrent = i === activeStep;
                            return (
                                <div key={i} style={{
                                    flex: 1, display: "flex", flexDirection: "column", gap: "6px",
                                    paddingRight: i < STEPS.length - 1 ? "24px" : "0",
                                    borderRight: i < STEPS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                                    marginRight: i < STEPS.length - 1 ? "24px" : "0",
                                    opacity: isPast ? 0.4 : isCurrent ? 1 : 0.25,
                                    transition: "opacity 0.4s ease",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <div style={{
                                            width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                                            background: isCurrent ? s.labelColor : isPast ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
                                            border: `1px solid ${isCurrent ? s.labelColor : "rgba(255,255,255,0.1)"}`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "9px", fontWeight: 900, color: isCurrent ? "#0d0806" : "rgba(255,255,255,0.4)",
                                            fontFamily: "'Public Sans', sans-serif",
                                            transition: "all 0.4s",
                                        }}>
                                            {isPast ? "✓" : i + 1}
                                        </div>
                                        <span style={{
                                            fontFamily: "'Bebas Neue', sans-serif", fontSize: "15px",
                                            letterSpacing: "0.04em", color: isCurrent ? "white" : "rgba(255,255,255,0.4)",
                                            transition: "color 0.4s",
                                        }}>
                                            {s.title}
                                        </span>
                                    </div>
                                    <div style={{ height: "2px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                                        <motion.div
                                            animate={{ width: isPast ? "100%" : isCurrent ? "60%" : "0%" }}
                                            transition={{ duration: 0.6, ease: "easeInOut" }}
                                            style={{
                                                height: "100%",
                                                background: `linear-gradient(90deg, ${s.labelColor}, ${s.labelColor}80)`,
                                                boxShadow: `0 0 6px ${s.labelColor}60`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Responsive styles ── */}
            <style>{`
        @media (max-width: 768px) {
          .hiw-grid {
            grid-template-columns: 1fr !important;
          }
          .hiw-grid > div:last-child {
            height: 200px !important;
          }
        }
      `}</style>
        </section>
    );
}