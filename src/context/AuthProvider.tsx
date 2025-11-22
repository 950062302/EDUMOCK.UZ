"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { showSuccess, showError } from '@/utils/toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Dastlab true
  const { t } = useTranslation();

  useEffect(() => {
    // 1. Dastlabki sessiyani olish
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false); // Dastlabki yuklash tugadi
    };

    getInitialSession();

    // 2. Auth holati o'zgarishlarini tinglash
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[Auth] Event: ${event}, Session: ${session ? 'Active' : 'Inactive'}`);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Agar SIGNED_IN yoki SIGNED_OUT bo'lsa, loadingni false qilish
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
        setLoading(false);
      }

      // URL hashini tekshirish (masalan, email o'zgarishi yoki parolni tiklashdan keyin)
      if (window.location.hash.includes('access_token') && window.location.hash.includes('type=recovery')) {
        // Recovery tokenlaridan sessiyani o'rnatish logikasi (bu onAuthStateChange ichida ham ishlaydi)
        if (session) {
          showSuccess(t("user_profile_page.success_recovery_login"));
        } else {
          showError(t("user_profile_page.error_recovery_login_failed"));
        }
        // URL hashini tozalash
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
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