import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import {
  insertUserSchema,
  User as SelectUser,
  InsertUser,
  UserRole,
  providerRegistrationSchema,
  BusinessInfo
} from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { getUserFriendlyErrorMessage } from "@/lib/error-handler";

// Custom type for registration that combines client and provider registration
type RegisterData = {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  address?: string;
  termsAccepted?: boolean;
  businessInfo?: Partial<BusinessInfo>;
};

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      console.log("Login successful, user data:", user);
      console.log("User role:", user.role);

      // Ensure the role is a valid UserRole enum value
      if (!Object.values(UserRole).includes(user.role as UserRole)) {
        console.error(`Invalid user role: ${user.role}`);
        toast({
          title: "Login error",
          description: "Invalid user role. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.fullName}`,
        variant: "success",
      });

      // Redirect based on user role
      console.log(`Redirecting user with role ${user.role} to appropriate dashboard`);
      if (user.role === UserRole.CLIENT) {
        console.log("Redirecting to client dashboard");
        navigate("/dashboard/client");
      } else if (user.role === UserRole.PROVIDER) {
        console.log("Redirecting to provider dashboard");
        navigate("/dashboard/provider");
      } else if (user.role === UserRole.ADMIN) {
        console.log("Redirecting to admin dashboard");
        navigate("/dashboard/admin");
      }
    },
    onError: (error: Error) => {
      const friendlyMessage = getUserFriendlyErrorMessage(error);
      toast({
        title: "Login failed",
        description: friendlyMessage,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Account created!",
        description: `Welcome to PawRest, ${user.fullName}`,
        variant: "success",
      });

      // Redirect based on user role
      if (user.role === UserRole.CLIENT) {
        navigate("/dashboard/client");
      } else if (user.role === UserRole.PROVIDER) {
        navigate("/dashboard/provider");
      }
    },
    onError: (error: Error) => {
      const friendlyMessage = getUserFriendlyErrorMessage(error);
      toast({
        title: "Registration failed",
        description: friendlyMessage,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
        variant: "info",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      const friendlyMessage = getUserFriendlyErrorMessage(error);
      toast({
        title: "Logout failed",
        description: friendlyMessage,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
