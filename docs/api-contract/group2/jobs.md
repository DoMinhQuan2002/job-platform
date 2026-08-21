# API Contract — Jobs (Group 2)

> Owner doc: **Nguyễn Mạnh Cường, Nguyễn Bá Đức, Trần Cường**  
> Status: **Draft GĐ2 — chờ Leader duyệt**.

Liên quan schema: `jobs`, `job_skills`, `job_categories`, `companies`, `skills`.

---

## 0. Map Brief ↔ Schema / Draft stub

| Brief (sếp) | Schema / ý nghiệp vụ | Draft stub hiện tại | Đề xuất contract |
|-------------|----------------------|----------------------|------------------|
| `POST /api/jobs` | `jobs`, `job_skills` (tạo tin + gắn kỹ năng yêu cầu) | `POST /api/v1/jobs` | `POST /api/v1/jobs` |

**Identity & Nghiệp vụ**

- `req.user.id` = `users.id`
- `companies.user_id` = `users.id` (tìm công ty của Recruiter đang đăng nhập)
- Role: `RECRUITER`
- Recruiter chỉ được tạo tin khi đã có hồ sơ công ty và trạng thái công ty là `ACTIVE`
- `status` mặc định khi tạo mới là `PENDING` (chờ duyệt)
- `slug` tự động sinh từ `title` (kèm unique suffix để đảm bảo duy nhất)

---

## 1. Job Endpoints

Base: `/api/v1/jobs` (hoặc `/api/jobs` tuỳ Leader chốt tiền tố `v1`)  
Auth: `RECRUITER`

### 1.1 Tạo tin tuyển dụng mới

| | |
|---|---|
| Tên | Đăng tin tuyển dụng mới |
| Method / URL | `POST /api/v1/jobs` |
| Quyền | `RECRUITER` |

**Request**

```json
{
  "categoryId": "2",
  "title": "Senior NodeJS / TypeScript Developer",
  "description": "<p>Chúng tôi đang tìm kiếm Senior NodeJS Developer tham gia phát triển hệ thống...</p>",
  "requirements": "<ul><li>Tối thiểu 3 năm kinh nghiệm với NodeJS, NestJS/Express.</li><li>Thành thạo PostgreSQL, TypeORM.</li></ul>",
  "benefits": "<ul><li>Lương thưởng cạnh tranh, tháng 13+.</li><li>Bảo hiểm sức khỏe cao cấp.</li><li>Cung cấp Macbook Pro M3.</li></ul>",
  "salaryMin": 25000000,
  "salaryMax": 45000000,
  "isNegotiable": false,
  "address": "Tầng 12, Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội",
  "jobType": "FULL_TIME",
  "jobMode": "HYBRID",
  "experience": 3,
  "quantity": 2,
  "deadline": "2026-09-30",
  "skills": [
    {
      "skillId": "5",
      "isRequired": true
    },
    {
      "skillId": "12",
      "isRequired": false
    }
  ]
}
```

| Field | Type | Required | Validation / Note |
|-------|------|----------|-------------------|
| `categoryId` | string (ID) | yes | ID danh mục ngành nghề, phải tồn tại trong bảng `job_categories` |
| `title` | string | yes | Độ dài từ 5 đến 255 ký tự, không để trống |
| `description` | string | yes | Kiểu text (HTML/Markdown/Text), không để trống |
| `requirements` | string | yes | Kiểu text, không để trống |
| `benefits` | string \| null | no | Kiểu text |
| `salaryMin` | number \| null | no | Số nguyên >= 0 (VNĐ) |
| `salaryMax` | number \| null | no | Số nguyên >= `salaryMin` (VNĐ) |
| `isNegotiable` | boolean | no | Default: `false`. Nếu `true`, lương có thể để null (Thỏa thuận) |
| `address` | string | yes | Max 255 ký tự, không để trống (Địa điểm làm việc) |
| `jobType` | string | yes | Enum: `'FULL_TIME'` \| `'PART_TIME'`. Default: `'FULL_TIME'` |
| `jobMode` | string | yes | Enum: `'ONSITE'` \| `'REMOTE'` \| `'HYBRID'`. Default: `'ONSITE'` |
| `experience` | number \| null | no | Số nguyên >= 0 (năm kinh nghiệm). `null` = Không yêu cầu |
| `quantity` | number | no | Số nguyên >= 1. Default: `1` |
| `deadline` | string (Date) | yes | Định dạng `YYYY-MM-DD`, ngày phải lớn hơn ngày hiện tại |
| `skills` | array | no | Mảng các object `{ skillId: string, isRequired?: boolean }` |
| `skills[].skillId` | string (ID) | yes | ID kỹ năng phải tồn tại trong bảng `skills` |
| `skills[].isRequired` | boolean | no | Default: `true` (Kỹ năng bắt buộc hay ưu tiên) |

**Response 201**

```json
{
  "success": true,
  "message": "Tạo tin tuyển dụng thành công",
  "data": {
    "id": "101",
    "companyId": "1",
    "categoryId": "2",
    "title": "Senior NodeJS / TypeScript Developer",
    "slug": "senior-nodejs-typescript-developer-101",
    "description": "<p>Chúng tôi đang tìm kiếm Senior NodeJS Developer tham gia phát triển hệ thống...</p>",
    "requirements": "<ul><li>Tối thiểu 3 năm kinh nghiệm với NodeJS, NestJS/Express.</li><li>Thành thạo PostgreSQL, TypeORM.</li></ul>",
    "benefits": "<ul><li>Lương thưởng cạnh tranh, tháng 13+.</li><li>Bảo hiểm sức khỏe cao cấp.</li><li>Cung cấp Macbook Pro M3.</li></ul>",
    "salaryMin": "25000000.00",
    "salaryMax": "45000000.00",
    "isNegotiable": false,
    "address": "Tầng 12, Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội",
    "jobType": "FULL_TIME",
    "jobMode": "HYBRID",
    "experience": 3,
    "quantity": 2,
    "deadline": "2026-09-30",
    "rejectReason": null,
    "status": "PENDING",
    "createdAt": "2026-08-21T09:40:00.000Z",
    "updatedAt": "2026-08-21T09:40:00.000Z",
    "skills": [
      {
        "id": "1",
        "skillId": "5",
        "isRequired": true,
        "skill": {
          "id": "5",
          "name": "NodeJS",
          "category": "SKILL"
        }
      },
      {
        "id": "2",
        "skillId": "12",
        "isRequired": false,
        "skill": {
          "id": "12",
          "name": "PostgreSQL",
          "category": "SKILL"
        }
      }
    ]
  }
}
```

**Errors**

| Status | Khi |
|--------|-----|
| 400 | Dữ liệu không hợp lệ (deadline quá khứ, `salaryMax < salaryMin`, thiếu tiêu đề/mô tả/yêu cầu) |
| 401 | Chưa đăng nhập hoặc token hết hạn |
| 403 | Không phải tài khoản `RECRUITER` hoặc công ty đang bị khóa (`BLOCKED`) |
| 404 | Không tìm thấy thông tin công ty của Recruiter hoặc `categoryId`/`skillId` không tồn tại |
| 500 | Lỗi hệ thống nội bộ |

