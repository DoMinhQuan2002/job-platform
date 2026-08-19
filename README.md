# Job Platform - Monorepo FE/BE

Repo này đã tách rõ:
- `apps/frontend`: Next.js + Tailwind CSS + shadcn/ui
- `apps/backend`: Express.js + TypeORM + PostgreSQL

Mục tiêu: dev clone về là chạy nhanh, chia nhóm làm song song, ít đụng code nhau.

## 1) Yêu cầu máy

- Node.js LTS (khuyên dùng Node 20+)
- npm 10+
- PostgreSQL (local hoặc Supabase)

## 2) Cách chạy nhanh (khuyến nghị)

Từ thư mục gốc `job-platform`:

```bash
npm install
npm run dev:frontend
npm run dev:backend
```

## 3) Cách chạy theo từng app (nếu muốn tách riêng FE/BE)

### Frontend

```bash
cd apps/frontend
npm install
npm run dev
```

### Backend

```bash
cd apps/backend
npm install
npm run dev
```

## 4) Biến môi trường (env)

### Backend

```bash
cp apps/backend/.env.example apps/backend/.env
```

Điền thông tin DB vào `apps/backend/.env`:
- `DB_HOST`
- `DB_PORT`
- `DB_USER` (hoặc `DB_USERNAME`)
- `DB_PASSWORD`
- `DB_NAME`
- `DB_SSL` (`true` nếu dùng Supabase)
- `SUPABASE_URL` (dùng cho Storage upload ảnh)
- `SUPABASE_SERVICE_ROLE_KEY` (key server-side, không đưa lên frontend)
- `SUPABASE_STORAGE_BUCKET` (ví dụ `job-platform-assets`)

### Frontend

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

Điền:
- `NEXT_PUBLIC_API_BASE_URL` (ví dụ `http://localhost:4000`)

## 5) Build

Từ root:

```bash
npm run build:frontend
npm run build:backend
```

## 6) Cấu trúc thư mục đã chia sẵn theo nghiệp vụ

### Frontend (`apps/frontend/src`)

- `app/(public)`: màn public (home, login, register, job list)
- `app/(candidate)`: màn ứng viên
- `app/(recruiter)`: màn nhà tuyển dụng
- `app/(admin)`: màn quản trị
- `components/ui`: component shadcn/ui dùng chung
- `components/common`: component dùng chung toàn app
- `components/layout`: header/sidebar/footer/layout
- `components/features/*`: UI theo nghiệp vụ từng nhóm
- `features/auth`: state/logic gọi API cho auth
- `features/candidate`: state/logic ứng viên
- `features/recruiter`: state/logic nhà tuyển dụng
- `features/admin`: state/logic admin
- `services`: API client, service gọi backend
- `store`: global state
- `hooks`: custom hooks
- `types`: typings/interfaces
- `constants`: hằng số và enum FE
- `utils`: hàm tiện ích

### Backend (`apps/backend/src`)

- `config`: cấu hình hệ thống
- `common`: constants, dto, guards, middlewares, utils dùng chung
- `database/entities`: TypeORM entities
- `database/migrations`: migration scripts
- `database/seeds`: seed data
- `database/repositories`: custom repositories
- `modules/auth`: đăng ký, đăng nhập, xác thực
- `modules/users`, `roles`, `permissions`: tài khoản & phân quyền (Nhóm 1)
- `modules/companies`, `job-categories`, `jobs`, `skills`: công ty & tuyển dụng (Nhóm 2)
- `modules/candidate-profiles`, `resumes`, `educations`, `work-experiences`, `certificates`, `languages`, `applications`, `saved-jobs`: ứng viên & ứng tuyển (Nhóm 3)
- `modules/notifications`, `system-logs`, `admin`, `statistics`: admin & hệ thống (Nhóm 4)
- `routes`: gom route cấp hệ thống
- `docs`: tài liệu API, nghiệp vụ
- `tests`: test backend

## 7) Mapping ownership theo nhóm (để chia task không chồng chéo)

- Nhóm 1: `users`, `roles`, `permissions`, `role_permissions`
- Nhóm 2: `companies`, `job_categories`, `jobs`, `job_skills`
- Nhóm 3: `candidate_profiles`, `resumes`, `educations`, `work_experiences`, `certificates`, `skills`, `candidate_skills`, `languages`, `candidate_languages`, `applications`, `saved_jobs`
- Nhóm 4: `notifications`, `system_logs` + chức năng admin

Nguyên tắc: bảng có owner chính, nhóm khác được dùng FK nhưng không tự ý đổi schema bảng owner khi chưa thống nhất.

---

