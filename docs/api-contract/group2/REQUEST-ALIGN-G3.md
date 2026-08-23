# Request từ Group 3 → Group 2: chỉnh contract cho khớp G3

> **Từ:** Group 3 (ứng viên & ứng tuyển)  
> **Tới:** Group 2 (company & jobs)  
> **Mục đích:** G3 đã chốt contract trong `docs/api-contract/group3/`. Đề nghị G2 sửa doc (và sau này code) theo các điểm dưới để hai bên không lệch khi integrate.  
> **Ngày:** 2026-08-23  
> **Tham chiếu G3:** `group3/readme.md`, `group3/applications.md`, `group3/candidates.md` (skills), `group3/resumes.md`

---

## Tóm tắt việc cần làm

| # | Việc | File G2 cần sửa | Ưu tiên |
|---|------|-----------------|---------|
| 1 | Thống nhất base path **`/api/v1` hết** (như G1/G3/G4) | `jobs.md`, `companys.md` | P0 |
| 2 | Bỏ / không dùng status `OPEN`, `HIDDEN` — bám enum DB + G4 | `jobs.md` § PATCH | P0 |
| 3 | Chốt rule **job nào được apply / save** | `jobs.md` (thêm mục hoặc Notes) | P0 |
| 4 | Ghi nhận path apply/save **B1** (owner logic = G3) | `jobs.md` § Ranh giới | P0 |
| 5 | Catalog `skills` = G3 (đã có — giữ, làm rõ hơn) | `jobs.md` §3 | P1 |
| 6 | Recruiter ownership (đã có — G3 sẽ bám theo) | `jobs.md` `/recruiter/jobs` | P1 (xác nhận) |
| 7 | Optional: enrich saved-jobs (join vs FE gọi `GET /jobs/{id}`) | `jobs.md` Notes | P2 |

---

## 1. Base URL: dùng `/api/v1` hết (P0)

**Hiện trạng G2:** **không đồng nhất** — nửa doc `/api/v1/jobs`, nửa `/api/jobs`, `/api/job-categories`, `/api/recruiter/jobs` (thiếu `v1`).

**Chuẩn cả dự án (đã ghi trong contract):**

| Nhóm | Prefix |
|------|--------|
| G1 | `/api/v1` (`auth.md`, `users.md`, `permissions.md`) |
| G3 | `/api/v1` |
| G4 | `/api/v1` (`admin`, `notifications`, `system-logs`) |
| Backend monorepo | mount dưới `/api/v1` |

**Yêu cầu G2:** sửa **toàn bộ** path trong `jobs.md` / `companys.md` sang **`/api/v1/...`** — không còn endpoint public nào chỉ `/api/...` thiếu `v1`.

Ví dụ bắt buộc đổi:

| Trước (sai / lệch) | Sau (đúng) |
|--------------------|------------|
| `GET /api/jobs` | `GET /api/v1/jobs` |
| `PATCH /api/jobs/{id}` | `PATCH /api/v1/jobs/{id}` |
| `GET /api/recruiter/jobs` | `GET /api/v1/recruiter/jobs` *(hoặc `/api/v1/jobs/recruiter` nếu G2 gộp — miễn có `v1` và ghi rõ)* |
| `GET /api/job-categories` | `GET /api/v1/job-categories` |
| `GET /api/companies/{id}` (nếu còn) | `GET /api/v1/companies/{id}` |

- Xóa dòng “Chờ Leader chốt: Base URL `/api` hay `/api/v1`” → ghi **đã chọn `/api/v1`** (khớp G1/G3/G4).
- Apply/save của G3 cũng là `/api/v1/jobs/{jobId}/apply|save` — cùng prefix.

---

## 2. Enum status job — bỏ `OPEN` / `HIDDEN` (P0)

**Hiện trạng G2 lệch nội bộ:**

- Create / public list / admin (G4): `PENDING` | `APPROVED` | `REJECTED` | `CLOSED`
- `PATCH /api/jobs/{id}` lại ví dụ: `OPEN`, `CLOSED`, `HIDDEN`

**G3 apply** cần biết job **“đang mở”** nghĩa là status nào. G4 admin cũng filter `PENDING|APPROVED|REJECTED|CLOSED` — không có `OPEN`/`HIDDEN`.

**G2 cần sửa trong `jobs.md`:**

1. Recruiter đổi trạng thái tuyển dụng chỉ dùng enum đã có trên DB, đề xuất:
   - Đóng tin: `APPROVED → CLOSED` (đã có `PUT .../close` — giữ)
   - Mở lại: `CLOSED → PENDING` (đã có `PUT .../reopen` — giữ; admin duyệt lại)
2. **Xóa** ví dụ transition `OPEN` / `HIDDEN` ở § PATCH, hoặc đánh dấu deprecated / không dùng.
3. Nếu vẫn muốn “ẩn tin”: phải thêm cột/status vào schema + đồng bộ G4 — **không** tự invent trong PATCH khi DB chưa có.

---

## 3. Rule: job nào được apply / save (P0)

**G3 sẽ validate** khi `POST /api/v1/jobs/{jobId}/apply` và `POST .../save`.

**Đề xuất G2 xác nhận (copy vào `jobs.md`):**

Job được **apply** khi **đồng thời**:

