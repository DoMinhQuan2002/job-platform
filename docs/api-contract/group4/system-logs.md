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

HTTP Status: 200 OK · 201 Created · 400 Validation · 401 Chưa đăng nhập · 403 Không có quyền · 404 Không tìm thấy · 409 Trùng/sai trạng thái · 500 Lỗi hệ thống

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

## 1. `GET /api/v1/admin/system-logs`

Query: page, limit, userId, action (11 giá trị — mục 3), targetType (USER/COMPANY/JOB/JOB_CATEGORY/APPLICATION), targetId, fromDate, toDate

**200 OK**

```json
{
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
    "pagination": {}
  }
}
```

`targetLabel` không phải cột DB, backend tra thêm theo targetType+targetId; `null` nếu bản ghi gốc đã bị xóa cứng.
**Lỗi:** 400 targetId thiếu targetType / action, targetType sai / fromDate > toDate · 401 chưa đăng nhập · 403 không phải ADMIN

## 2. `GET /api/v1/admin/system-logs/{id}`

**200 OK** — như 1 item ở mục 1
**Lỗi:** 401 chưa đăng nhập · 403 không phải ADMIN · 404 không tìm thấy

## 3. Ghi nhật ký — không có API

Append-only, ghi qua `LogService.write()`, gọi thủ công trong service (không middleware, vì phải đọc oldValue trước UPDATE).

**11 giá trị `action`:** LOCK_USER, UNLOCK_USER, LOCK_COMPANY, UNLOCK_COMPANY, APPROVE_JOB, REJECT_JOB, DELETE_JOB, CREATE_JOB_CATEGORY, UPDATE_JOB_CATEGORY, DELETE_JOB_CATEGORY (Nhóm 4) · LOGIN_FAILED (Nhóm 1)

Chi tiết oldValue/newValue/description từng action: xem `admin.md` mục 6.
