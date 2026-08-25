import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import resumesRouter from "./resumes.route";
import { errorMiddleware } from "../../common/middlewares/error.middleware";
import { candidateProfilesService } from "../candidate-profiles/candidate-profiles.service";
import { resumesService } from "./resumes.service";
import { verifyAccessToken } from "../../common/security/jwt";

// Mock Services
vi.mock("../src/modules/candidate-profiles/candidate-profiles.service", () => ({
  candidateProfilesService: {
    getOrCreateByUserId: vi.fn(),
  },
}));

vi.mock("../src/modules/resumes/resumes.service", () => ({
  resumesService: {
    getMyResumes: vi.fn(),
    getById: vi.fn(),
    createOwnerResume: vi.fn(),
    setDefault: vi.fn(),
    deleteMine: vi.fn(),
    getAccessUrl: vi.fn(),
  },
}));

// Mock JWT Verify for Authenticate Middleware
vi.mock("../src/common/security/jwt", () => ({
  verifyAccessToken: vi.fn(),
}));

describe("Resumes Module (Controller Tests)", () => {
  const testApp = express();
  testApp.use(express.json());
  testApp.use("/api/v1/resumes", resumesRouter);
  testApp.use(errorMiddleware);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Auth & Role Validation", () => {
    it("returns 401 when no token is provided", async () => {
      const res = await request(testApp).get("/api/v1/resumes");
      expect(res.status).toBe(401);
      expect(res.body.errors[0].code).toBe("UNAUTHORIZED");
    });

    it("returns 403 when user is not CANDIDATE", async () => {
      // Mock JWT to return a RECRUITER
      vi.mocked(verifyAccessToken).mockReturnValueOnce({
        sub: "user_rec_1",
        email: "rec@test.com",
        role: "RECRUITER",
      } as any);

      const res = await request(testApp)
        .get("/api/v1/resumes")
        .set("Authorization", "Bearer mock_token");
        
      expect(res.status).toBe(403);
      expect(res.body.errors[0].code).toBe("FORBIDDEN");
    });
  });

  describe("With Valid Candidate", () => {
    beforeEach(() => {
      // Mock JWT to return a valid CANDIDATE
      vi.mocked(verifyAccessToken).mockReturnValue({
        sub: "user_cand_1",
        email: "cand@test.com",
        role: "CANDIDATE",
      } as any);

      // MOCK candidate profile trả về ID chuẩn để không bị lỗi
      vi.mocked(candidateProfilesService.getOrCreateByUserId).mockResolvedValue({
        id: "cand_1",
        userId: "user_cand_1",
      } as any);
    });

    it("GET /api/v1/resumes - gets my resumes", async () => {
      const mockData = [{ id: "res_1", fileName: "cv.pdf" }];
      vi.mocked(resumesService.getMyResumes).mockResolvedValue(mockData as any);

      const res = await request(testApp)
        .get("/api/v1/resumes")
        .set("Authorization", "Bearer valid_token");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockData);
      expect(candidateProfilesService.getOrCreateByUserId).toHaveBeenCalledWith("user_cand_1");
      expect(resumesService.getMyResumes).toHaveBeenCalledWith("cand_1");
    });

    it("GET /api/v1/resumes/:id - gets resume by ID", async () => {
      const mockData = { id: "res_1", fileName: "cv.pdf" };
      vi.mocked(resumesService.getById).mockResolvedValue(mockData as any);

      const res = await request(testApp)
        .get("/api/v1/resumes/res_1")
        .set("Authorization", "Bearer valid_token");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockData);
      expect(resumesService.getById).toHaveBeenCalledWith("cand_1", "res_1");
    });

    it("POST /api/v1/resumes - creates resume (upload)", async () => {
      const mockData = { id: "res_2", fileName: "new_cv.pdf" };
      vi.mocked(resumesService.createOwnerResume).mockResolvedValue(mockData as any);

      // Do test không gửi thật qua Multer, ta mock phần upload
      const res = await request(testApp)
        .post("/api/v1/resumes")
        .set("Authorization", "Bearer valid_token")
        .attach("file", Buffer.from("dummy pdf content"), "dummy.pdf");

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockData);
      expect(resumesService.createOwnerResume).toHaveBeenCalled();
    });

    it("PUT /api/v1/resumes/:id/default - sets default resume", async () => {
      const mockData = { id: "res_1", isDefault: true };
      vi.mocked(resumesService.setDefault).mockResolvedValue(mockData as any);

      const res = await request(testApp)
        .put("/api/v1/resumes/res_1/default")
        .set("Authorization", "Bearer valid_token");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockData);
      expect(resumesService.setDefault).toHaveBeenCalledWith("cand_1", "res_1");
    });

    it("DELETE /api/v1/resumes/:id - deletes resume", async () => {
      vi.mocked(resumesService.deleteMine).mockResolvedValue(undefined);

      const res = await request(testApp)
        .delete("/api/v1/resumes/res_1")
        .set("Authorization", "Bearer valid_token");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(resumesService.deleteMine).toHaveBeenCalledWith("cand_1", "res_1");
    });
  });
});
