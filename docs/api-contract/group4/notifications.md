# API Contract — Nhóm 4 — Thông báo

**Số lượng API:** 6 · **Quyền:** AUTHENTICATED

Quy ước chung (Response/HTTP Status/phân trang): xem `system-logs.md` mục 0.

Mọi API thao tác 1 thông báo phải kiểm tra `notifications.user_id` = người đang đăng nhập, sai thì trả **404** (không trả 403).

**11 giá trị `type`:** ACCOUNT_LOCKED, ACCOUNT_UNLOCKED (USER) · COMPANY_LOCKED, COMPANY_UNLOCKED, COMPANY_APPROVED, COMPANY_REJECTED (COMPANY) · JOB_APPROVED, JOB_REJECTED, JOB_DELETED (JOB) · NEW_APPLICATION, APPLICATION_STATUS_CHANGED (APPLICATION). `title`/`content` backend tự sinh, client không gửi.

---

## 1. Lấy danh sách thông báo

`GET /api/v1/notifications` · Quyền: AUTHENTICATED

**Validation (query)**

| Field  | Kiểu         | Bắt buộc | Ràng buộc                                                          |
| ------ | ------------ | -------- | ------------------------------------------------------------------ |
| page   | number       |          | >= 1, mặc định 1                                                   |
| limit  | number       |          | 1–100, mặc định 20                                                 |
| isRead | boolean      |          | Lọc đã đọc / chưa đọc                                              |
| type   | string/mảng  |          | 1 hoặc nhiều trong 11 giá trị `type`, cách nhau bằng dấu phẩy (`?type=A,B`) hoặc lặp key (`?type=A&type=B`) |
| from   | datetime ISO |          | Lọc `createdAt >= from`                                            |
| to     | datetime ISO |          | Lọc `createdAt <= to`; `from` phải <= `to`                         |

Sort cố định `createdAt desc`.

`type` nhận nhiều giá trị để FE tự gộp nhóm tab (VD tab "Ứng tuyển" = `type=NEW_APPLICATION,APPLICATION_STATUS_CHANGED`) mà không cần BE định nghĩa nhóm cứng — mỗi role thấy tập `type` khác nhau nên gộp nhóm ở FE linh hoạt hơn. Số đếm cho mỗi tab lấy từ `pagination.total` của chính lần gọi đó, không cần endpoint đếm riêng.

`from`/`to` phục vụ bộ lọc "Hôm nay/7 ngày qua/30 ngày qua/tùy chọn khác" — FE tự tính khoảng ngày rồi gửi lên, BE chỉ lọc theo `createdAt`.

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

`400` — `from` sau `to`:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [{ "field": "from", "message": "from phải trước hoặc bằng to" }]
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

## 2. Xem chi tiết một thông báo

`GET /api/v1/notifications/{id}` · Quyền: AUTHENTICATED (chỉ thông báo của mình)

Validation: `id` (path) — number, phải thuộc `notifications.user_id` của người đang đăng nhập.

Ngoài các field của 1 item ở mục 1, trả thêm `job` — thông tin công việc liên quan, JOIN qua `applications` → `jobs` → `companies`. Chỉ `type = APPLICATION_STATUS_CHANGED` (target `APPLICATION`) mới có `job`; các type còn lại trả `job: null` vì không liên quan tới job (`ACCOUNT_*`) hoặc target không phải application (`COMPANY_*`, `JOB_*`). `job` cũng là `null` nếu application gốc đã bị xóa.

**HTTP Status:** 200 · 401 · 404

**200 OK** — type `APPLICATION_STATUS_CHANGED`

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "id": 152,
    "type": "APPLICATION_STATUS_CHANGED",
    "title": "string",
    "content": "string",
    "targetType": "APPLICATION",
    "targetId": 50,
    "isRead": false,
    "readAt": null,
    "createdAt": "datetime",
    "job": {
      "id": 10,
      "title": "Chuyên viên Digital Marketing",
      "slug": "chuyen-vien-digital-marketing",
      "address": "Hà Nội",
      "jobType": "FULL_TIME",
      "jobMode": "ONSITE",
      "salaryMin": "15000000",
      "salaryMax": "25000000",
      "isNegotiable": false,
      "company": { "id": 5, "name": "Công ty Cổ phần FPT", "logo": null },
      "applicationId": 50,
      "applicationStatus": "INTERVIEW"
    }
  }
}
```

**200 OK** — type khác (VD `ACCOUNT_LOCKED`): giống mục 1, thêm `"job": null`.

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

`applicationStatus` đọc real-time từ `applications.status` tại thời điểm gọi API, không phải giá trị lưu lúc tạo thông báo (đơn có thể đã đổi trạng thái tiếp sau đó).

---

## 3. Đếm số thông báo chưa đọc

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

Route `unread-count` phải khai báo trước `GET /{id}` để không bị Express khớp nhầm thành `{id}`.

---

## 4. Đánh dấu một thông báo đã đọc

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

## 5. Đánh dấu tất cả thông báo đã đọc

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

## 6. Xóa một thông báo

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
