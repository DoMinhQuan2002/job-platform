# API Contract — Candidates (Group 3)

> Owner: **Nguyễn Thanh Bình** (candidate + educations + work experiences) + **Nguyễn Văn Lợi** (skills).  
> Status: **Draft GĐ2**.  
> Schema **không đổi**: `candidate_profiles`, `educations`, `work_experiences`, `skills`, `candidate_skills`.

Envelope / HTTP status dùng chung: xem [readme.md](./readme.md) §8 brief.

**Error mẫu (mọi API dưới đây):**

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [{ "field": "bio", "message": "bio must be a string or null" }]
}
```


| Status | Khi                                                |
| ------ | -------------------------------------------------- |
| 200    | Thành công (GET/PUT/DELETE)                        |
| 201    | Tạo mới (POST)                                     |
| 400    | Validation                                         |
| 401    | Chưa đăng nhập / token lỗi                         |
| 403    | Không phải `CANDIDATE` (trừ catalog skills)        |
| 404    | Không tìm thấy hoặc không thuộc candidate hiện tại |
| 409    | Trùng unique                                       |
| 500    | Lỗi hệ thống                                       |


---

## Notes

Quyết định URL / PUT không replace nested: xem [readme.md](./readme.md) § Quyết định thiết kế (A1).

- **Identity:** `req.user.id` (`users.id`) → `candidate_profiles.user_id` → bảng con dùng `candidate_id` = `candidate_profiles.id`.
- **GET lần đầu:** tạo `candidate_profiles` nếu chưa có (`bio` / `careerObjective` = null).
- **Không chồng G1:** account (`fullName`, `phone`, avatar…) = `GET/PATCH /api/v1/users/me`. Hồ sơ nghề nghiệp (`bio`, `careerObjective`, nested) = G3. FE trang hồ sơ gọi **cả hai**; không trộn field.

---

## 1. GET hồ sơ ứng viên (aggregate)


|               |                                                    |
| ------------- | -------------------------------------------------- |
| Tên chức năng | Lấy hồ sơ nghề nghiệp của candidate đang đăng nhập |
| URL           | `/api/v1/candidates/me`                            |
| Method        | `GET`                                              |
| Quyền         | `CANDIDATE`                                        |
| Request       | Không body. Không query bắt buộc.                  |
| Validation    | Phải đăng nhập; role `CANDIDATE`                   |


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
    "educations": [
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
        "createdAt": "2026-08-21T00:00:00.000Z",
        "updatedAt": "2026-08-21T00:00:00.000Z"
      }
    ],
    "workExperiences": [
      {
        "id": "1",
        "candidateId": "1",
        "companyName": "ABC Corp",
        "position": "Intern Backend",
        "startDate": "2024-06-01",
        "endDate": "2024-12-01",
        "isCurrent": false,
        "description": "API + TypeORM",
        "createdAt": "2026-08-21T00:00:00.000Z",
        "updatedAt": "2026-08-21T00:00:00.000Z"
      }
    ],
    "skills": [
      {
        "id": "12",
        "candidateId": "1",
        "skillId": "5",
        "level": "INTERMEDIATE",
        "skill": {
          "id": "5",
          "name": "TypeScript",
          "category": "SKILL",
          "code": null,
          "description": null,
          "status": "ACTIVE"
        }
      }
    ],
    "languages": [],
    "certificates": [],
    "createdAt": "2026-08-21T00:00:00.000Z",
    "updatedAt": "2026-08-21T00:00:00.000Z"
  }
}
```

`skills` / `languages` / `certificates` = `candidate_skills` JOIN `skills`, filter `skills.category` = `SKILL` | `LANGUAGE` | `CERTIFICATE`. Không phải bảng riêng.

**Lỗi:** `401`, `403`, `500` — envelope error ở đầu file.

---

## 2. PUT hồ sơ nghề nghiệp (text only)


|               |                                     |
| ------------- | ----------------------------------- |
| Tên chức năng | Cập nhật bio / mục tiêu nghề nghiệp |
| URL           | `/api/v1/candidates/me`             |
| Method        | `PUT`                               |
| Quyền         | `CANDIDATE`                         |


**Request**

```json
{
  "bio": "Fresher backend",
  "careerObjective": "Backend engineer"
}
```


