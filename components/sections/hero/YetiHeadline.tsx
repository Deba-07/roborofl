"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Letter {
  ch: string;
  cx: number;       // CSS px
  baseY: number;    // CSS px
  cw: number;       // CSS px
  y: number;
  vy: number;
  fallen: boolean;
  press: number;    // 0..1
  li: number;       // line index
  accent: boolean;  // true = yellow (MEME letters)
}

interface ZzzBubble { x: number; y: number; alpha: number; vy: number; size: number }
interface SweatDrop  { x: number; y: number; vy: number; alpha: number }
type CreatureState   = "walk" | "sit" | "sleep" | "panic" | "fall";

interface Creature {
  x: number; y: number; vy: number; vx: number;
  state: CreatureState;
  stateTimer: number; panicTimer: number;
  dir: 1 | -1;
  frame: number; frameTimer: number;
  legSwing: number;
  eyeBlink: number; blinkTimer: number;
  onGround: boolean;
  sweatDrops: SweatDrop[];
  zzzs: ZzzBubble[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
// Line 0: "INDIA'S MEME" — rendered in one line, MEME highlighted yellow
// Line 1: "AMPLIFICATION" — white
const LINES              = ["INDIA'S MEME", "AMPLIFICATION"];
const FW                 = "900";
const FF                 = "'Bebas Neue', 'Anton', 'Impact', sans-serif";
const LINE_H_MULT        = 1.12;
// Only enough room above line-1 for the creature's head + tiny margin
const CREATURE_HEAD_ROOM = 0.55;

// ─── Component ───────────────────────────────────────────────────────────────
export default function YetiHeadline({ className = "" }: { className?: string }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const animIdRef  = useRef(0);
  const lettersRef = useRef<Letter[]>([]);
  const creatureRef = useRef<Creature>({
    x: 0, y: 0, vy: 0, vx: 1.5,
    state: "walk", stateTimer: 0, panicTimer: 0,
    dir: 1, frame: 0, frameTimer: 0, legSwing: 0,
    eyeBlink: 0, blinkTimer: 0, onGround: false,
    sweatDrops: [], zzzs: [],
  });
  const tRef = useRef(0);

  // ── font size: fill width, but never let canvas exceed ~44vh ─────────────
  const computeFontSize = useCallback((cssW: number): number => {
    const tmp = document.createElement("canvas");
    const tc  = tmp.getContext("2d")!;
    // Binary search: largest fs where "AMPLIFICATION" fits cssW * 0.97
    let lo = 20, hi = 320, best = 64;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      tc.font = `${FW} ${mid}px ${FF}`;
      const w = Math.max(...LINES.map(l => tc.measureText(l).width));
      if (w <= cssW * 0.97) { best = mid; lo = mid + 1; }
      else { hi = mid - 1; }
    }
    // Cap: canvas height = headroom + 2 lines. Must fit in ~44dvh
    // headroom = fs * CREATURE_HEAD_ROOM + fs, content = fs * LINE_H_MULT + fs * 0.55
    // total ≈ fs * (CREATURE_HEAD_ROOM + 1 + LINE_H_MULT + 0.55)
    const totalMult = CREATURE_HEAD_ROOM + 1 + LINE_H_MULT + 0.55;
    const maxByVh   = Math.floor((window.innerHeight * 0.44) / totalMult);
    return Math.min(best, maxByVh, 320);
  }, []);

  // ── build letter array in CSS px coords ──
  const buildLetters = useCallback((cssW: number, _cssH: number, fs: number): Letter[] => {
    const tmp = document.createElement("canvas");
    const tc  = tmp.getContext("2d")!;
    tc.font   = `${FW} ${fs}px ${FF}`;
    const lineH     = fs * LINE_H_MULT;
    const firstBase = fs * CREATURE_HEAD_ROOM + fs;
    const result: Letter[] = [];

    LINES.forEach((line, li) => {
      const lineW  = tc.measureText(line).width;
      const startX = (cssW - lineW) / 2;
      const baseY  = firstBase + li * lineH;
      let cx = startX;

      // For line 0 ("INDIA'S MEME"), tag letters after the space as accent
      // Split into words to know which word each char belongs to
      const words = line.split(" ");
      for (let wi = 0; wi < words.length; wi++) {
        const word    = words[wi];
        const isAccent = li === 0 && wi === words.length - 1; // last word = "MEME"
        for (const ch of word) {
          const cw = tc.measureText(ch).width;
          result.push({ ch, cx, baseY, cw, y: baseY, vy: 0, fallen: false, press: 0, li, accent: isAccent });
          cx += cw;
        }
        // add inter-word space (but not after last word)
        if (wi < words.length - 1) cx += tc.measureText(" ").width;
      }
    });
    return result;
  }, []);

  // ── canvas CSS height: creature headroom + 3 lines + bottom pad ──────────
  const computeHeight = useCallback((fs: number): number => {
    const lineH   = fs * LINE_H_MULT;
    const topRoom = fs * CREATURE_HEAD_ROOM + fs;          // above first baseline
    const content = lineH * (LINES.length - 1);            // gap for lines 2 & 3
    const bottom  = fs * 0.55;                             // descender + air
    return Math.ceil(topRoom + content + bottom);
  }, []);

  // ── setup & resize ──
  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx  = canvas.getContext("2d")!;
    const dpr  = window.devicePixelRatio || 1;
    const cssW = canvas.parentElement!.clientWidth;
    const fs   = computeFontSize(cssW);
    const cssH = computeHeight(fs);

    // set canvas size
    canvas.style.width  = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width        = Math.round(cssW * dpr);
    canvas.height       = Math.round(cssH * dpr);

    // CRITICAL: scale ctx so all drawing uses CSS px coords — no DPR confusion
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // rebuild letters in CSS px
    lettersRef.current = buildLetters(cssW, cssH, fs);

    // place creature on top of first letter
    const first = lettersRef.current[0];
    if (first) {
      creatureRef.current.x  = first.cx + first.cw / 2;
      creatureRef.current.y  = first.baseY - fs * 0.85;
      creatureRef.current.vy = 0;
    }

    return { ctx, cssW, cssH, fs };
  }, [computeFontSize, computeHeight, buildLetters]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D;
    let cssW = 0, cssH = 0, fs = 48;

