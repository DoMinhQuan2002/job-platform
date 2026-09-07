import { http } from "./http";

export interface AdminUserRole {
  id: number;
  name: string;
}

export interface AdminUserItem {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  avatar: string | null;
  role: AdminUserRole;
  status: "ACTIVE" | "BANNED";
  lastLoginAt: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminUsersResponse {
  success: boolean;
  message: string;
  data: {
    items: AdminUserItem[];
    pagination: PaginationMeta;
  };
}

export interface AdminUserDetail extends AdminUserItem {
  dateOfBirth: string | null;
  addressDetail: string | null;
  wardCode: string | null;
  wardName: string | null;
  provinceName: string | null;
  fullAddress: string | null;
  updatedAt: string;
}

export interface AdminUserDetailResponse {
  success: boolean;
  message: string;
  data: AdminUserDetail;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sort?: string;
  fromDate?: string;
  toDate?: string;
}

export interface UserStatsSummary {
  total: number;
  active: number;
  banned: number;
  newIn30Days: number;
}

export const adminUsersApi = {
  getUsers: async (params: GetUsersParams = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search.trim());
    if (params.role && params.role !== "ALL") query.set("role", params.role);
    if (params.status && params.status !== "ALL") query.set("status", params.status);
    if (params.sort) query.set("sort", params.sort);
    if (params.fromDate) query.set("fromDate", params.fromDate);
    if (params.toDate) query.set("toDate", params.toDate);

    const queryString = query.toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : `/admin/users`;

    return http<AdminUsersResponse>(endpoint);
  },

  getUserDetail: async (id: string | number) => {
    return http<AdminUserDetailResponse>(`/admin/users/${id}`);
  },

  updateUserStatus: async (
    id: string | number,
    data: { status: "ACTIVE" | "BANNED"; reason?: string }
  ) => {
    return http<{ success: boolean; message: string; data: { id: string | number; email: string; status: "ACTIVE" | "BANNED"; updatedAt: string } }>(
      `/admin/users/${id}/status`,
      {
        method: "PUT",
        body: data,
      }
    );
  },

  getUserStats: async (): Promise<UserStatsSummary> => {
    try {
      const [totalRes, activeRes, bannedRes] = await Promise.allSettled([
        http<AdminUsersResponse>("/admin/users?page=1&limit=1"),
        http<AdminUsersResponse>("/admin/users?page=1&limit=1&status=ACTIVE"),
        http<AdminUsersResponse>("/admin/users?page=1&limit=1&status=BANNED"),
      ]);

      const total = totalRes.status === "fulfilled" ? totalRes.value.data.pagination.total : 0;
      const active = activeRes.status === "fulfilled" ? activeRes.value.data.pagination.total : 0;
      const banned = bannedRes.status === "fulfilled" ? bannedRes.value.data.pagination.total : 0;
      
      return {
        total,
        active,
        banned,
        newIn30Days: Math.max(0, total - (active + banned > total ? total : 0)),
      };
    } catch {
      return { total: 0, active: 0, banned: 0, newIn30Days: 0 };
    }
  },
};
