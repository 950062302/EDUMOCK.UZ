"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import type { RecordModel } from "pocketbase";
import { pb } from "@/integrations/pocketbase/client";
import { useTranslation } from 'react-i18next';

interface AuthContextType {
  session: { token: string } | null;
  user: RecordModel | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [user, setUser] = useState<RecordModel | null>(null);
  const [loading, setLoading] = useState(true); // Dastlab true
  const { t } = useTranslation();

  useEffect(() => {
    const syncFromStore = () => {
      const token = pb.authStore.token;
      const model = pb.authStore.model ?? null;
      setSession(token ? { token } : null);
      setUser(model);
    };

    // 1) Initial state
    syncFromStore();
    setLoading(false);

    // 2) Listen changes
    const unsubscribe = pb.authStore.onChange(() => {
      syncFromStore();
    }, true);

    // PocketBase flow'da Supabase recovery hash yo'q; eski toastlar endi ishlatilmaydi.
    // Agar keyin email reset/confirm flow qo'shsak, PocketBase endpointlari bilan qayta ulaymiz.

    return () => {
      unsubscribe();
    };
  }, [t]);

  const value = {
    session,
    user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};