    const init = () => {
      const r = setup();
      if (!r) return;
      ctx  = r.ctx;
      cssW = r.cssW;
      cssH = r.cssH;
      fs   = r.fs;
    };
    init();

    // ── helpers (all coords in CSS px) ──
    const getTopYAtX = (x: number): number | null => {
      const letters = lettersRef.current;
      const dpr = window.devicePixelRatio || 1;
      const cW  = canvas.width / dpr;
      let minY  = cssH;
      for (const l of letters) {
        if (l.fallen) continue;
        if (x >= l.cx - 4 && x <= l.cx + l.cw + 4) {
          const top = l.y - fs * 0.84;
          if (top < minY) minY = top;
        }
      }
      return minY < cssH ? minY : null;
    };

    const getLetterUnder = (): number => {
      const letters = lettersRef.current;
      const cr = creatureRef.current;
      let best = -1, bestD = 9999;
      letters.forEach((l, i) => {
        if (l.fallen) return;
        const mid  = l.cx + l.cw * 0.5;
        const dist = Math.abs(cr.x - mid);
        if (dist < l.cw * 0.7 + 6 && dist < bestD) { best = i; bestD = dist; }
      });
      return best;
    };

    // ── update ──
    const update = () => {
      const letters = lettersRef.current;
      const cr      = creatureRef.current;
      tRef.current++;
      const t = tRef.current;

      // blink timer
      cr.blinkTimer++;
      if (cr.blinkTimer > 130 + Math.random() * 60) { cr.eyeBlink = 10; cr.blinkTimer = 0; }
      if (cr.eyeBlink > 0) cr.eyeBlink--;

      // frame
      cr.frameTimer++;
      if (cr.frameTimer > 6) { cr.frame = (cr.frame + 1) % 4; cr.frameTimer = 0; }

      // gravity
      cr.vy += 0.52;
      cr.y  += cr.vy;
      cr.onGround = false;

      // land on letters
      const groundY = getTopYAtX(cr.x);
      if (groundY !== null && cr.y >= groundY && cr.vy >= 0) {
        cr.y = groundY; cr.vy = 0; cr.onGround = true;
      }
      // canvas floor
      if (cr.y >= cssH - 8) {
        cr.y = cssH - 8; cr.vy = 0; cr.onGround = true;
        if (cr.state === "fall") { cr.state = "panic"; cr.panicTimer = 80; }
      }

      // letter pressure
      const idx = getLetterUnder();
      letters.forEach((l, i) => {
        if (i === idx && cr.onGround && !l.fallen) l.press = Math.min(1, l.press + 0.013);
        else l.press = Math.max(0, l.press - 0.026);
        if (!l.fallen) l.y = l.baseY + l.press * 8;
      });

      // panic trigger
      if (idx >= 0 && letters[idx].press > 0.7 && cr.state === "walk") {
        cr.state = "panic"; cr.panicTimer = 65;
      }
      // fall trigger
      if (idx >= 0 && letters[idx].press >= 1 && !letters[idx].fallen) {
        letters[idx].fallen = true; letters[idx].vy = 0;
        cr.state = "fall"; cr.vy = -7;
      }

      // letter fall physics + reset when off screen
      letters.forEach(l => {
        if (!l.fallen) return;
        l.vy += 0.55; l.y += l.vy;
        if (l.y > cssH + fs * 2) { l.fallen = false; l.y = l.baseY; l.vy = 0; l.press = 0; }
      });

      // ── state machine ──
      cr.stateTimer++;
      if (cr.state === "walk") {
        cr.x += cr.vx * cr.dir;
        cr.legSwing = Math.sin(t * 0.22) * 20;
        if (cr.x < 14 || cr.x > cssW - 14) { cr.dir = (cr.dir * -1) as 1 | -1; cr.x = Math.max(14, Math.min(cssW - 14, cr.x)); }
        if (cr.stateTimer > 200 + Math.random() * 160 && cr.onGround) {
          const r = Math.random();
          if (r < 0.35) { cr.state = "sit"; cr.stateTimer = 0; }
          else if (r < 0.58) { cr.state = "sleep"; cr.stateTimer = 0; cr.zzzs = []; }
        }
      } else if (cr.state === "sit") {
        cr.legSwing = Math.sin(t * 0.07) * 32;
        if (cr.stateTimer > 160) { cr.state = "walk"; cr.stateTimer = 0; }
      } else if (cr.state === "sleep") {
        cr.legSwing = Math.sin(t * 0.04) * 14;
        if (t % 52 === 0) cr.zzzs.push({ x: cr.x + cr.dir * 14, y: cr.y - 28, alpha: 1, vy: -0.38, size: 9 + cr.zzzs.length * 4 });
        cr.zzzs = cr.zzzs.filter(z => z.alpha > 0.04);
        cr.zzzs.forEach(z => { z.y += z.vy; z.alpha -= 0.007; });
        if (cr.stateTimer > 230) { cr.state = "walk"; cr.stateTimer = 0; cr.zzzs = []; }
      } else if (cr.state === "panic") {
        cr.x += Math.sin(t * 1.1) * 3.5;
        cr.legSwing = Math.sin(t * 0.65) * 40;
        cr.panicTimer--;
        if (cr.panicTimer <= 0) { cr.state = "walk"; cr.stateTimer = 0; }
        if (t % 8 === 0) cr.sweatDrops.push({ x: cr.x + (Math.random() - 0.5) * 26, y: cr.y - 28, vy: 1.3, alpha: 1 });
        cr.sweatDrops.forEach(d => { d.y += d.vy; d.alpha -= 0.038; });
        cr.sweatDrops = cr.sweatDrops.filter(d => d.alpha > 0);
      } else if (cr.state === "fall") {
        cr.x += cr.vx * cr.dir;
        cr.legSwing = Math.sin(t * 0.85) * 44;
      }
    };

