"use client";

import React from "react";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedPaths?: string[]; // Guest mode uchun ruxsat etilgan yo'llar
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedPaths = [] }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
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