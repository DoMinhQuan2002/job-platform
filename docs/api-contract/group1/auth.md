# API Contract — Authentication (Nhóm 1)

> **Giai đoạn 2** — tài liệu contract, dùng để Leader / FE / BE thống nhất trước khi code.
> Bản cập nhật: đã khớp theo DB schema thực tế (`users`, `roles`, `sessions`...).
> Base URL: `/api/v1`
> File: `docs/api/auth.md`

## Envelope chung

**Response thành công**
```json
{
  "success": true,
  "message": "Thành công",
  "data": {}
}
```

**Response lỗi**
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": []
}
```

## Cấu hình chung

| Mục | Giá trị |
|---|---|
| Mã OTP | 6 chữ số, chỉ chứa số |
| OTP hết hạn | 5 phút (300 giây) |
| Resend OTP | tối thiểu 60 giây / lần |
| Nơi lưu OTP / cooldown / reset token | **Redis** — DB hiện không có bảng cho OTP (xem mục Ghi chú) |
| Password | tối thiểu 8 ký tự, có chữ hoa + chữ thường + số |
| Access token (JWT) | sống 15 phút (900 giây) |
| Refresh token | random string, hash lưu ở `sessions.refresh_token_hash`, sống 7 ngày (`sessions.expires_at`) |
| Refresh token — vận chuyển | **httpOnly cookie** (web-only), tên cookie `refresh_token`, cờ `HttpOnly; Secure; SameSite=Strict; Path=/api/v1` — không trả trong JSON body |
| Reset token (quên mật khẩu) | random string, lưu Redis, sống 15 phút, dùng 1 lần |

---

## 1. Đăng ký (Register)

### 1.1 Đăng ký tài khoản

- **Tên chức năng:** Đăng ký tài khoản mới
- **URL:** `POST /api/v1/register`
- **Quyền truy cập:** Public
- **Request:**

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| email | string | ✓ | tối đa 255 ký tự, unique (khớp `users.email`) |
| password | string | ✓ | theo Cấu hình chung |
| fullName | string | ✓ | tối đa 100 ký tự (khớp `users.full_name`) |
| role | string | ✓ | `CANDIDATE` hoặc `RECRUITER` — resolve qua bảng `roles` |

```json
{
  "email": "a@example.com",
  "password": "Abcd1234",
  "fullName": "Nguyễn Văn A",
  "role": "CANDIDATE"
}
```

- **Response thành công (201):**
```json
{
  "success": true,
  "message": "Đăng ký thành công, vui lòng kiểm tra email để lấy mã xác thực",
  "data": {
    "email": "a@example.com",
    "otpExpiresIn": 300
  }
}
```

- **Response lỗi:**

| HTTP Status | Trường hợp |
|---|---|
| 400 | Thiếu field / sai định dạng / password yếu / `role` không hợp lệ (không có trong bảng `roles`, hoặc là `ADMIN`) |
| 409 | Email đã tồn tại **và** `email_verified_at` đã có giá trị (đã verify rồi) |

- **Validation:** email đúng định dạng + ≤255 ký tự; password theo Cấu hình chung; fullName ≤100 ký tự; role ∈ {CANDIDATE, RECRUITER}.
- **Xử lý:**
  - Email nên lowercase trước khi so sánh/lưu — unique constraint của Postgres phân biệt hoa thường theo mặc định.
  - Resolve `role` (name) → `role_id` qua bảng `roles`. Không cho tự chọn `ADMIN`.
  - Nếu email đã tồn tại nhưng `email_verified_at IS NULL` (đăng ký dở, chưa verify) → cho phép ghi đè `password_hash` / `full_name` + gửi OTP mới, **không** insert row mới (tránh vi phạm unique).
  - Nếu email chưa tồn tại → insert `users` (role_id, email, password_hash, full_name, status mặc định `ACTIVE`, email_verified_at = NULL).
  - Sinh OTP, lưu Redis (`otp:register:{email}`, TTL 300s), gửi email.

### 1.2 Xác thực mã đăng ký

- **Tên chức năng:** Verify OTP, kích hoạt tài khoản
- **URL:** `POST /api/v1/register/verify-code`
- **Quyền truy cập:** Public
- **Request:**
```json
{
  "email": "a@example.com",
  "code": "123456"
}
```

- **Response thành công (200):**
```json
{
  "success": true,
  "message": "Xác thực thành công, tài khoản đã được kích hoạt",
  "data": {
    "userId": 1024,
    "email": "a@example.com"
  }
}
```

- **Response lỗi:**

| HTTP Status | Trường hợp |
|---|---|
| 400 | Mã sai định dạng / mã không đúng / mã đã hết hạn |
| 404 | Không tìm thấy user với email này, hoặc user đã verify rồi |

- **Validation:** code đúng 6 số, khớp mã trong Redis, còn trong 5 phút.
- **Xử lý:** check OTP trong Redis (`otp:register:{email}`); đúng thì `UPDATE users SET email_verified_at = now() WHERE email = ?`, xoá key Redis (dùng 1 lần).

### 1.3 Gửi lại mã đăng ký

- **Tên chức năng:** Resend OTP đăng ký
- **URL:** `POST /api/v1/register/resend-code`
- **Quyền truy cập:** Public
- **Request:**
```json
{ "email": "a@example.com" }
```

- **Response thành công (200):**
```json
{
  "success": true,
  "message": "Đã gửi lại mã xác thực",
  "data": { "otpExpiresIn": 300 }
}
```

- **Response lỗi:**

| HTTP Status | Trường hợp |
|---|---|
| 400 | Gọi lại quá sớm (chưa đủ 60 giây từ lần gửi trước) |
| 404 | Không tìm thấy user pending (chưa verify) với email này |
| 409 | Tài khoản đã verify rồi, không cần gửi lại |

---

## 2. Đăng nhập / Đăng xuất

### 2.1 Đăng nhập

- **Tên chức năng:** Đăng nhập
- **URL:** `POST /api/v1/login`
- **Quyền truy cập:** Public
- **Request:**
```json
{
  "email": "a@example.com",
  "password": "Abcd1234"
}
```

- **Response thành công (200):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "...",
    "expiresIn": 900,
    "user": {
      "id": 1024,
      "email": "a@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "CANDIDATE"
    }
  }
}
```
> `refreshToken` **không** nằm trong body — server set qua header `Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1; Max-Age=604800` (7 ngày).

