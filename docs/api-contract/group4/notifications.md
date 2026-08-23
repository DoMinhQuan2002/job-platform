# API Contract — Nhóm 4 — Thông báo

**Số lượng API:** 5 · **Quyền:** AUTHENTICATED

Quy ước chung (Response/HTTP Status/phân trang): xem `system-logs.md` mục 0.

Mọi API thao tác 1 thông báo phải kiểm tra `notifications.user_id` = người đang đăng nhập, sai thì trả **404** (không trả 403).

**9 giá trị `type`:** ACCOUNT_LOCKED, ACCOUNT_UNLOCKED (USER) · COMPANY_LOCKED, COMPANY_UNLOCKED (COMPANY) · JOB_APPROVED, JOB_REJECTED, JOB_DELETED (JOB) · NEW_APPLICATION, APPLICATION_STATUS_CHANGED (APPLICATION). `title`/`content` backend tự sinh, client không gửi.

---

## 1. Lấy danh sách thông báo

`GET /api/v1/notifications` · Quyền: AUTHENTICATED

**Validation (query)**

| Field  | Kiểu    | Bắt buộc | Ràng buộc                |
| ------ | ------- | -------- | ------------------------ |
| page   | number  |          | >= 1, mặc định 1         |
| limit  | number  |          | 1–100, mặc định 20       |
| isRead | boolean |          | Lọc đã đọc / chưa đọc    |
| type   | string  |          | 1 trong 9 giá trị `type` |

Sort cố định `createdAt desc`.

**HTTP Status:** 200 · 400 · 401

**200 OK**

```json
{
  "success": true,
  "message": "Thành công",
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
    "pagination": { "page": 1, "limit": 20, "total": 12, "totalPages": 1 }
  }
}
```

**Response lỗi**

`400` — `page`/`limit` sai:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [{ "field": "limit", "message": "limit phải từ 1 đến 100" }]
}
```

`400` — `type` sai danh mục:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [{ "field": "type", "message": "Giá trị type không hợp lệ" }]
}
```

`401`:

```json
{
  "success": false,
  "message": "Chưa đăng nhập hoặc token không hợp lệ",
  "errors": []
}
```

---

## 2. Đếm số thông báo chưa đọc

`GET /api/v1/notifications/unread-count` · Quyền: AUTHENTICATED

Validation: không có tham số

**HTTP Status:** 200 · 401

**200 OK**

```json
{ "success": true, "message": "Thành công", "data": { "unreadCount": 7 } }
```

**Response lỗi**

`401`:

```json
{
  "success": false,
  "message": "Chưa đăng nhập hoặc token không hợp lệ",
  "errors": []
}
```

Dùng polling 30–60s cho badge (V1 chưa có WebSocket).

---

## 3. Đánh dấu một thông báo đã đọc

`PATCH /api/v1/notifications/{id}/read` · Quyền: AUTHENTICATED (chỉ thông báo của mình)

Validation: `id` (path) — number, phải thuộc `notifications.user_id` của người đang đăng nhập. Không có body.

**HTTP Status:** 200 · 401 · 404

**200 OK** — như 1 item ở mục 1, `isRead: true`, `readAt` = thời điểm hiện tại

**Response lỗi**

`401`:

```json
{
  "success": false,
  "message": "Chưa đăng nhập hoặc token không hợp lệ",
  "errors": []
}
```

`404`:

```json
{ "success": false, "message": "Không tìm thấy thông báo", "errors": [] }
```

Gọi lại trên thông báo đã đọc vẫn trả 200, không đổi `readAt`.

---

## 4. Đánh dấu tất cả thông báo đã đọc

`PATCH /api/v1/notifications/read-all` · Quyền: AUTHENTICATED

Validation: không có body

**HTTP Status:** 200 · 401

**200 OK**

```json
{
  "success": true,
  "message": "Đã đánh dấu tất cả thông báo là đã đọc",
  "data": { "updatedCount": 7 }
}
```

**Response lỗi**

`401`:

```json
{
  "success": false,
  "message": "Chưa đăng nhập hoặc token không hợp lệ",
  "errors": []
}
```

Không có thông báo chưa đọc nào thì vẫn trả 200 với `updatedCount: 0`.

Route `read-all` phải khai báo trước `{id}/read` để không bị Express khớp nhầm.

---

## 5. Xóa một thông báo

`DELETE /api/v1/notifications/{id}` · Quyền: AUTHENTICATED (chỉ thông báo của mình)

Validation: `id` (path) — number, phải thuộc `notifications.user_id` của người đang đăng nhập

**HTTP Status:** 200 · 401 · 404

**200 OK**

```json
{ "success": true, "message": "Đã xóa thông báo", "data": null }
```

**Response lỗi**

`401`:

```json
{
  "success": false,
  "message": "Chưa đăng nhập hoặc token không hợp lệ",
  "errors": []
}
```

`404`:

```json
{ "success": false, "message": "Không tìm thấy thông báo", "errors": [] }
```

Xóa cứng (bảng không có `deleted_at`).

---

Không có API tạo thông báo — dùng `NotificationService.create()` (Nhóm 4 cung cấp, Nhóm 2/3 gọi trực tiếp trong service, xem `admin.md` mục 7).
