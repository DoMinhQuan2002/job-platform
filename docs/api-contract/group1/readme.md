# API Contract — Group 1 (User Profile)

> **Giai đoạn 2** — tài liệu contract để Leader / FE / BE thống nhất.  
> **Chưa phải** implementation chính thức.  
> Branch tài liệu: `docs/api-group1`.

## Files trong folder này

| File | Scope |
|------|--------|
| [users.md](./users.md) | Xem/sửa profile, avatar, đổi mật khẩu |

Avatar sử dụng Supabase Storage, bucket đề xuất `avatars`.

---

## Base URL

| Brief sếp | Đề xuất contract |
|-----------|------------------|
| `/api/...` | **`/api/v1/...`** |

Cần Leader chốt: giữ `v1` hay bỏ.

---

## Envelope chung (theo brief GĐ2)

**Success**

```json
{
  "success": true,
  "message": "Thành công",
  "data": {}
}
```

**Error**

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": []
}
```

### HTTP Status

| Code | Nghĩa |
|------|--------|
| 200 | Thành công |
| 400 | Validation |
| 401 | Chưa đăng nhập / token lỗi |
| 403 | Không có quyền |
| 404 | Không tìm thấy dữ liệu liên quan |
| 429 | Thao tác quá nhiều lần |
| 500 | Lỗi hệ thống |

---

## API trong phạm vi

| Method | URL | Mô tả |
|--------|-----|-------|
| `GET` | `/api/v1/users/me` | Lấy profile của chính mình |
| `PATCH` | `/api/v1/users/me` | Cập nhật một phần profile |
| `POST` | `/api/v1/users/me/avatar` | Upload / thay avatar |
| `DELETE` | `/api/v1/users/me/avatar` | Xóa avatar |
| `PATCH` | `/api/v1/users/me/password` | Đổi mật khẩu |

---

## Quyết định cần Leader chọn (quan trọng)

### A. Update profile method

| Option | Method | Ý nghĩa |
|--------|--------|---------|
| **A1 — Brief** | `PUT /api/v1/users/me` | Theo đúng phân công ban đầu |
| **A2 — Khuyến nghị** | `PATCH /api/v1/users/me` | Partial update, field không gửi thì giữ nguyên |

**Khuyến nghị:** **A2** vì form profile thường chỉ cập nhật một số field.

### B. Avatar access

| Option | Cách trả avatar | Ghi chú |
|--------|-----------------|---------|
| **B1 — Public bucket** | Public URL | Đơn giản, phù hợp avatar công khai |
| **B2 — Private bucket** | Signed URL | Kiểm soát truy cập, URL có thời hạn |

Trong database nên lưu storage path, ví dụ `users/1/avatar.webp`, không lưu URL đầy đủ.

### C. Change password session policy

| Option | Hành vi sau khi đổi mật khẩu |
|--------|------------------------------|
| **C1 — Khuyến nghị** | Revoke toàn bộ session và yêu cầu đăng nhập lại |
| **C2** | Giữ session hiện tại, revoke các session còn lại |

---

## Ranh giới module

| Nội dung | Module phụ trách |
|----------|------------------|
| Họ tên, SĐT, ngày sinh, địa chỉ, avatar | Group 1 — User Profile |
| Register, login, logout, JWT, refresh token | Group 1 — Authentication |
| Role, permission, khóa/mở tài khoản | Group 1 — Role & Permission / Admin |
| Bio nghề nghiệp, học vấn, kinh nghiệm, kỹ năng, CV | Group 3 — Candidate |

API đổi mật khẩu nằm trong `users.md` nhưng phải thống nhất quy tắc mật khẩu và revoke session với thành viên Authentication.

---

## Checklist GĐ2 (User Profile)

- [ ] Leader chốt `PATCH` thay cho `PUT`
- [ ] Leader chốt giữ `/api/v1` hay bỏ
- [ ] FE xác nhận field form profile
- [ ] Chốt bucket avatar public hay private
- [ ] Chốt giới hạn avatar: JPEG / PNG / WebP, tối đa 5 MB
- [ ] Chốt chính sách session sau khi đổi mật khẩu
- [ ] Không trả `password_hash` và `deleted_at` ra client
- [ ] Không còn chồng chéo với Candidate Profile của Group 3
- [ ] PR merge `docs/api-group1` → `main`

