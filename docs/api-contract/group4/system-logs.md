# API Contract — Nhóm 4 — Nhật ký hệ thống

**Số lượng API:** 2 · **Quyền:** ADMIN

Quy ước chung (Response/HTTP Status/phân trang): xem mục 0 dưới đây (áp dụng chung cho cả `admin.md`, `notifications.md`, `system-logs.md`).

---

## 0. Quy ước chung

Base URL: `/api/v1`

Response thành công:

```json
{ "success": true, "message": "Thành công", "data": {} }
```

Response lỗi:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [{ "field": "status", "message": "..." }]
}
```

`errors[]` chỉ có khi lỗi 400 (validation), có thể nhiều phần tử. Lỗi 401/403/404/409/500 thì `errors` là mảng rỗng `[]`, thông tin nằm trong `message`.

HTTP Status dùng trong toàn bộ 3 file:

| Status | Ý nghĩa                                      |
| ------ | -------------------------------------------- |
| 200    | Thành công                                   |
| 201    | Tạo mới thành công                           |
| 400    | Dữ liệu không hợp lệ                         |
| 401    | Chưa đăng nhập                               |
| 403    | Không có quyền                               |
| 404    | Không tìm thấy                               |
| 409    | Dữ liệu trùng hoặc trạng thái không cho phép |
| 500    | Lỗi hệ thống                                 |

Phân trang (query `page` mặc định 1, `limit` mặc định 20 tối đa 100, `sort`, `order` asc/desc mặc định desc):

```json
{
  "data": {
    "items": [],
    "pagination": { "page": 1, "limit": 20, "total": 137, "totalPages": 7 }
  }
}
```

Quyền: ADMIN (mọi API dưới `/admin/**`) · AUTHENTICATED (5 API `notifications.md`)

Tên trường JSON: camelCase (cột DB snake_case)

---

## 1. Danh sách nhật ký hệ thống

`GET /api/v1/admin/system-logs` · Quyền: ADMIN

Query: page, limit, userId, action (11 giá trị — mục 3), targetType (USER/COMPANY/JOB/JOB_CATEGORY), targetId, fromDate, toDate

**HTTP Status:** 200 · 400 · 401 · 403

**200 OK**

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "items": [
      {
        "id": 2041,
        "user": { "id": 1, "fullName": "string", "email": "string" },
        "action": "REJECT_JOB",
        "targetType": "JOB",
        "targetId": 88,
        "targetLabel": "string",
        "oldValue": "PENDING",
        "newValue": "REJECTED",
        "description": "string",
        "ipAddress": "string",
        "createdAt": "datetime"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 341, "totalPages": 18 }
  }
}
```

`targetLabel` không phải cột DB, backend tra thêm theo targetType+targetId; `null` nếu bản ghi gốc đã bị xóa cứng.

**Response lỗi**

`400` — `targetId` thiếu `targetType`:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [{ "field": "targetId", "message": "Phải truyền kèm targetType" }]
}
```

`400` — `action`/`targetType` sai danh mục:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [{ "field": "action", "message": "Giá trị action không hợp lệ" }]
}
```

`400` — `fromDate` lớn hơn `toDate`:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    { "field": "toDate", "message": "toDate phải lớn hơn hoặc bằng fromDate" }
  ]
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

`403`:

```json
{
  "success": false,
  "message": "Bạn không có quyền thực hiện thao tác này",
  "errors": []
}
```

---

## 2. Xem chi tiết một bản ghi nhật ký

`GET /api/v1/admin/system-logs/{id}` · Quyền: ADMIN

Path: `id` (number)

**HTTP Status:** 200 · 401 · 403 · 404

**200 OK** — như 1 item ở mục 1

**Response lỗi**

`401`:

```json
{
  "success": false,
  "message": "Chưa đăng nhập hoặc token không hợp lệ",
  "errors": []
}
```

`403`:

```json
{
  "success": false,
  "message": "Bạn không có quyền thực hiện thao tác này",
  "errors": []
}
```

`404`:

```json
{ "success": false, "message": "Không tìm thấy bản ghi nhật ký", "errors": [] }
```

---

## 3. Ghi nhật ký — không có API

Append-only, ghi qua `LogService.write()`, gọi thủ công trong service (không middleware, vì phải đọc oldValue trước UPDATE).

**11 giá trị `action`:** LOCK_USER, UNLOCK_USER, LOCK_COMPANY, UNLOCK_COMPANY, APPROVE_JOB, REJECT_JOB, DELETE_JOB, CREATE_JOB_CATEGORY, UPDATE_JOB_CATEGORY, DELETE_JOB_CATEGORY (Nhóm 4) · LOGIN_FAILED (Nhóm 1)

Chi tiết oldValue/newValue/description từng action: xem `admin.md` mục 6.
