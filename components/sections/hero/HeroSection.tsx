"use client";

import { motion } from "framer-motion";
import HeroVisual from "./visuals/HeroVisual";
import StatCounter from "./cards/StatCounter";
import DotGrid from "@/components/ui/DotGrid";

const STATS = [
    { value: 50, suffix: "+", label: "Meme Pages Onboarded" },
    { value: 25, suffix: "M+", label: "Combined Followers" },
    { value: 12, suffix: "", label: "Campaign Categories" },
    { value: 48, suffix: "hrs", label: "Activation Time" },
];

const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.7,
            delay: i * 0.1,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
    }),
};

export default function HeroSection() {
    return (
        <section
            id="hero"
            className="relative min-h-screen flex flex-col overflow-hidden"
            style={{
                background: "radial-gradient(circle at 50% 50%, #2c1a12 0%, #1a0f0a 100%)",
            }}
        >
            {/* dot grid — sits behind everything */}
            <DotGrid
                dotRadius={1.2}
                baseOpacity={0.15}
                glowRadius={200}
                dotColor="255,255,255"
                accentColor="236,91,19"
            />

            {/* ── Background Blobs ── */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute rounded-full blur-[120px]"
                    style={{
                        top: "-10%",
                        left: "-10%",
                        width: "40%",
                        paddingBottom: "40%",
                        background: "rgba(236, 91, 19, 0.10)",
                    }}
                />
                <div
                    className="absolute rounded-full blur-[120px]"
                    style={{
                        bottom: "-10%",
                        right: "-10%",
                        width: "40%",
                        paddingBottom: "40%",
                        background: "rgba(250, 204, 21, 0.05)",
                    }}
                />
            </div>

            {/* ── Main Content ── */}
            <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 pt-28 sm:pt-32 lg:pt-24 pb-12 gap-10 lg:gap-16">

                {/* ── LEFT: Copy ── */}
                <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 sm:space-y-8 w-full">

                    {/* Live badge */}
                    <motion.div
                        custom={0}
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
                        style={{
                            background: "rgba(236, 91, 19, 0.10)",
                            border: "1px solid rgba(236, 91, 19, 0.20)",
                        }}
                    >
                        <span className="relative flex h-2 w-2">
                            <span
                                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                                style={{ background: "#ec5b13" }}
                            />
                            <span
                                className="relative inline-flex rounded-full h-2 w-2"
                                style={{ background: "#ec5b13" }}
                            />
                        </span>
                        <span
                            className="text-[10px] font-bold uppercase tracking-widest"
                            style={{ color: "#ec5b13", fontFamily: "'Public Sans', sans-serif" }}
                        >
                            Pre-Launch · Onboarding Founding Pages
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        custom={1}
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        className="font-black leading-[1.05] tracking-tight text-white"
                        style={{
                            fontSize: "clamp(2.6rem, 7vw, 5.5rem)",
                            fontFamily: "'Public Sans', sans-serif",
                        }}
                    >
                        India&apos;s{" "}
                        <span
                            className="text-[#facc15]"
                            style={{
                                textShadow:
                                    "0 0 10px rgba(250,204,21,0.5), 0 0 20px rgba(250,204,21,0.3)",
                            }}
                        >
                            Meme
                        </span>{" "}
                        <br className="hidden sm:block" />
                        Amplification Network
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        custom={2}
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        className="text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0"
                        style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Public Sans', sans-serif" }}
                    >
                        Connecting brands, agencies, celebs, podcasts and political campaigns
                        with India&apos;s most culturally sharp meme pages —{" "}
                        <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                            curated, verified, activated in 48 hours.
                        </span>
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        custom={3}
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto pt-2"
                    >
                        <CTAButton href="#for-brands" variant="solid">
                            I Need Amplification
                        </CTAButton>
                        <CTAButton href="#for-pages" variant="outline">
                            I Run a Meme Page
                        </CTAButton>
                    </motion.div>

                    {/* Social proof avatars */}
                    <motion.div
                        custom={4}
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        className="flex items-center gap-3 pt-2"
                    >
                        <AvatarStack />
                        <p
                            className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Public Sans', sans-serif" }}
                        >
                            Trusted by 500+ Indian Brands
                        </p>
                    </motion.div>

                    {/* Stats row */}
                    <motion.div
                        custom={5}
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-4 pt-4 w-full border-t"
                        style={{ borderColor: "rgba(255,255,255,0.06)" }}
                    >
                        {STATS.map((stat) => (
                            <StatCounter key={stat.label} {...stat} />
                        ))}
                    </motion.div>
                </div>

                {/* ── RIGHT: Visual ── */}
                <motion.div
                    className="w-full lg:flex-1"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                    <HeroVisual />
                </motion.div>
            </main>

            {/* ── Marquee Footer Strip ── */}
            <MarqueeStrip />
        </section>
    );
}

// ─── CTA Button ───────────────────────────────────────────────────────────────
function CTAButton({
    href,
    variant,
    children,
}: {
    href: string;
    variant: "solid" | "outline";
    children: React.ReactNode;
}) {
    const base: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.85rem 2rem",
        borderRadius: "0.75rem",
        fontSize: "0.9rem",
        fontWeight: 900,
        cursor: "pointer",
        transition: "all 0.2s ease",
        fontFamily: "'Public Sans', sans-serif",
        textDecoration: "none",
        width: "100%",
        whiteSpace: "nowrap",
    };

    const solidStyle: React.CSSProperties = {
        ...base,
        background: "#facc15",
        color: "#1a0f0a",
        boxShadow: "0 0 30px rgba(250, 204, 21, 0.28)",
    };

    const outlineStyle: React.CSSProperties = {
        ...base,
        background: "transparent",
        color: "white",
        border: "2px solid rgba(255,255,255,0.15)",
    };

    return (
        <motion.a
            href={href}
            style={variant === "solid" ? solidStyle : outlineStyle}
            whileHover={{
                scale: 1.04,
                ...(variant === "solid"
                    ? { boxShadow: "0 0 40px rgba(250,204,21,0.4)" }
                    : { background: "rgba(255,255,255,0.05)" }),
            }}
            whileTap={{ scale: 0.97 }}
        >
            {children}
        </motion.a>
    );
}

