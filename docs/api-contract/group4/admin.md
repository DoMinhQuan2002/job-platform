# API Contract — Nhóm 4 — Quản trị hệ thống

**Số lượng API:** 16 · **Quyền:** ADMIN

Quy ước chung (Response/HTTP Status/phân trang): xem `system-logs.md` mục 0.

---

## 1. Tài khoản

### 1.1 `GET /api/v1/admin/users`

**Validation (query)**

| Field  | Kiểu   | Bắt buộc | Ràng buộc                           |
| ------ | ------ | -------- | ----------------------------------- |
| page   | number |          | >= 1, mặc định 1                    |
| limit  | number |          | 1–100, mặc định 20                  |
| search | string |          | Tìm theo `email` / `fullName`       |
| role   | string |          | `CANDIDATE` / `RECRUITER` / `ADMIN` |
| status | string |          | `ACTIVE` / `BANNED`                 |
| sort   | string |          | Tên cột cho phép                    |

**200 OK**

```json
{
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
    "pagination": {}
  }
}
```

**Lỗi:** 400 role/status/sort sai · 401 chưa đăng nhập · 403 không phải ADMIN

### 1.2 `GET /api/v1/admin/users/{id}`

**Validation:** `id` (path) — number, phải tồn tại

**200 OK**

```json
{
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

**Lỗi:** 401 chưa đăng nhập · 403 không phải ADMIN · 404 không tìm thấy

### 1.3 `PUT /api/v1/admin/users/{id}/status`

**Validation (body)**

| Field  | Kiểu   | Bắt buộc              | Ràng buộc           |
| ------ | ------ | --------------------- | ------------------- |
| status | string | ✅                    | `ACTIVE` / `BANNED` |
| reason | string | Khi `status = BANNED` | 10–500 ký tự        |

```json
{ "status": "BANNED", "reason": "string (10-500 ký tự, bắt buộc khi BANNED)" }
```

**200 OK**

```json
{
  "data": {
    "id": 1,
    "email": "string",
    "status": "BANNED",
    "updatedAt": "datetime"
  }
}
```

**Lỗi:** 400 thiếu/sai reason · 401 chưa đăng nhập · 403 không phải ADMIN / tự khóa mình · 404 không tìm thấy · 409 trùng trạng thái
Side effect: log `LOCK_USER`/`UNLOCK_USER` · noti `ACCOUNT_LOCKED`/`ACCOUNT_UNLOCKED` → chủ tài khoản (không kèm lý do)

---

## 2. Công ty

### 2.1 `GET /api/v1/admin/companies`

**Validation (query)**

| Field  | Kiểu   | Bắt buộc | Ràng buộc                 |
| ------ | ------ | -------- | ------------------------- |
| page   | number |          | >= 1, mặc định 1          |
| limit  | number |          | 1–100, mặc định 20        |
| search | string |          | Tìm theo `name` / `email` |
| status | string |          | `ACTIVE` / `BLOCKED`      |
| sort   | string |          | Tên cột cho phép          |

**200 OK**

```json
{
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
        "status": "ACTIVE",
        "owner": { "id": 1, "fullName": "string", "email": "string" },
        "totalJobs": 0,
        "createdAt": "datetime"
      }
    ],
    "pagination": {}
  }
}
```

**Lỗi:** 400 status/sort sai · 401 chưa đăng nhập · 403 không phải ADMIN

### 2.2 `GET /api/v1/admin/companies/{id}`

**Validation:** `id` (path) — number, phải tồn tại

**200 OK**

```json
{
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
    "status": "ACTIVE",
    "owner": { "id": 1, "fullName": "string", "email": "string" },
    "totalJobs": 0,
    "website": "string",
    "description": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

**Lỗi:** 401 chưa đăng nhập · 403 không phải ADMIN · 404 không tìm thấy

### 2.3 `PUT /api/v1/admin/companies/{id}/status`

**Validation (body)**

| Field  | Kiểu   | Bắt buộc               | Ràng buộc            |
| ------ | ------ | ---------------------- | -------------------- |
| status | string | ✅                     | `ACTIVE` / `BLOCKED` |
| reason | string | Khi `status = BLOCKED` | 10–500 ký tự         |

```json
{ "status": "BLOCKED", "reason": "string (10-500 ký tự, bắt buộc khi BLOCKED)" }
```

**200 OK**

```json
{
  "data": {
    "id": 1,
    "name": "string",
    "status": "BLOCKED",
    "updatedAt": "datetime"
  }
}
```

**Lỗi:** 400 thiếu/sai reason · 401 chưa đăng nhập · 403 không phải ADMIN · 404 không tìm thấy · 409 trùng trạng thái
Side effect: log `LOCK_COMPANY`/`UNLOCK_COMPANY` · noti `COMPANY_LOCKED`/`COMPANY_UNLOCKED` → recruiter (`companies.user_id`)

---

## 3. Tin tuyển dụng

### 3.1 `GET /api/v1/admin/jobs`

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

**200 OK**

```json
{
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
    "pagination": {}
  }
}
```

`salaryMin`/`salaryMax` là chuỗi (numeric DB).
**Lỗi:** 400 status/sort sai · 401 chưa đăng nhập · 403 không phải ADMIN

### 3.2 `GET /api/v1/admin/jobs/{id}`

**Validation:** `id` (path) — number, phải tồn tại

**200 OK**

```json
{
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

**Lỗi:** 401 chưa đăng nhập · 403 không phải ADMIN · 404 không tìm thấy

### 3.3 `PUT /api/v1/admin/jobs/{id}/approve`

**Validation:** `id` (path) — number, tin phải đang ở `PENDING`. Không có body.

**200 OK**

```json
{
  "data": {
    "id": 1,
    "title": "string",
    "status": "APPROVED",
    "updatedAt": "datetime"
  }
}
```

**Lỗi:** 401 chưa đăng nhập · 403 không phải ADMIN · 404 không tìm thấy · 409 không ở PENDING
Side effect: log `APPROVE_JOB` · noti `JOB_APPROVED` → recruiter

### 3.4 `PUT /api/v1/admin/jobs/{id}/reject`

**Validation (body)**

| Field  | Kiểu   | Bắt buộc | Ràng buộc    |
| ------ | ------ | -------- | ------------ |
| reason | string | ✅       | 10–500 ký tự |

```json
{ "reason": "string (10-500 ký tự, bắt buộc)" }
```

**200 OK**

```json
{
  "data": {
    "id": 1,
    "title": "string",
    "status": "REJECTED",
    "rejectReason": "string",
    "updatedAt": "datetime"
  }
}
```

**Lỗi:** 400 thiếu/sai reason · 401 chưa đăng nhập · 403 không phải ADMIN · 404 không tìm thấy · 409 không ở PENDING
Side effect: cập nhật `jobs.reject_reason` · log `REJECT_JOB` (description = lý do) · noti `JOB_REJECTED` → recruiter (kèm lý do)

---

## 4. Ngành nghề

### 4.1 `GET /api/v1/admin/job-categories`

**Validation (query)**

| Field  | Kiểu   | Bắt buộc | Ràng buộc             |
| ------ | ------ | -------- | --------------------- |
| page   | number |          | >= 1, mặc định 1      |
| limit  | number |          | 1–100, mặc định 20    |
| search | string |          | Tìm theo `name`       |
| status | string |          | `ACTIVE` / `INACTIVE` |

**200 OK**

```json
{
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
    "pagination": {}
  }
}
```

**Lỗi:** 401 chưa đăng nhập · 403 không phải ADMIN

### 4.2 `GET /api/v1/admin/job-categories/{id}`

**Validation:** `id` (path) — number, phải tồn tại

**200 OK**

```json
{
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

**Lỗi:** 401 chưa đăng nhập · 403 không phải ADMIN · 404 không tìm thấy

### 4.3 `POST /api/v1/admin/job-categories`

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

**201 Created**

```json
{
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

**Lỗi:** 400 name sai độ dài · 401 chưa đăng nhập · 403 không phải ADMIN · 409 name/slug trùng
Side effect: log `CREATE_JOB_CATEGORY`

### 4.4 `PUT /api/v1/admin/job-categories/{id}`

**Validation (body — tất cả tùy chọn)**

| Field       | Kiểu   | Bắt buộc | Ràng buộc                                |
| ----------- | ------ | -------- | ---------------------------------------- |
| name        | string |          | 2–150 ký tự, không trùng ngành nghề khác |
| description | string |          | Tùy chọn                                 |
| status      | string |          | `ACTIVE` / `INACTIVE`                    |

```json
{ "name": "string", "description": "string", "status": "ACTIVE" }
```

**200 OK**

```json
{
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

**Lỗi:** 400 dữ liệu không hợp lệ · 401 chưa đăng nhập · 403 không phải ADMIN · 404 không tìm thấy · 409 trùng name/slug
Side effect: log `UPDATE_JOB_CATEGORY` (oldValue/newValue = JSON `{name,status}`)

### 4.5 `DELETE /api/v1/admin/job-categories/{id}`

**Validation:** `id` (path) — number, phải tồn tại, chưa có tin tuyển dụng nào tham chiếu

**200 OK**

```json
{ "data": null }
```

**Lỗi:** 401 chưa đăng nhập · 403 không phải ADMIN · 404 không tìm thấy · 409 còn tin tuyển dụng dùng
Side effect: log `DELETE_JOB_CATEGORY`

---

## 5. Thống kê

### 5.1 `GET /api/v1/admin/statistics`

**Validation:** không có tham số

**200 OK**

```json
{
  "data": {
    "totalCandidates": 186,
    "totalRecruiters": 34,
    "totalCompanies": 30,
    "totalJobs": 210,
    "totalApplications": 892
  }
}
```

**Lỗi:** 401 chưa đăng nhập · 403 không phải ADMIN

---

## 6. Ghi log (`LogService.write()`)

| action              | oldValue         | newValue          | description |
| ------------------- | ---------------- | ----------------- | ----------- |
| LOCK_USER           | ACTIVE           | BANNED            | lý do       |
| UNLOCK_USER         | BANNED           | ACTIVE            | —           |
| LOCK_COMPANY        | ACTIVE           | BLOCKED           | lý do       |
| UNLOCK_COMPANY      | BLOCKED          | ACTIVE            | —           |
| APPROVE_JOB         | PENDING          | APPROVED          | —           |
| REJECT_JOB          | PENDING          | REJECTED          | lý do       |
| CREATE_JOB_CATEGORY | —                | name mới          | —           |
| UPDATE_JOB_CATEGORY | {name,status} cũ | {name,status} mới | —           |
| DELETE_JOB_CATEGORY | name             | —                 | —           |

## 7. Bắn thông báo (`NotificationService.create()`)

| Hành động                                            | Người nhận         | Lấy từ                                                                   |
| ---------------------------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| Khóa / mở khóa tài khoản.                            | Chủ tài khoản      | `users.id`                                                               |
| Khóa / mở khóa công ty.                              | Recruiter          | `companies.user_id`                                                      |
| Duyệt / từ chối tin.                                 | Recruiter          | `jobs.company_id → companies.user_id`                                    |
| Ngành nghề.                                          | — không noti       | —                                                                        |
| Có ứng viên mới nộp hồ sơ (`NEW_APPLICATION`).       | Recruiter đăng tin | `applications.job_id → jobs.company_id → companies.user_id` — Nhóm 3 gọi |
| Đổi trạng thái hồ sơ (`APPLICATION_STATUS_CHANGED`). | Ứng viên nộp hồ sơ | `applications.user_id` — Nhóm 2/3 gọi                                    |

Transaction: update + log + noti chung 1 transaction, lỗi 1 trong 3 rollback cả 3.
