import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { mockCommissions } from '../data/mockCommissions';

const CommissionContext = createContext();

const STORAGE_KEY = 'artiora_commissions';

function loadData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.commissions && parsed.commissions.length > 0) return parsed;
    }
    return { commissions: mockCommissions };
  } catch {
    return { commissions: mockCommissions };
  }
}

function commissionReducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, ...action.payload };

    case 'CREATE_COMMISSION': {
      const id =
        'comm-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      const commission = {
        ...action.payload,
        id,
        status: 'pending',
        messages: [],
        quote: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...state,
        commissions: [...state.commissions, commission],
      };
    }

    case 'UPDATE_COMMISSION':
      return {
        ...state,
        commissions: state.commissions.map((c) =>
          c.id === action.payload.id
            ? { ...c, ...action.payload.data, updatedAt: new Date().toISOString() }
            : c
        ),
      };

    case 'ADD_MESSAGE':
      return {
        ...state,
        commissions: state.commissions.map((c) =>
          c.id === action.payload.commId
            ? {
                ...c,
                messages: [
                  ...(c.messages || []),
                  {
                    ...action.payload.message,
                    id:
                      'msg-' +
                      Date.now().toString(36) +
                      Math.random().toString(36).slice(2, 7),
                    timestamp: new Date().toISOString(),
                  },
                ],
                updatedAt: new Date().toISOString(),
              }
            : c
        ),
      };

    case 'SEND_QUOTE':
      return {
        ...state,
        commissions: state.commissions.map((c) =>
          c.id === action.payload.id
            ? {
                ...c,
                status: 'quoted',
                quote: action.payload.quote,
                quoteNote: action.payload.note || '',
                quotedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : c
        ),
      };

    case 'ACCEPT_QUOTE':
      return {
        ...state,
        commissions: state.commissions.map((c) =>
          c.id === action.payload
            ? {
                ...c,
                status: 'in_progress',
                quoteAcceptedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : c
        ),
      };

    case 'DELIVER':
      return {
        ...state,
        commissions: state.commissions.map((c) =>
          c.id === action.payload.commId
            ? {
                ...c,
                status: 'delivered',
                deliveredArtworkId: action.payload.artworkId,
                deliveredAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : c
        ),
      };

    case 'COMPLETE':
      return {
        ...state,
        commissions: state.commissions.map((c) =>
          c.id === action.payload
            ? {
                ...c,
                status: 'completed',
                completedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : c
        ),
      };

    case 'CANCEL':
      return {
        ...state,
        commissions: state.commissions.map((c) =>
          c.id === action.payload
            ? {
                ...c,
                status: 'cancelled',
                cancelledAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : c
        ),
      };

    default:
      return state;
  }
}

export function CommissionProvider({ children }) {
  const [state, dispatch] = useReducer(commissionReducer, null, loadData);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn(
        '[ARTIORA] localStorage poln, ne morem shraniti commissions:',
        e.message
      );
    }
  }, [state]);

  const getCommission = useCallback(
    (id) => state.commissions.find((c) => c.id === id) || null,
    [state.commissions]
  );

  const getCommissionsByArtist = useCallback(
    (artistId) => state.commissions.filter((c) => c.artistId === artistId),
    [state.commissions]
  );

  const getCommissionsByBuyer = useCallback(
    (buyerId) => state.commissions.filter((c) => c.buyerId === buyerId),
    [state.commissions]
  );

  const createCommission = useCallback((data) => {
    dispatch({ type: 'CREATE_COMMISSION', payload: data });
  }, []);

  const sendQuote = useCallback((id, quote, note) => {
    dispatch({ type: 'SEND_QUOTE', payload: { id, quote, note } });
  }, []);

  const acceptQuote = useCallback((id) => {
    dispatch({ type: 'ACCEPT_QUOTE', payload: id });
  }, []);

  const addMessage = useCallback((commId, message) => {
    dispatch({ type: 'ADD_MESSAGE', payload: { commId, message } });
  }, []);

  const deliver = useCallback((commId, artworkId) => {
    dispatch({ type: 'DELIVER', payload: { commId, artworkId } });
  }, []);

  const complete = useCallback((commId) => {
    dispatch({ type: 'COMPLETE', payload: commId });
  }, []);

  const cancel = useCallback((commId) => {
    dispatch({ type: 'CANCEL', payload: commId });
  }, []);

  return (
    <CommissionContext.Provider
      value={{
        commissions: state.commissions,
        getCommission,
        getCommissionsByArtist,
        getCommissionsByBuyer,
        createCommission,
        sendQuote,
        acceptQuote,
        addMessage,
        deliver,
        complete,
        cancel,
      }}
    >
      {children}
    </CommissionContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCommissions() {
  const ctx = useContext(CommissionContext);
  if (!ctx)
    throw new Error('useCommissions must be used within CommissionProvider');
  return ctx;
}
