import { createContext, useContext, useEffect, useMemo, useState } from 'react';

// All copy for the demo café. Brand, prices and contact details are placeholders.
const STRINGS = {
  fa: {
    brand: 'نمونه',
    demo: 'نمونه کار',
    demoLong: 'نمونه کار — وب‌سایت نمایشی',
    themeDark: 'حالت شب', themeLight: 'حالت روز',
    scroll: 'اسکرول کنید',
    hero: {
      eyebrow: 'کافه نمونه · از ۱۴۰۰',
      title: 'هر فنجان،\nیک لحظه',
      sub: 'قهوه‌ای که با حوصله دم می‌شود؛ از دانه تا آخرین قطره.',
      cta: 'مشاهده منو',
    },
    beats: [
      { k: '۰۱', t: 'دانه‌ی تازه‌برشته', d: 'هر هفته در مقدار کم برشته می‌شود تا عطرش بماند.' },
      { k: '۰۲', t: 'عصاره‌گیری دقیق', d: 'دما، زمان و آسیاب برای هر دانه جداگانه تنظیم می‌شود.' },
      { k: '۰۳', t: 'کرمای طلایی', d: 'لایه‌ای نرم و شیرین که نشان می‌دهد قهوه درست دم شده است.' },
    ],
    everyday: { eyebrow: 'تازه دم', title: 'قهوه‌ی هر روزت', cta: 'سفارش از منو' },
    unit: 'هزار تومان',
    intro: {
      title: 'ساخته‌شده برای\nلحظه‌های ناب\nقهوه',
      body: 'قهوه‌ی تخصصی، با دقت انتخاب‌شده و با حوصله برشته‌شده؛ برای طعمی خالص، غنی و ماندگار.',
      cta: 'آشنایی با کافه',
    },
    features: [
      { n: '۰۱', t: 'دم‌آوری\nاستادانه', d: 'هر فنجان با دقت و علاقه دم می‌شود تا طعمی شفاف، متعادل و به‌طور طبیعی شیرین داشته باشد.' },
      { n: '۰۲', t: 'دسرهای\nدست‌ساز', d: 'با مواد مرغوب و دست خودمان درست می‌شوند تا کنار قهوه بهترین همراه باشند.' },
      { n: '۰۳', t: 'دانه‌هایی\nبا انتخاب آگاهانه', d: 'با کشاورزانی کار می‌کنیم که مثل ما به کیفیت، پایداری و تجارت منصفانه اهمیت می‌دهند.' },
    ],
    more: 'بیشتر بدانید',
    shop: { title: 'فروشگاه', added: 'به سبد اضافه شد', add: 'افزودن به سبد', cart: 'سبد خرید' },
    products: ['دانه‌ی قهوه', 'برشت تیره', 'ماگ سرامیکی', 'ست قهوه‌ساز دمی'],
    creditsList: 'منبع و مجوز عکس‌ها',
    menu: {
      eyebrow: 'منوی کافه', title: 'منو',
      search: 'جست‌وجو: نام نوشیدنی، غذا یا ماده اولیه…', noResults: 'چیزی پیدا نشد. نام دیگری را امتحان کنید.',
      from: 'از', ingredients: 'مواد تشکیل‌دهنده', beans: 'انتخاب دانه',
      inStock: 'موجود', outOfStock: 'ناموجود', close: 'بستن',
      illustrative: 'تصویر نمایشی است.', noDescription: 'توضیحی برای این محصول ثبت نشده است.',
      qrTitle: 'منو روی میز شما', qrNote: 'مشتری با اسکن این کد روی میز، مستقیم به همین منو می‌آید.',
    },
    nav: { home: 'خانه', menu: 'منو', cafe: 'کافه', shop: 'فروشگاه', story: 'داستان ما', contact: 'تماس' },
    contact: { hours: 'هر روز ۹ صبح تا ۱۱ شب', address: 'شهر ****، خیابان ********، پلاک **', phone: '۰۹۱۲ *** ****' },
    rights: '© ۱۴۰۵ نمونه. همه‌ی حقوق محفوظ است.',
    menuOpen: 'باز کردن منو', menuClose: 'بستن منو',
    footer: 'این یک وب‌سایت نمونه برای نمایش طراحی است. نام کافه، قیمت‌ها و اطلاعات تماس نمایشی‌اند.',
    credits: 'ویدیوها و عکس‌های صفحه با هوش مصنوعی (Google Flow) ساخته شده‌اند. عکس‌های منو از Wikimedia Commons با مجوز آزاد است.',
  },
  en: {
    brand: 'SAMPLE',
    demo: 'Demo',
    demoLong: 'Portfolio demo — sample website',
    themeDark: 'Dark mode', themeLight: 'Light mode',
    scroll: 'Scroll',
    hero: {
      eyebrow: 'Sample Café · since 2021',
      title: 'Made for\nthe moment',
      sub: 'Coffee brewed without hurry — from the bean to the last drop.',
      cta: 'See the menu',
    },
    beats: [
      { k: '01', t: 'Freshly roasted', d: 'Roasted weekly in small batches so the aroma stays.' },
      { k: '02', t: 'Precisely extracted', d: 'Temperature, time and grind tuned for every bean.' },
      { k: '03', t: 'Golden crema', d: 'A soft, sweet layer that tells you it was brewed right.' },
    ],
    everyday: { eyebrow: 'Freshly brewed', title: 'Your everyday coffee', cta: 'Order from the menu' },
    unit: 'K Toman',
    intro: {
      title: 'Made for\nunhurried\ncoffee moments',
      body: 'Specialty coffee, carefully sourced and patiently roasted for a clean, rich and lasting flavour.',
      cta: 'Explore our café',
    },
    features: [
      { n: '01', t: 'Expertly\nbrewed', d: 'Every cup is brewed with care and precision for clarity, balance and a naturally sweet finish.' },
      { n: '02', t: 'Hand-made\ntreats', d: 'Made in-house from fine ingredients to sit perfectly beside your coffee.' },
      { n: '03', t: 'Beans chosen\nwith intention', d: 'We work with growers who share our care for quality, sustainability and fair trade.' },
    ],
    more: 'Discover more',
    shop: { title: 'Shop', added: 'Added to cart', add: 'Add to cart', cart: 'Cart' },
    products: ['Whole Beans', 'Dark Roast', 'Stoneware Mug', 'Pour-over Set'],
    creditsList: 'Photo sources & licences',
    menu: {
      eyebrow: 'Café menu', title: 'Menu',
      search: 'Search: drink, dish or ingredient…', noResults: 'Nothing found. Try another name.',
      from: 'from', ingredients: 'Ingredients', beans: 'Bean choice',
      inStock: 'Available', outOfStock: 'Unavailable', close: 'Close',
      illustrative: 'Illustrative photo.', noDescription: 'No description for this item yet.',
      qrTitle: 'The menu at your table', qrNote: 'Guests scan this code at the table and land right on this menu.',
    },
    nav: { home: 'Home', menu: 'Menu', cafe: 'Café', shop: 'Shop', story: 'Our story', contact: 'Contact' },
    contact: { hours: 'Daily, 9 AM – 11 PM', address: '******** St., No. **, ****', phone: '0912 *** ****' },
    rights: '© 2026 Sample. All rights reserved.',
    menuOpen: 'Open menu', menuClose: 'Close menu',
    footer: 'This is a sample website showcasing a design. The café name, prices and contact details are placeholders.',
    credits: 'Videos and page photos were generated with AI (Google Flow). Menu photos are from Wikimedia Commons under free licences.',
  },
};

const LangContext = createContext(null);

function initialLang() {
  try {
    const saved = localStorage.getItem('scroll-lang');
    if (saved === 'fa' || saved === 'en') return saved;
  } catch { /* storage unavailable */ }
  return 'fa';
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    try { localStorage.setItem('scroll-lang', lang); } catch { /* ignore */ }
  }, [lang]);

  const value = useMemo(() => {
    const nf = new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US');
    return { lang, setLang, s: STRINGS[lang], num: n => nf.format(n) };
  }, [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
