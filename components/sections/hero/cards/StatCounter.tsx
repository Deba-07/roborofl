"use client";

import { useEffect, useRef, useState } from "react";

interface StatCounterProps {
  value: number;
  suffix: string;
  label: string;
}

export default function StatCounter({ value, suffix, label }: StatCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1600;
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(tick);
            else setCount(value);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center sm:items-start gap-1 group"
    >
      <span
        className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-none tracking-tight transition-colors duration-300 group-hover:text-[#facc15]"
        style={{ fontFamily: "'Public Sans', sans-serif" }}
      >
        {count}
        <span className="text-[#ec5b13]">{suffix}</span>
      </span>
      <span
        className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/40"
        style={{ fontFamily: "'Public Sans', sans-serif" }}
      >
        {label}
      </span>
    </div>
  );
}