| Field                                                                      | Type          | Required | Validation                                                         |
| -------------------------------------------------------------------------- | ------------- | -------- | ------------------------------------------------------------------ |
| `bio`                                                                      | string | null | không    | Omit = không đổi; `null` = clear; nếu gửi phải là string hoặc null |
| `careerObjective`                                                          | string | null | không    | Tương tự                                                           |
| `educations` / `workExperiences` / `skills` / `languages` / `certificates` | —             | **cấm**  | Có mặt → `400`                                                     |


**Response 200:** cùng shape `data` như GET (nested hiện tại, không bị xóa).

**Lỗi:** `400` (kiểu sai / gửi nested), `401`, `403`, `500`.

---

## 3. Educations

Bảng `educations`. Mọi thao tác filter `candidateId` của user hiện tại.

### 3.1 List


|            |                                    |
| ---------- | ---------------------------------- |
| Tên        | Danh sách học vấn                  |
| URL        | `/api/v1/candidates/me/educations` |
| Method     | `GET`                              |
| Quyền      | `CANDIDATE`                        |
| Request    | —                                  |
| Validation | Đăng nhập, role `CANDIDATE`        |


**Response 200:** `{ "success": true, "message": "Thành công", "data": [ ...education ] }` (shape item như GET `/me` → `educations[]`).

### 3.2 Create


|        |                                    |
| ------ | ---------------------------------- |
| Tên    | Thêm học vấn                       |
| URL    | `/api/v1/candidates/me/educations` |
| Method | `POST`                             |
| Quyền  | `CANDIDATE`                        |


**Request**

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


| Field         | Required | Validation (đúng cột DB)                             |
| ------------- | -------- | ---------------------------------------------------- |
| `school`      | yes      | string, max 255                                      |
| `major`       | no       | string, max 255                                      |
| `degree`      | no       | string, max 100                                      |
| `startDate`   | yes      | `YYYY-MM-DD`                                         |
| `endDate`     | no       | `YYYY-MM-DD` hoặc null; `isCurrent=true` → phải null |
| `isCurrent`   | no       | boolean, default `false`                             |
| `description` | no       | text                                                 |


**Response 201:** `{ "success": true, "message": "Thành công", "data": { ...education } }`.

**Lỗi:** `400`, `401`, `403`, `500`.

### 3.3 Update


|            |                                                             |
| ---------- | ----------------------------------------------------------- |
| Tên        | Sửa học vấn                                                 |
| URL        | `/api/v1/candidates/me/educations/{id}`                     |
| Method     | `PUT`                                                       |
| Quyền      | `CANDIDATE`                                                 |
| Request    | Giống POST, partial: field omit = không đổi                 |
| Validation | `{id}` thuộc `candidateId` hiện tại; rule ngày giống create |


**Response 200:** `{ "success": true, "message": "Thành công", "data": { ...education } }`.

**Lỗi:** `400`, `401`, `403`, `404`, `500`.

### 3.4 Delete


|            |                                         |
| ---------- | --------------------------------------- |
| Tên        | Xóa học vấn                             |
| URL        | `/api/v1/candidates/me/educations/{id}` |
| Method     | `DELETE`                                |
| Quyền      | `CANDIDATE`                             |
| Request    | —                                       |
| Validation | `{id}` thuộc candidate hiện tại         |


**Response 200** (theo brief, không dùng 204):

```json
{
  "success": true,
  "message": "Thành công",
  "data": null
}
```

**Lỗi:** `401`, `403`, `404`, `500`.

---

## 4. Work experiences

Bảng `work_experiences`. Ownership giống educations.

### 4.1 List — `GET /api/v1/candidates/me/work-experiences`

Quyền `CANDIDATE`. **Response 200:** `data` = mảng item như GET `/me` → `workExperiences[]`.

### 4.2 Create — `POST /api/v1/candidates/me/work-experiences`

**Request**

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


| Field         | Required | Validation                                           |
| ------------- | -------- | ---------------------------------------------------- |
| `companyName` | yes      | string, max 255                                      |
| `position`    | yes      | string, max 255                                      |
| `startDate`   | yes      | `YYYY-MM-DD`                                         |
| `endDate`     | no       | `YYYY-MM-DD` hoặc null; `isCurrent=true` → phải null |
| `isCurrent`   | no       | boolean, default `false`                             |
| `description` | no       | text                                                 |