// ─── Avatar Stack ─────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["#ec5b13", "#facc15", "#2c7a7b"];
const AVATAR_INITIALS = ["A", "B", "C"];

function AvatarStack() {
    return (
        <div className="flex -space-x-2.5">
            {AVATAR_COLORS.map((color, i) => (
                <div
                    key={i}
                    className="size-8 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                        background: color,
                        borderColor: "#1a0f0a",
                        color: "#1a0f0a",
                        fontFamily: "'Public Sans', sans-serif",
                    }}
                >
                    {AVATAR_INITIALS[i]}
                </div>
            ))}
        </div>
    );
}

// ─── Marquee ─────────────────────────────────────────────────────────────────
const MARQUEE_WORDS = [
    "Hyper-Growth",
    "Cultural Impact",
    "Viral DNA",
    "Meme Mafia",
    "Premium Brands",
    "Creator Economy",
    "India First",
    "48-Hour Activation",
    "Verified Pages",
];

function MarqueeStrip() {
    return (
        <div
            className="relative z-10 w-full py-6 sm:py-8 overflow-hidden border-t"
            style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderColor: "rgba(255, 255, 255, 0.08)",
            }}
        >
            <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          gap: 4rem;
          width: max-content;
          animation: marquee-scroll 36s linear infinite;
          will-change: transform;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
            <div className="marquee-track">
                {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((word, i) => (
                    <span
                        key={i}
                        className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter flex-shrink-0"
                        style={{
                            color: i % 7 === 0 ? "rgba(236,91,19,0.5)" : "rgba(255,255,255,0.12)",
                            fontFamily: "'Public Sans', sans-serif",
                        }}
                    >
                        {word}
                    </span>
                ))}
            </div>
        </div>
    );
}