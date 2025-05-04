
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, RequireAuth } from "@/hooks/auth";
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
import JobDetails from "./pages/JobDetails";
import Subscription from "./pages/Subscription";

// Import supabase client
import { supabase } from "./integrations/supabase/client";

// Enable realtime for specific tables
(async () => {
  try {
    await supabase.channel('public:messages').subscribe();
    await supabase.channel('public:notifications').subscribe();
    await supabase.channel('public:reviews').subscribe();
    await supabase.channel('public:jobs').subscribe();
    console.log('Enabled realtime for messages, notifications, reviews, and jobs tables');
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
            <Route path="/job/:id" element={<JobDetails />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/profile" element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            } />
            <Route path="/subscription" element={<Subscription />} />
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
