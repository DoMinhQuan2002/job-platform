export type CompanySize = "1-50" | "50-100" | "100-500" | "500+";

export type Company = {
  id: string;
  name: string;
  slug?: string;
  logo?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  taxCode?: string | null;
  companySize?: CompanySize | string | null;
  address?: string | null;
  description?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string | null;
};

export type CompaniesMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CompaniesResponse = {
  items: Company[];
  meta: CompaniesMeta;
};

export type CompanyListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  companySize?: CompanySize | "";
};
