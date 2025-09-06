"use client";

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Session } from "@supabase/supabase-js";

interface ProtectedRouteProps {
  session: Session | null; // Supabase sessiyasini prop sifatida qabul qilamiz
  allowedPaths?: string[]; // Guest mode uchun ruxsat etilgan yo'llar
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ session, allowedPaths = [] }) => {
  const isLoggedIn = !!session; // Supabase sessiyasi mavjud bo'lsa, login bo'lgan hisoblanadi
  const isGuestMode = localStorage.getItem("isGuestMode") === "true";
  const currentPath = window.location.pathname;

  if (isLoggedIn) {
    return <Outlet />; // Agar foydalanuvchi tizimga kirgan bo'lsa, ruxsat berish
  }

  if (isGuestMode) {
    // Agar guest mode bo'lsa, faqat ruxsat etilgan yo'llarga kirishga ruxsat berish
    if (allowedPaths.includes(currentPath)) {
      return <Outlet />;
    } else {
      // Boshqa barcha yo'llarni /mock-test ga yo'naltirish
      return <Navigate to="/mock-test" replace />;
    }
  }

  // Agar na login, na guest mode bo'lmasa, login sahifasiga yo'naltirish
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;