"use client";

// Ported from https://codepen.io/JuanFuentes/full/rgXKGQ
// via ReactBits — variable font cursor-pressure effect

import { useEffect, useRef, useState, useMemo, useCallback } from "react";

interface TextPressureProps {
  text?: string;
  fontFamily?: string;
  fontUrl?: string;
  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  alpha?: boolean;
  flex?: boolean;
  stroke?: boolean;
  scale?: boolean;
  textColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  className?: string;
  minFontSize?: number;
}

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getAttr = (
  distance: number,
  maxDist: number,
  minVal: number,
  maxVal: number
) => {
  const val = maxVal - Math.abs((maxVal * distance) / maxDist);
  return Math.max(minVal, val + minVal);
};

const debounce = (func: (...args: unknown[]) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const TextPressure: React.FC<TextPressureProps> = ({
  text = "Compressa",
  fontFamily = "Compressa VF",
  fontUrl = "https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2",
  width = true,
  weight = true,
  italic = true,
  alpha = false,
  flex = true,
  stroke = false,
  scale = false,
  textColor = "#FFFFFF",
  strokeColor = "#FF0000",
  strokeWidth = 2,
  className = "",
  minFontSize = 24,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);

  const mouseRef  = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });
  const isHovered = useRef(false);

  const [fontSize,    setFontSize]    = useState(minFontSize);
  const [scaleY,      setScaleY]      = useState(1);
  const [lineHeight,  setLineHeight]  = useState(1);

  const chars = text.split("");

  // ── Reset cursor to the container centre ──────────────────────────────────
  const resetToCenter = useCallback(() => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const cx = left + width  / 2;
    const cy = top  + height / 2;
    mouseRef.current  = { x: cx, y: cy };
    cursorRef.current = { x: cx, y: cy };
  }, []);

  useEffect(() => {
    // Initialise to centre so letters start in resting state
    resetToCenter();

    const el = containerRef.current;
    if (!el) return;

    // Only track mouse while hovering the container
    const onMouseMove = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };
    const onMouseEnter = (e: MouseEvent) => {
      isHovered.current = true;
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };
    const onMouseLeave = () => {
      isHovered.current = false;
      resetToCenter();           // snap back to centre → letters relax
    };

    // Touch: only respond while finger is inside the element
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      cursorRef.current.x = t.clientX;
      cursorRef.current.y = t.clientY;
    };
    const onTouchEnd = () => resetToCenter();

    el.addEventListener("mousemove",  onMouseMove);
    el.addEventListener("mouseenter", onMouseEnter);
    el.addEventListener("mouseleave", onMouseLeave);
    el.addEventListener("touchmove",  onTouchMove,  { passive: true });
    el.addEventListener("touchend",   onTouchEnd);

    return () => {
      el.removeEventListener("mousemove",  onMouseMove);
      el.removeEventListener("mouseenter", onMouseEnter);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.removeEventListener("touchmove",  onTouchMove);
      el.removeEventListener("touchend",   onTouchEnd);
    };
  }, [resetToCenter]);

  const setSize = useCallback(() => {
    if (!containerRef.current || !titleRef.current) return;

    const { width: containerW, height: containerH } =
      containerRef.current.getBoundingClientRect();

    let newFontSize = containerW / (chars.length / 2);
    newFontSize = Math.max(newFontSize, minFontSize);

    setFontSize(newFontSize);
    setScaleY(1);
    setLineHeight(1);

    requestAnimationFrame(() => {
      if (!titleRef.current) return;
      const textRect = titleRef.current.getBoundingClientRect();
      if (scale && textRect.height > 0) {
        const yRatio = containerH / textRect.height;
        setScaleY(yRatio);
        setLineHeight(yRatio);
      }
    });
  }, [chars.length, minFontSize, scale]);

  useEffect(() => {
    const debouncedSetSize = debounce(setSize, 100);
    debouncedSetSize();
    window.addEventListener("resize", debouncedSetSize);
    return () => window.removeEventListener("resize", debouncedSetSize);
  }, [setSize]);

  useEffect(() => {
    let rafId: number;
    const animate = () => {
      mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
      mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;

      if (titleRef.current) {
        const titleRect = titleRef.current.getBoundingClientRect();
        const maxDist = titleRect.width / 2;

        spansRef.current.forEach((span) => {
          if (!span) return;

          const rect = span.getBoundingClientRect();
          const charCenter = {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2,
          };

          const d = dist(mouseRef.current, charCenter);

          const wdth = width ? Math.floor(getAttr(d, maxDist, 5, 200)) : 100;
          const wght = weight
            ? Math.floor(getAttr(d, maxDist, 100, 900))
            : 400;
          const italVal = italic
            ? getAttr(d, maxDist, 0, 1).toFixed(2)
            : "0";
          const alphaVal = alpha
            ? getAttr(d, maxDist, 0, 1).toFixed(2)
            : "1";

          const newFVS = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;
          if (span.style.fontVariationSettings !== newFVS) {
            span.style.fontVariationSettings = newFVS;
          }
          if (alpha && span.style.opacity !== alphaVal) {
            span.style.opacity = alphaVal;
          }
        });
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(rafId);
  }, [width, weight, italic, alpha]);

  const styleElement = useMemo(
    () => (
      <style>{`
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontUrl}');
          font-style: normal;
        }
        .tp-stroke span {
          position: relative;
          color: ${textColor};
        }
        .tp-stroke span::after {
          content: attr(data-char);
          position: absolute;
          left: 0; top: 0;
          color: transparent;
          z-index: -1;
          -webkit-text-stroke-width: ${strokeWidth}px;
          -webkit-text-stroke-color: ${strokeColor};
        }
      `}</style>
    ),
    [fontFamily, fontUrl, textColor, strokeColor, strokeWidth]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-transparent"
      style={{ cursor: "crosshair" }}
    >
      {styleElement}
      <h1
        ref={titleRef}
        className={`${className} ${flex ? "flex justify-between" : ""} ${
          stroke ? "tp-stroke" : ""
        } uppercase`}
        style={{
          fontFamily,
          fontSize,
          lineHeight,
          transform: `scale(1, ${scaleY})`,
          transformOrigin: "center top",
          margin: 0,
          fontWeight: 100,
          color: stroke ? undefined : textColor,
          textAlign: "center",
          letterSpacing: "0.01em",
        }}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            ref={(el) => { spansRef.current[i] = el; }}
            data-char={char}
            style={{ display: "inline-block" }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default TextPressure;