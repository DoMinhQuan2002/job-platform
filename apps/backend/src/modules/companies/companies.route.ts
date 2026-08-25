import { Router } from "express";
import { authenticate } from "../../common/middlewares/authenticate.middleware";
import { requireRecruiter } from "../../common/middlewares/role.middleware";
import { companiesController } from "./companies.controller";

const companiesRouter = Router();

// GET /api/v1/companies/me — Xem thông tin công ty của nhà tuyển dụng đang đăng nhập
companiesRouter.get("/me", authenticate, requireRecruiter, companiesController.getMyCompany);

// POST /api/v1/companies — Khởi tạo hồ sơ công ty mới cho nhà tuyển dụng
companiesRouter.post("/", authenticate, requireRecruiter, companiesController.createCompany);

// PUT /api/v1/companies/me — Cập nhật thông tin chi tiết hồ sơ công ty
companiesRouter.put("/me", authenticate, requireRecruiter, companiesController.updateMyCompany);

// GET /api/v1/companies — Xem danh sách công ty công khai dành cho Candidate/Public
companiesRouter.get("/", companiesController.getPublicCompanies);

companiesRouter.get("/:id", companiesController.getById);

export default companiesRouter;


