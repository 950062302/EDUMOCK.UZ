"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { pb } from "@/integrations/pocketbase/client";
import { showError, showSuccess } from "@/utils/toast";
import { useTranslation } from "react-i18next";

type PendingOAuth = {
  provider: string;
  codeVerifier: string;
  redirectUrl: string;
  createdAt: number;
};

const STORAGE_PREFIX = "oauth_pending:";
const MAX_AGE_MS = 10 * 60 * 1000;

function readPending(state: string): PendingOAuth | null {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${state}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingOAuth;
    if (!parsed?.codeVerifier || !parsed?.redirectUrl || !parsed?.provider) return null;
    if (Date.now() - (parsed.createdAt || 0) > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function clearPending(state: string) {
  try {
    sessionStorage.removeItem(`${STORAGE_PREFIX}${state}`);
  } catch {
    // ignore
  }
}

const OAuth2Callback: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"working" | "error">("working");
  const [message, setMessage] = useState<string>(t("common.loading"));

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const code = params.get("code") || "";
  const state = params.get("state") || "";
  const error = params.get("error") || "";
  const errorDescription = params.get("error_description") || "";

  useEffect(() => {
    if (error) {
      setStatus("error");
      setMessage(errorDescription || error);
      showError(errorDescription || error);
      navigate("/login", { replace: true });
      return;
    }

    if (!code || !state) {
      setStatus("error");
      setMessage("Missing OAuth2 code/state");
      showError("Missing OAuth2 code/state");
      navigate("/login", { replace: true });
      return;
    }

    const pending = readPending(state);
    if (!pending) {
      setStatus("error");
      setMessage("OAuth2 session expired. Please try again.");
      showError("OAuth2 session expired. Please try again.");
      navigate("/login", { replace: true });
      return;
    }

    setMessage("Finishing sign-in…");

    pb.collection("users")
      .authWithOAuth2Code(pending.provider, code, pending.codeVerifier, pending.redirectUrl)
      .then(() => {
        showSuccess(t("common.success_logged_in"));
        clearPending(state);
        navigate("/home", { replace: true });
      })
      .catch((e: any) => {
        setStatus("error");
        setMessage(e?.message || "OAuth2 failed");
        showError(e?.message || "OAuth2 failed");
        clearPending(state);
        navigate("/login", { replace: true });
      });
  }, [code, state, error, errorDescription, navigate, t]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-xl border bg-background p-6 text-center">
        <div className="text-lg font-semibold mb-2">
          {status === "working" ? "Signing you in" : "Sign-in failed"}
        </div>
        <div className="text-sm text-muted-foreground">{message}</div>
      </div>
    </div>
  );
};

export default OAuth2Callback;

