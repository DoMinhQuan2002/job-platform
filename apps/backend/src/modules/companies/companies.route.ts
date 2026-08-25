import { Router } from "express";
import { companiesController } from "./companies.controller";

const companiesRouter = Router();

// GET /api/v1/companies/me — Xem thông tin công ty của nhà tuyển dụng đang đăng nhập
companiesRouter.get("/me", companiesController.getMyCompany);

// POST /api/v1/companies — Khởi tạo hồ sơ công ty mới cho nhà tuyển dụng
companiesRouter.post("/", companiesController.createCompany);

companiesRouter.get("/", (_req, res) => {
  res.status(200).json({ module: "companies", message: "TODO: companies list" });
});

export default companiesRouter;

