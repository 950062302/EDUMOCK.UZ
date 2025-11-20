"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next'; // useTranslation import qilish
import { showSuccess, showError } from '@/utils/toast'; // Toast xabarlari uchun

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation(); // useTranslation hookini ishlatish

  useEffect(() => {
    const handleAuthRedirect = async () => {
      setLoading(true);
      
      // Supabase'dan joriy sessiyani olishga urinish
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      // URL hashini tekshirish (masalan, email o'zgarishi yoki parolni tiklashdan keyin)
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1)); // '#' belgisini olib tashlash
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');

      if (accessToken && refreshToken && type === 'recovery') {
        console.log("AuthProvider: URLda recovery tokenlari topildi. Sessiyani o'rnatishga urinilmoqda.");
        const { data: { session: newSession }, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("AuthProvider: Recovery tokenlaridan sessiyani o'rnatishda xatolik:", error.message);
          showError(t("user_profile_page.error_recovery_login_failed"));
        } else if (newSession) {
          console.log("AuthProvider: Recovery tokenlaridan sessiya muvaffaqiyatli o'rnatildi.");
          setSession(newSession);
          setUser(newSession.user);
          showSuccess(t("user_profile_page.success_recovery_login"));
        }

        // URL hashini tozalash, qayta ishlashni oldini olish uchun
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      }
      setLoading(false);
    };

    handleAuthRedirect();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [t]); // t ni dependency arrayga qo'shish

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