'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, type FirebaseUser } from '@/lib/firebase';
import { refreshCachedToken, setCachedToken } from '@/lib/trpc';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  userType: 'agency' | 'company' | null;
  setUserType: (type: 'agency' | 'company' | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userType: null,
  setUserType: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'agency' | 'company' | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const token = await refreshCachedToken();

        // Detect user type from backend context
        if (token) {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/trpc/health`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            // Check user type header or infer from stored value
            const storedType = localStorage.getItem('bzr_user_type');
            if (storedType === 'agency' || storedType === 'company') {
              setUserType(storedType);
            }
          } catch {
            // Fallback to stored type
            const storedType = localStorage.getItem('bzr_user_type');
            if (storedType === 'agency' || storedType === 'company') {
              setUserType(storedType);
            }
          }
        }
      } else {
        setCachedToken(null);
        setUserType(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSetUserType = (type: 'agency' | 'company' | null) => {
    setUserType(type);
    if (type) {
      localStorage.setItem('bzr_user_type', type);
    } else {
      localStorage.removeItem('bzr_user_type');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, userType, setUserType: handleSetUserType }}>
      {children}
    </AuthContext.Provider>
  );
}
