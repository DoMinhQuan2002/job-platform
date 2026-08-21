# API Contract — Ứng Tuyển & Việc Làm Đã Lưu (Applications & Saved Jobs)

> **Dự án**: Job Platform — Giai đoạn 2 (Xây dựng API Contract)  
> **Nhóm phụ trách**: Nhóm 3 — Ứng viên & Ứng tuyển  
> **Phân công chi tiết**: 6.3. Application & Saved Job  
> **Thành viên phụ trách**: Nguyễn Văn Mạnh  
> **Trạng thái**: Draft GĐ2 — Chờ Leader phê duyệt

---

## 1. Chuẩn Quy Định Bắt Buộc (Mục 8)

### 1.1. Cấu trúc Response Thành công (HTTP Status: 200, 201)

```json
{
  "success": true,
  "message": "Thao tác thành công",
  "data": {}
}
```

### 1.2. Cấu trúc Response Lỗi (HTTP Status: 400, 401, 403, 404, 409, 500)

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    {
      "field": "resumeId",
      "message": "Hồ sơ CV không tồn tại hoặc đã bị xóa"
    }
  ]
}
```

### 1.3. Hệ thống HTTP Status Code Sử dụng

- `200 OK`: Thành công (Lấy dữ liệu, Cập nhật trạng thái, Hủy lưu).
- `201 Created`: Tạo mới thành công (Nộp đơn ứng tuyển, Lưu tin tuyển dụng).
- `400 Bad Request`: Dữ liệu đầu vào không hợp lệ / Thiếu CV / Chuyển sai quy trình trạng thái.
- `401 Unauthorized`: Chưa đăng nhập hoặc Token hết hạn / không hợp lệ.
- `403 Forbidden`: Không có quyền truy cập (Ứng viên tự sửa trạng thái đơn).
- `404 Not Found`: Tài nguyên không tồn tại (Công việc, Đơn ứng tuyển, CV).
- `409 Conflict`: Dữ liệu trùng lặp (Đã ứng tuyển trước đó, Đã lưu tin từ trước).
- `500 Internal Server Error`: Lỗi hệ thống Backend.

### 1.4. Trạng Thái Đơn Ứng Tuyển (`ApplicationStatus`)

```
APPLIED → VIEWED → INTERVIEW → ACCEPTED / REJECTED
```

- **Quy tắc phân quyền quan trọng**:
  - `Candidate`: Nộp đơn (`POST /apply`), xem đơn (`GET`), không được phép thay đổi trạng thái đơn qua API `PUT /status`.
  - `Recruiter`: Được phép cập nhật trạng thái đơn theo đúng quy trình 4 bước trên.

---

## 2. Danh Sách API Chi Tiết (Đúng 6 API Theo Yêu Cầu 6.3)

---

### API 6.3.1: Ứng tuyển công việc (Apply Job)

- **Tên chức năng**: Ứng viên nộp CV ứng tuyển vào một tin tuyển dụng
- **URL**: `/api/v1/jobs/{jobId}/apply`
- **HTTP Method**: `POST`
- **Quyền truy cập**: `CANDIDATE`

#### Request

- **Headers**: `Authorization: Bearer <access_token>`
- **Path Parameters**:
  - `jobId` (string, required): ID công việc muốn ứng tuyển.
- **Body JSON**:
  ```json
  {
    "resumeId": "1"
  }
  ```

#### Bảng Validation Ràng Buộc Dữ Liệu

| Trường     | Kiểu dữ liệu    | Bắt buộc  | Quy tắc kiểm tra                                                                                                                                                          |
| ---------- | --------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `jobId`    | String / BigInt | Có (Path) | Tồn tại trong hệ thống, công việc phải đang mở tuyển (`APPROVED`).                                                                                                        |
| `resumeId` | String / BigInt | Không\*   | Thuộc sở hữu của Ứng viên đăng nhập, chưa bị xóa.<br>\*Nếu không truyền, hệ thống tự lấy CV có `is_default = true`. Nếu không có CV mặc định $\rightarrow$ Báo lỗi `400`. |

#### Response Thành công (`201 Created`)

```json
{
  "success": true,
  "message": "Ứng tuyển công việc thành công",
  "data": {
    "id": "101",
    "candidateId": "15",
    "jobId": "50",
    "resumeId": "1",
    "resumeSnapshotUrl": "uploads/resumes/2026/08/cv_nguyenvana_15.pdf",
    "status": "APPLIED",
    "appliedAt": "2026-08-21T15:30:00.000Z",
    "createdAt": "2026-08-21T15:30:00.000Z",
    "updatedAt": "2026-08-21T15:30:00.000Z"
  }
}
```

#### Response Lỗi Thường Gặp

- **`400 Bad Request`** (Chưa chọn CV và không có CV mặc định):
  ```json
  {
    "success": false,
    "message": "Bạn chưa chọn CV và chưa thiết lập CV mặc định trong hồ sơ",
    "errors": [
      {
        "field": "resumeId",
        "message": "Trường resumeId không được để trống"
      }
    ]
  }
  ```
- **`404 Not Found`** (Tin tuyển dụng không tồn tại/đã đóng):
  ```json
  {
    "success": false,
    "message": "Công việc không tồn tại hoặc đã hết hạn ứng tuyển",
    "errors": []
  }
  ```
- **`409 Conflict`** (Đã nộp đơn công việc này trước đó):
  ```json
  {
    "success": false,
    "message": "Bạn đã ứng tuyển công việc này rồi. Không thể nộp lại",
    "errors": []
  }
  ```

---

### API 6.3.2: Lấy danh sách đơn ứng tuyển (Get Applications)

- **Tên chức năng**: Lấy danh sách đơn ứng tuyển (Ứng viên xem danh sách đơn mình nộp; Nhà tuyển dụng xem ứng viên nộp vào công ty mình)
- **URL**: `/api/v1/applications`
- **HTTP Method**: `GET`
- **Quyền truy cập**: `CANDIDATE` hoặc `RECRUITER`

#### Request

- **Headers**: `Authorization: Bearer <access_token>`
- **Query Parameters**:
  - `status` (string, optional): Lọc theo trạng thái (`APPLIED`, `VIEWED`, `INTERVIEW`, `ACCEPTED`, `REJECTED`).
  - `jobId` (string, optional - dành cho Recruiter): Lọc danh sách ứng viên của 1 tin tuyển dụng.
  - `page` (integer, optional): Trang hiện tại (Mặc định `1`).
  - `limit` (integer, optional): Số lượng/trang (Mặc định `10`).

#### Behavioral Rules

- **`CANDIDATE`**: Chỉ nhận về các đơn ứng tuyển của chính mình (`candidate_id = req.user.id`).
- **`RECRUITER`**: Chỉ nhận về các đơn ứng tuyển thuộc các tin tuyển dụng của công ty mình.

#### Response Thành công (`200 OK`)

```json
{
  "success": true,
  "message": "Lấy danh sách đơn ứng tuyển thành công",
  "data": {
    "items": [
      {
        "id": "101",
        "jobId": "50",
        "jobTitle": "Lập trình viên Frontend React",
        "companyName": "Công ty Công nghệ ABC",
        "companyLogo": "uploads/companies/logo_abc.png",
        "resumeSnapshotUrl": "uploads/resumes/2026/08/cv_nguyenvana_15.pdf",
        "status": "APPLIED",
        "appliedAt": "2026-08-21T15:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 1,
      "totalPages": 1
    }
  }
}
```

#### Response Lỗi Thường Gặp

- **`401 Unauthorized`**: Chưa đăng nhập hoặc Token hết hạn.

---

### API 6.3.3: Lấy chi tiết đơn ứng tuyển (Get Application Detail)

- **Tên chức năng**: Xem thông tin chi tiết một đơn ứng tuyển
- **URL**: `/api/v1/applications/{id}`
- **HTTP Method**: `GET`
- **Quyền truy cập**: `CANDIDATE` (Chủ sở hữu đơn) hoặc `RECRUITER` (Nhà tuyển dụng của tin đó)

#### Request

- **Headers**: `Authorization: Bearer <access_token>`
- **Path Parameters**:
  - `id` (string, required): ID đơn ứng tuyển.

#### Response Thành công (`200 OK`)

```json
{
  "success": true,
  "message": "Lấy chi tiết đơn ứng tuyển thành công",
  "data": {
    "id": "101",
    "candidate": {
      "id": "15",
      "fullName": "Nguyễn Văn A",
      "email": "nguyenvana@gmail.com",
      "phone": "0987654321",
      "avatar": "https://project.supabase.co/storage/v1/object/public/avatars/users/15/avatar.webp"
    },
    "job": {
      "id": "50",
      "title": "Lập trình viên Frontend React",
      "companyId": "5",
      "companyName": "Công ty Công nghệ ABC"
    },
    "resumeId": "1",
    "resumeSnapshotUrl": "uploads/resumes/2026/08/cv_nguyenvana_15.pdf",
    "status": "APPLIED",
    "appliedAt": "2026-08-21T15:30:00.000Z",
    "updatedAt": "2026-08-21T15:30:00.000Z"
  }
}
```

#### Response Lỗi Thường Gặp

- **`403 Forbidden`** (Xem đơn của ứng viên/công ty khác):
  ```json
  {
    "success": false,
    "message": "Bạn không có quyền xem đơn ứng tuyển này",
    "errors": []
  }
  ```
- **`404 Not Found`**:
  ```json
  {
    "success": false,
    "message": "Đơn ứng tuyển không tồn tại",
    "errors": []
  }
  ```

---

### API 6.3.4: Lưu việc làm (Save Job)

- **Tên chức năng**: Ứng viên lưu tin tuyển dụng quan tâm
- **URL**: `/api/v1/jobs/{jobId}/save`
- **HTTP Method**: `POST`
- **Quyền truy cập**: `CANDIDATE`

#### Request

- **Headers**: `Authorization: Bearer <access_token>`
- **Path Parameters**:
  - `jobId` (string, required): ID công việc cần lưu.

#### Response Thành công (`201 Created`)

```json
{
  "success": true,
  "message": "Lưu tin tuyển dụng thành công",
  "data": {
    "id": "55",
    "candidateId": "15",
    "jobId": "50",
    "createdAt": "2026-08-21T15:45:00.000Z"
  }
}
```

#### Response Lỗi Thường Gặp

- **`404 Not Found`**: Công việc không tồn tại.
- **`409 Conflict`**: Công việc này đã được bạn lưu trước đó.
  ```json
  {
    "success": false,
    "message": "Công việc này đã có trong danh sách lưu của bạn",
    "errors": []
  }
  ```

---

### API 6.3.5: Bỏ lưu việc làm (Delete Saved Job)

- **Tên chức năng**: Ứng viên bỏ lưu tin tuyển dụng
- **URL**: `/api/v1/jobs/{jobId}/save`
- **HTTP Method**: `DELETE`
- **Quyền truy cập**: `CANDIDATE`

#### Request

- **Headers**: `Authorization: Bearer <access_token>`
- **Path Parameters**:
  - `jobId` (string, required): ID công việc cần bỏ lưu.

#### Response Thành công (`200 OK`)

```json
{
  "success": true,
  "message": "Bỏ lưu tin tuyển dụng thành công",
  "data": null
}
```

#### Response Lỗi Thường Gặp

- **`404 Not Found`**: Công việc chưa được lưu trong danh sách của bạn.
  ```json
  {
    "success": false,
    "message": "Công việc này chưa được lưu",
    "errors": []
  }
  ```

---

### API 6.3.6: Cập nhật trạng thái đơn ứng tuyển (Update Application Status)

- **Tên chức năng**: Nhà tuyển dụng cập nhật trạng thái đơn ứng tuyển
- **URL**: `/api/v1/applications/{id}/status`
- **HTTP Method**: `PUT`
- **Quyền truy cập**: `RECRUITER` _(Ứng viên **không được tự thay đổi trạng thái**, nếu gọi API sẽ nhận lỗi `403 Forbidden`)_

#### Request

- **Headers**: `Authorization: Bearer <access_token>`
- **Path Parameters**:
  - `id` (string, required): ID đơn ứng tuyển.
- **Body JSON**:
  ```json
  {
    "status": "VIEWED"
  }
  ```

#### Quy Tắc Chuyển Trạng Thái (State Transition Rules)

Quy trình hợp lệ:

```
APPLIED → VIEWED → INTERVIEW → ACCEPTED / REJECTED
```

- Cho phép chuyển từ `APPLIED` hoặc `VIEWED` trực tiếp sang `REJECTED` (Từ chối nhanh).
- Không cho phép nhảy ngược trạng thái (ví dụ từ `REJECTED` về lại `INTERVIEW`).

#### Bảng Validation Ràng Buộc Dữ Liệu

| Trường   | Kiểu dữ liệu | Bắt buộc | Quy tắc kiểm tra                                                                                                            |
| -------- | ------------ | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| `status` | String       | Có       | Phải là một trong các giá trị: `VIEWED`, `INTERVIEW`, `ACCEPTED`, `REJECTED`. Tuân thủ đúng luồng chuyển trạng thái hợp lệ. |

#### Response Thành công (`200 OK`)

```json
{
  "success": true,
  "message": "Cập nhật trạng thái đơn ứng tuyển thành công",
  "data": {
    "id": "101",
    "status": "VIEWED",
    "updatedAt": "2026-08-21T15:50:00.000Z"
  }
}
```

#### Response Lỗi Thường Gặp

- **`400 Bad Request`** (Chuyển sai quy trình trạng thái):
  ```json
  {
    "success": false,
    "message": "Không thể chuyển trạng thái từ REJECTED sang INTERVIEW",
    "errors": []
  }
  ```
- **`403 Forbidden`** (Ứng viên tự thay đổi trạng thái đơn):
  ```json
  {
    "success": false,
    "message": "Candidate không được tự thay đổi trạng thái đơn ứng tuyển",
    "errors": []
  }
  ```
- **`404 Not Found`**: Đơn ứng tuyển không tồn tại.
