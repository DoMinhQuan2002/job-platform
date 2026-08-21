# API Contract — Company (Group 2)

> Owner doc: **Nguyễn Bá Đức, Nguyễn Mạnh Cường**  
> Status: **Draft GĐ2 — chờ Leader duyệt**.

Liên quan schema: `companies`, `users`.

---

## 0. Map Brief ↔ Schema / Draft stub

| Brief (sếp) | Schema / ý nghiệp vụ | Draft stub hiện tại | Đề xuất contract |
|-------------|----------------------|----------------------|------------------|
| Tạo hồ sơ công ty | `companies` (`userId = req.user.id`) | `POST /api/v1/company` | `POST /api/v1/company` |
| `GET /api/company` | `companies` (`user_id = req.user.id`) | `GET /api/v1/company` | `GET /api/v1/company` |
| `PUT /api/company` | `companies` (`logo`, `website`, `email`, `phone`, `address`, `description`, `taxCode`, `companySize`) | `PUT /api/v1/company` | `PUT /api/v1/company` |

**Identity**

- `req.user.id` = `users.id`
- `companies.user_id` = `users.id` (unique, mỗi Recruiter chỉ sở hữu 1 công ty)
- Role: `RECRUITER` (Bearer Token)

---

## 1. Company Endpoints

Base: `/api/v1/company` (hoặc `/api/company` tuỳ Leader chốt tiền tố `v1`)  
Auth: `RECRUITER`

### 1.1 Khởi tạo hồ sơ công ty mới

| | |
|---|---|
| Tên | Tạo mới hồ sơ công ty cho nhà tuyển dụng |
| Method / URL | `POST /api/v1/company` |
| Quyền | `RECRUITER` |
| Nghiệp vụ | 1. Mỗi tài khoản `RECRUITER` chỉ được tạo tối đa 1 công ty (`companies.user_id` unique).<br>2. Tự động liên kết `userId = req.user.id`.<br>3. Tự động sinh `slug` từ `name` (kèm unique suffix nếu cần).<br>4. Trạng thái mặc định: `status = "ACTIVE"`. |

**Request**

```json
{
  "name": "Công ty Cổ phần Công nghệ FPT",
  "logo": "companies/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.png",
  "website": "https://fpt.com",
  "email": "contact@fpt.com",
  "phone": "02473007300",
  "taxCode": "0101248141",
  "companySize": "500+",
  "address": "Tòa nhà FPT, Phố Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội",
  "description": "FPT là tập đoàn công nghệ toàn cầu hàng đầu Việt Nam..."
}
```

| Field | Type | Required | Validation / Note |
|-------|------|----------|-------------------|
| `name` | string | yes | Max 255 ký tự, không để trống (Backend tự sinh `slug`) |
| `logo` | string \| null | no | Path / URL storage từ Media upload (`assetType: company_logo`), max 255 |
| `website` | string \| null | no | URL hợp lệ (`http://` hoặc `https://`), max 255 |
| `email` | string | yes | Email hợp lệ, max 255 |
| `phone` | string | yes | Regex số điện thoại VN (10-11 số), max 20 |
| `taxCode` | string \| null | no | Max 50 ký tự |
| `companySize` | string \| null | no | Enum: `'1-50'` \| `'50-100'` \| `'100-500'` \| `'500+'` |
| `address` | string | yes | Max 255 ký tự, không để trống |
| `description` | string \| null | no | Kiểu text |

**Response 201**

```json
{
  "success": true,
  "message": "Khởi tạo hồ sơ công ty thành công",
  "data": {
    "id": "1",
    "userId": "10",
    "name": "Công ty Cổ phần Công nghệ FPT",
    "slug": "cong-ty-co-phan-cong-nghe-fpt",
    "logo": "companies/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.png",
    "website": "https://fpt.com",
    "email": "contact@fpt.com",
    "phone": "02473007300",
    "taxCode": "0101248141",
    "companySize": "500+",
    "address": "Tòa nhà FPT, Phố Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội",
    "description": "FPT là tập đoàn công nghệ toàn cầu hàng đầu Việt Nam...",
    "status": "ACTIVE",
    "createdAt": "2026-08-21T09:30:00.000Z",
    "updatedAt": "2026-08-21T09:30:00.000Z"
  }
}
```

**Errors**

| Status | Khi |
|--------|-----|
| 400 | Dữ liệu không hợp lệ (thiếu trường bắt buộc, sai định dạng email/phone/enum) |
| 401 | Chưa đăng nhập hoặc token hết hạn |
| 403 | Không phải tài khoản `RECRUITER` |
| 409 | Tài khoản đã sở hữu một hồ sơ công ty hoặc trùng mã số thuế / slug |
| 500 | Lỗi hệ thống nội bộ |

---

### 1.2 Lấy thông tin công ty của tôi

| | |
|---|---|
| Tên | Xem thông tin công ty của nhà tuyển dụng đang đăng nhập |
| Method / URL | `GET /api/v1/company` |
| Quyền | `RECRUITER` |
| Request | — |
| Validation | Phải đăng nhập với vai trò `RECRUITER` |

**Response 200**

```json
{
  "success": true,
  "message": "Lấy thông tin công ty thành công",
  "data": {
    "id": "1",
    "userId": "10",
    "name": "Công ty Cổ phần Công nghệ FPT",
    "slug": "cong-ty-co-phan-cong-nghe-fpt",
    "logo": "companies/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.png",
    "website": "https://fpt.com",
    "email": "hr@fpt.com",
    "phone": "02473007300",
    "taxCode": "0101248141",
    "companySize": "500+",
    "address": "Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội",
    "description": "Tập đoàn công nghệ hàng đầu Việt Nam cung cấp dịch vụ CNTT...",
    "status": "ACTIVE",
    "createdAt": "2026-08-20T08:30:00.000Z",
    "updatedAt": "2026-08-21T09:15:00.000Z"
  }
}
```

