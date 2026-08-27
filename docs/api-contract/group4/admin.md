# API Contract — Nhóm 4 — Quản trị hệ thống

**Số lượng API:** 19 · **Quyền:** ADMIN

Quy ước chung (Response/HTTP Status/phân trang): xem `system-logs.md` mục 0.

---

## 1. Tài khoản

### 1.1 Lấy danh sách tài khoản

`GET /api/v1/admin/users` · Quyền: ADMIN

**Validation (query)**

| Field  | Kiểu   | Bắt buộc | Ràng buộc                           |
| ------ | ------ | -------- | ----------------------------------- |
| page   | number |          | >= 1, mặc định 1                    |
| limit  | number |          | 1–100, mặc định 20                  |
| search | string |          | Tìm theo `email` / `fullName`       |
| role   | string |          | `CANDIDATE` / `RECRUITER` / `ADMIN` |
| status | string |          | `ACTIVE` / `BANNED`                 |
| sort   | string |          | Tên cột cho phép                    |

**HTTP Status:** 200 · 400 · 401 · 403

**200 OK**

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "items": [
      {
        "id": 1,
        "email": "string",
        "fullName": "string",
        "phone": "string",
        "avatar": "string",
        "role": { "id": 1, "name": "string" },
        "status": "ACTIVE",
        "lastLoginAt": "datetime",
        "emailVerifiedAt": "datetime",
        "createdAt": "datetime"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 218, "totalPages": 11 }
  }
}
```

**Response lỗi**

`400`:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [{ "field": "role", "message": "Giá trị role không hợp lệ" }]
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

### 1.2 Xem chi tiết tài khoản

`GET /api/v1/admin/users/{id}` · Quyền: ADMIN

Validation: `id` (path) — number, phải tồn tại

**HTTP Status:** 200 · 401 · 403 · 404

**200 OK**

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "id": 1,
    "email": "string",
    "fullName": "string",
    "phone": "string",
    "avatar": "string",
    "role": { "id": 1, "name": "string" },
    "status": "ACTIVE",
    "lastLoginAt": "datetime",
    "emailVerifiedAt": "datetime",
    "dateOfBirth": "date",
    "addressDetail": "string",
    "wardCode": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
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
{ "success": false, "message": "Không tìm thấy tài khoản", "errors": [] }
```

---

### 1.3 Khóa / mở khóa tài khoản

`PUT /api/v1/admin/users/{id}/status` · Quyền: ADMIN

**Validation (body)**

| Field  | Kiểu   | Bắt buộc              | Ràng buộc           |
| ------ | ------ | --------------------- | ------------------- |
| status | string | ✅                    | `ACTIVE` / `BANNED` |
| reason | string | Khi `status = BANNED` | 10–500 ký tự        |

```json
{ "status": "BANNED", "reason": "string (10-500 ký tự, bắt buộc khi BANNED)" }
```

**HTTP Status:** 200 · 400 · 401 · 403 · 404 · 409

**200 OK**

```json
{
  "success": true,
  "message": "Đã cập nhật trạng thái tài khoản",
  "data": {
    "id": 1,
    "email": "string",
    "status": "BANNED",
    "updatedAt": "datetime"
  }
}
```

**Response lỗi**

