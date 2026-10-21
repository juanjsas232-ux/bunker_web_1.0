import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { verifyLocalCredentials } from '../lib/authCrypto';

interface AuthUser {
  id: string;
  email: string;
  role: 'admin';
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_KEY = 'bunker_admin_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check Supabase session first, else check local session
    const checkSession = async () => {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            setUser({
              id: data.session.user.id,
              email: data.session.user.email || 'admin@bunker.com.ar',
              role: 'admin',
            });
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase auth session check:', e);
        }
      }

      // Fallback local session
      const saved = localStorage.getItem(LOCAL_AUTH_KEY);
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch (e) {
          localStorage.removeItem(LOCAL_AUTH_KEY);
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    // Try Supabase auth if client is active
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });
        if (!error && data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            role: 'admin',
          };
          setUser(authUser);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authUser));
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase login attempted, checking fallback credentials:', err.message);
      }
    }

    // Secure cryptographic verification (no plain passwords stored in codebase)
    const verification = await verifyLocalCredentials(email, pass);
    if (verification.valid) {
      const authUser: AuthUser = {
        id: 'usr-admin-bunker',
        email: verification.email,
        role: 'admin',
      };
      setUser(authUser);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authUser));
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return {
      success: false,
      error: 'Credenciales inválidas. Verifique su correo y contraseña.',
    };
  };

  const logout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    setUser(null);
    localStorage.removeItem(LOCAL_AUTH_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
