"use client";
import React from "react";
import { Server, Lock } from "lucide-react";
import { useTranslation } from 'react-i18next';

const AppFooter: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto bg-card border-t border-border py-12 text-foreground">
      <div className="container mx-auto px-4">
        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8">
          {/* Column 1: Brand Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-lg font-bold mb-2">Edumock.uz</h3>
            <p className="text-sm text-muted-foreground">
              {t("landing_page.footer_tagline", "Your platform for conversational practice.")}
            </p>
          </div>

          {/* Column 2: Trust Badges Section */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-lg font-bold mb-4">{t("landing_page.footer_trust_title", "Trust & Security")}</h3>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-6 sm:gap-8 opacity-90">
              {/* EduCloud Ownership */}
              <div className="flex items-center gap-3 group cursor-default" title={t("landing_page.footer_educloud_title")}>
                <div className="p-2 bg-blue-50/50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-900 group-hover:border-blue-300 transition-colors">
                  <Server className="w-6 h-6 text-[#0EA5E9]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t("landing_page.footer_powered_by")}</span>
                  <span className="text-sm font-bold text-foreground">EduCloud</span>
                </div>
              </div>

              {/* Data Security / SSL */}
              <div className="flex items-center gap-3 group cursor-default" title={t("landing_page.footer_ssl_title")}>
                <div className="p-2 bg-emerald-50/50 dark:bg-emerald-900/30 rounded-full border border-emerald-100 dark:border-emerald-900 group-hover:border-emerald-300 transition-colors">
                  <Lock className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{t("landing_page.footer_data_secured")}</span>
                  <span className="text-sm font-bold text-foreground">SSL Encrypted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Navigation Links */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-lg font-bold mb-4">{t("landing_page.footer_links_title", "Quick Links")}</h3>
            <nav className="flex flex-col gap-2 text-sm">
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                {t("landing_page.privacy_policy")}
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                {t("landing_page.terms_of_use")}
              </a>
            </nav>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-border pt-6 text-center">
          <p className="text-muted-foreground text-sm font-medium">
            &copy; {new Date().getFullYear()} Edumock.uz, Inc. {t("landing_page.all_rights_reserved")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;