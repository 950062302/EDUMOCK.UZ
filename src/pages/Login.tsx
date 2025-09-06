"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showSuccess, showError } from "@/utils/toast";
import { CefrCentreFooter } from "@/components/CefrCentreFooter";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  // Default user for demonstration if no user is registered
  const defaultUser = { username: "user", password: "password" };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedUser = localStorage.getItem("registeredUser");
    let validUser = defaultUser;

    if (storedUser) {
      validUser = JSON.parse(storedUser);
    }

    if (username === validUser.username && password === validUser.password) {
      localStorage.setItem("isLoggedIn", "true"); // Foydalanuvchi tizimga kirganligini belgilash
      showSuccess("Tizimga muvaffaqiyatli kirdingiz!");
      navigate("/home");
    } else {
      showError("Noto'g'ri foydalanuvchi nomi yoki parol.");
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim() || !confirmPassword.trim()) {
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

    // Yangi foydalanuvchi ma'lumotlarini localStorage'ga saqlash
    localStorage.setItem("registeredUser", JSON.stringify({ username: newUsername, password: newPassword }));
    showSuccess("Muvaffaqiyatli ro'yxatdan o'tdingiz! Endi tizimga kirishingiz mumkin.");
    setNewUsername("");
    setNewPassword("");
    setConfirmPassword("");
    // Avtomatik ravishda login tabiga o'tish mumkin
    // set current tab to login if using tabs
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
                  <Label htmlFor="username">Foydalanuvchi nomi</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Foydalanuvchi nomini kiriting"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                  <Label htmlFor="new-username">Yangi foydalanuvchi nomi</Label>
                  <Input
                    id="new-username"
                    type="text"
                    placeholder="Yangi foydalanuvchi nomini kiriting"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
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
            <Link to="/mock-test">
              <Button variant="secondary" className="w-full">
                Loginsiz testni boshlash
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      <CefrCentreFooter />
    </div>
  );
};

export default Login;