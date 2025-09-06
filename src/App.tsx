import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MoodJournal from "./pages/MoodJournal";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AddQuestion from "./pages/AddQuestion";
import MockTest from "./pages/MockTest";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import Questions from "./pages/Questions";
import Records from "./pages/Records";
import ProtectedRoute from "./components/ProtectedRoute";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lokal login holatini tekshirish
    const loggedInStatus = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedInStatus);
    setLoading(false);

    // localStorage o'zgarishlarini kuzatish
    const handleStorageChange = () => {
      const newLoggedInStatus = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(newLoggedInStatus);
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-muted-foreground">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/mock-test" element={<MockTest />} />
            
            {/* Himoyalangan marshrutlar guruhi */}
            <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} />}>
              <Route path="/home" element={<Home />} />
              <Route path="/add-question" element={<AddQuestion />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/user-profile" element={<UserProfile />} />
              <Route path="/questions" element={<Questions />} />
              <Route path="/records" element={<Records />} />
              <Route path="/mood-journal" element={<MoodJournal />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;