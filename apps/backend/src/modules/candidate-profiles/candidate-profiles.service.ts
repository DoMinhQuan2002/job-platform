import { AppError } from "../../common/errors/app-error";
import { AppDataSource } from "../../data-source";
import { CandidateProfileEntity } from "../../database/entities/candidate-profile.entity";

export class CandidateProfilesService {
  // TODO: Lấy profile đầy đủ theo userId (từ JWT)
  async getMyProfile(_userId: string) {
    const candidateProfile = await AppDataSource.getRepository(CandidateProfileEntity).findOne({
      where: { userId: _userId },
    });
    if (!candidateProfile) {
      throw new AppError(404, "NOT_FOUND", "Không tìm thấy profile");
    }
    return candidateProfile;
  }

  // TODO: Cập nhật bio, career_objective
  async updateMyProfile (_userId: string, _data: { bio?: string; careerObjective?: string }) {
    const candidateProfile = await this.getMyProfile(_userId);
    const updatedProfile = await AppDataSource.getRepository(CandidateProfileEntity).save({
      ...candidateProfile,
      ..._data,
    });
    return updatedProfile;
  }
};

export const candidateProfilesService = new CandidateProfilesService();
