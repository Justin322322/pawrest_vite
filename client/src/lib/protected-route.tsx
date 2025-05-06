import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole,
}: {
  path: string;
  component: () => React.JSX.Element;
  requiredRole?: string;
}) {
  const { user, isLoading } = useAuth();

  console.log(`ProtectedRoute for path: ${path}, required role: ${requiredRole}`);
  console.log(`Current user:`, user);

  if (isLoading) {
    console.log(`Auth is still loading for path: ${path}`);
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    console.log(`No user found, redirecting to auth page from: ${path}`);
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  console.log(`User authenticated for path: ${path}, user role: ${user.role}, required role: ${requiredRole}`);

  // If a specific role is required, check if the user has that role
  if (requiredRole && user.role !== requiredRole) {
    console.log(`Role mismatch: User has ${user.role}, but ${requiredRole} is required`);

    // Redirect to the appropriate dashboard based on user role
    const redirectPath = user.role === 'admin'
      ? '/dashboard/admin'
      : user.role === 'provider'
        ? '/dashboard/provider'
        : '/dashboard/client';

    console.log(`Redirecting to: ${redirectPath}`);
    return (
      <Route path={path}>
        <Redirect to={redirectPath} />
      </Route>
    );
  }

  console.log(`Access granted to ${path} for user with role: ${user.role}`);
  return <Route path={path} component={Component} />;
}
