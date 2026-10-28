import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useLang } from '../i18n';
import { MENU_URL } from '../config';
import { MENU, categoryOf, imageFor, searchMenu } from '../menu/data';

const VARIANT_EN = { 'روبوستا': 'Robusta', 'عربیکا': 'Arabica' };

function Price({ p }) {
  const { s, num } = useLang();
  return (
    <span className="mprice">
      {p.priceMax && <small>{s.menu.from}</small>}
      <b>{num(p.price)}</b>
      <small>{s.unit}</small>
    </span>
  );
}

function Row({ p, onOpen }) {
  const { lang } = useLang();
  const img = imageFor(p);
  return (
    <li>
      <button type="button" className="mrow" onClick={() => onOpen(p)}>
        <span className="mrow__thumb">{img && <img src={img} alt="" loading="lazy" />}</span>
        <span className="mrow__text">
          <span className="mrow__name">{p.name[lang]}</span>
          {p.ingredients.length > 0 && <span className="mrow__ing">{p.ingredients.map(i => i[lang]).join(lang === 'fa' ? '، ' : ', ')}</span>}
        </span>
        <Price p={p} />
      </button>
    </li>
  );
}

// Bottom sheet with full product details. Back button / Esc / backdrop close it.
function Sheet({ product, onClose }) {
  const { s, lang, num } = useLang();
  const [shown, setShown] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (product) { setShown(product); return; }
    const id = setTimeout(() => setShown(null), 380);
    return () => clearTimeout(id);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    document.documentElement.classList.add('no-scroll');
    const onKey = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => {
      document.documentElement.classList.remove('no-scroll');
      window.removeEventListener('keydown', onKey);
    };
  }, [product, onClose]);

  if (!shown) return null;
  const p = shown;
  const img = imageFor(p);
  const cat = categoryOf(p);
  return (
    <div className={`msheet-root ${product ? 'is-open' : ''}`}>
      <div className="msheet-backdrop" onClick={onClose} />
      <div className="msheet" role="dialog" aria-modal="true" aria-labelledby="msheet-t" tabIndex={-1} ref={ref}>
        <button type="button" className="msheet__close" onClick={onClose} aria-label={s.menu.close}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
        {img && <div className="msheet__img"><img src={img} alt={p.name[lang]} /></div>}
        <div className="msheet__body">
          {cat && <p className="eyebrow">{cat[lang]}</p>}
          <h3 className="msheet__title" id="msheet-t">{p.name[lang]}</h3>
          {lang === 'fa' && <p className="msheet__desc">{p.description || s.menu.noDescription}</p>}
          {p.ingredients.length > 0 && (
            <>
              <h4 className="msheet__h">{s.menu.ingredients}</h4>
              <ul className="chips">{p.ingredients.map(i => <li key={i.fa}>{i[lang]}</li>)}</ul>
            </>
          )}
          {p.variants && p.priceMax ? (
            <>
              <h4 className="msheet__h">{s.menu.beans}</h4>
              <div className="variants">
                {[p.price, p.priceMax].map((price, i) => (
                  <div className="variant" key={i}>
                    <span>{lang === 'en' ? VARIANT_EN[p.variants[i]] || p.variants[i] : p.variants[i]}</span>
                    <span><b>{num(price)}</b> {s.unit}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="msheet__price"><b>{num(p.price)}</b> {s.unit}</p>
          )}
          <p className={`stock ${p.inStock ? '' : 'stock--out'}`}>{p.inStock ? s.menu.inStock : s.menu.outOfStock}</p>
          {img && <p className="msheet__note">{s.menu.illustrative}</p>}
        </div>
      </div>
    </div>
  );
}

export default function Menu() {
  const { s, lang } = useLang();
  const [active, setActive] = useState(MENU[0].id);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);
  const [qr, setQr] = useState('');
  const chipsRef = useRef(null);
  const results = useMemo(() => searchMenu(query), [query]);
  const url = MENU_URL || `${location.origin}${location.pathname}#menu`;

  // Opened from the QR code (…/#menu): the section only exists after React renders,
  // so the browser's own jump misses it. Jump without animating through the film.
  useEffect(() => {
    if (location.hash !== '#menu') return;
    const id = requestAnimationFrame(() => document.getElementById('menu')?.scrollIntoView({ behavior: 'instant' }));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    QRCode.toString(url, { type: 'svg', margin: 0, color: { dark: '#1c1a18', light: '#0000' } }).then(setQr).catch(() => {});
  }, [url]);

  // highlight the category being read
  useEffect(() => {
    const io = new IntersectionObserver(es => {
      const hit = es.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (hit) setActive(hit.target.id);
    }, { rootMargin: '-30% 0px -60% 0px' });
    MENU.forEach(c => { const el = document.getElementById(c.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [query]);

  useEffect(() => {
    const list = chipsRef.current;
    const chip = list?.querySelector(`[data-id="${active}"]`);
    if (!chip) return;
    const delta = chip.getBoundingClientRect().left + chip.offsetWidth / 2 - (list.getBoundingClientRect().left + list.clientWidth / 2);
    list.scrollBy({ left: delta, behavior: 'smooth' });
  }, [active]);

  // phone back button closes the sheet instead of leaving the page
  const openProduct = p => { history.pushState({ sheet: true }, ''); setOpen(p); };
  const closeProduct = useMemo(() => () => { if (history.state?.sheet) history.back(); else setOpen(null); }, []);
  useEffect(() => {
    const onPop = () => setOpen(null);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const go = id => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 140, behavior: 'smooth' });
  };

  return (
    <section className="menu" id="menu" aria-labelledby="menu-t">
      <div className="menu__head">
        <p className="eyebrow">{s.menu.eyebrow}</p>
        <h2 className="display" id="menu-t">{s.menu.title}</h2>
        <label className="msearch">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="m15.5 15.5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={s.menu.search} aria-label={s.menu.search} />
        </label>
      </div>

      {query.trim() ? (
        <div className="menu__results" aria-live="polite">
          {results.length ? <ul className="mlist">{results.map(p => <Row key={p.id} p={p} onOpen={openProduct} />)}</ul>
            : <p className="menu__empty">{s.menu.noResults}</p>}
        </div>
      ) : (
        <>
          <nav className="mchips" aria-label={s.menu.title}>
            <ul ref={chipsRef}>
              {MENU.map(c => (
                <li key={c.id}>
                  <button type="button" data-id={c.id} aria-current={active === c.id ? 'true' : undefined} onClick={() => go(c.id)}>{c[lang]}</button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="menu__cats">
            {MENU.map(c => (
              <section key={c.id} id={c.id} className="mcat" aria-labelledby={`${c.id}-t`}>
                <h3 className="mcat__title" id={`${c.id}-t`}>{c[lang]}</h3>
                <ul className="mlist">{c.items.map(p => <Row key={p.id} p={p} onOpen={openProduct} />)}</ul>
              </section>
            ))}
          </div>
        </>
      )}

      <div className="mqr">
        <div className="mqr__code" dangerouslySetInnerHTML={{ __html: qr }} />
        <div>
          <p className="mqr__title">{s.menu.qrTitle}</p>
          <p className="mqr__note">{s.menu.qrNote}</p>
          <p className="mqr__url" dir="ltr">{url}</p>
        </div>
      </div>

      <Sheet product={open} onClose={closeProduct} />
    </section>
  );
}
