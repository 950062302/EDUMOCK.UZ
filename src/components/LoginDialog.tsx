"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [promoCode, setPromoCode] = useState(""); // Yangi promokod holati
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        showError(error.message);
      } else {
        showSuccess(t("common.success_logged_in"));
        onClose();
        navigate("/home");
      }
    } catch (err: any) {
      showError(err.message || t("common.login_error"));
    } finally {
      setLoading(false);
    }
  };

  const handlePromoCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (promoCode === "AEROSX") {
        localStorage.setItem("isSuperAdmin", "true");
        localStorage.setItem("isGuestMode", "true"); // Super admin ham guest mode orqali kiradi
        showSuccess(t("common.super_admin_access_granted"));
        onClose();
        navigate("/home");
      } else {
        showError(t("common.error_invalid_promo_code"));
      }
    } catch (err: any) {
      showError(err.message || t("common.promo_code_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("common.login")}</DialogTitle>
          <DialogDescription>
            {t("common.enter_admin_credentials")}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2"> {/* Tablar soni 2 ga o'zgartirildi */}
            <TabsTrigger value="login">{t("common.admin_only")}</TabsTrigger>
            <TabsTrigger value="promocode">{t("common.promo_code_tab")}</TabsTrigger> {/* Yangi promokod tabi */}
          </TabsList>
          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("common.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("common.enter_your_email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="password">{t("common.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("common.enter_your_password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? t("common.logging_in") : t("common.login")}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="promocode" className="mt-4"> {/* Promokod tabining kontenti */}
            <form onSubmit={handlePromoCodeSubmit} className="space-y-4">
              <div>
                <Label htmlFor="promo-code">{t("common.promo_code_tab")}</Label>
                <Input
                  id="promo-code"
                  type="text"
                  placeholder={t("common.enter_promo_code")}
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? t("common.activating_promo_code") : t("common.activate_promo_code")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;