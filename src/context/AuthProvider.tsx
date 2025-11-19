"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import i18n from '@/i18n';

interface Profile {
  id: string;
  is_blocked: boolean;
  role: string; // Rolni ham qo'shdik
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isBlocked: boolean | null;
  isSuperAdmin: boolean; // Yangi: Super admin holati
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isBlocked, setIsBlocked] = useState<boolean | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false); // Yangi: Super admin holati
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_blocked, role') // Rolni ham tanlab olamiz
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user profile:", error.message);
      showError(i18n.t("common.error_fetching_profile", { message: error.message }));
      return null;
    }
    return data ? (data as Profile) : { id: userId, is_blocked: false, role: 'user' };
  };

  useEffect(() => {
    const getSessionAndProfile = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const profile = await fetchUserProfile(currentUser.id);
        setIsBlocked(profile?.is_blocked ?? false);
        setIsSuperAdmin(profile?.role === 'developer'); // Faqat profildagi rolga qarab belgilaymiz
      } else {
        setIsBlocked(null);
        setIsSuperAdmin(false); // Foydalanuvchi bo'lmasa, super admin emas
      }
      setLoading(false);
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true);
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const profile = await fetchUserProfile(currentUser.id);
        setIsBlocked(profile?.is_blocked ?? false);
        setIsSuperAdmin(profile?.role === 'developer'); // Faqat profildagi rolga qarab belgilaymiz
      } else {
        setIsBlocked(null);
        setIsSuperAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    isBlocked,
    isSuperAdmin, // Yangi: Super admin holati
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