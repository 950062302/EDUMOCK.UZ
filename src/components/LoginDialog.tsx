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
import { useTranslation } from 'react-i18next'; // useTranslation import qilish

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation(); // useTranslation hookini ishlatish

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showError(error.message);
    } else {
      showSuccess(t("common.success_logged_in")); // Tarjima qilingan xabar
      onClose();
      navigate("/home");
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("common.login")}</DialogTitle> {/* Tarjima qilingan matn */}
          <DialogDescription>
            {t("common.enter_admin_credentials")} {/* Tarjima qilingan matn */}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="login">{t("common.admin_only")}</TabsTrigger> {/* Tarjima qilingan matn */}
          </TabsList>
          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("common.email")}</Label> {/* Tarjima qilingan matn */}
                <Input
                  id="email"
                  type="email"
                  placeholder={t("common.enter_your_email")} {/* Tarjima qilingan matn */}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="password">{t("common.password")}</Label> {/* Tarjima qilingan matn */}
                <Input
                  id="password"
                  type="password"
                  placeholder={t("common.enter_your_password")} {/* Tarjima qilingan matn */}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full bg-lime-500 hover:bg-lime-600" disabled={loading}>
                {loading ? t("common.logging_in") : t("common.login")} {/* Tarjima qilingan matn */}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;