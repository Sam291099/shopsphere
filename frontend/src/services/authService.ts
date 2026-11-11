
import axios from "axios";

const API_URL = "/api/auth";

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

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface OtpResponse {
  message: string;
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface PasswordResetResponse {
  message: string;
}

function decodeTokenExpiration(token: string): number | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3 || !parts[1]) {
      return null;
    }

    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = JSON.parse(
      atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, "="))
    );

    if (
      typeof decoded.exp !== "number" ||
      !Number.isFinite(decoded.exp)
    ) {
      return null;
    }

    return decoded.exp * 1000;
  } catch {
    return null;
  }
}

const authService = {
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await axios.post<RegisterResponse>(
      `${API_URL}/register`,
      data
    );

    return response.data;
  },

  async verifyOtp(data: VerifyOtpRequest): Promise<OtpResponse> {
    const response = await axios.post<OtpResponse>(
      `${API_URL}/verify-otp`,
      data
    );

    return response.data;
  },

  async resendOtp(email: string): Promise<OtpResponse> {
    const response = await axios.post<OtpResponse>(
      `${API_URL}/resend-otp`,
      { email }
    );

    return response.data;
  },

  async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<PasswordResetResponse> {
    const response = await axios.post<PasswordResetResponse>(
      `${API_URL}/forgot-password`,
      data
    );

    return response.data;
  },

  async verifyResetOtp(
    data: VerifyResetOtpRequest
  ): Promise<PasswordResetResponse> {
    const response = await axios.post<PasswordResetResponse>(
      `${API_URL}/verify-reset-otp`,
      data
    );

    return response.data;
  },

  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<PasswordResetResponse> {
    const response = await axios.post<PasswordResetResponse>(
      `${API_URL}/reset-password`,
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

    const user: AuthUser = {
      userId: authData.userId,
      fullName: authData.fullName,
      email: authData.email,
      role: authData.role,
    };

    localStorage.setItem(TOKEN_KEY, authData.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return authData;
  },

  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      return null;
    }

    const expiration = decodeTokenExpiration(token);

    if (!expiration || expiration <= Date.now()) {
      this.logout();
      return null;
    }

    return token;
  },

  getTokenExpiration(): number | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    return decodeTokenExpiration(token);
  },

  getUser(): AuthUser | null {
    const userData = localStorage.getItem(USER_KEY);

    if (!userData) {
      return null;
    }

    try {
      const user = JSON.parse(userData) as AuthUser;

      if (
        !Number.isInteger(user.userId) ||
        user.userId <= 0 ||
        typeof user.fullName !== "string" ||
        !user.fullName.trim() ||
        typeof user.email !== "string" ||
        !user.email.trim() ||
        !["ADMIN", "CUSTOMER"].includes(user.role)
      ) {
        this.logout();
        return null;
      }

      return user;
    } catch {
      this.logout();
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken() && this.getUser());
  },
};

export default authService;
