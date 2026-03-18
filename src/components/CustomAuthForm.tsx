"use client";
import React, { useState } from 'react';
import { pb } from "@/integrations/pocketbase/client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showError, showSuccess } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import { Chrome } from "lucide-react";
// import { useNavigate } from 'react-router-dom'; // useNavigate endi bu yerda kerak emas

const CustomAuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | null>(null);
  const [isSignUp, setIsSignUp] = useState(false); // New state to toggle between sign-in and sign-up
  const { t } = useTranslation();
  // const navigate = useNavigate(); // Bu qator olib tashlandi

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await pb.collection("users").authWithPassword(email, password);
      showSuccess(t("common.success_logged_in"));
    } catch (err: any) {
      showError(err?.message || t("common.error"));
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showError(t("user_profile_page.error_password_mismatch"));
      return;
    }
    if (password.length < 6) {
      showError(t("user_profile_page.error_password_length"));
      return;
    }
    setLoading(true);
    
    try {
      await pb.collection("users").create({
        email,
        password,
        passwordConfirm: confirmPassword,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      // PocketBase: email tasdiqlash sozlamaga bog'liq. Agar yoqilgan bo'lsa, email yuboriladi.
      // UI jihatdan eski matnni saqlab qolamiz.
      showSuccess(t("common.confirmation_email_sent"));
      setIsSignUp(false); // Switch back to sign-in form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
    } catch (err: any) {
      showError(err?.message || t("common.error"));
    }
    setLoading(false);
  };

  // Note: For Safari popup blocking, avoid async/await directly in the click handler.
  const handleGoogleSignIn = () => {
    setOauthLoading("google");

    const redirectUrl = `${window.location.origin}/oauth2-callback`;

    // Use direct fetch to avoid SDK response-shape differences across versions.
    fetch(`${pb.baseUrl}/api/collections/users/auth-methods`, { credentials: "omit" })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok || !data) {
          throw new Error((data as any)?.message || `Failed to load auth methods (HTTP ${res.status})`);
        }
        return data as any;
      })
      .then((methods: any) => {
        const providers: any[] = methods?.authProviders || methods?.oauth2?.providers || [];
        const google = providers.find((p) => p?.name === "google");
        if (!google?.authUrl || !google?.state || !google?.codeVerifier) {
          throw new Error("Google OAuth2 provider is not available on this PocketBase instance.");
        }

        sessionStorage.setItem(
          `oauth_pending:${google.state}`,
          JSON.stringify({
            provider: "google",
            codeVerifier: google.codeVerifier,
            redirectUrl,
            createdAt: Date.now(),
          })
        );

        // authUrl in PB v0.22 may have empty redirect_uri - set it to our app callback.
        const authUrl = `${google.authUrl}${
          google.authUrl.includes("redirect_uri=")
            ? encodeURIComponent(redirectUrl)
            : `&redirect_uri=${encodeURIComponent(redirectUrl)}`
        }`;
        window.location.assign(authUrl);
      })
      .catch((err: any) => {
        showError(err?.message || t("common.error"));
        setOauthLoading(null);
      });
  };

  return (
    <div className="w-full">
      <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-5 mt-4">
        {isSignUp && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="first-name-up" className="text-sm font-medium">
                {t("user_profile_page.first_name")}
              </Label>
              <Input
                id="first-name-up"
                type="text"
                placeholder={t("user_profile_page.your_first_name")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name-up" className="text-sm font-medium">
                {t("user_profile_page.last_name")}
              </Label>
              <Input
                id="last-name-up"
                type="text"
                placeholder={t("user_profile_page.your_last_name")}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="h-11"
              />
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email-auth" className="text-sm font-medium">
            {t("common.email")}
          </Label>
          <Input
            id="email-auth"
            type="email"
            placeholder={t("common.enter_your_email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password-auth" className="text-sm font-medium">
            {t("common.password")}
          </Label>
          <Input
            id="password-auth"
            type="password"
            placeholder={t("common.enter_your_password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11"
          />
        </div>
        {isSignUp && (
          <div className="space-y-2">
            <Label htmlFor="confirm-password-auth" className="text-sm font-medium">
              {t("user_profile_page.confirm_new_password")}
            </Label>
            <Input
              id="confirm-password-auth"
              type="password"
              placeholder={t("user_profile_page.confirm_password")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-11"
            />
          </div>
        )}
        <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading}>
          {loading ? (
            isSignUp ? t("common.signing_up") : t("common.logging_in")
          ) : (
            isSignUp ? t("common.sign_up") : t("common.sign_in")
          )}
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">{t("common.or")}</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full h-11 rounded-xl"
        onClick={handleGoogleSignIn}
        disabled={loading || oauthLoading === "google"}
      >
        <Chrome className="h-4 w-4 mr-2" />
        {oauthLoading === "google" ? t("common.loading") : "Continue with Google"}
      </Button>

      <div className="mt-5 text-center">
        <Button
          type="button"
          variant="link"
          className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          onClick={() => setIsSignUp((prev) => !prev)}
          disabled={loading || oauthLoading !== null}
        >
          {isSignUp ? t("common.sign_in") : t("common.sign_up")}
        </Button>
      </div>
    </div>
  );
};

export default CustomAuthForm;