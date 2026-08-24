# API Contract — Applications & Saved Jobs (Group 3)

> Owner doc: **Nguyễn Văn Mạnh**  
> Status: **Draft GĐ2**.

Schema:

- `applications` (`candidate_id`, `job_id` unique cặp; `resume_id`; `resume_snapshot_url`; `status`; `applied_at`)
- `saved_jobs` (`candidate_id`, `job_id` unique)

Enum `ApplicationStatus` (DB):  
`APPLIED` | `VIEWED` | `INTERVIEW` | `ACCEPTED` | `REJECTED` | `WITHDRAWN`

Envelope / HTTP status dùng chung: xem [readme.md](./readme.md).

---

## Notes

Quyết định URL apply/save **B1**: xem [readme.md](./readme.md) § Quyết định thiết kế (B).

- **Identity (khớp [candidates.md](./candidates.md)):** `req.user.id` → `candidate_profiles.user_id` → `applications.candidate_id` / `saved_jobs.candidate_id` = `candidate_profiles.id`.
- **Resume (khớp [resumes.md](./resumes.md)):** apply dùng `resumeId` thuộc candidate, chưa soft-delete; omit → CV `isDefault=true`. `resumeSnapshotUrl` = copy `resumes.file_url` (= `storagePath`) lúc apply — không phụ thuộc user xóa/đổi CV sau.
- **Job (G2):** `job_id` logical FK — validate job tồn tại / đang mở khi G2 sẵn sàng. Recruiter chỉ thấy đơn thuộc job của company mình (rule chi tiết chốt G2).
- **Không chồng G1:** apply/save không đụng `/users/me`.

---

## 0. Map Brief → Contract

| Brief                               | Contract                                                          |
| ----------------------------------- | ----------------------------------------------------------------- |
| `POST /api/jobs/{jobId}/apply`      | **`POST /api/v1/jobs/{jobId}/apply`**                             |
| `GET /api/applications`             | **`GET /api/v1/applications`** (+ query theo role)                |
| `GET /api/applications/{id}`        | **`GET /api/v1/applications/{id}`**                               |
| `PUT /api/applications/{id}/status` | **`PUT /api/v1/applications/{id}/status`** — recruiter only       |
| `POST /api/jobs/{jobId}/save`       | **`POST /api/v1/jobs/{jobId}/save`**                              |
| `DELETE /api/jobs/{jobId}/save`     | **`DELETE /api/v1/jobs/{jobId}/save`**                            |
| (không liệt kê)                     | **`POST /api/v1/applications/{id}/withdraw`** — candidate rút đơn |
| (không liệt kê)                     | **`GET /api/v1/saved-jobs`** — list việc đã lưu                   |

---

## 1. Apply to job

|              |                                   |
| ------------ | --------------------------------- |
| Tên          | Ứng tuyển một tin                 |
| Method / URL | `POST /api/v1/jobs/{jobId}/apply` |
| Quyền        | `CANDIDATE`                       |

**Request**

```json
{
  "resumeId": "1"
}
```

