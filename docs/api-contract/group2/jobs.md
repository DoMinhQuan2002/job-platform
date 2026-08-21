# API Contract — Jobs (Group 2)

> Owner doc: ** Trần Văn Cường (`GET /jobs`, `GET /jobs/{id}`, `PUT /jobs/{id}`),Nguyễn Mạnh Cường (`POST /api/jobs`), Nguyễn Bá Đức(`DELETE /api/jobs/{id}`), **.  
> Status: **Draft GĐ2 — chờ Leader duyệt**.

Liên quan schema: `jobs`, `job_skills`, `job_categories`, `companies`, `skills`.

---

## 0. Map Brief ↔ Schema / Draft stub

| Brief (sếp) | Schema / ý nghiệp vụ | Draft stub hiện tại | Đề xuất contract |
|-------------|----------------------|--------------------|------------------|
| `POST /api/jobs` | Tạo `jobs` + `job_skills` | `POST /api/v1/jobs` | `POST /api/v1/jobs` |
| `GET /api/jobs` | List + tìm kiếm / lọc | `GET /api/v1/jobs` | `GET /api/v1/jobs` |
| `GET /api/jobs/{id}` | Chi tiết + quan hệ | `GET /api/v1/jobs/{id}` | `GET /api/v1/jobs/{id}` |
| `PUT /api/jobs/{id}` | Sửa job + skills | `PUT /api/v1/jobs/{id}` | `PUT /api/v1/jobs/{id}` |
| Đóng / mở lại job | Cập nhật `jobs.status` | Chưa có | Action endpoint (khuyến nghị) |

**Identity / Ownership**

- `req.user.id` = `users.id`
- `companies.user_id` = `users.id`
- `jobs.company_id` = `companies.id`
- Recruiter chỉ thao tác job thuộc công ty của mình; công ty phải ở trạng thái `ACTIVE`.

---

## 1. Job endpoints

Base: `/api/v1/jobs`

### 1.1 Create job

| | |
|--|--|
| Tên | Đăng tin tuyển dụng |
| Method / URL | `POST /api/v1/jobs` |
| Quyền | `RECRUITER` |

**Request**

```json
{
  "categoryId": "2",
  "title": "Senior NodeJS Developer",
  "description": "Phát triển hệ thống backend...",
  "requirements": "Tối thiểu 3 năm kinh nghiệm...",
  "benefits": "Lương tháng 13, bảo hiểm...",
  "salaryMin": 25000000,
  "salaryMax": 45000000,
  "isNegotiable": false,
  "address": "Cầu Giấy, Hà Nội",
  "jobType": "FULL_TIME",
  "jobMode": "HYBRID",
  "experience": 3,
  "quantity": 2,
  "deadline": "2026-09-30",
  "skills": [
    { "skillId": "5", "isRequired": true }
  ]
}
```

| Field | Required | Validation / Note |
|-------|----------|-------------------|
| `categoryId` | yes | Category phải tồn tại |
| `title` | yes | 5–255 ký tự |
| `description`, `requirements` | yes | Không để trống |
| `benefits` | no | string hoặc null |
| `salaryMin`, `salaryMax` | no | `>= 0`; max `>=` min |
| `isNegotiable` | no | boolean, mặc định `false` |
| `address` | yes | Tối đa 255 ký tự |
| `jobType` | yes | `FULL_TIME \| PART_TIME` |
| `jobMode` | yes | `ONSITE \| REMOTE \| HYBRID` |
| `experience` | no | Số năm, `>= 0` hoặc null |
| `quantity` | no | Số nguyên `>= 1`, mặc định `1` |
| `deadline` | yes | `YYYY-MM-DD`, lớn hơn ngày hiện tại |
| `skills` | no | Skill tồn tại; `isRequired` mặc định `true` |

**Response 201**

```json
{
  "success": true,
  "message": "Tạo tin tuyển dụng thành công",
  "data": {
    "id": "101",
    "companyId": "1",
    "categoryId": "2",
    "title": "Senior NodeJS Developer",
    "slug": "senior-nodejs-developer-101",
    "status": "PENDING",
    "skills": [
      { "skillId": "5", "isRequired": true }
    ],
    "createdAt": "2026-08-21T09:40:00.000Z"
  }
}
```

**Errors:** `400`, `401`, `403`, `404` (company/category/skill), `500`.

---

### 1.2 List jobs

| | |
|--|--|
| Method / URL | `GET /api/v1/jobs` |
| Quyền | Public |

**Query**

