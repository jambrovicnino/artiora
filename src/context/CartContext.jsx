import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

function loadCart() {
  try {
    const data = localStorage.getItem('artiora_cart');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      return [...state, { ...action.payload, id, quantity: 1 }];
    }
    case 'REMOVE_ITEM':
      return state.filter((item) => item.id !== action.payload);
    case 'UPDATE_QUANTITY':
      return state.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      );
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, null, loadCart);

  useEffect(() => {
    try {
      localStorage.setItem('artiora_cart', JSON.stringify(cart));
    } catch (e) {
      // localStorage poln (quota exceeded) — poskusi shraniti brez slik
      console.warn('[ARTIORA] localStorage poln, shranjujem brez slik:', e.message);
      try {
        const lightCart = cart.map((item) => ({
          ...item,
          thumbnail: item.thumbnail?.slice(0, 200) + '...', // Označi da je skrajšan
          originalImage: null,
          processedImage: null,
        }));
        localStorage.setItem('artiora_cart', JSON.stringify(lightCart));
      } catch {
        console.error('[ARTIORA] localStorage poln — ne morem shraniti košarice');
      }
    }
  }, [cart]);

  const addItem = (item) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQuantity = (id, quantity) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
