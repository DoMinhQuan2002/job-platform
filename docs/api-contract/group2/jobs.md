# API Contract — Jobs (Group 2)

> Owner doc: ** Trần Văn Cường (`GET api/v1/jobs`, `GET api/v1/jobs/{id}`, `PUT api/v1/jobs/{id}`),Nguyễn Mạnh Cường (`POST /api/v1/jobs`), Nguyễn Bá Đức(`PATCH /api/v1/jobs/{id}`,`GET /api/v1/jobs`, `/api/v1/job-categories`,`/api/v1/recruiter/jobs`), **.  


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
| `keyword` | Tìm theo tên job / công ty / mô tả |
| `companyId` | `companies.id` (lấy danh sách job của một công ty cụ thể) |
| `category` / `categoryId` | `job_categories.id` |
| `location` | string |
| `salaryMin`, `salaryMax` | number `>= 0`; lọc theo khoảng giao nhau |
| `page` | integer `>= 1`, mặc định `1` |
| `limit` / `size` | integer `1..100`, mặc định `20` |

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


### 1.5 PATCH `/api/jobs/{id}`

### Mục đích

Cập nhật **trạng thái tin tuyển dụng** mà không xóa job khỏi database.

### Quyền

`RECRUITER` — chỉ được cập nhật job thuộc company của mình.

### Path Parameter

| Field | Type   | Required | Validation                  |
| ----- | ------ | -------- | --------------------------- |
| `id`  | BIGINT | Yes      | ID hợp lệ, job phải tồn tại |

### Request

```json
{
  "status": "CLOSED"
}
```

| Field    | Type | Required | Validation                                         |
| -------- | ---- | -------- | -------------------------------------------------- |
| `status` | enum | Yes      | Phải thuộc trạng thái Recruiter được phép cập nhật |

### Business Rules

* API chỉ cập nhật `status`; sửa nội dung job dùng `PUT /api/jobs/{id}`.
* Recruiter chỉ thao tác job thuộc company của mình.
* Dùng trạng thái để đóng/mở/ẩn job thay vì xóa vật lý.
* Recruiter chỉ được thay đổi trạng thái thuộc vòng đời tuyển dụng, ví dụ `OPEN`, `CLOSED`, `HIDDEN`.
* Các trạng thái kiểm duyệt như `PENDING`, `APPROVED`, `REJECTED` thuộc quyền Admin nếu hệ thống quy định như vậy.
* Không cho transition không hợp lệ hoặc chuyển sang chính trạng thái hiện tại.

Ví dụ:

```text
OPEN → CLOSED
CLOSED → OPEN
OPEN → HIDDEN
HIDDEN → OPEN
```

> Tên status cuối cùng phải theo đúng enum đã chốt trong database. Bản contract hiện tại cũng yêu cầu không tự bổ sung status ngoài schema.

### Response 200

```json
{
  "success": true,
  "message": "Cập nhật trạng thái tin tuyển dụng thành công",
  "data": {
    "id": "25",
    "status": "CLOSED",
    "updatedAt": "2026-08-21T10:00:00.000Z"
  }
}
```

### Errors

| Status | Khi                                        |
| ------ | ------------------------------------------ |
| `400`  | Status/transition không hợp lệ             |
| `401`  | Chưa đăng nhập                             |
| `403`  | Không phải Recruiter hoặc không sở hữu job |
| `404`  | Job không tồn tại                          |
| `500`  | Lỗi hệ thống                               |

---

### 1.6. GET `/api/v1/jobs`

### Mục đích

Lấy danh sách việc làm công khai, đồng thời hỗ trợ **tìm kiếm, lọc và phân trang**.

### Quyền

`Public`

### Query Parameters

