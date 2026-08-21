# API Contract — Nhóm 4 — Thông báo

**Số lượng API:** 5 · **Quyền:** AUTHENTICATED

Quy ước chung (Response/HTTP Status/phân trang): xem `system-logs.md` mục 0.

Mọi API thao tác 1 thông báo phải kiểm tra `notifications.user_id` = người đang đăng nhập, sai thì trả **404** (không trả 403).

**9 giá trị `type`:** ACCOUNT_LOCKED, ACCOUNT_UNLOCKED (USER) · COMPANY_LOCKED, COMPANY_UNLOCKED (COMPANY) · JOB_APPROVED, JOB_REJECTED, JOB_DELETED (JOB) · NEW_APPLICATION, APPLICATION_STATUS_CHANGED (APPLICATION). `title`/`content` backend tự sinh, client không gửi.

---

### 1. `GET /api/v1/notifications`

**Validation (query)**

| Field  | Kiểu    | Bắt buộc | Ràng buộc                |
| ------ | ------- | -------- | ------------------------ |
| page   | number  |          | >= 1, mặc định 1         |
| limit  | number  |          | 1–100, mặc định 20       |
| isRead | boolean |          | Lọc đã đọc / chưa đọc    |
| type   | string  |          | 1 trong 9 giá trị `type` |

Sort cố định `createdAt desc`.

**200 OK**

```json
{
  "data": {
    "items": [
      {
        "id": 152,
        "type": "JOB_REJECTED",
        "title": "string",
        "content": "string",
        "targetType": "JOB",
        "targetId": 88,
        "isRead": false,
        "readAt": null,
        "createdAt": "datetime"
      }
    ],
    "pagination": {}
  }
}
```

**Lỗi:** 400 page/limit/type sai · 401 chưa đăng nhập

### 2. `GET /api/v1/notifications/unread-count`

**Validation:** không có tham số

**200 OK**

```json
{ "data": { "unreadCount": 7 } }
```

**Lỗi:** 401 chưa đăng nhập

Dùng polling 30–60s cho badge (V1 chưa có WebSocket).

### 3. `PATCH /api/v1/notifications/{id}/read`

**Validation:** `id` (path) — number, phải thuộc `notifications.user_id` của người đang đăng nhập. Không có body.

**200 OK** — như 1 item ở mục 1, `isRead: true`, `readAt` = thời điểm hiện tại
**Lỗi:** 401 chưa đăng nhập · 404 không tồn tại hoặc không phải của mình

Gọi lại trên thông báo đã đọc vẫn trả 200, không đổi `readAt`.

### 4. `PATCH /api/v1/notifications/read-all`

**Validation:** không có body

**200 OK**

```json
{
  "message": "Đã đánh dấu tất cả thông báo là đã đọc",
  "data": { "updatedCount": 7 }
}
```

**Lỗi:** 401 chưa đăng nhập

Route `read-all` phải khai báo trước `{id}/read` để không bị Express khớp nhầm.

### 5. `DELETE /api/v1/notifications/{id}`

**Validation:** `id` (path) — number, phải thuộc `notifications.user_id` của người đang đăng nhập

**200 OK**

```json
{ "message": "Đã xóa thông báo", "data": null }
```

**Lỗi:** 401 chưa đăng nhập · 404 không tồn tại hoặc không phải của mình

Xóa cứng (bảng không có `deleted_at`).

---

Không có API tạo thông báo — dùng `NotificationService.create()` (Nhóm 4 cung cấp, Nhóm 2/3 gọi trực tiếp trong service, xem `admin.md` mục 7).
