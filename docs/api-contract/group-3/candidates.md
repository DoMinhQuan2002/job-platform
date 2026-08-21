# API Contract — Candidates (Group 3)

> Owner doc: **Nguyễn Thanh Bình** (profile / education / experience) + **Nguyễn Văn Lợi** (skills).  
> Status: **Draft GĐ2 — chờ Leader duyệt**.

Liên quan schema: `candidate_profiles`, `educations`, `work_experiences`, `skills`, `candidate_skills`.

---

## 0. Map Brief ↔ Schema / Draft stub

| Brief (sếp) | Schema / ý nghiệp vụ | Draft stub hiện tại (`backend/g3-candidate`) | Đề xuất contract |
|-------------|----------------------|-----------------------------------------------|------------------|
| `GET/PUT /api/candidates/me` | `candidate_profiles` + quan hệ con | `GET/PUT /api/v1/candidate-profiles/me` | **Chờ chọn A1 hoặc A2** (xem README) |
| Học vấn trong `/me` | bảng `educations.candidate_id` | `/candidate-profiles/me/educations` | Nested (A2) hoặc embed trong PUT `/me` (A1) |
| Kinh nghiệm trong `/me` | bảng `work_experiences` | `/candidate-profiles/me/work-experiences` | Tương tự |
| Kỹ năng / NN / chứng chỉ trong `/me` | `skills.category` + `candidate_skills` | `/api/v1/skills` + `/skills/me` | Catalog + attach riêng (khuyến nghị) |
| User họ tên / SĐT / avatar | bảng `users` + media avatar | **Group 1** `/users/me` | **Không** nằm Group 3 |

**Identity**

- `req.user.id` = `users.id`
- `candidate_profiles.user_id` = `users.id` (unique)
- Bảng con dùng `candidate_id` = `candidate_profiles.id`

---

## 1. Option A2 (khuyến nghị) — Nested endpoints

Base: `/api/v1/candidate-profiles`  
Auth: `CANDIDATE` (Bearer / sau này Group 1; local: `DEV_MOCK_USER_ID`)

### 1.1 Get or create my profile

| | |
|--|--|
| Tên | Lấy / tự tạo hồ sơ ứng viên |
| Method / URL | `GET /api/v1/candidate-profiles/me` |
| Quyền | `CANDIDATE` |
| Request | — |
| Validation | Phải đăng nhập |

