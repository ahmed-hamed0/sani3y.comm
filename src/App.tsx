
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, RequireAuth, RequireClient, RequireCraftsman } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Craftsmen from "./pages/Craftsmen";
import CraftsmanDetails from "./pages/CraftsmanDetails";
import Jobs from "./pages/Jobs";
import PostJob from "./pages/PostJob";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import About from "./pages/About";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";

// Import supabase client
import { supabase } from "./integrations/supabase/client";

// Enable realtime for specific tables
(async () => {
  try {
    // Fix: Define parameter type explicitly for the Supabase RPC call
    const enableRealtimeForTable = (tableName: string) => {
      return supabase.rpc('enable_realtime', { table_name: tableName } as Record<string, any>);
    };
    
    await enableRealtimeForTable('messages');
    await enableRealtimeForTable('notifications');
    await enableRealtimeForTable('reviews');
    console.log('Enabled realtime for messages, notifications, and reviews tables');
  } catch (error) {
    console.error('Error enabling realtime:', error);
  }
})();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/craftsmen" element={<Craftsmen />} />
            <Route path="/craftsman/:id" element={<CraftsmanDetails />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/profile" element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            } />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/about" element={<About />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