`400` — thiếu `reason` khi khóa:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    { "field": "reason", "message": "Lý do là bắt buộc khi khóa tài khoản" }
  ]
}
```

`400` — `status` sai:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [{ "field": "status", "message": "Giá trị status không hợp lệ" }]
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

`403` — không phải ADMIN hoặc tự khóa chính mình:

```json
{
  "success": false,
  "message": "Bạn không thể tự khóa tài khoản của chính mình",
  "errors": []
}
```

`404`:

```json
{ "success": false, "message": "Không tìm thấy tài khoản", "errors": [] }
```

`409`:

```json
{ "success": false, "message": "Tài khoản đã ở trạng thái này", "errors": [] }
```

**Side effect:** log `LOCK_USER`/`UNLOCK_USER` · noti `ACCOUNT_LOCKED`/`ACCOUNT_UNLOCKED` → chủ tài khoản (không kèm lý do)

---

## 2. Công ty

### 2.1 Lấy danh sách công ty

`GET /api/v1/admin/companies` · Quyền: ADMIN

**Validation (query)**

| Field  | Kiểu   | Bắt buộc | Ràng buộc                 |
| ------ | ------ | -------- | ------------------------- |
| page   | number |          | >= 1, mặc định 1          |
| limit  | number |          | 1–100, mặc định 20        |
| search | string |          | Tìm theo `name` / `email` |
| status | string |          | `PENDING` / `ACTIVE` / `REJECTED` / `BLOCKED` |
| sort   | string |          | Tên cột cho phép          |

**HTTP Status:** 200 · 400 · 401 · 403

**200 OK**

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "string",
        "slug": "string",
        "logo": "string",
        "email": "string",
        "phone": "string",
        "taxCode": "string",
        "companySize": "string",
        "address": "string",
        "status": "PENDING",
        "rejectReason": null,
        "owner": { "id": 1, "fullName": "string", "email": "string" },
        "totalJobs": 0,
        "createdAt": "datetime"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
  }
}
```

**Response lỗi**

`400`:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [{ "field": "status", "message": "Giá trị status không hợp lệ" }]
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

### 2.2 Xem chi tiết công ty

`GET /api/v1/admin/companies/{id}` · Quyền: ADMIN

Validation: `id` (path) — number, phải tồn tại

**HTTP Status:** 200 · 401 · 403 · 404

**200 OK**

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "id": 1,
    "name": "string",
    "slug": "string",
    "logo": "string",
    "email": "string",
    "phone": "string",
    "taxCode": "string",
    "companySize": "string",
    "address": "string",
    "status": "PENDING",
    "rejectReason": null,
    "owner": { "id": 1, "fullName": "string", "email": "string" },
    "totalJobs": 0,
    "website": "string",
    "description": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
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
{ "success": false, "message": "Không tìm thấy công ty", "errors": [] }
```

---

### 2.3 Khóa / mở khóa công ty

`PUT /api/v1/admin/companies/{id}/status` · Quyền: ADMIN

Chỉ áp dụng cho công ty đã qua duyệt (`status` hiện tại là `ACTIVE` hoặc `BLOCKED`). Công ty đang `PENDING`/`REJECTED` phải đi qua 2.4/2.5, gọi endpoint này sẽ trả `409`.

**Validation (body)**

| Field  | Kiểu   | Bắt buộc               | Ràng buộc            |
| ------ | ------ | ---------------------- | -------------------- |
| status | string | ✅                     | `ACTIVE` / `BLOCKED` |
| reason | string | Khi `status = BLOCKED` | 10–500 ký tự         |

```json
{ "status": "BLOCKED", "reason": "string (10-500 ký tự, bắt buộc khi BLOCKED)" }
```

**HTTP Status:** 200 · 400 · 401 · 403 · 404 · 409

**200 OK**

```json
{
  "success": true,
  "message": "Đã cập nhật trạng thái công ty",
  "data": {
    "id": 1,
    "name": "string",
    "status": "BLOCKED",
    "updatedAt": "datetime"
  }
}
```

**Response lỗi**

`400` — thiếu `reason`:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    { "field": "reason", "message": "Lý do là bắt buộc khi khóa công ty" }
  ]
}
```

`400` — `status` sai:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [{ "field": "status", "message": "Giá trị status không hợp lệ" }]
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

`404`:

```json
{ "success": false, "message": "Không tìm thấy công ty", "errors": [] }
```

`409` — công ty đã ở đúng trạng thái đích:

```json
{ "success": false, "message": "Công ty đã ở trạng thái này", "errors": [] }
```

`409` — công ty chưa qua duyệt (`PENDING`/`REJECTED`):

```json
{
  "success": false,
  "message": "Chỉ khóa/mở khóa được công ty đã qua duyệt (ACTIVE hoặc BLOCKED)",
  "errors": []
}
```

**Side effect:** log `LOCK_COMPANY`/`UNLOCK_COMPANY` · noti `COMPANY_LOCKED`/`COMPANY_UNLOCKED` → recruiter (`companies.user_id`)

