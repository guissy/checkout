import { createApiRequest } from "./apiClient";
import type { FpResponse } from "./api.type";
import getApi from "./getApi";
import gotoTimeout from "../utils/gotoTimeout";

export interface CheckStatusParams {
  token: string;
}

type CheckStatusRes = {
  resultCode: string;
};

/**
 * 检查状态API
 * 使用重构后的API请求工厂函数实现
 */
export default async function fetchCheckStatus(
  data: CheckStatusParams,
  ctx: "Visible" | "Reload" | "PageShow" | "Loop",
): Promise<FpResponse<CheckStatusRes>> {
  return createApiRequest<CheckStatusRes>({
    url: getApi() + "/checkout/checkStatus",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: data.token,
    },
    body: data,
    queryParams: {
      token: data.token,
    },
    name: `checkStatus${ctx}`,
    timeoutCode: "40027",
    timeoutHandler: gotoTimeout,
  });
}