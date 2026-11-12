
import axios from "axios";
import authService from "./authService";

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  active: boolean;
  emailVerified: boolean;
  createdAt: string;
}

const userService = {
  async getMyProfile(): Promise<UserProfile> {
    const token = authService.getToken();

    if (!token) {
      throw new Error("You must be logged in to view your profile.");
    }

    const response = await axios.get<UserProfile>(
      "/api/users/me",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  },
};

export default userService;
