import { beforeEach, describe, expect, it, vi } from "vitest";

const getAggregateByUserIdMock = vi.hoisted(() => vi.fn());
const updateProfileTextMock = vi.hoisted(() => vi.fn());
const listEducationsMock = vi.hoisted(() => vi.fn());
const createEducationMock = vi.hoisted(() => vi.fn());
const updateEducationMock = vi.hoisted(() => vi.fn());
const deleteEducationMock = vi.hoisted(() => vi.fn());
const listWorkExperiencesMock = vi.hoisted(() => vi.fn());
const createWorkExperienceMock = vi.hoisted(() => vi.fn());
const updateWorkExperienceMock = vi.hoisted(() => vi.fn());
const deleteWorkExperienceMock = vi.hoisted(() => vi.fn());
const listSkillCatalogMock = vi.hoisted(() => vi.fn());
const createSkillCatalogMock = vi.hoisted(() => vi.fn());
const listMySkillsMock = vi.hoisted(() => vi.fn());
const attachSkillMock = vi.hoisted(() => vi.fn());
const updateMySkillLevelMock = vi.hoisted(() => vi.fn());
const detachSkillMock = vi.hoisted(() => vi.fn());

vi.mock("./candidate-profiles.service", () => {
  class MockCandidateProfilesService {
    getAggregateByUserId = getAggregateByUserIdMock;
    updateProfileText = updateProfileTextMock;
    listEducations = listEducationsMock;
    createEducation = createEducationMock;
    updateEducation = updateEducationMock;
    deleteEducation = deleteEducationMock;
    listWorkExperiences = listWorkExperiencesMock;
    createWorkExperience = createWorkExperienceMock;
    updateWorkExperience = updateWorkExperienceMock;
    deleteWorkExperience = deleteWorkExperienceMock;
    listSkillCatalog = listSkillCatalogMock;
    createSkillCatalog = createSkillCatalogMock;
    listMySkills = listMySkillsMock;
    attachSkill = attachSkillMock;
    updateMySkillLevel = updateMySkillLevelMock;
    detachSkill = detachSkillMock;
  }

  return { CandidateProfilesService: MockCandidateProfilesService };
});

import {
  attachMySkill,
  createMyEducation,
  createMyWorkExperience,
  createSkillCatalog,
  deleteMyEducation,
  deleteMyWorkExperience,
  detachMySkill,
  getMyCandidateProfile,
  listMyEducations,
  listMySkills,
  listMyWorkExperiences,
  listSkillCatalog,
  updateMyCandidateProfile,
  updateMyEducation,
  updateMySkill,
  updateMyWorkExperience,
} from "./candidate-profiles.controller";

const makeRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("candidate-profiles.controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /candidates/me: missing user => 401", async () => {
    const req: any = { user: undefined };
    const res = makeRes();
    await getMyCandidateProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("GET /candidates/me: ok => 200", async () => {
    const mock = { id: "1", userId: "10", bio: null };
    getAggregateByUserIdMock.mockResolvedValue(mock);
    const req: any = { user: { id: "10", role: "CANDIDATE" } };
    const res = makeRes();
    await getMyCandidateProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Thành công",
      data: mock,
    });
  });

  it("PUT /candidates/me: nested educations => 400", async () => {
    const req: any = {
      user: { id: "10", role: "CANDIDATE" },
      body: { educations: [] },
    };
    const res = makeRes();
    await updateMyCandidateProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  describe("educations", () => {
    const candidateReq = (extra: Record<string, unknown> = {}) =>
      ({ user: { id: "10", role: "CANDIDATE" }, ...extra }) as any;

    it("GET list: 401 khi chưa login", async () => {
      const res = makeRes();
      await listMyEducations({ user: undefined } as any, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("GET list: 403 khi không phải CANDIDATE", async () => {
      const res = makeRes();
      await listMyEducations({ user: { id: "10", role: "RECRUITER" } } as any, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("GET list: 200 + data", async () => {
      const rows = [{ id: "1", school: "PTIT" }];
      listEducationsMock.mockResolvedValue(rows);
      const res = makeRes();
      await listMyEducations(candidateReq(), res);
      expect(listEducationsMock).toHaveBeenCalledWith("10");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Thành công",
        data: rows,
      });
    });

    it("POST: thiếu school => 400", async () => {
      const res = makeRes();
      await createMyEducation(candidateReq({ body: { startDate: "2020-09-01" } }), res);
      expect(createEducationMock).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("POST: isCurrent + endDate => 400", async () => {
      const res = makeRes();
      await createMyEducation(
        candidateReq({
          body: {
            school: "PTIT",
            startDate: "2020-09-01",
            endDate: "2024-06-01",
            isCurrent: true,
          },
        }),
        res,
      );
      expect(createEducationMock).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("POST: ok => 201", async () => {
      const created = { id: "9", school: "PTIT", isCurrent: true, endDate: null };
      createEducationMock.mockResolvedValue(created);
      const res = makeRes();
      await createMyEducation(
        candidateReq({
          body: {
            school: "PTIT",
            startDate: "2020-09-01",
            endDate: null,
            isCurrent: true,
          },
        }),
        res,
      );
      expect(createEducationMock).toHaveBeenCalledWith("10", {
        school: "PTIT",
        startDate: "2020-09-01",
        endDate: null,
        isCurrent: true,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Thành công",
        data: created,
      });
    });

    it("PUT: not found => 404", async () => {
      updateEducationMock.mockResolvedValue(null);
      const res = makeRes();
      await updateMyEducation(
        candidateReq({ params: { id: "99" }, body: { school: "HCMUT" } }),
        res,
      );
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("PUT: ok => 200", async () => {
      const updated = { id: "1", school: "HCMUT" };
      updateEducationMock.mockResolvedValue(updated);
      const res = makeRes();
      await updateMyEducation(
        candidateReq({ params: { id: "1" }, body: { school: "HCMUT" } }),
        res,
      );
      expect(updateEducationMock).toHaveBeenCalledWith("10", "1", { school: "HCMUT" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Thành công",
        data: updated,
      });
    });

    it("DELETE: not found => 404", async () => {
      deleteEducationMock.mockResolvedValue(false);
      const res = makeRes();
      await deleteMyEducation(candidateReq({ params: { id: "99" } }), res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("DELETE: ok => 200 data null", async () => {
      deleteEducationMock.mockResolvedValue(true);
      const res = makeRes();
      await deleteMyEducation(candidateReq({ params: { id: "1" } }), res);
      expect(deleteEducationMock).toHaveBeenCalledWith("10", "1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Thành công",
        data: null,
      });
    });
  });

  describe("work-experiences", () => {
    const candidateReq = (extra: Record<string, unknown> = {}) =>
      ({ user: { id: "10", role: "CANDIDATE" }, ...extra }) as any;

    it("GET list: 200 + data", async () => {
      const rows = [{ id: "1", companyName: "ABC Corp" }];
      listWorkExperiencesMock.mockResolvedValue(rows);
      const res = makeRes();
      await listMyWorkExperiences(candidateReq(), res);
      expect(listWorkExperiencesMock).toHaveBeenCalledWith("10");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Thành công",
        data: rows,
      });
    });

    it("POST: thiếu companyName => 400", async () => {
      const res = makeRes();
      await createMyWorkExperience(
        candidateReq({ body: { position: "Intern", startDate: "2024-06-01" } }),
        res,
      );
      expect(createWorkExperienceMock).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("POST: ok => 201", async () => {
      const created = { id: "2", companyName: "ABC Corp", position: "Intern" };
      createWorkExperienceMock.mockResolvedValue(created);
      const res = makeRes();
      await createMyWorkExperience(
        candidateReq({
          body: {
            companyName: "ABC Corp",
            position: "Intern Backend",
            startDate: "2024-06-01",
            endDate: "2024-12-01",
            isCurrent: false,
          },
        }),
        res,
      );
      expect(createWorkExperienceMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Thành công",
        data: created,
      });
    });

    it("PUT: not found => 404", async () => {
      updateWorkExperienceMock.mockResolvedValue(null);
      const res = makeRes();
      await updateMyWorkExperience(
        candidateReq({ params: { id: "99" }, body: { position: "Dev" } }),
        res,
      );
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("PUT: ok => 200", async () => {
      const updated = { id: "1", position: "Dev" };
      updateWorkExperienceMock.mockResolvedValue(updated);
      const res = makeRes();
      await updateMyWorkExperience(
        candidateReq({ params: { id: "1" }, body: { position: "Dev" } }),
        res,
      );
      expect(updateWorkExperienceMock).toHaveBeenCalledWith("10", "1", { position: "Dev" });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("DELETE: ok => 200 data null", async () => {
      deleteWorkExperienceMock.mockResolvedValue(true);
      const res = makeRes();
      await deleteMyWorkExperience(candidateReq({ params: { id: "1" } }), res);
      expect(deleteWorkExperienceMock).toHaveBeenCalledWith("10", "1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Thành công",
        data: null,
      });
    });
  });

  describe("skills", () => {
    const candidateReq = (extra: Record<string, unknown> = {}) =>
      ({ user: { id: "10", role: "CANDIDATE" }, ...extra }) as any;

    it("GET catalog: category sai => 400", async () => {
      const res = makeRes();
      await listSkillCatalog({ query: { category: "FOO" } } as any, res);
      expect(listSkillCatalogMock).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("GET catalog: ok => 200", async () => {
      const rows = [{ id: "5", name: "TypeScript", category: "SKILL" }];
      listSkillCatalogMock.mockResolvedValue(rows);
      const res = makeRes();
      await listSkillCatalog({ query: { category: "SKILL" } } as any, res);
      expect(listSkillCatalogMock).toHaveBeenCalledWith("SKILL");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Thành công",
        data: rows,
      });
    });

    it("POST catalog: không phải ADMIN => 403", async () => {
      const res = makeRes();
      await createSkillCatalog(candidateReq({ body: { name: "TS", category: "SKILL" } }), res);
      expect(createSkillCatalogMock).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("POST catalog: ok => 201", async () => {
      const created = { id: "5", name: "TypeScript", category: "SKILL" };
      createSkillCatalogMock.mockResolvedValue(created);
      const res = makeRes();
      await createSkillCatalog(
        {
          user: { id: "1", role: "ADMIN" },
          body: { name: "TypeScript", category: "SKILL", code: null, description: null },
        } as any,
        res,
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("GET mine: 200", async () => {
      listMySkillsMock.mockResolvedValue([]);
      const res = makeRes();
      await listMySkills(candidateReq(), res);
      expect(listMySkillsMock).toHaveBeenCalledWith("10");
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("POST mine: skill không tồn tại => 404", async () => {
      attachSkillMock.mockResolvedValue("NOT_FOUND");
      const res = makeRes();
      await attachMySkill(
        candidateReq({ body: { skillId: "99", level: "INTERMEDIATE" } }),
        res,
      );
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("POST mine: đã gắn => 409", async () => {
      attachSkillMock.mockResolvedValue("CONFLICT");
      const res = makeRes();
      await attachMySkill(
        candidateReq({ body: { skillId: "5", level: "INTERMEDIATE" } }),
        res,
      );
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it("POST mine: ok => 201", async () => {
      const attached = { id: "12", skillId: "5", level: "INTERMEDIATE" };
      attachSkillMock.mockResolvedValue(attached);
      const res = makeRes();
      await attachMySkill(
        candidateReq({ body: { skillId: "5", level: "INTERMEDIATE" } }),
        res,
      );
      expect(attachSkillMock).toHaveBeenCalledWith("10", "5", "INTERMEDIATE");
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("PUT mine: ok => 200", async () => {
      const updated = { id: "12", level: "ADVANCED" };
      updateMySkillLevelMock.mockResolvedValue(updated);
      const res = makeRes();
      await updateMySkill(candidateReq({ params: { id: "12" }, body: { level: "ADVANCED" } }), res);
      expect(updateMySkillLevelMock).toHaveBeenCalledWith("10", "12", "ADVANCED");
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("DELETE mine: ok => 200 data null", async () => {
      detachSkillMock.mockResolvedValue(true);
      const res = makeRes();
      await detachMySkill(candidateReq({ params: { id: "12" } }), res);
      expect(detachSkillMock).toHaveBeenCalledWith("10", "12");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Thành công",
        data: null,
      });
    });
  });
});
