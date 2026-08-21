# API Contract — Resumes (Group 3)

> Owner doc: **Nguyễn Văn Lợi**  
> Status: **Draft GĐ2 — chờ Leader duyệt**.

Schema: `resumes` (`candidate_id`, `file_name`, `file_url`, `file_size`, `mime_type`, `is_default`, soft delete `deleted_at`).

Storage: private bucket, assetType `resume` — xem `apps/backend/STORAGE_API.md`.

---

## 0. Map Brief ↔ Schema / Draft

| Brief                      | Schema / storage                      | Đề xuất contract                                                           |
| -------------------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| `POST /api/resumes`        | insert `resumes` + file trên Supabase | **`POST /api/v1/resumes`** |
| `GET /api/resumes`         | list theo `candidate_id`              | **`GET /api/v1/resumes`** = CV của candidate hiện tại                      |
| `GET /api/resumes/{id}`    | 1 row + ownership                     | Có                                                                         |
| `DELETE /api/resumes/{id}` | soft delete + xóa file storage        | **`DELETE /api/v1/resumes/{id}`**                                          |

### Quy ước file (đề xuất chốt)

| Rule              | Value                                                                              |
| ----------------- | ---------------------------------------------------------------------------------- |
| MIME              | `application/pdf` only                                                             |
| Max size          | **10MB** (khớp media catalog)                                                      |
| `file_url` cột DB | lưu **`storagePath`** (vd. `resumes/<uuid>.pdf`), **không** lưu signed URL dài hạn |
| Lấy URL xem/tải   | `GET /api/v1/access?storagePath=...&assetType=resume` → signed URL có hạn    |
| Default CV        | đúng 1 `is_default=true` / candidate; set default → clear default cũ               |
| Tên file          | `fileName` gốc từ client (max 255); object name trên storage do backend generate   |

Flow upload chính thức:

```http
POST /api/v1/resumes
Content-Type: multipart/form-data

file: <binary_pdf_file>
```

*(Backend sẽ tự động xử lý upload file lên Supabase Storage và trích xuất các metadata như tên file, kích thước, định dạng để lưu vào Database trong cùng 1 request).*

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

## 3. Upload & Create Resume

|              |                        |
| ------------ | ---------------------- |
| Method / URL | `POST /api/v1/resumes` |
| Quyền        | `CANDIDATE`            |

**Request:** `multipart/form-data`

| Field  | Required | Validation                                                       |
| ------ | -------- | ---------------------------------------------------------------- |
| `file` | yes      | File định dạng `application/pdf`, kích thước tối đa **10MB** |

*(Backend sẽ tự động trích xuất `fileName`, `fileSize`, `mimeType`, đẩy file lên Supabase và tự động thiết lập `isDefault = true` nếu đây là CV đầu tiên tải lên).*

**Response 201:** object resume trong `data`.  
**Errors:** `400` (BAD_REQUEST, INVALID_FILE_TYPE, FILE_TOO_LARGE, QUOTA_EXCEEDED), `401`, `403`, `500`

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

1. Soft delete row (`deleted_at` ở DB)
2. Backend tự động gọi SDK nội bộ để xóa file vật lý trên Supabase
3. Nếu CV bị xóa đang là Default → Backend sẽ tự động chỉ định CV mới nhất còn lại làm Default.

**Errors:** `401`, `403`, `404`; nếu resume đang bị application FK chặn hard-delete → soft delete vẫn OK vì schema dùng soft delete.

---

## 6. Draft stub ≠ contract

Stub `modules/resumes` (`/resumes/me/...`) là draft. Contract chính thức dùng bảng map mục 0 sau khi Leader duyệt.
