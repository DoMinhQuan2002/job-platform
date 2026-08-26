# Module Applications — Owner: **Mạnh**

**Chỉ sửa folder này.** Không đụng `modules/candidate`, `modules/resume`.

## Scope

- Ứng tuyển: `POST /jobs/{jobId}/apply`, `GET /applications`, `GET /applications/{id}`, withdraw
- Việc đã lưu: `POST/DELETE /jobs/{jobId}/save`, `GET /saved-jobs`
- Enrich job title/company: `GET /jobs/{id}` (G2)

## Route

- `/candidate/applications`
- `/candidate/applications/:id`
- `/candidate/applications/saved-jobs`

Contract: `docs/api-contract/group3/applications.md`
