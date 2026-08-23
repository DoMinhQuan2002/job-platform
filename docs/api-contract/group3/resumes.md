# API Contract — Resumes (Group 3)

> Owner doc: **Nguyễn Văn Lợi**  
> Status: **Draft GĐ2**.  
> Schema: `resumes` (`candidate_id`, `file_name`, `file_url`, `file_size`, `mime_type`, `is_default`, soft delete `deleted_at`).

Envelope / HTTP status dùng chung: xem [readme.md](./readme.md).

Storage private, `assetType=resume` (PDF, max 10MB): xem `apps/backend/STORAGE_API.md`.  
Upload CV **không** bắt FE gọi `POST /media/uploads` trước — `POST /resumes` multipart tự upload nội bộ rồi ghi DB (1 request).

---

## Notes

- **Identity (khớp [candidates.md](./candidates.md)):** `req.user.id` (`users.id`) → `candidate_profiles.user_id` → `resumes.candidate_id` = `candidate_profiles.id`.
- **Không nằm trong** `GET /candidates/me` — CV quản lý riêng qua `/api/v1/resumes` (giống educations/skills: không PUT nested vào profile).
- **Apply (khớp [applications.md](./applications.md)):** `POST /jobs/{jobId}/apply` nhận `resumeId` (hoặc CV `isDefault`); `resume_snapshot_url` copy `fileUrl` (= `storagePath`) lúc apply.
- **Không chồng G1/G2 media:** avatar / logo / icon vẫn `POST /api/v1/media/uploads` + `assetType` tương ứng. Resume = endpoint riêng; xem/tải lại dùng `GET /api/v1/media/access`.

---

## 0. Map Brief → Contract

| Brief | Contract |
| ----- | -------- |
| `POST /api/resumes` | **`POST /api/v1/resumes`** (multipart) |
| `GET /api/resumes` | **`GET /api/v1/resumes`** — CV của candidate hiện tại |
| `GET /api/resumes/{id}` | **`GET /api/v1/resumes/{id}`** — owner only |
| `DELETE /api/resumes/{id}` | **`DELETE /api/v1/resumes/{id}`** |

### Quy ước file

| Rule | Value |
| ---- | ----- |
| MIME | `application/pdf` only |
| Max size | **10MB** (khớp media catalog `resume`) |
| `fileUrl` (cột DB `file_url`) | lưu **`storagePath`** (vd. `resumes/<uuid>.pdf`), **không** lưu signed URL dài hạn |
| Lấy URL xem/tải | `GET /api/v1/media/access?storagePath=...&assetType=resume` → signed URL có hạn |
| Default CV | đúng 1 `is_default=true` / candidate; set default → clear default cũ |
| Tên file | `fileName` gốc từ client (max 255); object name trên storage do backend generate |

---

## 1. List my resumes

| | |
| -- | -- |
| Method / URL | `GET /api/v1/resumes` |
| Quyền | `CANDIDATE` |

Chỉ trả CV chưa soft-delete của candidate hiện tại. Sort đề xuất: `isDefault` desc, rồi `createdAt` desc.

**Response 200**

```json
{
  "success": true,
  "message": "Thành công",
  "data": [
    {
      "id": "1",
      "candidateId": "1",
      "fileName": "CV_NguyenVanA.pdf",
      "fileUrl": "resumes/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.pdf",
      "fileSize": 245678,
      "mimeType": "application/pdf",
      "isDefault": true,
      "createdAt": "2026-08-21T00:00:00.000Z",
      "updatedAt": "2026-08-21T00:00:00.000Z"
    }
  ]
}
```

**Errors:** `401`, `403`, `500`

---

## 2. Get resume by id

| | |
| -- | -- |
| Method / URL | `GET /api/v1/resumes/{id}` |
| Quyền | `CANDIDATE` (owner) |

Recruiter xem CV đã apply qua application snapshot — **không** qua API này.

**Response 200:** một object cùng shape item list (§1).  
**Errors:** `401`, `403`, `404`, `500`

---

## 3. Upload & create resume

| | |
| -- | -- |
| Method / URL | `POST /api/v1/resumes` |
| Quyền | `CANDIDATE` |
| Content-Type | `multipart/form-data` |

**Request**

| Field | Required | Validation |
| ----- | -------- | ---------- |
| `file` | yes | `application/pdf`, max **10MB** |

Backend trong **1 request**:

1. Validate MIME / size  
2. Upload private bucket (`assetType=resume`) qua storage nội bộ  
3. Insert `resumes` (`fileName` từ `file.originalname`, `fileUrl` = `storagePath`, `fileSize`, `mimeType`)  
4. CV đầu tiên của candidate → `isDefault = true`; các lần sau → `isDefault = false` (đổi default bằng §4)

**Response 201:** object resume trong `data` (shape §1).

**Errors:** `400` (thiếu file / sai MIME / quá size), `401`, `403`, `500`

---

## 4. Set default

Brief không liệt kê — cần cho UX “CV mặc định khi apply” ([applications.md](./applications.md)).

| | |
| -- | -- |
| Method / URL | `PUT /api/v1/resumes/{id}/default` |
| Quyền | `CANDIDATE` (owner) |
| Request | empty body |
| Response | `200` + resume đã thành default |

Logic: set `isDefault=true` cho `{id}` → clear `isDefault` các CV khác cùng candidate.

Alternative nếu Leader không muốn URL riêng: `PUT /api/v1/resumes/{id}` body `{ "isDefault": true }`.

**Errors:** `401`, `403`, `404`, `500`

---

## 5. Delete resume

| | |
| -- | -- |
| Method / URL | `DELETE /api/v1/resumes/{id}` |
| Quyền | `CANDIDATE` (owner) |
| Response | `200` + `{ "success": true, "message": "Thành công", "data": null }` *(hoặc `204` nếu Leader chốt envelope không body)* |

Logic:

1. Soft delete row (`deleted_at`)  
2. Xóa object storage (`storagePath` + `assetType=resume`) — nội bộ, không bắt FE gọi `DELETE /media`  
3. Nếu CV đang default bị xóa → promote CV còn lại mới nhất làm default (nếu còn)

Application đã apply giữ `resume_id` + `resume_snapshot_url`; soft delete CV **không** xóa lịch sử đơn.

**Errors:** `401`, `403`, `404`, `500`

---

## 6. Stub ≠ contract

Stub nội bộ `/resumes/me/...` (nếu còn) **không** phải contract. Public API dùng bảng map §0 sau khi Leader duyệt.