- **Response lỗi:**

| HTTP Status | Trường hợp | code (trong `errors`) |
|---|---|---|
| 400 | Thiếu email / password | |
| 401 | Sai email hoặc password, hoặc tài khoản đã bị xoá (`deleted_at`) — dùng chung 1 message | |
| 403 | Email chưa xác thực (`email_verified_at IS NULL`) | `EMAIL_NOT_VERIFIED` |
| 403 | Tài khoản bị khoá (`status = BANNED`) | `ACCOUNT_BANNED` |

- **Validation:** email + password bắt buộc.
- **Xử lý:** check `deleted_at IS NULL` → check `password_hash` khớp → check `email_verified_at IS NOT NULL` → check `status != BANNED`. Thành công thì: update `last_login_at`; sinh `refreshToken` random, hash rồi insert vào `sessions` (user_id, refresh_token_hash, expires_at = now()+7 ngày, is_revoked=false); set cookie như trên; JOIN `roles` để lấy `role.name` trả về.

### 2.2 Đăng xuất

- **Tên chức năng:** Đăng xuất
- **URL:** `POST /api/v1/logout`
- **Quyền truy cập:** Đã đăng nhập (Bearer accessToken)
- **Request:** không cần body — `refreshToken` server tự đọc từ cookie `refresh_token`.

- **Response thành công (200):**
```json
{
  "success": true,
  "message": "Đăng xuất thành công",
  "data": {}
}
```
> Response kèm header xoá cookie: `Set-Cookie: refresh_token=; HttpOnly; Secure; SameSite=Strict; Path=/api/v1; Max-Age=0`.

- **Response lỗi:**

| HTTP Status | Trường hợp |
|---|---|
| 401 | accessToken thiếu / sai / hết hạn |
| 400 | Không có cookie `refresh_token`, hoặc không khớp session nào đang tồn tại |

