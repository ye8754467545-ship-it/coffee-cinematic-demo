import { useEffect, useRef } from 'react';
import { useLang } from '../i18n';
import { useCart } from '../cart';
import { MENU_CREDITS } from '../menu/data';

const CREDITS = MENU_CREDITS.map(c => ({ ...c, used: c.key }));

const imgs = import.meta.glob('../assets/img/*.{jpg,webp,png}', { eager: true, import: 'default' });
const img = key => Object.entries(imgs).find(([p]) => p.includes(`/${key}.`))?.[1];

// Sample prices in thousand Toman.
const PRODUCTS = [
  { key: 'p1', price: 320 },
  { key: 'p2', price: 360 },
  { key: 'p3', price: 290 },
  { key: 'p4', price: 980 },
];
const FEATURE_IMAGES = ['brewed', 'delights', 'sourced'];

// Adds .is-in to [data-reveal] children as they scroll into view.
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const els = ref.current.querySelectorAll('[data-reveal]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { els.forEach(e => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: 0.15 });
    els.forEach(e => io.observe(e));
    return () => io.disconnect();
  }, []);
  return ref;
}

const Arrow = () => (
  <svg className="arrow" viewBox="0 0 28 12" width="28" height="12" aria-hidden="true">
    <path d="M0 6h26M21 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export function Intro() {
  const { s } = useLang();
  const ref = useReveal();
  return (
    <section className="intro" id="cafe" ref={ref}>
      <div className="intro__text" data-reveal>
        <h2 className="display">{s.intro.title}</h2>
        <p className="lede">{s.intro.body}</p>
        <a className="pill" href="#story">{s.intro.cta}<Arrow /></a>
      </div>
      <div className="intro__media" data-reveal style={{ '--i': 1 }}>
        <img src={img('intro')} alt="" />
      </div>
    </section>
  );
}

export function Features() {
  const { s } = useLang();
  const ref = useReveal();
  return (
    <section className="features" id="story" ref={ref}>
      {s.features.map((f, i) => (
        <article className={`row ${i % 2 ? 'row--flip' : ''}`} key={f.n}>
          <div className="row__media" data-reveal><img src={img(FEATURE_IMAGES[i])} alt="" loading="lazy" /></div>
          <div className="row__text" data-reveal style={{ '--i': 1 }}>
            <span className="row__num">{f.n}</span>
            <h3 className="row__title">{f.t}</h3>
            <p className="row__body">{f.d}</p>
            <a className="more" href="#shop">{s.more}<Arrow /></a>
          </div>
        </article>
      ))}
    </section>
  );
}

export function Shop() {
  const { s, num } = useLang();
  const { add } = useCart();
  const ref = useReveal();
  return (
    <section className="shop" id="shop" ref={ref} aria-labelledby="shop-t">
      <h2 className="visually-hidden" id="shop-t">{s.shop.title}</h2>
      <div className="shop__grid">
        {PRODUCTS.map((p, i) => (
          <article className="prod" key={p.key} data-reveal style={{ '--i': i }}>
            <div className="prod__media"><img src={img(p.key)} alt={s.products[i]} loading="lazy" /></div>
            <div className="prod__info">
              <div>
                <h3 className="prod__name">{s.products[i]}</h3>
                <p className="prod__price">{num(p.price)} <span>{s.unit}</span></p>
              </div>
              <button type="button" className="prod__add" onClick={() => add(s.products[i])} aria-label={`${s.shop.add}: ${s.products[i]}`}>
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const SOCIAL = [
  { label: 'Instagram', d: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.2-1.6h.01' },
  { label: 'Telegram', d: 'M21 4 3 11l6 2 2 6 3-4 5 4 2-15zM9 13l9-6-7 8' },
  { label: 'WhatsApp', d: 'M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20zm5-12c0 4 3 7 7 7l1-2-2-1-1 1c-1-.5-2.5-2-3-3l1-1-1-2-2 1z' },
  { label: 'Email', d: 'M3 6h18v12H3zM3 6l9 7 9-7' },
];

export function Footer() {
  const { s } = useLang();
  const { toast } = useCart();
  return (
    <footer className="ftr" id="contact">
      <div className="ftr__contact">
        <span>{s.contact.hours}</span>
        <span>{s.contact.address}</span>
        <span className="masked" dir="ltr">{s.contact.phone}</span>
      </div>
      <div className="ftr__bar">
        <p className="ftr__rights">{s.rights}</p>
        <ul className="ftr__social">
          {SOCIAL.map(x => (
            <li key={x.label}>
              {/* placeholder links: this is a demo */}
              <a href="#contact" aria-label={x.label}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d={x.d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="ftr__note"><span className="demo-pill">{s.demoLong}</span> {s.footer}</p>
      <p className="ftr__credits">{s.credits}</p>
      {/* attribution required by the CC BY / CC BY-SA licences */}
      <details className="ftr__credits">
        <summary>{s.creditsList}</summary>
        <ul dir="ltr">
          {CREDITS.map(c => (
            <li key={c.used}>
              <a href={c.source} target="_blank" rel="noreferrer">{c.title}</a> — {c.author} · {c.license} (cropped, background removed)
            </li>
          ))}
        </ul>
      </details>

      <div className={`toast ${toast ? 'is-on' : ''}`} role="status" aria-live="polite">
        {toast && <><b>{toast.name}</b> — {s.shop.added}</>}
      </div>
    </footer>
  );
}
