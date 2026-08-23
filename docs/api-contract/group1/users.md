# API Contract — Users (Group 1)

> Owner doc: **Thành viên phụ trách User Profile**.  
> Status: **Draft GĐ2 — chờ Leader duyệt**.

Liên quan schema: `users`, `wards`, `sessions`; Supabase Storage bucket `avatars`.

---

## 0. Map Brief ↔ Schema / Đề xuất contract

| Brief (sếp) | Schema / ý nghiệp vụ | Đề xuất contract |
|-------------|----------------------|------------------|
| `GET /api/users/me` | Đọc row `users` theo user trong access token | `GET /api/v1/users/me` |
| `PUT /api/users/me` | Cập nhật một phần `full_name`, `phone`, `date_of_birth`, `address_detail`, `ward_code` | `PATCH /api/v1/users/me` |
| Avatar trong profile | `users.avatar` + Supabase Storage | `POST/DELETE /api/v1/users/me/avatar` |
| Đổi mật khẩu | `users.password_hash` + revoke `sessions` | `PATCH /api/v1/users/me/password` |
| Giới thiệu bản thân | Không có cột tương ứng trong `users` | Không đưa vào contract này; Candidate dùng `candidate_profiles.bio` |

**Identity**

- `req.user.id` = `users.id`.
- Backend lấy user ID từ access token, không nhận `userId` từ body hoặc query.
- `users.ward_code` tham chiếu `wards.code`.
- `users.id` và `role_id` là `bigint`; API trả dạng string để an toàn với JavaScript.

**Field naming**

- Database PostgreSQL/Supabase dùng `snake_case`.
- JSON API dùng `camelCase`.
- Không trả `password_hash` và `deleted_at` ra client.

---

## 1. User Profile endpoints

Base: `/api/v1/users`  
Auth: `CANDIDATE | RECRUITER` (Bearer access token)

### 1.1 Get my profile

| | |
|--|--|
| Tên | Lấy thông tin cá nhân |
| Method / URL | `GET /api/v1/users/me` |
| Quyền | `CANDIDATE`, `RECRUITER` |
| Request | — |
| Validation | Phải đăng nhập |

**Response 200**

```json
{
  "success": true,
  "message": "Lấy thông tin cá nhân thành công",
  "data": {
    "id": "1",
    "roleId": "2",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "phone": "0901234567",
    "avatar": "https://project.supabase.co/storage/v1/object/public/avatars/users/1/avatar.webp",
    "dateOfBirth": "2000-01-15",
    "addressDetail": "12 Nguyen Trai",
    "wardCode": "00001",
    "status": "ACTIVE",
    "createdAt": "2026-08-21T00:00:00.000Z",
    "updatedAt": "2026-08-21T00:00:00.000Z",
    "lastLoginAt": "2026-08-21T01:00:00.000Z",
    "emailVerifiedAt": null
  }
}
```

`avatar` trong response là public URL hoặc signed URL được tạo từ storage path lưu tại `users.avatar`.

**Errors:** `401`, `403`, `500`

---

### 1.2 Update my profile

| | |
|--|--|
| Tên | Cập nhật một phần thông tin cá nhân |
| Method / URL | `PATCH /api/v1/users/me` |
| Quyền | `CANDIDATE`, `RECRUITER` |
| Content-Type | `application/json` |

**Request**

