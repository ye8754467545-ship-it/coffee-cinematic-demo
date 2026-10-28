import { useCallback, useEffect, useState } from 'react';

// Light/dark theme. index.html sets data-theme before first paint; this keeps it in sync.
const current = () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

export function useTheme() {
  const [theme, setTheme] = useState(current);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0e0d11' : '#3b2516');
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('scroll-theme', next); } catch { /* storage unavailable */ }
      return next;
    });
  }, []);

  return [theme, toggle];
}
