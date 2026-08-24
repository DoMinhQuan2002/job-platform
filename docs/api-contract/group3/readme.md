# API Contract — Group 3 (Ứng viên & ứng tuyển)

> **Giai đoạn 2** — tài liệu **chung** cho cả Group 3 (candidates / resumes / applications).  
> Envelope, base URL, quyết định thiết kế (A1/B1) nằm ở file này; chi tiết endpoint nằm ở từng file bên dưới.  
> **Chưa phải** implementation chính thức. Code stub trên branch `backend/g3-candidate` chỉ là draft nội bộ.  
> Branch tài liệu: `docs/api-group3`.

## Files trong folder này

| File | Scope |
|------|--------|
| [candidates.md](./candidates.md) | Profile, học vấn, kinh nghiệm, kỹ năng / ngoại ngữ / chứng chỉ |
| [resumes.md](./resumes.md) | CV upload / list / default / delete |
| [applications.md](./applications.md) | Apply, danh sách đơn, cập nhật status (recruiter), saved jobs |

Media dùng chung (`apps/backend/STORAGE_API.md`): avatar / logo / icon → `POST /api/v1/media/uploads`.  
**Resume:** `POST /api/v1/resumes` multipart (1 request, upload nội bộ). Xem/tải lại → `GET /api/v1/media/access?assetType=resume`.

---

## Base URL

| Brief sếp | Đề xuất contract (bám monorepo hiện tại) |
|-----------|------------------------------------------|
| `/api/...` | **`/api/v1/...`** |

Cần Leader chốt: giữ `v1` hay bỏ.

---

## Envelope chung (theo brief GĐ2)

**Success**

```json
{
  "success": true,
  "message": "Thành công",
  "data": {}
}
```

**Error**

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": []
}
```

> **Lệch hiện trạng code:** middleware lỗi đang trả `{ code, message, details }`, success thường `{ data }`.  
> GĐ3 sẽ align theo envelope trên **sau khi Leader duyệt**.

### HTTP Status

| Code | Nghĩa |
|------|--------|
| 200 | Thành công |
| 201 | Tạo mới |
| 204 | Xóa thành công (không body) — *đề xuất bổ sung so với brief* |
| 400 | Validation |
| 401 | Chưa đăng nhập / token lỗi |
| 403 | Không có quyền |
| 404 | Không tìm thấy |
| 409 | Trùng (unique) |
| 500 | Lỗi hệ thống |

---

## Quyết định thiết kế Group 3 (đề xuất Leader duyệt)

### A. Candidate URL shape — **đã chọn A1 (theo brief)**

| | |
|--|--|
| **Chọn** | **A1** |
| Public API | `GET/PUT /api/v1/candidates/me` |
| GET | Gom bio, học vấn, kinh nghiệm, kỹ năng / NN / chứng chỉ |
| PUT | **Chỉ** `bio` + `careerObjective` — không replace nested, không đụng bảng con |

Ghi học vấn / kinh nghiệm / skill: endpoint con trong [candidates.md](./candidates.md) (`/candidates/me/educations`, …) và `/skills` (Lợi).

> Module `candidate-profiles` (stub nội bộ) **không đổi** ở GĐ2. GĐ3 chỉ thêm facade `/candidates`.

### B. Apply / Save URL — **đã chọn B1**

| Option | Apply | Save |
|--------|-------|------|
| **B1 — chốt** | `POST /api/v1/jobs/{jobId}/apply` | `POST/DELETE /api/v1/jobs/{jobId}/save` |
| B2 — stub cũ (tham khảo) | `POST /api/v1/applications` | `/api/v1/saved-jobs` (chỉ còn **GET list**) |

Bổ sung (không có trong brief): `POST /applications/{id}/withdraw`, `GET /saved-jobs`. Chi tiết [applications.md](./applications.md).

### C. Skills / Language / Certificate

Schema đã merge vào `skills.category`: `SKILL | LANGUAGE | CERTIFICATE` + `candidate_skills.level`.  
**Không** còn bảng `languages` / `certificates` riêng.

### D. Base path

Đề xuất giữ **`/api/v1`** (đúng monorepo hiện tại).

---

## Phân công viết / review doc

| Dev | Primary docs |
|-----|----------------|
| Bình | `candidates.md` (profile + educations + work experiences) |
| Lợi | `candidates.md` (skills section) + `resumes.md` |
| Mạnh | `applications.md` |

---

## Checklist GĐ2 (Group 3)

- [x] Candidate shape: **A1** (`/candidates/me`, PUT không replace nested)
- [x] Resume upload: **1 request multipart** `POST /resumes` (không 2 bước media + metadata)
- [x] Apply / save: **B1** + withdraw + `GET /saved-jobs`
- [ ] Leader duyệt A1 + B1 + `/api/v1` + resume flow
- [ ] FE xác nhận field form cần thiết
- [ ] Không còn chồng chéo với Group 1 (`/users/me`) — profile nghề nghiệp ≠ user account
- [ ] Doc đã trên Git / PR merge