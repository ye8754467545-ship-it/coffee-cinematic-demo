import { useCallback, useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n';

// Scroll-driven film: the pour sequence, then the camera diving into the cup,
// then a crossfade to the looping crema swirl. One pinned stage, one canvas.
const POUR = 96;
const DIVE = 96;
const BLEND = 8;            // frames used to dissolve the pour into the dive
const base = import.meta.env.BASE_URL;
const frameUrl = (seq, i) => `${base}seq/${seq}/${String(i + 1).padStart(3, '0')}.webp`;

// Share of the stage's scroll given to each part.
const P_POUR_END = 0.5;
const P_DIVE_END = 0.86;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (p, a, b) => clamp((p - a) / (b - a));
// 0 → 1 → 0 over [a, b], with soft edges
const window01 = (p, a, b, edge = 0.06) => Math.min(span(p, a, a + edge), 1 - span(p, b - edge, b));

function useFrames(seq, count, start) {
  const imgs = useRef([]);
  useEffect(() => {
    if (!start) return;
    let cancelled = false;
    // Load every 4th frame first so scrubbing works early, then fill the gaps.
    const order = [];
    for (let step of [4, 2, 1]) for (let i = 0; i < count; i += step) if (!order.includes(i)) order.push(i);
    let k = 0;
    const next = () => {
      if (cancelled || k >= order.length) return;
      const i = order[k++];
      const img = new Image();
      img.decoding = 'async';
      img.onload = img.onerror = () => { imgs.current[i] = img; next(); };
      img.src = frameUrl(seq, i);
    };
    for (let n = 0; n < 6; n++) next();
    return () => { cancelled = true; };
  }, [seq, count, start]);
  // nearest loaded frame (stable function so the draw loop is set up once)
  return useCallback(i => {
    for (let d = 0; d < count; d++) {
      const a = imgs.current[i - d]; if (a?.naturalWidth) return a;
      const b = imgs.current[i + d]; if (b?.naturalWidth) return b;
    }
    return null;
  }, [count]);
}

export default function ScrollStage() {
  const { s } = useLang();
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const [p, setP] = useState(0);
  const [diveReady, setDiveReady] = useState(false);
  const pour = useFrames('pour', POUR, true);
  const dive = useFrames('dive', DIVE, diveReady);

  // Start loading the dive once the page has settled.
  useEffect(() => { const id = setTimeout(() => setDiveReady(true), 1200); return () => clearTimeout(id); }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let last = -1;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      last = -1;
    };

    // 1×16 sample of the current frame: its first and last pixels are the average
    // colours of the frame's top and bottom edges, used to extend the footage.
    const probe = document.createElement('canvas');
    probe.width = 1; probe.height = 16;
    const pctx = probe.getContext('2d', { willReadFrequently: true });
    const rgb = (d, i, k = 1) => `rgb(${d[i] * k | 0},${d[i + 1] * k | 0},${d[i + 2] * k | 0})`;

    const draw = progress => {
      const W = canvas.width, H = canvas.height;
      ctx.fillStyle = '#3b2516';
      ctx.fillRect(0, 0, W, H);

      const pourP = span(progress, 0, P_POUR_END);
      const diveP = span(progress, P_POUR_END, P_DIVE_END);
      const inDive = progress > P_POUR_END;

      const fw = 1280, fh = 720;
      const cover = Math.max(W / fw, H / fh);
      // On portrait screens show the whole cup first, then zoom in with the camera.
      const fit = Math.min(cover, (W * 1.85) / fw);
      const scale = fit + (cover - fit) * (inDive ? diveP : 0);
      const dw = fw * scale, dh = fh * scale;
      const dx = (W - dw) / 2, dy = (H - dh) / 2;

      const letterbox = dh < H - 2;

      // Draws a frame; where it does not fill the screen its top and bottom
      // edges fade out in thin strips so the footage melts into the backdrop.
      const put = (img, alpha = 1) => {
        if (!img) return;
        if (!letterbox) {
          ctx.globalAlpha = alpha;
          ctx.drawImage(img, dx, dy, dw, dh);
          ctx.globalAlpha = 1;
          return;
        }
        const iw = img.naturalWidth, ih = img.naturalHeight;
        const steps = 28, fade = 0.2;            // share of the frame height used for each fade
        const sh = (ih * fade) / steps, dsh = (dh * fade) / steps;
        for (let k = 0; k < steps; k++) {
          ctx.globalAlpha = alpha * ((k + 0.5) / steps) ** 1.6;
          ctx.drawImage(img, 0, k * sh, iw, sh, dx, dy + k * dsh, dw, dsh + 1);
          ctx.drawImage(img, 0, ih - (k + 1) * sh, iw, sh, dx, dy + dh - (k + 1) * dsh, dw, dsh + 1);
        }
        ctx.globalAlpha = alpha;
        ctx.drawImage(img, 0, ih * fade, iw, ih * (1 - 2 * fade), dx, dy + dh * fade, dw, dh * (1 - 2 * fade));
        ctx.globalAlpha = 1;
      };

      const current = inDive ? dive(Math.round(diveP * (DIVE - 1))) : pour(Math.round(pourP * (POUR - 1)));
      if (letterbox && current) {
        // extend the frame's own edge colours above and below it, darkening towards the screen edge
        pctx.drawImage(current, 0, 0, current.naturalWidth, current.naturalHeight, 0, 0, 1, 16);
        const d = pctx.getImageData(0, 0, 1, 16).data;
        const top = ctx.createLinearGradient(0, 0, 0, dy + dh * 0.2);
        top.addColorStop(0, rgb(d, 0, 0.62));
        top.addColorStop(1, rgb(d, 0));
        ctx.fillStyle = top;
        ctx.fillRect(0, 0, W, dy + dh * 0.2);
        const by = dy + dh * 0.8;
        const bottom = ctx.createLinearGradient(0, by, 0, H);
        bottom.addColorStop(0, rgb(d, 60));
        bottom.addColorStop(1, rgb(d, 60, 0.62));
        ctx.fillStyle = bottom;
        ctx.fillRect(0, by, W, H - by);
      }

      if (!inDive) {
        put(current);
      } else {
        const di = Math.round(diveP * (DIVE - 1));
        if (di < BLEND) put(pour(POUR - 1));
        put(current, di < BLEND ? (di + 1) / BLEND : 1);
      }
    };

    const tick = () => {
      raf = 0;
      const r = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const progress = clamp(-r.top / total);
      setP(progress);
      if (progress !== last) { draw(progress); last = progress; }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };

    size();
    tick();
    // redraw while frames stream in
    const poll = setInterval(() => { last = -1; onScroll(); }, 250);
    const stopPoll = setTimeout(() => clearInterval(poll), 15000);
    const onResize = () => { size(); onScroll(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
      clearInterval(poll); clearTimeout(stopPoll);
    };
  }, [pour, dive]);

  const intro = 1 - span(p, 0.06, 0.16);
  const swirl = span(p, P_DIVE_END - 0.02, 0.94);
  const beats = [
    window01(p, 0.17, 0.36),
    window01(p, 0.38, 0.56),
    window01(p, 0.6, 0.82),
  ];

  return (
    <section className="stage" ref={sectionRef} id="top">
      <div className="stage__pin">
        <video className="stage__swirl" src={`${base}media/swirl.mp4`} poster={`${base}media/swirl-poster.webp`}
          autoPlay muted loop playsInline preload="metadata" aria-hidden="true" style={{ opacity: swirl }} />
        <canvas ref={canvasRef} className="stage__canvas" style={{ opacity: 1 - swirl }} aria-hidden="true" />
        <div className="stage__tint" aria-hidden="true" />

        <div className="stage__intro" style={{ opacity: intro, transform: `translateY(${(1 - intro) * -30}px)` }} aria-hidden={intro < 0.1}>
          <p className="eyebrow">{s.hero.eyebrow}</p>
          <h1 className="stage__title">{s.hero.title}</h1>
          <p className="stage__sub">{s.hero.sub}</p>
          <a className="btn btn--light" href="#menu">{s.hero.cta}</a>
        </div>

        {s.beats.map((b, i) => (
          <div key={b.k} className={`beat beat--${i}`} style={{ opacity: beats[i], transform: `translateY(${(1 - beats[i]) * 24}px)` }} aria-hidden={beats[i] < 0.1}>
            <span className="beat__k">{b.k}</span>
            <h2 className="beat__t">{b.t}</h2>
            <p className="beat__d">{b.d}</p>
          </div>
        ))}

        <div className="stage__everyday" style={{ opacity: swirl, transform: `scale(${0.94 + swirl * 0.06})` }} aria-hidden={swirl < 0.1}>
          <p className="eyebrow eyebrow--rule">{s.everyday.eyebrow}</p>
          <h2 className="stage__big">{s.everyday.title}</h2>
          <a className="btn btn--light" href="#menu" tabIndex={swirl < 0.5 ? -1 : 0}>{s.everyday.cta}</a>
        </div>

        <div className="stage__hint" style={{ opacity: intro }} aria-hidden="true">
          <span>{s.scroll}</span><i />
        </div>
        <div className="stage__bar" aria-hidden="true"><i style={{ transform: `scaleX(${p})` }} /></div>
      </div>
    </section>
  );
}
