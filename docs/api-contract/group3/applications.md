# API Contract — Applications & Saved Jobs (Group 3)

> Owner doc: **Nguyễn Văn Mạnh**  
> Status: **Draft GĐ2 — chờ Leader duyệt**.

Schema:

- `applications` (`candidate_id`, `job_id`, unique cặp; `resume_id`; `resume_snapshot_url`; `status`; `applied_at`)
- `saved_jobs` (`candidate_id`, `job_id`, unique)

Enum `ApplicationStatus`:  
`APPLIED` → `VIEWED` → `INTERVIEW` → `ACCEPTED` | `REJECTED`  
(+ `WITHDRAWN` — candidate rút đơn; có trong DB).

---

## 0. Map Brief ↔ Schema / Draft

| Brief | Schema | Draft stub | Đề xuất contract |
|-------|--------|------------|------------------|
| `POST /api/jobs/{jobId}/apply` | insert `applications` | `POST /api/v1/applications` | **B1: `POST /api/v1/jobs/{jobId}/apply`** |
| `GET /api/applications` | list theo candidate (hoặc filter recruiter) | `GET /api/v1/applications/me` | **`GET /api/v1/applications`** + query theo role |
| `GET /api/applications/{id}` | 1 application + ownership | `GET /api/v1/applications/me/{id}` | **`GET /api/v1/applications/{id}`** |
| `PUT /api/applications/{id}/status` | update status (recruiter) | *(chưa có)* | Có — **recruiter only** |
| `POST /api/jobs/{jobId}/save` | insert `saved_jobs` | `POST /api/v1/saved-jobs` | **`POST /api/v1/jobs/{jobId}/save`** |
| `DELETE /api/jobs/{jobId}/save` | delete saved | `DELETE /api/v1/saved-jobs/{jobId}` | **`DELETE /api/v1/jobs/{jobId}/save`** |

`job_id` hiện **logical FK** (chưa DB FK) — vẫn validate job tồn tại khi Group 2 sẵn sàng.

`resume_snapshot_url`: copy `storagePath` (hoặc snapshot path) lúc apply — không phụ thuộc user xóa/sửa CV sau.

---

## 1. Apply to job

| | |
|--|--|
| Tên | Ứng tuyển một tin |
| Method / URL | `POST /api/v1/jobs/{jobId}/apply` |
| Quyền | `CANDIDATE` |

**Request**

```json
{
  "resumeId": "1"
}
```

| Field | Required | Validation |
|-------|----------|------------|
| `resumeId` | yes* | Thuộc candidate hiện tại, chưa soft-deleted. *Nếu omit → dùng CV `is_default=true`; không có default → `400` |
| `jobId` | path | Job đang mở / được phép apply (rule chốt với G2) |

**Response 201**

```json
{
  "success": true,
  "message": "Ứng tuyển thành công",
  "data": {
    "id": "99",
    "candidateId": "1",
    "jobId": "50",
    "resumeId": "1",
    "resumeSnapshotUrl": "resumes/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.pdf",
    "status": "APPLIED",
    "appliedAt": "2026-08-21T04:00:00.000Z",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors**

| Status | Khi |
|--------|-----|
| 400 | Thiếu resume / job đóng |
| 401 / 403 | Auth / role |
| 404 | job hoặc resume không tồn tại |
| 409 | Đã apply job này (`unique candidate_id + job_id`) |

---

## 2. List applications

| | |
|--|--|
| Method / URL | `GET /api/v1/applications` |
| Quyền | `CANDIDATE` hoặc `RECRUITER` |

**Query (đề xuất)**

| Param | Ai dùng | Note |
|-------|---------|------|
| `status` | cả hai | filter enum |
| `jobId` | recruiter | đơn của 1 tin |
| `page`, `limit` | cả hai | optional |

**Behavior**

- `CANDIDATE`: chỉ đơn của `candidate_profiles` gắn `req.user.id`
- `RECRUITER`: chỉ đơn thuộc job của company mình (rule chi tiết chốt G2)

**Response 200:** `data` = array (hoặc `{ items, meta }` — chốt 1 kiểu với toàn dự án).

---

## 3. Get application detail

| | |
|--|--|
| Method / URL | `GET /api/v1/applications/{id}` |
| Quyền | Owner candidate **hoặc** recruiter của job đó |

**Errors:** `401`, `403`, `404`

---

## 4. Update application status (Recruiter)

| | |
|--|--|
| Method / URL | `PUT /api/v1/applications/{id}/status` |
| Quyền | `RECRUITER` (đúng company/job) — **Candidate không được gọi** |

**Request**

```json
{
  "status": "VIEWED"
}
```

### Transition cho phép (đề xuất)

```
APPLIED → VIEWED → INTERVIEW → ACCEPTED
                              → REJECTED
APPLIED → REJECTED          (optional short-circuit)
VIEWED  → REJECTED
INTERVIEW → ACCEPTED | REJECTED
```

- Không cho nhảy ngược (vd. `REJECTED` → `INTERVIEW`) → `400` hoặc `409`
- Candidate rút đơn: endpoint riêng (dưới) → `WITHDRAWN`, không dùng API status này

**Response 200:** application đã cập nhật.  
**Errors:** `400` (transition sai), `401`, `403`, `404`

---

## 5. Withdraw (đề xuất bổ sung)

Brief không ghi rõ; DB có `WITHDRAWN`.

| | |
|--|--|
| Method / URL | `DELETE /api/v1/applications/{id}` hoặc `POST /api/v1/applications/{id}/withdraw` |
| Quyền | `CANDIDATE` (owner) |
| Rule | Chỉ khi status ∈ { `APPLIED`, `VIEWED` } (chốt) |

Draft stub đang dùng `DELETE /applications/me/{id}` ≈ withdraw.

---

## 6. Save / unsave job

| Method | URL | Quyền |
|--------|-----|-------|
| `POST` | `/api/v1/jobs/{jobId}/save` | `CANDIDATE` |
| `DELETE` | `/api/v1/jobs/{jobId}/save` | `CANDIDATE` |

**POST body:** empty.  
**POST 201:** saved row (hoặc `200` nếu idempotent “đã save”).  
**DELETE 204:** unsave; nếu chưa save → `404` hoặc idempotent `204` (chốt).

**List saved (bổ sung — FE cần)**

| Method | URL |
|--------|-----|
| `GET` | `/api/v1/saved-jobs` hoặc `/api/v1/jobs/saved` |

Brief không liệt kê list; **cần** cho trang “Việc đã lưu”. Đề xuất: `GET /api/v1/saved-jobs`.

**409** nếu save trùng (hoặc trả 200 idempotent).

---

## 7. Mount note cho Backend GĐ3

Endpoints `POST/DELETE /jobs/{jobId}/apply|save` có thể:

- khai báo trong `modules/jobs` rồi delegate sang `applicationsService` / `savedJobsService`, **hoặc**
- mount router phụ trên `/jobs`

Tránh nhân đôi business logic.

---

## 8. Draft stub ≠ contract

`modules/applications` + `modules/saved-jobs` hiện là skeleton.  
URL brief (B1) là đề xuất chính; stub B2 chỉ tham khảo nội bộ.