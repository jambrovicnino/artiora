import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { mockUsers } from '../data/mockUsers';

const AuthContext = createContext();

const STORAGE_KEY = 'artiora_auth';

function loadAuth() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data
      ? JSON.parse(data)
      : { user: null, isAuthenticated: false };
  } catch {
    return { user: null, isAuthenticated: false };
  }
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        user: action.payload,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, null, loadAuth);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('[ARTIORA] localStorage poln, ne morem shraniti auth:', e.message);
    }
  }, [state]);

  const login = useCallback((email, password) => {
    const found = mockUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) {
      return { success: false, error: 'Napačen e-mail ali geslo' };
    }
    const { password: _pw, ...safeUser } = found;
    dispatch({ type: 'LOGIN', payload: safeUser });
    return { success: true, user: safeUser };
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateProfile = useCallback((data) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: data });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
