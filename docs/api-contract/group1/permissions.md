# API Contract — Role & Permission (Group 1)

> Owner doc: **Thành viên phụ trách Role & Permission**.
> Status: **Draft GĐ2 — chờ Leader duyệt**.

Liên quan schema: `users`, `roles`, `permissions`, `role_permissions`.

---

## 0. Map Brief ↔ Schema / Đề xuất contract

| Brief (sếp) | Schema / ý nghĩa nghiệp vụ | Đề xuất contract |
|-------------|----------------------------|-------------------|
| `GET /api/users` | Đọc danh sách `users`, kèm role qua `role_id → roles` | `GET /api/v1/users` |
| `GET /api/users/{id}` | Đọc 1 row `users` theo `id` | `GET /api/v1/users/{id}` |
| `PUT /api/users/{id}/status` | Cập nhật `users.status`; quyền gọi API xác định qua `role_permissions` | `PATCH /api/v1/users/{id}/status` |

> Đổi `PUT` (brief gốc) → `PATCH` cho endpoint status vì chỉ cập nhật một field, nhất quán quy ước partial-update với module User Profile (4.2) — cần Leader xác nhận.

**Identity**

- `req.params.id` = `users.id` (khác `req.user.id` của chính admin đang gọi API).
- `users.role_id → roles.id`; quyền gọi API xác định qua bảng nối `role_permissions`, **không hardcode tên role** trong handler.
- `users.id`, `role_id` là `bigint` → API trả dạng string.

**Field naming**

- Database dùng `snake_case`, JSON API dùng `camelCase`.
- Không trả `password_hash`, `deleted_at` ra client.
- `role` trả dạng object `{ id, name }`, không trả `role_id` thô.

---

## 1. Permission model (roles, permissions, role_permissions)

Phần nền cho cả 3 API bên dưới — mô tả cách 3 bảng phối hợp để quyết định "role nào được gọi API nào", không phải một endpoint riêng.

| Bảng | Vai trò |
|------|---------|
| `roles` | Danh sách role: `ADMIN`, `CANDIDATE`, `RECRUITER` |
| `permissions` | Danh sách permission (hành động cụ thể, độc lập với role) |
| `role_permissions` | Gán permission nào thuộc role nào (`role_id`, `permission_id`, unique) |

**Permission seed dùng cho module này**

| Permission (`name`) | Mô tả | Gán cho role | Trạng thái |
|----------------------|-------|--------------|------------|
| `user:read` | Xem danh sách / chi tiết user | `ADMIN` | Đang dùng — API 2.1, 2.2 |
| `user:update_status` | Đổi trạng thái user | `ADMIN` | Đang dùng — API 3.1 |
| `role:read` | Xem danh sách role trong `roles` | `ADMIN` | Đề xuất — chưa có API tương ứng |
| `permission:read` | Xem danh sách permission trong `permissions` | `ADMIN` | Đề xuất — chưa có API tương ứng |
| `permission:assign` | Gán / gỡ permission cho role (ghi `role_permissions`) | `ADMIN` | Đề xuất — chưa có API tương ứng |

`CANDIDATE` và `RECRUITER` không được gán bất kỳ permission nào ở trên trong `role_permissions` → mọi request từ 2 role này tới các API liên quan đều trả `403`.

3 permission cuối (`role:read`, `permission:read`, `permission:assign`) **chỉ cần seed nếu** Leader xác nhận GĐ2 có API quản lý roles/permissions (xem gap đã nêu ở lần trao đổi trước — brief hiện chưa giao API nào cho việc này). Nếu không, chỉ giữ 2 permission đầu cho đúng phạm vi 3 API được giao.

**Quy ước đặt tên:** `resource:action` (snake_case cho action nhiều từ, vd. `user:update_status`). Đề xuất các nhóm khác dùng chung quy ước này khi seed permission cho module của họ (vd. `job:create`, `application:update_status`) để `role_permissions` nhất quán toàn dự án — cần Leader chốt có áp dụng chung hay không.

**Middleware:** `authenticate` (verify access token) → `authorize('user:read')` hoặc `authorize('user:update_status')` — tra theo `role_permissions` của `role_id` hiện tại, không so tên role trực tiếp trong code.

