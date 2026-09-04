/// <reference path="../src/common/types/express.d.ts" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import applicationsRouter, {
  jobsApplicationsRouter,
  savedJobsRouter,
} from "../src/modules/applications/applications.route";
import { errorMiddleware } from "../src/common/middlewares/error.middleware";
import { AppDataSource } from "../src/data-source";
import { ApplicationEntity } from "../src/database/entities/application.entity";
import { SavedJobEntity } from "../src/database/entities/saved-job.entity";
import { CandidateProfileEntity } from "../src/database/entities/candidate-profile.entity";
import { ResumeEntity } from "../src/database/entities/resume.entity";
import { Job } from "../src/database/entities/job.entity";
import { Company } from "../src/database/entities/company.entity";
import { UserEntity } from "../src/database/entities/user.entity";
import { EducationEntity } from "../src/database/entities/education.entity";
import { WorkExperienceEntity } from "../src/database/entities/work-experience.entity";
import { CandidateSkillEntity } from "../src/database/entities/candidate-skill.entity";
import { JobCategory } from "../src/database/entities/job-category.entity";
import { ApplicationStatus } from "../src/common/constants";
import { JOB_STATUS } from "../src/common/constants/job";
import { notificationService } from "../src/modules/notifications/notification.service";

vi.mock("../src/modules/notifications/notification.service", () => ({
  notificationService: {
    create: vi.fn().mockResolvedValue({ id: "notif_1" }),
  },
}));

vi.mock("../src/common/middlewares/authenticate.middleware", () => ({
  authenticate: (_req: unknown, _res: unknown, next: () => void) => {
    next();
  },
}));

