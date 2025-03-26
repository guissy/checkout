export interface FpResponse<T> {
  code: string;
  msg: string;
  serverTime: string;
  success: boolean;
  data: T;
}
