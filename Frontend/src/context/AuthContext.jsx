import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { fetchMe, logout as apiLogout } from '../api/auth';
import { saveToLibrary } from '../api/excuses';
import { saveBattleResult } from '../api/library';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const prevUser = useRef(null);

  useEffect(() => {
    fetchMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // 로그인 직후 pending 저장 처리
  useEffect(() => {
    if (!user || prevUser.current) { prevUser.current = user; return; }
    prevUser.current = user;

    const raw = localStorage.getItem('pendingSave');
    if (!raw) return;
    localStorage.removeItem('pendingSave');

    try {
      const { type, data } = JSON.parse(raw);
      if (type === 'battle') saveBattleResult(data).catch(() => {});
      if (type === 'card') saveToLibrary(data).catch(() => {});
    } catch {}
  }, [user]);

  const logout = () => {
    apiLogout()
      .catch(() => {})
      .finally(() => setUser(null));
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