- **Xử lý:** đọc `refresh_token` từ cookie, hash lại, tìm row trong `sessions` theo `refresh_token_hash`, set `is_revoked = true` (giữ lại record, không xoá); xoá cookie ở response.

### 2.3 Làm mới access token

- **Tên chức năng:** Cấp `accessToken` mới bằng `refreshToken` (không cần đăng nhập lại)
- **URL:** `POST /api/v1/refresh-token`
- **Quyền truy cập:** Public (xác thực bằng cookie `refresh_token` — lúc gọi API này thì `accessToken` cũ đã hết hạn rồi, không thể dùng Bearer)
- **Request:** không cần body — `refreshToken` server tự đọc từ cookie `refresh_token`.

- **Response thành công (200):**
```json
{
  "success": true,
  "message": "Làm mới access token thành công",
  "data": {
    "accessToken": "...",
    "expiresIn": 900
  }
}
```

- **Response lỗi:**

| HTTP Status | Trường hợp |
|---|---|
| 401 | Không có cookie `refresh_token`, hoặc token không hợp lệ / đã bị revoke (đã logout) / đã hết hạn (quá 7 ngày) |

- **Xử lý:** đọc `refresh_token` từ cookie, hash lại, tìm trong `sessions` theo `refresh_token_hash`; check `is_revoked = false` và `expires_at > now()`; hợp lệ thì sinh `accessToken` mới (15 phút). Bản đơn giản: giữ nguyên `refreshToken`/cookie cũ (không đổi) cho tới khi hết hạn hoặc logout. Bản chặt hơn (rotation): mỗi lần refresh thì cấp `refreshToken` mới, set lại cookie, thu hồi cái cũ — phát hiện được nếu 1 refreshToken cũ bị lộ và dùng lại. Đề xuất bắt đầu bản đơn giản trước.

---

## 3. Quên mật khẩu (Forgot Password)

### 3.1 Gửi yêu cầu quên mật khẩu

- **Tên chức năng:** Gửi OTP quên mật khẩu
- **URL:** `POST /api/v1/forgot-password`
- **Quyền truy cập:** Public
- **Request:**
```json
{ "email": "a@example.com" }
```

- **Response thành công (200):**
```json
{
  "success": true,
  "message": "Nếu email tồn tại trong hệ thống, mã xác thực đã được gửi",
  "data": {}
}
```
> Luôn trả success dù email có tồn tại hay không, tránh lộ email nào có tài khoản.

- **Response lỗi:**

| HTTP Status | Trường hợp |
|---|---|
| 400 | Email sai định dạng |

- **Xử lý:** nếu email tồn tại trong `users` → sinh OTP, lưu Redis (`otp:forgot_password:{email}`, TTL 300s), gửi mail. Nếu không tồn tại → không làm gì, vẫn trả response giống hệt như trên.

### 3.2 Xác thực mã quên mật khẩu

- **Tên chức năng:** Verify OTP quên mật khẩu, cấp reset token
- **URL:** `POST /api/v1/forgot-password/verify-code`
- **Quyền truy cập:** Public
- **Request:**
```json
{
  "email": "a@example.com",
  "code": "123456"
}
```

- **Response thành công (200):**
```json
{
  "success": true,
  "message": "Xác thực thành công",
  "data": {
    "resetToken": "...",
    "resetTokenExpiresIn": 900
  }
}
```

- **Response lỗi:**

| HTTP Status | Trường hợp |
|---|---|
| 400 | Mã không đúng hoặc đã hết hạn (gộp chung 1 message — **không** dùng 404, để không lộ email có tồn tại trong hệ thống hay không) |

- **Xử lý:** check Redis `otp:forgot_password:{email}`; đúng thì sinh `resetToken` random, lưu Redis (`reset_token:{token} → email`, TTL 900s), xoá OTP key.

### 3.3 Đặt mật khẩu mới

- **Tên chức năng:** Đổi mật khẩu bằng reset token
- **URL:** `POST /api/v1/forgot-password/reset`
- **Quyền truy cập:** Public (xác thực bằng `resetToken`, không cần đăng nhập)
- **Request:**
```json
{
  "resetToken": "...",
  "newPassword": "NewAbcd1234"
}
```

