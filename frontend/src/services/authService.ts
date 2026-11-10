import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

const TOKEN_KEY = "shopsphere-token";
const USER_KEY = "shopsphere-user";

export interface AuthUser {
  userId: number;
  fullName: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  fullName: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

const authService = {
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await axios.post<RegisterResponse>(
      `${API_URL}/register`,
      data
    );

    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(
      `${API_URL}/login`,
      data
    );

    const authData = response.data;

    localStorage.setItem(TOKEN_KEY, authData.token);

    const user: AuthUser = {
      userId: authData.userId,
      fullName: authData.fullName,
      email: authData.email,
      role: authData.role,
    };

    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return authData;
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): AuthUser | null {
    const userData = localStorage.getItem(USER_KEY);

    if (!userData) {
      return null;
    }

    try {
      return JSON.parse(userData) as AuthUser;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },
};

export default authService;