| Param | Validation / Note |
|-------|-------------------|
| `keyword` | Tìm theo tên job / công ty |
| `category` | `job_categories.id` |
| `location` | string |
| `salaryMin`, `salaryMax` | number `>= 0`; lọc theo khoảng giao nhau |
| `page` | integer `>= 1`, mặc định `1` |
| `limit` | integer `1..100`, mặc định `20` |

**Behavior**

- Chỉ trả job `APPROVED` và chưa hết hạn.
- Sắp xếp mặc định `created_at DESC`.
- List không cần trả full `description`, `requirements`, `benefits`.

**Response 200**

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "items": [
      {
        "id": "12",
        "title": "Java Backend Developer",
        "salaryMin": 10000000,
        "salaryMax": 20000000,
        "location": "Hà Nội",
        "jobType": "FULL_TIME",
        "deadline": "2026-09-30",
        "company": { "id": "3", "name": "ABC Technology" },
        "category": { "id": "2", "name": "Công nghệ thông tin" },
        "skills": [{ "id": "1", "name": "Java" }]
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
  }
}
```

**Errors:** `400`, `500`.

---

### 1.3 Get job detail

| | |
|--|--|
| Method / URL | `GET /api/v1/jobs/{id}` |
| Quyền | Public |

**Behavior**

- Public chỉ xem được job `APPROVED`.
- Job không tồn tại hoặc không public trả `404` để tránh lộ dữ liệu.

**Response 200**

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "id": "12",
    "title": "Java Backend Developer",
    "description": "Phát triển REST API...",
    "requirements": "Java, Spring Boot...",
    "benefits": "Lương tháng 13...",
    "salaryMin": 10000000,
    "salaryMax": 20000000,
    "location": "Hà Nội",
    "jobType": "FULL_TIME",
    "status": "APPROVED",
    "company": { "id": "3", "name": "ABC Technology" },
    "category": { "id": "2", "name": "Công nghệ thông tin" },
    "skills": [{ "id": "1", "name": "Java" }]
  }
}
```

**Errors:** `400` (id sai format), `404`, `500`.

---

### 1.4 Update job

| | |
|--|--|
| Method / URL | `PUT /api/v1/jobs/{id}` |
| Quyền | `RECRUITER` — owner company/job |

**Request**

```json
{
  "title": "Senior Java Backend Developer",
  "salaryMin": 15000000,
  "salaryMax": 25000000,
  "deadline": "2026-10-30",
  "skillIds": ["1", "2", "5"]
}
```

- Semantics hiện đề xuất: partial update, omit = không đổi.
- Không cho client sửa `id`, `companyId`, `status`, `createdAt`, `updatedAt`.
- Khi có `skillIds`, cập nhật `jobs` và `job_skills` trong cùng transaction.
- Recruiter sửa nội dung job `APPROVED` hoặc `REJECTED` → đề xuất chuyển về `PENDING`.

**Response 200:** trả job sau cập nhật cùng relations.  
**Errors:** `400`, `401`, `403`, `404` (job/category/skill), `409`, `500`.

---

## 2. Close / reopen job (đề xuất)

| Method | URL | Quyền | Transition |
|--------|-----|-------|------------|
| `PUT` | `/api/v1/jobs/{id}/close` | `RECRUITER` owner | `APPROVED → CLOSED` |
| `PUT` | `/api/v1/jobs/{id}/reopen` | `RECRUITER` owner | `CLOSED → PENDING` |

Recruiter không được tự đặt trạng thái `APPROVED` hoặc `REJECTED`; đây là quyền của Admin.

---

## 3. Ranh giới với Group khác

| Dữ liệu / nghiệp vụ | Owner / phối hợp |
|----------------------|------------------|
| `companies`, `jobs`, `job_categories`, `job_skills` | Group 2 |
| Catalog `skills` | Dùng chung Group 3; không tự đổi schema |
| Approve / reject job | Group 4 Admin |
| Applications / Saved jobs | Group 3 |

---

## 4. Chờ Leader chốt

1. Base URL `/api/jobs` hay `/api/v1/jobs`.
2. Pagination chung: array hay `{ items, meta }`.
3. PUT là full replace hay partial update.
4. Job đã duyệt sau khi sửa có quay về `PENDING` không.
5. Close / reopen dùng action endpoint hay cập nhật `status` trong PUT.
6. Job hết hạn có tự ẩn khỏi public list không.

---

## 5. Draft stub ≠ contract

`apps/backend/src/modules/jobs` hiện chỉ là skeleton / draft implementation.  
**URL / response / validation trong doc này là đề xuất chính thức sau khi Leader approve.**
