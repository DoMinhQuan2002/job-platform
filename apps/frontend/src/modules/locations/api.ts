import { http } from "@/services/http";
import type { ApiSuccess } from "@/types/api";
import type { Province, Ward } from "./types";

export const locationsApi = {
  listProvinces: (signal?: AbortSignal) =>
    http<ApiSuccess<Province[]>>("/locations/provinces", { skipAuth: true, signal }),

  listWards: (provinceCode: string, signal?: AbortSignal) =>
    http<ApiSuccess<Ward[]>>(`/locations/provinces/${encodeURIComponent(provinceCode)}/wards`, {
      skipAuth: true,
      signal,
    }),

  getWard: (code: string, signal?: AbortSignal) =>
    http<ApiSuccess<Ward>>(`/locations/wards/${encodeURIComponent(code)}`, {
      skipAuth: true,
      signal,
    }),
};
