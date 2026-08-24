import { AppDataSource } from "@/data-source";
import {
  CandidateProfileEntity,
  CandidateSkillEntity,
  EducationEntity,
  SkillEntity,
  WorkExperienceEntity,
} from "@/database/entities";
import { SkillCategory, SkillLevel } from "@/common/constants";

const hasOwn = <T extends object>(obj: T, key: PropertyKey): boolean =>
  Object.prototype.hasOwnProperty.call(obj, key);

const copyOwn = <T extends object, K extends keyof T>(
  target: T,
  source: Partial<T>,
  key: K,
  nullishToNull = false,
): void => {
  if (!hasOwn(source, key)) return;
  const value = source[key];
  if (nullishToNull) {
    target[key] = (value ?? null) as T[K];
    return;
  }
  if (value !== undefined) {
    target[key] = value as T[K];
  }
};

export type AggregateSkillItem = {
  id: string;
  candidateId: string;
  skillId: string;
  level: string;
  skill: {
    id: string;
    name: string;
    category: string;
    code: string | null;
    description: string | null;
    status: string;
  };
};

export type CandidateAggregate = {
  id: string;
  userId: string;
  bio: string | null;
  careerObjective: string | null;
  educations: EducationEntity[];
  workExperiences: WorkExperienceEntity[];
  skills: AggregateSkillItem[];
  languages: AggregateSkillItem[];
  certificates: AggregateSkillItem[];
  createdAt: Date;
  updatedAt: Date;
};

export class CandidateProfilesService {
  private candidateRepo = AppDataSource.getRepository(CandidateProfileEntity);
  private educationRepo = AppDataSource.getRepository(EducationEntity);
  private workExpRepo = AppDataSource.getRepository(WorkExperienceEntity);
  private skillRepo = AppDataSource.getRepository(SkillEntity);
  private candidateSkillRepo = AppDataSource.getRepository(CandidateSkillEntity);

  async getOrCreateByUserId(userId: string): Promise<CandidateProfileEntity> {
    let profile = await this.candidateRepo.findOne({ where: { userId } });

    if (!profile) {
      profile = this.candidateRepo.create({
        userId,
        bio: null,
        careerObjective: null,
      });
      profile = await this.candidateRepo.save(profile);
    }

    return profile;
  }

  async getMyProfile(userId: string): Promise<CandidateProfileEntity> {
    return this.getOrCreateByUserId(userId);
  }

