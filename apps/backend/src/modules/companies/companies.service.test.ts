import { describe, expect, it, vi, beforeEach } from "vitest";
import { AppDataSource } from "../../data-source";
import { Company } from "../../database/entities/company.entity";
import { companiesService } from "./companies.service";
import { companiesController } from "./companies.controller";
import { AppError } from "../../common/errors/app-error";
import type { Request, Response, NextFunction } from "express";

describe("Companies Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("CompaniesService.getMyCompany", () => {
    it("should return company when company exists for user", async () => {
      const mockCompany = {
        id: "1",
        userId: "10",
        name: "Công ty Cổ phần Công nghệ FPT",
        slug: "cong-ty-co-phan-cong-nghe-fpt",
        logo: "companies/fpt-logo.png",
        website: "https://fpt.com",
        email: "hr@fpt.com",
        phone: "02473007300",
        taxCode: "0101248141",
        companySize: "500+",
        address: "Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội",
        description: "Tập đoàn công nghệ hàng đầu Việt Nam",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Company;

      const findOneMock = vi.fn().mockResolvedValue(mockCompany);
      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        findOne: findOneMock,
      } as any);

      const result = await companiesService.getMyCompany("10");

      expect(findOneMock).toHaveBeenCalledWith({ where: { userId: "10" } });
      expect(result).toEqual(mockCompany);
    });

    it("should throw AppError 404 when company does not exist", async () => {
      const findOneMock = vi.fn().mockResolvedValue(null);
      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        findOne: findOneMock,
      } as any);

      await expect(companiesService.getMyCompany("999")).rejects.toThrow(AppError);

      try {
        await companiesService.getMyCompany("999");
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        const appError = err as AppError;
        expect(appError.statusCode).toBe(404);
        expect(appError.code).toBe("NOT_FOUND");
        expect(appError.message).toBe("Nhà tuyển dụng chưa khởi tạo hồ sơ công ty");
      }
    });
    it("should propagate unexpected database error", async () => {
      const dbError = new Error("Database connection timeout");
      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        findOne: vi.fn().mockRejectedValue(dbError),
      } as any);

      await expect(companiesService.getMyCompany("10")).rejects.toThrow("Database connection timeout");
    });
  });

  describe("CompaniesController.getMyCompany", () => {
    it("should call next with AppError 401 when req.user is not set", async () => {
      const req = { user: undefined } as unknown as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn() as unknown as NextFunction;

      await companiesController.getMyCompany(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error = vi.mocked(next).mock.calls[0][0] as unknown as AppError;
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe("UNAUTHORIZED");
      expect(error.message).toBe("Chưa đăng nhập hoặc token không hợp lệ");
    });

    it("should call next with AppError 401 when req.user.id is empty string", async () => {
      const req = { user: { id: "", role: "RECRUITER" } } as unknown as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn() as unknown as NextFunction;

      await companiesController.getMyCompany(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error = vi.mocked(next).mock.calls[0][0] as unknown as AppError;
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
    });

    it("should return 200 with company data when user is authenticated", async () => {
      const mockCompany = {
        id: "1",
        userId: "10",
        name: "Công ty Cổ phần Công nghệ FPT",
        slug: "cong-ty-co-phan-cong-nghe-fpt",
        status: "ACTIVE",
      } as unknown as Company;

      vi.spyOn(companiesService, "getMyCompany").mockResolvedValue(mockCompany);

      const req = { user: { id: "10", role: "RECRUITER" } } as unknown as Request;
      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
      const res = {
        status: statusMock,
        json: jsonMock,
      } as unknown as Response;
      const next = vi.fn() as unknown as NextFunction;

      await companiesController.getMyCompany(req, res, next);

      expect(companiesService.getMyCompany).toHaveBeenCalledWith("10");
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: "Lấy thông tin công ty thành công",
        data: mockCompany,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should pass error to next if service throws an error", async () => {
      const error = new AppError(404, "NOT_FOUND", "Nhà tuyển dụng chưa khởi tạo hồ sơ công ty");
      vi.spyOn(companiesService, "getMyCompany").mockRejectedValue(error);

      const req = { user: { id: "10", role: "RECRUITER" } } as unknown as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn() as unknown as NextFunction;

      await companiesController.getMyCompany(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GET /api/v1/companies/me (HTTP Endpoint)", () => {
    it("should return 401 UNAUTHORIZED when no user session/token is provided", async () => {
      const request = (await import("supertest")).default;
      const express = (await import("express")).default;
      const companiesRouter = (await import("./companies.route")).default;
      const { errorMiddleware } = await import("../../common/middlewares/error.middleware");

      const testApp = express();
      testApp.use(express.json());
      testApp.use("/api/v1/companies", companiesRouter);
      testApp.use(errorMiddleware);

      const res = await request(testApp).get("/api/v1/companies/me");

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        success: false,
        message: "Chưa đăng nhập hoặc token không hợp lệ",
        errors: [{ code: "UNAUTHORIZED" }],
      });
    });

    it("should return 200 with full company data when recruiter is authenticated", async () => {
      const request = (await import("supertest")).default;
      const express = (await import("express")).default;
      const companiesRouter = (await import("./companies.route")).default;
      const { errorMiddleware } = await import("../../common/middlewares/error.middleware");

      const mockCompany = {
        id: "1",
        userId: "10",
        name: "Công ty Cổ phần Công nghệ FPT",
        slug: "cong-ty-co-phan-cong-nghe-fpt",
        logo: "companies/fpt-logo.png",
        website: "https://fpt.com",
        email: "hr@fpt.com",
        phone: "02473007300",
        taxCode: "0101248141",
        companySize: "500+",
        address: "Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội",
        description: "Tập đoàn công nghệ hàng đầu Việt Nam",
        status: "ACTIVE",
        createdAt: "2026-08-20T08:30:00.000Z",
        updatedAt: "2026-08-21T09:15:00.000Z",
      };

      vi.spyOn(companiesService, "getMyCompany").mockResolvedValue(mockCompany as any);

      const testApp = express();
      testApp.use(express.json());
      // Giả lập middleware auth đã gán req.user
      testApp.use((req, _res, next) => {
        req.user = { id: "10", email: "hr@fpt.com", role: "RECRUITER" };
        next();
      });
      testApp.use("/api/v1/companies", companiesRouter);
      testApp.use(errorMiddleware);

      const res = await request(testApp).get("/api/v1/companies/me");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Lấy thông tin công ty thành công",
        data: mockCompany,
      });
    });

    it("should return 404 NOT_FOUND when company does not exist for the recruiter", async () => {
      const request = (await import("supertest")).default;
      const express = (await import("express")).default;
      const companiesRouter = (await import("./companies.route")).default;
      const { errorMiddleware } = await import("../../common/middlewares/error.middleware");

      vi.spyOn(companiesService, "getMyCompany").mockRejectedValue(
        new AppError(404, "NOT_FOUND", "Nhà tuyển dụng chưa khởi tạo hồ sơ công ty")
      );

      const testApp = express();
      testApp.use(express.json());
      testApp.use((req, _res, next) => {
        req.user = { id: "999", email: "hr@fpt.com", role: "RECRUITER" };
        next();
      });
      testApp.use("/api/v1/companies", companiesRouter);
      testApp.use(errorMiddleware);

      const res = await request(testApp).get("/api/v1/companies/me");

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        success: false,
        message: "Nhà tuyển dụng chưa khởi tạo hồ sơ công ty",
        errors: [{ code: "NOT_FOUND" }],
      });
    });

    it("should return 500 INTERNAL_SERVER_ERROR on unexpected server error", async () => {
      const request = (await import("supertest")).default;
      const express = (await import("express")).default;
      const companiesRouter = (await import("./companies.route")).default;
      const { errorMiddleware } = await import("../../common/middlewares/error.middleware");

      vi.spyOn(companiesService, "getMyCompany").mockRejectedValue(
        new Error("Unexpected crash")
      );

      const testApp = express();
      testApp.use(express.json());
      testApp.use((req, _res, next) => {
        req.user = { id: "10", email: "hr@fpt.com", role: "RECRUITER" };
        next();
      });
      testApp.use("/api/v1/companies", companiesRouter);
      testApp.use(errorMiddleware);

      const res = await request(testApp).get("/api/v1/companies/me");

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        success: false,
        message: "Lỗi hệ thống, vui lòng thử lại sau",
        errors: [{ code: "INTERNAL_SERVER_ERROR" }],
      });
    });
  });

  describe("slugify Utility", () => {
    it("should correctly slugify Vietnamese text and special characters", async () => {
      const { slugify } = await import("./utils/slug.util");

      expect(slugify("Công ty Cổ phần Công nghệ FPT")).toBe("cong-ty-co-phan-cong-nghe-fpt");
      expect(slugify("  Tập đoàn Đèo Cả - Chi nhánh 1!  ")).toBe("tap-doan-deo-ca-chi-nhanh-1");
      expect(slugify("")).toBe("company");
    });
  });

  describe("CompaniesService.createCompany & generateUniqueSlug", () => {
    it("should generate a unique slug when base slug is not taken", async () => {
      const findOneMock = vi.fn().mockResolvedValue(null);
      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        findOne: findOneMock,
      } as any);

      const slug = await companiesService.generateUniqueSlug("FPT Software");
      expect(slug).toBe("fpt-software");
    });

    it("should append suffix when base slug already exists", async () => {
      const findOneMock = vi
        .fn()
        .mockResolvedValueOnce({ id: "1", slug: "fpt-software" })
        .mockResolvedValueOnce({ id: "2", slug: "fpt-software-1" })
        .mockResolvedValueOnce(null);

      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        findOne: findOneMock,
      } as any);

      const slug = await companiesService.generateUniqueSlug("FPT Software");
      expect(slug).toBe("fpt-software-2");
    });

    it("should throw AppError 409 when user already has a company", async () => {
      const findOneMock = vi.fn().mockResolvedValue({ id: "1", userId: "10" });
      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        findOne: findOneMock,
      } as any);

      const dto = {
        name: "Công ty Mới",
        email: "contact@moi.com",
        phone: "0912345678",
        address: "Hà Nội",
      };

      await expect(companiesService.createCompany("10", dto as any)).rejects.toThrow(AppError);

      try {
        await companiesService.createCompany("10", dto as any);
      } catch (err) {
        const appError = err as AppError;
        expect(appError.statusCode).toBe(409);
        expect(appError.code).toBe("CONFLICT");
        expect(appError.message).toBe("Tài khoản của bạn đã sở hữu một hồ sơ công ty");
      }
    });

    it("should throw AppError 409 when taxCode already exists in system", async () => {
      const findOneMock = vi
        .fn()
        .mockResolvedValueOnce(null) // user has no company
        .mockResolvedValueOnce({ id: "2", taxCode: "0101248141" }); // tax code exists

      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        findOne: findOneMock,
      } as any);

      const dto = {
        name: "Công ty Mới",
        email: "contact@moi.com",
        phone: "0912345678",
        taxCode: "0101248141",
        address: "Hà Nội",
      };

      try {
        await companiesService.createCompany("10", dto as any);
      } catch (err) {
        const appError = err as AppError;
        expect(appError.statusCode).toBe(409);
        expect(appError.code).toBe("CONFLICT");
        expect(appError.message).toBe("Mã số thuế đã tồn tại trong hệ thống");
      }
    });

    it("should create and return company when valid", async () => {
      const findOneMock = vi.fn().mockResolvedValue(null);
      const createMock = vi.fn().mockImplementation((val) => val);
      const saveMock = vi.fn().mockImplementation((val) => Promise.resolve({ id: "100", ...val }));

      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        findOne: findOneMock,
        create: createMock,
        save: saveMock,
      } as any);

      const dto = {
        name: "Công ty Cổ phần Công nghệ FPT",
        email: "contact@fpt.com",
        phone: "02473007300",
        address: "Cầu Giấy, Hà Nội",
        website: "https://fpt.com",
        taxCode: "0101248141",
        companySize: "500+" as const,
      };

      const result = await companiesService.createCompany("10", dto as any);

      expect(result.id).toBe("100");
      expect(result.name).toBe("Công ty Cổ phần Công nghệ FPT");
      expect(result.slug).toBe("cong-ty-co-phan-cong-nghe-fpt");
      expect(result.status).toBe("ACTIVE");
      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe("CompaniesController.createCompany", () => {
    it("should call next with AppError 401 when req.user is missing", async () => {
      const req = { user: undefined, body: {} } as unknown as Request;
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
      const next = vi.fn() as unknown as NextFunction;

      await companiesController.createCompany(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error = vi.mocked(next).mock.calls[0][0] as unknown as AppError;
      expect(error.statusCode).toBe(401);
    });

    it("should call next with AppError 400 when validation fails", async () => {
      const req = {
        user: { id: "10", role: "RECRUITER" },
        body: {
          name: "",
          email: "invalid-email",
          phone: "123",
          companySize: "invalid-size",
          website: "not-a-url",
          address: "",
        },
      } as unknown as Request;
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
      const next = vi.fn() as unknown as NextFunction;

      await companiesController.createCompany(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error = vi.mocked(next).mock.calls[0][0] as unknown as AppError;
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("BAD_REQUEST");
    });

    it("should return 201 when create company succeeds", async () => {
      const mockCreated = {
        id: "1",
        userId: "10",
        name: "Công ty FPT",
        slug: "cong-ty-fpt",
        status: "ACTIVE",
      } as unknown as Company;

      vi.spyOn(companiesService, "createCompany").mockResolvedValue(mockCreated);

      const req = {
        user: { id: "10", role: "RECRUITER" },
        body: {
          name: "Công ty FPT",
          email: "hr@fpt.com",
          phone: "02473007300",
          address: "Hà Nội",
        },
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
      const res = { status: statusMock, json: jsonMock } as unknown as Response;
      const next = vi.fn() as unknown as NextFunction;

      await companiesController.createCompany(req, res, next);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: "Khởi tạo hồ sơ công ty thành công",
        data: mockCreated,
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/v1/companies (HTTP Endpoint)", () => {
    it("should return 401 UNAUTHORIZED when no token is provided", async () => {
      const request = (await import("supertest")).default;
      const express = (await import("express")).default;
      const companiesRouter = (await import("./companies.route")).default;
      const { errorMiddleware } = await import("../../common/middlewares/error.middleware");

      const testApp = express();
      testApp.use(express.json());
      testApp.use("/api/v1/companies", companiesRouter);
      testApp.use(errorMiddleware);

      const res = await request(testApp).post("/api/v1/companies").send({
        name: "Công ty FPT",
        email: "hr@fpt.com",
        phone: "02473007300",
        address: "Hà Nội",
      });

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        success: false,
        message: "Chưa đăng nhập hoặc token không hợp lệ",
        errors: [{ code: "UNAUTHORIZED" }],
      });
    });

    it("should return 400 BAD_REQUEST on invalid phone/email", async () => {
      const request = (await import("supertest")).default;
      const express = (await import("express")).default;
      const companiesRouter = (await import("./companies.route")).default;
      const { errorMiddleware } = await import("../../common/middlewares/error.middleware");

      const testApp = express();
      testApp.use(express.json());
      testApp.use((req, _res, next) => {
        req.user = { id: "10", email: "hr@fpt.com", role: "RECRUITER" };
        next();
      });
      testApp.use("/api/v1/companies", companiesRouter);
      testApp.use(errorMiddleware);

      const res = await request(testApp).post("/api/v1/companies").send({
        name: "Công ty FPT",
        email: "not-an-email",
        phone: "12345",
        address: "Hà Nội",
      });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        success: false,
        errors: [
          {
            code: "BAD_REQUEST",
          },
        ],
      });
    });

    it("should return 201 CREATED when request is valid", async () => {
      const request = (await import("supertest")).default;
      const express = (await import("express")).default;
      const companiesRouter = (await import("./companies.route")).default;
      const { errorMiddleware } = await import("../../common/middlewares/error.middleware");

      const mockCompany = {
        id: "1",
        userId: "10",
        name: "Công ty Cổ phần Công nghệ FPT",
        slug: "cong-ty-co-phan-cong-nghe-fpt",
        email: "hr@fpt.com",
        phone: "02473007300",
        address: "Cầu Giấy, Hà Nội",
        status: "ACTIVE",
      };

      vi.spyOn(companiesService, "createCompany").mockResolvedValue(mockCompany as any);

      const testApp = express();
      testApp.use(express.json());
      testApp.use((req, _res, next) => {
        req.user = { id: "10", role: "RECRUITER" };
        next();
      });
      testApp.use("/api/v1/companies", companiesRouter);
      testApp.use(errorMiddleware);

      const res = await request(testApp).post("/api/v1/companies").send({
        name: "Công ty Cổ phần Công nghệ FPT",
        email: "hr@fpt.com",
        phone: "02473007300",
        address: "Cầu Giấy, Hà Nội",
      });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        success: true,
        message: "Khởi tạo hồ sơ công ty thành công",
        data: mockCompany,
      });
    });
  });
});

