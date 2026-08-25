import { describe, expect, it, vi, beforeEach } from "vitest";
import { AppDataSource } from "../../data-source";
import { Company } from "../../database/entities/company.entity";
import { companiesService } from "./companies.service";
import { companiesController } from "./companies.controller";
import { AppError } from "../../common/errors/app-error";
import { signAccessToken } from "../../common/security/jwt";
import type { Request, Response, NextFunction } from "express";

describe("Companies Module", () => {
  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = "test-jwt-secret-key-1234567890";
    vi.clearAllMocks();
  });

  const recruiterToken = () =>
    signAccessToken({ sub: "10", email: "hr@fpt.com", role: "RECRUITER" });

  const candidateToken = () =>
    signAccessToken({ sub: "10", email: "candidate@example.com", role: "CANDIDATE" });

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

  describe("requireRecruiter Middleware", () => {
    it("should call next with AppError 401 when req.user is missing", async () => {
      const { requireRecruiter } = await import("../../common/middlewares/require-recruiter.middleware");
      const req = { user: undefined } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;

      requireRecruiter(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error = vi.mocked(next).mock.calls[0][0] as unknown as AppError;
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe("UNAUTHORIZED");
    });

    it("should call next with AppError 403 when req.user.role is not RECRUITER", async () => {
      const { requireRecruiter } = await import("../../common/middlewares/require-recruiter.middleware");
      const req = { user: { id: "10", role: "CANDIDATE" } } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;

      requireRecruiter(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error = vi.mocked(next).mock.calls[0][0] as unknown as AppError;
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe("FORBIDDEN");
    });

    it("should call next with no error when req.user.role is RECRUITER", async () => {
      const { requireRecruiter } = await import("../../common/middlewares/require-recruiter.middleware");
      const req = { user: { id: "10", role: "RECRUITER" } } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;

      requireRecruiter(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(vi.mocked(next).mock.calls[0][0]).toBeUndefined();
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
    });

    it("should return 200 with company data when user is authenticated as RECRUITER", async () => {
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
        message: "Access token không hợp lệ hoặc đã hết hạn",
        errors: [{ code: "UNAUTHORIZED" }],
      });
    });

    it("should return 403 FORBIDDEN when user has CANDIDATE role", async () => {
      const request = (await import("supertest")).default;
      const express = (await import("express")).default;
      const companiesRouter = (await import("./companies.route")).default;
      const { errorMiddleware } = await import("../../common/middlewares/error.middleware");

      const testApp = express();
      testApp.use(express.json());
      testApp.use("/api/v1/companies", companiesRouter);
      testApp.use(errorMiddleware);

      const res = await request(testApp)
        .get("/api/v1/companies/me")
        .set("Authorization", `Bearer ${candidateToken()}`);

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        success: false,
        errors: [{ code: "FORBIDDEN" }],
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
      testApp.use("/api/v1/companies", companiesRouter);
      testApp.use(errorMiddleware);

      const res = await request(testApp)
        .get("/api/v1/companies/me")
        .set("Authorization", `Bearer ${recruiterToken()}`);

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
      testApp.use("/api/v1/companies", companiesRouter);
      testApp.use(errorMiddleware);

      const res = await request(testApp)
        .get("/api/v1/companies/me")
        .set("Authorization", `Bearer ${recruiterToken()}`);

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
      testApp.use("/api/v1/companies", companiesRouter);
      testApp.use(errorMiddleware);

      const res = await request(testApp)
        .get("/api/v1/companies/me")
        .set("Authorization", `Bearer ${recruiterToken()}`);

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
        taxCode: "0101248141",
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
          taxCode: "0101248141",
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
        taxCode: "0101248141",
        address: "Hà Nội",
      });

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        success: false,
        message: "Access token không hợp lệ hoặc đã hết hạn",
        errors: [{ code: "UNAUTHORIZED" }],
      });
    });

    it("should return 400 BAD_REQUEST on invalid phone/email or missing taxCode", async () => {
      const request = (await import("supertest")).default;
      const express = (await import("express")).default;
      const companiesRouter = (await import("./companies.route")).default;
      const { errorMiddleware } = await import("../../common/middlewares/error.middleware");

      const testApp = express();
      testApp.use(express.json());
      testApp.use("/api/v1/companies", companiesRouter);
      testApp.use(errorMiddleware);

      const res = await request(testApp)
        .post("/api/v1/companies")
        .set("Authorization", `Bearer ${recruiterToken()}`)
        .send({
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
        taxCode: "0101248141",
        address: "Cầu Giấy, Hà Nội",
        status: "ACTIVE",
      };

      vi.spyOn(companiesService, "createCompany").mockResolvedValue(mockCompany as any);

      const testApp = express();
      testApp.use(express.json());
      testApp.use("/api/v1/companies", companiesRouter);
      testApp.use(errorMiddleware);

      const res = await request(testApp)
        .post("/api/v1/companies")
        .set("Authorization", `Bearer ${recruiterToken()}`)
        .send({
          name: "Công ty Cổ phần Công nghệ FPT",
          email: "hr@fpt.com",
          phone: "02473007300",
          taxCode: "0101248141",
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

  describe("CompaniesService.updateMyCompany", () => {
    it("should throw AppError 404 when company not found", async () => {
      const findOneMock = vi.fn().mockResolvedValue(null);
      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        findOne: findOneMock,
      } as any);

      const dto = {
        name: "FPT Corp",
        email: "hr@fpt.com",
        phone: "02473007300",
        taxCode: "0101248141",
        address: "Hà Nội",
      };

      await expect(companiesService.updateMyCompany("10", dto as any)).rejects.toThrow(AppError);

      try {
        await companiesService.updateMyCompany("10", dto as any);
      } catch (err) {
        const appError = err as AppError;
        expect(appError.statusCode).toBe(404);
        expect(appError.message).toBe("Không tìm thấy hồ sơ công ty");
      }
    });

    it("should throw AppError 409 when taxCode belongs to another company", async () => {
      const existingCompany = {
        id: "1",
        userId: "10",
        taxCode: "0101248141",
        name: "FPT",
        slug: "fpt",
      };

      const findOneMock = vi
        .fn()
        .mockResolvedValueOnce(existingCompany) // recruiter's company
        .mockResolvedValueOnce({ id: "2", taxCode: "9999999999" }); // another company with new taxCode

      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        findOne: findOneMock,
      } as any);

      const dto = {
        name: "FPT",
        email: "hr@fpt.com",
        phone: "02473007300",
        taxCode: "9999999999",
        address: "Hà Nội",
      };

      try {
        await companiesService.updateMyCompany("10", dto as any);
      } catch (err) {
        const appError = err as AppError;
        expect(appError.statusCode).toBe(409);
        expect(appError.message).toBe("Mã số thuế đã tồn tại trong hệ thống");
      }
    });

    it("should preserve existing slug when name is unchanged", async () => {
      const existingCompany = {
        id: "1",
        userId: "10",
        name: "Công ty FPT",
        slug: "cong-ty-fpt",
        email: "old@fpt.com",
        phone: "02473007300",
        taxCode: "0101248141",
        address: "Hà Nội",
      };

      const saveMock = vi.fn().mockImplementation((c) => Promise.resolve(c));
      const findOneMock = vi.fn().mockResolvedValue(existingCompany);

      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        findOne: findOneMock,
        save: saveMock,
      } as any);

      const dto = {
        name: "Công ty FPT",
        email: "new@fpt.com",
        phone: "02473007300",
        taxCode: "0101248141",
        address: "Cầu Giấy, Hà Nội",
      };

      const result = await companiesService.updateMyCompany("10", dto as any);

      expect(result.slug).toBe("cong-ty-fpt");
      expect(result.email).toBe("new@fpt.com");
      expect(result.address).toBe("Cầu Giấy, Hà Nội");
    });

    it("should update slug when company name changes", async () => {
      const existingCompany = {
        id: "1",
        userId: "10",
        name: "Công ty Cũ",
        slug: "cong-ty-cu",
        email: "old@fpt.com",
        phone: "02473007300",
        taxCode: "0101248141",
        address: "Hà Nội",
      };

      const saveMock = vi.fn().mockImplementation((c) => Promise.resolve(c));
      const findOneMock = vi
        .fn()
        .mockResolvedValueOnce(existingCompany) // find by userId
        .mockResolvedValueOnce(null); // generateUniqueSlug check

      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        findOne: findOneMock,
        save: saveMock,
      } as any);

      const dto = {
        name: "Công ty FPT Mới",
        email: "hr@fpt.com",
        phone: "02473007300",
        taxCode: "0101248141",
        address: "Cầu Giấy, Hà Nội",
      };

      const result = await companiesService.updateMyCompany("10", dto as any);

      expect(result.name).toBe("Công ty FPT Mới");
      expect(result.slug).toBe("cong-ty-fpt-moi");
    });
  });

  describe("CompaniesController.updateMyCompany", () => {
    it("should call next with AppError 401 when req.user is missing", async () => {
      const req = { user: undefined, body: {} } as unknown as Request;
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
      const next = vi.fn() as unknown as NextFunction;

      await companiesController.updateMyCompany(req, res, next);

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
          phone: "invalid",
          taxCode: "",
        },
      } as unknown as Request;
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
      const next = vi.fn() as unknown as NextFunction;

      await companiesController.updateMyCompany(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error = vi.mocked(next).mock.calls[0][0] as unknown as AppError;
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("BAD_REQUEST");
    });

    it("should return 200 when update succeeds", async () => {
      const mockUpdated = {
        id: "1",
        userId: "10",
        name: "Công ty FPT Đã Cập Nhật",
        slug: "cong-ty-fpt-da-cap-nhat",
        taxCode: "0101248141",
        status: "ACTIVE",
      } as unknown as Company;

      vi.spyOn(companiesService, "updateMyCompany").mockResolvedValue(mockUpdated);

      const req = {
        user: { id: "10", role: "RECRUITER" },
        body: {
          name: "Công ty FPT Đã Cập Nhật",
          email: "hr@fpt.com",
          phone: "02473007300",
          taxCode: "0101248141",
          address: "Hà Nội",
        },
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
      const res = { status: statusMock, json: jsonMock } as unknown as Response;
      const next = vi.fn() as unknown as NextFunction;

      await companiesController.updateMyCompany(req, res, next);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: "Cập nhật thông tin công ty thành công",
        data: mockUpdated,
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("PUT /api/v1/companies/me (HTTP Endpoint)", () => {
    it("should return 401 UNAUTHORIZED when no token is provided", async () => {
      const request = (await import("supertest")).default;
      const express = (await import("express")).default;
      const companiesRouter = (await import("./companies.route")).default;
      const { errorMiddleware } = await import("../../common/middlewares/error.middleware");

      const testApp = express();
      testApp.use(express.json());
      testApp.use("/api/v1/companies", companiesRouter);
      testApp.use(errorMiddleware);

      const res = await request(testApp).put("/api/v1/companies/me").send({
        name: "Công ty FPT",
        email: "hr@fpt.com",
        phone: "02473007300",
        taxCode: "0101248141",
        address: "Hà Nội",
      });

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        success: false,
        errors: [{ code: "UNAUTHORIZED" }],
      });
    });

    it("should return 200 OK when update request is valid", async () => {
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
        taxCode: "0101248141",
        address: "Cầu Giấy, Hà Nội",
        status: "ACTIVE",
      };

      vi.spyOn(companiesService, "updateMyCompany").mockResolvedValue(mockCompany as any);

      const testApp = express();
      testApp.use(express.json());
      testApp.use("/api/v1/companies", companiesRouter);
      testApp.use(errorMiddleware);

      const res = await request(testApp)
        .put("/api/v1/companies/me")
        .set("Authorization", `Bearer ${recruiterToken()}`)
        .send({
          name: "Công ty Cổ phần Công nghệ FPT",
          email: "hr@fpt.com",
          phone: "02473007300",
          taxCode: "0101248141",
          address: "Cầu Giấy, Hà Nội",
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Cập nhật thông tin công ty thành công",
        data: mockCompany,
      });
    });
  });

  describe("CompaniesService.getPublicCompanies", () => {
    it("should return paginated active companies with taxCode included", async () => {
      const mockCompanies = [
        {
          id: "1",
          userId: "10",
          name: "Công ty FPT",
          slug: "cong-ty-fpt",
          logo: null,
          website: "https://fpt.com",
          email: "contact@fpt.com",
          phone: "02473007300",
          taxCode: "0101248141",
          companySize: "500+",
          address: "Hà Nội",
          description: "Mô tả công ty",
          status: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const qbMock: any = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([mockCompanies, 1]),
      };

      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        createQueryBuilder: vi.fn().mockReturnValue(qbMock),
      } as any);

      const result = await companiesService.getPublicCompanies({ page: 1, limit: 10 });

      expect(qbMock.where).toHaveBeenCalledWith("company.status = :status", { status: "ACTIVE" });
      expect(qbMock.skip).toHaveBeenCalledWith(0);
      expect(qbMock.take).toHaveBeenCalledWith(10);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toHaveProperty("taxCode", "0101248141");
      expect(result.items[0]).not.toHaveProperty("userId");
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it("should filter by search and companySize when provided", async () => {
      const qbMock: any = {
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };

      vi.spyOn(AppDataSource, "getRepository").mockReturnValue({
        createQueryBuilder: vi.fn().mockReturnValue(qbMock),
      } as any);

      const result = await companiesService.getPublicCompanies({
        page: 2,
        limit: 20,
        search: "Tech",
        companySize: "100-500",
      });

      expect(qbMock.andWhere).toHaveBeenCalledWith(
        "(company.name ILIKE :search OR company.address ILIKE :search)",
        { search: "%Tech%" }
      );
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        "company.companySize = :companySize",
        { companySize: "100-500" }
      );
      expect(qbMock.skip).toHaveBeenCalledWith(20);
      expect(qbMock.take).toHaveBeenCalledWith(20);
      expect(result.meta).toEqual({
        page: 2,
        limit: 20,
        total: 0,
        totalPages: 0,
      });
    });
  });

  describe("CompaniesController.getPublicCompanies", () => {
    it("should call next with AppError 400 when query validation fails", async () => {
      const req = {
        query: { page: "0", limit: "500", companySize: "INVALID" },
      } as unknown as Request;
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
      const next = vi.fn() as unknown as NextFunction;

      await companiesController.getPublicCompanies(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const error = vi.mocked(next).mock.calls[0][0] as unknown as AppError;
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("BAD_REQUEST");
    });

    it("should return 200 with company list when query is valid", async () => {
      const mockData = {
        items: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };

      vi.spyOn(companiesService, "getPublicCompanies").mockResolvedValue(mockData as any);

      const req = {
        query: { page: "1", limit: "10" },
      } as unknown as Request;

      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
      const res = { status: statusMock, json: jsonMock } as unknown as Response;
      const next = vi.fn() as unknown as NextFunction;

      await companiesController.getPublicCompanies(req, res, next);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: "Lấy danh sách công ty thành công",
        data: mockData,
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/v1/companies (Public HTTP Endpoint)", () => {
    it("should return 200 OK without requiring authentication", async () => {
      const request = (await import("supertest")).default;
      const express = (await import("express")).default;
      const companiesRouter = (await import("./companies.route")).default;
      const { errorMiddleware } = await import("../../common/middlewares/error.middleware");

      const mockData = {
        items: [
          {
            id: "1",
            name: "Công ty Cổ phần Công nghệ FPT",
            slug: "cong-ty-co-phan-cong-nghe-fpt",
            logo: null,
            website: "https://fpt.com",
            email: "contact@fpt.com",
            phone: "02473007300",
            taxCode: "0101248141",
            companySize: "500+",
            address: "Hà Nội",
            description: "Tập đoàn công nghệ",
            status: "ACTIVE",
            createdAt: "2026-08-21T09:30:00.000Z",
            updatedAt: "2026-08-21T09:30:00.000Z",
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      vi.spyOn(companiesService, "getPublicCompanies").mockResolvedValue(mockData as any);

      const testApp = express();
      testApp.use(express.json());
      testApp.use("/api/v1/companies", companiesRouter);
      testApp.use(errorMiddleware);

      const res = await request(testApp).get("/api/v1/companies?page=1&limit=10");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: "Lấy danh sách công ty thành công",
        data: mockData,
      });
      expect(res.body.data.items[0]).toHaveProperty("taxCode", "0101248141");
    });

    it("should return 400 BAD_REQUEST on invalid query param", async () => {
      const request = (await import("supertest")).default;
      const express = (await import("express")).default;
      const companiesRouter = (await import("./companies.route")).default;
      const { errorMiddleware } = await import("../../common/middlewares/error.middleware");

      const testApp = express();
      testApp.use(express.json());
      testApp.use("/api/v1/companies", companiesRouter);
      testApp.use(errorMiddleware);

      const res = await request(testApp).get("/api/v1/companies?page=-1");

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        success: false,
        errors: [{ code: "BAD_REQUEST" }],
      });
    });
  });
});
