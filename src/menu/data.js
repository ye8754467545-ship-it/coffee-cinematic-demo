import products from './products.json';
import credits from './credits.json';
import { CATEGORIES, CATEGORY_IMAGE, PRODUCT_IMAGE } from './categories';

const files = import.meta.glob('./img/*.webp', { eager: true, import: 'default' });
const IMAGES = Object.fromEntries(Object.entries(files).map(([p, src]) => [p.split('/').pop().replace('.webp', ''), src]));

export const MENU_CREDITS = Object.keys(IMAGES).filter(k => credits[k]).sort().map(k => ({ key: k, ...credits[k] }));

export function imageFor(product) {
  return IMAGES[PRODUCT_IMAGE[product.id] || CATEGORY_IMAGE[product.category]] || null;
}

export const MENU = CATEGORIES
  .map((c, i) => ({ ...c, id: `m-${i + 1}`, items: products.filter(p => p.category === c.fa) }))
  .filter(c => c.items.length);

export function searchMenu(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter(p =>
    p.name.fa.includes(q) ||
    p.name.en.toLowerCase().includes(q) ||
    p.ingredients.some(i => i.fa.includes(q) || i.en.toLowerCase().includes(q)),
  );
}

export const categoryOf = p => MENU.find(c => c.fa === p.category);