---

### 2.4 Duyệt hồ sơ công ty

`PUT /api/v1/admin/companies/{id}/approve` · Quyền: ADMIN

Validation: `id` (path) — number, công ty phải đang ở `PENDING`. Không có body.

**HTTP Status:** 200 · 401 · 403 · 404 · 409

**200 OK**

```json
{
  "success": true,
  "message": "Đã duyệt hồ sơ công ty",
  "data": {
    "id": 1,
    "name": "string",
    "status": "ACTIVE",
    "updatedAt": "datetime"
  }
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
{ "success": false, "message": "Không tìm thấy công ty", "errors": [] }
```

`409`:

```json
{
  "success": false,
  "message": "Chỉ duyệt được hồ sơ đang ở trạng thái chờ duyệt",
  "errors": []
}
```

**Side effect:** log `APPROVE_COMPANY` · noti `COMPANY_APPROVED` → recruiter (`companies.user_id`, không kèm lý do)

---

### 2.5 Từ chối hồ sơ công ty

`PUT /api/v1/admin/companies/{id}/reject` · Quyền: ADMIN

**Validation (body)**

| Field  | Kiểu   | Bắt buộc | Ràng buộc    |
| ------ | ------ | -------- | ------------ |
| reason | string | ✅       | 10–500 ký tự |

```json
{ "reason": "string (10-500 ký tự, bắt buộc)" }
```

**HTTP Status:** 200 · 400 · 401 · 403 · 404 · 409

**200 OK**

```json
{
  "success": true,
  "message": "Đã từ chối hồ sơ công ty",
  "data": {
    "id": 1,
    "name": "string",
    "status": "REJECTED",
    "rejectReason": "string",
    "updatedAt": "datetime"
  }
}
```

**Response lỗi**

`400`:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [{ "field": "reason", "message": "Lý do phải từ 10 đến 500 ký tự" }]
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

`404`:

```json
{ "success": false, "message": "Không tìm thấy công ty", "errors": [] }
```

`409`:

```json
{
  "success": false,
  "message": "Chỉ từ chối được hồ sơ đang ở trạng thái chờ duyệt",
  "errors": []
}
```

Recruiter vẫn xem lại được lý do sau này qua `GET /api/v1/companies/me` (API của Nhóm 2) — `rejectReason` lưu trực tiếp trên `companies.reject_reason`, không mất khi không có notification riêng.

**Side effect:** cập nhật `companies.reject_reason` · log `REJECT_COMPANY` (description = lý do) · noti `COMPANY_REJECTED` → recruiter (kèm lý do)

---

## 3. Tin tuyển dụng

### 3.1 Lấy danh sách tin tuyển dụng

`GET /api/v1/admin/jobs` · Quyền: ADMIN

**Validation (query)**

| Field      | Kiểu   | Bắt buộc | Ràng buộc                                      |
| ---------- | ------ | -------- | ---------------------------------------------- |
| page       | number |          | >= 1, mặc định 1                               |
| limit      | number |          | 1–100, mặc định 20                             |
| search     | string |          | Tìm theo `title`                               |
| status     | string |          | `PENDING` / `APPROVED` / `REJECTED` / `CLOSED` |
| companyId  | number |          | Lọc theo công ty                               |
| categoryId | number |          | Lọc theo ngành nghề                            |
| sort       | string |          | Tên cột cho phép                               |

**HTTP Status:** 200 · 400 · 401 · 403

