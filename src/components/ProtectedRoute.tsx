"use client";

import React from "react";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  isLoggedIn: boolean; // Lokal login holatini prop sifatida qabul qilamiz
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isLoggedIn }) => {
  const isGuestMode = localStorage.getItem("isGuestMode") === "true";
  const currentPath = window.location.pathname;

  // MockTest va Records har doim ochiq bo'lishi kerak, shuning uchun ularni bu yerda tekshirmaymiz
  // Ular App.tsx da alohida Route sifatida belgilangan.

  if (isLoggedIn || isGuestMode) {
    return <Outlet />; // Agar foydalanuvchi login bo'lgan bo'lsa yoki guest mode'da bo'lsa, ruxsat berish
  }

  // Agar na login, na guest mode bo'lmasa, login sahifasiga yo'naltirish
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;