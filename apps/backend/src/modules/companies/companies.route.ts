import { Router } from "express";
import { authenticate } from "../../common/middlewares/authenticate.middleware";
import { companiesController } from "./companies.controller";

const companiesRouter = Router();

// GET /api/v1/companies/me — Xem thông tin công ty của nhà tuyển dụng đang đăng nhập
companiesRouter.get("/me", authenticate, companiesController.getMyCompany);

// POST /api/v1/companies — Khởi tạo hồ sơ công ty mới cho nhà tuyển dụng
companiesRouter.post("/", authenticate, companiesController.createCompany);

// PUT /api/v1/companies/me — Cập nhật thông tin chi tiết hồ sơ công ty
companiesRouter.put("/me", authenticate, companiesController.updateMyCompany);

companiesRouter.get("/", (_req, res) => {
  res.status(200).json({ module: "companies", message: "TODO: companies list" });
});

export default companiesRouter;


