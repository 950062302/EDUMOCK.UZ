"use client";
import React from "react";
import { Server, Lock } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useLocation } from "react-router-dom";

const AppFooter: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isMockTestPage = location.pathname === '/mock-test';

  if (isMockTestPage) {
    return null;
  }

  return (
    <footer className="mt-auto bg-card border-t border-border py-6 text-foreground footer-glow"> {/* py-12 dan py-6 ga o'zgartirildi */}
      <div className="container mx-auto px-4 flex flex-col items-center space-y-4"> {/* space-y-8 dan space-y-4 ga o'zgartirildi */}

        {/* Brand Info */}
        <div className="text-center">
          <h3 className="text-xl font-bold mb-0.5">Edumock.uz</h3> {/* text-2xl dan text-xl ga, mb-1 dan mb-0.5 ga o'zgartirildi */}
          <p className="text-xs text-muted-foreground max-w-xs"> {/* text-sm dan text-xs ga, max-w-md dan max-w-xs ga o'zgartirildi */}
            {t("landing_page.slogan_short", "Your platform for conversational practice and real results.")}
          </p>
        </div>

        {/* Trust Badges Section */}
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 opacity-90"> {/* gap-x-8 dan gap-x-4 ga, gap-y-4 dan gap-y-2 ga o'zgartirildi */}
          {/* EduCloud Ownership */}
          <div className="flex items-center gap-2 group cursor-default" title={t("landing_page.footer_educloud_title")}> {/* gap-3 dan gap-2 ga o'zgartirildi */}
            <div className="p-1.5 bg-blue-50/50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-900 group-hover:border-blue-300 transition-colors"> {/* p-2 dan p-1.5 ga o'zgartirildi */}
              <Server className="w-4 h-4 text-[#0EA5E9]" /> {/* w-5 h-5 dan w-4 h-4 ga o'zgartirildi */}
            </div>
            <span className="text-xs font-medium text-foreground">{t("landing_page.footer_powered_by")} EduCloud</span> {/* text-sm dan text-xs ga o'zgartirildi */}
          </div>

          {/* Data Security / SSL */}
          <div className="flex items-center gap-2 group cursor-default" title={t("landing_page.footer_ssl_title")}> {/* gap-3 dan gap-2 ga o'zgartirildi */}
            <div className="p-1.5 bg-emerald-50/50 dark:bg-emerald-900/30 rounded-full border border-emerald-100 dark:border-emerald-900 group-hover:border-emerald-300 transition-colors"> {/* p-2 dan p-1.5 ga o'zgartirildi */}
              <Lock className="w-4 h-4 text-emerald-500" /> {/* w-5 h-5 dan w-4 h-4 ga o'zgartirildi */}
            </div>
            <span className="text-xs font-medium text-foreground">{t("landing_page.footer_data_secured")} SSL Encrypted</span> {/* text-sm dan text-xs ga o'zgartirildi */}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs"> {/* gap-x-6 dan gap-x-4 ga, gap-y-2 dan gap-y-1 ga, text-sm dan text-xs ga o'zgartirildi */}
          <a href="#" className="text-muted-foreground hover:text-primary transition">
            {t("landing_page.privacy_policy")}
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition">
            {t("landing_page.terms_of_use")}
          </a>
        </nav>

        {/* Copyright Section */}
        <div className="border-t border-border w-full pt-4 text-center mt-4"> {/* pt-6 dan pt-4 ga, mt-8 dan mt-4 ga o'zgartirildi */}
          <p className="text-muted-foreground text-xs font-medium">
            &copy; {new Date().getFullYear()} Edumock.uz, Inc. {t("landing_page.all_rights_reserved")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;