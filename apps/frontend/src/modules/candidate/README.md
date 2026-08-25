# Module Candidate — Owner: **Bình**

**Chỉ sửa folder này.** Không đụng `modules/resume`, `modules/applications`.

## Scope

- Hồ sơ: `GET/PUT /candidates/me` (bio, careerObjective)
- Học vấn: `/candidates/me/educations`
- Kinh nghiệm: `/candidates/me/work-experiences`

## Cấu trúc

```
modules/candidate/
  api.ts          # gọi BE
  types.ts        # typings
  components/     # UI riêng module
  hooks/          # hooks riêng module
  pages/          # page component (app route chỉ import)
```

## Route

- `/candidate/profile`

Contract: `docs/api-contract/group3/candidates.md`
