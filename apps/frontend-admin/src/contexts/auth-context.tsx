"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  authApi,
  CurrentUser,
} from "@/services/auth.service";
import {
  clearAccessToken,
  decodeJwtPayload,
  setAccessToken,
} from "@/lib/auth-token";
import { refreshAccessToken } from "@/services/http";

interface AuthContextType {
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: { email: string; password: string }) => Promise<{
    success: boolean;
    message?: string;
  }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hàm thủ công làm mới phiên làm việc
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        setCurrentUser(null);
        return false;
      }

      const payload = decodeJwtPayload(newToken);
      if (payload?.role !== "ADMIN") {
        clearAccessToken();
        setCurrentUser(null);
        return false;
      }

      // Thiết lập thông tin người dùng ngay lập tức từ payload JWT
      if (payload?.sub && payload.email) {
        setCurrentUser({
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          fullName: payload.email.split("@")[0],
        });
      }

      // Tải bổ sung hồ sơ đầy đủ (họ tên đầy đủ, avatar) ngầm không làm chậm giao diện
      authApi
        .getMe()
        .then((userRes) => {
          if (userRes?.success && userRes.data) {
            setCurrentUser(userRes.data);
          }
        })
        .catch(() => {
          // Bỏ qua nếu lỗi, giữ nguyên dữ liệu JWT
        });

      return true;
    } catch {
      clearAccessToken();
      setCurrentUser(null);
      return false;
    }
  }, []);

  // Khôi phục phiên làm việc khi vào trang hoặc F5 tải lại
  useEffect(() => {
    let isMounted = true;

    refreshAccessToken()
      .then((newToken) => {
        if (!isMounted) return;
        if (!newToken) {
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }

        const payload = decodeJwtPayload(newToken);
        if (payload?.role !== "ADMIN") {
          clearAccessToken();
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }

        // Set thông tin người dùng lập tức để render dashboard trong vài mili-giây
        if (payload?.sub && payload.email) {
          setCurrentUser({
            id: payload.sub,
            email: payload.email,
            role: payload.role,
            fullName: payload.email.split("@")[0],
          });
        }
        setIsLoading(false);

        // Nạp chi tiết profile và avatar từ API chạy nền không gây block màn hình
        authApi
          .getMe()
          .then((userRes) => {
            if (isMounted && userRes?.success && userRes.data) {
              setCurrentUser(userRes.data);
            }
          })
          .catch(() => {
            // Không block trang nếu getMe chậm
          });
      })
      .catch(() => {
        if (isMounted) {
          setCurrentUser(null);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (input: { email: string; password: string }) => {
    const res = await authApi.login(input);
    if (res?.success && res.data) {
      const { accessToken, user } = res.data;
      if (user.role !== "ADMIN") {
        clearAccessToken();
        return {
          success: false,
          message: "Tài khoản không có quyền truy cập trang Quản trị (yêu cầu ADMIN).",
        };
      }

      setAccessToken(accessToken);
      setCurrentUser(user);
      return { success: true };
    }

    return {
      success: false,
      message: res?.message || "Đăng nhập thất bại. Vui lòng thử lại.",
    };
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Bỏ qua lỗi logout API
    } finally {
      clearAccessToken();
      setCurrentUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser && currentUser.role === "ADMIN",
        isLoading,
        login,
        logout,
        refreshSession,
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
