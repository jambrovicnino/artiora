import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';

const WishlistContext = createContext();

const STORAGE_KEY = 'artiora_wishlist';

function loadWishlist() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.items && Array.isArray(parsed.items)) return parsed;
    }
    return { items: [] };
  } catch {
    return { items: [] };
  }
}

function wishlistReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_WISHLIST': {
      const artworkId = action.payload;
      const exists = state.items.includes(artworkId);
      return {
        ...state,
        items: exists
          ? state.items.filter((id) => id !== artworkId)
          : [...state.items, artworkId],
      };
    }
    case 'CLEAR_WISHLIST':
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function WishlistProvider({ children }) {
  const [state, dispatch] = useReducer(wishlistReducer, null, loadWishlist);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn(
        '[ARTIORA] localStorage poln, ne morem shraniti wishlist:',
        e.message
      );
    }
  }, [state]);

  const isWishlisted = useCallback(
    (artworkId) => state.items.includes(artworkId),
    [state.items]
  );

  const toggleWishlist = useCallback((artworkId) => {
    dispatch({ type: 'TOGGLE_WISHLIST', payload: artworkId });
  }, []);

  const clearWishlist = useCallback(() => {
    dispatch({ type: 'CLEAR_WISHLIST' });
  }, []);

  const wishlistCount = useMemo(() => state.items.length, [state.items]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist: state.items,
        isWishlisted,
        toggleWishlist,
        clearWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx)
    throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
