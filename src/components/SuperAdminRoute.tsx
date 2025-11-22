"use client";

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import { useProfile } from "@/hooks/use-profile";
import { useTranslation } from 'react-i18next';
import { showError } from "@/utils/toast";

const SuperAdminRoute: React.FC = () => {
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { t } = useTranslation();

  const loading = authLoading || profileLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  // 1. Tizimga kirmagan bo'lsa, login sahifasiga yuborish
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // 2. Profil ma'lumotlari yuklanganidan keyin rolni tekshirish
  const isSuperAdmin = profile?.role === 'developer';

  if (isSuperAdmin) {
    return <Outlet />;
  } else {
    // Agar tizimga kirgan, lekin Super Admin bo'lmasa, xato xabari bilan home sahifasiga yuborish
    // Xato xabarini faqat bir marta ko'rsatish uchun session storage dan foydalanishimiz mumkin,
    // lekin hozircha shunday qoldiramiz.
    showError(t("common.admin_only"));
    return <Navigate to="/home" replace />;
  }
};

export default SuperAdminRoute;