**200 OK**

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "items": [
      {
        "id": 1,
        "title": "string",
        "slug": "string",
        "company": { "id": 1, "name": "string" },
        "category": { "id": 1, "name": "string" },
        "jobType": "string",
        "jobMode": "string",
        "salaryMin": "15000000.00",
        "salaryMax": "25000000.00",
        "isNegotiable": false,
        "quantity": 1,
        "deadline": "date",
        "status": "PENDING",
        "rejectReason": null,
        "createdAt": "datetime"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 96, "totalPages": 5 }
  }
}
```

`salaryMin`/`salaryMax` là chuỗi (numeric DB).

**Response lỗi**

`400`:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [{ "field": "status", "message": "Giá trị status không hợp lệ" }]
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

### 3.2 Xem chi tiết tin tuyển dụng

`GET /api/v1/admin/jobs/{id}` · Quyền: ADMIN

Validation: `id` (path) — number, phải tồn tại

**HTTP Status:** 200 · 401 · 403 · 404

**200 OK**

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "id": 1,
    "title": "string",
    "slug": "string",
    "company": { "id": 1, "name": "string" },
    "category": { "id": 1, "name": "string" },
    "jobType": "string",
    "jobMode": "string",
    "salaryMin": "15000000.00",
    "salaryMax": "25000000.00",
    "isNegotiable": false,
    "quantity": 1,
    "deadline": "date",
    "status": "PENDING",
    "rejectReason": null,
    "description": "string",
    "requirements": "string",
    "benefits": "string",
    "address": "string",
    "experience": "string",
    "skills": [],
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
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
{ "success": false, "message": "Không tìm thấy tin tuyển dụng", "errors": [] }
```

---

### 3.3 Duyệt tin tuyển dụng

`PUT /api/v1/admin/jobs/{id}/approve` · Quyền: ADMIN

Validation: `id` (path) — number, tin phải đang ở `PENDING`. Không có body.

**HTTP Status:** 200 · 401 · 403 · 404 · 409

**200 OK**

```json
{
  "success": true,
  "message": "Đã duyệt tin tuyển dụng",
  "data": {
    "id": 1,
    "title": "string",
    "status": "APPROVED",
    "updatedAt": "datetime"
  }
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
{ "success": false, "message": "Không tìm thấy tin tuyển dụng", "errors": [] }
```

`409`:

```json
{
  "success": false,
  "message": "Chỉ duyệt được tin đang ở trạng thái chờ duyệt",
  "errors": []
}
```

**Side effect:** log `APPROVE_JOB` · noti `JOB_APPROVED` → recruiter

---

### 3.4 Từ chối tin tuyển dụng

`PUT /api/v1/admin/jobs/{id}/reject` · Quyền: ADMIN

**Validation (body)**

| Field  | Kiểu   | Bắt buộc | Ràng buộc    |
| ------ | ------ | -------- | ------------ |
| reason | string | ✅       | 10–500 ký tự |

```json
{ "reason": "string (10-500 ký tự, bắt buộc)" }
```

**HTTP Status:** 200 · 400 · 401 · 403 · 404 · 409

**200 OK**

```json
{
  "success": true,
  "message": "Đã từ chối tin tuyển dụng",
  "data": {
    "id": 1,
    "title": "string",
    "status": "REJECTED",
    "rejectReason": "string",
    "updatedAt": "datetime"
  }
}
```

**Response lỗi**

`400`:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [{ "field": "reason", "message": "Lý do phải từ 10 đến 500 ký tự" }]
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

`404`:

```json
{ "success": false, "message": "Không tìm thấy tin tuyển dụng", "errors": [] }
```

`409`:

```json
{
  "success": false,
  "message": "Chỉ từ chối được tin đang ở trạng thái chờ duyệt",
  "errors": []
}
```

**Side effect:** cập nhật `jobs.reject_reason` · log `REJECT_JOB` (description = lý do) · noti `JOB_REJECTED` → recruiter (kèm lý do)

---

### 3.5 Xóa tin tuyển dụng

`DELETE /api/v1/admin/jobs/{id}` · Quyền: ADMIN

**Validation (body)**

| Field  | Kiểu   | Bắt buộc | Ràng buộc    |
| ------ | ------ | -------- | ------------ |
| reason | string | ✅       | 10–500 ký tự |

```json
{ "reason": "string (10-500 ký tự, bắt buộc)" }
```

**HTTP Status:** 200 · 400 · 401 · 403 · 404

**200 OK**

```json
{ "success": true, "message": "Đã xóa tin tuyển dụng", "data": null }
```

**Response lỗi**

`400`:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [{ "field": "reason", "message": "Lý do phải từ 10 đến 500 ký tự" }]
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

`404`:

```json
{ "success": false, "message": "Không tìm thấy tin tuyển dụng", "errors": [] }
```

