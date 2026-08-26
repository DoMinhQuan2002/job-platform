export type PublicCompany = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  companySize: string | null;
  address: string;
  description: string | null;
};

export type CompaniesResponse = {
  success: boolean;
  data: {
    items: PublicCompany[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  };
};
