import { createApiRequest } from "./apiClient";
import type { FpResponse } from "./api.type";
import { getLogApi } from "./getApi";

export interface LogParams {
  origin: string;
  requestTag: string;
  requestMethod: string;
  requestUrl: string;
  requestTime: string;
  requestHeader: string;
  requestBody: string;
  responseTime: string;
  responseMessage: string;
  responseStatus: string;
  responseInterval: number;
  remark: string;
  token: string;
  downstreamOrderNo: string;
}

type LogRes = {
  success: boolean;
};

/**
 * 日志上报API
 * 使用重构后的API请求工厂函数实现
 */
export default async function fetchLog(
  data: { param: LogParams }
): Promise<FpResponse<LogRes>> {
  return createApiRequest<LogRes>({
    url: getLogApi() + "/checkoutLog/add",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
    name: "log",
  });
}