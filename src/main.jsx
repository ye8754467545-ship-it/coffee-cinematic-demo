import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/vazirmatn';
import '@fontsource/markazi-text/arabic-500.css';
import '@fontsource/markazi-text/arabic-700.css';
import '@fontsource/markazi-text/latin-500.css';
import '@fontsource/markazi-text/latin-700.css';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import './styles.css';
import { LangProvider } from './i18n';
import { CartProvider } from './cart';
import Header from './components/Header';
import ScrollStage from './components/ScrollStage';
import { Features, Footer, Intro, Shop } from './components/Sections';
import Menu from './components/Menu';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LangProvider>
      <CartProvider>
        <Header />
        <main>
          <ScrollStage />
          <Intro />
          <Features />
          <Menu />
          <Shop />
        </main>
        <Footer />
      </CartProvider>
    </LangProvider>
  </StrictMode>,
);
