# Frontend (public + candidate + recruiter)

Next.js 16 + Tailwind 4 + shadcn. Port **3000**.

## Group 3 — 3 folder tách biệt (quan trọng)

**Mỗi người chỉ sửa đúng 1 folder module.** Không đụng folder người khác.

| Dev | Folder (code ở đây) | Route |
|-----|---------------------|-------|
| **Bình** | `src/modules/candidate/` | `/candidate/profile` |
| **Lợi** | `src/modules/resume/` | `/candidate/resume` |
| **Mạnh** | `src/modules/applications/` | `/candidate/applications`, `/candidate/applications/saved-jobs` |

Mỗi module gồm:

```
modules/<tên>/
  README.md      # scope + quy tắc
  api.ts         # gọi BE
  types.ts
  components/    # UI riêng
  hooks/
  pages/         # page component
```

`app/(candidate)/…/page.tsx` **chỉ re-export** từ `modules/*/pages` — không viết logic ở đó.

Shared (cả team dùng, sửa cần báo nhau): `services/http.ts`, `lib/*`, `components/ui`, `components/layout`.

## Chạy

```bash
npm install
cp apps/frontend/.env.example apps/frontend/.env
npm run dev:frontend   # :3000
npm run dev:backend    # :4000
```

Contract BE: `docs/api-contract/group3/`.

## Ví dụ import

```ts
// Bình — trong modules/candidate/
import { candidateApi } from "@/modules/candidate/api";

// Lợi
import { resumeApi, skillsApi } from "@/modules/resume/api";

// Mạnh
import { applicationsApi } from "@/modules/applications/api";
```

Auth (Nhóm 1): `services/auth.service.ts` — login trước khi gọi API G3.
