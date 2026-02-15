"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getCalendarToken, isTokenExpired } from "@/lib/calendar-store";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  hasCalendarAccess: boolean;
  setCalendarAccess: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  hasCalendarAccess: false,
  setCalendarAccess: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCalendarAccess, setCalendarAccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        try {
          const token = await getCalendarToken(firebaseUser.uid);
          setCalendarAccess(!!token && !isTokenExpired(token));
        } catch {
          setCalendarAccess(false);
        }
      } else {
        setCalendarAccess(false);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, hasCalendarAccess, setCalendarAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
