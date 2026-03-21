"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";

const TextType = dynamic(() => import("@/components/ui/TextType"), { ssr: false });

// ── Data ───────────────────────────────────────────────────────────────────────
const CLIENTS = [
    {
        id: "brands",
        emoji: "🏢",
        title: "Brands & D2C",
        subtitle: "Product launches, sales & awareness at meme scale",
        color: "#facc15",
        bg: "#facc1508",
        stats: [
            { label: "Avg. Reach", value: "2.4M+" },
            { label: "Activation", value: "48 hrs" },
            { label: "ROI vs Agency", value: "3.2×" },
        ],
        tags: ["Product Launch", "Sales Drive", "Brand Awareness", "D2C Growth"],
        index: 0,
    },
    {
        id: "agencies",
        emoji: "🎯",
        title: "Influencer Agencies",
        subtitle: "Your meme page supply chain — brief once, activate 50 pages",
        color: "#ec5b13",
        bg: "#ec5b1308",
        stats: [
            { label: "Pages/Campaign", value: "50+" },
            { label: "Brief to Live", value: "24 hrs" },
            { label: "Categories", value: "12" },
        ],
        tags: ["Supply Chain", "Bulk Activation", "White-label", "Scale Fast"],
        index: 1,
    },
    {
        id: "bollywood",
        emoji: "🎬",
        title: "Bollywood & OTT",
        subtitle: "Film seeding, trailer drops, song launches, show premieres",
        color: "#a78bfa",
        bg: "#a78bfa08",
        stats: [
            { label: "Film Seeding", value: "Day 1" },
            { label: "Song Launches", value: "24 hrs" },
            { label: "Viral Rate", value: "78%" },
        ],
        tags: ["Trailer Drop", "Song Launch", "OTT Premiere", "Viral Seeding"],
        index: 2,
    },
    {
        id: "celebs",
        emoji: "⭐",
        title: "Celebrities & Artists",
        subtitle: "Build cultural relevance, amplify moments, stay viral",
        color: "#38bdf8",
        bg: "#38bdf808",
        stats: [
            { label: "Cultural Reach", value: "Nation" },
            { label: "Trend Speed", value: "6 hrs" },
            { label: "Engagement", value: "11%" },
        ],
        tags: ["Moment Amplification", "Stay Viral", "Cultural Relevance", "Fan Growth"],
        index: 3,
    },
    {
        id: "politics",
        emoji: "🗳️",
        title: "Political Campaigns",
        subtitle: "Youth reach, narrative amplification, topical seeding",
        color: "#4ade80",
        bg: "#4ade8008",
        stats: [
            { label: "Youth Reach", value: "18–35" },
            { label: "Topical Speed", value: "2 hrs" },
            { label: "Narrative Fit", value: "100%" },
        ],
        tags: ["Youth Outreach", "Narrative Control", "Topical Seeding", "Viral Issues"],
        index: 4,
    },
    {
        id: "podcasts",
        emoji: "🎙️",
        title: "Podcasts & Creators",
        subtitle: "Episode drops, subscriber growth, viral clip seeding",
        color: "#f472b6",
        bg: "#f472b608",
        stats: [
            { label: "Episode Reach", value: "500K+" },
            { label: "Sub Growth", value: "+34%" },
            { label: "Clip Viral Rate", "value": "62%" },
        ],
        tags: ["Episode Drop", "Subscriber Growth", "Clip Seeding", "Creator Economy"],
        index: 5,
    },
];

// ── Floating stat pill ─────────────────────────────────────────────────────────
function StatPill({ label, value, color, delay, x, y }: {
    label: string; value: string; color: string;
    delay: number; x: string; y: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -10 }}
            transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
            style={{
                position: "absolute", left: x, top: y,
                display: "flex", flexDirection: "column", gap: "3px",
                padding: "10px 16px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${color}30`,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                zIndex: 3,
                pointerEvents: "none",
            }}
        >
            <span style={{
                fontFamily: "'Public Sans', sans-serif",
                fontSize: "9px", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.16em",
                color: "rgba(255,255,255,0.35)",
            }}>{label}</span>
            <span style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "22px", lineHeight: 1,
                color, letterSpacing: "0.02em",
            }}>{value}</span>
        </motion.div>
    );
}

