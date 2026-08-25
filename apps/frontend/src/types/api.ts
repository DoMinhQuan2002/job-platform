/** Envelope success chuẩn contract G3 (và dần align toàn BE). */
export type ApiSuccess<T> = {
  success: boolean;
  message?: string;
  data: T;
};