| Field      | Required | Validation                                                                                               |
| ---------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `resumeId` | no\*     | Thuộc candidate hiện tại, chưa soft-deleted. \*Omit → dùng CV `isDefault=true`; không có default → `400` |
| `jobId`    | path     | Job tồn tại / đang mở (APPROVED)                                                                         |

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
    "createdAt": "2026-08-21T04:00:00.000Z",
    "updatedAt": "2026-08-21T04:00:00.000Z"
  }
}
```

**Errors:** `400` (thiếu resume / job đóng), `401`, `403`, `404` (job hoặc resume), `409` (đã apply — unique `candidate_id` + `job_id`), `500`

---

## 2. List applications

|              |                              |
| ------------ | ---------------------------- |
| Method / URL | `GET /api/v1/applications`   |
| Quyền        | `CANDIDATE` hoặc `RECRUITER` |

**Query**

| Param           | Ai dùng   | Note                    |
| --------------- | --------- | ----------------------- |
| `status`        | cả hai    | filter enum             |
| `jobId`         | recruiter | đơn của 1 tin           |
| `page`, `limit` | cả hai    | optional; default do BE |

**Behavior**

- `CANDIDATE`: chỉ đơn của profile gắn `req.user.id`
- `RECRUITER`: chỉ đơn thuộc job của company mình (chốt G2)

**Response 200:** `{ "success": true, "message": "Thành công", "data": [ ...application ] }`  
(Shape item như §1. Pagination sau: có thể bọc `{ items, meta }` — hiện tại giữ **array** giống candidates/resumes.)

**Errors:** `401`, `403`, `500`

---

## 3. Get application detail

|              |                                               |
| ------------ | --------------------------------------------- |
| Method / URL | `GET /api/v1/applications/{id}`               |
| Quyền        | Owner candidate **hoặc** recruiter của job đó |

**Response 200:** một object cùng shape §1.  
Recruiter xem file CV qua `resumeSnapshotUrl` + `GET /api/v1/media/access?assetType=resume` — **không** cần quyền `GET /resumes/{id}` của candidate.

**Errors:** `401`, `403`, `404`, `500`

---

## 4. Update application status (Recruiter)

|              |                                                          |
| ------------ | -------------------------------------------------------- |
| Method / URL | `PUT /api/v1/applications/{id}/status`                   |
| Quyền        | `RECRUITER` (đúng company/job) — **Candidate không gọi** |

**Request**

```json
{
  "status": "VIEWED"
}
```

### Transition cho phép

```
APPLIED → VIEWED → INTERVIEW → ACCEPTED
                              → REJECTED
APPLIED → REJECTED
VIEWED  → REJECTED
INTERVIEW → ACCEPTED | REJECTED
```

- Không nhảy ngược (vd. `REJECTED` → `INTERVIEW`) → `400`
- `WITHDRAWN` chỉ từ API withdraw (§5), không set qua endpoint này

**Response 200:** application đã cập nhật.  
**Errors:** `400`, `401`, `403`, `404`, `500`

---

## 5. Withdraw (candidate rút đơn)

DB có `WITHDRAWN`; brief không liệt kê riêng.

|              |                                                              |
| ------------ | ------------------------------------------------------------ |
| Method / URL | `POST /api/v1/applications/{id}/withdraw`                    |
| Quyền        | `CANDIDATE` (owner)                                          |
| Request      | empty body                                                   |
| Rule         | Chỉ khi `status` ∈ { `APPLIED`, `VIEWED` } → set `WITHDRAWN` |

**Response 200:** application đã cập nhật.  
**Errors:** `400` (status không cho rút), `401`, `403`, `404`, `500`

---

## 6. Save / unsave job

| Method   | URL                         | Quyền       |
| -------- | --------------------------- | ----------- |
| `POST`   | `/api/v1/jobs/{jobId}/save` | `CANDIDATE` |
| `DELETE` | `/api/v1/jobs/{jobId}/save` | `CANDIDATE` |
| `GET`    | `/api/v1/saved-jobs`        | `CANDIDATE` |

**POST** — body empty. Insert `saved_jobs`.

- Chưa save → `201` + row
- Đã save → `200` idempotent (không `409`)

**DELETE** — unsave.

- Có row → xóa, `200` + `{ "success": true, "message": "Thành công", "data": null }`
- Chưa save → `200` idempotent (cùng body)

**GET `/api/v1/saved-jobs`** — list việc đã lưu của candidate hiện tại.

```json
{
  "success": true,
  "message": "Thành công",
  "data": [
    {
      "id": "1",
      "candidateId": "1",
      "jobId": "50",
      "createdAt": "2026-08-21T00:00:00.000Z"
    }
  ]
}
```

_(FE cần job title/company: join G2 khi list, hoặc FE gọi thêm `GET /jobs/{id}` — chốt với G2.)_

**Errors:** `401`, `403`, `404` (job không tồn tại khi save), `500`

---

## 7. Mount note (BE)

`POST/DELETE /jobs/{jobId}/apply|save` có thể khai báo trên `modules/jobs` rồi delegate `applications` / `saved-jobs`, hoặc mount router phụ dưới `/jobs`. Tránh nhân đôi business logic.

---

## 8. Stub ≠ contract

Stub `/applications/me`, `/saved-jobs` (nếu còn) chỉ tham khảo nội bộ. Contract chính thức = bảng §0 + B1 trên [readme.md](./readme.md).
