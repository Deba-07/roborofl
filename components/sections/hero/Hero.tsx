"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import StatCounter from "./cards/StatCounter";
import DotGrid from "@/components/ui/DotGrid";

const YetiHeadline = dynamic(() => import("./YetiHeadline"), { ssr: false });

const STATS = [
  { value: 50,  suffix: "+",   label: "Meme Pages Onboarded" },
  { value: 25,  suffix: "M+",  label: "Combined Followers" },
  { value: 12,  suffix: "",    label: "Campaign Categories" },
  { value: 48,  suffix: "hrs", label: "Activation Time" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex flex-col overflow-hidden"
      style={{
        minHeight: "100dvh",
        background: "radial-gradient(circle at 50% 40%, #2c1a12 0%, #1a0f0a 100%)",
      }}
    >
      {/* dot grid */}
      <DotGrid gap={28} dotRadius={1.2} baseOpacity={0.15} glowRadius={200} dotColor="255,255,255" accentColor="236,91,19" />

      {/* bg blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full blur-[140px]" style={{ top: "-10%", left: "-8%", width: "42%", paddingBottom: "42%", background: "rgba(236,91,19,0.08)" }} />
        <div className="absolute rounded-full blur-[140px]" style={{ bottom: "-10%", right: "-8%", width: "42%", paddingBottom: "42%", background: "rgba(250,204,21,0.05)" }} />
      </div>

      {/* ── main: navbar offset via pt, then fill remaining height ── */}
      <main className="relative z-10 flex flex-col w-full" style={{ paddingTop: "80px", minHeight: "100dvh" }}>

        {/* inner: fill height, space content evenly */}
        <div className="flex-1 flex flex-col justify-between py-4 sm:py-6">

          {/* ── TOP: badge + headline ── */}
          <div className="flex flex-col items-center gap-3">

            {/* badge */}
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show"
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
              style={{ background: "rgba(236,91,19,0.10)", border: "1px solid rgba(236,91,19,0.22)" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#ec5b13" }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#ec5b13" }} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "#ec5b13", fontFamily: "'Public Sans', sans-serif" }}>
                Pre-Launch · Onboarding Founding Pages
              </span>
            </motion.div>

            {/* headline canvas — full width */}
            <motion.div className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}>
              <YetiHeadline />
            </motion.div>
          </div>

          {/* ── BOTTOM: sub + CTAs + stats ── */}
          <div className="flex flex-col items-center gap-4 sm:gap-5 px-4 sm:px-6 pb-2">

            {/* subheadline */}
            <motion.p custom={1} variants={fadeUp} initial="hidden" animate="show"
              className="text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl text-center"
              style={{ color: "rgba(255,255,255,0.48)", fontFamily: "'Public Sans', sans-serif" }}>
              Connecting brands, agencies, celebs, podcasts and political campaigns with India&apos;s most culturally sharp meme pages —{" "}
              <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>curated, verified, activated in 48 hours.</span>
            </motion.p>

            {/* CTAs */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show"
              className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm sm:max-w-none">
              <CTAButton href="#for-brands" variant="solid">I Need Amplification</CTAButton>
              <CTAButton href="#for-pages"  variant="outline">I Run a Meme Page</CTAButton>
            </motion.div>

            {/* social proof + stats */}
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show"
              className="flex flex-col items-center gap-4 w-full max-w-2xl">

              {/* avatars */}
              <div className="flex items-center gap-3">
                <AvatarStack />
                <p className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.26)", fontFamily: "'Public Sans', sans-serif" }}>
                  Trusted by 500+ Indian Brands
                </p>
              </div>

              {/* stats */}
              {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 w-full pt-3 border-t"
                style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                {STATS.map((s) => <StatCounter key={s.label} {...s} />)}
              </div> */}
            </motion.div>

          </div>
        </div>
      </main>

      <MarqueeStrip />
    </section>
  );
}

function CTAButton({ href, variant, children }: { href: string; variant: "solid" | "outline"; children: React.ReactNode }) {
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "0.8rem 2rem", borderRadius: "0.75rem",
    fontSize: "0.875rem", fontWeight: 900, cursor: "pointer",
    transition: "all 0.2s ease", fontFamily: "'Public Sans', sans-serif",
    textDecoration: "none", whiteSpace: "nowrap", width: "100%",
  };
  return (
    <motion.a href={href}
      style={variant === "solid"
        ? { ...base, background: "#facc15", color: "#1a0f0a", boxShadow: "0 0 28px rgba(250,204,21,0.25)" }
        : { ...base, background: "rgba(255,255,255,0)", color: "white", border: "2px solid rgba(255,255,255,0.15)" }}
      whileHover={{ scale: 1.04, ...(variant === "solid" ? { boxShadow: "0 0 44px rgba(250,204,21,0.42)" } : { background: "rgba(255,255,255,0.05)" }) }}
      whileTap={{ scale: 0.97 }}>
      {children}
    </motion.a>
  );
}

const AV = [{ c: "#ec5b13", l: "A" }, { c: "#facc15", l: "B" }, { c: "#2c7a7b", l: "C" }];
function AvatarStack() {
  return (
    <div className="flex -space-x-2.5">
      {AV.map((a, i) => (
        <div key={i} className="size-8 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: a.c, borderColor: "#1a0f0a", color: "#1a0f0a", fontFamily: "'Public Sans', sans-serif" }}>
          {a.l}
        </div>
      ))}
    </div>
  );
}

const WORDS = ["Hyper-Growth", "Cultural Impact", "Viral DNA", "Meme Mafia", "Premium Brands", "Creator Economy", "India First", "48-Hour Activation", "Verified Pages"];
function MarqueeStrip() {
  return (
    <div className="relative z-10 w-full py-5 overflow-hidden border-t"
      style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(12px)", borderColor: "rgba(255,255,255,0.07)" }}>
      <style>{`@keyframes rr-marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}.rr-track{display:flex;gap:3.5rem;width:max-content;animation:rr-marquee 38s linear infinite;will-change:transform}.rr-track:hover{animation-play-state:paused}`}</style>
      <div className="rr-track">
        {[...WORDS, ...WORDS].map((w, i) => (
          <span key={i} className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter flex-shrink-0"
            style={{ color: i % 9 === 0 ? "rgba(236,91,19,0.5)" : "rgba(255,255,255,0.09)", fontFamily: "'Public Sans', sans-serif" }}>
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}