| Param       | Type    | Required | Ý nghĩa          |
| ----------- | ------- | -------- | ---------------- |
| `keyword`   | string  | No       | Tìm theo từ khóa |
| `category`  | BIGINT  | No       | ID ngành nghề    |
| `location`  | string  | No       | Địa điểm         |
| `salaryMin` | DECIMAL | No       | Lương tối thiểu  |
| `salaryMax` | DECIMAL | No       | Lương tối đa     |
| `page`      | integer | No       | Trang hiện tại   |
| `limit`     | integer | No       | Số job/trang     |

Ví dụ:

```http
GET /api/jobs?keyword=backend&category=2&location=Hanoi&salaryMin=10000000&salaryMax=20000000&page=1&limit=10
```

Các điều kiện được kết hợp theo `AND`.

### Validation

* `keyword`, `location`: trim, không phân biệt hoa thường.
* `category`: truyền `job_categories.id`.
* `salaryMin`, `salaryMax >= 0`.
* Nếu có cả hai: `salaryMin <= salaryMax`.
* `page >= 1`.
* `1 <= limit <= 100`.
* Default: `page=1`, `limit=10`.

### Salary Filter

Job phù hợp khi khoảng lương giao với khoảng người dùng tìm:

```text
job.salary_max >= salaryMin
AND
job.salary_min <= salaryMax
```

Quy tắc này đang được sử dụng trong contract hiện tại.

### Business Rules

API public chỉ trả job được phép hiển thị:

* job đã được duyệt;
* job đang mở;
* company đang hoạt động;
* category đang hoạt động;
* chưa hết deadline.

Không trả các job như:

```text
PENDING
REJECTED
CLOSED
HIDDEN
```

nếu các trạng thái này tồn tại trong enum.

### Response 200

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "items": [
      {
        "id": "25",
        "title": "Backend Developer",
        "salaryMin": 10000000,
        "salaryMax": 20000000,
        "location": "Hanoi",
        "status": "APPROVED",
        "category": {
          "id": "2",
          "name": "Backend Developer"
        },
        "company": {
          "id": "5",
          "name": "ABC Technology",
          "logo": "https://example.com/logo.png"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 35,
      "totalPages": 4
    }
  }
}
```

Không có kết quả → vẫn trả `200` với `items: []`.

### Errors

| Status | Khi                |
| ------ | ------------------ |
| `400`  | Query không hợp lệ |
| `500`  | Lỗi hệ thống       |

> `GET /api/v1/jobs` là một endpoint duy nhất cho list + search + filter + pagination, không cần tạo `/search` hoặc `/filter` riêng.

---


### 1.7. GET `/api/v1/job-categories`

### Mục đích

Lấy danh sách ngành nghề dùng cho:

* filter tìm việc;
* form tạo/sửa job;
* hiển thị ngành nghề của job.

### Quyền

`Public`


### Request

Không có body.

```http
GET /api/v1/job-categories
```

### Business Rules

* Chỉ trả category đang hoạt động.
* Không cần pagination vì đây là dữ liệu catalog.
* Nếu database chưa có quan hệ cha–con thì trả **flat list**, không tự tạo `children`.

### Response 200

```json
{
  "success": true,
  "message": "Thành công",
  "data": [
    {
      "id": "1",
      "name": "Công nghệ thông tin",
      "description": "Nhóm ngành công nghệ thông tin"
    },
    {
      "id": "2",
      "name": "Backend Developer",
      "description": "Phát triển hệ thống backend"
    }
  ]
}
```

Nếu không có category:

```json
{
  "success": true,
  "message": "Thành công",
  "data": []
}
```

### Errors

| Status | Khi                              |
| ------ | -------------------------------- |
| `200`  | Thành công, kể cả danh sách rỗng |
| `500`  | Lỗi hệ thống                     |


---


| Method  | URL                   | Quyền       | Chức năng                           |
| ------- | --------------------- | ----------- | ----------------------------------- |
| `PATCH` | `/api/v1/jobs/{id}`      | `RECRUITER` | Cập nhật trạng thái job             |
| `GET`   | `/api/v1/jobs`           | Public      | List / search / filter / pagination |
| `GET`   | `/api/v1/job-categories` | Public      | Danh sách ngành nghề                |

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

## 1.8 GET `/api/v1/recruiter/jobs`

### Mục đích

Lấy danh sách toàn bộ tin tuyển dụng thuộc company của Recruiter để quản lý.

### Quyền

`RECRUITER`

### Query

| Param      | Type    | Required | Ý nghĩa                   |
| ---------- | ------- | -------- | ------------------------- |
| `keyword`  | string  | No       | Tìm theo tiêu đề/nội dung |
| `status`   | enum    | No       | Lọc trạng thái            |
| `category` | BIGINT  | No       | Lọc ngành nghề            |
| `page`     | integer | No       | Trang hiện tại            |
| `limit`    | integer | No       | Số bản ghi/trang          |

Ví dụ:

```http
GET /api/v1/recruiter/jobs?status=REJECTED&page=1&limit=10
```

### Business Rules

Backend tự xác định company từ Recruiter đang đăng nhập:

```text
req.user.id
→ company của recruiter
→ jobs.company_id = company.id
```

Frontend không truyền `companyId`.

Recruiter xem được tất cả job của mình, kể cả:

```text
APPROVED
PENDING
REJECTED
CLOSED
```

Nếu không truyền `status` → trả tất cả trạng thái.

### Pagination

```text
page >= 1
1 <= limit <= 100

