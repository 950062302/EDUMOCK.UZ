import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom"; // Removed Routes and useLocation from here
import { AuthProvider } from "./context/AuthProvider";
import { useTranslation } from 'react-i18next'; // Still needed for Sonner toastOptions

// Import the new AppContent component
import AppContent from "./components/AppContent";

const queryClient = new QueryClient();

const App = () => {
  const { t } = useTranslation(); // Still needed for Sonner toastOptions

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner
          position="top-left"
          richColors
          theme="system"
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
            <AppContent /> {/* Render the new AppContent component here */}
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;