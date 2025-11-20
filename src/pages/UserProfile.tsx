"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { CefrCentreFooter } from "@/components/CefrCentreFooter";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

const UserProfile: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Login credentialsni yangilash logikasi olib tashlanganligi sababli, bu statelarga endi ehtiyoj yo'q.
  // const [newEmail, setNewEmail] = useState<string>("");
  // const [newPassword, setNewPassword] = useState<string>("");
  // const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  // const [isUpdatingCredentials, setIsUpdatingCredentials] = useState<boolean>(false);

  // const handleUpdateCredentials = async () => {
  //   setIsUpdatingCredentials(true);
  //   let hasError = false;

  //   if (newPassword && newPassword !== confirmNewPassword) {
  //     showError(t("user_profile_page.error_password_mismatch"));
  //     hasError = true;
  //   }

  //   if (newPassword && newPassword.length < 6) {
  //     showError(t("user_profile_page.error_password_length"));
  //     hasError = true;
  //   }

  //   if (hasError) {
  //     setIsUpdatingCredentials(false);
  //     return;
  //   }

  //   try {
  //     if (newEmail) {
  //       const { error: emailError } = await supabase.auth.updateUser({ email: newEmail });
  //       if (emailError) {
  //         throw emailError;
  //       }
  //       showSuccess(t("user_profile_page.success_email_update_check_inbox"));
  //       setNewEmail("");
  //     }

  //     if (newPassword) {
  //       const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
  //       if (passwordError) {
  //         throw passwordError;
  //       }
  //       showSuccess(t("user_profile_page.success_password_updated"));
  //       setNewPassword("");
  //       setConfirmNewPassword("");
  //     }

  //     if (!newEmail && !newPassword) {
  //       showError(t("user_profile_page.error_no_changes_to_save"));
  //     } else if (!newEmail || !newPassword) {
  //       showSuccess(t("user_profile_page.success_credentials_updated"));
  //     }

  //   } catch (error: any) {
  //     showError(`${t("user_profile_page.error_update_credentials")} ${error.message}`);
  //   } finally {
  //     setIsUpdatingCredentials(false);
  //   }
  // };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">{t("user_profile_page.user_profile")}</CardTitle>
            <CardDescription>{t("user_profile_page.view_update_profile")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>
                  <User className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">{user?.user_metadata?.full_name || user?.email || "Guest User"}</h3>
              <p className="text-muted-foreground">{user?.email || "guest@example.com"}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full-name" className="text-base">{t("user_profile_page.full_name")}</Label>
                <Input id="full-name" type="text" placeholder={t("user_profile_page.your_full_name")} defaultValue={user?.user_metadata?.full_name || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-base">{t("user_profile_page.bio")}</Label>
                <Input id="bio" type="text" placeholder={t("user_profile_page.tell_about_yourself")} defaultValue="" />
              </div>
            </div>
            <Button className="w-full">{t("settings_page.save_profile")}</Button>

            {/* "Update Login Credentials" bo'limi olib tashlandi */}
          </CardContent>
        </Card>
      </main>
      <CefrCentreFooter />
    </div>
  );
};

export default UserProfile;