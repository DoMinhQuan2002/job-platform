import { clearAccessToken, getAccessTokenExpiry } from "@/lib/auth-token";

/** Xin token mới sớm hơn hạn 60s, phòng khi đồng hồ lệch hoặc mạng chậm. */
const REFRESH_SKEW_MS = 60_000;

/** Chặn vòng lặp nóng khi token trả về đã hết hạn sẵn. */
const MIN_DELAY_MS = 1_000;

let timer: ReturnType<typeof setTimeout> | null = null;
let inFlight: Promise<string | null> | null = null;

/**
 * Gọi /refresh-token. Nhiều nơi gọi cùng lúc vẫn chỉ tạo 1 request.
 * Trả về access token mới, hoặc null nếu refresh thất bại.
 * Dùng dynamic import vì auth.service lại đi qua http() -> tránh vòng import.
 */
export const refreshAccessToken = (): Promise<string | null> => {
  if (!inFlight) {
    inFlight = import("@/services/auth.service")
      .then(({ authApi }) => authApi.refresh())
      .then((response) => response.data.accessToken)
      .catch(() => null)
      .finally(() => {
        inFlight = null;
      });
  }

  return inFlight;
};

export const cancelTokenRefresh = () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
};

/** Hẹn giờ tự refresh TRƯỚC khi access token hết hạn. */
export const scheduleTokenRefresh = () => {
  if (typeof window === "undefined") return;

  cancelTokenRefresh();

  const expiresAt = getAccessTokenExpiry();
  if (!expiresAt) return;

  const delay = Math.max(expiresAt - Date.now() - REFRESH_SKEW_MS, MIN_DELAY_MS);

  timer = setTimeout(() => {
    void refreshAccessToken().then((token) => {
      if (token) {
        scheduleTokenRefresh();
      } else {
        clearAccessToken();
      }
    });
  }, delay);
};