    // ── draw ──
    const drawText = () => {
      const letters = lettersRef.current;
      ctx.font = `${FW} ${fs}px ${FF}`;
      ctx.textBaseline = "alphabetic";
      letters.forEach(l => {
        ctx.save();
        const fallP = l.fallen ? Math.min(1, (l.y - l.baseY) / 220) : 0;
        ctx.globalAlpha = l.fallen ? Math.max(0.06, 1 - fallP) : 1;

        if (l.fallen) {
          ctx.fillStyle = "#ec5b13";
        } else if (l.press > 0.42) {
          const b = (l.press - 0.42) / 0.58;
          // pressed: white→orange transition
          ctx.fillStyle = `rgb(255,${Math.round(255 - b * 164)},${Math.round(255 - b * 236)})`;
        } else {
          // accent = MEME letters → yellow, rest → white
          ctx.fillStyle = l.accent ? "#facc15" : "#ffffff";
        }

        if (!l.fallen && l.press > 0.12) {
          const cx2 = l.cx + l.cw / 2;
          ctx.translate(cx2, l.y);
          ctx.rotate((l.press * 5) * Math.PI / 180);
          ctx.translate(-cx2, -l.y);
        }

        ctx.fillText(l.ch, l.cx, l.y);
        ctx.restore();
      });
    };