```json
{
  "fullName": "Nguyen Van B",
  "phone": "0901234567",
  "dateOfBirth": "2000-01-15",
  "addressDetail": "12 Nguyen Trai",
  "wardCode": "00001"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `fullName` | string | no | Trim; 2–100 ký tự; không được `null` / rỗng nếu gửi |
| `phone` | string \| null | no | Tối đa 20 ký tự; regex đề xuất `^(0|\+84)[0-9]{9}$` |
| `dateOfBirth` | string \| null | no | `YYYY-MM-DD`; không là ngày tương lai |
| `addressDetail` | string \| null | no | Trim; tối đa 255 ký tự |
| `wardCode` | string \| null | no | Tối đa 20 ký tự; phải tồn tại trong `wards` |

- Omit field = giữ nguyên.
- `null` = xóa giá trị của field nullable.
- Không nhận `email`, `roleId`, `status`, `passwordHash`, `avatar`, `createdAt`, `updatedAt`.
- Avatar chỉ cập nhật qua endpoint avatar riêng.

**Response 200:** cùng shape `data` như GET, với dữ liệu mới nhất.  
**Errors:** `400`, `401`, `403`, `404` (`wardCode` không tồn tại), `500`

---

## 2. Avatar endpoints

Storage: Supabase Storage  
Bucket đề xuất: `avatars`

### 2.1 Upload or replace avatar

| | |
|--|--|
| Tên | Upload / thay avatar |
| Method / URL | `POST /api/v1/users/me/avatar` |
| Quyền | `CANDIDATE`, `RECRUITER` |
| Content-Type | `multipart/form-data` |

**Form-data**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `avatar` | file | yes | JPEG, PNG hoặc WebP; tối đa 5 MB |

Backend phải kiểm tra MIME thực tế, không chỉ phần mở rộng file.

**Response 200**

```json
{
  "success": true,
  "message": "Cập nhật avatar thành công",
  "data": {
    "avatar": "https://project.supabase.co/storage/v1/object/public/avatars/users/1/avatar.webp"
  }
}
```

**Flow**

1. Lấy `userId` từ access token.
2. Validate file.
3. Upload vào path `users/{userId}/avatar.webp` hoặc path có version.
4. Cập nhật `users.avatar` bằng storage path.
5. Chỉ xóa file cũ sau khi upload và cập nhật database thành công.
6. Trả public URL hoặc signed URL cho FE.

**Errors:** `400`, `401`, `403`, `500`

---

### 2.2 Delete avatar

| | |
|--|--|
| Tên | Xóa avatar hiện tại |
| Method / URL | `DELETE /api/v1/users/me/avatar` |
| Quyền | `CANDIDATE`, `RECRUITER` |
| Request | — |

Backend xóa file khỏi Supabase Storage và đặt `users.avatar = null`.

**Response 200**

```json
{
  "success": true,
  "message": "Xóa avatar thành công",
  "data": {
    "avatar": null
  }
}
```

Nếu user chưa có avatar, API vẫn trả `200` để đảm bảo idempotent.

**Errors:** `401`, `403`, `500`

---

## 3. Change password

### 3.1 Change my password

| | |
|--|--|
| Tên | Đổi mật khẩu của tài khoản hiện tại |
| Method / URL | `PATCH /api/v1/users/me/password` |
| Quyền | `CANDIDATE`, `RECRUITER` |
| Content-Type | `application/json` |

Chỉ áp dụng cho tài khoản có `users.password_hash`. Tài khoản OAuth-only cần luồng thiết lập mật khẩu riêng nếu dự án hỗ trợ.

**Request**

```json
{
  "currentPassword": "CurrentPassword@123",
  "newPassword": "NewPassword@123"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `currentPassword` | string | yes | Phải khớp `users.password_hash` hiện tại |
| `newPassword` | string | yes | 8–72 ký tự; chữ hoa, chữ thường, chữ số, ký tự đặc biệt |

- `newPassword` không được giống `currentPassword`.
- `confirmPassword` chỉ xử lý ở frontend, không gửi lên API.
- Hash bằng Argon2id hoặc bcrypt trước khi lưu.
- Không log hoặc trả mật khẩu / hash trong response.
- Giới hạn số lần thử để giảm brute force.

**Response 200**

```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công",
  "data": null
}
```

**Flow**

1. Lấy `userId` từ access token.
2. Kiểm tra `currentPassword` với `users.password_hash`.
3. Validate và hash `newPassword`.
4. Cập nhật `users.password_hash`, `users.updated_at` trong transaction.
5. Revoke session trong bảng `sessions` theo chính sách đã chốt.
6. Yêu cầu user đăng nhập lại nếu toàn bộ session bị revoke.

**Errors:** `400`, `401`, `403`, `429`, `500`

> Cần thống nhất password policy và session policy với thành viên Authentication.

---

## 4. Mapping API ↔ Database

| API field | Database field | Ghi chú |
|-----------|----------------|---------|
| `id` | `users.id` | Read-only; trả string |
| `roleId` | `users.role_id` | Read-only; trả string |
| `email` | `users.email` | Read-only trong module này |
| `fullName` | `users.full_name` | Profile update |
| `phone` | `users.phone` | Profile update |
| `avatar` | `users.avatar` | Lưu Supabase storage path |
| `dateOfBirth` | `users.date_of_birth` | Profile update |
| `addressDetail` | `users.address_detail` | Profile update |
| `wardCode` | `users.ward_code` | FK đến `wards.code` |
| `status` | `users.status` | Read-only trong module này |
| `createdAt` | `users.created_at` | Read-only |
| `updatedAt` | `users.updated_at` | Backend tự cập nhật |
| `lastLoginAt` | `users.last_login_at` | Read-only |
| `emailVerifiedAt` | `users.email_verified_at` | Read-only |
| — | `users.password_hash` | Không trả ra client |
| — | `users.deleted_at` | Soft delete nội bộ; không trả ra client |

---

## 5. Supabase Storage rules

- Bucket đề xuất: `avatars`.
- Lưu storage path trong `users.avatar`, ví dụ `users/1/avatar.webp`.
- Public bucket → trả public URL.
- Private bucket → tạo signed URL có thời hạn.
- Service role key chỉ dùng ở backend, không gửi frontend.
- Validate MIME, kích thước và quyền sở hữu trước khi upload / delete.

---

## 6. Ranh giới với Group 3

| Field | API |
|-------|-----|
| fullName, phone, dateOfBirth, addressDetail, wardCode, avatar | Group 1 — doc này |
| bio, careerObjective, education, experience, skills, CV | Group 3 — Candidate |

FE trang “Hồ sơ ứng viên” có thể gọi **cả hai module**.

---

## 7. Draft contract ≠ implementation

URL, method, envelope, validation và session policy trong doc này chỉ trở thành contract chính thức sau khi Leader approve.

