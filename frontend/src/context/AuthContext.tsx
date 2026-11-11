
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import authService, {
  type AuthResponse,
  type AuthUser,
  type LoginRequest,
} from "../services/authService";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (!authService.getToken()) {
      return null;
    }

    return authService.getUser();
  });

  const login = async (
    credentials: LoginRequest
  ): Promise<AuthResponse> => {
    const response = await authService.login(credentials);

    setUser({
      userId: response.userId,
      fullName: response.fullName,
      email: response.email,
      role: response.role,
    });

    return response;
  };

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const refreshSession = useCallback(() => {
    const token = authService.getToken();

    if (!token) {
      setUser(null);
      return;
    }

    setUser(authService.getUser());
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === "shopsphere-token" ||
        event.key === "shopsphere-user" ||
        event.key === null
      ) {
        refreshSession();
      }
    };

    const handleAuthExpired = () => {
      logout();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshSession();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    window.addEventListener(
      "shopsphere:auth-expired",
      handleAuthExpired
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);

      window.removeEventListener(
        "shopsphere:auth-expired",
        handleAuthExpired
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [logout, refreshSession]);

  // Automatically log out when the JWT expires.
  useEffect(() => {
    if (!user) {
      return;
    }

    const expiration = authService.getTokenExpiration();

    if (!expiration) {
      logout();
      return;
    }

    const remainingTime = expiration - Date.now();

    if (remainingTime <= 0) {
      logout();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      refreshSession();
    }, remainingTime);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [user, logout, refreshSession]);

  const isAuthenticated =
    user !== null && authService.isAuthenticated();

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