default:
page = 1
limit = 10
```

### Response 200

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "items": [
      {
        "id": "25",
        "title": "Backend Developer",
        "salaryMin": 10000000,
        "salaryMax": 20000000,
        "location": "Hà Nội",
        "status": "PENDING",
        "category": {
          "id": "2",
          "name": "Backend Developer"
        },
        "createdAt": "2026-08-20T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 16,
      "totalPages": 2
    }
  }
}
```

Nếu không có job → `200` với `items: []`.

### Errors

| Status | Khi                        |
| ------ | -------------------------- |
| `400`  | Query không hợp lệ         |
| `401`  | Chưa đăng nhập / token lỗi |
| `403`  | Không phải Recruiter       |
| `404`  | Recruiter chưa có company  |
| `500`  | Lỗi hệ thống               |

---

## Phân biệt với GET `/api/v1/jobs`

|            | `GET /api/v1/jobs`    | `GET /api/v1/recruiter/jobs` |
| ---------- | ------------------ | ------------------------- |
| Đối tượng  | Public / Candidate | Recruiter                 |
| Phạm vi    | Job công khai      | Job của company hiện tại  |
| `APPROVED` | Có                 | Có                        |
| `PENDING`  | Không              | Có                        |
| `REJECTED` | Không              | Có                        |
| `CLOSED`   | Không              | Có                        |

```text
GET /api/v1/jobs
→ danh sách job public

GET /api/v1/recruiter/jobs
→ danh sách job nội bộ để Recruiter quản lý
```

---

## 1.9 Recruiter Statistics (`/api/v1/recruiter/statistics/*`)

### 1.9.1 GET `/api/v1/recruiter/statistics/overview`
- **Mục đích**: Lấy các chỉ số tổng quan cho dashboard (tin đang tuyển, tổng tin, ứng viên mới trong kỳ, tổng ứng viên, và so sánh kỳ trước).
- **Quyền**: `RECRUITER`
- **Query parameters**:
  - `days` (number, optional, mặc định `30`): Số ngày trong kỳ thống kê.
  - `startDate` & `endDate` (string `YYYY-MM-DD`, optional): Khoảng ngày tùy chỉnh.
- **Response 200**:
```json
{
  "success": true,
  "message": "Lấy thống kê tổng quan thành công",
  "data": {
    "activeJobs": 12,
    "totalJobs": 25,
    "newCandidates": 48,
    "totalCandidates": 156,
    "comparison": {
      "periodDays": 30,
      "startDate": "2026-07-29",
      "endDate": "2026-08-28",
      "prevStartDate": "2026-06-29",
      "prevEndDate": "2026-07-29",
      "prevNewCandidates": 33,
      "diffNewCandidates": 15,
      "diffTotalCandidates": 48
    }
  }
}
```

