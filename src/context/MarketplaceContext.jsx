import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { mockArtworks } from '../data/mockArtworks';

const MarketplaceContext = createContext();

const STORAGE_KEY = 'artiora_marketplace';

function loadData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.artworks && parsed.artworks.length > 0) return parsed;
    }
    return { artworks: mockArtworks, editions: [] };
  } catch {
    return { artworks: mockArtworks, editions: [] };
  }
}

function marketplaceReducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, ...action.payload };

    case 'ADD_ARTWORK': {
      const id =
        'artwork-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      const artwork = {
        ...action.payload,
        id,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      return { ...state, artworks: [...state.artworks, artwork] };
    }

    case 'UPDATE_ARTWORK':
      return {
        ...state,
        artworks: state.artworks.map((a) =>
          a.id === action.payload.id ? { ...a, ...action.payload.data } : a
        ),
      };

    case 'APPROVE_ARTWORK':
      return {
        ...state,
        artworks: state.artworks.map((a) =>
          a.id === action.payload.id
            ? {
                ...a,
                status: 'approved',
                certificateId: action.payload.certificateId,
                approvedAt: new Date().toISOString(),
              }
            : a
        ),
      };

    case 'REJECT_ARTWORK':
      return {
        ...state,
        artworks: state.artworks.map((a) =>
          a.id === action.payload.id
            ? {
                ...a,
                status: 'rejected',
                rejectionReason: action.payload.reason,
                rejectedAt: new Date().toISOString(),
              }
            : a
        ),
      };

    case 'PURCHASE_EDITION': {
      const { artworkId, buyerId } = action.payload;
      const artwork = state.artworks.find((a) => a.id === artworkId);
      if (!artwork) return state;

      const editionNumber = state.editions.filter(
        (e) => e.artworkId === artworkId
      ).length + 1;

      const edition = {
        id: `edition-${artworkId}-${String(editionNumber).padStart(3, '0')}`,
        artworkId,
        editionNumber,
        totalEditions: artwork.totalEditions || 1,
        buyerId,
        purchasedAt: new Date().toISOString(),
        price: artwork.price,
      };

      const soldCount = editionNumber;
      const updatedArtworks = state.artworks.map((a) =>
        a.id === artworkId
          ? {
              ...a,
              soldEditions: soldCount,
              available:
                a.totalEditions != null ? soldCount < a.totalEditions : true,
            }
          : a
      );

      return {
        ...state,
        artworks: updatedArtworks,
        editions: [...state.editions, edition],
      };
    }

    default:
      return state;
  }
}

export function MarketplaceProvider({ children }) {
  const [state, dispatch] = useReducer(marketplaceReducer, null, loadData);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn(
        '[ARTIORA] localStorage poln, ne morem shraniti marketplace:',
        e.message
      );
    }
  }, [state]);

  const getArtwork = useCallback(
    (id) => state.artworks.find((a) => a.id === id) || null,
    [state.artworks]
  );

  const getArtworksByArtist = useCallback(
    (artistId) => state.artworks.filter((a) => a.artistId === artistId),
    [state.artworks]
  );

  const filterArtworks = useCallback(
    (filters = {}) => {
      const {
        category,
        medium,
        editionType,
        priceMin,
        priceMax,
        tier,
        search,
        sort,
      } = filters;

      let results = [...state.artworks];

      if (category) {
        results = results.filter((a) => a.category === category);
      }
      if (medium) {
        results = results.filter((a) => a.medium === medium);
      }
      if (editionType) {
        results = results.filter((a) => a.editionType === editionType);
      }
      if (priceMin != null) {
        results = results.filter((a) => a.price >= priceMin);
      }
      if (priceMax != null) {
        results = results.filter((a) => a.price <= priceMax);
      }
      if (tier) {
        results = results.filter((a) => a.tier === tier);
      }
      if (search) {
        const q = search.toLowerCase();
        results = results.filter(
          (a) =>
            (a.title && a.title.toLowerCase().includes(q)) ||
            (a.artist && a.artist.toLowerCase().includes(q)) ||
            (a.description && a.description.toLowerCase().includes(q))
        );
      }

      if (sort) {
        switch (sort) {
          case 'price-asc':
            results.sort((a, b) => (a.price || 0) - (b.price || 0));
            break;
          case 'price-desc':
            results.sort((a, b) => (b.price || 0) - (a.price || 0));
            break;
          case 'newest':
            results.sort(
              (a, b) =>
                new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            );
            break;
          case 'oldest':
            results.sort(
              (a, b) =>
                new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
            );
            break;
          case 'title-asc':
            results.sort((a, b) =>
              (a.title || '').localeCompare(b.title || '', 'sl')
            );
            break;
          case 'title-desc':
            results.sort((a, b) =>
              (b.title || '').localeCompare(a.title || '', 'sl')
            );
            break;
          default:
            break;
        }
      }

      return results;
    },
    [state.artworks]
  );

  const addArtwork = useCallback((data) => {
    dispatch({ type: 'ADD_ARTWORK', payload: data });
  }, []);

  const updateArtwork = useCallback((id, data) => {
    dispatch({ type: 'UPDATE_ARTWORK', payload: { id, data } });
  }, []);

  const approveArtwork = useCallback((id, certificateId) => {
    dispatch({ type: 'APPROVE_ARTWORK', payload: { id, certificateId } });
  }, []);

  const rejectArtwork = useCallback((id, reason) => {
    dispatch({ type: 'REJECT_ARTWORK', payload: { id, reason } });
  }, []);

  const purchaseEdition = useCallback((artworkId, buyerId) => {
    dispatch({ type: 'PURCHASE_EDITION', payload: { artworkId, buyerId } });
  }, []);

  return (
    <MarketplaceContext.Provider
      value={{
        artworks: state.artworks,
        editions: state.editions,
        getArtwork,
        getArtworksByArtist,
        filterArtworks,
        addArtwork,
        updateArtwork,
        approveArtwork,
        rejectArtwork,
        purchaseEdition,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMarketplace() {
  const ctx = useContext(MarketplaceContext);
  if (!ctx)
    throw new Error('useMarketplace must be used within MarketplaceProvider');
  return ctx;
}
