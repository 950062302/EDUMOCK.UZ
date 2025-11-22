import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import SuperAdminRoute from "./components/SuperAdminRoute"; // Yangi import
import SuperAdminDashboard from "./pages/SuperAdminDashboard"; // Yangi import
import { AuthProvider } from "./context/AuthProvider";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner 
          position="top-left" 
          richColors 
          theme="system" // Tizim mavzusiga moslashish uchun
          toastOptions={{
            success: {
              style: {
                backgroundColor: 'hsl(var(--success-color) / 0.1)',
                borderColor: 'hsl(var(--success-color))',
                color: 'hsl(var(--foreground))',
              },
              iconTheme: {
                primary: 'hsl(var(--success-color))',
                secondary: 'hsl(var(--primary-foreground))',
              },
            },
            error: {
              style: {
                backgroundColor: 'hsl(var(--error-color) / 0.1)',
                borderColor: 'hsl(var(--error-color))',
                color: 'hsl(var(--foreground))',
              },
              iconTheme: {
                primary: 'hsl(var(--error-color))',
                secondary: 'hsl(var(--primary-foreground))',
              },
            },
            info: {
              iconTheme: {
                primary: 'hsl(var(--info-color))',
                secondary: 'hsl(var(--primary-foreground))',
              },
            },
          }}
        />
        <BrowserRouter>
          <AuthProvider>
            <div className="pb-10 bg-background text-foreground min-h-screen">
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/mock-test" element={<MockTest />} />
                
                {/* Super Admin uchun himoyalangan marshrut */}
                <Route element={<SuperAdminRoute />}>
                  <Route path="/superadmin" element={<SuperAdminDashboard />} />
                </Route>

                {/* Oddiy foydalanuvchilar uchun himoyalangan marshrutlar guruhi */}
                <Route element={<ProtectedRoute />}>
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
            </div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;