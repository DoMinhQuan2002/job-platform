export type ApiSuccess<T> = {
  success: boolean;
  message?: string;
  data: T;
};
