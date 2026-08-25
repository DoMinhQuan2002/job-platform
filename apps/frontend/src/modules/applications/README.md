# Module Applications — Owner: **Mạnh**

**Chỉ sửa folder này.** Không đụng `modules/candidate`, `modules/resume`.

## Scope

- Ứng tuyển: `POST /jobs/{jobId}/apply`, `GET /applications`, withdraw
- Việc đã lưu: `POST/DELETE /jobs/{jobId}/save`, `GET /saved-jobs`

## Cấu trúc

```
modules/applications/
  api.ts
  types.ts
  components/
  hooks/
  pages/
```

## Route

- `/candidate/applications`
- `/candidate/saved-jobs`

Contract: `docs/api-contract/group3/applications.md`
