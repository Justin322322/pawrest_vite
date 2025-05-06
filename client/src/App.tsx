import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ClientDashboard from "@/pages/dashboard/client-dashboard";
import ProviderDashboard from "@/pages/dashboard/provider-dashboard";
import AdminDashboard from "@/pages/dashboard/admin-dashboard";
import ToastTestPage from "@/pages/toast-test";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "@/lib/protected-route";
import { UserRole } from "@shared/schema";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute
        path="/dashboard/client"
        component={ClientDashboard}
        requiredRole={UserRole.CLIENT}
      />
      <ProtectedRoute
        path="/dashboard/provider"
        component={ProviderDashboard}
        requiredRole={UserRole.PROVIDER}
      />
      <ProtectedRoute
        path="/dashboard/admin"
        component={AdminDashboard}
        requiredRole={UserRole.ADMIN}
      />
      <Route path="/toast-test" component={ToastTestPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
