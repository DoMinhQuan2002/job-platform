# Supabase Storage API (Backend)

Tài liệu ngắn để các module FE/BE dùng chung phần upload file qua `modules/media`.

Base URL: `/api/v1/media`

---

## 1) Khái niệm nhanh

- `storagePath`: đường dẫn object trong bucket, ví dụ `resumes/abc-uuid.pdf`.
- `url`:
  - file public => public URL.
  - file private => signed URL (có hạn).
- `expiresIn`: số giây signed URL còn hiệu lực (chỉ áp dụng private).

`storagePath` luôn do **backend tự generate**. FE không tự dựng path khi upload.

---

## 2) Asset type hỗ trợ

- `user_avatar` (public, image, max 2MB)
- `company_logo` (public, image/svg, max 2MB)
- `company_icon` (public, image/svg, max 2MB)
- `resume` (private, pdf, max 10MB)

---

## 3) API

### A. Upload chung

`POST /uploads`

Hỗ trợ 2 kiểu body:

1. `multipart/form-data` (khuyến nghị)
   - `file`: binary file
   - `assetType`

2. JSON (để tương thích client cũ / test nhanh)
   - `assetType`
   - `fileName`
   - `mimeType`
   - `contentBase64`

Ví dụ JSON:

```json
{
  "assetType": "company_logo",
  "fileName": "logo.png",
  "mimeType": "image/png",
  "contentBase64": "iVBORw0KGgoAAA..."
}
```

Response `201`:

```json
{
  "message": "Uploaded successfully",
  "data": {
    "fileName": "logo.png",
    "mimeType": "image/png",
    "size": 12345,
    "assetType": "company_logo",
    "storagePath": "logos/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.png",
    "isPublic": true,
    "url": "https://...public-or-signed-url...",
    "expiresIn": null
  }
}
```

> Với `resume`, `isPublic=false`, `url` là signed URL, `expiresIn` mặc định `3600`.

---

### B. Upload icon (API cũ)

`POST /icons`

Body JSON:

```json
{
  "fileName": "icon.png",
  "mimeType": "image/png",
  "contentBase64": "iVBORw0KGgoAAA..."
}
```

API này tự map thành `assetType=company_icon`.

---

### C. Lấy URL truy cập lại từ storagePath

`GET /access?storagePath=...&assetType=...&expiresIn=120`

Ví dụ:

`GET /api/v1/media/access?storagePath=resumes/abc.pdf&assetType=resume&expiresIn=120`

Response `200`:

```json
{
  "data": {
    "storagePath": "resumes/abc.pdf",
    "assetType": "resume",
    "url": "https://...signed-url...",
    "expiresIn": 120,
    "isPublic": false
  }
}
```

---

### D. Xóa file trên storage

`DELETE /`

Body JSON:

```json
{
  "storagePath": "logos/abc.png",
  "assetType": "company_logo"
}
```

Response: `204 No Content`.

---

## 4) Lưu ý cho FE

- FE nên lưu `storagePath` vào DB business (`users.avatar`, `companies.logo`, `resumes.file_url`...).
- Không tự generate `storagePath` khi upload.
- Với file private (`resume`):
  - URL sẽ hết hạn (`expiresIn`).
  - Khi gần hết hạn / mở lại màn hình => gọi `GET /access` để lấy signed URL mới.

---

## 5) Lỗi thường gặp

- `INVALID_REQUEST`: thiếu field bắt buộc.
- `INVALID_ASSET_TYPE`: `assetType` không hợp lệ.
- `UNSUPPORTED_MIME`: MIME không đúng theo `assetType`.
- `FILE_TOO_LARGE`: quá dung lượng cho phép.
- `INVALID_EXPIRES_IN`: `expiresIn` ngoài khoảng `30..86400`.
- `SUPABASE_PRIVATE_BUCKET_MISSING`: chưa set `SUPABASE_STORAGE_PRIVATE_BUCKET`.

---

## 6) Env tối thiểu

```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=job-platform-assets
SUPABASE_STORAGE_PRIVATE_BUCKET=job-platform-private
```

