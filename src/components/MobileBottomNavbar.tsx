"use client";

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Search, User, ShoppingCart, Settings as SettingsIcon, Info, LogOut } from "lucide-react"; // Added SettingsIcon, Info, LogOut
import { useTranslation } from 'react-i18next';
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileBottomNavbarProps {
  handleLogout: () => void;
  setIsGuideDialogOpen: (isOpen: boolean) => void;
  isGuestMode: boolean;
  session: any; // Adjust type as needed for your session object
}

const MobileBottomNavbar: React.FC<MobileBottomNavbarProps> = ({
  handleLogout,
  setIsGuideDialogOpen,
  isGuestMode,
  session,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  const navItems = [
    { icon: Home, label: t("common.home"), path: "/home", action: () => navigate("/home") },
    { icon: Search, label: t("home_page.questions"), path: "/questions", action: () => navigate("/questions") },
    { icon: User, label: t("common.profile"), path: "/user-profile", action: () => navigate("/user-profile") },
    { icon: ShoppingCart, label: t("home_page.records"), path: "/records", action: () => navigate("/records") },
    { icon: SettingsIcon, label: t("common.settings"), path: "/settings", action: () => navigate("/settings") },
    { icon: Info, label: t("common.guide"), path: "#guide", action: () => setIsGuideDialogOpen(true) },
    { icon: LogOut, label: isGuestMode && !session ? t("common.guest_mode_exit") : t("common.logout"), path: "/login", action: async () => { await handleLogout(); navigate("/login"); } },
  ];

  return (
    <div className="button-container">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path && item.path !== "#guide"; // Guide is not a route
        return (
          <button
            key={item.path}
            className={cn("button", isActive ? "active-button" : "")}
            onClick={item.action}
            aria-label={item.label}
          >
            <item.icon className="icon" />
          </button>
        );
      })}
    </div>
  );
};

export default MobileBottomNavbar;