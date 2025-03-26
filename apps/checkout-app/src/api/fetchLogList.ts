import { createApiRequest } from "./apiClient";
import type { FpResponse } from "./api.type";
import { getLogApi } from "./getApi";
import gotoTimeout from "../utils/gotoTimeout";
import { CheckoutLog, CheckoutLogList } from "./generated/check_log";
import { getStorage } from '@/lib/storage';


/**
 * 获取日志
 */
export default async function fetchLogList(): Promise<
  FpResponse<CheckoutLog[]>
> {
  const token = getStorage("token")!;
  return createApiRequest<CheckoutLog[]>({
    url: getLogApi() + "/checkoutLog/queryByToken",
    method: "GET",
    queryParams: {
      token,
    },
    name: "logs",
    protobufDecoder: (buffer) => CheckoutLogList.decode(buffer),
    timeoutCode: "40027",
    timeoutHandler: gotoTimeout,
    acceptFormat: "protobuf",
    cacheKey: "logs",
    cacheCondition: (data) => Array.isArray(data) && data.length > 0,
  });
}
