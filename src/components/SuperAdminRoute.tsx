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

  const isSuperAdmin = profile?.role === 'developer';

  if (!session) {
    // Agar tizimga kirmagan bo'lsa, login sahifasiga yuborish
    return <Navigate to="/login" replace />;
  }

  if (isSuperAdmin) {
    return <Outlet />;
  } else {
    // Agar tizimga kirgan, lekin Super Admin bo'lmasa, xato xabari bilan home sahifasiga yuborish
    showError(t("common.admin_only"));
    return <Navigate to="/home" replace />;
  }
};

export default SuperAdminRoute;