import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

// Demo cart: counts items and shows a short confirmation. Nothing is sent anywhere.
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [count, setCount] = useState(0);
  const [toast, setToast] = useState(null);
  const timer = useRef(0);

  const add = useCallback(name => {
    setCount(c => c + 1);
    setToast({ name, id: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const value = useMemo(() => ({ count, add, toast }), [count, add, toast]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
