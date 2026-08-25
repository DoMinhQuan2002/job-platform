import { Not } from "typeorm";
import { AppError } from "../../common/errors/app-error";
import { COMPANY_STATUS } from "../../common/constants/job";
import { AppDataSource } from "../../data-source";
import { Company } from "../../database/entities/company.entity";
import type { CreateCompanyDto } from "./dto/create-company.dto";
import type { UpdateCompanyDto } from "./dto/update-company.dto";
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
   * Cập nhật thông tin chi tiết hồ sơ công ty
   * @param userId ID của recruiter (user_id)
   * @param dto Thông tin cập nhật công ty
   */
  async updateMyCompany(userId: string, dto: UpdateCompanyDto): Promise<Company> {
    const companyRepo = AppDataSource.getRepository(Company);

    // 1. Tìm công ty của recruiter hiện tại
    const company = await companyRepo.findOne({
      where: { userId },
    });
    if (!company) {
      throw new AppError(404, "NOT_FOUND", "Không tìm thấy hồ sơ công ty");
    }

    // 2. Kiểm tra trùng mã số thuế với công ty khác
    if (dto.taxCode && dto.taxCode !== company.taxCode) {
      const existingTaxCode = await companyRepo.findOne({
        where: {
          taxCode: dto.taxCode,
          id: Not(company.id),
        },
      });
      if (existingTaxCode) {
        throw new AppError(409, "CONFLICT", "Mã số thuế đã tồn tại trong hệ thống");
      }
    }

    // 3. Tự động cập nhật lại slug nếu tên công ty thay đổi
    let updatedSlug = company.slug;
    if (dto.name !== company.name) {
      updatedSlug = await this.generateUniqueSlug(dto.name, company.id);
    }

    // 4. Cập nhật các trường
    company.name = dto.name;
    company.slug = updatedSlug;
    company.logo = dto.logo !== undefined ? dto.logo : company.logo;
    company.website = dto.website !== undefined ? dto.website : company.website;
    company.email = dto.email;
    company.phone = dto.phone;
    company.taxCode = dto.taxCode !== undefined ? dto.taxCode : company.taxCode;
    company.companySize = dto.companySize !== undefined ? dto.companySize : company.companySize;
    company.address = dto.address;
    company.description = dto.description !== undefined ? dto.description : company.description;
    company.updatedAt = new Date();

    return await companyRepo.save(company);
  }

  /**
   * Sinh slug duy nhất không trùng lặp trong cơ sở dữ liệu
   * @param name Tên công ty
   * @param excludeCompanyId Bỏ qua kiểm tra trùng cho ID công ty hiện tại (khi cập nhật)
   */
  async generateUniqueSlug(name: string, excludeCompanyId?: string): Promise<string> {
    const companyRepo = AppDataSource.getRepository(Company);
    const baseSlug = slugify(name);

    let candidateSlug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await companyRepo.findOne({ where: { slug: candidateSlug } });
      if (!existing || (excludeCompanyId && existing.id === excludeCompanyId)) {
        break;
      }
      candidateSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    return candidateSlug;
  }
}

export const companiesService = new CompaniesService();


