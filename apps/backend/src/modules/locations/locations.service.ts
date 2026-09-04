import { AppDataSource } from "@/data-source";
import { AppError } from "@/common/errors/app-error";

export type ProvinceDto = {
  code: string;
  name: string;
  fullName: string;
};

export type WardDto = {
  code: string;
  name: string;
  fullName: string;
  provinceCode: string;
};

export const locationsService = {
  async listProvinces(): Promise<ProvinceDto[]> {
    return AppDataSource.query(`
      SELECT code, name, full_name AS "fullName"
      FROM provinces
      ORDER BY full_name ASC
    `);
  },

  async listWards(provinceCode: string): Promise<WardDto[]> {
    return AppDataSource.query(
      `
        SELECT code, name, full_name AS "fullName", province_code AS "provinceCode"
        FROM wards
        WHERE province_code = $1
        ORDER BY full_name ASC
      `,
      [provinceCode],
    );
  },

  async getWard(code: string): Promise<WardDto> {
    const rows = await AppDataSource.query(
      `
        SELECT code, name, full_name AS "fullName", province_code AS "provinceCode"
        FROM wards
        WHERE code = $1
        LIMIT 1
      `,
      [code],
    ) as WardDto[];

    if (!rows.length) {
      throw new AppError(404, "WARD_NOT_FOUND", "Không tìm thấy phường/xã");
    }

    return rows[0];
  },
};
