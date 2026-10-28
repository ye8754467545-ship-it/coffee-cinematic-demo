import { useEffect, useState } from 'react';
import { useLang } from '../i18n';
import { useTheme } from '../theme';
import { useCart } from '../cart';

const LINKS = [['home', '#top'], ['menu', '#menu'], ['cafe', '#cafe'], ['shop', '#shop'], ['story', '#story'], ['contact', '#contact']];

export default function Header() {
  const { s, lang, setLang } = useLang();
  const [theme, toggleTheme] = useTheme();
  const { count } = useCart();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  // Transparent over the film, solid once the page content starts.
  useEffect(() => {
    const onScroll = () => {
      const stage = document.querySelector('.stage');
      setSolid(stage ? stage.getBoundingClientRect().bottom < 80 : window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = e => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const dark = theme === 'dark';
  return (
    <header className={`hdr ${solid || open ? 'hdr--solid' : ''} ${open ? 'hdr--open' : ''}`}>
      <a className="hdr__brand" href="#top" onClick={() => setOpen(false)}>
        <span className="wordmark">{s.brand}</span>
        <small className="demo-pill">{s.demo}</small>
      </a>

      <nav className="hdr__nav" id="site-nav" aria-label={lang === 'fa' ? 'بخش‌ها' : 'Sections'}>
        {LINKS.map(([k, href]) => <a key={k} href={href} onClick={() => setOpen(false)}>{s.nav[k]}</a>)}
      </nav>

      <div className="hdr__actions">
        <div className="lang" role="group" aria-label="Language">
          <button type="button" aria-pressed={lang === 'fa'} onClick={() => setLang('fa')}>فا</button>
          <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')} lang="en">EN</button>
        </div>
        <button type="button" className="icon-btn" onClick={toggleTheme} aria-label={dark ? s.themeLight : s.themeDark} aria-pressed={dark}>
          {dark ? (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
          )}
        </button>
        <a className="icon-btn cart" href="#shop" aria-label={`${s.shop.cart} (${count})`}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8zm4 0V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
          {count > 0 && <span className="cart__badge">{count}</span>}
        </a>
        <button type="button" className="icon-btn burger" aria-expanded={open} aria-controls="site-nav"
          aria-label={open ? s.menuClose : s.menuOpen} onClick={() => setOpen(o => !o)}>
          <span /><span />
        </button>
      </div>
    </header>
  );
}
