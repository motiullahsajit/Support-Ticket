import { create } from "zustand";
import { User } from "../types";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  return {
    user: user,
    isAuthenticated: !!storedToken,
    setUser: (user) => {
      set({ user, isAuthenticated: !!user });
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    },
    login: async (email, password) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          }
        );
        if (!response.ok) throw new Error("Login failed");
        const data = await response.json();
        const token = data?.token;
        const loggedInUser = data?.user;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        set({ user: loggedInUser, isAuthenticated: true });
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ user: null, isAuthenticated: false });
    },
  };
});