---

## 2. User listing endpoints

Base: `/api/v1/users`
Auth: `ADMIN` (permission `user:read`)

### 2.1 Danh sách user

| | |
|--|--|
| Tên | Lấy danh sách user |
| Method / URL | `GET /api/v1/users` |
| Quyền | `user:read` |
| Request | Query params |
| Validation | Phải đăng nhập + có permission `user:read` |

**Query**

| Param | Required | Validation |
|-------|----------|------------|
| `roleId` | no | tồn tại trong `roles` |
| `status` | no | `ACTIVE` \| `BANNED` |
| `keyword` | no | tìm theo `email`, `full_name` |
| `page`, `limit` | no | default `page=1`, `limit=20` |

**Response 200**

```json
{
  "success": true,
  "message": "Lấy danh sách user thành công",
  "data": {
    "items": [
      {
        "id": "1",
        "email": "user@example.com",
        "fullName": "Nguyen Van A",
        "role": { "id": "2", "name": "CANDIDATE" },
        "status": "ACTIVE",
        "createdAt": "2026-08-21T00:00:00.000Z"
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 1 }
  }
}
```

**Errors:** `401`, `403`, `500`

---

### 2.2 Chi tiết user

| | |
|--|--|
| Tên | Lấy chi tiết một user |
| Method / URL | `GET /api/v1/users/{id}` |
| Quyền | `user:read` |
| Request | — |
| Validation | Phải đăng nhập + có permission `user:read`; `id` phải tồn tại |

**Response 200:** cùng shape 1 item như mục 2.1 (không bọc `items` / `meta`).

**Errors:** `401`, `403`, `404`, `500`

---

## 3. User status endpoint

Base: `/api/v1/users`
Auth: `ADMIN` (permission `user:update_status`)

### 3.1 Đổi trạng thái user

| | |
|--|--|
| Tên | Khoá / mở tài khoản user |
| Method / URL | `PATCH /api/v1/users/{id}/status` |
| Quyền | `user:update_status` |
| Content-Type | `application/json` |

**Request**

```json
{
  "status": "BANNED"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `status` | string | yes | `ACTIVE` \| `BANNED` |

- Không nhận `role`, `roleId`, `email` hay field khác — endpoint chỉ đổi `status`.
- Không cho tự đổi status chính mình (`id === req.user.id` → `400`).

**Response 200:** user đã cập nhật, cùng shape như mục 2.2.

**Errors:** `400`, `401`, `403`, `404`, `500`

---

## 4. Mapping API ↔ Database

| API field | Database field | Ghi chú |
|-----------|-----------------|---------|
| `id` | `users.id` | Read-only; trả string |
| `email` | `users.email` | Read-only trong module này |
| `fullName` | `users.full_name` | Read-only trong module này |
| `role` | `users.role_id` → `roles.id/name` | Read-only trong module này; join sang `roles` |
| `status` | `users.status` | Ghi được — qua API 3.1 |
| `createdAt` | `users.created_at` | Read-only |
| — | `users.password_hash` | Không trả ra client |
| — | `users.deleted_at` | Không trả ra client |
| — | `role_permissions` | Không expose qua API này; chỉ dùng nội bộ để authorize |

---

## 5. Ranh giới với User Profile (4.2)

| Nhóm field / endpoint | Thuộc về |
|------------------------|----------|
| `email`, `fullName`, `role`, `status` (đọc), danh sách user, đổi trạng thái | **Doc này (4.3 — Role & Permission)**, base `/api/v1/users`, `/api/v1/users/{id}` |
| `phone`, `avatar`, `dateOfBirth`, `addressDetail`, `wardCode`, đổi mật khẩu | 4.2 — User Profile, base `/api/v1/users/me*` |

Hai module dùng chung bảng `users` nhưng tách theo path: `.../me` = tự thao tác trên chính mình (mọi role đã đăng nhập), `.../{id}` = ADMIN thao tác trên user khác.

---

## 6. Draft contract ≠ implementation

URL, method, permission name và envelope trong doc này chỉ trở thành contract chính thức sau khi Leader approve.
