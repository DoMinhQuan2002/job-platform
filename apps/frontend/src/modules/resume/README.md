# Module Resume — Owner: **Lợi**

**Chỉ sửa folder này.** Không đụng `modules/candidate`, `modules/applications`.

## Scope

- CV: `/resumes` (upload PDF multipart, default, delete)
- Kỹ năng / ngoại ngữ / chứng chỉ: `/skills`, `/skills/me`

## Cấu trúc

```
modules/resume/
  api.ts          # resumesApi + skillsApi
  types.ts
  components/
  hooks/
  pages/
```

## Route

- `/candidate/resume`

Contract: `docs/api-contract/group3/resumes.md` + skills trong `candidates.md`