// ── Tag chip ───────────────────────────────────────────────────────────────────
function TagChip({ tag, color, delay }: { tag: string; color: string; delay: number }) {
    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
            style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "5px 12px", borderRadius: "9999px",
                background: `${color}15`,
                border: `1px solid ${color}35`,
                fontFamily: "'Public Sans', sans-serif",
                fontSize: "11px", fontWeight: 600,
                color, letterSpacing: "0.04em",
                whiteSpace: "nowrap",
            }}
        >
            <span style={{
                width: "5px", height: "5px", borderRadius: "50%",
                background: color, display: "inline-block",
            }} />
            {tag}
        </motion.span>
    );
}

// ── Centre stage ───────────────────────────────────────────────────────────────
function CentreStage({ client }: { client: typeof CLIENTS[0] }) {
    const pillPositions = [
        { x: "4%", y: "18%" },
        { x: "4%", y: "52%" },
        { x: "72%", y: "18%" },
        { x: "72%", y: "52%" },
    ];

    return (
        <div style={{
            position: "relative",
            width: "100%",
            height: "clamp(360px, 46vh, 520px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
        }}>
            {/* full-bleed background glow */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`bg-${client.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                        position: "absolute", inset: 0,
                        background: `radial-gradient(ellipse at 50% 60%, ${client.color}14 0%, transparent 68%)`,
                        pointerEvents: "none",
                    }}
                />
            </AnimatePresence>

            {/* horizontal scan line sweep */}
            <motion.div
                key={`scan-${client.id}`}
                initial={{ y: "-100%", opacity: 0.6 }}
                animate={{ y: "200%", opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeIn" }}
                style={{
                    position: "absolute", left: 0, right: 0,
                    height: "2px",
                    background: `linear-gradient(90deg, transparent, ${client.color}80, transparent)`,
                    pointerEvents: "none",
                }}
            />

            {/* floating stat pills */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={client.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none"
                >
                    {client.stats.map((s, i) => (
                        <StatPill
                            key={`${client.id}-${s.label}`}
                            label={s.label} value={s.value} color={client.color}
                            delay={0.1 + i * 0.1}
                            x={pillPositions[i]?.x ?? "10%"}
                            y={pillPositions[i]?.y ?? "20%"}
                        />
                    ))}
                </motion.div>
            </AnimatePresence>

            {/* centre content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`content-${client.id}`}
                    initial={{ opacity: 0, scale: 0.88, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.06, y: -20 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        display: "flex", flexDirection: "column",
                        alignItems: "center", gap: "20px",
                        textAlign: "center",
                        padding: "0 200px",
                        position: "relative", zIndex: 2,
                    }}
                    className="centre-content"
                >
                    {/* emoji */}
                    <motion.div
                        animate={{
                            y: [0, -10, 0],
                            rotate: [0, 3, -3, 0],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        style={{
                            fontSize: "clamp(64px, 8vw, 100px)",
                            lineHeight: 1,
                            filter: `drop-shadow(0 0 32px ${client.color}60)`,
                            userSelect: "none",
                        }}
                    >
                        {client.emoji}
                    </motion.div>

                    {/* title */}
                    <div>
                        <h3 style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: "clamp(36px, 5vw, 68px)",
                            letterSpacing: "0.03em",
                            color: "white",
                            lineHeight: 1,
                            margin: "0 0 10px",
                        }}>
                            {client.title}
                        </h3>
                        <p style={{
                            fontFamily: "'Public Sans', sans-serif",
                            fontSize: "clamp(13px, 1.1vw, 16px)",
                            color: "rgba(255,255,255,0.45)",
                            lineHeight: 1.6,
                            margin: 0,
                            maxWidth: "400px",
                        }}>
                            {client.subtitle}
                        </p>
                    </div>

                    {/* tags */}
                    <div style={{
                        display: "flex", flexWrap: "wrap",
                        gap: "8px", justifyContent: "center",
                    }}>
                        {client.tags.map((tag, i) => (
                            <TagChip key={tag} tag={tag} color={client.color} delay={0.2 + i * 0.06} />
                        ))}
                    </div>

                    {/* active color line */}
                    <motion.div
                        layoutId="active-underline"
                        style={{
                            height: "2px", width: "60px",
                            background: `linear-gradient(90deg, transparent, ${client.color}, transparent)`,
                            borderRadius: "2px",
                        }}
                    />
                </motion.div>
            </AnimatePresence>

            {/* top + bottom border lines */}
            <div style={{
                position: "absolute", top: 0, left: "5%", right: "5%",
                height: "1px",
                background: `linear-gradient(90deg, transparent, ${client.color}40, transparent)`,
                transition: "background 0.4s",
            }} />
            <div style={{
                position: "absolute", bottom: 0, left: "5%", right: "5%",
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
            }} />
        </div>
    );
}

// ── Client selector tabs ────────────────────────────────────────────────────────
function SelectorTabs({ active, setActive }: {
    active: string;
    setActive: (id: string) => void;
}) {
    return (
        <div style={{
            display: "flex", gap: "0",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
        }}>
            <style>{`.selector-tabs::-webkit-scrollbar { display: none; }`}</style>
            {CLIENTS.map((c) => {
                const isActive = c.id === active;
                return (
                    <button
                        key={c.id}
                        onClick={() => setActive(c.id)}
                        style={{
                            flex: "0 0 auto",
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "16px 24px",
                            background: "none", border: "none",
                            cursor: "pointer",
                            position: "relative",
                            transition: "all 0.2s",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {/* active indicator */}
                        {isActive && (
                            <motion.div
                                layoutId="tab-indicator"
                                style={{
                                    position: "absolute",
                                    bottom: 0, left: 0, right: 0,
                                    height: "2px",
                                    background: c.color,
                                    borderRadius: "2px 2px 0 0",
                                    boxShadow: `0 0 12px ${c.color}`,
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}

                        <span style={{ fontSize: "16px", lineHeight: 1 }}>{c.emoji}</span>
                        <span style={{
                            fontFamily: "'Public Sans', sans-serif",
                            fontSize: "13px",
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? c.color : "rgba(255,255,255,0.35)",
                            letterSpacing: "0.02em",
                            transition: "color 0.2s",
                        }}>
                            {c.title}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

// ── Auto-cycle counter display ─────────────────────────────────────────────────
function CycleProgress({ active, color }: { active: string; color: string }) {
    return (
        <div style={{
            display: "flex", gap: "6px", alignItems: "center",
        }}>
            {CLIENTS.map((c) => (
                <motion.div
                    key={c.id}
                    animate={{
                        width: c.id === active ? 20 : 6,
                        background: c.id === active ? color : "rgba(255,255,255,0.12)",
                    }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: "6px", borderRadius: "3px" }}
                />
            ))}
        </div>
    );
}

// ── Main Section ───────────────────────────────────────────────────────────────
export default function WhoWeServeSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const inView = useInView(sectionRef, { once: true, margin: "-80px" });
    const [activeId, setActiveId] = useState(CLIENTS[0].id);

    // Auto-cycle every 3s
    useEffect(() => {
        const id = setInterval(() => {
            setActiveId(prev => {
                const idx = CLIENTS.findIndex(c => c.id === prev);
                return CLIENTS[(idx + 1) % CLIENTS.length].id;
            });
        }, 3200);
        return () => clearInterval(id);
    }, []);

    const activeClient = CLIENTS.find(c => c.id === activeId) ?? CLIENTS[0];

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"],
    });
    const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

    return (
        <section
            id="who-we-serve"
            ref={sectionRef}
            style={{
                position: "relative",
                background: "#100c08",
                overflow: "hidden",
                paddingBottom: "100px",
            }}
        >
            {/* Diagonal texture */}
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                backgroundImage: `
          linear-gradient(60deg, rgba(255,255,255,0.016) 1px, transparent 1px),
          linear-gradient(-60deg, rgba(255,255,255,0.016) 1px, transparent 1px)
        `,
                backgroundSize: "44px 44px",
            }} />

            {/* Huge bg word */}
            <motion.div style={{
                y: bgY,
                position: "absolute", bottom: "-4%", left: "50%",
                transform: "translateX(-50%)",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(120px, 24vw, 360px)",
                color: "rgba(255,255,255,0.025)",
                whiteSpace: "nowrap",
                pointerEvents: "none", userSelect: "none",
                lineHeight: 0.85,
            }}>
                CULTURE
            </motion.div>

            {/* ── Heading ── */}
            <div style={{ textAlign: "center", padding: "88px 24px 48px" }}>
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                    style={{
                        fontFamily: "'Public Sans', sans-serif",
                        fontSize: "11px", fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: "0.22em",
                        color: "rgba(236,91,19,0.7)", margin: "0 0 20px",
                    }}
                >
                    Who We Serve
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 32 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    style={{ margin: "0 0 16px" }}
                >
                    <TextType
                        as="h2"
                        text={[
                            "Built for everyone who needs to move culture fast",
                            "Brands. Agencies. Bollywood. Creators. Politicians.",
                            "If culture is your game, we're your network.",
                        ]}
                        typingSpeed={38}
                        deletingSpeed={18}
                        pauseDuration={2800}
                        loop={true}
                        showCursor={true}
                        cursorCharacter="█"
                        cursorBlinkDuration={0.5}
                        cursorClassName=""
                        startOnVisible={false}
                        style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: "clamp(36px, 5.5vw, 80px)",
                            letterSpacing: "0.02em",
                            color: "white",
                            lineHeight: 1,
                            display: "inline-block",
                        }}
                        textColors={["#ffffff", "#ec5b13", "#facc15"]}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "center", gap: "12px",
                    }}
                >
                    <CycleProgress active={activeId} color={activeClient.color} />
                    <span style={{
                        fontFamily: "'Public Sans', sans-serif",
                        fontSize: "11px", color: "rgba(255,255,255,0.25)",
                        letterSpacing: "0.1em",
                    }}>
                        {CLIENTS.findIndex(c => c.id === activeId) + 1} / {CLIENTS.length}
                    </span>
                </motion.div>
            </div>

            {/* ── Main interactive area ── */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    maxWidth: "1280px",
                    margin: "0 auto",
                    padding: "0 24px",
                }}
            >
                {/* Selector tabs */}
                <div className="selector-tabs" style={{ overflowX: "auto" }}>
                    <SelectorTabs active={activeId} setActive={(id) => setActiveId(id)} />
                </div>

                {/* Centre stage */}
                <CentreStage client={activeClient} />
            </motion.div>

            {/* ── Bottom CTA ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.55 }}
                style={{ textAlign: "center", marginTop: "52px" }}
            >
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                    {[
                        { label: "I Need Amplification →", href: "#for-brands", solid: true },
                        { label: "I Run a Meme Page →", href: "#for-pages", solid: false },
                    ].map(({ label, href, solid }) => (
                        <motion.a
                            key={href}
                            href={href}
                            whileHover={{ y: -3, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                display: "inline-flex", alignItems: "center",
                                padding: "12px 28px", borderRadius: "10px",
                                fontFamily: "'Public Sans', sans-serif",
                                fontSize: "13px", fontWeight: 900,
                                textDecoration: "none",
                                background: solid ? "#facc15" : "transparent",
                                color: solid ? "#100c08" : "white",
                                border: solid ? "none" : "1px solid rgba(255,255,255,0.14)",
                                boxShadow: solid ? "0 0 28px rgba(250,204,21,0.25)" : "none",
                                transition: "box-shadow 0.2s",
                            }}
                        >
                            {label}
                        </motion.a>
                    ))}
                </div>
            </motion.div>

            {/* ── Responsive ── */}
            <style>{`
        .selector-tabs { scrollbar-width: none; -ms-overflow-style: none; }
        .selector-tabs::-webkit-scrollbar { display: none; }
        .centre-content { padding: 0 clamp(16px, 14vw, 200px) !important; }
        @media (max-width: 768px) {
          .centre-content { padding: 0 16px !important; }
        }
      `}</style>
        </section>
    );
}