Xóa mềm (`jobs.deleted_at`), dữ liệu không mất, các đơn ứng tuyển đã có vẫn giữ nguyên.

**Side effect:** log `DELETE_JOB` (description = lý do) · noti `JOB_DELETED` → recruiter (kèm lý do)

---

## 4. Ngành nghề

### 4.1 Lấy danh sách ngành nghề

`GET /api/v1/admin/job-categories` · Quyền: ADMIN

**Validation (query)**

| Field  | Kiểu   | Bắt buộc | Ràng buộc             |
| ------ | ------ | -------- | --------------------- |
| page   | number |          | >= 1, mặc định 1      |
| limit  | number |          | 1–100, mặc định 20    |
| search | string |          | Tìm theo `name`       |
| status | string |          | `ACTIVE` / `INACTIVE` |

**HTTP Status:** 200 · 401 · 403

**200 OK**

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "string",
        "slug": "string",
        "description": "string",
        "status": "ACTIVE",
        "totalJobs": 0,
        "createdAt": "datetime"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 18, "totalPages": 1 }
  }
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

`403`:

```json
{
  "success": false,
  "message": "Bạn không có quyền thực hiện thao tác này",
  "errors": []
}
```

---

### 4.2 Xem chi tiết ngành nghề

`GET /api/v1/admin/job-categories/{id}` · Quyền: ADMIN

Validation: `id` (path) — number, phải tồn tại

**HTTP Status:** 200 · 401 · 403 · 404