### 1.9.2 GET `/api/v1/recruiter/statistics/applications-by-status`
- **Mục đích**: Thống kê số lượng ứng viên theo từng trạng thái (`APPLIED`, `VIEWED`, `INTERVIEW`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`).
- **Quyền**: `RECRUITER`
- **Query parameters**:
  - `jobId` (string, optional): Lọc theo tin tuyển dụng cụ thể.
  - `days` / `startDate` & `endDate` (optional): Lọc trong khoảng thời gian.
- **Response 200**:
```json
{
  "success": true,
  "message": "Lấy thống kê trạng thái ứng viên thành công",
  "data": {
    "total": 156,
    "byStatus": {
      "APPLIED": 78,
      "VIEWED": 32,
      "INTERVIEW": 18,
      "ACCEPTED": 12,
      "REJECTED": 16,
      "WITHDRAWN": 0
    }
  }
}
```

### 1.9.3 GET `/api/v1/recruiter/statistics/recent-jobs`
- **Mục đích**: Lấy danh sách tin tuyển dụng mới nhất của công ty kèm số lượng ứng viên đã nộp.
- **Quyền**: `RECRUITER`
- **Query parameters**:
  - `limit` (number, optional, mặc định `5`, tối đa `50`).
- **Response 200**:
```json
{
  "success": true,
  "message": "Lấy danh sách tin tuyển dụng gần đây thành công",
  "data": [
    {
      "id": "10",
      "title": "Chuyên viên Digital Marketing",
      "status": "APPROVED",
      "applicantCount": 18,
      "deadline": "2026-09-30",
      "createdAt": "2026-08-20T10:00:00.000Z"
    }
  ]
}
```

### 1.9.4 GET `/api/v1/recruiter/statistics/candidate-trend`
- **Mục đích**: Lấy dữ liệu chuỗi thời gian để vẽ 2 đường xu hướng: Kỳ này vs Kỳ trước (Candidate Trend Chart).
- **Quyền**: `RECRUITER`
- **Query parameters**:
  - `days` (number, optional, mặc định `30`).
  - `startDate` & `endDate` (string `YYYY-MM-DD`, optional).
  - `groupBy` (`day` | `week` | `month`, mặc định `day`).
- **Response 200**:
```json
{
  "success": true,
  "message": "Lấy biểu đồ xu hướng ứng viên thành công",
  "data": {
    "groupBy": "day",
    "summary": {
      "totalCurrent": 48,
      "totalPrevious": 33,
      "diff": 15
    },
    "points": [
      {
        "label": "24/05",
        "current": 6,
        "previous": 4,
        "currentDate": "2026-05-24",
        "prevDate": "2026-04-24"
      }
    ]
  }
}
```

---

### 1.9.5 Hướng dẫn sử dụng cho Frontend (Frontend Integration Guide)

#### 1. Ánh xạ Component Dashboard ↔ API Endpoint

| UI Component | Endpoint cần gọi | Dữ liệu chính sử dụng |
|---|---|---|
| **3 Thẻ Tổng quan** (`DashboardCard`) | `GET /api/v1/recruiter/statistics/overview` | `activeJobs`, `newCandidates`, `totalCandidates`, `comparison.diffNewCandidates` |
| **Biểu đồ Tròn** (`CandidateStatusChart`) | `GET /api/v1/recruiter/statistics/applications-by-status` | `total`, `byStatus` (`APPLIED`, `VIEWED`, `INTERVIEW`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`) |
| **Biểu đồ Đường 2 Kỳ** (`CandidateTrendChart`) | `GET /api/v1/recruiter/statistics/candidate-trend` | `summary`, `points` (`label`, `current`, `previous`) |
| **Bảng Tin Đăng Gần Đây** (`RecentJobs`) | `GET /api/v1/recruiter/statistics/recent-jobs` | Danh sách tin: `id`, `title`, `status`, `applicantCount`, `deadline` |

