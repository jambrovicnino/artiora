import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { mockArtists } from '../data/mockArtists';

const ArtistContext = createContext();

const STORAGE_KEY = 'artiora_artists';

function loadArtists() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.artists && parsed.artists.length > 0
        ? parsed
        : { artists: mockArtists };
    }
    return { artists: mockArtists };
  } catch {
    return { artists: mockArtists };
  }
}

function artistReducer(state, action) {
  switch (action.type) {
    case 'LOAD_ARTISTS':
      return { ...state, artists: action.payload };
    case 'UPDATE_ARTIST':
      return {
        ...state,
        artists: state.artists.map((a) =>
          a.id === action.payload.id ? { ...a, ...action.payload.data } : a
        ),
      };
    case 'ADD_ARTIST': {
      const id =
        'artist-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      return {
        ...state,
        artists: [...state.artists, { ...action.payload, id }],
      };
    }
    default:
      return state;
  }
}

export function ArtistProvider({ children }) {
  const [state, dispatch] = useReducer(artistReducer, null, loadArtists);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('[ARTIORA] localStorage poln, ne morem shraniti artists:', e.message);
    }
  }, [state]);

  const getArtist = useCallback(
    (id) => state.artists.find((a) => a.id === id) || null,
    [state.artists]
  );

  const getArtistBySlug = useCallback(
    (slug) => state.artists.find((a) => a.slug === slug) || null,
    [state.artists]
  );

  const updateArtist = useCallback((id, data) => {
    dispatch({ type: 'UPDATE_ARTIST', payload: { id, data } });
  }, []);

  const addArtist = useCallback((data) => {
    dispatch({ type: 'ADD_ARTIST', payload: data });
  }, []);

  return (
    <ArtistContext.Provider
      value={{
        artists: state.artists,
        getArtist,
        getArtistBySlug,
        updateArtist,
        addArtist,
      }}
    >
      {children}
    </ArtistContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useArtists() {
  const ctx = useContext(ArtistContext);
  if (!ctx) throw new Error('useArtists must be used within ArtistProvider');
  return ctx;
}
