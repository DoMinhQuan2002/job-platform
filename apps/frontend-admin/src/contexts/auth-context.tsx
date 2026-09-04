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
  StoredUser,
  clearAccessToken,
  decodeJwtPayload,
  getAccessToken,
  getStoredUser,
  isTokenExpired,
  setAccessToken,
  setStoredUser,
} from "@/lib/auth-token";
import { refreshAccessToken } from "@/services/http";

interface AuthContextType {
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    input: { email: string; password: string },
    options?: { remember?: boolean }
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const toAuthUser = (user: StoredUser, fallbackId: string | number = ""): CurrentUser => ({
  id: user.id ?? fallbackId,
  email: user.email,
  fullName: user.fullName,
  role: user.role,
  avatar: user.avatar,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Đồng bộ user từ Access Token / Cookie hiện có nếu còn hạn
  const syncFromToken = useCallback((): boolean => {
    const token = getAccessToken();
    if (!token || isTokenExpired(token)) {
      return false;
    }

    const payload = decodeJwtPayload(token);
    if (payload?.role !== "ADMIN") {
      clearAccessToken();
      setCurrentUser(null);
      return false;
    }

    const storedUser = getStoredUser();
    if (storedUser && storedUser.role === "ADMIN") {
      setCurrentUser(toAuthUser(storedUser, payload.sub || ""));
    } else if (payload.sub && payload.email) {
      setCurrentUser({
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        fullName: payload.email.split("@")[0],
      });
    }

    return true;
  }, []);

  // Hàm thủ công làm mới phiên làm việc
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        clearAccessToken();
        setCurrentUser(null);
        return false;
      }

      const payload = decodeJwtPayload(newToken);
      if (payload?.role !== "ADMIN") {
        clearAccessToken();
        setCurrentUser(null);
        return false;
      }

      const storedUser = getStoredUser();
      if (storedUser && storedUser.role === "ADMIN") {
        setCurrentUser(toAuthUser(storedUser, payload.sub || ""));
      } else if (payload.sub && payload.email) {
        setCurrentUser({
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          fullName: payload.email.split("@")[0],
        });
      }

      // Tải hồ sơ đầy đủ ngầm
      authApi
        .getMe()
        .then((userRes) => {
          if (userRes?.success && userRes.data) {
            setCurrentUser(userRes.data);
            setStoredUser(userRes.data);
          }
        })
        .catch(() => {});

      return true;
    } catch {
      clearAccessToken();
      setCurrentUser(null);
      return false;
    }
  }, []);

  // Khôi phục phiên làm việc khi vào trang hoặc F5
  useEffect(() => {
    let isMounted = true;

    // 1. Kiểm tra nếu đã có token hợp lệ sẵn trong Cookie -> render ngay
    const isValid = syncFromToken();
    if (isValid) {
      setIsLoading(false);
      // Nạp thông tin mới nhất từ API chạy nền
      authApi
        .getMe()
        .then((userRes) => {
          if (isMounted && userRes?.success && userRes.data) {
            setCurrentUser(userRes.data);
            setStoredUser(userRes.data);
          }
        })
        .catch(() => {});
      return;
    }

    // 2. Nếu chưa có hoặc token đã hết hạn -> gọi refresh qua HttpOnly cookie
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

        const storedUser = getStoredUser();
        if (storedUser && storedUser.role === "ADMIN") {
          setCurrentUser(toAuthUser(storedUser, payload.sub || ""));
        } else if (payload?.sub && payload.email) {
          setCurrentUser({
            id: payload.sub,
            email: payload.email,
            role: payload.role,
            fullName: payload.email.split("@")[0],
          });
        }
        setIsLoading(false);

        authApi
          .getMe()
          .then((userRes) => {
            if (isMounted && userRes?.success && userRes.data) {
              setCurrentUser(userRes.data);
              setStoredUser(userRes.data);
            }
          })
          .catch(() => {});
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
  }, [syncFromToken]);

  // Lắng nghe sự kiện thay đổi trạng thái xác thực trên toàn hệ thống
  useEffect(() => {
    const handleAuthChange = () => {
      syncFromToken();
    };

    window.addEventListener("jp-admin-auth-change", handleAuthChange);
    return () => {
      window.removeEventListener("jp-admin-auth-change", handleAuthChange);
    };
  }, [syncFromToken]);

  const login = async (
    input: { email: string; password: string },
    options?: { remember?: boolean }
  ) => {
    const res = await authApi.login(input, options);
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
      setStoredUser(user);
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
