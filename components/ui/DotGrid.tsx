"use client";

import { useEffect, useRef } from "react";

interface DotGridProps {
  /** Dot spacing in px. Default 28 */
  gap?: number;
  /** Base dot radius. Default 1.2 */
  dotRadius?: number;
  /** Base dot opacity 0-1. Default 0.18 */
  baseOpacity?: number;
  /** Glow radius around cursor in px. Default 180 */
  glowRadius?: number;
  /** Dot color at full brightness. Default white */
  dotColor?: string;
  /** Accent color used near cursor center. Default brand orange */
  accentColor?: string;
}

export default function DotGrid({
  gap         = 28,
  dotRadius   = 1.2,
  baseOpacity = 0.18,
  glowRadius  = 180,
  dotColor    = "255,255,255",
  accentColor = "236,91,19",
}: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    // mouse / touch position in CSS px — start off-screen
    const mouse = { x: -9999, y: -9999 };
    // smoothed mouse for lerp
    const smooth = { x: -9999, y: -9999 };

    // ── size canvas to fill parent ──────────────────────────────────────────
    let cols = 0, rows = 0;
    let cssW = 0, cssH = 0;

    const resize = () => {
      const dpr  = window.devicePixelRatio || 1;
      const rect = canvas.parentElement!.getBoundingClientRect();
      cssW = rect.width;
      cssH = rect.height;

      canvas.style.width  = cssW + "px";
      canvas.style.height = cssH + "px";
      canvas.width        = Math.round(cssW * dpr);
      canvas.height       = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // pre-compute dot grid (offset so grid is centered)
      cols = Math.ceil(cssW / gap) + 1;
      rows = Math.ceil(cssH / gap) + 1;
    };
    resize();

    // ── pointer tracking ────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const onTouchMove = (e: TouchEvent) => {
      const rect  = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouse.x = touch.clientX - rect.left;
      mouse.y = touch.clientY - rect.top;
    };

    // attach to window so glow works even when mouse is over child elements
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    // ── render loop ─────────────────────────────────────────────────────────
    let animId: number;

    // offset so grid starts half-gap from edge (centered look)
    const ox = gap / 2;
    const oy = gap / 2;

    const draw = () => {
      // smooth mouse chase (lerp speed 0.1)
      smooth.x += (mouse.x - smooth.x) * 0.1;
      smooth.y += (mouse.y - smooth.y) * 0.1;

      ctx.clearRect(0, 0, cssW, cssH);

      const glowR2 = glowRadius * glowRadius; // squared for fast distance check

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = ox + col * gap;
          const y = oy + row * gap;

          const dx   = x - smooth.x;
          const dy   = y - smooth.y;
          const dist2 = dx * dx + dy * dy;

          let opacity = baseOpacity;
          let radius  = dotRadius;
          let color   = dotColor;

          if (dist2 < glowR2) {
            const dist     = Math.sqrt(dist2);
            const falloff  = 1 - dist / glowRadius;           // 1 at center, 0 at edge
            const eased    = falloff * falloff * (3 - 2 * falloff); // smoothstep

            // mix between base and accent near center
            const accentMix = Math.max(0, eased - 0.4) / 0.6; // only very close dots get accent
            if (accentMix > 0) {
              color = accentColor;
            }

            opacity = baseOpacity + eased * (1 - baseOpacity);
            radius  = dotRadius  + eased * dotRadius * 1.4;   // dots grow slightly
          }

          ctx.globalAlpha = opacity;
          ctx.fillStyle   = `rgb(${color})`;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    // ── resize observer ──────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => { resize(); });
    ro.observe(canvas.parentElement!);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [gap, dotRadius, baseOpacity, glowRadius, dotColor, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}