---

#### 2. Quy tắc truyền tham số lọc thời gian (Time Filter)

Frontend có thể hỗ trợ người dùng lọc thời gian linh hoạt theo 2 cách:

1. **Chọn nhanh theo số ngày (`days`)**:
   - Mặc định: `30` ngày gần nhất.
   - Các mốc thông dụng: `?days=7` (7 ngày), `?days=14` (14 ngày), `?days=30` (30 ngày), `?days=90` (quý).
   - Backend sẽ tự động lấy kỳ hiện tại là `N` ngày qua, và kỳ trước là `N` ngày liền kề trước đó.

2. **Chọn khoảng ngày từ DatePicker (`startDate` & `endDate`)**:
   - Định dạng: `YYYY-MM-DD` (Ví dụ: `?startDate=2026-08-01&endDate=2026-08-28`).
   - Yêu cầu: `startDate` phải nhỏ hơn hoặc bằng `endDate` và phải truyền đủ cả 2 tham số.

3. **Gom nhóm biểu đồ xu hướng (`groupBy`)**:
   - `day` (mặc định - theo ngày)
   - `week` (theo tuần)
   - `month` (theo tháng)

---

#### 3. Quy tắc hiển thị và xử lý dữ liệu ở Frontend

- **Hiển thị thẻ chỉ số (Dashboard Cards)**:
  - **Tin đăng đang tuyển**: `data.activeJobs`
  - **Ứng viên mới**: `data.newCandidates` (chi tiết: `+{data.comparison.diffNewCandidates} so với kỳ trước`)
  - **Tổng ứng viên**: `data.totalCandidates`

- **Hiển thị Biểu đồ tròn trạng thái (Donut Chart)**:
  - Lấy số lượng từ `data.byStatus[STATUS]`.
  - Frontend tính tỷ lệ phần trăm: $\text{Tỷ lệ } (\%) = \frac{\text{count}}{\text{total}} \times 100\%$.
  - Nếu `total === 0`, hiển thị biểu đồ rỗng (0%).

- **Hiển thị Biểu đồ đường xu hướng (Trend Chart)**:
  - **Trục hoành (X-Axis)**: Lấy `point.label` (ví dụ: `24/05`, `28/05`, `01/06`...).
  - **Đường 1 (Kỳ này - nét liền)**: Lấy `point.current`.
  - **Đường 2 (Kỳ trước - nét đứt)**: Lấy `point.previous`.
  - Dữ liệu `points` đã được Backend tự động bù số `0` cho các ngày không có ứng viên, Frontend không cần xử lý bù mảng.

- **Bảng Tin đăng gần đây**:
  - `applicantCount`: Số lượng hồ sơ đã nộp vào tin đó.
  - `deadline`: Hạn nộp hồ sơ.

---

#### 4. Quy ước xử lý lỗi (HTTP Error Handling)

- **`401 UNAUTHORIZED`**: Chưa đăng nhập hoặc token hết hạn $\rightarrow$ Điều hướng người dùng về trang `/login`.
- **`403 FORBIDDEN`**: Tài khoản không có vai trò `RECRUITER` $\rightarrow$ Chặn và thông báo không có quyền truy cập.
- **`404 COMPANY_NOT_FOUND`**: Nhà tuyển dụng chưa khởi tạo hồ sơ công ty $\rightarrow$ Điều hướng hoặc hiển thị popup yêu cầu hoàn tất tạo hồ sơ công ty trước.
- **`400 BAD_REQUEST`**: Tham số truyền lên sai định dạng (ví dụ `startDate > endDate`) $\rightarrow$ Hiển thị thông báo lỗi từ mảng `errors`.

