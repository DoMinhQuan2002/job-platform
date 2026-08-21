# API Contract — Group 3 (Ứng viên & ứng tuyển)

> **Giai đoạn 2** — tài liệu contract để Leader / FE / BE thống nhất.  
> **Chưa phải** implementation chính thức. Code stub trên branch `backend/g3-candidate` chỉ là draft nội bộ.  
> Branch tài liệu: `docs/api-group3`.

## Files trong folder này

| File | Scope |
|------|--------|
| [candidates.md](./candidates.md) | Profile, học vấn, kinh nghiệm, kỹ năng / ngoại ngữ / chứng chỉ |
| [resumes.md](./resumes.md) | CV upload / list / default / delete |
| [applications.md](./applications.md) | Apply, danh sách đơn, cập nhật status (recruiter), saved jobs |

Media upload dùng chung: `apps/backend/STORAGE_API.md` (`POST /api/v1/media/uploads`, assetType `resume`).

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

## Quyết định cần Leader chọn (quan trọng)

### A. Profile URL shape

| Option | URL | Ưu | Nhược |
|--------|-----|----|------|
| **A1 — Brief** | `GET/PUT /api/v1/candidates/me` gom hết nested trong 1 payload | Ít endpoint FE | Payload nặng, khó partial update |
| **A2 — Nested (khuyến nghị, khớp schema)** | `/candidate-profiles/me` + `/me/educations` + `/me/work-experiences` + `/skills/me` | Khớp bảng DB, update từng phần | Nhiều endpoint hơn |

### B. Apply / Save URL

| Option | Apply | Save |
|--------|-------|------|
| **B1 — Brief** | `POST /api/v1/jobs/{jobId}/apply` | `POST/DELETE /api/v1/jobs/{jobId}/save` |
| **B2 — Draft stub** | `POST /api/v1/applications` body `{ jobId }` | `/api/v1/saved-jobs` |

**Khuyến nghị:** **B1** (đúng brief, FE dễ hiểu).

### C. Skills / Language / Certificate

Schema đã merge vào `skills.category`: `SKILL | LANGUAGE | CERTIFICATE` + `candidate_skills.level`.  
**Không** còn bảng `languages` / `certificates` riêng.

---

## Phân công viết / review doc

| Dev | Primary docs |
|-----|----------------|
| Bình | `candidates.md` (profile + educations + work experiences) |
| Lợi | `candidates.md` (skills section) + `resumes.md` |
| Mạnh | `applications.md` |

---

## Checklist GĐ2 (Group 3)

- [ ] Leader chọn A1/A2, B1/B2, giữ `/api/v1` hay không
- [ ] FE xác nhận field form cần thiết
- [ ] Không còn chồng chéo với Group 1 (`/users/me`) — profile nghề nghiệp ≠ user account
- [ ] PR merge `docs/api-group3` → `main`