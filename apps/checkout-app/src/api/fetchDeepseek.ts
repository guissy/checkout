import { createApiRequest } from "./apiClient";
import type { FpResponse } from "./api.type";
import getApi from "./getApi";
import gotoTimeout from "../utils/gotoTimeout";


/**
 * 获取日志
 */
export default async function fetchDeepseek(prompt: string): Promise<
  FpResponse<string>
> {
  return createApiRequest<string>({
    url: getApi() + "/deepseek",
    method: "POST",
    body: {
      prompt
    },
    name: "deepseek",
    timeoutCode: "40027",
    timeoutHandler: gotoTimeout,
    cacheKey: "deepseek",
    cacheCondition: () => false,
  });
}