**200 OK**

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "id": 1,
    "name": "string",
    "slug": "string",
    "description": "string",
    "status": "ACTIVE",
    "totalJobs": 0,
    "createdAt": "datetime"
  }
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
{ "success": false, "message": "Không tìm thấy ngành nghề", "errors": [] }
```

---

### 4.3 Thêm ngành nghề

`POST /api/v1/admin/job-categories` · Quyền: ADMIN

**Validation (body)**

| Field       | Kiểu   | Bắt buộc             | Ràng buộc                         |
| ----------- | ------ | -------------------- | --------------------------------- |
| name        | string | ✅                   | 2–150 ký tự, không trùng (UNIQUE) |
| description | string |                      | Tùy chọn                          |
| slug        | —      | Không nhận từ client | Backend tự sinh                   |

```json
{
  "name": "string (2-150 ký tự, không trùng)",
  "description": "string (tùy chọn)"
}
```

**HTTP Status:** 201 · 400 · 401 · 403 · 409

**201 Created**

```json
{
  "success": true,
  "message": "Đã thêm ngành nghề",
  "data": {
    "id": 1,
    "name": "string",
    "slug": "string",
    "description": "string",
    "status": "ACTIVE",
    "totalJobs": 0,
    "createdAt": "datetime"
  }
}
```

**Response lỗi**

`400`:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    { "field": "name", "message": "Tên ngành nghề phải từ 2 đến 150 ký tự" }
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

`409`:

```json
{ "success": false, "message": "Tên ngành nghề đã tồn tại", "errors": [] }
```

**Side effect:** log `CREATE_JOB_CATEGORY`

---

### 4.4 Cập nhật ngành nghề

`PUT /api/v1/admin/job-categories/{id}` · Quyền: ADMIN

**Validation (body — tất cả tùy chọn)**

| Field       | Kiểu   | Bắt buộc | Ràng buộc                                |
| ----------- | ------ | -------- | ---------------------------------------- |
| name        | string |          | 2–150 ký tự, không trùng ngành nghề khác |
| description | string |          | Tùy chọn                                 |
| status      | string |          | `ACTIVE` / `INACTIVE`                    |

```json
{ "name": "string", "description": "string", "status": "ACTIVE" }
```

**HTTP Status:** 200 · 400 · 401 · 403 · 404 · 409

**200 OK**

```json
{
  "success": true,
  "message": "Đã cập nhật ngành nghề",
  "data": {
    "id": 1,
    "name": "string",
    "slug": "string",
    "description": "string",
    "status": "ACTIVE",
    "totalJobs": 0,
    "createdAt": "datetime"
  }
}
```

**Response lỗi**

`400`:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    { "field": "name", "message": "Tên ngành nghề phải từ 2 đến 150 ký tự" }
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

`404`:

```json
{ "success": false, "message": "Không tìm thấy ngành nghề", "errors": [] }
```

`409`:

```json
{ "success": false, "message": "Tên ngành nghề đã tồn tại", "errors": [] }
```

**Side effect:** log `UPDATE_JOB_CATEGORY` (oldValue/newValue = JSON `{name,status}`)

---

### 4.5 Xóa ngành nghề

`DELETE /api/v1/admin/job-categories/{id}` · Quyền: ADMIN

Validation: `id` (path) — number, phải tồn tại, chưa có tin tuyển dụng nào tham chiếu

**HTTP Status:** 200 · 401 · 403 · 404 · 409

**200 OK**

```json
{ "success": true, "message": "Đã xóa ngành nghề", "data": null }
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
{ "success": false, "message": "Không tìm thấy ngành nghề", "errors": [] }
```

`409`:

```json
{
  "success": false,
  "message": "Không thể xóa: đang có 42 tin tuyển dụng thuộc ngành nghề này",
  "errors": []
}
```

**Side effect:** log `DELETE_JOB_CATEGORY`

---

## 5. Thống kê

### 5.1 Thống kê tổng quan

`GET /api/v1/admin/statistics` · Quyền: ADMIN

Validation: không có tham số

**HTTP Status:** 200 · 401 · 403

**200 OK**

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "totalCandidates": 186,
    "totalRecruiters": 34,
    "totalCompanies": 30,
    "totalJobs": 210,
    "totalApplications": 892
  }
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

`403`:

```json
{
  "success": false,
  "message": "Bạn không có quyền thực hiện thao tác này",
  "errors": []
}
```

---

## 6. Ghi log (`LogService.write()`)

| action              | oldValue         | newValue          | description |
| ------------------- | ---------------- | ----------------- | ----------- |
| LOCK_USER           | ACTIVE           | BANNED            | lý do       |
| UNLOCK_USER         | BANNED           | ACTIVE            | —           |
| LOCK_COMPANY        | ACTIVE           | BLOCKED           | lý do       |
| UNLOCK_COMPANY      | BLOCKED          | ACTIVE            | —           |
| APPROVE_COMPANY     | PENDING          | ACTIVE            | —           |
| REJECT_COMPANY      | PENDING          | REJECTED          | lý do       |
| APPROVE_JOB         | PENDING          | APPROVED          | —           |
| REJECT_JOB          | PENDING          | REJECTED          | lý do       |
| DELETE_JOB          | trạng thái trước khi xóa | —         | lý do       |
| CREATE_JOB_CATEGORY | —                | name mới          | —           |
| UPDATE_JOB_CATEGORY | {name,status} cũ | {name,status} mới | —           |
| DELETE_JOB_CATEGORY | name             | —                 | —           |

## 7. Bắn thông báo (`NotificationService.create()`)

| Hành động                                            | Người nhận         | Lấy từ                                                                   |
| ---------------------------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| Khóa / mở khóa tài khoản.                            | Chủ tài khoản      | `users.id`                                                               |
| Khóa / mở khóa công ty.                              | Recruiter          | `companies.user_id`                                                      |
| Duyệt / từ chối hồ sơ công ty.                       | Recruiter          | `companies.user_id` (từ chối có kèm lý do)                               |
| Duyệt / từ chối / xóa tin.                           | Recruiter          | `jobs.company_id → companies.user_id`                                    |
| Ngành nghề.                                          | — không noti       | —                                                                        |
| Có ứng viên mới nộp hồ sơ (`NEW_APPLICATION`).       | Recruiter đăng tin | `applications.job_id → jobs.company_id → companies.user_id` — Nhóm 3 gọi |
| Đổi trạng thái hồ sơ (`APPLICATION_STATUS_CHANGED`). | Ứng viên nộp hồ sơ | `applications.candidate_id → candidate_profiles.user_id` — Nhóm 2/3 gọi   |

Transaction: update + log + noti chung 1 transaction, lỗi 1 trong 3 rollback cả 3.