    const drawCreature = () => {
      const cr  = creatureRef.current;
      const t   = tRef.current;
      const sc  = Math.max(0.45, fs / 64);   // scale creature with font

      ctx.save();
      ctx.translate(cr.x, cr.y);
      ctx.scale(cr.dir, 1);

      const W = 22 * sc, H = 26 * sc, headR = 13 * sc;
      const legLen = 12 * sc, legW = 5 * sc;
      const swing  = cr.legSwing * sc * 0.30;

      // ── legs ──
      const drawLeg = (offX: number, rot: number, col1: string, col2: string) => {
        ctx.save();
        ctx.translate(offX, -H * 0.18);
        ctx.rotate(rot * Math.PI / 180);
        ctx.fillStyle = col1;
        ctx.beginPath(); ctx.roundRect(-legW / 2, 0, legW, legLen, legW / 2); ctx.fill();
        ctx.fillStyle = col2;
        ctx.beginPath(); ctx.ellipse(0, legLen, legW * 0.9, legW * 0.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      };
      drawLeg(-5 * sc, -swing * 0.65, "#c8dff5", "#a0c4e8");
      drawLeg( 5 * sc,  swing,         "#d8eeff", "#b0d2f0");

      // ── body ──
      ctx.fillStyle = "#e4f2ff";
      ctx.beginPath(); ctx.roundRect(-W / 2, -H, W, H, W * 0.38); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.82)";
      ctx.beginPath(); ctx.ellipse(0, -H * 0.42, W * 0.32, H * 0.27, 0, 0, Math.PI * 2); ctx.fill();

      // ── arms ──
      const armSwing = cr.state === "panic" ? Math.sin(t * 0.78) * 50 : cr.state === "walk" ? swing * 0.55 : 14;
      const aL = 13 * sc, aW = 8 * sc;
      const drawArm = (offX: number, rot: number, col: string) => {
        ctx.save(); ctx.translate(offX, -H * 0.74); ctx.rotate(rot * Math.PI / 180);
        ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(-aW / 2, 0, aW, aL, aW / 2); ctx.fill(); ctx.restore();
      };
      drawArm(-W * 0.46, -armSwing - 22, "#c8dff5");
      drawArm( W * 0.46,  armSwing + 22, "#d4e8ff");

      // ── head ──
      const hy = -H - headR * 0.52;
      ctx.fillStyle = "#ecf5ff";
      ctx.beginPath(); ctx.arc(0, hy, headR, 0, Math.PI * 2); ctx.fill();
      // fluff
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      [[0, -0.62, 0.62], [-0.52, -0.52, 0.44], [0.52, -0.52, 0.44]].forEach(([ox, oy, r]) => {
        ctx.beginPath(); ctx.arc(ox * headR, hy + oy * headR, r * headR, 0, Math.PI * 2); ctx.fill();
      });
      // horns
      ctx.fillStyle = "#b8d4f0";
      [[-1, -1], [1, 1]].forEach(([s]) => {
        ctx.beginPath();
        ctx.moveTo(s * headR * 0.55, hy - headR * 0.78);
        ctx.lineTo(s * headR * 0.88, hy - headR * 1.52);
        ctx.lineTo(s * headR * 0.18, hy - headR * 0.92);
        ctx.closePath(); ctx.fill();
      });

      // ── eyes ──
      const blinking = cr.eyeBlink > 4;
      const ey  = hy - headR * 0.06;
      const eox = headR * 0.34;
      if (!blinking) {
        ctx.fillStyle = "white";
        ctx.beginPath(); ctx.ellipse(-eox, ey, 4.5 * sc, 5.5 * sc, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse( eox, ey, 4.5 * sc, 5.5 * sc, 0, 0, Math.PI * 2); ctx.fill();
        const px = cr.state === "panic" ? Math.sin(t) * 1.4 * sc : sc;
        const py = cr.state === "sleep" ? 2.2 * sc : 0;
        ctx.fillStyle = "#1a1a2e";
        ctx.beginPath(); ctx.arc(-eox + px, ey + py, 2.5 * sc, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc( eox + px, ey + py, 2.5 * sc, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath(); ctx.arc(-eox + px + sc, ey + py - sc, sc, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc( eox + px + sc, ey + py - sc, sc, 0, Math.PI * 2); ctx.fill();
        if (cr.state === "panic") {
          ctx.strokeStyle = "#ff6b35"; ctx.lineWidth = 1.5 * sc;
          ctx.beginPath(); ctx.ellipse(-eox, ey, 5.5 * sc, 7 * sc, 0, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.ellipse( eox, ey, 5.5 * sc, 7 * sc, 0, 0, Math.PI * 2); ctx.stroke();
        }
      } else {
        ctx.strokeStyle = "#5890b8"; ctx.lineWidth = 2 * sc; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(-eox - 4 * sc, ey); ctx.lineTo(-eox + 4 * sc, ey); ctx.stroke();
        ctx.beginPath(); ctx.moveTo( eox - 4 * sc, ey); ctx.lineTo( eox + 4 * sc, ey); ctx.stroke();
      }

      // ── mouth ──
      ctx.strokeStyle = "#4878a0"; ctx.lineWidth = 1.5 * sc; ctx.lineCap = "round";
      if (cr.state === "sleep") {
        ctx.fillStyle = "#5888a8"; ctx.beginPath(); ctx.arc(0, hy + headR * 0.4, 3 * sc, 0, Math.PI * 2); ctx.fill();
      } else if (cr.state === "panic") {
        ctx.fillStyle = "#ff8888"; ctx.beginPath(); ctx.arc(0, hy + headR * 0.44, 6 * sc, 0.1, Math.PI - 0.1); ctx.fill(); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(0, hy + headR * 0.3, 4.5 * sc, 0.15, Math.PI - 0.15); ctx.stroke();
      }

      ctx.restore();

      // zzz
      cr.zzzs.forEach(z => {
        ctx.save(); ctx.globalAlpha = z.alpha;
        ctx.fillStyle = "#facc15"; ctx.font = `bold ${z.size}px monospace`;
        ctx.fillText("z", z.x, z.y); ctx.restore();
      });
      // sweat
      cr.sweatDrops.forEach(d => {
        ctx.save(); ctx.globalAlpha = d.alpha;
        ctx.fillStyle = "#60c0ff";
        ctx.beginPath(); ctx.arc(d.x, d.y, 3 * sc * 0.7, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      });
    };

    // ── main loop ──
    const loop = () => {
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      update();
      drawText();
      drawCreature();
      animIdRef.current = requestAnimationFrame(loop);
    };
    animIdRef.current = requestAnimationFrame(loop);

    // ── resize ──
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cancelAnimationFrame(animIdRef.current);
        const r = setup();
        if (r) { ctx = r.ctx; cssW = r.cssW; cssH = r.cssH; fs = r.fs; }
        animIdRef.current = requestAnimationFrame(loop);
      }, 80);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [setup]);

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full ${className}`}
      style={{ imageRendering: "auto" }}
      aria-label="India's Meme Amplification Network — heading"
    />
  );
}