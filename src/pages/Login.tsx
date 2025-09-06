"use client";

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showSuccess, showError } from "@/utils/toast";
import { CefrCentreFooter } from "@/components/CefrCentreFooter";

interface LoginProps {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  // Oddiy lokal login/ro'yxatdan o'tish uchun mock funksiyalar
  const mockUsers = JSON.parse(localStorage.getItem("mockUsers") || "{}");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (mockUsers[email] && mockUsers[email] === password) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.removeItem("isGuestMode");
      setIsLoggedIn(true);
      showSuccess("Tizimga muvaffaqiyatli kirdingiz!");
      navigate("/home");
    } else {
      showError("Noto'g'ri email yoki parol.");
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      showError("Iltimos, barcha maydonlarni to'ldiring.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("Parollar mos kelmadi.");
      return;
    }
    if (newPassword.length < 6) {
      showError("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    if (mockUsers[newEmail]) {
      showError("Bu email allaqachon ro'yxatdan o'tgan.");
      return;
    }

    mockUsers[newEmail] = newPassword;
    localStorage.setItem("mockUsers", JSON.stringify(mockUsers));
    showSuccess("Muvaffaqiyatli ro'yxatdan o'tdingiz! Endi tizimga kirishingiz mumkin.");
    setNewEmail("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleStartTestWithoutLogin = () => {
    localStorage.setItem("isGuestMode", "true");
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    navigate("/mock-test");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome</CardTitle>
          <CardDescription>Tizimga kiring yoki yangi hisob yarating.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Ro'yxatdan o'tish</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Emailingizni kiriting"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Parol</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Parolni kiriting"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="mt-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="new-email">Email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    placeholder="Emailingizni kiriting"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="new-password">Yangi parol</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Yangi parolni kiriting"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Parolni tasdiqlash</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Parolni qayta kiriting"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Ro'yxatdan o'tish
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <div className="mt-6 text-center">
            <Button variant="secondary" className="w-full" onClick={handleStartTestWithoutLogin}>
              Loginsiz testni boshlash
            </Button>
          </div>
        </CardContent>
      </Card>
      <CefrCentreFooter />
    </div>
  );
};

export default Login;