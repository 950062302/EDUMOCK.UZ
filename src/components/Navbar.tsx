"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, User, Settings, Home as HomeIcon, ListChecks, ImagePlus, BookOpen, Video } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { showSuccess } from "@/utils/toast";

const allNavLinks = [
  { name: "Home", path: "/home", icon: HomeIcon, protected: true },
  { name: "Questions", path: "/questions", icon: BookOpen, protected: true },
  { name: "Add Question", path: "/add-question", icon: ImagePlus, protected: true },
  { name: "Mock Test", path: "/mock-test", icon: ListChecks, protected: false },
  { name: "Records", path: "/records", icon: Video, protected: false },
  { name: "Settings", path: "/settings", icon: Settings, protected: true },
  { name: "Profile", path: "/user-profile", icon: User, protected: true },
];

const Navbar: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    const checkAuthStatus = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
      setIsGuestMode(localStorage.getItem("isGuestMode") === "true");
    };

    checkAuthStatus();

    // localStorage o'zgarishlarini kuzatish
    window.addEventListener('storage', checkAuthStatus);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isGuestMode");
    setIsLoggedIn(false);
    setIsGuestMode(false);
    showSuccess("Tizimdan chiqdingiz!");
    navigate("/login");
  };

  const renderNavLinks = () => {
    let filteredLinks = allNavLinks;

    if (isGuestMode && !isLoggedIn) {
      filteredLinks = allNavLinks.filter(link => !link.protected);
    } else if (!isLoggedIn && !isGuestMode) {
      filteredLinks = allNavLinks.filter(link => link.path === "/mock-test");
    }

    return (
      <>
        {filteredLinks.map((link) => (
          <Button key={link.name} variant="ghost" asChild className="w-full justify-start">
            <Link to={link.path} className="flex items-center gap-2">
              <link.icon className="h-4 w-4" />
              {link.name}
            </Link>
          </Button>
        ))}
        {(isLoggedIn || isGuestMode) && (
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isGuestMode ? "Guest Mode'dan chiqish" : "Logout"}
          </Button>
        )}
      </>
    );
  };

  return (
    <nav className="bg-primary text-primary-foreground p-4 shadow-md flex items-center justify-between">
      <Link to="/home" className="text-2xl font-bold">
        <span className="font-extrabold text-red-500">CEFR LC</span>
      </Link>

      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px] p-4 flex flex-col">
            <Link to="/home" className="text-2xl font-bold mb-4">
              <span className="font-extrabold text-red-500">CEFR LC</span>
            </Link>
            <div className="flex flex-col gap-2">
              {renderNavLinks()}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <div className="flex items-center gap-4">
          {renderNavLinks()}
        </div>
      )}
    </nav>
  );
};

export default Navbar;