describe("Applications & Saved Jobs Module", () => {
  let currentUser: {
    id: string;
    role: "CANDIDATE" | "RECRUITER" | "ADMIN";
  } | null = null;

  const testApp = express();
  testApp.use(express.json());
  testApp.use((req, _res, next) => {
    if (currentUser) {
      req.user = currentUser;
    }
    next();
  });
  testApp.use("/api/v1/applications", applicationsRouter);
  testApp.use("/api/v1/jobs", jobsApplicationsRouter);
  testApp.use("/api/v1/saved-jobs", savedJobsRouter);
  testApp.use(errorMiddleware);

  const mockApplicationQueryBuilder = {
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    addSelect: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    addGroupBy: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    addOrderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    take: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    getRawMany: vi.fn().mockResolvedValue([
      {
        id: "app_1",
        candidateId: "cand_1",
        jobId: "10",
        status: ApplicationStatus.APPLIED,
        appliedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        jobTitle: "Senior Backend Developer",
        companyName: "Tech Corp",
        jobStatus: JOB_STATUS.APPROVED,
      },
    ]),
    getMany: vi
      .fn()
      .mockResolvedValue([
        { id: "app_1", jobId: "50", status: ApplicationStatus.VIEWED },
      ]),
  };

  const mockApplicationRepo = {
    create: vi.fn((data) => ({
      id: "99",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    })),
    save: vi.fn(async (data) => ({
      id: "99",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    })),
    findOne: vi.fn(),
    find: vi.fn(),
    createQueryBuilder: vi.fn(() => mockApplicationQueryBuilder),
  };

  const mockSavedJobRepo = {
    create: vi.fn((data) => ({ id: "1", createdAt: new Date(), ...data })),
    save: vi.fn(async (data) => ({ id: "1", createdAt: new Date(), ...data })),
    findOne: vi.fn(),
    find: vi.fn(),
    remove: vi.fn(),
  };

  const mockCandidateProfileRepo = {
    findOne: vi.fn(),
  };

  const mockResumeRepo = {
    findOne: vi.fn(),
  };

  const mockJobRepo = {
    findOne: vi.fn(),
    find: vi.fn(),
  };

  const mockCompanyRepo = {
    findOne: vi.fn(),
  };

  const mockUserRepo = {
    findOne: vi.fn(),
  };

  const mockEducationRepo = {
    find: vi.fn().mockResolvedValue([]),
  };

  const mockWorkExperienceRepo = {
    find: vi.fn().mockResolvedValue([]),
  };

  const mockCandidateSkillRepo = {
    find: vi.fn().mockResolvedValue([]),
  };

  const mockJobCategoryRepo = {
    find: vi.fn().mockResolvedValue([]),
    findOne: vi.fn().mockResolvedValue(null),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = null;

    mockApplicationRepo.findOne.mockResolvedValue(null);
    mockSavedJobRepo.findOne.mockResolvedValue(null);
    mockCompanyRepo.findOne.mockResolvedValue(null);
    mockUserRepo.findOne.mockResolvedValue(null);
    mockCandidateProfileRepo.findOne.mockResolvedValue(null);
    mockResumeRepo.findOne.mockResolvedValue(null);
    mockJobRepo.findOne.mockResolvedValue(null);
    mockEducationRepo.find.mockResolvedValue([]);
    mockWorkExperienceRepo.find.mockResolvedValue([]);
    mockCandidateSkillRepo.find.mockResolvedValue([]);
    mockJobCategoryRepo.find.mockResolvedValue([]);
    mockJobCategoryRepo.findOne.mockResolvedValue(null);

    mockApplicationQueryBuilder.getRawMany.mockResolvedValue([
      {
        id: "app_1",
        candidateId: "cand_1",
        jobId: "10",
        status: ApplicationStatus.APPLIED,
        appliedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        jobTitle: "Senior Backend Developer",
        companyName: "Tech Corp",
        jobStatus: JOB_STATUS.APPROVED,
      },
    ]);

    vi.spyOn(AppDataSource, "getRepository").mockImplementation(
      (entity: any) => {
        if (entity === ApplicationEntity) return mockApplicationRepo as any;
        if (entity === SavedJobEntity) return mockSavedJobRepo as any;
        if (entity === CandidateProfileEntity)
          return mockCandidateProfileRepo as any;
        if (entity === ResumeEntity) return mockResumeRepo as any;
        if (entity === Job) return mockJobRepo as any;
        if (entity === Company) return mockCompanyRepo as any;
        if (entity === UserEntity) return mockUserRepo as any;
        if (entity === EducationEntity) return mockEducationRepo as any;
        if (entity === WorkExperienceEntity) return mockWorkExperienceRepo as any;
        if (entity === CandidateSkillEntity) return mockCandidateSkillRepo as any;
        if (entity === JobCategory) return mockJobCategoryRepo as any;
        return {} as any;
      },
    );
  });

  describe("Auth & Role Validation", () => {
    it("returns 401 when unauthenticated", async () => {
      const res = await request(testApp).get("/api/v1/applications");
      expect(res.status).toBe(401);
      expect(res.body.errors[0].code).toBe("UNAUTHORIZED");
    });
  });

  describe("With Mock Candidate User", () => {
    beforeEach(() => {
      currentUser = { id: "user_cand_1", role: "CANDIDATE" };
    });

    describe("POST /api/v1/jobs/:jobId/apply", () => {
      it("fails if candidate profile is not found", async () => {
        mockCandidateProfileRepo.findOne.mockResolvedValue(null);

        const res = await request(testApp)
          .post("/api/v1/jobs/10/apply")
          .send({ resumeId: "res_1" });

        expect(res.status).toBe(404);
        expect(res.body.errors[0].code).toBe("CANDIDATE_PROFILE_NOT_FOUND");
      });

      it("fails if job is not found", async () => {
        mockCandidateProfileRepo.findOne.mockResolvedValue({
          id: "cand_1",
          userId: "user_cand_1",
        });
        mockJobRepo.findOne.mockResolvedValue(null);

        const res = await request(testApp)
          .post("/api/v1/jobs/999/apply")
          .send({ resumeId: "res_1" });

        expect(res.status).toBe(404);
        expect(res.body.errors[0].code).toBe("JOB_NOT_FOUND");
      });

      it("fails if job is closed or not approved", async () => {
        mockCandidateProfileRepo.findOne.mockResolvedValue({
          id: "cand_1",
          userId: "user_cand_1",
        });
        mockJobRepo.findOne.mockResolvedValue({
          id: "10",
          status: JOB_STATUS.CLOSED,
        });

        const res = await request(testApp)
          .post("/api/v1/jobs/10/apply")
          .send({ resumeId: "res_1" });

        expect(res.status).toBe(400);
        expect(res.body.errors[0].code).toBe("JOB_CLOSED");
      });

      it("fails if specified resume does not exist", async () => {
        mockCandidateProfileRepo.findOne.mockResolvedValue({
          id: "cand_1",
          userId: "user_cand_1",
        });
        mockJobRepo.findOne.mockResolvedValue({
          id: "10",
          status: JOB_STATUS.APPROVED,
        });
        mockResumeRepo.findOne.mockResolvedValue(null);

        const res = await request(testApp)
          .post("/api/v1/jobs/10/apply")
          .send({ resumeId: "non_existent" });

        expect(res.status).toBe(404);
        expect(res.body.errors[0].code).toBe("RESUME_NOT_FOUND");
      });

      it("fails if resumeId omitted and no default resume exists", async () => {
        mockCandidateProfileRepo.findOne.mockResolvedValue({
          id: "cand_1",
          userId: "user_cand_1",
        });
        mockJobRepo.findOne.mockResolvedValue({
          id: "10",
          status: JOB_STATUS.APPROVED,
        });
        mockResumeRepo.findOne.mockResolvedValue(null);

        const res = await request(testApp)
          .post("/api/v1/jobs/10/apply")
          .send({});

        expect(res.status).toBe(400);
        expect(res.body.errors[0].code).toBe("RESUME_REQUIRED");
      });

      it("fails if application already exists (409 Conflict)", async () => {
        mockCandidateProfileRepo.findOne.mockResolvedValue({
          id: "cand_1",
          userId: "user_cand_1",
        });
        mockJobRepo.findOne.mockResolvedValue({
          id: "10",
          status: JOB_STATUS.APPROVED,
        });
        mockResumeRepo.findOne.mockResolvedValue({
          id: "res_1",
          fileUrl: "resumes/cv.pdf",
          isDefault: true,
        });
        mockApplicationRepo.findOne.mockResolvedValue({
          id: "app_old",
          candidateId: "cand_1",
          jobId: "10",
        });

        const res = await request(testApp)
          .post("/api/v1/jobs/10/apply")
          .send({ resumeId: "res_1" });

        expect(res.status).toBe(409);
        expect(res.body.errors[0].code).toBe("APPLICATION_ALREADY_EXISTS");
      });

      it("successfully applies to job with default resume", async () => {
        mockCandidateProfileRepo.findOne.mockResolvedValue({
          id: "cand_1",
          userId: "user_cand_1",
        });
        mockJobRepo.findOne.mockResolvedValue({
          id: "10",
          title: "Senior Backend Developer",
          status: JOB_STATUS.APPROVED,
        });
        mockResumeRepo.findOne.mockResolvedValue({
          id: "res_def",
          fileUrl: "resumes/default.pdf",
          isDefault: true,
        });
        mockApplicationRepo.findOne.mockResolvedValue(null);
        mockCompanyRepo.findOne.mockResolvedValue({
          id: "comp_1",
          userId: "user_rec_1",
        });
        mockUserRepo.findOne.mockResolvedValue({
          id: "user_cand_1",
          fullName: "Nguyễn Văn A",
        });

        const res = await request(testApp)
          .post("/api/v1/jobs/10/apply")
          .send({});

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Ứng tuyển thành công");
        expect(res.body.data.candidateId).toBe("cand_1");
        expect(res.body.data.jobId).toBe("10");
        expect(res.body.data.resumeSnapshotUrl).toBe("resumes/default.pdf");
        expect(res.body.data.status).toBe(ApplicationStatus.APPLIED);
        expect(notificationService.create).toHaveBeenCalledWith({
          userId: "user_rec_1",
          type: "NEW_APPLICATION",
          target: { type: "APPLICATION", id: "99" },
          params: {
            candidateName: "Nguyễn Văn A",
            jobTitle: "Senior Backend Developer",
          },
        });
      });

      it("continues apply flow even if notificationService fails (resilience)", async () => {
        mockCandidateProfileRepo.findOne.mockResolvedValue({
          id: "cand_1",
          userId: "user_cand_1",
        });
        mockJobRepo.findOne.mockResolvedValue({
          id: "10",
          title: "Senior Backend Developer",
          status: JOB_STATUS.APPROVED,
        });
        mockResumeRepo.findOne.mockResolvedValue({
          id: "res_def",
          fileUrl: "resumes/default.pdf",
          isDefault: true,
        });
        mockApplicationRepo.findOne.mockResolvedValue(null);
        mockCompanyRepo.findOne.mockResolvedValue({
          id: "comp_1",
          userId: "user_rec_1",
        });
        mockUserRepo.findOne.mockResolvedValue({
          id: "user_cand_1",
          fullName: "Nguyễn Văn A",
        });
        vi.mocked(notificationService.create).mockRejectedValueOnce(
          new Error("Notification service unavailable"),
        );

        const res = await request(testApp)
          .post("/api/v1/jobs/10/apply")
          .send({});

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
      });

      it("handles race condition (DB unique_violation 23505) returning 409 Conflict", async () => {
        mockCandidateProfileRepo.findOne.mockResolvedValue({
          id: "cand_1",
          userId: "user_cand_1",
        });
        mockJobRepo.findOne.mockResolvedValue({
          id: "10",
          status: JOB_STATUS.APPROVED,
        });
        mockResumeRepo.findOne.mockResolvedValue({
          id: "res_1",
          fileUrl: "resumes/cv.pdf",
          isDefault: true,
        });
        mockApplicationRepo.findOne.mockResolvedValue(null);
        mockApplicationRepo.save.mockRejectedValueOnce({
          code: "23505",
          message: "duplicate key value violates unique constraint",
        });

        const res = await request(testApp)
          .post("/api/v1/jobs/10/apply")
          .send({ resumeId: "res_1" });

        expect(res.status).toBe(409);
        expect(res.body.errors[0].code).toBe("APPLICATION_ALREADY_EXISTS");
      });
    });

    describe("GET /api/v1/applications", () => {
      it("lists candidate applications", async () => {
        mockCandidateProfileRepo.findOne.mockResolvedValue({
          id: "cand_1",
          userId: "user_cand_1",
        });
        mockApplicationRepo.find.mockResolvedValue([
          {
            id: "app_1",
            candidateId: "cand_1",
            jobId: "10",
            status: ApplicationStatus.APPLIED,
          },
        ]);

        const res = await request(testApp).get("/api/v1/applications");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].id).toBe("app_1");
      });

      it("returns 400 when filtering with invalid status", async () => {
        mockCandidateProfileRepo.findOne.mockResolvedValue({
          id: "cand_1",
          userId: "user_cand_1",
        });

        const res = await request(testApp).get(
          "/api/v1/applications?status=INVALID_STATUS",
        );
        expect(res.status).toBe(400);
        expect(res.body.errors[0].code).toBe("INVALID_STATUS");
      });
    });

    describe("GET /api/v1/applications/:id", () => {
      it("returns 404 if application not found", async () => {
        mockApplicationRepo.findOne.mockResolvedValue(null);

        const res = await request(testApp).get("/api/v1/applications/999");
        expect(res.status).toBe(404);
        expect(res.body.errors[0].code).toBe("APPLICATION_NOT_FOUND");
      });

      it("returns 403 if candidate is not owner of application", async () => {
        mockApplicationRepo.findOne.mockResolvedValue({
          id: "app_1",
          candidateId: "other_cand",
        });
        mockCandidateProfileRepo.findOne.mockResolvedValue({
          id: "cand_1",
          userId: "user_cand_1",
        });

        const res = await request(testApp).get("/api/v1/applications/app_1");
        expect(res.status).toBe(403);
        expect(res.body.errors[0].code).toBe("FORBIDDEN");
      });

      it("returns application detail for owner candidate", async () => {
        mockApplicationRepo.findOne.mockResolvedValue({
          id: "app_1",
          candidateId: "cand_1",
          status: ApplicationStatus.APPLIED,
        });
        mockCandidateProfileRepo.findOne.mockResolvedValue({
          id: "cand_1",
          userId: "user_cand_1",
        });

        const res = await request(testApp).get("/api/v1/applications/app_1");
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe("app_1");
      });
    });

    describe("POST /api/v1/applications/:id/withdraw", () => {
      it("fails if status is not APPLIED or VIEWED", async () => {
        mockApplicationRepo.findOne.mockResolvedValue({
          id: "app_1",
          candidateId: "cand_1",
          status: ApplicationStatus.INTERVIEW,
        });
        mockCandidateProfileRepo.findOne.mockResolvedValue({
          id: "cand_1",
          userId: "user_cand_1",
        });

        const res = await request(testApp).post(
          "/api/v1/applications/app_1/withdraw",
        );
        expect(res.status).toBe(400);
        expect(res.body.errors[0].code).toBe("CANNOT_WITHDRAW");
      });

      it("successfully withdraws application if status is APPLIED", async () => {
        const appObj = {
          id: "app_1",
          candidateId: "cand_1",
          status: ApplicationStatus.APPLIED,
        };
        mockApplicationRepo.findOne.mockResolvedValue(appObj);
        mockCandidateProfileRepo.findOne.mockResolvedValue({
          id: "cand_1",
          userId: "user_cand_1",
        });

        const res = await request(testApp).post(
          "/api/v1/applications/app_1/withdraw",
        );
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe(ApplicationStatus.WITHDRAWN);
      });
    });

    describe("Saved Jobs Endpoints", () => {
      it("POST /api/v1/jobs/:jobId/save returns 201 on new save", async () => {
        mockCandidateProfileRepo.findOne.mockResolvedValue({
          id: "cand_1",
          userId: "user_cand_1",
        });
        mockJobRepo.findOne.mockResolvedValue({ id: "50" });
        mockSavedJobRepo.findOne.mockResolvedValue(null);

        const res = await request(testApp).post("/api/v1/jobs/50/save");
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.jobId).toBe("50");
      });

      it("POST /api/v1/jobs/:jobId/save returns 200 idempotent if already saved", async () => {
        mockCandidateProfileRepo.findOne.mockResolvedValue({
          id: "cand_1",
          userId: "user_cand_1",
        });
        mockJobRepo.findOne.mockResolvedValue({ id: "50" });
        mockSavedJobRepo.findOne.mockResolvedValue({
          id: "1",
          candidateId: "cand_1",
          jobId: "50",
        });

        const res = await request(testApp).post("/api/v1/jobs/50/save");
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.jobId).toBe("50");
      });

      it("POST /api/v1/jobs/:jobId/save handles race condition (DB unique_violation 23505) and returns existing saved job with 200", async () => {
        mockCandidateProfileRepo.findOne.mockResolvedValue({
          id: "cand_1",
          userId: "user_cand_1",
        });
        mockJobRepo.findOne.mockResolvedValue({ id: "50" });
        // First findOne returns null (not yet saved in pre-check), save fails with 23505, subsequent findOne returns existing
        mockSavedJobRepo.findOne
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({
            id: "1",
            candidateId: "cand_1",
            jobId: "50",
          });
        mockSavedJobRepo.save.mockRejectedValueOnce({
          code: "23505",
          message: "duplicate key value violates unique constraint",
        });

        const res = await request(testApp).post("/api/v1/jobs/50/save");
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.jobId).toBe("50");
      });

      it("DELETE /api/v1/jobs/:jobId/save returns 200 idempotent", async () => {
        mockCandidateProfileRepo.findOne.mockResolvedValue({
          id: "cand_1",
          userId: "user_cand_1",
        });
        mockSavedJobRepo.findOne.mockResolvedValue({
          id: "1",
          candidateId: "cand_1",
          jobId: "50",
        });

        const res = await request(testApp).delete("/api/v1/jobs/50/save");
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeNull();
      });

      it("GET /api/v1/saved-jobs returns list of saved jobs", async () => {
        mockCandidateProfileRepo.findOne.mockResolvedValue({
          id: "cand_1",
          userId: "user_cand_1",
        });
        mockSavedJobRepo.find.mockResolvedValue([
          { id: "1", candidateId: "cand_1", jobId: "50" },
        ]);

        const res = await request(testApp).get("/api/v1/saved-jobs");
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(1);
      });
    });
  });

  describe("With Mock Recruiter User", () => {
    beforeEach(() => {
      currentUser = { id: "user_rec_1", role: "RECRUITER" };
    });

    describe("POST /api/v1/jobs/:jobId/apply", () => {
      it("returns 403 for recruiter accounts", async () => {
        const res = await request(testApp)
          .post("/api/v1/jobs/10/apply")
          .send({ resumeId: "res_1" });

        expect(res.status).toBe(403);
        expect(res.body.errors[0].code).toBe("FORBIDDEN");
      });
    });

    describe("PUT /api/v1/applications/:id/status", () => {
      it("fails if trying to transition to WITHDRAWN", async () => {
        const res = await request(testApp)
          .put("/api/v1/applications/app_1/status")
          .send({ status: ApplicationStatus.WITHDRAWN });

        expect(res.status).toBe(400);
        expect(res.body.errors[0].code).toBe("INVALID_STATUS_TRANSITION");
      });

      it("fails on invalid status transition (e.g. APPLIED -> ACCEPTED directly)", async () => {
        mockCompanyRepo.findOne.mockResolvedValue({
          id: "comp_1",
          userId: "user_rec_1",
        });
        mockApplicationRepo.findOne.mockResolvedValue({
          id: "app_1",
          jobId: "50",
          status: ApplicationStatus.APPLIED,
        });
        mockJobRepo.findOne.mockResolvedValue({
          id: "50",
          companyId: "comp_1",
        });

        const res = await request(testApp)
          .put("/api/v1/applications/app_1/status")
          .send({ status: ApplicationStatus.ACCEPTED });

        expect(res.status).toBe(400);
        expect(res.body.errors[0].code).toBe("INVALID_STATUS_TRANSITION");
      });

      it("succeeds on allowed transition APPLIED -> VIEWED", async () => {
        mockCompanyRepo.findOne.mockResolvedValue({
          id: "comp_1",
          userId: "user_rec_1",
        });
        mockApplicationRepo.findOne.mockResolvedValue({
          id: "app_1",
          candidateId: "cand_1",
          jobId: "50",
          status: ApplicationStatus.APPLIED,
        });
        mockJobRepo.findOne.mockResolvedValue({
          id: "50",
          companyId: "comp_1",
          title: "Node.js Developer",
        });
        mockCandidateProfileRepo.findOne.mockResolvedValue({
          id: "cand_1",
          userId: "user_cand_1",
        });

        const res = await request(testApp)
          .put("/api/v1/applications/app_1/status")
          .send({ status: ApplicationStatus.VIEWED });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe(ApplicationStatus.VIEWED);
        expect(notificationService.create).toHaveBeenCalledWith({
          userId: "user_cand_1",
          type: "APPLICATION_STATUS_CHANGED",
          target: { type: "APPLICATION", id: "app_1" },
          params: {
            jobTitle: "Node.js Developer",
            status: ApplicationStatus.VIEWED,
          },
        });
      });

      it("continues updateStatus flow even if notificationService fails (resilience)", async () => {
        mockCompanyRepo.findOne.mockResolvedValue({
          id: "comp_1",
          userId: "user_rec_1",
        });
        mockApplicationRepo.findOne.mockResolvedValue({
          id: "app_1",
          candidateId: "cand_1",
          jobId: "50",
          status: ApplicationStatus.APPLIED,
        });
        mockJobRepo.findOne.mockResolvedValue({
          id: "50",
          companyId: "comp_1",
          title: "Node.js Developer",
        });
        mockCandidateProfileRepo.findOne.mockResolvedValue({
          id: "cand_1",
          userId: "user_cand_1",
        });
        vi.mocked(notificationService.create).mockRejectedValueOnce(
          new Error("Notification service unavailable"),
        );

        const res = await request(testApp)
          .put("/api/v1/applications/app_1/status")
          .send({ status: ApplicationStatus.VIEWED });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe(ApplicationStatus.VIEWED);
      });
    });

    describe("GET /api/v1/applications (Recruiter)", () => {
      it("lists applications for recruiter company jobs", async () => {
        mockCompanyRepo.findOne.mockResolvedValue({
          id: "comp_1",
          userId: "user_rec_1",
        });
        mockJobRepo.find.mockResolvedValue([{ id: "50" }, { id: "51" }]);
        mockApplicationRepo.find.mockResolvedValue([
          { id: "app_1", jobId: "50", status: ApplicationStatus.VIEWED },
        ]);

        const res = await request(testApp).get("/api/v1/applications");
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(1);
      });
    });
  });
});
