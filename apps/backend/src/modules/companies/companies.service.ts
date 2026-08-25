import { AppError } from "../../common/errors/app-error";
import { COMPANY_STATUS } from "../../common/constants/job";
import { AppDataSource } from "../../data-source";
import { Company } from "../../database/entities/company.entity";
import type { CreateCompanyDto } from "./dto/create-company.dto";
import { slugify } from "./utils/slug.util";

export class CompaniesService {
  /**
   * Lấy thông tin công ty của nhà tuyển dụng đang đăng nhập
   * @param userId ID của recruiter (user_id)
   */
  async getMyCompany(userId: string): Promise<Company> {
    const company = await AppDataSource.getRepository(Company).findOne({
      where: { userId },
    });

    if (!company) {
      throw new AppError(404, "NOT_FOUND", "Nhà tuyển dụng chưa khởi tạo hồ sơ công ty");
    }

    return company;
  }

  /**
   * Khởi tạo hồ sơ công ty mới cho nhà tuyển dụng
   * @param userId ID của recruiter (user_id)
   * @param dto Thông tin tạo công ty
   */
  async createCompany(userId: string, dto: CreateCompanyDto): Promise<Company> {
    const companyRepo = AppDataSource.getRepository(Company);

    // 1. Mỗi recruiter chỉ được tạo tối đa 1 công ty
    const existingCompanyOfUser = await companyRepo.findOne({
      where: { userId },
    });
    if (existingCompanyOfUser) {
      throw new AppError(409, "CONFLICT", "Tài khoản của bạn đã sở hữu một hồ sơ công ty");
    }

    // 2. Kiểm tra trùng mã số thuế (nếu có cung cấp)
    if (dto.taxCode) {
      const existingTaxCode = await companyRepo.findOne({
        where: { taxCode: dto.taxCode },
      });
      if (existingTaxCode) {
        throw new AppError(409, "CONFLICT", "Mã số thuế đã tồn tại trong hệ thống");
      }
    }

    // 3. Tự động sinh slug duy nhất từ tên công ty
    const uniqueSlug = await this.generateUniqueSlug(dto.name);

    // 4. Tạo và lưu entity công ty mới
    const newCompany = companyRepo.create({
      userId,
      name: dto.name,
      slug: uniqueSlug,
      logo: dto.logo ?? null,
      website: dto.website ?? null,
      email: dto.email,
      phone: dto.phone,
      taxCode: dto.taxCode ?? null,
      companySize: dto.companySize ?? null,
      address: dto.address,
      description: dto.description ?? null,
      status: COMPANY_STATUS.ACTIVE,
    });

    return await companyRepo.save(newCompany);
  }

  /**
   * Sinh slug duy nhất không trùng lặp trong cơ sở dữ liệu
   * @param name Tên công ty
   */
  async generateUniqueSlug(name: string): Promise<string> {
    const companyRepo = AppDataSource.getRepository(Company);
    const baseSlug = slugify(name);

    let candidateSlug = baseSlug;
    let counter = 1;

    while (await companyRepo.findOne({ where: { slug: candidateSlug } })) {
      candidateSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    return candidateSlug;
  }
}

export const companiesService = new CompaniesService();