**Response 201:** `{ "success": true, "message": "Thành công", "data": { ...workExperience } }`.

**Lỗi:** `400`, `401`, `403`, `500`.

### 4.3 Update — `PUT /api/v1/candidates/me/work-experiences/{id}`

Quyền `CANDIDATE`. Partial. Ownership bắt buộc.

**Response 200:** `{ "success": true, "message": "Thành công", "data": { ...workExperience } }`.

**Lỗi:** `400`, `401`, `403`, `404`, `500`.

### 4.4 Delete — `DELETE /api/v1/candidates/me/work-experiences/{id}`

**Response 200:** `{ "success": true, "message": "Thành công", "data": null }`.

**Lỗi:** `401`, `403`, `404`, `500`.

---

## 5. Skills (Lợi) — catalog + gắn vào candidate

Bảng `skills` (`name` varchar 100, `category` `SKILL|LANGUAGE|CERTIFICATE`, `code` varchar 10 nullable, `description` text nullable, `status` default `ACTIVE`).  
Bảng `candidate_skills` unique `(candidateId, skillId)`, `level`: `BEGINNER|INTERMEDIATE|ADVANCED|EXPERT|NATIVE`.

`GET /candidates/me` đã trả skill đã gắn. `/skills/me` dùng khi FE sửa từng dòng, không PUT vào `/candidates/me`.

### 5.1 List catalog — `GET /api/v1/skills?category=SKILL`


|       |                                                           |
| ----- | --------------------------------------------------------- |
| Tên   | Danh mục skill / ngôn ngữ / chứng chỉ                     |
| Quyền | Public hoặc đã đăng nhập                                  |
| Query | `category` optional: `SKILL` | `LANGUAGE` | `CERTIFICATE` |


**Response 200:** `{ "success": true, "message": "Thành công", "data": [ { "id", "name", "category", "code", "description", "status" } ] }`.

**Lỗi:** `400` (category sai), `500`.

### 5.2 Create catalog — `POST /api/v1/skills`


|       |                               |
| ----- | ----------------------------- |
| Quyền | `ADMIN` (hoặc seed — chốt G4) |


**Request**

```json
{
  "name": "TypeScript",
  "category": "SKILL",
  "code": null,
  "description": null
}
```


| Field         | Required | Validation                           |
| ------------- | -------- | ------------------------------------ |
| `name`        | yes      | max 100                              |
| `category`    | yes      | `SKILL` | `LANGUAGE` | `CERTIFICATE` |
| `code`        | no       | max 10; dùng cho LANGUAGE (vd. `EN`) |
| `description` | no       | text                                 |


**Response 201:** `{ "success": true, "message": "Thành công", "data": { ...skill } }`.

**Lỗi:** `400`, `401`, `403`, `409` (nếu sau này unique name+category), `500`.

### 5.3 List mine — `GET /api/v1/skills/me`

Quyền `CANDIDATE`. **Response 200:** `data` = mảng cùng shape item trong GET `/candidates/me` → `skills` (có thể gồm cả 3 category).

### 5.4 Attach — `POST /api/v1/skills/me`

Quyền `CANDIDATE`.

**Request**

```json
{
  "skillId": "5",
  "level": "INTERMEDIATE"
}
```


| Field     | Required | Validation                             |
| --------- | -------- | -------------------------------------- |
| `skillId` | yes      | tồn tại trên `skills`, `status=ACTIVE` |
| `level`   | yes      | enum `SkillLevel`                      |


**Response 201:** `{ "success": true, "message": "Thành công", "data": { ...candidateSkill + skill } }`.

**Lỗi:** `400`, `401`, `403`, `404` (skill không tồn tại), `409` (đã gắn), `500`.

### 5.5 Update level — `PUT /api/v1/skills/me/{id}`

`{id}` = `candidate_skills.id`. Quyền `CANDIDATE`. Body: `{ "level": "ADVANCED" }`.

**Response 200:** item đã cập nhật.  
**Lỗi:** `400`, `401`, `403`, `404`, `500`.

### 5.6 Detach — `DELETE /api/v1/skills/me/{id}`

**Response 200:** `{ "success": true, "message": "Thành công", "data": null }`.  
**Lỗi:** `401`, `403`, `404`, `500`.

---


