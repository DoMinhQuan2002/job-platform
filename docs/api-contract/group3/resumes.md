# API Contract — Resumes (Group 3)

> Owner doc: **Nguyễn Văn Lợi**  
> Status: **Draft GĐ2 — chờ Leader duyệt**.

Schema: `resumes` (`candidate_id`, `file_name`, `file_url`, `file_size`, `mime_type`, `is_default`, soft delete `deleted_at`).

Storage: private bucket, assetType `resume` — xem `apps/backend/STORAGE_API.md`.

---

## 0. Map Brief ↔ Schema / Draft

| Brief                      | Schema / storage                      | Draft stub                       | Đề xuất contract                                                           |
| -------------------------- | ------------------------------------- | -------------------------------- | -------------------------------------------------------------------------- |
| `POST /api/resumes`        | insert `resumes` + file trên Supabase | `POST /api/v1/resumes/me`        | **`POST /api/v1/resumes`** (bám brief, bỏ `/me` nếu list cũng là của mình) |
| `GET /api/resumes`         | list theo `candidate_id`              | `GET /api/v1/resumes/me`         | **`GET /api/v1/resumes`** = CV của candidate hiện tại                      |
| `GET /api/resumes/{id}`    | 1 row + ownership                     | _(chưa có trong stub)_           | Có                                                                         |
| `DELETE /api/resumes/{id}` | soft delete + xóa file storage        | `DELETE /api/v1/resumes/me/{id}` | **`DELETE /api/v1/resumes/{id}`**                                          |

### Quy ước file (đề xuất chốt)

| Rule              | Value                                                                              |
| ----------------- | ---------------------------------------------------------------------------------- |
| MIME              | `application/pdf` only                                                             |
| Max size          | **10MB** (khớp media catalog)                                                      |
| `file_url` cột DB | lưu **`storagePath`** (vd. `resumes/<uuid>.pdf`), **không** lưu signed URL dài hạn |
| Lấy URL xem/tải   | `GET /api/v1/media/access?storagePath=...&assetType=resume` → signed URL có hạn    |
| Default CV        | đúng 1 `is_default=true` / candidate; set default → clear default cũ               |
| Tên file          | `fileName` gốc từ client (max 255); object name trên storage do backend generate   |

Flow upload khuyến nghị:

```
1) POST /api/v1/media/uploads  (multipart, assetType=resume)
   → { storagePath, url(signed tạm), size, mimeType, fileName }
2) POST /api/v1/resumes
   body: { fileName, fileUrl: storagePath, fileSize, mimeType, isDefault? }
```

_(Alternative: `POST /resumes` nhận multipart và gọi storage nội bộ — cần Leader chọn 1 flow để FE khỏi lệch.)_

---

## 1. List my resumes

|              |                       |
| ------------ | --------------------- |
| Method / URL | `GET /api/v1/resumes` |
| Quyền        | `CANDIDATE`           |

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

---

## 2. Get resume by id

|              |                                                                                                       |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| Method / URL | `GET /api/v1/resumes/{id}`                                                                            |
| Quyền        | `CANDIDATE` (owner) — _Recruiter xem snapshot qua application, không qua API này (chốt thêm nếu cần)_ |

**Errors:** `401`, `403`, `404`

---

## 3. Create resume metadata

|              |                        |
| ------------ | ---------------------- |
| Method / URL | `POST /api/v1/resumes` |
| Quyền        | `CANDIDATE`            |

**Request**

```json
{
  "fileName": "CV_NguyenVanA.pdf",
  "fileUrl": "resumes/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.pdf",
  "fileSize": 245678,
  "mimeType": "application/pdf",
  "isDefault": true
}
```

| Field       | Required | Validation                                     |
| ----------- | -------- | ---------------------------------------------- |
| `fileName`  | yes      | max 255                                        |
| `fileUrl`   | yes      | storagePath đã upload                          |
| `fileSize`  | yes      | 1…10MB                                         |
| `mimeType`  | yes      | `application/pdf`                              |
| `isDefault` | no       | default `false`; nếu `true` → unset default cũ |

**Response 201:** object resume trong `data`.  
**Errors:** `400`, `401`, `403`, `409` (optional), `500`

---

## 4. Set default (đề xuất bổ sung so với brief)

Brief không liệt kê riêng. Cần cho UX “chọn CV mặc định khi apply”.

|              |                                    |
| ------------ | ---------------------------------- |
| Method / URL | `PUT /api/v1/resumes/{id}/default` |
| Quyền        | `CANDIDATE`                        |
| Request      | — (empty body)                     |
| Response     | `200` + resume                     |

Nếu Leader không muốn endpoint riêng: cho phép `PUT /api/v1/resumes/{id}` với `{ "isDefault": true }`.

---

## 5. Delete resume

|              |                               |
| ------------ | ----------------------------- |
| Method / URL | `DELETE /api/v1/resumes/{id}` |
| Quyền        | `CANDIDATE` (owner)           |
| Response     | `204` hoặc `200` + message    |

Logic:

1. Soft delete row (`deleted_at`)
2. `DELETE /api/v1/media` với `storagePath` + `assetType=resume`
3. Nếu xóa CV default → có thể promote CV còn lại gần nhất (optional — chốt)

**Errors:** `401`, `403`, `404`; nếu resume đang bị application FK chặn hard-delete → soft delete vẫn OK vì schema dùng soft delete.

---

## 6. Draft stub ≠ contract

Stub `modules/resumes` (`/resumes/me/...`) là draft. Contract chính thức dùng bảng map mục 0 sau khi Leader duyệt.