**Errors**

| Status | Khi |
|--------|-----|
| 401 | Chưa đăng nhập hoặc token hết hạn / không hợp lệ |
| 403 | Không phải tài khoản `RECRUITER` |
| 404 | Nhà tuyển dụng chưa khởi tạo hồ sơ công ty |
| 500 | Lỗi hệ thống nội bộ |

---

### 1.3 Cập nhật thông tin công ty

| | |
|---|---|
| Tên | Cập nhật thông tin chi tiết hồ sơ công ty |
| Method / URL | `PUT /api/v1/company` |
| Quyền | `RECRUITER` |

**Request**

```json
{
  "name": "Công ty Cổ phần Công nghệ FPT",
  "logo": "companies/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.png",
  "website": "https://fpt.com",
  "email": "contact@fpt.com",
  "phone": "02473007300",
  "taxCode": "0101248141",
  "companySize": "500+",
  "address": "Tòa nhà FPT, Phố Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội",
  "description": "FPT là tập đoàn công nghệ toàn cầu hàng đầu Việt Nam..."
}
```

| Field | Type | Required | Validation / Note |
|-------|------|----------|-------------------|
| `name` | string | yes | Max 255 ký tự, không rỗng (Backend tự update lại `slug`) |
| `logo` | string \| null | no | Path / URL storage từ module Media upload (`assetType: company_logo`), max 255 |
| `website` | string \| null | no | URL hợp lệ (`http://` hoặc `https://`), max 255 |
| `email` | string | yes | Email hợp lệ, max 255 |
| `phone` | string | yes | Regex số điện thoại VN (10-11 số), max 20 |
| `taxCode` | string \| null | no | Max 50 ký tự |
| `companySize` | string \| null | no | Enum: `'1-50'` \| `'50-100'` \| `'100-500'` \| `'500+'` |
| `address` | string | yes | Max 255 ký tự, không để trống |
| `description` | string \| null | no | Kiểu text |

**Response 200**

```json
{
  "success": true,
  "message": "Cập nhật thông tin công ty thành công",
  "data": {
    "id": "1",
    "userId": "10",
    "name": "Công ty Cổ phần Công nghệ FPT",
    "slug": "cong-ty-co-phan-cong-nghe-fpt",
    "logo": "companies/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.png",
    "website": "https://fpt.com",
    "email": "contact@fpt.com",
    "phone": "02473007300",
    "taxCode": "0101248141",
    "companySize": "500+",
    "address": "Tòa nhà FPT, Phố Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội",
    "description": "FPT là tập đoàn công nghệ toàn cầu hàng đầu Việt Nam...",
    "status": "ACTIVE",
    "createdAt": "2026-08-20T08:30:00.000Z",
    "updatedAt": "2026-08-21T09:30:00.000Z"
  }
}
```

**Errors**

| Status | Khi |
|--------|-----|
| 400 | Dữ liệu không hợp lệ (sai định dạng email, phone, size enum, thiếu trường bắt buộc) |
| 401 | Chưa đăng nhập hoặc token hết hạn |
| 403 | Không có quyền `RECRUITER` |
| 404 | Không tìm thấy hồ sơ công ty |
| 409 | Trùng mã số thuế hoặc tên công ty / slug |
| 500 | Lỗi hệ thống nội bộ |

## 1.4 GET `/api/companies/{id}`

### Mục đích

Xem thông tin công ty công khai dành cho Candidate/Public.

### Quyền

`Public`

### Path Param

| Field | Type   | Required | Validation                      |
| ----- | ------ | -------- | ------------------------------- |
| `id`  | BIGINT | Yes      | ID hợp lệ, company phải tồn tại |

### Business Rules

Chỉ trả các thông tin được phép public:

```text
name
logo
description
address
website
email
phone
```

Không trả `user_id` hoặc thông tin tài khoản Recruiter.

Chỉ company đang được phép hiển thị mới được trả về. Company bị khóa/ẩn/inactive → `404`.

### Response 200

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "id": "15",
    "name": "ABC Technology",
    "logo": "https://example.com/logo.png",
    "description": "Công ty phát triển phần mềm",
    "address": "Cầu Giấy, Hà Nội",
    "website": "https://abc.example",
    "email": "contact@abc.example",
    "phone": "02412345678"
  }
}
```

### Errors

| Status | Khi                                          |
| ------ | -------------------------------------------- |
| `400`  | ID không hợp lệ                              |
| `404`  | Company không tồn tại hoặc không được public |
| `500`  | Lỗi hệ thống                                 |

> Phân biệt:
>
> `GET /api/company` → Recruiter xem company của mình.
> `GET /api/companies/{id}` → Public xem company theo ID.

---

## 1.5 GET `/api/recruiter/jobs`

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
GET /api/recruiter/jobs?status=REJECTED&page=1&limit=10
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

## Phân biệt với GET `/api/jobs`

|            | `GET /api/jobs`    | `GET /api/recruiter/jobs` |
| ---------- | ------------------ | ------------------------- |
| Đối tượng  | Public / Candidate | Recruiter                 |
| Phạm vi    | Job công khai      | Job của company hiện tại  |
| `APPROVED` | Có                 | Có                        |
| `PENDING`  | Không              | Có                        |
| `REJECTED` | Không              | Có                        |
| `CLOSED`   | Không              | Có                        |

```text
GET /api/jobs
→ danh sách job public

GET /api/recruiter/jobs
→ danh sách job nội bộ để Recruiter quản lý
```