- `status = APPROVED`
- Chưa hết hạn (nếu có `deadline` / `expiredAt` — đúng field G2 đang dùng)
- Company đang `ACTIVE` (nếu G2 đã có rule này trên public list)

Job được **save** khi:

- Job **tồn tại** (kể cả CLOSED — tùy G2; tối thiểu: không 404 vì id sai)
- Đề xuất G3: save được mọi job public từng list được; hoặc chỉ `APPROVED` — **G2 chọn 1, ghi 1 câu vào doc**

Khi không đủ điều kiện apply → G3 trả `400` “job đóng” / không cho apply.

---

## 4. Ghi nhận Apply / Save path B1 (P0)

**G3 đã chọn (`group3/readme.md` + `applications.md`):**

| Method | URL | Owner logic |
|--------|-----|-------------|
| `POST` | `/api/v1/jobs/{jobId}/apply` | **Group 3** (`applications`) |
| `POST` | `/api/v1/jobs/{jobId}/save` | **Group 3** (`saved_jobs`) |
| `DELETE` | `/api/v1/jobs/{jobId}/save` | **Group 3** |

**G2 cần thêm vào `jobs.md` § Ranh giới với Group khác** (hoặc mục mới “Endpoints mount — logic G3”):

```markdown
### Apply / Save (owner = Group 3)

Các path sau nằm dưới namespace `/jobs` nhưng **business logic thuộc Group 3**.
G2 chỉ cần: (1) đồng ý path, (2) cung cấp helper/validate job tồn tại + status apply được.

| Method | URL | Ghi chú |
|--------|-----|---------|
| POST | `/api/v1/jobs/{jobId}/apply` | Body/resume/status application = G3 |
| POST | `/api/v1/jobs/{jobId}/save` | G3 |
| DELETE | `/api/v1/jobs/{jobId}/save` | G3 |

Implement: mount trên `modules/jobs` rồi `delegate` sang `applications` / `saved-jobs`,
hoặc G3 mount router phụ — **không** implement apply trong service jobs của G2.
```

G2 **không** viết lại contract apply (resumeId, snapshot…) — xem `group3/applications.md`.

---

## 5. Catalog `skills` dùng chung G3 (P1 — giữ + làm rõ)

G2 `jobs.md` đã ghi đúng: *Catalog `skills` — Dùng chung Group 3; không tự đổi schema*.

**Bổ sung 2 dòng cho FE/BE G2:**

- Lấy list skill khi tạo job: `GET /api/v1/skills?category=SKILL` (contract G3 `candidates.md` §5)
- **Không** `POST /api/v1/skills` từ Recruiter — tạo catalog = `ADMIN` / seed (G4)
- Gắn vào job: body `skills` / `skillIds` của G2 → bảng `job_skills` (FK `skills.id`)

Schema `skills` / `candidate_skills` G3 đã merge category `SKILL | LANGUAGE | CERTIFICATE` — G2 job chỉ cần `SKILL`.

---

## 6. Recruiter ownership — xác nhận cho G3 (P1)

G2 đã mô tả rõ (`GET /api/recruiter/jobs`):

```text
req.user.id → company (companies.user_id) → jobs.company_id
```

FE không truyền `companyId`.

**G3 sẽ dùng cùng rule** khi:

- `GET /api/v1/applications?jobId=...` (recruiter)
- `PUT /api/v1/applications/{id}/status`

**G2 không cần sửa logic** — chỉ cần **xác nhận** đây là source of truth (reply OK trên PR/chat). Nếu field company khác (`owner_id` vs `user_id`), ghi rõ 1 dòng để G3 không đoán.

---

## 7. List saved-jobs enrich (P2 — optional)

G3 `GET /api/v1/saved-jobs` hiện trả:

```json
{ "id", "candidateId", "jobId", "createdAt" }
```

FE cần title/company → một trong hai:

| Option | Ai làm |
|--------|--------|
| **A (đề xuất)** | FE gọi thêm `GET /api/v1/jobs/{id}` (public) cho từng job / batch sau |
| **B** | G3 list join G2 tables trả thêm `job: { id, title, company }` |

G2 chỉ cần: public `GET /jobs/{id}` ổn định cho job `APPROVED` (đã có). Nếu chọn B, G2 cho phép G3 đọc bảng `jobs`/`companies` (cùng DB) — không cần API mới.

**Xin G2 chọn A hoặc B (1 câu).**

---

## Việc G2 **không** cần làm

- Không viết API applications / withdraw / resume upload  
- Không đổi schema `applications`, `saved_jobs`, `resumes`, `candidate_profiles`  
- Không làm noti `NEW_APPLICATION` (G3 gọi G4)  
- Không approve job (G4 admin)

---

## Checklist copy cho PR doc G2

- [ ] Toàn bộ path jobs/company = `/api/v1/...` (không còn `/api/...` thiếu `v1`)
- [ ] Xóa / không dùng `OPEN`, `HIDDEN` trong contract PATCH
- [ ] Có đoạn “Job được apply khi `APPROVED` + …”
- [ ] Có bảng Apply/Save path B1 + owner = G3
- [ ] Skills: link `GET /api/v1/skills`, không POST catalog từ recruiter
- [ ] Xác nhận ownership recruiter = `user → company → jobs`
- [ ] Chọn enrich saved-jobs: A (FE) hoặc B (join)

---