- **Response thành công (200):**
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công",
  "data": {}
}
```

- **Response lỗi:**

| HTTP Status | Trường hợp |
|---|---|
| 400 | newPassword không đủ mạnh |
| 401 | resetToken không hợp lệ / đã dùng / hết hạn |

- **Validation:** newPassword theo Cấu hình chung.
- **Xử lý:** lookup Redis theo `resetToken` → lấy email → `UPDATE users SET password_hash = ...`; xoá reset token key (dùng 1 lần); `UPDATE sessions SET is_revoked = true WHERE user_id = ?` (đăng xuất toàn bộ thiết bị đang login).

### 3.4 Gửi lại mã quên mật khẩu

- **Tên chức năng:** Resend OTP quên mật khẩu
- **URL:** `POST /api/v1/forgot-password/resend-code`
- **Quyền truy cập:** Public
- **Request:**
```json
{ "email": "a@example.com" }
```

- **Response thành công (200):**
```json
{
  "success": true,
  "message": "Đã gửi lại mã xác thực",
  "data": {}
}
```

- **Response lỗi:**

| HTTP Status | Trường hợp |
|---|---|
| 400 | Gọi lại quá sớm, hoặc không có yêu cầu nào đang chờ (gộp chung — cùng lý do tránh lộ thông tin email) |

---

## 4. Đăng nhập bằng Google (OAuth) — ĐỀ XUẤT, chưa xác nhận scope

> Phần này suy ra từ bảng `user_oauth_accounts` trong DB, **chưa có** trong phân công gốc của Nhóm 1. Cần Leader xác nhận có làm ở Giai đoạn 2 này không trước khi chốt.

### 4.1 Đăng nhập / Đăng ký bằng Google

- **Tên chức năng:** Login hoặc tự động đăng ký bằng tài khoản Google
- **URL:** `POST /api/v1/oauth/google`
- **Quyền truy cập:** Public
- **Cách hoạt động:** FE dùng Google Identity Services (JS SDK) để hiện nút đăng nhập Google, lấy về `idToken` từ Google — BE **không** tự làm redirect qua Google.
- **Request:**

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| idToken | string | ✓ | Token Google trả về cho FE, BE verify lại với Google |
| role | string | chỉ khi tạo mới | `CANDIDATE` / `RECRUITER` — bắt buộc nếu đây là lần đầu đăng nhập Google (chưa có tài khoản); bỏ qua nếu tài khoản đã tồn tại |

```json
{
  "idToken": "...",
  "role": "CANDIDATE"
}
```

- **Response thành công (200):** giống hệt response của `/login` (accessToken trong body + refreshToken qua httpOnly cookie).

- **Response lỗi:**

| HTTP Status | Trường hợp |
|---|---|
| 400 | Thiếu `idToken`, hoặc lần đầu đăng nhập mà thiếu/sai `role` |
| 401 | `idToken` không hợp lệ (verify với Google thất bại / hết hạn / sai audience) |
| 403 | Tài khoản đã bị khoá (`status = BANNED`) |

- **Xử lý:**
  1. Verify `idToken` với Google → lấy `sub` (provider_user_id), `email`, `email_verified`, `name`.
  2. Tìm trong `user_oauth_accounts` theo `(provider='google', provider_user_id)` — có thì lấy `user_id`, coi như login luôn (bỏ qua bước 3).
  3. Nếu chưa có: tìm `users` theo `email` (lowercase) —
     - Đã tồn tại (VD: từng đăng ký bằng email/password) → tự liên kết: insert thêm row `user_oauth_accounts`; nếu `email_verified_at` đang NULL thì set luôn (Google đã xác minh email hộ).
     - Chưa tồn tại → tạo `users` mới: `role_id` (resolve từ field `role`), `password_hash = NULL`, `full_name` lấy từ Google, `email_verified_at = now()` (tin tưởng Google), rồi insert `user_oauth_accounts`.
  4. Tạo session như login bình thường (sinh `refreshToken`, hash lưu `sessions`, set cookie) + trả `accessToken`.

---

