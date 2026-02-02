"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LandingPageHeader from "@/components/LandingPageHeader";
import ProcessSteps from "@/components/ProcessSteps";
import ContactSection from "@/components/ContactSection";
import PricingCard from "@/components/PricingCard";
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import CustomAuthForm from "@/components/CustomAuthForm";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/LoadingSpinner";
import RotatingText from "@/components/RotatingText";
import { useIsMobile } from "@/hooks/use-mobile";
import '../styles/GetStartedButton.css'; // Yangi tugma stillarini import qilish

const Login: React.FC = () => {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [showGlobalSpinner, setShowGlobalSpinner] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const openLoginModal = () => {
    setIsLoginDialogOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginDialogOpen(false);
  };

  const handleTryMe = () => {
    setShowGlobalSpinner(true);
    setTimeout(() => {
      localStorage.setItem("isGuestMode", "true");
      sessionStorage.setItem("showGuestGuide", "true");
      navigate("/home");
      setShowGlobalSpinner(false);
    }, 2000);
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setShowGlobalSpinner(true);
        setTimeout(() => {
          closeLoginModal();
          navigate("/home");
          setShowGlobalSpinner(false);
        }, 2500);
      } else if (event === 'SIGNED_OUT') {
        setShowGlobalSpinner(false);
        localStorage.removeItem("isGuestMode");
        sessionStorage.removeItem("guestWelcomeToastShown");
        sessionStorage.removeItem("showGuestGuide");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingPageHeader onOpenLogin={openLoginModal} />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 hero-section">
        <div className="lg:flex lg:space-x-12">
          <div className="lg:w-3/5 pb-10">
            <motion.div
              initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 leading-tight">
                {t("landing_page.title_part1")} <span className="text-primary"><RotatingText type="title" /></span>
              </h1>
              <p className="text-xl sm:text-3xl font-semibold text-muted-foreground mb-8">
                <RotatingText type="subtitle" />
              </p>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button
                onClick={handleTryMe}
                className="bg-gradient-purple text-white text-base px-6 py-4 rounded-full shadow-lg transition-all duration-300 animate-button-pulse btn-hover-glow"
                disabled={showGlobalSpinner}
              >
                {t("landing_page.try_me_button")}
              </Button>
              {/* Yangi "Get Started" tugmasi */}
              <button className="button" onClick={openLoginModal} disabled={showGlobalSpinner}>
                <span className="labels">
                  <span style={{ '--i': 1 } as React.CSSProperties} data-label="G">G</span>
                  <span style={{ '--i': 2 } as React.CSSProperties} data-label="e">e</span>
                  <span style={{ '--i': 3 } as React.CSSProperties} data-label="t">t</span>
                  <span style={{ '--i': 4 } as React.CSSProperties} data-label="s">s</span>
                  <span style={{ '--i': 5 } as React.CSSProperties} data-label="t">t</span>
                  <span style={{ '--i': 6 } as React.CSSProperties} data-label="a">a</span>
                  <span style={{ '--i': 7 } as React.CSSProperties} data-label="r">r</span>
                  <span style={{ '--i': 8 } as React.CSSProperties} data-label="t">t</span>
                  <span style={{ '--i': 9 } as React.CSSProperties} data-label="e">e</span>
                  <span style={{ '--i': 10 } as React.CSSProperties} data-label="d">d</span>
                </span>
                <div className="icon-container">
                  <svg
                    className="icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="white"
                      d="M16.15 13H5q-.425 0-.712-.288T4 12t.288-.712T5 11h11.15L13.3 8.15q-.3-.3-.288-.7t.288-.7q.3-.3.713-.312t.712.287L19.3 11.3q.15.15.213.325t.062.375t-.062.375t-.213.325l-4.575 4.575q-.3.3-.712.288t-.713-.313q-.275-.3-.288-.7t.288-.7z"
                    ></path>
                  </svg>
                </div>
              </button>
            </div>

            <ProcessSteps />
            <ContactSection />
          </div>

          <div className="lg:w-2/5 mt-10 lg:mt-0">
            <PricingCard />
          </div>
        </div>
      </main>

      <Dialog open={isLoginDialogOpen} onOpenChange={closeLoginModal}>
        <DialogContent className="sm:max-w-[425px] p-6">
          <DialogHeader>
            <DialogTitle>{t("common.welcome")}</DialogTitle>
            <DialogDescription>
              {t("common.auth_description")}
            </DialogDescription>
          </DialogHeader>
          <CustomAuthForm />
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>{t("common.forgot_password_contact_admin_message")}</p>
            <a href="tel:+998772077117" className="text-primary hover:underline font-semibold">
              {t("common.admin_contact_phone")}
            </a>
          </div>
        </DialogContent>
      </Dialog>
      {showGlobalSpinner && <LoadingSpinner />}
    </div>
  );
};

export default Login;