  async getAggregateByUserId(userId: string): Promise<CandidateAggregate> {
    const profile = await this.getOrCreateByUserId(userId);

    let educations: EducationEntity[] = [];
    let workExperiences: WorkExperienceEntity[] = [];
    let candidateSkills: CandidateSkillEntity[] = [];

    try {
      educations = await this.educationRepo.find({
        where: { candidateId: profile.id },
        order: { createdAt: "DESC" },
      });
    } catch (err) {
      console.error("[candidateProfiles] education query failed:", err);
    }

    try {
      workExperiences = await this.workExpRepo.find({
        where: { candidateId: profile.id },
        order: { createdAt: "DESC" },
      });
    } catch (err) {
      console.error("[candidateProfiles] work_experiences query failed:", err);
    }

    try {
      candidateSkills = await this.candidateSkillRepo.find({
        where: { candidateId: profile.id },
        relations: { skill: true },
        order: { createdAt: "DESC" },
      });
    } catch (err) {
      console.error("[candidateProfiles] candidate_skills query failed:", err);
    }

    const skills: AggregateSkillItem[] = [];
    const languages: AggregateSkillItem[] = [];
    const certificates: AggregateSkillItem[] = [];

    for (const item of candidateSkills) {
      const normalized = this.toAggregateSkillItem(item);
      if (item.skill.category === SkillCategory.LANGUAGE) {
        languages.push(normalized);
      } else if (item.skill.category === SkillCategory.CERTIFICATE) {
        certificates.push(normalized);
      } else {
        skills.push(normalized);
      }
    }

    return {
      id: profile.id,
      userId: profile.userId,
      bio: profile.bio,
      careerObjective: profile.careerObjective,
      educations,
      workExperiences,
      skills,
      languages,
      certificates,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async updateProfileText(
    userId: string,
    payload: { bio?: string | null; careerObjective?: string | null },
  ): Promise<CandidateAggregate> {
    const profile = await this.getOrCreateByUserId(userId);

    copyOwn(profile, payload, "bio", true);
    copyOwn(profile, payload, "careerObjective", true);

    await this.candidateRepo.save(profile);
    return this.getAggregateByUserId(userId);
  }

  async listEducations(userId: string): Promise<EducationEntity[]> {
    const profile = await this.getOrCreateByUserId(userId);
    return this.educationRepo.find({
      where: { candidateId: profile.id },
      order: { createdAt: "DESC" },
    });
  }

  async createEducation(
    userId: string,
    payload: {
      school: string;
      major?: string | null;
      degree?: string | null;
      startDate: string;
      endDate?: string | null;
      isCurrent?: boolean;
      description?: string | null;
    },
  ): Promise<EducationEntity> {
    const profile = await this.getOrCreateByUserId(userId);
    const isCurrent = payload.isCurrent ?? false;
    const endDate = isCurrent ? null : (payload.endDate ?? null);

    const education = this.educationRepo.create({
      candidateId: profile.id,
      school: payload.school,
      major: payload.major ?? null,
      degree: payload.degree ?? null,
      startDate: payload.startDate,
      endDate,
      isCurrent,
      description: payload.description ?? null,
    });

    return this.educationRepo.save(education);
  }

  async updateEducation(
    userId: string,
    educationId: string,
    payload: {
      school?: string;
      major?: string | null;
      degree?: string | null;
      startDate?: string;
      endDate?: string | null;
      isCurrent?: boolean;
      description?: string | null;
    },
  ): Promise<EducationEntity | null> {
    const profile = await this.getOrCreateByUserId(userId);
    const education = await this.educationRepo.findOne({
      where: { id: educationId, candidateId: profile.id },
    });
    if (!education) return null;

    copyOwn(education, payload, "school");
    copyOwn(education, payload, "startDate");
    copyOwn(education, payload, "isCurrent");
    copyOwn(education, payload, "major", true);
    copyOwn(education, payload, "degree", true);
    copyOwn(education, payload, "endDate", true);
    copyOwn(education, payload, "description", true);

    if (education.isCurrent) {
      education.endDate = null;
    }

    return this.educationRepo.save(education);
  }

  async deleteEducation(userId: string, educationId: string): Promise<boolean> {
    const profile = await this.getOrCreateByUserId(userId);
    const result = await this.educationRepo.delete({
      id: educationId,
      candidateId: profile.id,
    });
    return (result.affected ?? 0) > 0;
  }

  async listWorkExperiences(userId: string): Promise<WorkExperienceEntity[]> {
    const profile = await this.getOrCreateByUserId(userId);
    return this.workExpRepo.find({
      where: { candidateId: profile.id },
      order: { createdAt: "DESC" },
    });
  }

  async createWorkExperience(
    userId: string,
    payload: {
      companyName: string;
      position: string;
      startDate: string;
      endDate?: string | null;
      isCurrent?: boolean;
      description?: string | null;
    },
  ): Promise<WorkExperienceEntity> {
    const profile = await this.getOrCreateByUserId(userId);
    const isCurrent = payload.isCurrent ?? false;
    const endDate = isCurrent ? null : (payload.endDate ?? null);

    const workExperience = this.workExpRepo.create({
      candidateId: profile.id,
      companyName: payload.companyName,
      position: payload.position,
      startDate: payload.startDate,
      endDate,
      isCurrent,
      description: payload.description ?? null,
    });

    return this.workExpRepo.save(workExperience);
  }

  async updateWorkExperience(
    userId: string,
    workExperienceId: string,
    payload: {
      companyName?: string;
      position?: string;
      startDate?: string;
      endDate?: string | null;
      isCurrent?: boolean;
      description?: string | null;
    },
  ): Promise<WorkExperienceEntity | null> {
    const profile = await this.getOrCreateByUserId(userId);
    const workExperience = await this.workExpRepo.findOne({
      where: { id: workExperienceId, candidateId: profile.id },
    });
    if (!workExperience) return null;

    copyOwn(workExperience, payload, "companyName");
    copyOwn(workExperience, payload, "position");
    copyOwn(workExperience, payload, "startDate");
    copyOwn(workExperience, payload, "isCurrent");
    copyOwn(workExperience, payload, "endDate", true);
    copyOwn(workExperience, payload, "description", true);

    if (workExperience.isCurrent) {
      workExperience.endDate = null;
    }

    return this.workExpRepo.save(workExperience);
  }

  async deleteWorkExperience(userId: string, workExperienceId: string): Promise<boolean> {
    const profile = await this.getOrCreateByUserId(userId);
    const result = await this.workExpRepo.delete({
      id: workExperienceId,
      candidateId: profile.id,
    });
    return (result.affected ?? 0) > 0;
  }

  async listSkillCatalog(category?: SkillCategory): Promise<SkillEntity[]> {
    return this.skillRepo.find({
      where: category ? { category } : {},
      order: { name: "ASC" },
    });
  }

  async createSkillCatalog(payload: {
    name: string;
    category: SkillCategory;
    code?: string | null;
    description?: string | null;
  }): Promise<SkillEntity | "CONFLICT"> {
    const existing = await this.skillRepo.findOne({
      where: { name: payload.name, category: payload.category },
    });
    if (existing) return "CONFLICT";

    const skill = this.skillRepo.create({
      name: payload.name,
      category: payload.category,
      code: payload.code ?? null,
      description: payload.description ?? null,
      status: "ACTIVE",
    });
    return this.skillRepo.save(skill);
  }

  async listMySkills(userId: string): Promise<AggregateSkillItem[]> {
    const profile = await this.getOrCreateByUserId(userId);
    const rows = await this.candidateSkillRepo.find({
      where: { candidateId: profile.id },
      relations: { skill: true },
      order: { createdAt: "DESC" },
    });
    return rows.map((item) => this.toAggregateSkillItem(item));
  }

  async attachSkill(
    userId: string,
    skillId: string,
    level: SkillLevel,
  ): Promise<AggregateSkillItem | "NOT_FOUND" | "INACTIVE" | "CONFLICT"> {
    const skill = await this.skillRepo.findOne({ where: { id: skillId } });
    if (!skill) return "NOT_FOUND";
    if (skill.status !== "ACTIVE") return "INACTIVE";

    const profile = await this.getOrCreateByUserId(userId);
    const duplicate = await this.candidateSkillRepo.findOne({
      where: { candidateId: profile.id, skillId },
    });
    if (duplicate) return "CONFLICT";

    const row = this.candidateSkillRepo.create({
      candidateId: profile.id,
      skillId,
      level,
    });
    const saved = await this.candidateSkillRepo.save(row);
    saved.skill = skill;
    return this.toAggregateSkillItem(saved);
  }

  async updateMySkillLevel(
    userId: string,
    candidateSkillId: string,
    level: SkillLevel,
  ): Promise<AggregateSkillItem | null> {
    const profile = await this.getOrCreateByUserId(userId);
    const row = await this.candidateSkillRepo.findOne({
      where: { id: candidateSkillId, candidateId: profile.id },
      relations: { skill: true },
    });
    if (!row) return null;

    row.level = level;
    const saved = await this.candidateSkillRepo.save(row);
    return this.toAggregateSkillItem(saved);
  }

  async detachSkill(userId: string, candidateSkillId: string): Promise<boolean> {
    const profile = await this.getOrCreateByUserId(userId);
    const result = await this.candidateSkillRepo.delete({
      id: candidateSkillId,
      candidateId: profile.id,
    });
    return (result.affected ?? 0) > 0;
  }

  private toAggregateSkillItem(item: CandidateSkillEntity): AggregateSkillItem {
    const skill = item.skill as SkillEntity;
    return {
      id: item.id,
      candidateId: item.candidateId,
      skillId: item.skillId,
      level: item.level,
      skill: {
        id: skill.id,
        name: skill.name,
        category: skill.category,
        code: skill.code,
        description: skill.description,
        status: skill.status,
      },
    };
  }
}

export const candidateProfilesService = new CandidateProfilesService();
