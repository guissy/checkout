import type { FpResponse } from "./api.type";

export const SuccessResponse = async <T>(data: T): Promise<FpResponse<T>> => {
  return {
    data: data,
    code: "0",
    msg: "Success",
    serverTime: new Date().toISOString(),
    success: true,
  };
};

export const failResponse = async <T>(data: T): Promise<FpResponse<T>> => {
  return {
    data: data,
    code: "10000",
    msg: "System busy, please try again later",
    serverTime: new Date().toISOString(),
    success: false,
  };
};
