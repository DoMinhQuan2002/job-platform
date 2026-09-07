export type Province = {
  code: string;
  name: string;
  fullName: string;
};

export type Ward = {
  code: string;
  name: string;
  fullName: string;
  provinceCode: string;
};