**Response 200**

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "id": "1",
    "userId": "10",
    "bio": "Fresher backend",
    "careerObjective": "Node.js / TypeORM",
    "createdAt": "2026-08-21T00:00:00.000Z",
    "updatedAt": "2026-08-21T00:00:00.000Z"
  }
}
```

> Lần đầu gọi: backend **tạo** row `candidate_profiles` nếu chưa có.

**Errors:** `401`, `403`, `500`

---

### 1.2 Update my profile (text only)

| | |
|--|--|
| Method / URL | `PUT /api/v1/candidate-profiles/me` |
| Quyền | `CANDIDATE` |

**Request**

```json
{
  "bio": "Fresher backend",
  "careerObjective": "Backend engineer"
}
```

| Field | Type | Required | Note |
|-------|------|----------|------|
| `bio` | string \| null | không | Omit = không đổi; `null` = clear |
| `careerObjective` | string \| null | không | Tương tự |

**Response 200:** cùng shape `data` như GET.  
**Errors:** `400`, `401`, `403`, `500`

---

### 1.3 Educations CRUD

| Method | URL | Mô tả |
|--------|-----|--------|
| `GET` | `/api/v1/candidate-profiles/me/educations` | List |
| `POST` | `/api/v1/candidate-profiles/me/educations` | Tạo |
| `PUT` | `/api/v1/candidate-profiles/me/educations/{id}` | Sửa (owner) |
| `DELETE` | `/api/v1/candidate-profiles/me/educations/{id}` | Xóa (owner) → `204` |

**Request POST/PUT**

```json
{
  "school": "PTIT",
  "major": "CNTT",
  "degree": "Cử nhân",
  "startDate": "2020-09-01",
  "endDate": null,
  "isCurrent": true,
  "description": null
}
```

| Field | Required | Validation |
|-------|----------|------------|
| `school` | yes | string, max 255 |
| `major` | no | max 255 |
| `degree` | no | max 100 |
| `startDate` | yes | `YYYY-MM-DD` |
| `endDate` | no | `YYYY-MM-DD` hoặc null; nếu `isCurrent=true` → phải null |
| `isCurrent` | no | boolean, default false |
| `description` | no | text |

**Response list 200**

```json
{
  "success": true,
  "message": "Thành công",
  "data": [
    {
      "id": "1",
      "candidateId": "1",
      "school": "PTIT",
      "major": "CNTT",
      "degree": "Cử nhân",
      "startDate": "2020-09-01",
      "endDate": null,
      "isCurrent": true,
      "description": null,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

**Errors:** `400`, `401`, `403`, `404` (id không thuộc profile), `500`

---

### 1.4 Work experiences CRUD

| Method | URL |
|--------|-----|
| `GET` | `/api/v1/candidate-profiles/me/work-experiences` |
| `POST` | `/api/v1/candidate-profiles/me/work-experiences` |
| `PUT` | `/api/v1/candidate-profiles/me/work-experiences/{id}` |
| `DELETE` | `/api/v1/candidate-profiles/me/work-experiences/{id}` |

**Request POST/PUT**

```json
{
  "companyName": "ABC Corp",
  "position": "Intern Backend",
  "startDate": "2024-06-01",
  "endDate": "2024-12-01",
  "isCurrent": false,
  "description": "API + TypeORM"
}

```

| Field | Required |
|-------|----------|
| `companyName` | yes |
| `position` | yes |
| `startDate` | yes (`YYYY-MM-DD`) |
| `endDate` | no; `isCurrent=true` → null |
| `isCurrent` | no |
| `description` | no |

**Errors:** giống educations.

---

### 1.5 Skills catalog + candidate skills (Lợi)

Schema:

- `skills`: catalog (`name`, `category`: `SKILL|LANGUAGE|CERTIFICATE`, `code` optional cho language, `status`)
- `candidate_skills`: (`candidateId`, `skillId`, `level`)
- `level`: `BEGINNER|INTERMEDIATE|ADVANCED|EXPERT|NATIVE` (`NATIVE` chủ yếu cho LANGUAGE)

| Method | URL | Quyền | Mô tả |
|--------|-----|-------|--------|
| `GET` | `/api/v1/skills?category=SKILL` | Public hoặc authenticated | Catalog |
| `POST` | `/api/v1/skills` | `ADMIN` *(hoặc seed-only — chốt với G4)* | Thêm catalog |
| `GET` | `/api/v1/skills/me` | `CANDIDATE` | Skills đã gắn |
| `POST` | `/api/v1/skills/me` | `CANDIDATE` | Gắn skill |
| `PUT` | `/api/v1/skills/me/{id}` | `CANDIDATE` | Đổi level (`id` = `candidate_skills.id`) |
| `DELETE` | `/api/v1/skills/me/{id}` | `CANDIDATE` | Gỡ |

**POST `/skills/me` body**

```json
{
  "skillId": "5",
  "level": "INTERMEDIATE"
}
```

**Conflict:** cùng `candidateId + skillId` → `409`.

**Response item**

```json
{
  "id": "12",
  "candidateId": "1",
  "skillId": "5",
  "level": "INTERMEDIATE",
  "skill": {
    "id": "5",
    "name": "TypeScript",
    "category": "SKILL",
    "code": null
  }
}
```

---

## 2. Option A1 (theo brief) — Gom `/candidates/me`

Nếu Leader chọn A1:

| Method | URL |
|--------|-----|
| `GET` | `/api/v1/candidates/me` |
| `PUT` | `/api/v1/candidates/me` |

**GET `data` (ví dụ)**

```json
{
  "id": "1",
  "userId": "10",
  "bio": "...",
  "careerObjective": "...",
  "educations": [],
  "workExperiences": [],
  "skills": [],
  "languages": [],
  "certificates": []
}
```

> `languages` / `certificates` = filter `candidate_skills` theo `skill.category` (không phải bảng riêng).

**PUT:** cần chốt thêm — replace toàn bộ nested hay chỉ update `bio` / `careerObjective`?  
Khuyến nghị A1 chỉ **đọc gom**; ghi nested vẫn dùng endpoint A2 để tránh payload nguy hiểm.

---

## 3. Ranh giới với Group 1

| Field | API |
|-------|-----|
| fullName, phone, birthday, address, avatar | `GET/PUT /api/v1/users/me` (G1) |
| bio, careerObjective, education, experience, skills | Group 3 (doc này) |

FE trang “Hồ sơ ứng viên” có thể gọi **cả hai**.

---

## 4. Draft stub ≠ contract

Thư mục `apps/backend/src/modules/candidate-profiles|skills` trên branch feature chỉ là skeleton.  
**URL / envelope / validation trong doc này mới là đề xuất chính thức** sau khi Leader approve.
